"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ClipboardList, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

const mockSuites = [
  { id: "arithmetic_v1", domain: "Arithmetic", count: 2 },
  { id: "code_v1", domain: "Code Generation", count: 5 },
  { id: "logic_v1", domain: "Logical Reasoning", count: 3 },
  { id: "instruction_v1", domain: "Instruction Following", count: 4 }
];

export default function EvalDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const runEval = async () => {
    setIsRunning(true);
    try {
      const response = await fetch("/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseResponses: {}, // Optional: Add actual model outputs here
          fineTunedResponses: {}
        })
      });
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Evaluation failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="py-32 bg-white px-8 border-t border-charcoal/5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-red mb-6">Execution Phase</h2>
            <h3 className="text-3xl md:text-5xl font-black text-charcoal mb-8">Model Audit Workbench</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              Trigger automated regression suites via the **Prometheus Audit Engine**. Sentinel validates model responses against institutional logic benchmarks.
            </p>
          </div>
          <button 
            onClick={runEval}
            disabled={isRunning}
            className="flex items-center gap-3 px-10 py-5 bg-orange-red text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-orange-red/20"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 fill-current text-white" />}
            {isRunning ? "Verifying..." : "Initialize Audit Engine"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-charcoal/5 border border-charcoal/5 shadow-2xl shadow-charcoal/5">
          {/* Settings / Suites */}
          <div className="lg:col-span-1 bg-white p-10">
            <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Verification Suites</h3>
            <div className="space-y-4">
              {mockSuites.map((suite) => (
                <div key={suite.id} className="p-5 bg-zinc-50 border border-charcoal/5 flex justify-between items-center group hover:border-indigo-blue/30 transition-all cursor-pointer">
                  <div>
                    <h4 className="text-charcoal font-bold text-xs uppercase tracking-widest">{suite.domain}</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">{suite.count} Vectors Loaded</p>
                  </div>
                  <ClipboardList className="w-4 h-4 text-zinc-200 group-hover:text-indigo-blue transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2 min-h-[500px] bg-white p-10 relative border-l border-charcoal/5">
            <AnimatePresence mode="wait">
              {!report && !isRunning && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col h-full items-center justify-center text-center py-20"
                >
                  <div className="w-12 h-12 border border-dashed border-charcoal/10 flex items-center justify-center mb-10">
                    <ClipboardList className="w-5 h-5 text-zinc-200" />
                  </div>
                  <h4 className="text-charcoal font-bold text-sm uppercase tracking-widest mb-3">Awaiting Initialization</h4>
                  <p className="text-zinc-400 text-xs max-w-xs leading-relaxed uppercase tracking-wider">Select suites and trigger the verification pipeline to generate audit data.</p>
                </motion.div>
              )}

              {isRunning && (
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="flex flex-col h-full items-center justify-center text-center py-20"
                >
                  <div className="relative mb-12">
                    <div className="w-16 h-16 border-2 border-orange-red/10 border-t-orange-red animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-orange-red font-bold text-xs font-serif italic">Π</span>
                    </div>
                  </div>
                  <p className="text-orange-red font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Orchestrating Audit Pipeline...</p>
                </motion.div>
              )}

              {report && !isRunning && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-charcoal/5 border border-charcoal/5">
                    <SummaryStat icon={<CheckCircle2 className="w-4 h-4 text-indigo-blue" />} label="Stability" value={report.summary.improvements} />
                    <SummaryStat icon={<AlertCircle className="w-4 h-4 text-orange-red" />} label="Regression" value={report.summary.regressions} />
                    <SummaryStat icon={<RefreshCw className="w-4 h-4 text-zinc-300" />} label="Confidence" value={report.summary.status} />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Delta Log Feed</h4>
                    <div className="space-y-2">
                      {report.cases.map((cs: any) => (
                        <div key={cs.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-charcoal/5 hover:bg-zinc-100 transition-colors">
                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-zinc-300 tracking-widest uppercase">{cs.id}</span>
                            <span className="text-[11px] text-charcoal font-bold uppercase tracking-wider">{cs.domain}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className={`text-[10px] font-black px-3 py-1 border ${
                              cs.status === 'regression' ? 'border-orange-red/30 text-orange-red bg-orange-red/5' : 
                              cs.status === 'improved' ? 'border-indigo-blue/30 text-indigo-blue bg-indigo-blue/5' : 
                              'border-zinc-200 text-zinc-400'
                            }`}>
                              Δ {cs.delta > 0 ? "+" : ""}{cs.delta}
                            </span>
                            <ArrowRight className="w-3 h-3 text-zinc-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-10 bg-white">
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-black">{label}</span>
      </div>
      <div className="text-3xl font-black text-charcoal">{value}</div>
    </div>
  );
}
