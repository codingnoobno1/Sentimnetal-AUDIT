"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutMITR() {
  return (
    <section className="pt-40 pb-24 bg-charcoal text-white overflow-hidden relative" id="about-mitr">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-blue/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-red/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-3 py-1 bg-orange-red/10 border border-orange-red/20 rounded-full mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-red">
                Parent Organization
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
              Modular Intelligent <br />
              <span className="text-zinc-400">Tech Resources</span>
            </h2>
            
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-xl">
              MITR is a pioneering technology group dedicated to building modular, 
              scalable, and intelligent infrastructure for the next generation of 
              AI-driven enterprises. By focusing on rapid deployment and high-fidelity 
              resource management, MITR empowers organizations to master the 
              complexities of the modern digital landscape.
            </p>

            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">2026</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Innovation Frontier</span>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">Next-Gen</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Modular Systems</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-square relative flex items-center justify-center">
              {/* Decorative rings */}
              <div className="absolute inset-0 border border-zinc-800 rounded-full animate-pulse" />
              <div className="absolute inset-8 border border-zinc-800/50 rounded-full" />
              
              <div className="relative z-20 bg-white/5 backdrop-blur-3xl p-12 rounded-2xl border border-white/10 shadow-2xl">
                <Image 
                  src="/MITR Tech Logo Design.png" 
                  alt="MITR Company Logo" 
                  width={300} 
                  height={300}
                  className="object-contain"
                />
              </div>

              {/* Floaties */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 p-4 bg-indigo-blue/20 backdrop-blur-md border border-white/10 rounded-lg"
              >
                <div className="w-8 h-1 bg-orange-red rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
