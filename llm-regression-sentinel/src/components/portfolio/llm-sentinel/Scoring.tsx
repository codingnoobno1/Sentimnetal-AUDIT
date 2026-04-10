"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calculator, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Scoring() {
  return (
    <section id="scoring" className="py-32 bg-white border-t border-charcoal/5 px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-24">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-blue mb-6">Quantification Logic</h2>
          <h3 className="text-3xl md:text-5xl font-black text-charcoal mb-10 tracking-tight">Deterministic Forensics</h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Eliminate subjectivity. Sentinel uses domain-specific, execution-based validation to ensure model outputs adhere to institutional benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Formula Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 border border-charcoal/5 bg-zinc-50 relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calculator className="w-32 h-32 text-indigo-blue" />
            </div>
            
            <h3 className="text-sm font-bold text-charcoal mb-10 uppercase tracking-widest flex items-center gap-3">
              The Delta Formula <span className="text-orange-red font-serif italic text-2xl">Δ</span>
            </h3>
            
            <div className="bg-white p-8 border border-charcoal/5 mb-12 shadow-sm">
              <code className="text-3xl text-charcoal font-mono tracking-tighter">Δ = F(m) – B(m)</code>
              <p className="mt-4 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Where F is fine-tuned and B is base model performance.</p>
            </div>

            <div className="space-y-px bg-charcoal/5 border border-charcoal/5">
              <Threshold 
                range="Δ < -10.0" 
                label="CRITICAL REGRESSION" 
                color="text-orange-red" 
                bg="bg-white"
                icon={<TrendingDown className="w-3 h-3" />}
              />
              <Threshold 
                range="-10.0 ≤ Δ ≤ +5.0" 
                label="STABLE VARIANCE" 
                color="text-zinc-400" 
                bg="bg-white"
                icon={<Minus className="w-3 h-3" />}
              />
              <Threshold 
                range="Δ > +5.0" 
                label="VERIFIED IMPROVEMENT" 
                color="text-indigo-blue" 
                bg="bg-white"
                icon={<TrendingUp className="w-3 h-3" />}
              />
            </div>
          </motion.div>

          {/* Metrics List */}
          <div className="space-y-6">
            <MetricItem 
              title="Arithmetic" 
              metric="Exact Match" 
              desc="Mathematical operations must yield identical results across base and variant."
            />
            <MetricItem 
              title="Code" 
              metric="Execution-based" 
              desc="Generated code is unit-tested in a sandbox to verify functional parity."
            />
            <MetricItem 
              title="Logic" 
              metric="Structured Validation" 
              desc="Deductive reasoning steps are analyzed for consistency and valid conclusions."
            />
            <MetricItem 
              title="Instruction" 
              metric="Constraint-based" 
              desc="Scoring the model's ability to respect negative constraints and formatting rules."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Threshold({ range, label, color, bg, icon }: { range: string, label: string, color: string, bg: string, icon: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between p-4 ${bg} border border-charcoal/5`}>
      <span className="text-charcoal font-mono font-bold">{range}</span>
      <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${color}`}>
        {icon}
        {label}
      </div>
    </div>
  );
}

function MetricItem({ title, metric, desc }: { title: string, metric: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-white border border-charcoal/5 hover:bg-zinc-50 transition-colors shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-charcoal font-black uppercase text-xs tracking-wider">{title}</h4>
        <span className="px-3 py-1 bg-indigo-blue/5 text-[10px] text-indigo-blue uppercase font-black">{metric}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
