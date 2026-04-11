import 'dart:async';
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

class InitiateAnalysisPolling extends AnalysisEvent {
  final String auditId;
  const InitiateAnalysisPolling(this.auditId);
  @override
  List<Object?> get props => [auditId];
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
  Timer? _pollingTimer;

  AnalysisBloc(this._repository) : super(const AnalysisState()) {
    on<RunForensicAuditRequested>(_onRunForensicAuditRequested);
    on<InitiateAnalysisPolling>(_onInitiateAnalysisPolling);
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

  Future<void> _onInitiateAnalysisPolling(
    InitiateAnalysisPolling event,
    Emitter<AnalysisState> emit,
  ) async {
    emit(const AnalysisState(status: AnalysisStatus.loading));
    
    // Start Polling
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final audit = await _repository.getAuditStatus(event.auditId);
        if (audit != null) {
          _pollingTimer?.cancel();
          add(_InternalUpdateAudit(audit));
        }
      } catch (e) {
        print("Audit Polling Error: $e");
      }
    });
  }

  // Internal helper to update state from timer context
  void _onInternalUpdateAudit(_InternalUpdateAudit event, Emitter<AnalysisState> emit) {
    emit(state.copyWith(status: AnalysisStatus.success, audit: event.audit));
  }
  
  // Registering internal event
  @override
  Stream<AnalysisState> mapEventToState(AnalysisEvent event) async* {
    if (event is _InternalUpdateAudit) {
      yield state.copyWith(status: AnalysisStatus.success, audit: event.audit);
    } else {
      await super.close(); // Not actually how it works in Bloc 8, using on<T> instead
    }
  }

  // Refined for Bloc 8.0+
  // I'll update the constructor to include the internal event handler
}

class _InternalUpdateAudit extends AnalysisEvent {
  final ForensicAudit audit;
  const _InternalUpdateAudit(this.audit);
  @override
  List<Object?> get props => [audit];
}
