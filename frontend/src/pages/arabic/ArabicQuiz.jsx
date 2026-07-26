import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import arabicQuizData from "../../data/arabicQuizData.json";
import arabicQuizData2 from "../../data/arabicQuizData2.json";
import arabicQuizData3 from "../../data/arabicQuizData3.json";
import arabicQuizData4 from "../../data/arabicQuizData4.json";
import arabicQuizData5 from "../../data/arabicQuizData5.json";
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Map,
  X,
  Languages,
  Lock
} from "lucide-react";

const extractQuestions = (data) =>
  Array.isArray(data) ? data
  : data.questions ? data.questions
  : data.modules ? data.modules.flatMap((m) => m.quiz)
  : [];

// Each module = an independent list of questions
const ALL_MODULES = [
  { label: "Module 1", questions: extractQuestions(arabicQuizData) },
  { label: "Module 2", questions: extractQuestions(arabicQuizData2) },
  { label: "Module 3", questions: extractQuestions(arabicQuizData3) },
  { label: "Module 4", questions: extractQuestions(arabicQuizData4) },
  { label: "Module 5", questions: extractQuestions(arabicQuizData5) },
];

const QUESTIONS_PER_LEVEL = 10;
const LEVELS_PER_MODULE = 10;



export default function ArabicQuiz({ onExit }) {
  const navigate = useNavigate();

  const handleExit = () => {
    if (onExit) onExit();
    else navigate("/");
  };

  // unlockedLevels[moduleIdx] = the first locked level number for that module
  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    return ALL_MODULES.map((_, i) => {
      const saved = localStorage.getItem(`arabic_quiz_unlocked_level_m${i}`);
      return saved ? parseInt(saved, 10) : 1;
    });
  });

  const [activeModuleIdx, setActiveModuleIdx] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeModuleData = activeModuleIdx !== null ? ALL_MODULES[activeModuleIdx] : null;
  const unlockedLevel = activeModuleIdx !== null ? unlockedLevels[activeModuleIdx] : 1;
  const totalLevels = activeModuleData ? Math.ceil(activeModuleData.questions.length / QUESTIONS_PER_LEVEL) : 0;

  const startLevel = (levelNum, moduleIdx = activeModuleIdx) => {
    const moduleQuestions = ALL_MODULES[moduleIdx].questions;
    const startIndex = (levelNum - 1) * QUESTIONS_PER_LEVEL;
    const levelQuestions = moduleQuestions.slice(startIndex, startIndex + QUESTIONS_PER_LEVEL);
    setActiveModuleIdx(moduleIdx);
    setActiveLevel(levelNum);
    setQuestions(levelQuestions);
    setCurrentIndex(0);
    setSelectedIdx(null);
    setAnswered(false);
    setWasCorrect(false);
    setScoreCount(0);
    setQuizFinished(false);
  };

  const handleOptionClick = (idx, isCorrect, arabicText) => {
    if (answered) return; // prevent double-click
    setSelectedIdx(idx);
    setAnswered(true);
    setWasCorrect(isCorrect);
    if (isCorrect) setScoreCount((prev) => prev + 1);

    // Play audio
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(arabicText);
      u.lang = "ar-SA";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setAnswered(false);
      setWasCorrect(false);
    } else {
      // Level complete
      setQuizFinished(true);
      try {
        const modTotalLevels = Math.ceil(ALL_MODULES[activeModuleIdx].questions.length / QUESTIONS_PER_LEVEL);
        if (activeLevel === unlockedLevel && activeLevel < modTotalLevels) {
          const newUnlocked = activeLevel + 1;
          setUnlockedLevels(prev => {
            const next = [...prev];
            next[activeModuleIdx] = newUnlocked;
            return next;
          });
          localStorage.setItem(`arabic_quiz_unlocked_level_m${activeModuleIdx}`, newUnlocked.toString());
        }
        const savedStats = JSON.parse(localStorage.getItem("arabic_stats") || '{"streak":0,"xp":0}');
        const newStats = { streak: savedStats.streak === 0 ? 1 : savedStats.streak, xp: savedStats.xp + 50 };
        localStorage.setItem("arabic_stats", JSON.stringify(newStats));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const scorePercentage = questions.length > 0 ? Math.round((scoreCount / questions.length) * 100) : 0;

  // ─── MODULE SELECTION SCREEN ─────────────────────────────────────────────────
  if (activeModuleIdx === null && activeLevel === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <Map className="w-6 h-6 text-[#C9A227]" /> Quiz Modules
          </h2>
          <button
            onClick={handleExit}
            className="flex items-center gap-1 rounded-xl bg-white border border-[#14213D]/10 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/5 transition shadow-sm"
          >
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_MODULES.map((mod, i) => {
            const modTotalLevels = Math.ceil(mod.questions.length / QUESTIONS_PER_LEVEL);
            const unlockedLvl = unlockedLevels[i];
            const isLocked = i > 0 && unlockedLevels[i - 1] < Math.ceil(ALL_MODULES[i-1].questions.length / QUESTIONS_PER_LEVEL);
            const isCompleted = unlockedLvl > modTotalLevels;
            const isInProgress = !isLocked && !isCompleted;

            return (
              <button
                key={i}
                onClick={() => !isLocked && setActiveModuleIdx(i)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                  isLocked
                    ? "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed"
                    : isInProgress
                    ? "border-[#C9A227] bg-[#C9A227]/10 shadow-lg"
                    : "border-emerald-500/30 bg-emerald-50/50 hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 mb-3 flex items-center justify-center rounded-2xl ${isLocked ? "bg-gray-200" : isInProgress ? "bg-[#C9A227]" : "bg-emerald-500"} text-white shadow-sm`}>
                  <Map className="w-6 h-6" />
                </div>
                <span className={`font-display text-xl font-bold ${isLocked ? "text-gray-500" : "text-[#14213D]"}`}>
                  {mod.label}
                </span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? "text-gray-400" : "text-[#14213D]/70"}`}>
                  {modTotalLevels} Levels · {mod.questions.length} Questions
                </span>
                <div className="mt-4">
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/20 px-3 py-1 rounded-full">In Progress</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── LEVEL SELECTION SCREEN ──────────────────────────────────────────────────
  if (activeModuleIdx !== null && activeLevel === null) {
    const modTotalLevels = Math.ceil(ALL_MODULES[activeModuleIdx].questions.length / QUESTIONS_PER_LEVEL);
    const moduleLevels = Array.from({ length: modTotalLevels }).map((_, i) => i + 1);

    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <Map className="w-6 h-6 text-[#C9A227]" /> {ALL_MODULES[activeModuleIdx].label} – Levels
          </h2>
          <button
            onClick={() => setActiveModuleIdx(null)}
            className="flex items-center gap-1 rounded-xl bg-white border border-[#14213D]/10 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/5 transition shadow-sm"
          >
            <X className="h-3.5 w-3.5" /> Back
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {moduleLevels.map((levelNum) => {
            const isLocked = levelNum > unlockedLevel;
            const isCompleted = levelNum < unlockedLevel;
            const isCurrent = levelNum === unlockedLevel;

            return (
              <button
                key={levelNum}
                onClick={() => !isLocked && startLevel(levelNum)}
                disabled={isLocked}
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? "border-[#C9A227] bg-[#C9A227]/10 ring-2 ring-[#C9A227]/40 shadow-lg hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50 hover:-translate-y-1"
                    : "border-[#14213D]/10 bg-gray-50/60 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
                  {isLocked && (
                    <svg className="h-4 w-4 text-[#14213D]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 shadow-sm ${
                  isCurrent ? "bg-gradient-to-br from-[#C9A227] to-amber-500 text-white" :
                  isCompleted ? "bg-white text-emerald-600 border border-emerald-100" :
                  "bg-white text-gray-400 border border-gray-100"
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? "text-gray-400" : "text-[#14213D]"}`}>
                  Level {levelNum}
                </span>
                {isCurrent && (
                  <span className="mt-1 font-mono text-[9px] font-bold text-[#C9A227] uppercase tracking-wider">Next up</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── ACTIVE QUIZ SCREEN ───────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];

  if (!currentQ) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-4">
      {!quizFinished ? (
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-xl sm:p-10 space-y-8 relative">
          {/* Back button */}
          <button
            onClick={() => { setActiveLevel(null); }}
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-[#14213D]/5 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>

          {/* Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#14213D]">
              <span className="flex items-center gap-1 text-[#C9A227]">
                <Languages className="h-4 w-4" /> Level {activeLevel}
              </span>
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#14213D]/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#3F6656] transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-[#14213D]/5 px-3 py-1 font-mono text-xs font-semibold text-[#14213D]/70 uppercase tracking-wider">
              Multiple Choice
            </span>
            <h2 className="font-display text-2xl font-bold text-[#14213D]">
              {currentQ.question_english || currentQ.question_en || currentQ.en}
              <br />
              <span className="text-lg font-sans font-normal opacity-70">
                ({currentQ.question_tamil || currentQ.question_ta || currentQ.ta})
              </span>
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const arabicText = opt.arabic || opt.text || "";
              const transliteration = opt.transliteration || "";
              const isCorrectOption = arabicText === currentQ.correct_answer;
              const isSelected = selectedIdx === idx;

              // Determine styling AFTER answer is submitted
              let btnClass = "border-[#14213D]/15 bg-white text-[#14213D] hover:bg-[#F8F6F0] cursor-pointer";
              if (answered) {
                if (isCorrectOption) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                } else if (isSelected && !isCorrectOption) {
                  btnClass = "border-red-500 bg-red-50 text-red-900";
                } else {
                  btnClass = "border-[#14213D]/10 bg-white opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => handleOptionClick(idx, isCorrectOption, arabicText)}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all duration-200 ${btnClass}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[22px] leading-tight" dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', 'Arabic Typesetting', serif" }}>
                      {arabicText}
                    </span>
                    {transliteration && (
                      <span className="text-xs opacity-60 font-mono">{transliteration}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {answered && isCorrectOption && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    )}
                    {answered && isSelected && !isCorrectOption && (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback + Next button (only shows AFTER answering) */}
          {answered && (
            <div className={`rounded-2xl p-5 border space-y-4 ${wasCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {wasCorrect ? (
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-700">
                    <XCircle className="h-5 w-5" /> Incorrect — The correct answer is highlighted in green above.
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#14213D] py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90 transition"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-8 text-center shadow-2xl space-y-6 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#14213D] text-[#C9A227] shadow-xl">
            <Award className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-600">
              Level {activeLevel} Complete
            </span>
            <h2 className="font-display text-3xl font-bold text-[#14213D]">
              You Completed Level {activeLevel}!
            </h2>
            <p className="font-sans text-sm text-[#14213D]/70 max-w-md mx-auto">
              You scored {scoreCount} out of {questions.length} correctly. Keep it up!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-[#F8F6F0] p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-[#14213D]">{scorePercentage}%</p>
              <p className="text-[11px] text-[#14213D]/60">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[#C9A227]">+50 XP</p>
              <p className="text-[11px] text-[#14213D]/60">Earned XP</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[#3F6656]">{scoreCount}/{questions.length}</p>
              <p className="text-[11px] text-[#14213D]/60">Correct</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-[#14213D]/20 bg-white px-6 py-3 font-sans text-sm font-bold text-[#14213D] hover:bg-[#F8F6F0]"
            >
              <RotateCcw className="h-4 w-4" /> Retake Level
            </button>

            {activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Next Level <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => { setActiveLevel(null); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#14213D] px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90">

              <Map className="h-4 w-4 text-[#C9A227]" /> View All Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
