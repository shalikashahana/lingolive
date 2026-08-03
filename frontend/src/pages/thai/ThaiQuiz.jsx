import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import thaiQuizJson from "../../data/thaiQuizData.json";
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

export default function ThaiQuiz({ onExit }) {
  const navigate = useNavigate();
  const { triggerCatTeacherModal } = useCatTeacher();
  const allQuestions = thaiQuizJson.modules ? thaiQuizJson.modules.flatMap(m => m.quiz || []) : [];

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
    const savedLevel = localStorage.getItem("thai_quiz_unlocked_level");
    if (savedLevel) {
      setUnlockedLevel(parseInt(savedLevel, 10));
    }
  }, []);

  const playAudio = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
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

  const handleMCQSubmit = (idx, isCorrect, thText) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setAnswersSubmitted((prev) => ({ ...prev, [currentQ.id]: isCorrect }));
    
    if (thText) playAudio(thText);

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
        language: "thai",
        category: "Quiz",
        level: activeLevel || 1,
        items: questions,
        onUnlockNextLevel: (nextLvl) => {
          if (activeLevel === unlockedLevel && activeLevel < totalLevels) {
            setUnlockedLevel(nextLvl);
            localStorage.setItem("thai_quiz_unlocked_level", nextLvl.toString());
          }
          const savedStats = JSON.parse(localStorage.getItem("thai_stats") || '{"streak":0,"xp":0}');
          const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(savedStats);
          localStorage.setItem("thai_stats", JSON.stringify({
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
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
              <Zap className="w-8 h-8 text-amber-400" /> Thai Quiz Modules
            </h2>
            <p className="font-sans text-sm text-slate-400 mt-1">
              Select a module to access themed levels ({allQuestions.length} Total Questions)
            </p>
          </div>
          <button 
            onClick={handleExit} 
            className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 transition shadow-sm"
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
                    ? "border-white/5 bg-slate-900/40 opacity-60 cursor-not-allowed" 
                    : isInProgress
                    ? "border-amber-500 bg-amber-500/10 shadow-lg hover:-translate-y-1"
                    : "border-emerald-500/30 bg-emerald-950/20 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <div className={`w-14 h-14 mb-4 flex items-center justify-center rounded-2xl ${isLocked ? "bg-slate-800" : isInProgress ? "bg-amber-500" : "bg-emerald-500"} text-white shadow-md`}>
                  <Map className="w-7 h-7" />
                </div>
                <span className={`font-display text-xl font-bold ${isLocked ? "text-slate-500" : "text-white"}`}>Module {moduleNum}</span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                  Levels {startLevelNum} - {endLevelNum}
                </span>
                <div className="mt-4">
                  {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : 
                   isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
                   <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3.5 py-1 rounded-full">In Progress</span>}
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
              className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
               <Map className="w-6 h-6 text-amber-400" /> Module {activeModule} Levels
            </h2>
          </div>
          <button 
            onClick={handleExit} 
            className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 transition shadow-sm"
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
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50 shadow-lg hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/20 hover:-translate-y-1"
                    : "border-white/10 bg-slate-900/40 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-900/50" />}
                  {isLocked && <Lock className="h-4 w-4 text-slate-500" />}
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 shadow-sm ${
                  isCurrent ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white border border-amber-400/50' :
                  isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                  Level {levelNum}
                </span>
                {isCurrent && (
                  <span className="mt-1 font-mono text-[9px] font-bold text-amber-400 uppercase tracking-wider">
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
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-6 shadow-xl sm:p-10 space-y-8 relative">
          {/* Top Right Back to Levels */}
          <button 
            onClick={() => setActiveLevel(null)} 
            className="absolute top-5 right-5 flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 font-sans text-xs font-bold text-slate-300 hover:bg-white/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>
          
          {/* Top Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="h-4 w-4 text-amber-400" /> Level {activeLevel}
              </span>
              <span className="text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          {currentQ && (
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
                MULTIPLE CHOICE
              </span>
              
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-relaxed">
                {currentQ.thai || currentQ.question || `What is the Thai word for "${currentQ.english}" (${currentQ.tamil})?`}
              </h2>
            </div>
          )}

          {/* Question Body Options (Matching Screenshot) */}
          {currentQ && (
            <div className="space-y-3.5">
              {Object.entries(currentQ.options || {}).map(([key, opt]) => {
                const isSelected = selectedOption === key;
                let isCorrect = false;
                
                // Support both "A, B, C, D" string objects and array of objects
                let thaiText = "";
                let transText = "";
                
                if (typeof opt === 'string') {
                  isCorrect = key === currentQ.correct_option;
                  const match = opt.match(/^(.*?) \((.*?)\)$/);
                  if (match) {
                    thaiText = match[1];
                    transText = match[2];
                  } else {
                    thaiText = opt;
                  }
                } else {
                  isCorrect = opt.thai === currentQ.correct_answer;
                  thaiText = opt.thai;
                  transText = opt.transliteration;
                }

                let btnStyle = "border-white/10 bg-[#050816] text-white hover:bg-white/5 hover:border-white/20";
                if (isAnswered) {
                  if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-400 font-semibold shadow-sm";
                  else if (isSelected) btnStyle = "border-amber-500 bg-amber-500/20 text-amber-400 shadow-sm";
                  else btnStyle = "border-white/5 bg-[#050816]/50 opacity-40";
                }

                return (
                  <button
                    key={key}
                    disabled={isAnswered}
                    onClick={() => handleMCQSubmit(key, isCorrect, thaiText)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-5 font-sans text-left transition duration-200 shadow-sm ${btnStyle}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold font-sans text-2xl tracking-wide">{thaiText}</span>
                      {transText && <span className={`text-xs font-mono mt-0.5 ${isAnswered && isCorrect ? 'text-emerald-400' : isAnswered && isSelected && !isCorrect ? 'text-amber-400' : 'text-slate-400'}`}>{transText}</span>}
                    </div>
                    {isAnswered && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-emerald-900/50 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-amber-400 fill-amber-900/50 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Answer Feedback & Next Button */}
          {isAnswered && (
            <div className="space-y-4 rounded-2xl bg-white/5 p-5 border border-white/10 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                {answersSubmitted[currentQ.id] ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" /> Correct Answer! Great job.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <XCircle className="h-5 w-5" /> Incorrect
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-600 py-3.5 font-sans text-sm font-bold text-white shadow-md hover:bg-amber-500 transition"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Final Result Screen */
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-8 text-center shadow-2xl space-y-6 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xl">
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Level {activeLevel} Evaluation
            </span>
            <h2 className="font-display text-3xl font-bold text-white">
              You Completed Level {activeLevel}!
            </h2>
            <p className="font-sans text-sm text-slate-400 max-w-md mx-auto">
              You scored {scorePercentage}% accuracy on this level. Keep up the great practice!
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-[#050816]/60 border border-white/5 p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-white">{scorePercentage}%</p>
              <p className="text-[11px] text-slate-400">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-amber-400">+{passed ? 50 : 10} XP</p>
              <p className="text-[11px] text-slate-400">Earned XP</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-sky-400">{scoreCount}/{questions.length}</p>
              <p className="text-[11px] text-slate-400">Correct</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 font-sans text-sm font-bold text-white shadow-sm hover:bg-white/10 transition"
            >
              <RotateCcw className="h-4 w-4" /> Retry Level
            </button>
            {activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-amber-600 py-3.5 font-sans text-sm font-bold text-white shadow-md hover:bg-amber-500 transition"
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
