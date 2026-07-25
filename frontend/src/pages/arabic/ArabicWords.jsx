import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Lock, Play, ChevronRight, Eye, EyeOff, Volume2 } from 'lucide-react';

function ArabicWordCard({ word, index, isCompleted, isInProgress, isLocked, onInteract }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div className={`group relative flex flex-col p-5 bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden h-full ${
      isInProgress ? "border-[#C9A227] ring-2 ring-[#C9A227]/30" : 
      isCompleted ? "border-emerald-500/30 bg-emerald-50/30" : 
      "border-[#14213D]/10"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
      
      {/* Top action/status bar */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isInProgress && <Play className="w-4 h-4 text-[#C9A227] animate-pulse" />}
          {isLocked && <Lock className="w-4 h-4 text-[#14213D]/40" />}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInteract(); }}
          disabled={isLocked}
          className={`p-1.5 rounded-xl shadow-sm border transition-all z-10 hover:scale-110 active:scale-95 ${
            isLocked ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50" : "bg-[#14213D]/5 border-[#14213D]/5 hover:bg-[#C9A227]/10 hover:border-[#C9A227]/20"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isLocked ? "text-gray-400" : "text-[#14213D]/60 hover:text-[#C9A227]"}`} />
        </button>
      </div>

      <div className="flex-1">
        <span className="text-[22px] font-bold font-sans leading-[1.7] tracking-wide text-[#14213D] mb-3 pr-2 flex items-start gap-2 break-words">
          <span className={isLocked ? "blur-[2px] opacity-70" : ""}>{word.arabic}</span>
        </span>
        
        <div className={`flex flex-wrap gap-2 mb-5 ${isLocked ? "opacity-50" : ""}`}>
          <span className="font-mono text-[11px] font-medium bg-[#14213D]/5 border border-[#14213D]/10 text-[#14213D]/70 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-[#14213D]/10">
            {word.transliteration}
          </span>
        </div>
      </div>

      <div className="mt-auto border-t border-[#14213D]/5 pt-4">
        {!revealed ? (
          <button 
            onClick={() => !isLocked && setRevealed(true)}
            disabled={isLocked}
            className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold tracking-wide rounded-xl transition-all ${
              isLocked 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "text-[#14213D]/60 bg-[#14213D]/5 hover:bg-[#14213D]/10 hover:text-[#14213D]"
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
            {isLocked ? "Locked" : "View Translation"}
          </button>
        ) : (
          <div 
            onClick={() => setRevealed(false)} 
            className="flex flex-col gap-1.5 cursor-pointer group/reveal p-3 -mx-3 -mb-3 rounded-xl hover:bg-[#14213D]/5 transition-colors relative"
          >
            <div className="flex justify-between items-start pr-8">
              <div className="flex flex-col gap-1">
                <span className="font-sans font-bold text-sm text-[#14213D] leading-tight">
                  {word.meaning_english}
                </span>
                {word.meaning_tamil && (
                  <span className="font-sans text-xs font-medium text-[#14213D]/60">
                    {word.meaning_tamil}
                  </span>
                )}
              </div>
            </div>
            <EyeOff className="w-3.5 h-3.5 text-[#14213D]/40 absolute right-3 top-3 opacity-0 group-hover/reveal:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArabicWords({ data, progress, handleInteraction }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activePart, setActivePart] = useState(null);

  if (!data || !data.modules) return null;

  // View 1: Module Selection
  if (activeModule === null) {
    return (
      <div className="space-y-6 pt-4 animate-fade-in">
        <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#0ea5e9]" /> Vocabulary Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.modules.map((mod, idx) => {
            const modProgress = progress.words || 0; // Using global words progress
            const isCompleted = modProgress >= mod.total_words;
            const isLocked = idx > 0 && (progress.words || 0) < data.modules[idx-1].total_words;
            
            return (
              <button
                key={mod.module}
                disabled={isLocked}
                onClick={() => setActiveModule(idx)}
                className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 text-left ${
                  isLocked 
                    ? "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed" 
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50 hover:shadow-md"
                    : "border-[#0ea5e9]/30 bg-[#0ea5e9]/5 shadow-sm hover:shadow-md hover:border-[#0ea5e9]/50"
                }`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <div className={`p-3 rounded-2xl ${isLocked ? "bg-gray-200" : isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-[#0ea5e9]/20 text-[#0ea5e9]"}`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  {isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : 
                   isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                   <span className="text-xs font-bold text-[#0ea5e9] bg-[#0ea5e9]/10 px-3 py-1 rounded-full">In Progress</span>}
                </div>
                <h4 className="font-display text-xl font-bold text-[#14213D] mb-1">Module {mod.module}</h4>
                <p className="text-sm font-medium text-[#14213D]/60 mb-4">{mod.category}</p>
                <div className="w-full flex justify-between items-center text-xs font-bold text-[#14213D]/50 bg-white/50 px-3 py-2 rounded-xl">
                  <span>{mod.total_words} Words</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    );
  }

  const moduleData = data.modules[activeModule];

  // View 2: Parts Selection
  if (activePart === null) {
    const partsCount = Math.ceil(moduleData.words.length / 10);
    return (
      <div className="space-y-6 pt-4 animate-fade-in">
        <button 
          onClick={() => setActiveModule(null)}
          className="flex items-center gap-2 text-sm font-bold text-[#14213D]/60 hover:text-[#14213D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10 w-fit"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
        </button>
        
        <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
          Module {moduleData.module}: {moduleData.category}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: partsCount }).map((_, i) => {
            const startIdx = i * 10;
            const endIdx = Math.min((i + 1) * 10, moduleData.words.length);
            const partName = `Part ${i + 1} (${startIdx + 1}-${endIdx})`;
            const isLocked = (progress.words || 0) < startIdx;
            const isCompleted = (progress.words || 0) >= endIdx;
            const isInProgress = !isLocked && !isCompleted;
            
            return (
              <button
                key={partName}
                disabled={isLocked}
                onClick={() => setActivePart(i)}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                  isLocked 
                    ? "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed" 
                    : isInProgress
                    ? "border-[#C9A227] bg-[#C9A227]/10 shadow-lg"
                    : "border-emerald-500/30 bg-emerald-50/50 hover:shadow-md"
                }`}
              >
                <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-gray-400" : isInProgress ? "text-[#C9A227]" : "text-emerald-500"}`} />
                <span className={`font-display text-lg font-bold ${isLocked ? "text-gray-500" : "text-[#14213D]"}`}>{partName}</span>
                <div className="mt-3">
                  {isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : 
                   isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                   <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/20 px-3 py-1 rounded-full">In Progress</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // View 3: Cards
  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      <button 
        onClick={() => setActivePart(null)}
        className="flex items-center gap-2 text-sm font-bold text-[#14213D]/60 hover:text-[#14213D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10 w-fit"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
      </button>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#0ea5e9]" /> Part {activePart + 1}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moduleData.words.slice(activePart * 10, (activePart + 1) * 10).map((word, relIdx) => {
           const globalIdx = (activePart * 10) + relIdx;
           const isCompleted = globalIdx < (progress.words || 0);
           const isInProgress = globalIdx === (progress.words || 0);
           const isLocked = globalIdx > (progress.words || 0);
           return (
             <ArabicWordCard 
               key={word.id} 
               word={word} 
               index={globalIdx}
               isCompleted={isCompleted}
               isInProgress={isInProgress}
               isLocked={isLocked}
               onInteract={() => handleInteraction('words', globalIdx, word.arabic)} 
             />
           );
        })}
      </div>
    </div>
  );
}
