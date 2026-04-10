"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-white/90 backdrop-blur-md border-b border-charcoal/5 shadow-sm"
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-4 group">
          <Image 
            src="/llmfinetune.png" 
            alt="LLM Fine-tune Logo" 
            width={140} 
            height={35} 
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Infrastructure by</span>
            <Image 
              src="/MITR Tech Logo Design.png" 
              alt="MITR" 
              width={30} 
              height={12} 
              className="h-2.5 w-auto grayscale brightness-0"
            />
          </div>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        <a href="#problem" className="hover:text-charcoal transition-colors">Forensics</a>
        <a href="#solution" className="hover:text-charcoal transition-colors">Methodology</a>
        <a href="#architecture" className="hover:text-charcoal transition-colors">Infrastructure</a>
        <a href="#scoring" className="hover:text-charcoal transition-colors">Quantification</a>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/audit"
          className="hidden lg:block px-5 py-2 text-[9px] font-black uppercase tracking-widest text-[#2e3192] border border-[#2e3192]/20 hover:bg-[#2e3192]/5 transition-all text-center"
        >
          Fine tune score check
        </Link>
        <button className="px-5 py-2 text-[9px] font-black uppercase tracking-widest text-white bg-orange-red hover:bg-orange-600 transition-all">
          Request Demo
        </button>
        <button className="p-2 md:hidden text-zinc-400">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </motion.nav>
  );
}
