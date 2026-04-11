import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/stats_model.dart';
import '../../data/repositories/llm_repository.dart';

// Events
abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
  @override
  List<Object> get props => [];
}

class FetchDashboardData extends DashboardEvent {}

// State
abstract class DashboardState extends Equatable {
  const DashboardState();
  @override
  List<Object> get props => [];
}

class DashboardInitial extends DashboardState {}
class DashboardLoading extends DashboardState {}
class DashboardLoaded extends DashboardState {
  final StatsModel stats;
  const DashboardLoaded(this.stats);
  @override
  List<Object> get props => [stats];
}
class DashboardError extends DashboardState {
  final String message;
  const DashboardError(this.message);
  @override
  List<Object> get props => [message];
}

// Bloc
class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final LlmRepository repository;

  DashboardBloc(this.repository) : super(DashboardInitial()) {
    on<FetchDashboardData>((event, emit) async {
      emit(DashboardLoading());
      try {
        final stats = await repository.getStats();
        emit(DashboardLoaded(stats));
      } catch (e) {
        emit(DashboardError(e.toString()));
      }
    });
  }
}
