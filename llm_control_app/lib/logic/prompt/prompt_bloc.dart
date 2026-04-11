import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/prompt_model.dart';
import '../../data/repositories/llm_repository.dart';

// Events
abstract class PromptEvent extends Equatable {
  const PromptEvent();
  @override
  List<Object> get props => [];
}

class SendMessage extends PromptEvent {
  final String text;
  const SendMessage(this.text);
  @override
  List<Object> get props => [text];
}

class ClearHistory extends PromptEvent {}

// State
class PromptState extends Equatable {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;

  const PromptState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
  });

  PromptState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
  }) {
    return PromptState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  @override
  List<Object?> get props => [messages, isLoading, error];
}

// Bloc
class PromptBloc extends Bloc<PromptEvent, PromptState> {
  final LlmRepository repository;

  PromptBloc(this.repository) : super(const PromptState()) {
    on<SendMessage>((event, emit) async {
      final userMsg = ChatMessage(
        content: event.text,
        role: MessageRole.user,
        timestamp: DateTime.now(),
      );

      final updatedMessages = List<ChatMessage>.from(state.messages)..add(userMsg);
      emit(state.copyWith(messages: updatedMessages, isLoading: true, error: null));

      try {
        final response = await repository.sendPrompt(event.text);
        final aiMsg = ChatMessage(
          content: response.text,
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
      emit(const PromptState());
    });
  }
}
