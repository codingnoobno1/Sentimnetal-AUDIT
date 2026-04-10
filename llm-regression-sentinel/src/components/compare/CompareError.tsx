"use client";
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompareErrorProps { error: string | null; onDismiss: () => void; }

export default function CompareError({ error, onDismiss }: CompareErrorProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-red-50 border border-red-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-[10px] font-bold text-red-600">{error}</span></div>
          <button onClick={onDismiss} className="p-1 hover:bg-red-100"><X className="w-4 h-4 text-red-400" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
