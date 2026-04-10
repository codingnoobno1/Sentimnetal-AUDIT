"use client";
import React from "react";
import { motion } from "framer-motion";
import type { ForensicTrace } from "./types";
import { getHeatmapHex } from "./utils/heatmap";

/** Radar chart for 7 forensic parameters */
export default function ForensicRadar({ trace }: { trace: ForensicTrace }) {
  const params = [
    { key: "arithmetic", label: "ARITH" },
    { key: "logic", label: "LOGIC" },
    { key: "code_generation", label: "CODE" },
    { key: "instruction_following", label: "INSTR" },
    { key: "general_knowledge", label: "KNOW" },
    { key: "safety", label: "SAFE" },
    { key: "hallucination", label: "HALLU" },
  ];

  const C = 80, R = 60, N = params.length;

  const getPoint = (i: number, value: number) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    const r = (value / 100) * R;
    return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
  };

  const polygon = params.map((p, i) => {
    const score = (trace as any)?.[p.key]?.score ?? 0;
    const pt = getPoint(i, score);
    return `${pt.x},${pt.y}`;
  }).join(" ");

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Cognitive Radar</h5>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Grid rings */}
        {[25, 50, 75, 100].map((ring) => (
          <polygon key={ring}
            points={params.map((_, i) => { const pt = getPoint(i, ring); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none" stroke="#f0f0f0" strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {params.map((_, i) => {
          const pt = getPoint(i, 100);
          return <line key={i} x1={C} y1={C} x2={pt.x} y2={pt.y} stroke="#e5e5e5" strokeWidth="0.5" />;
        })}
        {/* Data polygon */}
        <polygon points={polygon} fill="rgba(46,49,146,0.15)" stroke="#2e3192" strokeWidth="2" />
        {/* Data dots */}
        {params.map((p, i) => {
          const score = (trace as any)?.[p.key]?.score ?? 0;
          const pt = getPoint(i, score);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={getHeatmapHex(score)} />;
        })}
        {/* Labels */}
        {params.map((p, i) => {
          const pt = getPoint(i, 115);
          return (
            <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
              className="text-[6px] font-black fill-zinc-400 uppercase"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
