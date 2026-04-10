"use client";
import React from "react";

interface TrialIndexBadgeProps { index: number; domain: string; difficulty: string; }

const DIFF_COLORS: Record<string, string> = { easy: "bg-emerald-100 text-emerald-700", medium: "bg-amber-100 text-amber-700", hard: "bg-red-100 text-red-700" };

export default function TrialIndexBadge({ index, domain, difficulty }: TrialIndexBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center text-sm font-black">{String(index + 1).padStart(2, "0")}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">{domain.replace("_", " ")}</span>
        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 w-fit ${DIFF_COLORS[difficulty] || "bg-zinc-100 text-zinc-500"}`}>{difficulty}</span>
      </div>
    </div>
  );
}
