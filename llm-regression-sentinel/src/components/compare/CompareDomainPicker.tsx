"use client";
import React, { useState, useEffect } from "react";
import { Layers, Stethoscope, Scale, Landmark, MessageSquare, ShoppingBag, Globe2 } from "lucide-react";
import { BACKEND_URL } from "@/src/lib/apiConfig";

interface CompareDomainPickerProps {
  selected: string;
  onSelect: (d: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  clinical: <Stethoscope className="w-3.5 h-3.5" />,
  legal: <Scale className="w-3.5 h-3.5" />,
  ca_commerce: <Landmark className="w-3.5 h-3.5" />,
  natural_language: <MessageSquare className="w-3.5 h-3.5" />,
  product_reviews: <ShoppingBag className="w-3.5 h-3.5" />,
  social_media: <Globe2 className="w-3.5 h-3.5" />,
};

export default function CompareDomainPicker({ selected, onSelect }: CompareDomainPickerProps) {
  const [domains, setDomains] = useState<{id: string; label: string; prompt_count: number}[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/testing/domains`, { headers: { "ngrok-skip-browser-warning": "69420" } })
      .then(r => r.json())
      .then(d => setDomains(d.domains || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3 p-6 bg-white border border-zinc-100 shadow-sm">
      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5" /> Select Evaluation Domain
      </h4>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSelect("all")}
          className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            selected === "all" ? "bg-charcoal text-white border-charcoal" : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <Globe2 className="w-3 h-3" /> All
        </button>
        {domains.map(d => (
          <button key={d.id} onClick={() => onSelect(d.id)}
            className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              selected === d.id ? "bg-indigo-blue text-white border-indigo-blue" : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {ICONS[d.id] || <Layers className="w-3 h-3" />} {d.label}
            <span className="text-[7px] opacity-60">({d.prompt_count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
