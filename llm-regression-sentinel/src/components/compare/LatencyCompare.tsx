"use client";
import React from "react";
import { Timer } from "lucide-react";

interface LatencyCompareProps { latA: number; latB: number; colorA: string; colorB: string; labelA: string; labelB: string; }

export default function LatencyCompare({ latA, latB, colorA, colorB, labelA, labelB }: LatencyCompareProps) {
  const max = Math.max(latA, latB, 1);
  return (
    <div className="bg-white p-5 border border-zinc-100 shadow-sm space-y-3">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2"><Timer className="w-3.5 h-3.5" /> Latency</h5>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-16 text-[8px] font-black uppercase tracking-widest truncate" style={{ color: colorA }}>{labelA}</span>
          <div className="flex-1 h-3 bg-zinc-50 overflow-hidden"><div className="h-full transition-all" style={{ width: `${(latA / max) * 100}%`, backgroundColor: colorA }} /></div>
          <span className="text-[9px] font-mono font-bold w-14 text-right" style={{ color: colorA }}>{(latA * 1000).toFixed(0)}ms</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 text-[8px] font-black uppercase tracking-widest truncate" style={{ color: colorB }}>{labelB}</span>
          <div className="flex-1 h-3 bg-zinc-50 overflow-hidden"><div className="h-full transition-all" style={{ width: `${(latB / max) * 100}%`, backgroundColor: colorB }} /></div>
          <span className="text-[9px] font-mono font-bold w-14 text-right" style={{ color: colorB }}>{(latB * 1000).toFixed(0)}ms</span>
        </div>
      </div>
    </div>
  );
}
