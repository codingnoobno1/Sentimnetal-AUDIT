enum VoiceIntent {
  openClaw,
  checkStorage,
  downloadModel,
  chat,
  unknown
}

class VoiceCommandProcessor {
  /// Detects the user's intent from the recognized voice text.
  static VoiceIntent detectIntent(String text) {
    final lowerText = text.toLowerCase();

    // Intent: Open Claw (Fine-Tuning)
    if (lowerText.contains("claw") || lowerText.contains("fine tune") || lowerText.contains("finetune")) {
      return VoiceIntent.openClaw;
    }

    // Intent: Check Storage/Space
    if (lowerText.contains("space") || lowerText.contains("storage") || lowerText.contains("capacity")) {
      return VoiceIntent.checkStorage;
    }

    // Intent: Download Model
    if (lowerText.contains("download") || lowerText.contains("fetch") || lowerText.contains("pull")) {
      return VoiceIntent.downloadModel;
    }

    // Default to Chat if not a specific command
    if (lowerText.trim().isNotEmpty) {
      return VoiceIntent.chat;
    }

    return VoiceIntent.unknown;
  }
}
