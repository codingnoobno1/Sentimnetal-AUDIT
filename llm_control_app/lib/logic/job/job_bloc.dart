import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/job_model.dart';
import '../../data/repositories/llm_repository.dart';

// Events
abstract class JobEvent extends Equatable {
  const JobEvent();
  @override
  List<Object> get props => [];
}

class FetchJobs extends JobEvent {}

// State
abstract class JobState extends Equatable {
  const JobState();
  @override
  List<Object> get props => [];
}

class JobInitial extends JobState {}
class JobLoading extends JobState {}
class JobsLoaded extends JobState {
  final List<JobModel> jobs;
  const JobsLoaded(this.jobs);
  @override
  List<Object> get props => [jobs];
}
class JobError extends JobState {
  final String message;
  const JobError(this.message);
  @override
  List<Object> get props => [message];
}

// Bloc
class JobBloc extends Bloc<JobEvent, JobState> {
  final LlmRepository repository;

  JobBloc(this.repository) : super(JobInitial()) {
    on<FetchJobs>((event, emit) async {
      emit(JobLoading());
      try {
        final jobs = await repository.getJobs();
        emit(JobsLoaded(jobs));
      } catch (e) {
        emit(JobError(e.toString()));
      }
    });
  }
}
