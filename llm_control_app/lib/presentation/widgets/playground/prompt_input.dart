import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:llm_control_app/core/theme.dart';
import 'package:llm_control_app/data/services/voice_service.dart';
import 'package:llm_control_app/logic/utils/voice_command_processor.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:llm_control_app/logic/model_manager/model_manager_bloc.dart';
import 'package:llm_control_app/data/services/api_service.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:llm_control_app/data/repositories/llm_repository.dart';
import 'package:llm_control_app/presentation/screens/fine_tune_screen.dart';
import 'package:llm_control_app/presentation/screens/model_manager_screen.dart';

class PromptInput extends StatefulWidget {
  final Function(String) onSend;
  final bool isLoading;

  const PromptInput({super.key, required this.onSend, this.isLoading = false});

  @override
  State<PromptInput> createState() => _PromptInputState();
}

class _PromptInputState extends State<PromptInput> {
  final TextEditingController _controller = TextEditingController();
  final VoiceService _voiceService = VoiceService();
  bool _isListening = false;
  void _toggleListening() async {
    if (_isListening) {
      await _voiceService.stopListening();
      setState(() => _isListening = false);
    } else {
      final started = await _voiceService.startListening((text) async {
        setState(() {
          _controller.text = text;
        });

        // Detect intent
        final intent = VoiceCommandProcessor.detectIntent(text);
        final repository = context.read<LlmRepository>();
        final query = VoiceCommandProcessor.extractQuery(text);

        switch (intent) {
          case VoiceIntent.listModels:
            _voiceService.speak("Checking your local storage for installed models...");
            try {
              final models = await repository.getLocalModels();
              if (models.isEmpty) {
                _voiceService.speak("Your local node is currently empty. No models installed.");
              } else {
                final names = models.map((m) => m.split('/').last).take(5).join(", ");
                _voiceService.speak("You have ${models.length} models installed. These include $names.");
              }
            } catch (e) {
              _voiceService.speak("Unable to reach the model orchestrator.");
            }
            _stopListeningLocally();
            break;

          case VoiceIntent.checkStorage:
            _voiceService.speak("Analyzing system storage availability...");
            try {
              final stats = await repository.getStorageStats();
              final summary = stats.summary ?? "Storage check complete. You have ${stats.freeGb} GB of free space.";
              _voiceService.speak(summary);
            } catch (e) {
              _voiceService.speak("Unable to reach the storage service.");
            }
            _stopListeningLocally();
            break;

          case VoiceIntent.searchModels:
            _voiceService.speak("Searching Hugging Face for $query...");
            context.read<ModelManagerBloc>().add(SearchModelsRequested(query));
            // Navigate to Model Storage screen (Index 2 in MainScaffold screens list)
            // Note: Since we are in a sub-widget, we'll try to find the Root Scaffold if available
            // In this specific app architecture, we'll use a push to ModelManagerScreen as a fallback
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ModelManagerScreen()));
            _stopListeningLocally();
            break;

          case VoiceIntent.openClaw:
            _voiceService.speak("Opening fine tuning panel.");
            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const FineTuneScreen()));
            _stopListeningLocally();
            break;

          case VoiceIntent.downloadModel:
            _voiceService.speak("Triggering download sequence for $query.");
            await repository.triggerDownload(query);
            _stopListeningLocally();
            break;

          case VoiceIntent.chat:
            _handleSend();
            break;

          default:
            break;
        }
      });
      if (started) {
        setState(() => _isListening = true);
      }
    }
  }

  void _stopListeningLocally() {
    _voiceService.stopListening();
    if (mounted) setState(() => _isListening = false);
  }

  void _handleSend() {
    if (_controller.text.trim().isNotEmpty && !widget.isLoading) {
      widget.onSend(_controller.text.trim());
      _controller.clear();
      if (mounted) {
        setState(() {
          _isListening = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppTheme.surfaceWhite,
        border: Border(top: BorderSide(color: AppTheme.borderLight)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              maxLines: null,
              decoration: InputDecoration(
                hintText: 'Type your prompt here...',
                hintStyle: const TextStyle(color: AppTheme.textSecondary),
                filled: true,
                fillColor: AppTheme.backgroundLight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
              ),
              onSubmitted: (_) => _handleSend(),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              color: _isListening ? Colors.red.withOpacity(0.1) : AppTheme.backgroundLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              icon: Icon(
                LucideIcons.mic,
                color: _isListening ? Colors.red : AppTheme.textSecondary,
                size: 20,
              ),
              onPressed: _toggleListening,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            decoration: BoxDecoration(
              color: AppTheme.primaryBlue,
              borderRadius: BorderRadius.circular(12),
            ),
            child: widget.isLoading
                ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
                  )
                : IconButton(
                    icon: const Icon(LucideIcons.send, color: Colors.white, size: 20),
                    onPressed: _handleSend,
                  ),
          ),
        ],
      ),
    );
  }
}
