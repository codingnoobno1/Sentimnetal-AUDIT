"use client";
import React from "react";
import { Gauge } from "lucide-react";
import type { TestMetrics } from "./types";

export default function TestMetricsPanel({ metrics, trialCount }: { metrics: TestMetrics; trialCount: number }) {
  const items = [
    { label: "Trials", value: trialCount, unit: "" },
    { label: "Accuracy", value: (metrics.accuracy * 100).toFixed(1), unit: "%" },
    { label: "Avg Latency", value: metrics.avg_latency_ms.toFixed(0), unit: "ms" },
    { label: "Throughput", value: metrics.throughput_qps.toFixed(2), unit: "qps" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div key={i} className="p-4 bg-white border border-zinc-100 shadow-sm text-center space-y-1">
          <span className="text-2xl font-black text-charcoal">{item.value}<span className="text-[10px] font-bold text-zinc-400 ml-1">{item.unit}</span></span>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
