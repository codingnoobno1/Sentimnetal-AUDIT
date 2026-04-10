"use client";
import React, { useState, useEffect } from "react";
import { HardDrive, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/src/lib/apiConfig";

interface ModelPickerProps {
  label: string;
  color: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ModelPicker({ label, color, selectedId, onSelect }: ModelPickerProps) {
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/models/local`, { headers: { "ngrok-skip-browser-warning": "69420" } })
      .then(r => r.json())
      .then(d => setLocalModels(d.local_models || []))
      .catch(() => {});
  }, []);

  const search = async () => {
    if (!query.trim()) return;
    try {
      const r = await fetch(`${BACKEND_URL}/api/hf/search?query=${encodeURIComponent(query)}&limit=6`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      setSearchResults(await r.json());
    } catch {}
  };

  return (
    <div className={`p-6 border-l-4 bg-white shadow-sm space-y-5`} style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color }}>{label}</h4>
        {selectedId && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600">Selected</span>
          </div>
        )}
      </div>

      {selectedId ? (
        <div className="p-4 border border-zinc-100 bg-zinc-50">
          <p className="text-xs font-black text-charcoal truncate">{selectedId.split("/").pop()}</p>
          <p className="text-[8px] font-mono text-zinc-400 mt-1">{selectedId}</p>
          <button onClick={() => onSelect("")} className="mt-3 text-[8px] font-black uppercase tracking-widest text-red-500 hover:underline">Change</button>
        </div>
      ) : (
        <>
          {/* Local Models */}
          {localModels.length > 0 && (
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <HardDrive className="w-3 h-3" /> Downloaded Models
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto">
                {localModels.map(m => (
                  <button key={m} onClick={() => onSelect(m)}
                    className="w-full text-left p-3 border border-zinc-100 hover:border-indigo-blue/30 hover:bg-indigo-blue/[0.02] transition-all text-[9px] font-bold text-charcoal truncate"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Search HuggingFace
            </span>
            <div className="flex gap-2">
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
                placeholder="e.g. TinyLlama" className="flex-1 px-3 py-2 border border-zinc-200 text-[10px] font-bold"
              />
              <button onClick={search} className="px-4 py-2 bg-charcoal text-white text-[8px] font-black uppercase tracking-widest">Go</button>
            </div>
            {searchResults.map(m => (
              <button key={m.id} onClick={() => onSelect(m.id)}
                className="w-full text-left p-3 border border-zinc-100 hover:border-indigo-blue/30 transition-all text-[9px] font-bold text-charcoal truncate"
              >
                {m.id}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
