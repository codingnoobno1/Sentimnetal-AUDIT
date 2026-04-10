"use client";

import React from 'react';
import { Database, Zap, Binary, MessageSquare } from 'lucide-react';

interface DatasetProfile {
  percent_code: number;
  percent_reasoning: number;
  percent_chat: number;
  percent_factual: number;
  total_samples?: number;
}

export default function DatasetFingerprint({ profile }: { profile: DatasetProfile }) {
  const categories = [
    { label: 'Code', value: profile.percent_code, color: 'bg-emerald-500', icon: <Binary className="w-3 h-3" /> },
    { label: 'Reasoning', value: profile.percent_reasoning, color: 'bg-indigo-blue', icon: <Zap className="w-3 h-3" /> },
    { label: 'Factuality', value: profile.percent_factual, color: 'bg-orange-red', icon: <Database className="w-3 h-3" /> },
    { label: 'Chat', value: profile.percent_chat, color: 'bg-zinc-400', icon: <MessageSquare className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-white border border-charcoal/5 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Dataset Fingerprint</h4>
        <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest">
          {profile.total_samples?.toLocaleString() || "N/A"} SAMPLES
        </span>
      </div>

      <div className="flex w-full h-8 border border-zinc-50 overflow-hidden shadow-inner">
        {categories.map((cat, i) => (
          <div
            key={i}
            style={{ width: `${cat.value}%` }}
            className={`${cat.color} h-full transition-all duration-500 hover:brightness-110 relative group`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
              <span className="text-[8px] font-black text-white">{cat.value}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-6 pt-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`p-1.5 rounded-sm ${cat.color} bg-opacity-10`}>
              {React.cloneElement(cat.icon as React.ReactElement, { className: `w-3 h-3 ${cat.color.replace('bg-', 'text-')}` })}
            </div>
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter leading-none mb-1">{cat.label}</p>
              <p className="text-[11px] font-black text-charcoal leading-none whitespace-nowrap">{cat.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
