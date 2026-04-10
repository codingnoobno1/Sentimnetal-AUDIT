"use client";
import React from "react";
import { Trophy, Equal } from "lucide-react";
import { motion } from "framer-motion";
import type { MistralVerdict } from "./types";

interface VerdictBannerProps {
  verdict: MistralVerdict;
  modelALabel: string;
  modelBLabel: string;
  colorA: string;
  colorB: string;
}

export default function VerdictBanner({ verdict, modelALabel, modelBLabel, colorA, colorB }: VerdictBannerProps) {
  const winner = verdict.winner === "model_a" ? modelALabel : verdict.winner === "model_b" ? modelBLabel : "Tie";
  const winnerColor = verdict.winner === "model_a" ? colorA : verdict.winner === "model_b" ? colorB : "#71717A";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="p-5 border-2 flex items-center gap-6 bg-white shadow-lg" style={{ borderColor: winnerColor }}
    >
      <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: winnerColor }}>
        {verdict.winner === "tie" ? <Equal className="w-5 h-5 text-white" /> : <Trophy className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 space-y-1">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Mistral Verdict</span>
        <p className="text-lg font-black tracking-tight" style={{ color: winnerColor }}>
          {verdict.winner === "tie" ? "Draw — Both models performed equally" : `${winner} Wins This Round`}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <span className="text-2xl font-black" style={{ color: colorA }}>{verdict.model_a_score}</span>
          <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{modelALabel}</p>
        </div>
        <span className="text-zinc-200 text-xl font-light">vs</span>
        <div className="text-center">
          <span className="text-2xl font-black" style={{ color: colorB }}>{verdict.model_b_score}</span>
          <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{modelBLabel}</p>
        </div>
      </div>
    </motion.div>
  );
}
