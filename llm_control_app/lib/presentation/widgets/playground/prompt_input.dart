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

        // 1. Hybrid Parsing (Try LLM first, fallback to Local Rules)
        final repository = context.read<LlmRepository>();
        Map<String, dynamic> result;

        try {
          result = await repository.parseVoiceCommand(text);
          if (result['status'] != 'success') throw Exception("LLM Parsing Failed");
        } catch (e) {
          // OFFLINE FALLBACK: Use Local Rule-based Processor
          final localIntent = VoiceCommandProcessor.detectIntent(text);
          final query = VoiceCommandProcessor.extractQuery(text);
          result = {
            "status": "success",
            "actions": [
              {"type": localIntent.toString().split('.').last, "params": {"query": query}}
            ]
          };
        }

        // 2. Multi-Action Execution Loop
        final actions = result['actions'] as List<dynamic>? ?? [];
        for (var action in actions) {
          final type = action['type'] as String;
          final params = action['params'] as Map<String, dynamic>? ?? {};
          final query = params['query'] ?? params['model'] ?? "";

          switch (type) {
            case 'list_models':
            case 'listModels':
              _voiceService.speak("Retrieving your installed models.");
              try {
                final models = await repository.getLocalModels();
                final names = models.map((m) => m.split('/').last).take(5).join(", ");
                _voiceService.speak("You have ${models.length} models installed. ${names.isNotEmpty ? 'Including $names.' : ''}");
              } catch (_) {}
              break;

            case 'check_storage':
            case 'checkStorage':
              _voiceService.speak("Checking system capacity.");
              try {
                final stats = await repository.getStorageStats();
                _voiceService.speak(stats.summary ?? "You have ${stats.freeGb} GB free.");
              } catch (_) {}
              break;

            case 'search_models':
            case 'searchModels':
              _voiceService.speak("Searching models for $query.");
              context.read<ModelManagerBloc>().add(SearchModelsRequested(query));
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ModelManagerScreen()));
              break;

            case 'open_finetune':
            case 'openClaw':
              _voiceService.speak("Opening tuning configuration.");
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const FineTuneScreen()));
              break;

            case 'download_model':
            case 'downloadModel':
              _voiceService.speak("Beginning download of $query.");
              await repository.triggerDownload(query);
              break;

            case 'chat':
              _handleSend();
              break;

            default:
              print("Unknown action type: $type");
              break;
          }
        }
        _stopListeningLocally();
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
