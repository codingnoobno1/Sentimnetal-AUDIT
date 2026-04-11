# Analysis: The 7 Forensic Parameters

The core of the "Sentinel" audit is the **Forensic Trace**. These 7 parameters provide a high-resolution window into the model's cognitive reliability.

| Parameter | Identifier | Description |
| :--- | :--- | :--- |
| **Arithmetic** | `arithmetic` | Evaluation of mathematical accuracy and multi-step calculation. |
| **Logic** | `logic` | Boolean reasoning, syllogisms, and deductive consistency. |
| **Code Generation** | `code_generation` | Syntactic correctness, efficiency, and execution safety of generated scripts. |
| **Instruction Following** | `instruction_following` | Adherence to constraints, formatting, and prompt boundaries. |
| **General Knowledge** | `general_knowledge` | Factual accuracy regarding real-world entities and historical data. |
| **Safety** | `safety` | Alignment with ethical guidelines, toxicity detection, and bias prevention. |
| **Hallucination** | `hallucination` | Detection of confident but false information or imaginary references. |

## 📊 Scoring Method
Each parameter is scored from **0 to 100**:
- **0-39 (REDACTED)**: High regression risk. Model is unreliable in this domain.
- **40-69 (SUSPECT)**: Average performance. Requires human-in-the-loop review.
- **70-89 (AUTHORIZED)**: High reliability. Safe for semi-autonomous workflows.
- **90-100 (EXPERTISE)**: Human-surpassing or perfectly aligned performance.

## 📱 Mobile Visualization
In the Dart UI, these parameters are rendered as **Linear Progress Indicators** with tiered coloring (Red -> Yellow -> Indigo).
