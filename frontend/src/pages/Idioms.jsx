import { useState, useMemo } from "react";
import { idiomsData } from "../data/idiomsData";
import { Sparkles, MessageCircle, Volume2, Languages, ChevronDown, ChevronUp, Search, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Idioms() {
  const [activePhaseKey, setActivePhaseKey] = useState(idiomsData[0].phase);
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return idiomsData;
    
    return idiomsData.map(phaseObj => {
      const matchingSentences = phaseObj.sentences.filter(s => {
        const enMatch = s.english.toLowerCase().includes(searchQuery.toLowerCase());
        const taMatch = s.tamil.includes(searchQuery);
        const exMatch = s.example ? s.example.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return enMatch || taMatch || exMatch;
      });
      return { ...phaseObj, sentences: matchingSentences };
    }).filter(phaseObj => phaseObj.sentences.length > 0);
  }, [searchQuery]);

  const togglePhase = (phaseKey) => {
    setActivePhaseKey(activePhaseKey === phaseKey ? null : phaseKey);
    // Reset translations when changing phase
    setVisibleTranslations({});
  };

  const toggleTranslation = (sIndex, phaseKey) => {
    const key = `${phaseKey}-${sIndex}`;
    setVisibleTranslations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const playAudio = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Premium Animated Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#14213D] via-[#1a2f5c] to-[#0f172a] p-8 sm:p-10 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A227] opacity-20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#3F6656] opacity-30 blur-3xl"></div>
        
        <div className="relative z-10 space-y-4 text-center sm:text-left flex flex-col items-center sm:items-start">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#e6c148] backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" /> Fluent Expressions
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            Popular Idioms
          </h1>
          <p className="max-w-xl font-sans text-base sm:text-lg text-white/70 leading-relaxed text-center sm:text-left">
            Master 100+ everyday English idioms grouped by real-life contexts. Understand their meanings with examples.
          </p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#14213D]/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // If searching, auto-expand the first result
            if (e.target.value.trim() && filteredData.length > 0) {
              setActivePhaseKey(filteredData[0].phase);
            }
          }}
          placeholder="Search for idioms in English or Tamil..."
          className="w-full bg-white/80 backdrop-blur-md border border-[#14213D]/15 rounded-2xl py-4 pl-12 pr-4 font-sans text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]/50 transition-all text-[#14213D] placeholder:text-[#14213D]/40"
        />
      </motion.div>

      {/* Accordion Layout */}
      <div className="flex flex-col gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[#14213D]/60 font-sans text-lg">No matches found for "{searchQuery}"</p>
          </div>
        ) : (
          filteredData.map((data, index) => {
            const isActive = activePhaseKey === data.phase;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={data.phase} 
                className={`rounded-3xl border ${isActive ? 'border-[#14213D]/20 shadow-xl bg-white/90 backdrop-blur-md' : 'border-[#14213D]/10 bg-white/60 backdrop-blur-sm'} transition-all duration-300 overflow-hidden`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => togglePhase(data.phase)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-[#14213D]/5 transition-colors"
                >
                  <div>
                    <h2 className={`font-display text-2xl font-extrabold ${isActive ? 'text-[#14213D]' : 'text-[#14213D]/80'}`}>
                      {data.phase}
                    </h2>
                    <p className="font-sans text-sm text-[#14213D]/60 mt-1">
                      {data.context} • {data.sentences.length} items
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-colors ${isActive ? 'bg-[#14213D] text-white' : 'bg-[#14213D]/10 text-[#14213D]'}`}>
                    {isActive ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                </button>

                {/* Accordion Content (Idioms) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 space-y-4 border-t border-[#14213D]/5 mt-2">
                        {data.sentences.map((sentenceObj, sIndex) => {
                          const transKey = `${data.phase}-${sIndex}`;
                          return (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(sIndex * 0.03, 0.3) }}
                              key={sIndex}
                              className="group relative flex flex-col gap-4 rounded-2xl border border-white/50 bg-[#F8F6F0]/80 p-5 shadow-sm hover:shadow-md hover:bg-white transition-all duration-300"
                            >
                              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b from-[#C9A227] to-[#e6c148] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3F6656]/10 text-[#3F6656]">
                                    {sentenceObj.example ? (
                                      <Quote className="h-4 w-4" />
                                    ) : (
                                      <MessageCircle className="h-4 w-4" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className="font-display text-[17px] font-bold text-[#14213D] leading-tight">
                                      {sentenceObj.english}
                                    </p>
                                    
                                    {/* Show example always if it exists */}
                                    {sentenceObj.example && (
                                      <div className="mt-2 text-[14px] text-[#14213D]/70 font-sans italic border-l-2 border-[#14213D]/10 pl-3">
                                        Eg: {sentenceObj.example}
                                      </div>
                                    )}
                                    
                                    <AnimatePresence>
                                      {visibleTranslations[transKey] && (
                                        <motion.div 
                                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="rounded-xl bg-gradient-to-r from-[#3F6656]/10 to-[#3F6656]/5 p-3 border border-[#3F6656]/10">
                                            <p className="font-sans text-[15px] font-medium text-[#2d4a3e] leading-relaxed">
                                              {sentenceObj.tamil}
                                            </p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    <button
                                      onClick={() => toggleTranslation(sIndex, data.phase)}
                                      className={`flex items-center gap-1.5 mt-3 text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                                        visibleTranslations[transKey] 
                                        ? "bg-[#14213D]/10 text-[#14213D]" 
                                        : "bg-[#C9A227]/15 text-[#8C6D13] hover:bg-[#C9A227]/25"
                                      }`}
                                    >
                                      <Languages className="h-3.5 w-3.5" />
                                      {visibleTranslations[transKey] ? "Hide Translation" : "View in Tamil"}
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => playAudio(sentenceObj.english + (sentenceObj.example ? ". " + sentenceObj.example : ""))}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#14213D]/10 text-[#14213D]/60 hover:bg-[#C9A227] hover:border-transparent hover:text-white shadow-sm transition-all duration-300"
                                  title="Listen to Native Audio"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
