"use client";
import React from "react";
import { motion } from "framer-motion";
import type { MistralVerdict } from "./types";

interface DimensionRadarProps {
  verdict: MistralVerdict;
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
}

export default function DimensionRadar({ verdict, colorA, colorB, labelA, labelB }: DimensionRadarProps) {
  const dims = verdict.dimensions;
  const params = [
    { key: "accuracy", label: "ACC" },
    { key: "relevance", label: "REL" },
    { key: "coherence", label: "COH" },
    { key: "completeness", label: "CMP" },
    { key: "safety", label: "SAF" },
  ];

  const C = 80, R = 60, N = params.length;
  const getPoint = (i: number, val: number) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    const r = (val / 100) * R;
    return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
  };

  const polyA = params.map((p, i) => { const pt = getPoint(i, (dims as any)[p.key]?.a ?? 0); return `${pt.x},${pt.y}`; }).join(" ");
  const polyB = params.map((p, i) => { const pt = getPoint(i, (dims as any)[p.key]?.b ?? 0); return `${pt.x},${pt.y}`; }).join(" ");

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm text-center">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Dimension Overlay</h5>
      <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
        {[25, 50, 75, 100].map(ring => (
          <polygon key={ring} points={params.map((_, i) => { const pt = getPoint(i, ring); return `${pt.x},${pt.y}`; }).join(" ")}
            fill="none" stroke="#f0f0f0" strokeWidth="1" />
        ))}
        {params.map((_, i) => { const pt = getPoint(i, 100); return <line key={i} x1={C} y1={C} x2={pt.x} y2={pt.y} stroke="#e5e5e5" strokeWidth="0.5" />; })}
        <polygon points={polyA} fill={`${colorA}22`} stroke={colorA} strokeWidth="2" />
        <polygon points={polyB} fill={`${colorB}22`} stroke={colorB} strokeWidth="2" strokeDasharray="4 2" />
        {params.map((p, i) => { const pt = getPoint(i, 115); return <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" className="text-[6px] font-black fill-zinc-400 uppercase">{p.label}</text>; })}
      </svg>
      <div className="flex justify-center gap-6 mt-3">
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest" style={{ color: colorA }}>
          <span className="w-3 h-0.5" style={{ backgroundColor: colorA }} /> {labelA}
        </span>
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest" style={{ color: colorB }}>
          <span className="w-3 h-0.5 border-b-2 border-dashed" style={{ borderColor: colorB }} /> {labelB}
        </span>
      </div>
    </div>
  );
}
