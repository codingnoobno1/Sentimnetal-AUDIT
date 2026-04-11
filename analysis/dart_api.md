# Dart API Mapping: Forensic Sentinel Node

This document provides the definitive mapping between the Flutter Mobile App and the hybrid Backend Node (FastAPI + Node.js).

## 🌍 Base Configuration
-   **Ngrok Host**: `https://untutelary-francisco-overtrustfully.ngrok-free.dev`
-   **Primary Gateway**: FastAPI (Port 5000)
-   **Judge Node**: Express (Port 3020)

---

## 🏗️ API Endpoint Mapping

### 1. Generative Interaction (PC Inference)
**Dart Method**: `interactWithModel(String modelId, String prompt)`
-   **Endpoint**: `POST /api/models/interact`
-   **Params**: `model_id`, `prompt`
-   **Flow**: Phone -> Ngrok -> FastAPI -> Local Transformers -> Response.
-   **Purpose**: Triggering local weight-layer compute from the phone.

### 2. Forensic Logic Evaluation (Judge Node)
**Dart Method**: `getForensicAudit(String input, String output, String modelId)`
-   **Endpoint**: `POST /api/audit/evaluate`
-   **Payload**: `{ "input": "...", "output": "...", "model_id": "...", "result": true }`
-   **Flow**: Phone -> FastAPI Proxy -> Express (3020) -> Gemini API -> 11-Dimension Report.
-   **Purpose**: Obtaining critical auditing scores for logic, safety, and expertise.

### 3. Model Registry & Download
**Dart Method**: `triggerDownload(String modelId)`
-   **Endpoint**: `POST /api/models/download`
-   **Purpose**: Triggering a remote Hugging Face snapshot on the PC.

### 4. Disk Sentinel (Health)
**Dart Method**: `getStorageStats()`
-   **Endpoint**: `GET /api/health/storage`
-   **Purpose**: Visualizing PC storage capacity (D: Drive) to prevent overflow.

---

## 📜 Logic Mapping (The 11 Dimensions)

The Dart app parses the **Judge JSON** into a `ForensicAudit` model:

| Flutter Model Key | API JSON Key | Type | Category |
| :--- | :--- | :--- | :--- |
| `arithmetic` | `forensic_trace.arithmetic` | `AuditScore` | Forensic |
| `logic` | `forensic_trace.logic` | `AuditScore` | Forensic |
| `hallucination` | `forensic_trace.hallucination` | `AuditScore` | Forensic |
| `legal` | `specialized_expertise.legal` | `AuditScore` | Expertise |
| `clinical` | `specialized_expertise.clinical` | `AuditScore` | Expertise |
| `techTips` | `technical_tips` | `String` | Architectural |

---

## 🔒 Security & Performance
-   **Ngrok-Skip**: All requests from Dart include the `ngrok-skip-browser-warning` header.
-   **Timeout**: Forensic audits have a 120s timeout to allow Gemini full reasoning time.
-   **Polling**: Local storage stats and download progress track the drive health at 15s intervals.
