"use client";
import React from "react";
import { ArrowRight, Cpu } from "lucide-react";

interface DualResponseCardProps {
  prompt: string;
  responseA: string;
  responseB: string;
  modelALabel: string;
  modelBLabel: string;
  colorA: string;
  colorB: string;
}

export default function DualResponseCard({ prompt, responseA, responseB, modelALabel, modelBLabel, colorA, colorB }: DualResponseCardProps) {
  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div className="p-5 bg-zinc-50/80 border border-zinc-100">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-3 h-3 text-zinc-300" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Forensic Input</span>
        </div>
        <p className="font-mono text-[11px] text-zinc-600 leading-relaxed italic">&quot;{prompt}&quot;</p>
      </div>

      {/* Two responses side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-l-4 p-5 bg-white border border-zinc-100" style={{ borderLeftColor: colorA }}>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-3 h-3" style={{ color: colorA }} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: colorA }}>{modelALabel}</span>
          </div>
          <p className="font-mono text-[10.5px] text-charcoal leading-relaxed">{responseA || <span className="text-zinc-300 italic">Awaiting response...</span>}</p>
        </div>
        <div className="border-l-4 p-5 bg-white border border-zinc-100" style={{ borderLeftColor: colorB }}>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-3 h-3" style={{ color: colorB }} />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: colorB }}>{modelBLabel}</span>
          </div>
          <p className="font-mono text-[10.5px] text-charcoal leading-relaxed">{responseB || <span className="text-zinc-300 italic">Awaiting response...</span>}</p>
        </div>
      </div>
    </div>
  );
}
