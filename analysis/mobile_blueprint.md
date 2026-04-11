# Analysis: Mobile Analysis Blueprint (UX design)

The **ModelAnalysisScreen** is the critical UI hook that activates after a model has responded. It gives the user immediate diagnostic feedback on their phone.

## 🏗️ UI Hierarchy

### 1. The Global Verdict (Sticky Header)
- **Status Indicator**: Large "READY" or "REGRESSION DETECTED" banner.
- **Latency Stat**: Total compute time from Laptop -> Judge -> Mobile.

### 2. Specialized Expertise Radar (The "Spider")
- A custom-painted Radar Chart centered in the screen.
- Visualizes the 4 domains (Legal, Clinical, CA, Teaching).

### 3. Forensic Trace (Collapsible List)
- 7 Progress bars for Logic, Arithmetic, etc.
- Clicking a bar expands the **Auditor's Rationale** (the `reason` from the JSON).

### 4. Technical Architect's Tips (Glassmorphic Footer)
- Floating card containing specific model optimization advice.
- "Apply Architectural Tweak" button (Future hook).

## 🧭 Navigation Flow
`ModelManagerScreen` -> (Inference) -> `ModelDetailsScreen` -> (Analyze Trigger) -> `ModelAnalysisScreen`.

## 💎 Mobile Aesthetic
-   **Typography**: Using Google Fonts `Inter` for hierarchy and `JetBrains Mono` for latency/forensic scores.
-   **Micro-animations**: Progress bars fill from 0% with ease-out curves. Radar chart polygon grows from center.
-   **Color Logic**: Adaptive coloring based on score (Red < 50, Yellow < 75, Indigo >= 75).
