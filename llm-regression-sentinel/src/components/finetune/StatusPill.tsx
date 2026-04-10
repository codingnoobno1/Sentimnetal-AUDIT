"use client";
import React from "react";

interface StatusPillProps {
  label: string;
  value: string | number;
  color?: "green" | "blue" | "orange" | "red" | "neutral";
}

const colorMap = {
  green: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  blue: "bg-indigo-blue/10 text-indigo-blue border-indigo-blue/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  neutral: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

export default function StatusPill({ label, value, color = "neutral" }: StatusPillProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-[8px] font-black uppercase tracking-widest ${colorMap[color]}`}>
      {label}: <span className="font-mono">{value}</span>
    </div>
  );
}
