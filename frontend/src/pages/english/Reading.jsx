import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { READING_PASSAGES, VOCABULARY_LIST } from "../../data/mockData";
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Info,
  ChevronRight,
  Mic
} from "lucide-react";
import CatReadingEvaluator from "../../components/catTeacher/CatReadingEvaluator";

export default function Reading() {
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [selectedWordPopover, setSelectedWordPopover] = useState(null);
  const [completedPassages, setCompletedPassages] = useState({});
  const { user } = useAuth();
  const [evaluatorOpen, setEvaluatorOpen] = useState(false);

  useEffect(() => {
    async function fetchLearned() {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/progress/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && data[0].user_progress) {
              const completed = {};
              data[0].user_progress.forEach(p => {
                if (p.reading_completed) {
                  completed[p.level_id] = true;
                }
              });
              setCompletedPassages(completed);
            }
          }
        } catch (e) {
          console.error("Failed to fetch reading progress", e);
        }
      }
    }
    fetchLearned();
  }, [user]);

  const playAudio = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordClick = (word) => {
    const found = VOCABULARY_LIST.find(
      (v) => v.word.toLowerCase() === word.toLowerCase()
    ) || {
      word,
      definition: "Key vocabulary word used in this context.",
      pronunciation_ipa: "/.../",
      part_of_speech: "term"
    };
    setSelectedWordPopover(found);
  };

  const markCompleted = async (id) => {
    setCompletedPassages((prev) => ({ ...prev, [id]: true }));
    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/reading/read`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ passage_id: id })
        });
      } catch (e) {
        console.error("Failed to update reading status", e);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 font-sans text-white">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 sm:p-10 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs font-bold text-sky-300 w-fit mb-3">
          <BookOpen className="h-4 w-4 text-sky-400" /> Immersive Reading Room
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Reading & Comprehension
        </h1>
        <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
          Enhance vocabulary and grammar in context. Click any highlighted word to inspect its definition and IPA pronunciation.
        </p>
      </div>

      {!selectedPassage ? (
        /* PASSAGE SELECTION GRID */
        <div className="grid gap-6 sm:grid-cols-2">
          {READING_PASSAGES.map((passage) => {
            const isDone = completedPassages[passage.id];
            return (
              <div
                key={passage.id}
                onClick={() => setSelectedPassage(passage)}
                className="group cursor-pointer glass-panel-interactive p-6 rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30">
                      {passage.cefr} Level
                    </span>
                    {isDone && (
                      <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Read
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                    {passage.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {passage.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
                  <span className="text-xs font-mono text-slate-400">{passage.word_count || 180} words</span>
                  <span className="text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Start Reading <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PASSAGE DETAIL VIEW */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPassage(null)}
            className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Passages
          </button>

          <div className="glass-card p-8 sm:p-12 border border-white/10 bg-[#0f172a]/95 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest">{selectedPassage.cefr} Passage</span>
                <h2 className="font-heading text-3xl font-bold text-white mt-1">{selectedPassage.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playAudio(selectedPassage.content)}
                  className="flex items-center gap-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-xs font-bold text-sky-300 hover:bg-blue-500/20 transition-all"
                >
                  <Volume2 className="h-4 w-4" /> Listen Audio
                </button>
                
                <button
                  onClick={() => setEvaluatorOpen(true)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Mic className="h-4 w-4" /> Read Aloud & Evaluate
                </button>
              </div>
            </div>

            {/* Content text with interactive words */}
            <div className="text-base sm:text-lg leading-relaxed text-slate-200 space-y-4">
              {selectedPassage.content.split(" ").map((word, idx) => {
                const cleanWord = word.replace(/[^a-zA-Z]/g, "");
                const isKeyVocab = VOCABULARY_LIST.some(
                  (v) => v.word.toLowerCase() === cleanWord.toLowerCase()
                );

                return (
                  <span
                    key={idx}
                    onClick={() => isKeyVocab && handleWordClick(cleanWord)}
                    className={`inline-block mr-1.5 transition-colors ${
                      isKeyVocab
                        ? "cursor-pointer font-semibold text-sky-400 underline decoration-sky-400/50 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300"
                        : ""
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Complete button */}
            <div className="border-t border-white/10 pt-6 flex justify-end">
              <button
                onClick={() => markCompleted(selectedPassage.id)}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-all ${
                  completedPassages[selectedPassage.id]
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {completedPassages[selectedPassage.id] ? "Completed" : "Mark as Finished"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Popover Modal */}
      {selectedWordPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedWordPopover(null)}>
          <div className="glass-card w-full max-w-sm p-6 border border-white/15 rounded-3xl bg-[#0f172a] shadow-2xl relative space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-400 uppercase">{selectedWordPopover.part_of_speech}</span>
              <button onClick={() => playAudio(selectedWordPopover.word)} className="text-sky-400 hover:text-sky-300">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-heading text-2xl font-bold text-white capitalize">{selectedWordPopover.word}</h3>
            <p className="font-mono text-xs text-slate-400">{selectedWordPopover.pronunciation_ipa}</p>
            <p className="text-sm text-slate-200 leading-relaxed pt-2 border-t border-white/10">{selectedWordPopover.definition}</p>
            <button
              onClick={() => setSelectedWordPopover(null)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs mt-4 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cat Evaluator Modal */}
      {selectedPassage && (
        <CatReadingEvaluator
          isOpen={evaluatorOpen}
          onClose={() => setEvaluatorOpen(false)}
          passage={selectedPassage}
        />
      )}
    </div>
  );
}
