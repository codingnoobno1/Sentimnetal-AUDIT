import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/forensic_audit.dart';
import '../../data/repositories/llm_repository.dart';

// --- Events ---
abstract class AnalysisEvent extends Equatable {
  const AnalysisEvent();
  @override
  List<Object?> get props => [];
}

class RunForensicAuditRequested extends AnalysisEvent {
  final String input;
  final String output;
  final String modelId;

  const RunForensicAuditRequested({
    required this.input,
    required this.output,
    required this.modelId,
  });

  @override
  List<Object?> get props => [input, output, modelId];
}

// --- States ---
enum AnalysisStatus { initial, loading, success, failure }

class AnalysisState extends Equatable {
  final AnalysisStatus status;
  final ForensicAudit? audit;
  final String? error;

  const AnalysisState({
    this.status = AnalysisStatus.initial,
    this.audit,
    this.error,
  });

  AnalysisState copyWith({
    AnalysisStatus? status,
    ForensicAudit? audit,
    String? error,
  }) {
    return AnalysisState(
      status: status ?? this.status,
      audit: audit ?? this.audit,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [status, audit, error];
}

// --- BLoC ---
class AnalysisBloc extends Bloc<AnalysisEvent, AnalysisState> {
  final LlmRepository _repository;

  AnalysisBloc(this._repository) : super(const AnalysisState()) {
    on<RunForensicAuditRequested>(_onRunForensicAuditRequested);
  }

  Future<void> _onRunForensicAuditRequested(
    RunForensicAuditRequested event,
    Emitter<AnalysisState> emit,
  ) async {
    emit(const AnalysisState(status: AnalysisStatus.loading));
    try {
      final result = await _repository.getForensicAudit(
        event.input,
        event.output,
        event.modelId,
      );
      emit(AnalysisState(status: AnalysisStatus.success, audit: result));
    } catch (e) {
      emit(AnalysisState(status: AnalysisStatus.failure, error: e.toString()));
    }
  }
}
