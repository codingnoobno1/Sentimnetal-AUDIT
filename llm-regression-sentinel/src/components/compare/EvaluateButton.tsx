"use client";
import React from "react";
import { Microscope } from "lucide-react";

interface EvaluateButtonProps { onClick: () => void; loading: boolean; }

export default function EvaluateButton({ onClick, loading }: EvaluateButtonProps) {
  return (
    <button onClick={onClick} disabled={loading}
      className="px-6 py-3 bg-indigo-blue text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg disabled:opacity-40"
    >
      <Microscope className="w-4 h-4" /> {loading ? "Evaluating..." : "Run Mistral Eval"}
    </button>
  );
}
