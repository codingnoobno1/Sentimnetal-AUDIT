"use client";
import React from "react";
import { Microscope } from "lucide-react";

interface TrialHeaderProps {
  index: number;
  promptId: string;
  latency: number;
  onAudit: () => void;
}

export default function TrialHeader({ index, promptId, latency, onAudit }: TrialHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 bg-zinc-900 text-white flex items-center justify-center text-sm font-black">{String(index + 1).padStart(2, "0")}</div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">{promptId}</span>
          <span className="text-[10px] font-mono font-bold text-indigo-blue">{(latency * 1000).toFixed(0)}ms</span>
        </div>
      </div>
      <button onClick={onAudit} className="px-6 py-3 bg-indigo-blue text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] transition-all shadow-lg">
        <Microscope className="w-4 h-4" /> Audit
      </button>
    </div>
  );
}
