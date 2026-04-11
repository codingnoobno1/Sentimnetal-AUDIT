import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/repositories/llm_repository.dart';

// --- Models ---
class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({required this.text, required this.isUser, DateTime? timestamp})
      : timestamp = timestamp ?? DateTime.now();
}

// --- Events ---
abstract class InferenceEvent extends Equatable {
  const InferenceEvent();
  @override
  List<Object?> get props => [];
}

class SendPromptRequested extends InferenceEvent {
  final String modelId;
  final String prompt;
  const SendPromptRequested({required this.modelId, required this.prompt});
  @override
  List<Object?> get props => [modelId, prompt];
}

class ClearHistoryRequested extends InferenceEvent {}

// --- States ---
enum InferenceStatus { initial, loading, success, failure }

class InferenceState extends Equatable {
  final InferenceStatus status;
  final List<ChatMessage> history;
  final String? error;

  const InferenceState({
    this.status = InferenceStatus.initial,
    this.history = const [],
    this.error,
  });

  InferenceState copyWith({
    InferenceStatus? status,
    List<ChatMessage>? history,
    String? error,
  }) {
    return InferenceState(
      status: status ?? this.status,
      history: history ?? this.history,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [status, history, error];
}

// --- BLoC ---
class InferenceBloc extends Bloc<InferenceEvent, InferenceState> {
  final LlmRepository _repository;

  InferenceBloc(this._repository) : super(const InferenceState()) {
    on<SendPromptRequested>(_onSendPromptRequested);
    on<ClearHistoryRequested>(_onClearHistoryRequested);
  }

  Future<void> _onSendPromptRequested(
    SendPromptRequested event,
    Emitter<InferenceState> emit,
  ) async {
    final userMessage = ChatMessage(text: event.prompt, isUser: true);
    final updatedHistory = List<ChatMessage>.from(state.history)..add(userMessage);
    
    emit(state.copyWith(status: InferenceStatus.loading, history: updatedHistory));
    
    try {
      final response = await _repository.interactWithModel(event.modelId, event.prompt);
      final botMessage = ChatMessage(text: response, isUser: false);
      
      emit(state.copyWith(
        status: InferenceStatus.success,
        history: List<ChatMessage>.from(state.history)..add(botMessage),
      ));
    } catch (e) {
      emit(state.copyWith(status: InferenceStatus.failure, error: e.toString()));
    }
  }

  void _onClearHistoryRequested(
    ClearHistoryRequested event,
    Emitter<InferenceState> emit,
  ) {
    emit(const InferenceState(status: InferenceStatus.initial, history: []));
  }
}

// --- Repository Extension ---
// I need to update the LlmRepository to include interactWithModel.
// I'll do that in the next step.
