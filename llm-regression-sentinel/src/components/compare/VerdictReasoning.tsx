"use client";
import React from "react";
import { MessageSquare } from "lucide-react";

interface VerdictReasoningProps { reasoning: string; }

export default function VerdictReasoning({ reasoning }: VerdictReasoningProps) {
  return (
    <div className="p-6 bg-charcoal text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-[0.03]"><MessageSquare className="w-24 h-24" /></div>
      <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-red mb-4 flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" /> Mistral Comparative Analysis
      </h5>
      <p className="text-[11px] font-mono leading-relaxed text-zinc-300 italic border-l-4 border-orange-red pl-5 relative z-10">
        &quot;{reasoning}&quot;
      </p>
    </div>
  );
}
