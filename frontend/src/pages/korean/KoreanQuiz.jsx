import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import koreanQuizJson from "../../data/koreanQuizData.json";
import { useCatTeacher } from "../../context/CatTeacherContext";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Map,
  X,
  Languages,
  Lock,
  Sparkles,
  Volume2
} from "lucide-react";
import { calculateNewStreak } from "../../utils/streak";

export default function KoreanQuiz({ onExit }) {
  const navigate = useNavigate();
  const { triggerCatTeacherModal } = useCatTeacher();
  const allQuestions = koreanQuizJson.questions || [];

  const handleExit = () => {
    if (onExit) onExit();
    else navigate('/');
  };

  const levelsPerModule = 10;
  const totalLevels = Math.max(1, Math.ceil(allQuestions.length / 10));
  const totalModules = Math.ceil(totalLevels / levelsPerModule);

  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const savedLevel = localStorage.getItem("korean_quiz_unlocked_level");
    if (savedLevel) {
      setUnlockedLevel(parseInt(savedLevel, 10));
    }
  }, []);

  const playAudio = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const startLevel = (levelNum) => {
    setActiveLevel(levelNum);
    const startIndex = (levelNum - 1) * 10;
    const levelQuestions = allQuestions.slice(startIndex, startIndex + 10);
    const shuffled = [...levelQuestions].sort(() => 0.5 - Math.random());
    setQuestions(shuffled);
    
    setQuizFinished(false);
    setCurrentIndex(0);
    setScoreCount(0);
    setAnswersSubmitted({});
    setSelectedOption(null);
  };

  const currentQ = questions[currentIndex];
  const isAnswered = currentQ ? answersSubmitted[currentQ.id] !== undefined : false;

  const handleMCQSubmit = (idx, isCorrect, koText) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setAnswersSubmitted((prev) => ({ ...prev, [currentQ.id]: isCorrect }));
    
    if (koText) playAudio(koText);

    if (isCorrect) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      triggerCatTeacherModal({
        language: "korean",
        category: "Quiz",
        level: activeLevel || 1,
        items: questions,
        onUnlockNextLevel: (nextLvl) => {
          if (activeLevel === unlockedLevel && activeLevel < totalLevels) {
            setUnlockedLevel(nextLvl);
            localStorage.setItem("korean_quiz_unlocked_level", nextLvl.toString());
          }
          const savedStats = JSON.parse(localStorage.getItem("korean_stats") || '{"streak":0,"xp":0}');
          const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(savedStats);
          localStorage.setItem("korean_stats", JSON.stringify({
            streak: updatedStreak,
            lastActiveDate: lastActiveDate,
            xp: savedStats.xp + 50
          }));
        }
      });
    }
  };

  // 1. MODULE SELECTION SCREEN
  if (activeModule === null && activeLevel === null) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-[#14213D] flex items-center gap-2">
              <Zap className="w-8 h-8 text-[#8b5cf6]" /> Korean Quiz Modules
            </h2>
            <p className="font-sans text-sm text-[#14213D]/60 mt-1">
              Select a module to access themed levels ({allQuestions.length} Total Questions)
            </p>
          </div>
          <button 
            onClick={handleExit} 
            className="flex items-center gap-1.5 rounded-xl bg-white border border-[#14213D]/10 px-4 py-2 font-sans text-xs font-bold text-[#14213D]/70 hover:bg-[#14213D]/5 transition shadow-sm"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: totalModules }).map((_, i) => {
            const moduleNum = i + 1;
            const startLevelNum = (moduleNum - 1) * levelsPerModule + 1;
            const endLevelNum = Math.min(moduleNum * levelsPerModule, totalLevels);
            
            const isLocked = startLevelNum > unlockedLevel;
            const isCompleted = endLevelNum < unlockedLevel;
            const isInProgress = !isLocked && !isCompleted;

            return (
              <button
                key={moduleNum}
                onClick={() => !isLocked && setActiveModule(moduleNum)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 text-center ${
                  isLocked 
                    ? "border-[#14213D]/10 bg-gray-50/60 opacity-60 cursor-not-allowed" 
                    : isInProgress
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-lg hover:-translate-y-1"
                    : "border-emerald-500/30 bg-emerald-50/50 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <div className={`w-14 h-14 mb-4 flex items-center justify-center rounded-2xl ${isLocked ? "bg-gray-200" : isInProgress ? "bg-[#8b5cf6]" : "bg-emerald-500"} text-white shadow-md`}>
                  <Map className="w-7 h-7" />
                </div>
                <span className={`font-display text-xl font-bold ${isLocked ? "text-gray-500" : "text-[#14213D]"}`}>Module {moduleNum}</span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? 'text-gray-400' : 'text-[#14213D]/70'}`}>
                  Levels {startLevelNum} - {endLevelNum}
                </span>
                <div className="mt-4">
                  {isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : 
                   isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                   <span className="text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/20 px-3.5 py-1 rounded-full">In Progress</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. LEVEL SELECTION SCREEN
  if (activeModule !== null && activeLevel === null) {
    const startLevelNum = (activeModule - 1) * levelsPerModule + 1;
    const endLevelNum = Math.min(activeModule * levelsPerModule, totalLevels);
    const moduleLevels = Array.from({ length: endLevelNum - startLevelNum + 1 }).map((_, i) => startLevelNum + i);

    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveModule(null)}
              className="flex items-center gap-1 rounded-xl bg-white border border-[#14213D]/10 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/5 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <h2 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
               <Map className="w-6 h-6 text-[#8b5cf6]" /> Module {activeModule} Levels
            </h2>
          </div>
          <button 
            onClick={handleExit} 
            className="flex items-center gap-1 rounded-xl bg-white border border-[#14213D]/10 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/5 transition shadow-sm"
          >
            <X className="h-3.5 w-3.5" /> Close
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
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/10 ring-2 ring-[#8b5cf6]/50 shadow-lg hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50 hover:-translate-y-1"
                    : "border-[#14213D]/10 bg-gray-50/60 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
                  {isLocked && <Lock className="h-4 w-4 text-[#14213D]/40" />}
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 shadow-sm ${
                  isCurrent ? 'bg-gradient-to-br from-[#8b5cf6] to-purple-600 text-white' :
                  isCompleted ? 'bg-white text-emerald-600 border border-emerald-100' :
                  'bg-white text-gray-400 border border-gray-100'
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? 'text-gray-400' : 'text-[#14213D]'}`}>
                  Level {levelNum}
                </span>
                {isCurrent && (
                  <span className="mt-1 font-mono text-[9px] font-bold text-[#8b5cf6] uppercase tracking-wider">
                    Next up
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ SCREEN (MATCHING SCREENSHOT)
  const scorePercentage = Math.round((scoreCount / (questions.length || 1)) * 100);
  const passed = scorePercentage >= 60;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-4">
      {!quizFinished ? (
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-xl sm:p-10 space-y-8 relative">
          {/* Top Right Back to Levels */}
          <button 
            onClick={() => setActiveLevel(null)} 
            className="absolute top-5 right-5 flex items-center gap-1.5 rounded-lg bg-[#14213D]/5 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>
          
          {/* Top Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#14213D]">
              <span className="flex items-center gap-1.5 text-[#C9A227]">
                <Sparkles className="h-4 w-4 text-[#C9A227]" /> Level {activeLevel}
              </span>
              <span className="text-[#14213D]/80">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#14213D]/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#3F6656] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          {currentQ && (
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-[#14213D]/5 px-3.5 py-1 font-mono text-xs font-semibold text-[#14213D]/70 uppercase tracking-wider">
                MULTIPLE CHOICE
              </span>
              
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14213D] leading-relaxed">
                What is the Korean word for <span className="text-[#C9A227]">"{currentQ.en}"</span> ({currentQ.ta})?
              </h2>
            </div>
          )}

          {/* Question Body Options (Matching Screenshot) */}
          {currentQ && (
            <div className="space-y-3.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = opt.ans;

                let btnStyle = "border-[#14213D]/15 bg-white text-[#14213D] hover:bg-[#F8F6F0] hover:border-[#14213D]/30";
                if (isAnswered) {
                  if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-sm";
                  else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-900 shadow-sm";
                  else btnStyle = "border-[#14213D]/10 bg-gray-50/50 opacity-40";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleMCQSubmit(idx, isCorrect, opt.ko)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 font-sans text-left transition duration-200 shadow-sm ${btnStyle}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-sans text-2xl text-[#14213D] tracking-wide">{opt.ko}</span>
                      <span className="text-xs font-mono text-[#14213D]/60 mt-0.5">{opt.tr}</span>
                    </div>
                    {isAnswered && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-600 fill-emerald-100 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-600 fill-red-100 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Answer Feedback & Next Button */}
          {isAnswered && (
            <div className="space-y-4 rounded-2xl bg-[#F8F6F0] p-5 border border-[#14213D]/10 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                {answersSubmitted[currentQ.id] ? (
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" /> Correct Answer! Great job.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-700">
                    <XCircle className="h-5 w-5" /> Incorrect
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#14213D] py-3.5 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90 transition"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Final Result Screen */
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-8 text-center shadow-2xl space-y-6 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#14213D] text-[#C9A227] shadow-xl">
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-600">
              Level {activeLevel} Evaluation
            </span>
            <h2 className="font-display text-3xl font-bold text-[#14213D]">
              You Completed Level {activeLevel}!
            </h2>
            <p className="font-sans text-sm text-[#14213D]/70 max-w-md mx-auto">
              You scored {scorePercentage}% accuracy on this level. Keep up the great practice!
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-[#F8F6F0] p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-[#14213D]">{scorePercentage}%</p>
              <p className="text-[11px] text-[#14213D]/60">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[#C9A227]">+{passed ? 50 : 10} XP</p>
              <p className="text-[11px] text-[#14213D]/60">Earned XP</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[#3F6656]">{scoreCount}/{questions.length}</p>
              <p className="text-[11px] text-[#14213D]/60">Correct</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-[#14213D]/20 bg-white py-3.5 font-sans text-sm font-bold text-[#14213D] shadow-sm hover:bg-gray-50 transition"
            >
              <RotateCcw className="h-4 w-4" /> Retry Level
            </button>
            {activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-[#14213D] py-3.5 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90 transition"
              >
                <span>Next Level</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
