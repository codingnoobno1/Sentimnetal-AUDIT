"use client";
import React from "react";
import { Loader2, Play } from "lucide-react";

interface ScaleSelectorProps {
  scale: number;
  onScaleChange: (s: number) => void;
  onRun: () => void;
  isTesting: boolean;
}

const SCALES = [1, 2, 4, 8, 16, 32];

export default function ScaleSelector({ scale, onScaleChange, onRun, isTesting }: ScaleSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-zinc-50 p-2 border border-zinc-100 shadow-inner">
      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-3">Scale</span>
      <div className="flex gap-1">
        {SCALES.map((s) => (
          <button
            key={s}
            onClick={() => onScaleChange(s)}
            className={`w-10 h-10 flex items-center justify-center border text-[10px] font-black tracking-widest transition-all ${
              scale === s
                ? "bg-orange-red border-orange-red text-white shadow-lg shadow-orange-red/20"
                : "border-zinc-200 text-zinc-400 bg-white hover:border-zinc-300"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <button
        onClick={onRun}
        disabled={isTesting}
        className="ml-2 px-8 h-10 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
      >
        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Inject
      </button>
    </div>
  );
}
