import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/local_model.dart';
import '../../data/models/hf_model.dart';
import '../../data/repositories/llm_repository.dart';

// --- Events ---
abstract class ModelManagerEvent extends Equatable {
  const ModelManagerEvent();
  @override
  List<Object?> get props => [];
}

class FetchLocalModelsRequested extends ModelManagerEvent {}

class SearchModelsRequested extends ModelManagerEvent {
  final String query;
  const SearchModelsRequested(this.query);
  @override
  List<Object?> get props => [query];
}

class FetchStorageStatsRequested extends ModelManagerEvent {}

class DownloadModelRequested extends ModelManagerEvent {
  final String modelId;
  const DownloadModelRequested(this.modelId);
  @override
  List<Object?> get props => [modelId];
}

class CheckProgressRequested extends ModelManagerEvent {
  final String modelId;
  const CheckProgressRequested(this.modelId);
  @override
  List<Object?> get props => [modelId];
}

class DeleteModelRequested extends ModelManagerEvent {
  final String modelId;
  const DeleteModelRequested(this.modelId);
  @override
  List<Object?> get props => [modelId];
}

// --- States ---
enum ModelManagerStatus { initial, loading, success, failure }

class ModelManagerState extends Equatable {
  final ModelManagerStatus status;
  final List<String> localModels;
  final List<HfModel> searchResults;
  final Map<String, LocalModel> activeDownloads;
  final StorageStats? storageStats;
  final String? error;

  const ModelManagerState({
    this.status = ModelManagerStatus.initial,
    this.localModels = const [],
    this.searchResults = const [],
    this.activeDownloads = const {},
    this.storageStats,
    this.error,
  });

  ModelManagerState copyWith({
    ModelManagerStatus? status,
    List<String>? localModels,
    List<HfModel>? searchResults,
    Map<String, LocalModel>? activeDownloads,
    StorageStats? storageStats,
    String? error,
  }) {
    return ModelManagerState(
      status: status ?? this.status,
      localModels: localModels ?? this.localModels,
      searchResults: searchResults ?? this.searchResults,
      activeDownloads: activeDownloads ?? this.activeDownloads,
      storageStats: storageStats ?? this.storageStats,
      error: error ?? this.error,
    );
  }

  @override
  List<Object?> get props => [status, localModels, searchResults, activeDownloads, storageStats, error];
}

// --- BLoC ---
class ModelManagerBloc extends Bloc<ModelManagerEvent, ModelManagerState> {
  final LlmRepository _repository;
  Timer? _progressTimer;
  Timer? _storageTimer;

  ModelManagerBloc(this._repository) : super(const ModelManagerState()) {
    on<FetchLocalModelsRequested>(_onFetchLocalModelsRequested);
    on<SearchModelsRequested>(_onSearchModelsRequested);
    on<FetchStorageStatsRequested>(_onFetchStorageStatsRequested);
    on<DownloadModelRequested>(_onDownloadModelRequested);
    on<CheckProgressRequested>(_onCheckProgressRequested);
    on<DeleteModelRequested>(_onDeleteModelRequested);

    // Initial storage sync
    _startStorageMonitoring();
  }

  Future<void> _onFetchLocalModelsRequested(
    FetchLocalModelsRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    emit(state.copyWith(status: ModelManagerStatus.loading));
    try {
      final models = await _repository.getLocalModels();
      emit(state.copyWith(status: ModelManagerStatus.success, localModels: models));
    } catch (e) {
      emit(state.copyWith(status: ModelManagerStatus.failure, error: e.toString()));
    }
  }

  Future<void> _onSearchModelsRequested(
    SearchModelsRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    if (event.query.isEmpty) {
      emit(state.copyWith(searchResults: []));
      return;
    }
    emit(state.copyWith(status: ModelManagerStatus.loading));
    try {
      final results = await _repository.searchHuggingFace(event.query);
      emit(state.copyWith(status: ModelManagerStatus.success, searchResults: results));
    } catch (e) {
      emit(state.copyWith(status: ModelManagerStatus.failure, error: e.toString()));
    }
  }

  Future<void> _onFetchStorageStatsRequested(
    FetchStorageStatsRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    try {
      final stats = await _repository.getStorageStats();
      emit(state.copyWith(storageStats: stats));
    } catch (e) {
      print("Storage polling error: $e");
    }
  }

  Future<void> _onDownloadModelRequested(
    DownloadModelRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    try {
      final response = await _repository.triggerDownload(event.modelId);
      final model = LocalModel.fromJson(response);
      
      final newDownloads = Map<String, LocalModel>.from(state.activeDownloads);
      newDownloads[event.modelId] = model;
      
      emit(state.copyWith(activeDownloads: newDownloads));
      _startPolling();
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onCheckProgressRequested(
    CheckProgressRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    try {
      final response = await _repository.getDownloadProgress(event.modelId);
      final model = LocalModel.fromJson(response);
      
      final newDownloads = Map<String, LocalModel>.from(state.activeDownloads);
      newDownloads[event.modelId] = model;
      
      if (model.progress >= 100) {
        newDownloads.remove(event.modelId);
        add(FetchLocalModelsRequested());
        add(FetchStorageStatsRequested()); // Sync storage after download
      }
      
      emit(state.copyWith(activeDownloads: newDownloads));
      if (newDownloads.isEmpty) _stopPolling();
    } catch (e) {
      print("Progress polling error: $e");
    }
  }

  Future<void> _onDeleteModelRequested(
    DeleteModelRequested event,
    Emitter<ModelManagerState> emit,
  ) async {
    try {
      await _repository.deleteModel(event.modelId);
      add(FetchLocalModelsRequested());
      add(FetchStorageStatsRequested());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  void _startPolling() {
    _progressTimer?.cancel();
    _progressTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      for (var modelId in state.activeDownloads.keys) {
        add(CheckProgressRequested(modelId));
      }
    });
  }

  void _stopPolling() {
    _progressTimer?.cancel();
    _progressTimer = null;
  }

  void _startStorageMonitoring() {
    _storageTimer?.cancel();
    add(FetchStorageStatsRequested());
    _storageTimer = Timer.periodic(const Duration(seconds: 15), (timer) {
      add(FetchStorageStatsRequested());
    });
  }

  @override
  Future<void> close() {
    _stopPolling();
    _storageTimer?.cancel();
    return super.close();
  }
}
