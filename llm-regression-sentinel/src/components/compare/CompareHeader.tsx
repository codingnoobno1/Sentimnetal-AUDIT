"use client";
import React from "react";
import { Swords } from "lucide-react";

interface CompareHeaderProps { modelA: string; modelB: string; colorA: string; colorB: string; }

export default function CompareHeader({ modelA, modelB, colorA, colorB }: CompareHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-8 py-6 bg-white border border-zinc-100 shadow-sm">
      <div className="text-right">
        <p className="text-xl font-black tracking-tight" style={{ color: colorA }}>{modelA.split("/").pop()}</p>
        <p className="text-[8px] font-mono text-zinc-400">{modelA}</p>
      </div>
      <div className="w-14 h-14 bg-charcoal rounded-full flex items-center justify-center shadow-xl">
        <Swords className="w-6 h-6 text-orange-red" />
      </div>
      <div className="text-left">
        <p className="text-xl font-black tracking-tight" style={{ color: colorB }}>{modelB.split("/").pop()}</p>
        <p className="text-[8px] font-mono text-zinc-400">{modelB}</p>
      </div>
    </div>
  );
}
