"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { CompareSession } from "./types";

interface ScoreboardProps { session: CompareSession; colorA: string; colorB: string; }

export default function Scoreboard({ session, colorA, colorB }: ScoreboardProps) {
  const s = session.summary;
  if (!s) return null;
  const labelA = session.model_a_id.split("/").pop() || "Model A";
  const labelB = session.model_b_id.split("/").pop() || "Model B";
  const total = s.model_a_wins + s.model_b_wins + s.ties;

  return (
    <div className="bg-white border border-zinc-100 shadow-lg p-8">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" /> Final Scoreboard
      </h4>
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-4xl font-black" style={{ color: colorA }}>{s.model_a_wins}</motion.div>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{labelA} Wins</p>
          <p className="text-[10px] font-mono font-bold text-zinc-500">Avg: {s.model_a_avg.toFixed(1)}</p>
        </div>
        <div className="space-y-2 border-x border-zinc-100 px-6">
          <div className="text-4xl font-black text-zinc-300">{s.ties}</div>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Draws</p>
          <p className="text-[10px] font-mono font-bold text-zinc-400">{total} rounds</p>
        </div>
        <div className="space-y-2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-4xl font-black" style={{ color: colorB }}>{s.model_b_wins}</motion.div>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{labelB} Wins</p>
          <p className="text-[10px] font-mono font-bold text-zinc-500">Avg: {s.model_b_avg.toFixed(1)}</p>
        </div>
      </div>
      {/* Win rate bar */}
      <div className="mt-6 flex h-3 overflow-hidden">
        <div style={{ width: `${(s.model_a_wins / total) * 100}%`, backgroundColor: colorA }} className="transition-all" />
        <div style={{ width: `${(s.ties / total) * 100}%` }} className="bg-zinc-200 transition-all" />
        <div style={{ width: `${(s.model_b_wins / total) * 100}%`, backgroundColor: colorB }} className="transition-all" />
      </div>
    </div>
  );
}
