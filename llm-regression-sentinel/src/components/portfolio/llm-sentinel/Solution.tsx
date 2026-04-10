"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Code, Calculator, Boxes, ArrowRightLeft, Search } from "lucide-react";

const capabilities = [
  {
    icon: <Calculator className="w-6 h-6" />,
    title: "Arithmetic",
    desc: "Exact match validation for mathematical precision across complex operations."
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Code Generation",
    desc: "Execution-based testing to ensure syntactical and logical integrity of code."
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Logical Reasoning",
    desc: "Structured validation of non-linear thinking and consistent deduction."
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Instruction Follow",
    desc: "Constraint-based scoring for strict adherence to complex system prompts."
  }
];

export default function Solution() {
  return (
    <section id="solution" className="py-32 bg-white px-8 border-t border-charcoal/5 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[10px] font-black font-mono uppercase tracking-[0.5em] text-indigo-blue mb-8">Solution Suite</h2>
            <h3 className="text-3xl md:text-5xl font-black text-charcoal mb-10 tracking-tight">
              Clinical <span className="text-orange-red italic">Validation</span>
            </h3>
            <p className="text-gray-500 text-lg mb-16 leading-relaxed">
              Sentinel employs a range of deterministic, domain-specific evaluation engines to verify that model fine-tuning does not compromise multi-domain intelligence.
            </p>

            <div className="space-y-10">
              <FeatureItem title="Capability Forensics" desc="Bit-level side-by-side analysis of stochastic variations." />
              <FeatureItem title="Regression Quant" desc="Mathematical detection of logic and reasoning deltas." />
              <FeatureItem title="Infrastructure Audit" desc="Deployment-ready validation for mission-critical systems." />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-charcoal/5 border border-charcoal/5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-10 bg-white hover:bg-zinc-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-indigo-blue/10 flex items-center justify-center text-indigo-blue mb-8 group-hover:bg-orange-red group-hover:text-white transition-all">
                  {React.isValidElement(cap.icon) && React.cloneElement(cap.icon as React.ReactElement<{ className?: string }>, { 
                    className: "w-5 h-5" 
                  })}
                </div>
                <h3 className="text-sm font-bold text-charcoal mb-3 uppercase tracking-widest">{cap.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
      </div>
      <div>
        <h4 className="text-white font-semibold">{title}</h4>
        <p className="text-sm text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}
