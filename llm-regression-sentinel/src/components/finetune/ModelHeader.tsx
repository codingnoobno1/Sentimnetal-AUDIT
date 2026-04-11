"use client";
import React from "react";
import { ShieldCheck, Database, Loader2, RefreshCw, Download, History, Activity } from "lucide-react";
import type { HFModel } from "./types";

interface ModelHeaderProps {
  model: HFModel;
  isLocal: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isSyncing: boolean;
  savedRecords: number;
  onSyncTrace: () => void;
  onToggleLab: () => void;
  onDownload: () => void;
  onToggleFineTune?: () => void; // Support for the new MLOps suite
}

export default function ModelHeader({
  model, isLocal, isDownloading, downloadProgress, isSyncing, savedRecords,
  onSyncTrace, onToggleLab, onDownload, onToggleFineTune
}: ModelHeaderProps) {
  return (
    <div className={`p-10 border-l-[12px] flex flex-col gap-8 shadow-2xl relative overflow-hidden bg-white ${isLocal ? "border-indigo-blue" : "border-orange-red"}`}>
      {/* ... (Existing Status Badges) */}
      <div className="flex flex-wrap gap-3">
        {isDownloading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-[9px] font-black uppercase tracking-widest">
            <Loader2 className="w-3 h-3 animate-spin text-orange-red" />
            Storage Prep: {Math.round(downloadProgress)}%
          </div>
        )}
        {isSyncing && (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-blue text-white text-[9px] font-black uppercase tracking-widest">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-100 text-charcoal text-[9px] font-black uppercase tracking-widest shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Audits: <span className="text-indigo-blue">{savedRecords}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-100 text-charcoal text-[9px] font-black uppercase tracking-widest shadow-sm">
          <Database className="w-3.5 h-3.5 text-indigo-blue" /> MLOps Config
        </div>
      </div>

      {/* Model Info + Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tighter text-charcoal">
            {model.id.split("/").pop()}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] font-mono">{model.id}</p>
            <span className="h-1 w-1 bg-zinc-300 rounded-full" />
            <span className="px-2 py-0.5 bg-indigo-blue/5 border border-indigo-blue/10 text-[8px] font-black text-indigo-blue uppercase tracking-widest">
              {model.pipeline_tag || "LLM"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={onSyncTrace} className="px-6 py-4 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-zinc-50 transition-all shadow-sm">
            <History className="w-4 h-4 text-indigo-blue" /> History
          </button>
          
          {isLocal && (
            <button onClick={onToggleFineTune} className="px-6 py-4 border border-orange-red text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-orange-red/5 transition-all">
              <Activity className="w-4 h-4 text-orange-red" /> Fine-Tune
            </button>
          )}

          <button onClick={onToggleLab} className="px-8 py-4 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-orange-red transition-all shadow-xl">
            <Activity className="w-4 h-4" /> Forensic Lab
          </button>
          
          {!isLocal && (
            <button onClick={onDownload} className="px-6 py-4 border border-charcoal text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-zinc-50 transition-all">
              <Download className="w-4 h-4" /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
