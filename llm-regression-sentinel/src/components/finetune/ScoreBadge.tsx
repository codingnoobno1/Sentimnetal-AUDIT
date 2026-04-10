"use client";
import React from "react";
import { getScoreBadgeClass, getScoreLabel } from "./utils/heatmap";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, label, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[7px]",
    md: "px-3 py-1 text-[8px]",
    lg: "px-4 py-1.5 text-[10px]",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-black uppercase tracking-widest ${getScoreBadgeClass(score)} ${sizeClasses[size]}`}>
      {label || getScoreLabel(score)} · {score}
    </span>
  );
}
