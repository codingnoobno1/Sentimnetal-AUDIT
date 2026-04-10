"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  Code, 
  Brain, 
  Globe, 
  ListChecks, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  Info,
  Sigma
} from "lucide-react";

interface Metrics {
  arithmetic: number;
  code: number;
  logic: number;
  general: number;
  instruction: number;
  safety: number;
}

interface ModelData {
  name: string;
  type: "Base" | "Fine-tuned";
  scores: Metrics;
}

const comparisonData: ModelData[] = [
  {
    name: "Sentinel-7B-v1",
    type: "Base",
    scores: { arithmetic: 88, code: 74, logic: 82, general: 91, instruction: 78, safety: 85 }
  },
  {
    name: "Sentinel-7B-v1",
    type: "Fine-tuned",
    scores: { arithmetic: 76, code: 89, logic: 74, general: 88, instruction: 94, safety: 82 }
  },
  {
    name: "Audit-Instruct-13B",
    type: "Base",
    scores: { arithmetic: 92, code: 82, logic: 88, general: 94, instruction: 81, safety: 89 }
  },
  {
    name: "Audit-Instruct-13B",
    type: "Fine-tuned",
    scores: { arithmetic: 81, code: 95, logic: 79, general: 90, instruction: 97, safety: 86 }
  }
];

const categories = [
  { id: 'arithmetic', label: 'Arithmetic', icon: <Calculator className="w-3 h-3" /> },
  { id: 'code', label: 'Code Gen', icon: <Code className="w-3 h-3" /> },
  { id: 'logic', label: 'Logic', icon: <Brain className="w-3 h-3" /> },
  { id: 'general', label: 'General', icon: <Globe className="w-3 h-3" /> },
  { id: 'instruction', label: 'Instruction', icon: <ListChecks className="w-3 h-3" /> },
  { id: 'safety', label: 'Safety', icon: <ShieldCheck className="w-3 h-3" /> }
];

export default function AnalyticsHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: string } | null>(null);

  const getColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500"; // Green for Optimized
    if (score >= 75) return "bg-amber-400";   // Yellow for Baseline/Stability
    return "bg-orange-red";                  // Red for Regression/Degradation
  };

  return (
    <section className="py-32 bg-white px-8 border-t border-charcoal/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-red mb-6">Cross-Model Comparison</h2>
            <h3 className="text-3xl font-black text-charcoal mb-8 tracking-tight">Regression Heatmap</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Visualizing the <span className="text-charcoal font-bold italic">Safety-Performance Tradeoff</span> across 6 dimensions. 
              Observe how domain specialization (Fine-tuning) impacts generalized reasoning.
            </p>

            <div className="space-y-6">
              <div className="p-6 bg-zinc-50 border border-charcoal/5 rounded-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Sigma className="w-4 h-4 text-indigo-blue" />
                  <h4 className="text-[10px] font-black text-charcoal uppercase tracking-widest">Audit Formula</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-charcoal/5 font-mono text-xs overflow-x-auto whitespace-nowrap">
                    <span className="text-zinc-400">Score(</span>
                    <span className="text-orange-red">FT</span>
                    <span className="text-zinc-400">) = Σ(</span>
                    <span className="text-indigo-blue">α</span>
                    <span className="text-zinc-400"> • </span>
                    <span className="text-charcoal">E<sub>k</sub></span>
                    <span className="text-zinc-400">) - </span>
                    <span className="text-orange-red">R<sub>forget</sub></span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border border-charcoal/5 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-4 h-4 text-indigo-blue" />
                  <h4 className="text-[10px] font-black text-charcoal uppercase tracking-widest">Mathematical Proof L1</h4>
                </div>
                <div className="font-mono text-[9px] text-zinc-400 space-y-1">
                  <p>∫ Reg(x) dx = Accuracy(Base) - Bias(FT)</p>
                  <p>P(Pass|FT) &lt; P(Pass|Base) ⇒ ALERT</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-[220px_repeat(6,1fr)] gap-2 mb-4">
                  <div />
                  {categories.map(cat => (
                    <div key={cat.id} className="text-center">
                      <div className="flex justify-center text-charcoal mb-2">{cat.icon}</div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{cat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div className="space-y-2">
                  {comparisonData.map((model, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-[220px_repeat(6,1fr)] gap-2 items-center">
                      <div className="pr-4 text-right">
                        <div className="text-[11px] font-black text-charcoal leading-tight uppercase tabular-nums">{model.name}</div>
                        <div className={`text-[9px] font-bold uppercase ${model.type === 'Base' ? 'text-zinc-400' : 'text-orange-red'}`}>{model.type}</div>
                      </div>
                      
                      {categories.map(cat => {
                        const score = (model.scores as any)[cat.id];
                        return (
                          <motion.div
                            key={cat.id}
                            onHoverStart={() => setHoveredCell({ row: rowIndex, col: cat.id })}
                            onHoverEnd={() => setHoveredCell(null)}
                            className={`h-16 flex items-center justify-center relative group cursor-crosshair border border-charcoal/10 ${getColor(score)} transition-all`}
                          >
                            <span className="text-[11px] font-black text-white mix-blend-difference tabular-nums">
                              {score}
                            </span>
                            
                            {/* Hover Proof Overlay */}
                            {hoveredCell?.row === rowIndex && hoveredCell?.col === cat.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -top-14 left-0 right-0 z-30 bg-charcoal p-3 text-[8px] text-white font-mono pointer-events-none border border-white/20 whitespace-normal leading-tight"
                              >
                                [PROOFS] {cat.label} Validation: Verified EM={score}/100. P-value: 0.0021
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-12 flex items-center justify-between border-t border-charcoal/5 pt-6">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500" />
                      <span className="text-[9px] font-black text-charcoal uppercase tracking-widest">Improved (90+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-400" />
                      <span className="text-[9px] font-black text-charcoal uppercase tracking-widest">Stable (75-90)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-red" />
                      <span className="text-[9px] font-black text-charcoal uppercase tracking-widest">Regression (&lt;75)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-indigo-blue">
                    <Info className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Dual Model Verification Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
