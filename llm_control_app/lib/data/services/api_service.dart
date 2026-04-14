import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:llm_control_app/data/local/database_helper.dart';
import 'package:llm_control_app/logic/utils/voice_command_processor.dart';
import 'package:llm_control_app/logic/utils/command_context_builder.dart';
import '../models/hf_model.dart';
import '../models/forensic_audit.dart';
import '../models/job_model.dart';
import '../models/prompt_model.dart';

class ApiService {
  static const bool _useNgrok = true; // TOGGLE THIS: true for ngrok, false for local emulator
  static const String _localUrl = "http://10.0.2.2:5000";
  static const String _ngrokUrl = "https://untutelary-francisco-overtrustfully.ngrok-free.dev";

  static String get baseUrl => _useNgrok ? _ngrokUrl : _localUrl;

  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  Future<PromptResponse> sendPrompt(String prompt) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/chat"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"prompt": prompt}),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return PromptResponse(
        text: data['response'] as String,
        metadata: data['metadata'] as Map<String, dynamic>?,
      );
    } else {
      throw Exception("Failed to send prompt: ${res.statusCode}");
    }
  }

  Future<JobModel> startFineTune(String datasetId, Map<String, dynamic> params) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/fine-tune"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "dataset_id": datasetId,
        "parameters": params,
      }),
    );

    if (res.statusCode == 200 || res.statusCode == 201) {
      return JobModel.fromJson(jsonDecode(res.body));
    } else {
      throw Exception("Failed to start fine-tune: ${res.statusCode}");
    }
  }

  Future<List<JobModel>> getJobs() async {
    final res = await _client.get(Uri.parse("$baseUrl/jobs"));
    
    if (res.statusCode == 200) {
      final List<dynamic> data = jsonDecode(res.body);
      return data.map((json) => JobModel.fromJson(json)).toList();
    } else {
      throw Exception("Failed to fetch jobs: ${res.statusCode}");
    }
  }

  // --- Model Management Extensions ---
  
  Future<List<String>> getLocalModels() async {
    final res = await _client.get(Uri.parse("$baseUrl/api/models/local"));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return List<String>.from(data['local_models'] ?? []);
    }
    throw Exception("Failed to fetch local models: ${res.statusCode}");
  }

  Future<Map<String, dynamic>> triggerDownload(String modelId) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/api/models/download?model_id=${Uri.encodeComponent(modelId)}"),
      headers: {"Content-Type": "application/json"},
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to trigger download: ${res.statusCode}");
  }

  Future<Map<String, dynamic>> getDownloadProgress(String modelId) async {
    final res = await _client.get(
      Uri.parse("$baseUrl/api/models/progress/${Uri.encodeComponent(modelId)}"),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to fetch progress: ${res.statusCode}");
  }

  Future<void> deleteModel(String modelId) async {
    final res = await _client.delete(
      Uri.parse("$baseUrl/api/models/${Uri.encodeComponent(modelId)}"),
    );
    if (res.statusCode != 200) {
      throw Exception("Failed to delete model: ${res.statusCode}");
    }
  }

  // --- Discovery & Health ---

  Future<List<HfModel>> searchHuggingFace(String query) async {
    final res = await _client.get(
      Uri.parse("$baseUrl/api/hf/search?query=${Uri.encodeComponent(query)}&limit=15"),
    );
    if (res.statusCode == 200) {
      final List<dynamic> data = jsonDecode(res.body);
      return data.map((json) => HfModel.fromJson(json)).toList();
    }
    throw Exception("Discovery failed: ${res.statusCode}");
  }

  Future<StorageStats> getStorageStats() async {
    final res = await _client.get(Uri.parse("$baseUrl/api/health/storage"));
    if (res.statusCode == 200) {
      return StorageStats.fromJson(jsonDecode(res.body));
    }
    throw Exception("Failed to sync storage health: ${res.statusCode}");
  }

  Future<Map<String, dynamic>> interactWithModel(String modelId, String prompt) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/api/models/interact?model_id=${Uri.encodeComponent(modelId)}&prompt=${Uri.encodeComponent(prompt)}"),
      headers: {"Content-Type": "application/json"},
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Model interaction failure: ${res.statusCode}");
  }

  Future<ForensicAudit?> getAuditStatus(String auditId) async {
    final res = await _client.get(Uri.parse("$baseUrl/api/audit/status/$auditId"));
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['status'] == 'completed') {
        return ForensicAudit.fromJson(data);
      }
      return null; // Still processing or queued
    }
    throw Exception("Audit status check failure: ${res.statusCode}");
  }

  Future<Map<String, dynamic>> parseCommand(String text, Map<String, dynamic> context) async {
    final res = await _client.post(
      Uri.parse("$baseUrl/api/parse-command"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "text": text,
        "context": context,
      }),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    // Fallback if backend parsing fails
    return {"status": "error", "actions": []};
  }

  Future<ForensicAudit> getForensicAudit(String input, String output, String modelId) async {
    // Note: This method is now legacy as we move to async polling.
    // However, we keep it for direct audit triggers from the UI.
    final res = await _client.post(
      Uri.parse("$baseUrl/api/audit/evaluate"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "input": input,
        "output": output,
        "model_id": modelId,
        "result": true
      }),
    );
    if (res.statusCode == 200) {
      return ForensicAudit.fromJson(jsonDecode(res.body));
    }
    throw Exception("Forensic evaluation failure: ${res.statusCode}");
  }
}
