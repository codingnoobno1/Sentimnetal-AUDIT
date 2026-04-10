"use client";
import React from "react";
import { motion } from "framer-motion";
import type { ForensicTrace } from "./types";
import { getHeatmapHex } from "./utils/heatmap";

/** Horizontal gauge bars for each forensic parameter */
export default function ParameterGauges({ trace }: { trace: ForensicTrace }) {
  const items = [
    { label: "Arithmetic", val: trace?.arithmetic?.score ?? 0 },
    { label: "Logic", val: trace?.logic?.score ?? 0 },
    { label: "Code Generation", val: trace?.code_generation?.score ?? 0 },
    { label: "Instruction Following", val: trace?.instruction_following?.score ?? 0 },
    { label: "General Knowledge", val: trace?.general_knowledge?.score ?? 0 },
    { label: "Safety", val: trace?.safety?.score ?? 0 },
    { label: "Hallucination", val: trace?.hallucination?.score ?? 0 },
  ];

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm space-y-4">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3">Parameter Gauges</h5>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 text-[8px] font-black uppercase tracking-widest text-zinc-500 text-right flex-shrink-0 truncate">
            {item.label}
          </span>
          <div className="flex-1 h-3 bg-zinc-50 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.val}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="h-full"
              style={{ backgroundColor: getHeatmapHex(item.val) }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold w-8 text-right" style={{ color: getHeatmapHex(item.val) }}>
            {item.val}
          </span>
        </div>
      ))}
    </div>
  );
}
