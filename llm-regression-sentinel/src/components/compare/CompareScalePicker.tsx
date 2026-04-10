"use client";
import React from "react";
import { Play, Loader2 } from "lucide-react";

interface CompareScalePickerProps { scale: number; onScale: (n: number) => void; onRun: () => void; running: boolean; disabled: boolean; }

const SCALES = [1, 2, 4, 8, 16];

export default function CompareScalePicker({ scale, onScale, onRun, running, disabled }: CompareScalePickerProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-white border border-zinc-100 shadow-sm">
      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 px-2">Rounds</span>
      {SCALES.map(s => (
        <button key={s} onClick={() => onScale(s)} className={`w-9 h-9 flex items-center justify-center border text-[10px] font-black transition-all ${scale === s ? "bg-orange-red border-orange-red text-white shadow-lg shadow-orange-red/20" : "border-zinc-200 text-zinc-400 bg-white hover:border-zinc-300"}`}>{s}</button>
      ))}
      <button onClick={onRun} disabled={running || disabled}
        className="ml-2 px-8 h-9 bg-charcoal text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl disabled:opacity-40 active:scale-95 transition-all"
      >
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        Compare
      </button>
    </div>
  );
}
