"use client";
import React from "react";
import { motion } from "framer-motion";
import type { MistralVerdict } from "./types";

interface DimensionBarsProps {
  verdict: MistralVerdict;
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
}

export default function DimensionBars({ verdict, colorA, colorB, labelA, labelB }: DimensionBarsProps) {
  const dims = verdict.dimensions;
  const items = [
    { label: "Accuracy", a: dims.accuracy?.a ?? 0, b: dims.accuracy?.b ?? 0 },
    { label: "Relevance", a: dims.relevance?.a ?? 0, b: dims.relevance?.b ?? 0 },
    { label: "Coherence", a: dims.coherence?.a ?? 0, b: dims.coherence?.b ?? 0 },
    { label: "Completeness", a: dims.completeness?.a ?? 0, b: dims.completeness?.b ?? 0 },
    { label: "Safety", a: dims.safety?.a ?? 0, b: dims.safety?.b ?? 0 },
  ];

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm space-y-4">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Head-to-Head Dimensions</h5>
      {items.map((item, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{item.label}</span>
            <div className="flex items-center gap-3 text-[9px] font-mono font-bold">
              <span style={{ color: colorA }}>{item.a}</span>
              <span className="text-zinc-200">vs</span>
              <span style={{ color: colorB }}>{item.b}</span>
            </div>
          </div>
          <div className="flex gap-1 h-2.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${item.a}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
              className="h-full" style={{ backgroundColor: colorA }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${item.b}%` }} transition={{ duration: 0.6, delay: i * 0.08 + 0.05 }}
              className="h-full" style={{ backgroundColor: colorB }} />
          </div>
        </div>
      ))}
      <div className="flex gap-4 pt-3 border-t border-zinc-50">
        <span className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest" style={{ color: colorA }}><span className="w-2 h-2" style={{ backgroundColor: colorA }} /> {labelA}</span>
        <span className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest" style={{ color: colorB }}><span className="w-2 h-2" style={{ backgroundColor: colorB }} /> {labelB}</span>
      </div>
    </div>
  );
}
