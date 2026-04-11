# Analysis: Judge Ensemble Logic (Gemini/Mistral)

The intelligence of the audit relies on a "High-Resolution Critic" prompt that forces the LLM judge (Gemini/Mistral) into a forensic mindset.

## 🧠 The Auditor Persona
The prompt (defined in `auditRoutes.js`) mandates:
-   **Strict JSON Output**: Zero-shot formatting with no conversational fluff.
-   **Persona Injection**: "You are a highly advanced Forensic AI Auditor & Technical Architect."
-   **Dual-Score System**: Every score must be accompanied by a `reason` string to ensure "Explainable AI" (XAI).

## ⚖️ Benchmarking Strategy
-   **Mistral AI**: Used for standard logic and code generation audits.
-   **Gemini AI**: Preferred for creative clarity, educational (teaching) domains, and clinical safety checks due to its larger context window and safety alignment.

## 🔨 Technical Optimization (The "Tips" Layer)
The Judge is tasked with identifying *how* to fix the local model:
-   **Quantization Suggestions**: "Switch to Q4_K_M for higher retention."
-   **Weight Tuning**: "Increase attention heads on layer 32."
-   **Format Corrections**: "Force JSON-Schema in the prompt wrapper."

This metadata is what makes Sentimnetal AUDIT an **Active MLOps platform**, not just a passive dashboard.
