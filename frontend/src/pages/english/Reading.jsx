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
          body: JSON.stringify({ passage_id: id, level_id: id })
        });
      } catch (e) {
        console.error("Failed to update reading progress", e);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-[#14213D] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#3F6656]/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <BookOpen className="h-3.5 w-3.5" /> 30 Preset Stories
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Reading & Context Practice
          </h1>
          <p className="max-w-xl font-sans text-sm text-white/70">
            Immerse yourself in CEFR-level stories. Click on highlighted vocabulary words to view instant definitions and audio.
          </p>
        </div>
      </div>

      {!selectedPassage ? (
        /* Passage Selection Grid */
        <div className="grid gap-6 md:grid-cols-2">
          {READING_PASSAGES.map((passage) => {
            const isCompleted = completedPassages[passage.id];
            return (
              <div
                key={passage.id}
                onClick={() => setSelectedPassage(passage)}
                className="group relative cursor-pointer rounded-3xl border border-[#14213D]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#14213D]/30 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#14213D] px-3 py-1 font-mono text-xs font-bold text-[#C9A227]">
                    CEFR {passage.cefr_level}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#14213D]/60">{passage.word_count} words</span>
                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                </div>

                <div className="my-4 space-y-2">
                  <h3 className="font-display text-xl font-bold text-[#14213D] group-hover:text-[#3F6656] transition">
                    {passage.title}
                  </h3>
                  <p className="line-clamp-3 font-sans text-sm text-[#14213D]/70 leading-relaxed">
                    {passage.preview}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-[#14213D]/10 pt-4">
                  <div className="flex items-center gap-1 font-mono text-xs text-[#14213D]/60">
                    <Info className="h-3.5 w-3.5" />
                    <span>{passage.highlights.length} Target Words</span>
                  </div>
                  <span className="flex items-center gap-1 font-sans text-xs font-bold text-[#14213D] group-hover:translate-x-1 transition">
                    Read Passage <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Story Reader Screen */
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedPassage(null);
              setSelectedWordPopover(null);
            }}
            className="flex items-center gap-2 font-sans text-xs font-bold text-[#14213D] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Reading Library
          </button>

          <div className="relative rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#14213D]/10 pb-6">
              <div className="mb-6 max-w-[85%]">
                <span className="rounded-full bg-[#14213D] px-3 py-1 font-mono text-xs font-bold text-[#C9A227] mb-3 inline-block">
                  CEFR {selectedPassage.cefr_level}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#14213D] leading-tight">
                  {selectedPassage.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playAudio(selectedPassage.body)}
                  className="flex items-center gap-2 rounded-xl bg-[#C9A227]/10 px-4 py-2.5 font-sans text-xs font-bold text-[#8C6D13] hover:bg-[#C9A227]/20"
                >
                  <Volume2 className="h-4 w-4 text-[#C9A227]" /> Read Aloud
                </button>

                <button
                  onClick={() => markCompleted(selectedPassage.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-xs font-bold transition ${
                    completedPassages[selectedPassage.id]
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      : "bg-[#14213D] text-white hover:bg-[#14213D]/90"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {completedPassages[selectedPassage.id] ? "Story Completed" : "Mark as Read"}
                </button>
              </div>
            </div>

            {/* Read Aloud to Cat Teacher Button */}
            <div className="mb-8 mt-2">
              <button
                onClick={() => setEvaluatorOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3F6656] to-[#2d4a3e] p-4 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Mic className="h-5 w-5 text-emerald-400" />
                Read Aloud to Cat AI Teacher
              </button>
            </div>

            {/* Passage Body with Interactive Word Highlights */}
            <div className="my-8 font-sans text-base leading-relaxed text-[#14213D]/90 sm:text-lg sm:leading-loose">
              {selectedPassage.body.split("\n\n").map((paragraph, pIdx) => (
                <p key={pIdx} className="mb-6">
                  {paragraph.split(" ").map((word, wIdx) => {
                    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
                    const isHighlight = selectedPassage.highlights.includes(cleanWord.toLowerCase());

                    if (isHighlight) {
                      return (
                        <span key={wIdx}>
                          <button
                            onClick={() => handleWordClick(cleanWord)}
                            className="inline-block rounded-md bg-[#C9A227]/20 px-1.5 py-0.5 font-semibold text-[#8C6D13] underline decoration-[#C9A227] decoration-2 underline-offset-2 hover:bg-[#C9A227]/40 transition"
                          >
                            {word}
                          </button>{" "}
                        </span>
                      );
                    }
                    return <span key={wIdx}>{word} </span>;
                  })}
                </p>
              ))}
            </div>

            {/* Clicked Word Popover Drawer */}
            {selectedWordPopover && (
              <div className="mt-8 rounded-2xl border border-[#C9A227]/40 bg-[#C9A227]/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-[#14213D] capitalize">
                      {selectedWordPopover.word}
                    </span>
                    <span className="font-mono text-xs text-[#14213D]/60">
                      {selectedWordPopover.pronunciation_ipa}
                    </span>
                  </div>
                  <button
                    onClick={() => playAudio(selectedWordPopover.word)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#C9A227] shadow-sm hover:scale-105"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 font-sans text-sm text-[#14213D]/80">
                  {selectedWordPopover.definition}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cat AI Reading Evaluator Modal */}
      <CatReadingEvaluator
        isOpen={evaluatorOpen}
        onClose={() => setEvaluatorOpen(false)}
        passage={selectedPassage}
        onComplete={(acc, wpm) => markCompleted(selectedPassage.id)}
      />
    </div>
  );
}
