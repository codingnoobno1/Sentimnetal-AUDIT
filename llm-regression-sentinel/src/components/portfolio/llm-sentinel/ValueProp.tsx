"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Zap, BarChart3, ArrowRight } from "lucide-react";

export default function ValueProp() {
  return (
    <section className="py-40 bg-white border-t border-charcoal/5 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="inline-flex p-4 bg-indigo-blue text-white mb-10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-charcoal mb-12 uppercase tracking-tighter">
            What gets measured, <span className="text-orange-red underline decoration-indigo-blue/10 underline-offset-[12px]">gets fixed.</span>
          </h2>
          <p className="text-gray-400 text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Standardizing the audit layer for fine-tuned intelligence. Secure your model baseline with quantified verification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-charcoal/5 border border-charcoal/5 mb-32">
          <ValueCard 
            icon={<Zap className="w-4 h-4" />}
            title="Pre-deploy Audit"
            desc="Identify logic failures before production orchestration."
          />
          <ValueCard 
            icon={<BarChart3 className="w-4 h-4" />}
            title="Forensic Data"
            desc="Institutional metrics to justify model adaptation."
          />
          <ValueCard 
            icon={<CheckCircle2 className="w-4 h-4" />}
            title="Baseline Safety"
            desc="Preserve core cognitive paths during specialization."
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <button className="px-16 py-6 bg-orange-red text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-orange-600 transition-all group flex items-center gap-4 mx-auto shadow-2xl shadow-orange-red/20">
            Initialize Audit Request
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-12 text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">
            Institutional Grade Verification Infrastructure
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-10 bg-white text-left group">
      <div className="w-10 h-10 bg-indigo-blue/10 flex items-center justify-center text-indigo-blue mb-8 group-hover:bg-orange-red group-hover:text-white transition-all">
        {icon}
      </div>
      <h4 className="text-sm font-black text-charcoal mb-4 uppercase tracking-widest">{title}</h4>
      <p className="text-xs text-gray-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
