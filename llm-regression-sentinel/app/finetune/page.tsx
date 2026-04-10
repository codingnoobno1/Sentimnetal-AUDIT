"use client";

import React from "react";
import Navbar from "@/src/components/portfolio/llm-sentinel/Navbar";
import ModelSelector from "@/src/components/finetune/ModelSelector";
import { motion } from "framer-motion";
import { Cpu, Zap, ShieldCheck } from "lucide-react";

export default function FineTunePage() {
  return (
    <div className="bg-white min-h-screen selection:bg-indigo-blue/10 selection:text-indigo-blue">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Header Section */}
        <section className="px-8 mb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-charcoal/5 pb-12"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-12 h-[1px] bg-orange-red" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-red">Optimization Suite</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-charcoal mb-6 leading-none">
                  Model <span className="text-zinc-300 italic">Selection</span>
                </h1>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                  Integrate your enterprise audit pipeline with foundational LLMs. 
                  Select a candidate from Hugging Face for forensic evaluation and regression testing.
                </p>
              </div>

              <div className="flex gap-12 pb-2">
                <div className="flex flex-col items-center text-center">
                  <Cpu className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Core Selection</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Low Latency</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-blue mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Audit Ready</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Selector Section */}
        <section className="px-8">
          <ModelSelector />
        </section>
      </main>

      <footer className="py-12 border-t border-charcoal/5 bg-white px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-charcoal">
              Sentinel <span className="text-orange-red font-light italic">Audit</span>
            </span>
          </div>
          <div className="text-zinc-400 text-sm font-medium">
            © 2026 Regression Sentinel Platform. Institutional grade AI auditing.
          </div>
          <div className="flex gap-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-charcoal transition-colors">Documentation</a>
            <a href="#" className="hover:text-charcoal transition-colors">API</a>
            <a href="#" className="hover:text-charcoal transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
