"use client";
import React from "react";
import type { CompareSession } from "./types";
import { motion } from "framer-motion";

interface ScoreTrendProps { session: CompareSession; colorA: string; colorB: string; }

export default function ScoreTrend({ session, colorA, colorB }: ScoreTrendProps) {
  const trials = session.trials.filter(t => t.verdict);
  if (trials.length === 0) return null;
  const maxScore = 100;
  const W = 300, H = 100, pad = 10;

  const getX = (i: number) => pad + (i / Math.max(trials.length - 1, 1)) * (W - pad * 2);
  const getY = (val: number) => H - pad - ((val / maxScore) * (H - pad * 2));

  const pathA = trials.map((t, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(t.verdict!.model_a_score)}`).join(" ");
  const pathB = trials.map((t, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(t.verdict!.model_b_score)}`).join(" ");

  return (
    <div className="bg-white p-5 border border-zinc-100 shadow-sm space-y-3">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Score Trend</h5>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0, 25, 50, 75, 100].map(v => <line key={v} x1={pad} y1={getY(v)} x2={W - pad} y2={getY(v)} stroke="#f0f0f0" strokeWidth="1" />)}
        <path d={pathA} fill="none" stroke={colorA} strokeWidth="2.5" />
        <path d={pathB} fill="none" stroke={colorB} strokeWidth="2.5" strokeDasharray="6 3" />
        {trials.map((t, i) => <React.Fragment key={i}><circle cx={getX(i)} cy={getY(t.verdict!.model_a_score)} r="3" fill={colorA} /><circle cx={getX(i)} cy={getY(t.verdict!.model_b_score)} r="3" fill={colorB} /></React.Fragment>)}
      </svg>
    </div>
  );
}
