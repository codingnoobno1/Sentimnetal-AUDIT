enum VoiceIntent {
  openClaw,
  closeClaw,
  checkStorage,
  downloadModel,
  searchModels, // NEW: Search discovery
  listModels,   // NEW: List local models
  startTraining,
  chat,
  unknown
}

class VoiceCommandProcessor {
  /// Detects the user's intent from the recognized voice text.
  static VoiceIntent detectIntent(String text) {
    final lowerText = text.toLowerCase();

    if (lowerText.contains("close claw") || lowerText.contains("hide panel")) {
      return VoiceIntent.closeClaw;
    }

    if (lowerText.contains("claw") || lowerText.contains("fine tune") || lowerText.contains("finetune")) {
      return VoiceIntent.openClaw;
    }

    if (lowerText.contains("start training") || lowerText.contains("run job") || lowerText.contains("begin training")) {
      return VoiceIntent.startTraining;
    }

    // NEW: Search Intent
    if (lowerText.contains("search for") || lowerText.contains("look for") || lowerText.contains("find model")) {
      return VoiceIntent.searchModels;
    }

    // NEW: List Intent
    if (lowerText.contains("list") || lowerText.contains("what models") || lowerText.contains("show models")) {
      return VoiceIntent.listModels;
    }

    if (lowerText.contains("space") || lowerText.contains("storage") || lowerText.contains("capacity")) {
      return VoiceIntent.checkStorage;
    }

    if (lowerText.contains("download") || lowerText.contains("fetch") || lowerText.contains("pull")) {
      return VoiceIntent.downloadModel;
    }

    if (lowerText.trim().isNotEmpty) {
      return VoiceIntent.chat;
    }

    return VoiceIntent.unknown;
  }

  /// Extracts the specific entity (e.g. model name) from a command string.
  static String extractQuery(String text) {
    final lowerText = text.toLowerCase();
    
    // List of common command prefixes to strip
    final prefixes = [
      "search for",
      "search hugging face for",
      "find model",
      "look for",
      "download",
      "fetch",
      "pull",
      "please",
      "the",
      "model"
    ];

    String cleaned = lowerText;
    for (var prefix in prefixes) {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.replaceFirst(prefix, "").trim();
      }
    }

    // If result is empty after stripping, return original for better chance of matching
    return cleaned.isNotEmpty ? cleaned : text;
  }
}
