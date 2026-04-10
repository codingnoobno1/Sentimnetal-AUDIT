"use client";
import React from "react";
import { ChevronDown, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SMALL_MODELS } from "@/src/lib/apiConfig";

interface PresetDropdownProps {
  isOpen: boolean;
  toggle: () => void;
  onSelect: (id: string) => void;
  localModels: string[];
}

export default function PresetDropdown({ isOpen, toggle, onSelect, localModels }: PresetDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="h-full px-8 py-5 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-4 hover:bg-zinc-800 transition-all shadow-lg"
      >
        Preset Nodes
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-zinc-100 shadow-2xl z-50 p-2"
          >
            {SMALL_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className="w-full text-left p-4 hover:bg-zinc-50 flex items-center justify-between gap-2 group transition-colors border-b border-zinc-50 last:border-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-charcoal group-hover:text-indigo-blue uppercase tracking-widest">
                    {m.label}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-300 tracking-wide">{m.id}</span>
                </div>
                {localModels.includes(m.id) && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-blue/5 border border-indigo-blue/10">
                    <HardDrive className="w-3 h-3 text-indigo-blue" />
                    <span className="text-[7px] font-black text-indigo-blue uppercase tracking-widest">Local</span>
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
