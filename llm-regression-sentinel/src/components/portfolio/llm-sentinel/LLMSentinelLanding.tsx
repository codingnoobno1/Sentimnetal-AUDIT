"use client";

import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemDepth from "./ProblemDepth";
import Solution from "./Solution";
import Architecture from "./Architecture";
import Scoring from "./Scoring";
import ValueProp from "./ValueProp";
import EvalDashboard from "./EvalDashboard";
import AnalyticsHeatmap from "./AnalyticsHeatmap";
import AboutMITR from "./AboutMITR";
import ProductIdentity from "./ProductIdentity";

export default function LLMSentinelLanding() {
  return (
    <div className="bg-white min-h-screen selection:bg-indigo-blue/10 selection:text-indigo-blue">
      <Navbar />
      <main>
        <AboutMITR />
        <Hero />
        <ProductIdentity />
        <div id="problem-anchor">
          <ProblemDepth />
        </div>
        <Solution />
        <EvalDashboard />
        <AnalyticsHeatmap />
        <Architecture />
        <Scoring />
        <ValueProp />
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
