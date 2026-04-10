"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle2 } from 'lucide-react';

interface RubricOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  rubricItems: string[];
}

export default function RubricOverlay({ isOpen, onClose, domain, rubricItems }: RubricOverlayProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 bg-charcoal/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 200 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 200 }}
          className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-red" />

          {/* Header */}
          <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-red/10 rounded-sm">
                <Info className="w-5 h-5 text-orange-red" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Prometheus Evaluation</p>
                <h2 className="text-xl font-bold text-charcoal tracking-tighter uppercase">{domain} Rubric</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div>
              <p className="text-[11px] font-bold text-charcoal/60 uppercase tracking-widest mb-6">Evaluation Criteria</p>
              <div className="space-y-6">
                {rubricItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-zinc-50 border border-zinc-100 group hover:border-orange-red/20 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[13px] font-medium text-charcoal leading-relaxed">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-blue/5 p-6 border border-indigo-blue/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-blue mb-3">Institutional Protocol</h4>
              <p className="text-[11px] font-medium text-indigo-blue/70 leading-relaxed">
                This rubric is dynamically injected into the multi-judge ensemble. Evaluation scores are normalized across Llama 3 and Mixtral nodes to ensure forensic objectivity.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-zinc-100">
            <button
              onClick={onClose}
              className="w-full py-4 text-[11px] font-black uppercase tracking-[0.3em] bg-charcoal text-white hover:bg-zinc-800 transition-all shadow-lg"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
