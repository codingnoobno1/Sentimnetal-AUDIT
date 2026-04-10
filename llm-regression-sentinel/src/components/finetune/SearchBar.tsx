"use client";
import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ query, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex-1 relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-blue transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder="Search Hugging Face models..."
        className="block w-full pl-12 pr-4 py-5 bg-white border border-zinc-200 rounded-none text-charcoal focus:ring-0 focus:border-indigo-blue transition-all placeholder:text-zinc-300 text-[11px] font-black uppercase tracking-widest shadow-sm"
      />
    </div>
  );
}
