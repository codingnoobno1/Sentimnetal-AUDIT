import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../logic/prompt/prompt_bloc.dart';
import '../../logic/model_manager/model_manager_bloc.dart';
import '../widgets/playground/chat_bubble.dart';
import '../widgets/playground/prompt_input.dart';
import '../../core/theme.dart';

class PlaygroundScreen extends StatefulWidget {
  const PlaygroundScreen({super.key});

  @override
  State<PlaygroundScreen> createState() => _PlaygroundScreenState();
}

class _PlaygroundScreenState extends State<PlaygroundScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ModelManagerBloc>().add(FetchLocalModelsRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildTopBar(context),
        const Divider(height: 1, color: AppTheme.borderLight),
        Expanded(
          child: BlocBuilder<PromptBloc, PromptState>(
            builder: (context, state) {
              return state.messages.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 24,
                      ),
                      itemCount: state.messages.length,
                      itemBuilder: (context, index) {
                        return ChatBubble(message: state.messages[index]);
                      },
                    );
            },
          ),
        ),
        BlocBuilder<PromptBloc, PromptState>(
          builder: (context, state) {
            if (state.error != null) {
              return _buildErrorBanner(context, state.error!);
            }
            return const SizedBox.shrink();
          },
        ),
        BlocBuilder<PromptBloc, PromptState>(
          builder: (context, state) {
            return PromptInput(
              isLoading: state.isLoading,
              onSend: (text) {
                context.read<PromptBloc>().add(SendMessage(text));
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      color: AppTheme.surfaceWhite,
      child: Row(
        children: [
          Icon(LucideIcons.bot, size: 20, color: AppTheme.primaryBlue),
          const SizedBox(width: 12),
          const Text(
            'ACTIVE MODEL:',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: AppTheme.textSecondary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: BlocBuilder<ModelManagerBloc, ModelManagerState>(
              builder: (context, modelState) {
                return BlocBuilder<PromptBloc, PromptState>(
                  builder: (context, promptState) {
                    final models = modelState.localModels;
                    final currentModel = promptState.selectedModelId;

                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.backgroundLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: (currentModel == null || currentModel == 'DIRECT_CHAT')
                              ? 'DIRECT_CHAT'
                              : (models.contains(currentModel) ? currentModel : (models.isNotEmpty ? models.first : 'DIRECT_CHAT')),
                          hint: const Text('Connect to Model...', style: TextStyle(fontSize: 13)),
                          isExpanded: true,
                          icon: Icon(LucideIcons.chevronDown, size: 16),
                          items: [
                            const DropdownMenuItem(
                              value: 'DIRECT_CHAT',
                              child: Text(
                                '✨ FastAPI Direct Chatbot',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                              ),
                            ),
                            ...models.map((model) {
                              return DropdownMenuItem(
                                value: model,
                                child: Text(
                                  model,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                              );
                            }).toList(),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              context.read<PromptBloc>().add(SelectModel(val));
                            }
                          },
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.primaryBlue.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.smart_toy_outlined,
              size: 64,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'LLM Playground',
            style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
              fontSize: 24,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Start a conversation with your fine-tuned model.',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner(BuildContext context, String error) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      color: Colors.red.withOpacity(0.1),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              error,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 16, color: Colors.red),
            onPressed: () {
              context.read<PromptBloc>().add(ClearHistory());
            },
          ),
        ],
      ),
    );
  }
}
