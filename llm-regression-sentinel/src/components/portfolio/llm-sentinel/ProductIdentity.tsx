"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProductIdentity() {
  return (
    <section className="py-32 bg-white relative overflow-hidden" id="product-overview">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-blue/5 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-red/5 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="bg-white p-12 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-charcoal/5 relative group">
              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-orange-red opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-blue opacity-20 group-hover:opacity-100 transition-opacity" />
              
              <Image 
                src="/llmfinetune.png" 
                alt="LLM Fine-tune" 
                width={500} 
                height={125} 
                className="h-32 md:h-40 w-auto object-contain"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-black text-charcoal mb-8 tracking-tighter uppercase leading-[0.9]">
              Forensic <span className="text-zinc-300">Auditing</span> <br />
              <span className="text-orange-red">Performance</span> Sentinel
            </h2>
            
            <div className="h-1 w-24 bg-indigo-blue mb-12 mx-auto" />
            
            <p className="text-zinc-500 text-xl font-medium leading-relaxed mb-12">
              The industry standard for LLM regression analysis and fine-tuning validation. 
              Built for modular intelligence, this sentinel platform provides deep-tissue 
              forensic auditing to ensure your models maintain peak performance 
              integrity across every iteration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { label: "Precision", desc: "6-metric high-density evaluation" },
                { label: "Reliability", desc: "Automated regression detection" },
                { label: "Institutional", desc: "Enterprise-grade audit logs" }
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-charcoal/5 rounded-xl border border-charcoal/5">
                  <span className="block text-xs font-black uppercase tracking-widest text-orange-red mb-2">{item.label}</span>
                  <p className="text-sm font-bold text-charcoal">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
