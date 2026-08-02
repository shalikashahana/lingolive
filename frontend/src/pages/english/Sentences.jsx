import { useState, useMemo } from "react";
import { sentencesData } from "../../data/sentencesData";
import { Sparkles, MessageCircle, Volume2, Languages, ChevronDown, ChevronUp, Search, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CatVoiceCheckpoint from "../../components/catTeacher/CatVoiceCheckpoint";

export default function Sentences() {
  const [activePhaseKey, setActivePhaseKey] = useState(sentencesData[0].phase);
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [checkpointPhase, setCheckpointPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState(() => {
    return JSON.parse(localStorage.getItem("sentences_cat_completed_phases") || "{}");
  });

  const handleCheckpointComplete = (score, total) => {
    if (checkpointPhase) {
      const updated = { ...completedPhases, [checkpointPhase.phase]: { score, total } };
      setCompletedPhases(updated);
      localStorage.setItem("sentences_cat_completed_phases", JSON.stringify(updated));
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sentencesData;
    
    return sentencesData.map(phaseObj => {
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
    setVisibleTranslations({});
  };

  const toggleTranslation = (sIndex, phaseKey) => {
    const key = `${phaseKey}-${sIndex}`;
    setVisibleTranslations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (!visibleTranslations[key]) {
      const currentStats = JSON.parse(localStorage.getItem("sentences_stats") || '{"practiced":0}');
      currentStats.practiced += 1;
      localStorage.setItem("sentences_stats", JSON.stringify(currentStats));
    }
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
    <div className="space-y-8 pb-20 max-w-4xl mx-auto font-sans text-white">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 sm:p-10 shadow-2xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs font-bold text-sky-300 w-fit">
          <MessageCircle className="h-4 w-4 text-sky-400" /> Daily Sentences & Phrases
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Contextual Daily Sentences
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          Master high-frequency conversational sentences categorized by practical real-life situations.
        </p>
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sentences in English or Tamil..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-sans text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors shadow-lg"
        />
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredData.map((phaseObj) => {
          const isOpen = searchQuery.trim() !== "" || activePhaseKey === phaseObj.phase;
          const isCompleted = completedPhases[phaseObj.phase];

          return (
            <div 
              key={phaseObj.phase}
              className="rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => togglePhase(phaseObj.phase)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center font-bold font-mono text-sm">
                    {phaseObj.sentences.length}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                      {phaseObj.phase}
                      {isCompleted && (
                        <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          ⭐ Passed
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click to view practice sentences</p>
                  </div>
                </div>

                <div className="h-8 w-8 rounded-full bg-white/5 text-slate-400 flex items-center justify-center">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-white/10 bg-black/20 p-6 space-y-4"
                  >
                    {/* Checkpoint button */}
                    <button
                      onClick={() => setCheckpointPhase(phaseObj)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 p-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition-all text-xs"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      Take Oral Checkpoint with Cat AI
                    </button>

                    {phaseObj.sentences.map((s, idx) => {
                      const itemKey = `${phaseObj.phase}-${idx}`;
                      const isTransVisible = visibleTranslations[itemKey];

                      return (
                        <div key={idx} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                          <div className="flex items-start gap-3">
                            <Quote className="h-4 w-4 text-sky-400 shrink-0 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold text-white text-base leading-relaxed">
                                {s.english}
                              </p>
                              <p className="text-xs text-sky-300 font-medium mt-1">
                                {s.tamil}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => playAudio(s.english)}
                              className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-blue-500/20"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              Listen
                            </button>

                            {s.example && (
                              <button
                                onClick={() => toggleTranslation(idx, phaseObj.phase)}
                                className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10"
                              >
                                <Languages className="h-3.5 w-3.5" />
                                {isTransVisible ? "Hide Usage" : "Usage Example"}
                              </button>
                            )}
                          </div>

                          {s.example && isTransVisible && (
                            <div className="mt-2 p-3 rounded-xl bg-blue-900/20 border-l-2 border-sky-400 text-xs text-slate-300 italic">
                              "{s.example}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Checkpoint Modal */}
      <CatVoiceCheckpoint
        isOpen={!!checkpointPhase}
        onClose={() => setCheckpointPhase(null)}
        phaseData={checkpointPhase}
        onComplete={handleCheckpointComplete}
      />
    </div>
  );
}
