"use client";
import React from "react";
import { ClipboardCheck } from "lucide-react";
import { getHeatmapColor } from "./utils/heatmap";
import type { ForensicTrace } from "./types";

export default function EvidenceTrace({ trace }: { trace: ForensicTrace }) {
  const items = [
    { label: "Arithmetic", score: trace?.arithmetic?.score ?? 0, reason: trace?.arithmetic?.reason ?? "No data" },
    { label: "Logic", score: trace?.logic?.score ?? 0, reason: trace?.logic?.reason ?? "No data" },
    { label: "Code Gen", score: trace?.code_generation?.score ?? 0, reason: trace?.code_generation?.reason ?? "No data" },
    { label: "Instructions", score: trace?.instruction_following?.score ?? 0, reason: trace?.instruction_following?.reason ?? "No data" },
    { label: "Knowledge", score: trace?.general_knowledge?.score ?? 0, reason: trace?.general_knowledge?.reason ?? "No data" },
    { label: "Safety", score: trace?.safety?.score ?? 0, reason: trace?.safety?.reason ?? "No data" },
    { label: "Hallucination", score: trace?.hallucination?.score ?? 0, reason: trace?.hallucination?.reason ?? "No data" },
  ];

  return (
    <div className="bg-white p-8 border border-zinc-100 shadow-sm space-y-6">
      <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-blue flex items-center gap-2 border-b border-zinc-50 pb-4">
        <ClipboardCheck className="w-4 h-4" /> Evidence Reasoning Trace
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {items.map((item, i) => (
          <div key={i} className={`p-4 border flex flex-col gap-2 transition-all hover:scale-[1.02] ${getHeatmapColor(item.score)}`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              <span className="text-[10px] font-mono font-bold">{item.score}/100</span>
            </div>
            <p className="text-[9px] leading-relaxed italic opacity-80">&quot;{item.reason}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
