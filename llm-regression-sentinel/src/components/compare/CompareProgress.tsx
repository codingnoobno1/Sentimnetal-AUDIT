"use client";
import React from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface CompareProgressProps { current: number; total: number; phase: "generating" | "evaluating" | "done"; }

export default function CompareProgress({ current, total, phase }: CompareProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="p-5 bg-white border border-zinc-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {phase !== "done" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-blue" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
            {phase === "generating" ? "Generating Responses..." : phase === "evaluating" ? "Mistral Evaluating..." : "Complete"}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-charcoal">{current}/{total}</span>
      </div>
      <div className="h-2 bg-zinc-50 overflow-hidden">
        <motion.div animate={{ width: `${pct}%` }} className="h-full bg-indigo-blue transition-all" />
      </div>
    </div>
  );
}
