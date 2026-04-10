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
  
  const confidencePercent = (verdict.confidence || 0.95) * 100;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="p-5 border-2 flex items-center gap-6 bg-white shadow-lg relative overflow-hidden" style={{ borderColor: winnerColor }}
    >
      {/* Background Confidence Slant */}
      <div 
        className="absolute top-0 right-0 h-full bg-zinc-50 transition-all duration-1000" 
        style={{ width: `${100 - confidencePercent}%`, opacity: 0.5 }}
      />

      <div className="w-12 h-12 flex items-center justify-center relative z-10" style={{ backgroundColor: winnerColor }}>
        {verdict.winner === "tie" ? <Equal className="w-5 h-5 text-white" /> : <Trophy className="w-5 h-5 text-white" />}
      </div>
      
      <div className="flex-1 space-y-1 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Forensic Verdict</span>
          {verdict.meta?.judges_used && verdict.meta.judges_used > 1 && (
            <span className="text-[7px] font-black uppercase bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm">
              Ensemble: {verdict.meta.judges_used} Judges
            </span>
          )}
        </div>
        <p className="text-lg font-black tracking-tight" style={{ color: winnerColor }}>
          {verdict.winner === "tie" ? "Draw — Both models performed equally" : `${winner} Wins This Round`}
        </p>
      </div>

      <div className="flex items-center gap-8 relative z-10">
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

        <div className="h-10 w-px bg-zinc-100" />

        <div className="text-right">
          <div className="flex flex-col items-end">
             <span className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Confidence</span>
             <span className={`text-xs font-black ${confidencePercent > 80 ? 'text-emerald-500' : 'text-orange-red'}`}>
               {confidencePercent.toFixed(0)}%
             </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
