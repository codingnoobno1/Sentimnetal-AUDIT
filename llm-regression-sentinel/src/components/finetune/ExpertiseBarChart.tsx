"use client";
import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Scale, Stethoscope, Landmark, GraduationCap } from "lucide-react";
import { getHeatmapHex, getScoreLabel } from "./utils/heatmap";
import type { SpecializedExpertise } from "./types";

export default function ExpertiseBarChart({ expertise }: { expertise: SpecializedExpertise }) {
  const bars = [
    { label: "Legal", score: expertise?.legal?.score ?? 0, reason: expertise?.legal?.reason ?? "", icon: <Scale className="w-3.5 h-3.5" /> },
    { label: "Clinical", score: expertise?.clinical?.score ?? 0, reason: expertise?.clinical?.reason ?? "", icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { label: "Finance", score: expertise?.ca?.score ?? 0, reason: expertise?.ca?.reason ?? "", icon: <Landmark className="w-3.5 h-3.5" /> },
    { label: "Teaching", score: expertise?.teaching?.score ?? 0, reason: expertise?.teaching?.reason ?? "", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-white p-6 border border-zinc-100 shadow-sm w-full space-y-5">
      <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" /> Domain Expertise
      </h5>
      <div className="space-y-4">
        {bars.map((bar, i) => (
          <div key={i} className="space-y-1.5 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-charcoal">
                {bar.icon} {bar.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: getHeatmapHex(bar.score) }}>
                  {getScoreLabel(bar.score)}
                </span>
                <span className="text-[10px] font-mono font-bold" style={{ color: getHeatmapHex(bar.score) }}>
                  {bar.score}%
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-zinc-50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                className="h-full"
                style={{ backgroundColor: getHeatmapHex(bar.score) }}
              />
            </div>
            {bar.reason && (
              <p className="text-[8px] text-zinc-400 italic truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
