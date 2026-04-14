import 'package:llm_control_app/data/local/database_helper.dart';
import 'package:llm_control_app/data/repositories/llm_repository.dart';
import 'package:llm_control_app/logic/utils/voice_command_processor.dart';

class CommandContextBuilder {
  final LlmRepository repository;
  final DatabaseHelper db = DatabaseHelper();

  CommandContextBuilder(this.repository);

  Future<Map<String, dynamic>> buildMasterContext(String userInput) async {
    // 1. Get current system state
    final storageInfo = await db.getCachedResult('storage_stats') ?? {};
    final localModels = await db.getCachedResult('local_models') ?? [];
    
    // 2. Get local rule-based intent as a hint
    final intentHint = VoiceCommandProcessor.detectIntent(userInput);
    
    // 3. Get smart facts and history from SQLite
    final facts = await db.getAllFacts();
    final history = await db.getRecentHistory(limit: 3);
    
    return {
      "user_input": userInput,
      "detected_intent_hint": intentHint.toString().split('.').last,
      "system_context": {
        "device_state": {
          "storage": storageInfo,
          "installed_models": localModels,
        },
        "smart_facts": facts,
        "available_actions": [
          "list_models",
          "search_models",
          "download_model",
          "check_storage",
          "open_finetune",
          "chat"
        ],
        "environment": "mobile_app",
      },
      "recent_history": history,
      "constraints": {
        "response_format": "strict_json",
        "no_text": true
      }
    };
  }
}
