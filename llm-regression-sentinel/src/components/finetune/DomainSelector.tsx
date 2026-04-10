"use client";
import React, { useState, useEffect } from "react";
import { Stethoscope, Scale, Landmark, GraduationCap, MessageSquare, ShoppingBag, Globe2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "@/src/lib/apiConfig";

interface Domain {
  id: string;
  label: string;
  prompt_count: number;
}

interface DomainSelectorProps {
  selectedDomain: string;
  onSelect: (domain: string) => void;
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  clinical: <Stethoscope className="w-4 h-4" />,
  legal: <Scale className="w-4 h-4" />,
  ca_commerce: <Landmark className="w-4 h-4" />,
  natural_language: <MessageSquare className="w-4 h-4" />,
  product_reviews: <ShoppingBag className="w-4 h-4" />,
  social_media: <Globe2 className="w-4 h-4" />,
};

const DOMAIN_COLORS: Record<string, string> = {
  clinical: "border-emerald-500 bg-emerald-500/5 text-emerald-700",
  legal: "border-indigo-500 bg-indigo-500/5 text-indigo-700",
  ca_commerce: "border-amber-500 bg-amber-500/5 text-amber-700",
  natural_language: "border-violet-500 bg-violet-500/5 text-violet-700",
  product_reviews: "border-pink-500 bg-pink-500/5 text-pink-700",
  social_media: "border-cyan-500 bg-cyan-500/5 text-cyan-700",
};

export default function DomainSelector({ selectedDomain, onSelect }: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [totalPrompts, setTotalPrompts] = useState(0);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const r = await fetch(`${BACKEND_URL}/api/testing/domains`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });
        if (r.ok) {
          const data = await r.json();
          setDomains(data.domains || []);
          setTotalPrompts(data.total_prompts || 0);
        }
      } catch {
        console.error("Failed to fetch domains");
      }
    };
    fetchDomains();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-2">
          <Layers className="w-3 h-3" /> Prompt Domain
        </h5>
        <span className="text-[8px] font-mono text-zinc-300">{totalPrompts} total prompts</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* All domains option */}
        <button
          onClick={() => onSelect("all")}
          className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            selectedDomain === "all"
              ? "bg-charcoal text-white border-charcoal shadow-lg"
              : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <Globe2 className="w-3 h-3" /> All Domains
        </button>

        {/* Individual domain buttons */}
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`px-4 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              selectedDomain === d.id
                ? `${DOMAIN_COLORS[d.id] || "border-charcoal bg-charcoal/5 text-charcoal"} shadow-lg border-2`
                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {DOMAIN_ICONS[d.id] || <Layers className="w-3 h-3" />}
            {d.label}
            <span className={`ml-1 px-1.5 py-0.5 text-[7px] rounded-sm ${
              selectedDomain === d.id ? "bg-white/30" : "bg-zinc-100"
            }`}>
              {d.prompt_count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
