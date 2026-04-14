import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/prompt_model.dart';
import '../../data/repositories/llm_repository.dart';

// Events
abstract class PromptEvent extends Equatable {
  const PromptEvent();
  @override
  List<Object?> get props => [];
}

class SendMessage extends PromptEvent {
  final String text;
  final String? modelId;
  const SendMessage(this.text, {this.modelId});
  @override
  List<Object?> get props => [text, modelId];
}

class SelectModel extends PromptEvent {
  final String modelId;
  const SelectModel(this.modelId);
  @override
  List<Object> get props => [modelId];
}

class ClearHistory extends PromptEvent {}

// State
class PromptState extends Equatable {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;
  final String? selectedModelId;

  const PromptState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
    this.selectedModelId,
  });

  PromptState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
    String? selectedModelId,
  }) {
    return PromptState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedModelId: selectedModelId ?? this.selectedModelId,
    );
  }

  @override
  List<Object?> get props => [messages, isLoading, error, selectedModelId];
}

// Bloc
class PromptBloc extends Bloc<PromptEvent, PromptState> {
  final LlmRepository repository;

  PromptBloc(this.repository) : super(const PromptState()) {
    on<SelectModel>((event, emit) {
      emit(state.copyWith(selectedModelId: event.modelId));
    });

    on<SendMessage>((event, emit) async {
      final userMsg = ChatMessage(
        content: event.text,
        role: MessageRole.user,
        timestamp: DateTime.now(),
      );

      final updatedMessages = List<ChatMessage>.from(state.messages)..add(userMsg);
      emit(state.copyWith(messages: updatedMessages, isLoading: true, error: null));

      try {
        final modelId = event.modelId ?? state.selectedModelId;
        final response = (modelId != null && modelId != 'DIRECT_CHAT')
            ? await repository.interactWithModel(modelId, event.text)
            : await repository.sendPrompt(event.text);
            
        String aiResponseText = 'No response';
        if (response is PromptResponse) {
          aiResponseText = response.text;
        } else if (response is Map<String, dynamic>) {
          aiResponseText = response['response'] ?? response['text'] ?? 'No response';
        }
            
        final aiMsg = ChatMessage(
          content: aiResponseText,
          role: MessageRole.assistant,
          timestamp: DateTime.now(),
        );

        final finalMessages = List<ChatMessage>.from(state.messages)..add(aiMsg);
        emit(state.copyWith(messages: finalMessages, isLoading: false));
      } catch (e) {
        emit(state.copyWith(isLoading: false, error: e.toString()));
      }
    });

    on<ClearHistory>((event, emit) {
      emit(PromptState(selectedModelId: state.selectedModelId));
    });
  }
}
