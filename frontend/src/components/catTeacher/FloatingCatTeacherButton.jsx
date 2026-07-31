import React from "react";
import { motion } from "framer-motion";
import CuteCatAvatar from "./CuteCatAvatar";

export default function FloatingCatTeacherButton({ onClick }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 p-2 pr-5 rounded-full shadow-2xl border-2 border-white cursor-pointer select-none"
    >
      <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner">
        <CuteCatAvatar state="LEVEL_PASSED" size={48} />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-black text-white tracking-wide flex items-center gap-1">
          Cat AI Teacher 🐾
        </span>
        <span className="text-[10px] font-bold text-white/90">
          Tap to practice voice
        </span>
      </div>

      {/* Floating Sparkle Pulse */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border border-white"></span>
      </span>
    </motion.button>
  );
}
