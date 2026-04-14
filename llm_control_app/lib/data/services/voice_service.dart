import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:async';

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  factory VoiceService() => _instance;
  VoiceService._internal();

  final SpeechToText _speech = SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _isSpeechInitialized = false;
  String _lastProcessed = "";

  Future<void> init() async {
    if (!_isSpeechInitialized) {
      try {
        _isSpeechInitialized = await _speech.initialize(
          onStatus: (status) => print('VOICE SERVICE STATUS: $status'),
          onError: (error) => print('VOICE SERVICE ERROR: ${error.errorMsg}'),
          debugLogging: false,
        );
      } catch (e) {
        print('VOICE SERVICE INIT FAILED: $e');
        _isSpeechInitialized = false;
      }
      
      // Configure TTS
      await _tts.setLanguage("en-US");
      await _tts.setSpeechRate(0.5);
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.0);
    }
  }

  // Speech to Text
  Future<bool> startListening(Function(String) onResult) async {
    var status = await Permission.microphone.status;
    if (status.isDenied) {
      status = await Permission.microphone.request();
    }

    if (status.isGranted) {
      if (!_isSpeechInitialized) await init();
      
      if (_isSpeechInitialized) {
        await _speech.listen(
          onResult: (result) {
            if (result.finalResult && result.recognizedWords != _lastProcessed) {
              _lastProcessed = result.recognizedWords;
              onResult(result.recognizedWords);
            }
          },
          listenFor: const Duration(seconds: 30),
          pauseFor: const Duration(seconds: 3),
          partialResults: true,
        );
        return true;
      }
    }
    return false;
  }

  Future<void> stopListening() async {
    await _speech.stop();
  }

  bool get isListening => _speech.isListening;

  // Text to Speech
  Future<void> speak(String text) async {
    if (text.isNotEmpty) {
      await _tts.stop(); // Prevent overlapping speech
      await _tts.speak(text);
    }
  }

  Future<void> stopSpeaking() async {
    await _tts.stop();
  }
}
