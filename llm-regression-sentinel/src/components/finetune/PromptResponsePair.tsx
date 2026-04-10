"use client";
import React from "react";
import { ArrowRight, Cpu } from "lucide-react";

interface PromptResponsePairProps {
  prompt: string;
  response: string;
}

export default function PromptResponsePair({ prompt, response }: PromptResponsePairProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3 h-3 text-zinc-300" />
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">Forensic Input</p>
        </div>
        <div className="p-6 bg-zinc-50/50 border border-zinc-100 font-mono text-[11px] text-zinc-600 leading-relaxed min-h-[120px] italic">
          &quot;{prompt}&quot;
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-indigo-blue">
          <Cpu className="w-3 h-3" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Model Inference</p>
        </div>
        <div className="p-6 bg-indigo-blue/[0.02] border border-indigo-blue/10 font-mono text-[11px] text-charcoal font-bold leading-relaxed min-h-[120px]">
          {response}
        </div>
      </div>
    </div>
  );
}
