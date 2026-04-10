"use client";
import React from "react";
import { Shield } from "lucide-react";

interface WinStreakProps { trials: { winner: string }[]; colorA: string; colorB: string; }

export default function WinStreak({ trials, colorA, colorB }: WinStreakProps) {
  return (
    <div className="bg-white p-5 border border-zinc-100 shadow-sm space-y-3">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Round-by-Round</h5>
      <div className="flex gap-1">
        {trials.map((t, i) => (
          <div key={i} className="flex-1 h-8 flex items-center justify-center text-[7px] font-black text-white uppercase tracking-widest"
            style={{ backgroundColor: t.winner === "model_a" ? colorA : t.winner === "model_b" ? colorB : "#d4d4d8" }}>
            {t.winner === "tie" ? "=" : t.winner === "model_a" ? "A" : "B"}
          </div>
        ))}
      </div>
    </div>
  );
}
