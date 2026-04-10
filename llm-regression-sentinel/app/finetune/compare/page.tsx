"use client";

import React from "react";
import Navbar from "@/src/components/portfolio/llm-sentinel/Navbar";
import CompareOrchestrator from "@/src/components/compare/CompareOrchestrator";
import { motion } from "framer-motion";
import { Swords, GitCompare, Zap } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="bg-white min-h-screen selection:bg-indigo-blue/10 selection:text-indigo-blue">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="px-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-charcoal/5 pb-12"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-[1px] bg-orange-red" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-red">Dual Model Arena</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-charcoal mb-6 leading-none">
                  Head-to-Head <span className="text-zinc-300 italic">Compare</span>
                </h1>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                  Select two models, feed them the same domain-specific prompts, and let Mistral AI
                  judge which performs better across accuracy, relevance, coherence, completeness, and safety.
                </p>
              </div>

              <div className="flex gap-12 pb-2">
                <div className="flex flex-col items-center text-center">
                  <Swords className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Blind Eval</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <GitCompare className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">5D Scoring</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Mistral Judge</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Compare Module */}
        <section className="px-8">
          <CompareOrchestrator />
        </section>
      </main>

      <footer className="py-12 border-t border-charcoal/5 bg-white px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-charcoal">
            Sentinel <span className="text-orange-red font-light italic">Compare</span>
          </span>
          <div className="text-zinc-400 text-sm font-medium">
            © 2026 Regression Sentinel Platform. Dual-model forensic comparison.
          </div>
        </div>
      </footer>
    </div>
  );
}
