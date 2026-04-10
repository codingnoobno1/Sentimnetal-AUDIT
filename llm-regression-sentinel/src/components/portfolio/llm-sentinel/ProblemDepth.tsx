"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";

export default function ProblemDepth() {
  return (
    <section id="problem" className="py-32 bg-white border-t border-charcoal/5 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-24">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-red mb-6">Gap Analysis</h2>
          <h3 className="text-3xl md:text-5xl font-black text-charcoal mb-8">The Blind Spot in Development</h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Catastrophic forgetting is a known phenomenon, but the persistent failure of enterprise teams is the lack of detection infrastructure during the fine-tuning phase.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-charcoal/5 border border-charcoal/5">
          {/* Current Workflow */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-white relative group"
          >
            <div className="flex items-center gap-3 mb-10">
              <ShieldAlert className="w-4 h-4 text-orange-red" />
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Legacy Workflow</h3>
            </div>

            <div className="space-y-8 mb-16">
              <WorkflowStep status="completed" label="Domain Specific Adaptation" />
              <WorkflowStep status="completed" label="Targeted Validation" />
              <WorkflowStep status="danger" label="Blind Deployment" note="Critical Failure Point: Cross-domain regression audit missing" />
            </div>

            <div className="pt-10 border-t border-charcoal/5">
              <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-6 font-mono">Production Risks</h4>
              <ul className="space-y-4">
                <ImpactItem text="Regression-driven production failures" />
                <ImpactItem text="Unverified model logic degradation" />
                <ImpactItem text="Systemic loss of institutional trust" />
              </ul>
            </div>
          </motion.div>

          {/* Sentinel Workflow */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 bg-white relative group border-l border-charcoal/5"
          >
            <div className="flex items-center gap-3 mb-10">
              <CheckCircle2 className="w-4 h-4 text-indigo-blue" />
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Sentinel Framework</h3>
            </div>

            <div className="space-y-8 mb-16">
              <WorkflowStep status="completed" label="Domain Specific Adaptation" />
              <WorkflowStep status="sentinel" label="Automated Regression Audit" note="Full spectrum capability verification" />
              <WorkflowStep status="success" label="Certified Deployment" note="Verification signature attached" />
            </div>

            <div className="pt-10 border-t border-charcoal/5">
              <h4 className="text-[10px] font-black text-indigo-blue uppercase tracking-widest mb-6 font-mono">Outcome Benefits</h4>
              <ul className="space-y-4">
                <OutcomeItem text="Zero-day regression containment" />
                <OutcomeItem text="Standardized safety metrics" />
                <OutcomeItem text="Verifiable model confidence scores" />
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({ label, status, note }: { label: string, status: "completed" | "danger" | "success" | "sentinel", note?: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          status === "completed" ? "bg-zinc-700" : 
          status === "danger" ? "bg-red-500/20 border border-red-500" :
          status === "sentinel" ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" :
          "bg-emerald-500"
        }`}>
          {status === "completed" && <div className="w-2 h-2 rounded-full bg-zinc-400" />}
          {status === "danger" && <XCircle className="w-5 h-5 text-red-500" />}
          {status === "sentinel" && <ShieldAlert className="w-5 h-5 text-white" />}
          {status === "success" && <CheckCircle2 className="w-5 h-5 text-white" />}
        </div>
        <div className="w-[2px] h-full bg-zinc-800 m-1" />
      </div>
      <div>
        <p className={`font-semibold ${status === "danger" ? "text-red-400" : status === "sentinel" ? "text-blue-400" : "text-zinc-300"}`}>{label}</p>
        {note && <p className="text-xs text-zinc-500 mt-1">{note}</p>}
      </div>
    </div>
  );
}

function ImpactItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-zinc-400">
      <div className="w-1.5 h-1.5 rounded-full bg-red-900" />
      {text}
    </li>
  );
}

function OutcomeItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-blue-200/70">
      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
      {text}
    </li>
  );
}
