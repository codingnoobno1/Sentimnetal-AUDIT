"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Zap, Brain, Terminal } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white pt-20 px-8">
      {/* Background Accents (Subtle Tints) */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-blue/[0.02] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-charcoal/5" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-blue/5 border border-indigo-blue/10 text-indigo-blue text-[10px] font-black uppercase tracking-widest mb-10">
            <Zap className="w-3 h-3" />
            <span>Enterprise Model Verification</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-charcoal leading-[1.05] mb-10 tracking-tight">
            Quantify <span className="text-orange-red underline decoration-indigo-blue/20 underline-offset-8">Regression</span> in Fine-Tuned LLMs
          </h1>
          
          <p className="text-lg text-gray-500 mb-12 max-w-lg leading-relaxed">
            Protect your production reliability. Sentinel provides a clinical framework to detect capability degradation before deployment.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="px-10 py-4 bg-orange-red text-white font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-red/20">
              Initialize Audit
            </button>
            <button className="px-10 py-4 bg-white text-charcoal font-bold text-xs uppercase tracking-widest border border-charcoal/10 hover:bg-zinc-50 transition-all">
              Methodology
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative bg-white p-10 border border-charcoal/5 shadow-2xl shadow-charcoal/5">
            <div className="flex items-center justify-between mb-12 border-b border-charcoal/5 pb-6 text-zinc-400">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black">Capability Delta v1.0.4</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-red" />
                <div className="w-2 h-2 bg-indigo-blue" />
                <div className="w-2 h-2 bg-earth-brown" />
              </div>
            </div>

            <div className="space-y-8">
              <RegressionBar label="Arithmetic Precision" value={-12.4} color="bg-orange-red" />
              <RegressionBar label="Syntactic Integrity" value={-8.1} color="bg-orange-red/60" />
              <RegressionBar label="Deductive Logic" value={-15.9} color="bg-orange-red" />
              <RegressionBar label="Domain Alignment" value={+24.2} color="bg-indigo-blue" trend="up" />
            </div>

            <div className="mt-12 pt-8">
              <div className="flex items-start gap-4 p-5 bg-orange-red/5 border-l-2 border-orange-red">
                <AlertTriangle className="w-5 h-5 text-orange-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-orange-red uppercase mb-1">Critical Regression</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Significant degradation detected in core reasoning paths. Model integrity below enterprise threshold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RegressionBar({ label, value, color, trend = "down" }: { label: string, value: number, color: string, trend?: "up" | "down" }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-zinc-300 text-sm font-medium">{label}</span>
        <span className={`${color} text-sm font-mono font-bold`}>{value > 0 ? "+" : ""}{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${trend === "up" ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${Math.abs(value) * 3}%`, maxWidth: "100%" }}
        />
      </div>
    </div>
  );
}
