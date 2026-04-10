"use client";
import React from "react";
import { Bookmark } from "lucide-react";

interface ExpectedAnswerProps { expected: string; }

export default function ExpectedAnswer({ expected }: ExpectedAnswerProps) {
  return (
    <div className="p-4 bg-amber-50/50 border border-amber-200/30">
      <div className="flex items-center gap-2 mb-2">
        <Bookmark className="w-3 h-3 text-amber-500" />
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-600">Expected Answer</span>
      </div>
      <p className="text-[10px] font-mono text-amber-800/70 leading-relaxed italic">&quot;{expected}&quot;</p>
    </div>
  );
}
