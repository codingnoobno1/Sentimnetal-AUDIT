# Analysis: Next.js Component Mapping for Flutter

To maintain a consistent enterprise aesthetic, the Dart UI must replicate the data-dense components of the Next.js Sentinel Dashboard while optimizing for mobile screen ratios.

## 🍱 Component Correlation Table

| Next.js Component | Flutter/Dart Equivalent | Purpose |
| :--- | :--- | :--- |
| `DimensionRadar.tsx` | `ForensicRadarPlot` (CustomPainter) | Visualizes the 4 Expertise Domains. |
| `DimensionBars.tsx` | `ParameterBarStack` (StatelessWidget) | Renders the 7 Forensic scores as progress bars. |
| `VerdictBanner.tsx` | `ForensicSummaryHeader` | High-level pass/fail/warning banner with status icons. |
| `VerdictReasoning.tsx` | `TraceExplanation` | Expands the JSON "reason" strings into readable cards. |
| `ModelPicker.tsx` | `NodeSelector` | Toggles between local models for the analysis. |

## 🎨 Design Tokens (Duo-Theme)
-   **Primary (Indigo)**: `#6366F1` - Used for "Authorized" status.
-   **Accent (Orange-Red)**: `#FF4500` - Used for "Thinking" and regression warnings.
-   **Background (Ghost White)**: `#FAFAFA` - Clean forensic workspace baseline.

## 📱 Mobile UI Refinements
Unlike the wide desktop dashboard, the mobile app will use **Accordion-style expansions** for the 7 Forensic bars to avoid overwhelming the vertical viewport.
- Radar Chart will occupy the "Top Fold".
- Technical Tips will be pinned to a floating action ribbon or bottom sheet.
