import '../../logic/utils/voice_command_processor.dart';
import '../../logic/utils/command_context_builder.dart';
import '../local/database_helper.dart';

class LlmRepository {
  final ApiService _apiService;
  final DatabaseHelper _db = DatabaseHelper();
  late final CommandContextBuilder _contextBuilder;

  LlmRepository(this._apiService) {
    _contextBuilder = CommandContextBuilder(this);
  }

  Future<PromptResponse> sendPrompt(String prompt) => _apiService.sendPrompt(prompt);

  Future<JobModel> startFineTune(String datasetId, Map<String, dynamic> params) =>
      _apiService.startFineTune(datasetId, params);

  Future<List<JobModel>> getJobs() => _apiService.getJobs();

  Future<StatsModel> getStats() async {
    final jobs = await getJobs();
    
    int active = jobs.where((j) => j.status == JobStatus.training || j.status == JobStatus.pending).length;
    int completed = jobs.where((j) => j.status == JobStatus.completed).length;
    int failed = jobs.where((j) => j.status == JobStatus.failed).length;
    
    // Mock loss history if not provided by API yet
    List<double> history = [0.8, 0.6, 0.45, 0.38, 0.32, 0.28, 0.25];
    
    return StatsModel(
      totalJobs: jobs.length,
      activeJobs: active,
      completedJobs: completed,
      failedJobs: failed,
      averageAccuracy: 94.2, // Mock average
      lossHistory: history,
    );
  }

  // --- Model Management ---

  Future<List<String>> getLocalModels() async {
    final models = await _apiService.getLocalModels();
    await _db.cacheApiResult('local_models', models);
    return models;
  }

  Future<Map<String, dynamic>> triggerDownload(String modelId) => _apiService.triggerDownload(modelId);

  Future<Map<String, dynamic>> getDownloadProgress(String modelId) => _apiService.getDownloadProgress(modelId);

  Future<void> deleteModel(String modelId) => _apiService.deleteModel(modelId);

  // --- Discovery & Health ---

  Future<List<HfModel>> searchHuggingFace(String query) => _apiService.searchHuggingFace(query);

  Future<StorageStats> getStorageStats() async {
    final stats = await _apiService.getStorageStats();
    await _db.cacheApiResult('storage_stats', stats.toJson());
    return stats;
  }

  Future<Map<String, dynamic>> interactWithModel(String id, String prompt) => _apiService.interactWithModel(id, prompt);

  Future<ForensicAudit?> getAuditStatus(String auditId) => _apiService.getAuditStatus(auditId);

  Future<ForensicAudit> getForensicAudit(String input, String output, String modelId) => 
      _apiService.getForensicAudit(input, output, modelId);

  /// Executes a command using a hybrid approach:
  /// 1. Builds rich context (Smart facts, Storage, History).
  /// 2. Sends to LLM for parsing into multiple structured actions.
  Future<Map<String, dynamic>> parseVoiceCommand(String text) async {
    final context = await _contextBuilder.buildMasterContext(text);
    final response = await _apiService.parseCommand(text, context);
    
    if (response['status'] == 'success') {
      await _db.recordCommand(text, response['intent'] ?? 'unknown', response['actions'] ?? []);
    }
    
    return response;
  }
}
