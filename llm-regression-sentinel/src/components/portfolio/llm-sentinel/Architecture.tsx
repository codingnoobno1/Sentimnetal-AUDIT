"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Globe, Server, Database, Share2, ArrowRight } from "lucide-react";

export default function Architecture() {
  return (
    <section id="architecture" className="py-32 bg-white px-8 border-t border-charcoal/5">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-24 text-left">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-blue mb-6">Infrastructure Schema</h2>
          <h3 className="text-3xl md:text-5xl font-black text-charcoal mb-8">System Orchestration</h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            A high-performance, stateless auditing pipeline designed for massive-scale model verification in production environments.
          </p>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-px bg-charcoal/5 border border-charcoal/5 mb-32">
          <ArchCard icon={<Globe />} title="Frontend" subtitle="Forensic UI" color="text-indigo-blue" />
          <ArchCard icon={<Server />} title="Backend" subtitle="FastAPI Core" color="text-indigo-blue" />
          <ArchCard icon={<Cpu />} title="Eval Engine" subtitle="Prometheus L1" color="text-charcoal" />
          <ArchCard icon={<Database />} title="Model API" subtitle="Vector Sync" color="text-zinc-300" />
          <ArchCard icon={<Share2 />} title="Reg. Detector" subtitle="Delta Compute" color="text-orange-red" />
        </div>

        {/* Data Flow */}
        <div className="p-12 bg-zinc-50 border border-charcoal/5 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-1.5 h-1.5 bg-orange-red" />
            <h3 className="text-xs font-black text-charcoal uppercase tracking-[0.3em]">Stateless Verification Pipeline</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <FlowStep count="1" title="Vector Input" desc="Identifier Payload" />
            <Arrow />
            <FlowStep count="2" title="Distribution" desc="Orchestrated Dispatch" />
            <Arrow />
            <FlowStep count="3" title="Collection" desc="Stateless Resync" />
            <Arrow />
            <FlowStep count="4" title="Scoring" desc="Prometheus Audit" />
            <Arrow />
            <FlowStep count="5" title="Quant" desc="Delta Finalization" />
          </div>

          <div className="mt-16 flex justify-start">
            <div className="px-6 py-2 border border-orange-red/30 bg-orange-red/5 text-orange-red text-[10px] font-black uppercase tracking-widest">
              Output: Signed Capability Forensics Report
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchCard({ icon, title, subtitle, color }: { icon: React.ReactNode, title: string, subtitle: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 bg-white text-center flex flex-col items-center gap-4 transition-all"
    >
      <div className={`p-3 rounded-full bg-zinc-50 ${color}`}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
          className: "w-6 h-6" 
        })}
      </div>
      <div>
        <h4 className="text-charcoal font-bold text-sm mb-1">{title}</h4>
        <p className="text-[10px] text-zinc-400 leading-tight uppercase tracking-wider font-bold">{subtitle}</p>
      </div>
    </motion.div>
  );
}

function FlowStep({ count, title, desc }: { count: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-12 h-12 rounded-full bg-indigo-blue/5 border border-indigo-blue/10 flex items-center justify-center text-indigo-blue font-bold mb-4 group-hover:bg-indigo-blue group-hover:text-white transition-all">
        {count}
      </div>
      <h5 className="text-charcoal font-bold text-sm mb-1 uppercase tracking-wider">{title}</h5>
      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{desc}</p>
    </div>
  );
}

function Arrow() {
  return <ArrowRight className="hidden md:block w-5 h-5 text-zinc-700 mx-2" />;
}
