"use client";
import React from "react";

interface ScorePillProps { scoreA: number; scoreB: number; colorA: string; colorB: string; }

export default function ScorePill({ scoreA, scoreB, colorA, colorB }: ScorePillProps) {
  return (
    <div className="inline-flex items-center border border-zinc-200 overflow-hidden">
      <span className="px-3 py-1.5 text-[10px] font-black text-white" style={{ backgroundColor: colorA }}>{scoreA}</span>
      <span className="px-2 py-1.5 text-[8px] font-bold text-zinc-300 bg-zinc-50">vs</span>
      <span className="px-3 py-1.5 text-[10px] font-black text-white" style={{ backgroundColor: colorB }}>{scoreB}</span>
    </div>
  );
}
