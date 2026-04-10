"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Zap, Layers, Settings2 } from "lucide-react";

export default function TechnicalAdvisor({ tips }: { tips: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 bg-charcoal text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-[0.04]">
        <Lightbulb className="w-24 h-24" />
      </div>
      <h5 className="text-[9px] font-black uppercase tracking-[0.5em] text-orange-red flex items-center gap-3 mb-5">
        <Zap className="w-4 h-4 flex-shrink-0" /> Architectural Advisor
      </h5>
      <p className="text-[11px] font-mono leading-relaxed text-zinc-300 italic border-l-4 border-orange-red pl-5 relative z-10">
        &quot;{tips}&quot;
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-white/5">
        <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Recommended Layers:</span>
        {["Attention_Heads", "FFN_Blocks", "KV_Cache", "LoRA_Adapters"].map((l) => (
          <span key={l} className="px-2 py-1 bg-zinc-800 text-[7px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5 flex items-center gap-1.5">
            <Layers className="w-2.5 h-2.5" /> {l}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
