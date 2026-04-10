"use client";
import React from "react";
import { motion } from "framer-motion";
import { getHeatmapHex, getScoreLabel } from "./utils/heatmap";
import type { ForensicTrace } from "./types";

/** Vertical bar chart for top-level forensic parameters */
export default function ForensicBarChart({ trace }: { trace: ForensicTrace }) {
  const bars = [
    { label: "Arith", val: trace?.arithmetic?.score ?? 0 },
    { label: "Logic", val: trace?.logic?.score ?? 0 },
    { label: "Code", val: trace?.code_generation?.score ?? 0 },
    { label: "Instr", val: trace?.instruction_following?.score ?? 0 },
    { label: "Know", val: trace?.general_knowledge?.score ?? 0 },
    { label: "Safe", val: trace?.safety?.score ?? 0 },
    { label: "Hallu", val: trace?.hallucination?.score ?? 0 },
  ];

  const maxVal = 100;

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-5">Score Histogram</h5>
      <div className="flex items-end gap-2 h-[140px]">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
            <span className="text-[8px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: getHeatmapHex(bar.val) }}>
              {bar.val}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(bar.val / maxVal) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="w-full min-w-[16px] rounded-t-sm"
              style={{ backgroundColor: getHeatmapHex(bar.val) }}
            />
            <span className="text-[6px] font-black uppercase tracking-wider text-zinc-400 mt-1">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
