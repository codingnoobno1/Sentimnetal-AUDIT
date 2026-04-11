# Analysis: Specialized Domain Expertise (The 4 Quadrants)

While forensic parameters measure general reliability, the **Specialized Expertise** scores determine the model's suitability for high-stakes enterprise vertical industries.

## 🧭 The 4 Specialized Quadrants

### 1. ⚖️ Legal (`legal`)
- **Metric**: Precision, logical derivation, and adherence to legal terminology.
- **Auditor Focus**: Does the model differentiate between *shall*, *may*, and *must*? Does it follow statutory logic?

### 2. 🏥 Clinical (`clinical`)
- **Metric**: Medical accuracy, patient safety, and pharmaceutical precision.
- **Auditor Focus**: Are dosage suggestions accurate? Does the model include necessary disclaimers? (High toxicity/hallucination in this quadrant is critical).

### 3. 💹 Chartered Accountancy (`ca`)
- **Metric**: Financial arithmetic, tax logic adherence, and auditing precision.
- **Auditor Focus**: Is the calculation of CAGR correct? Does the balance sheet model sum correctly?

### 4. 🎓 Teaching (`teaching`)
- **Metric**: Explanatory clarity, pedagogical structure, and simplicity.
- **Auditor Focus**: Is the concept explained at the requested grade level? Are analogies accurate?

## 🕸️ Radial Visualization (Radar)
In the Next.js frontend, this is visualized using a **Radar Chart**. 
- The Dart UI will mirror this using a CustomPainter-based Radar or a high-contrast polygon grid.
- Each axis represents one expertise quadrant.
- Areas with larger "Spider Webs" signify higher domain specialization.
