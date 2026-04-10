"use client";
import React from "react";
import { X, Minimize2 } from "lucide-react";

interface FullscreenWrapperProps {
  isFullscreen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function FullscreenWrapper({ isFullscreen, onClose, children, title }: FullscreenWrapperProps) {
  if (!isFullscreen) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFA] overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal">
          {title || "Forensic Lab"} — Full Screen Mode
        </span>
        <button onClick={onClose} className="px-4 py-2 bg-charcoal text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-red transition-all">
          <Minimize2 className="w-3 h-3" /> Exit Fullscreen
        </button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}
