import { useState, useEffect } from "react";
import { calculateNewStreak } from "../../utils/streak";
import { useNavigate } from "react-router-dom";
import { useCatTeacher } from "../../context/CatTeacherContext";
import hindiQuizData from "../../data/hindiQuizData.json";
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

// In hindiQuizData.json, questions are inside modules[i].quiz
const extractQuestions = (data) =>
  data.modules ? data.modules.flatMap((m) => m.quiz) : [];

const ALL_MODULES = hindiQuizData.modules.map(m => ({
  label: `Module ${m.module}`,
  description: m.description,
  questions: m.quiz || []
}));

const QUESTIONS_PER_LEVEL = 10;

export default function HindiQuiz({ onExit }) {
  const navigate = useNavigate();
  const { triggerCatTeacherModal } = useCatTeacher();

  const handleExit = () => {
    if (onExit) onExit();
    else navigate("/");
  };

  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    return ALL_MODULES.map((_, i) => {
      const saved = localStorage.getItem(`hindi_quiz_unlocked_level_m${i}`);
      return saved ? parseInt(saved, 10) : 1;
    });
  });

  const [activeModuleIdx, setActiveModuleIdx] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

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

  const handleOptionClick = (idx, isCorrect, hindiText) => {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
    setWasCorrect(isCorrect);
    if (isCorrect) setScoreCount((prev) => prev + 1);

    if (window.speechSynthesis && hindiText) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(hindiText);
      u.lang = "hi-IN";
      u.rate = 0.85;
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
      setQuizFinished(true);
      triggerCatTeacherModal({
        language: "hindi",
        category: "Quiz",
        level: activeLevel || 1,
        items: questions
      });
      try {
        const modTotalLevels = Math.ceil(ALL_MODULES[activeModuleIdx].questions.length / QUESTIONS_PER_LEVEL);
        if (activeLevel === unlockedLevel && activeLevel < modTotalLevels) {
          const newUnlocked = activeLevel + 1;
          setUnlockedLevels(prev => {
            const next = [...prev];
            next[activeModuleIdx] = newUnlocked;
            return next;
          });
          localStorage.setItem(`hindi_quiz_unlocked_level_m${activeModuleIdx}`, newUnlocked.toString());
        }
        const savedStats = JSON.parse(localStorage.getItem("hindi_stats") || '{"streak":0,"xp":0}');
        const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(savedStats);
        const newStats = { streak: updatedStreak, lastActiveDate, xp: savedStats.xp + 50 };
        localStorage.setItem("hindi_stats", JSON.stringify(newStats));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const scorePercentage = questions.length > 0 ? Math.round((scoreCount / questions.length) * 100) : 0;

  if (activeModuleIdx === null && activeLevel === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-400" /> Quiz Modules
          </h2>
          <button
            onClick={handleExit}
            className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition shadow-sm"
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
                    ? "border-white/5 bg-white/5 opacity-70 cursor-not-allowed"
                    : isInProgress
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                    : "border-emerald-500/30 bg-emerald-500/10 hover:shadow-md hover:bg-emerald-500/20"
                }`}
              >
                <div className={`w-12 h-12 mb-3 flex items-center justify-center rounded-2xl ${isLocked ? "bg-slate-800 text-slate-500" : isInProgress ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"} shadow-sm`}>
                  <Map className="w-6 h-6" />
                </div>
                <span className={`font-display text-xl font-bold ${isLocked ? "text-slate-500" : "text-white"}`}>
                  {mod.label}
                </span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
                  {modTotalLevels} Levels · {mod.questions.length} Questions
                </span>
                <div className="mt-4">
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-slate-600" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/20">In Progress</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeModuleIdx !== null && activeLevel === null) {
    const modTotalLevels = Math.ceil(ALL_MODULES[activeModuleIdx].questions.length / QUESTIONS_PER_LEVEL);
    const moduleLevels = Array.from({ length: modTotalLevels }).map((_, i) => i + 1);

    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-400" /> {ALL_MODULES[activeModuleIdx].label} – Levels
          </h2>
          <button
            onClick={() => setActiveModuleIdx(null)}
            className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition shadow-sm"
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
                    ? "border-amber-500/50 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-lg hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:-translate-y-1"
                    : "border-white/5 bg-white/5 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {isLocked && (
                    <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 shadow-sm ${
                  isCurrent ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20" :
                  isCompleted ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  "bg-slate-800 text-slate-500 border border-white/5"
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? "text-slate-500" : "text-white"}`}>
                  Level {levelNum}
                </span>
                {isCurrent && (
                  <span className="mt-1 font-mono text-[9px] font-bold text-amber-400 uppercase tracking-wider">Next up</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const optionEntries = Object.entries(currentQ.options || {});

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-4">
      {!quizFinished ? (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl sm:p-10 space-y-8 relative">
          <button
            onClick={() => { setActiveLevel(null); }}
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 font-sans text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-amber-400">
                <Languages className="h-4 w-4" /> Level {activeLevel}
              </span>
              <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Multiple Choice
            </span>
            <h2 className="font-display text-4xl font-bold text-white mb-2">
              {currentQ.hindi}
            </h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-300 bg-white/10 px-3 py-1 rounded-lg text-sm">
                {currentQ.english_transliteration}
              </span>
              <span className="font-sans text-amber-200/70 text-sm">
                ({currentQ.tamil_transliteration})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {optionEntries.map(([key, optText], idx) => {
              const isCorrectOption = key === currentQ.correct_option;
              const isSelected = selectedIdx === idx;

              let btnClass = "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 cursor-pointer";
              if (answered) {
                if (isCorrectOption) {
                  btnClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold";
                } else if (isSelected && !isCorrectOption) {
                  btnClass = "border-red-500/50 bg-red-500/10 text-red-400";
                } else {
                  btnClass = "border-white/5 bg-transparent text-slate-300 opacity-50 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={key}
                  disabled={answered}
                  onClick={() => handleOptionClick(idx, isCorrectOption, currentQ.hindi)}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all duration-200 ${btnClass}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[20px] leading-tight">
                      {key}. {optText}
                    </span>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {answered && isCorrectOption && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    )}
                    {answered && isSelected && !isCorrectOption && (
                      <XCircle className="h-6 w-6 text-red-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`rounded-2xl p-5 border space-y-4 ${wasCorrect ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {wasCorrect ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="h-5 w-5" /> Incorrect — The correct answer is highlighted in green above.
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-amber-600 transition"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-8 text-center shadow-2xl space-y-6 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-xl">
            <Award className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/20">
              Level {activeLevel} Complete
            </span>
            <h2 className="font-display text-3xl font-bold text-white">
              You Completed Level {activeLevel}!
            </h2>
            <p className="font-sans text-sm text-slate-400 max-w-md mx-auto">
              You scored {scoreCount} out of {questions.length} correctly. Keep it up!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/5 border border-white/5 p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-white">{scorePercentage}%</p>
              <p className="text-[11px] text-slate-400">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-amber-400">+50 XP</p>
              <p className="text-[11px] text-slate-400">Earned XP</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-emerald-400">{scoreCount}/{questions.length}</p>
              <p className="text-[11px] text-slate-400">Correct</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-sans text-sm font-bold text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" /> Retake Level
            </button>

            {activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-amber-500 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-amber-600"
              >
                Next Level <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => { setActiveLevel(null); }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-white/10 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-white/20">

              <Map className="h-4 w-4 text-amber-400" /> View All Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
