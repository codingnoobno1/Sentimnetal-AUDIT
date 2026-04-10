"use client";
import React from "react";
import { Zap } from "lucide-react";
import type { ForensicTrace } from "./types";

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];

export default function ForensicPieChart({ trace }: { trace: ForensicTrace }) {
  const data = [
    { label: "Arithmetic", val: trace?.arithmetic?.score ?? 0 },
    { label: "Logic", val: trace?.logic?.score ?? 0 },
    { label: "Code Gen", val: trace?.code_generation?.score ?? 0 },
    { label: "Instructions", val: trace?.instruction_following?.score ?? 0 },
    { label: "Knowledge", val: trace?.general_knowledge?.score ?? 0 },
    { label: "Safety", val: trace?.safety?.score ?? 0 },
    { label: "Hallucination", val: trace?.hallucination?.score ?? 0 },
  ].map((d, i) => ({ ...d, color: PIE_COLORS[i] }));

  const total = data.reduce((acc, d) => acc + d.val, 0) || 1;
  const avg = Math.round(total / data.length);
  let cumAngle = 0;
  const R = 70, C = 85;

  return (
    <div className="flex flex-col items-center gap-5 bg-white p-6 border border-zinc-100 shadow-sm">
      <div className="relative">
        <svg width="170" height="170" viewBox="0 0 170 170">
          {data.map((slice, i) => {
            if (slice.val <= 0) return null;
            const angle = (slice.val / total) * 360;
            const s = cumAngle, e = cumAngle + angle;
            cumAngle += angle;
            const sr = (s - 90) * (Math.PI / 180), er = (e - 90) * (Math.PI / 180);
            const x1 = C + R * Math.cos(sr), y1 = C + R * Math.sin(sr);
            const x2 = C + R * Math.cos(er), y2 = C + R * Math.sin(er);
            return (
              <path key={i} d={`M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
                fill={slice.color} stroke="#fff" strokeWidth="2.5"
                className="hover:opacity-75 transition-opacity cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-charcoal">{avg}</span>
          <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Avg Score</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[8px] font-black uppercase tracking-widest">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-zinc-500 truncate">{d.label}</span>
            <span className="ml-auto text-charcoal font-mono">{Math.round(d.val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
