import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/repositories/llm_repository.dart';

// Events
abstract class FineTuneEvent extends Equatable {
  const FineTuneEvent();
  @override
  List<Object> get props => [];
}

class SubmitFineTune extends FineTuneEvent {
  final String datasetId;
  final Map<String, dynamic> params;
  const SubmitFineTune({required this.datasetId, required this.params});
  @override
  List<Object> get props => [datasetId, params];
}

// State
abstract class FineTuneState extends Equatable {
  const FineTuneState();
  @override
  List<Object> get props => [];
}

class FineTuneInitial extends FineTuneState {}
class FineTuneSubmitting extends FineTuneState {}
class FineTuneSuccess extends FineTuneState {
  final String jobId;
  const FineTuneSuccess(this.jobId);
  @override
  List<Object> get props => [jobId];
}
class FineTuneError extends FineTuneState {
  final String message;
  const FineTuneError(this.message);
  @override
  List<Object> get props => [message];
}

// Bloc
class FineTuneBloc extends Bloc<FineTuneEvent, FineTuneState> {
  final LlmRepository repository;

  FineTuneBloc(this.repository) : super(FineTuneInitial()) {
    on<SubmitFineTune>((event, emit) async {
      emit(FineTuneSubmitting());
      try {
        final job = await repository.startFineTune(event.datasetId, event.params);
        emit(FineTuneSuccess(job.id));
      } catch (e) {
        emit(FineTuneError(e.toString()));
      }
    });
  }
}
