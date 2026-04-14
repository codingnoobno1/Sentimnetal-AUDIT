"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Shield, Brain, Activity, Zap, Layers, ChevronRight, Info } from "lucide-react";
import { BACKEND_URL } from "@/src/lib/apiConfig";
import { getHeatmapColor, getScoreLabel } from "./utils/heatmap";
import { motion } from "framer-motion";

interface AggregateData {
  model_id: string;
  total_records: number;
  domains: {
    domain: string;
    avg_score: number;
    total_audits: number;
    last_active: number;
  }[];
  forensic_parameters: {
    avg_logic: number;
    avg_hallucination: number;
    avg_safety: number;
    avg_instruction: number;
    avg_arithmetic: number;
  };
  timeline: {
    timestamp: number;
    score: number;
    domain: string;
  }[];
}

interface ForensicIntelligenceGridProps {
  modelId: string;
}

export default function ForensicIntelligenceGrid({ modelId }: ForensicIntelligenceGridProps) {
  const [data, setData] = useState<AggregateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const r = await fetch(`${BACKEND_URL}/api/testing/aggregate/${encodeURIComponent(modelId)}`, {
          headers: { "ngrok-skip-browser-warning": "69420" }
        });
        if (r.ok) {
          setData(await r.json());
        }
      } catch (e) {
        console.error("Aggregation fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [modelId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-blue/10 border-t-indigo-blue rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Synthesizing MongoDB Records...</p>
      </div>
    );
  }

  if (!data || data.domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
        <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center rounded-full border border-zinc-100">
          <Layers className="w-8 h-8 text-zinc-300" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal">Insufficient Forensic History</p>
          <p className="text-xs text-zinc-400 max-w-[280px]">Run more audits to generate an in-depth capability profile.</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Logic', A: data.forensic_parameters.avg_logic, fullMark: 100 },
    { subject: 'Honesty', A: data.forensic_parameters.avg_hallucination, fullMark: 100 },
    { subject: 'Safety', A: data.forensic_parameters.avg_safety, fullMark: 100 },
    { subject: 'Instruction', A: data.forensic_parameters.avg_instruction, fullMark: 100 },
    { subject: 'Math', A: data.forensic_parameters.avg_arithmetic, fullMark: 100 },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Audits", value: data.total_records, icon: Shield },
          { label: "Mean Accuracy", value: `${(data.domains.reduce((a, b) => a + b.avg_score, 0) / data.domains.length).toFixed(1)}%`, icon: Activity },
          { label: "Stability Index", value: "High", icon: Zap },
          { label: "Forensic Trust", value: "Level 4", icon: Brain }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-100 p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-charcoal">{stat.value}</p>
            </div>
            <stat.icon className="w-5 h-5 text-indigo-blue opacity-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Heatmap Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-red rounded-full" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal">Domain Expertise Heatmap</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.domains.map((domain, i) => (
              <div key={i} className={`p-6 border transition-all hover:scale-[1.02] ${getHeatmapColor(domain.avg_score)}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60 truncate max-w-[100px]">{domain.domain}</span>
                  <Info className="w-3 h-3 opacity-30 cursor-help" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter">{domain.avg_score.toFixed(0)}</span>
                  <span className="text-[10px] font-bold opacity-60">SCORE</span>
                </div>
                <div className="mt-4 pt-4 border-t border-current/10 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-wider">{getScoreLabel(domain.avg_score)}</span>
                  <span className="text-[8px] font-bold opacity-40">{domain.total_audits} audits</span>
                </div>
              </div>
            ))}
          </div>

          {/* Regression Timeline */}
          <div className="space-y-6 pt-10">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <div className="w-2 h-2 bg-indigo-blue rounded-full" />
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal">Regression Stability Timeline</h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", border: "none", color: "#fff", fontSize: "10px" }}
                    labelStyle={{ display: "none" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#4F46E5" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Global Forensic Parameters */}
        <div className="lg:col-span-4 bg-zinc-900 p-8 flex flex-col items-center justify-center text-white relative">
          <div className="absolute top-8 left-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Global Profile</h3>
            <p className="text-xs font-black tracking-tight text-white/40">Aggregated Forensic Markers</p>
          </div>
          
          <div className="w-full h-[350px] mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#FFFFFF20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#FFFFFF60", fontSize: 10, fontWeight: 700 }} />
                <Radar
                   name="Capability"
                   dataKey="A"
                   stroke="#FFFFFF"
                   fill="#FFFFFF"
                   fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-4 mt-8">
            {radarData.map((d, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">{d.subject}</span>
                  <span className={d.A >= 80 ? 'text-emerald-400' : d.A >= 50 ? 'text-amber-400' : 'text-red-400'}>{d.A.toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-white/5 w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${d.A}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${d.A >= 80 ? 'bg-emerald-500' : d.A >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
