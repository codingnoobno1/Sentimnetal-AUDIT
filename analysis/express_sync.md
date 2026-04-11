# Analysis: Express Node Synchronization (Judge-3020)

The **Express Sentinel Node** on port `3020` is the central intelligence broker for the forensic audit. It handles the "System Evaluation" that triggers after a prompt generation is complete.

## 🛠️ Infrastructure Stack
-   **Framework**: Express.js (Node.js)
-   **Execution Engine**: Gemini AI / Mistral AI (via `aiProvider.js`)
-   **Storage**: MongoDB (Cloud/Local) 
-   **Role**: Non-biased forensic auditor.

## 📡 The `/evaluate` Protocol
The Dart screen will call this endpoint immediately after receiving an answer from the local model.

**Request Payload Snippet:**
```json
{
  "input": "User's original prompt",
  "output": "Local model's generated answer",
  "result": "binary success/fail (optional)",
  "model_id": "phi-2-local"
}
```

**Response Payload Structure:**
The Express server returns a strictly formatted JSON:
```json
{
  "forensic_trace": {
    "arithmetic": { "score": 85, "reason": "..." },
    "logic": { "score": 70, "reason": "..." },
    ...
  },
  "specialized_expertise": {
     "legal": { "score": 40, "reason": "..." },
     ...
  },
  "technical_tips": "Increase attention headers...",
  "provider": "gemini"
}
```

## ⚡ Synchronization Importance
Without the Express node, the mobile app would only show raw responses. The synchronization with port 3020 is what provides the **Analytical Layer** (The Forensic Vision).
