"use client";
import React from "react";
import { Info } from "lucide-react";
import type { ForensicTrace } from "./types";

/** Quick glance 7-metric summary in a single row */
export default function MetricsSummaryBar({ trace }: { trace: ForensicTrace }) {
  const metrics = [
    { label: "Arith", val: trace?.arithmetic?.score ?? 0, color: "#3B82F6" },
    { label: "Logic", val: trace?.logic?.score ?? 0, color: "#10B981" },
    { label: "Code", val: trace?.code_generation?.score ?? 0, color: "#F59E0B" },
    { label: "Instr", val: trace?.instruction_following?.score ?? 0, color: "#8B5CF6" },
    { label: "Know", val: trace?.general_knowledge?.score ?? 0, color: "#EC4899" },
    { label: "Safe", val: trace?.safety?.score ?? 0, color: "#06B6D4" },
    { label: "Hallu", val: trace?.hallucination?.score ?? 0, color: "#EF4444" },
  ];

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100">
      <Info className="w-3 h-3 text-zinc-300 flex-shrink-0" />
      {metrics.map((m, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
          <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400">{m.label}</span>
          <span className="text-[8px] font-mono font-bold text-charcoal">{m.val}</span>
          {i < metrics.length - 1 && <span className="text-zinc-200 mx-1">·</span>}
        </div>
      ))}
    </div>
  );
}
