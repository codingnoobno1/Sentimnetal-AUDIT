import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../logic/prompt/prompt_bloc.dart';
import '../widgets/playground/chat_bubble.dart';
import '../widgets/playground/prompt_input.dart';
import '../../core/theme.dart';

class PlaygroundScreen extends StatelessWidget {
  const PlaygroundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PromptBloc, PromptState>(
      builder: (context, state) {
        return Column(
          children: [
            Expanded(
              child: state.messages.isEmpty
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
                    ),
            ),
            if (state.error != null)
              _buildErrorBanner(context, state.error!),
            PromptInput(
              isLoading: state.isLoading,
              onSend: (text) {
                context.read<PromptBloc>().add(SendMessage(text));
              },
            ),
          ],
        );
      },
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
