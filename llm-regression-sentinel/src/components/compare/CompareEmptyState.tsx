"use client";
import React from "react";

interface CompareEmptyStateProps { message?: string; }

export default function CompareEmptyState({ message }: CompareEmptyStateProps) {
  return (
    <div className="py-20 text-center space-y-4 border border-dashed border-zinc-200 bg-zinc-50/50">
      <div className="text-5xl opacity-10">⚔️</div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">{message || "Select two models and a domain to begin comparison"}</p>
    </div>
  );
}
