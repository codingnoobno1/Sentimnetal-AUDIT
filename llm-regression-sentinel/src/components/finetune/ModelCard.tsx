"use client";
import React from "react";
import { motion } from "framer-motion";
import { Globe, Database, Heart, Download as DLIcon } from "lucide-react";
import { HfModel } from "@/src/models";

interface ModelCardProps {
  model: HfModel;
  onClick: () => void;
  isLocal: boolean;
}

export default function ModelCard({ model, onClick, isLocal }: ModelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="p-8 border border-zinc-200 bg-white hover:border-indigo-blue transition-all cursor-pointer group shadow-sm hover:shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-zinc-50 to-transparent rounded-full translate-x-10 translate-y-[-10px] group-hover:scale-125 transition-transform duration-500" />
      
      {isLocal && (
        <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-indigo-blue text-white text-[7px] font-black uppercase tracking-widest">
          Local
        </div>
      )}

      <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em] mb-4 block relative z-10">
        {model.author || "Forensic Hub"}
      </span>
      <h4 className="text-xl font-black text-charcoal truncate mb-2 group-hover:text-indigo-blue relative z-10 tracking-tight">
        {model.id.split("/").pop()}
      </h4>
      <p className="text-[8px] font-mono text-zinc-300 truncate mb-6 relative z-10">{model.id}</p>

      <div className="flex items-center justify-between relative z-10 border-t border-zinc-50 pt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-400">
            <DLIcon className="w-3 h-3" /> {(model.downloads / 1000).toFixed(0)}k
          </span>
          <span className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-400">
            <Heart className="w-3 h-3" /> {model.likes}
          </span>
        </div>
        <span className="text-[9px] font-black text-zinc-400 flex items-center gap-2 tracking-[0.2em]">
          <Globe className="w-3 h-3" /> HF
        </span>
      </div>
    </motion.div>
  );
}
