"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = "Processing..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"
        >
          <Loader2 className="w-12 h-12 text-indigo-blue animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
