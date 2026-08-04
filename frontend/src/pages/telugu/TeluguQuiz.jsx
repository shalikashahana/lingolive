import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { teluguQuizData } from "../../data/teluguQuizData";
import { useAuth } from "../../context/AuthContext";
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
  Lock
} from "lucide-react";
import { calculateNewStreak } from "../../utils/streak";

export default function TeluguQuiz({ onExit }) {
  const navigate = useNavigate();
  const { triggerCatTeacherModal } = useCatTeacher();
  
  const handleExit = () => {
    if (onExit) onExit();
    else navigate('/');
  };

  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [activeLevel, setActiveLevel] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const savedLevel = localStorage.getItem("telugu_quiz_unlocked_level");
    if (savedLevel) {
      setUnlockedLevel(parseInt(savedLevel, 10));
    }
  }, []);

  const startLevel = (levelNum) => {
    setActiveLevel(levelNum);
    // Grab the 10 questions for this level
    const startIndex = (levelNum - 1) * 10;
    const levelQuestions = teluguQuizData.slice(startIndex, startIndex + 10);
    // Shuffle them so they aren't in the same order every time
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

  const handleMCQSubmit = (idx, isCorrect) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setAnswersSubmitted((prev) => ({ ...prev, [currentQ.id]: isCorrect }));
    
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
      
      const totalLevels = Math.ceil(teluguQuizData.length / 10);
      triggerCatTeacherModal({
        language: "telugu",
        category: "Quiz",
        level: activeLevel || 1,
        items: questions,
        onUnlockNextLevel: (nextLvl) => {
          if (activeLevel === unlockedLevel && activeLevel < totalLevels) {
            setUnlockedLevel(nextLvl);
            localStorage.setItem("telugu_quiz_unlocked_level", nextLvl.toString());
          }
          const savedStats = JSON.parse(localStorage.getItem("telugu_stats") || '{"streak":0,"xp":0}');
          const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(savedStats);
          localStorage.setItem("telugu_stats", JSON.stringify({
            streak: updatedStreak,
            lastActiveDate: lastActiveDate,
            xp: savedStats.xp + 50
          }));
        }
      });
    }
  };

  const scorePercentage = questions.length > 0 ? Math.round((scoreCount / questions.length) * 100) : 0;
  const passed = true; // Always pass upon finishing the 10 questions

  const [activeModule, setActiveModule] = useState(null);

  const totalLevels = Math.ceil(teluguQuizData.length / 10);
  const levelsPerModule = 40;
  const totalModules = Math.ceil(totalLevels / levelsPerModule);

  // MODULE SELECTION SCREEN
  if (activeModule === null && activeLevel === null) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pt-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
             <Map className="w-6 h-6 text-amber-400" /> Quiz Modules
          </h2>
          <button 
            onClick={handleExit} 
            className="flex items-center gap-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 font-sans text-xs font-bold text-slate-400 hover:bg-white/[0.09] hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: totalModules }).map((_, i) => {
            const moduleNum = i + 1;
            const startLevelNum = (moduleNum - 1) * levelsPerModule + 1;
            const endLevelNum = Math.min(moduleNum * levelsPerModule, totalLevels);
            
            // Module is locked if the unlocked level is less than the first level of this module
            const isLocked = unlockedLevel < startLevelNum;
            const isCompleted = unlockedLevel > endLevelNum;
            const isInProgress = unlockedLevel >= startLevelNum && unlockedLevel <= endLevelNum;

            return (
              <button
                key={moduleNum}
                onClick={() => !isLocked && setActiveModule(moduleNum)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  isLocked 
                    ? "border-white/[0.06] bg-slate-900/40 opacity-60 cursor-not-allowed" 
                    : isInProgress
                    ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
                    : "border-emerald-500/30 bg-emerald-950/20 hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 mb-3 flex items-center justify-center rounded-2xl ${isLocked ? "bg-white/[0.05]" : isInProgress ? "bg-amber-500" : "bg-emerald-600"} text-white shadow-sm`}>
                  <Map className="w-6 h-6" />
                </div>
                <span className={`font-display text-xl font-bold ${isLocked ? "text-slate-600" : "text-white"}`}>Module {moduleNum}</span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                  Levels {startLevelNum} - {endLevelNum}
                </span>
                <div className="mt-4">
                  {isLocked ? <Lock className="w-5 h-5 text-slate-600" /> : 
                   isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
                   <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">In Progress</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // LEVEL SELECTION SCREEN
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
              className="flex items-center gap-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 font-sans text-xs font-bold text-slate-400 hover:bg-white/[0.09] hover:text-white transition"
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
            className="flex items-center gap-1 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 font-sans text-xs font-bold text-slate-400 hover:bg-white/[0.09] hover:text-white transition"
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
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10 hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/20 hover:-translate-y-1"
                    : "border-white/[0.06] bg-slate-900/40 opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Status Icon */}
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {isLocked && <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 ${
                  isCurrent ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30' :
                  isCompleted ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' :
                  'bg-white/[0.05] text-slate-600 border border-white/[0.06]'
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? 'text-slate-600' : 'text-white'}`}>
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

  // ACTIVE QUIZ SCREEN
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-4">
      {!quizFinished ? (
        <div className="rounded-3xl border border-white/[0.1] bg-slate-900/70 backdrop-blur-md p-6 shadow-2xl sm:p-10 space-y-8 relative">
          <button 
            onClick={() => setActiveLevel(null)} 
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-1.5 font-sans text-xs font-bold text-slate-400 hover:bg-white/[0.09] hover:text-white transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>
          
          {/* Top Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-white">
              <span className="flex items-center gap-1 text-amber-400">
                <Languages className="h-4 w-4 text-amber-400" /> Level {activeLevel}
              </span>
              <span className="text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-white/[0.07] border border-white/[0.1] px-3 py-1 font-mono text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {currentQ.type === 'fitb' ? 'FILL IN THE BLANKS' : 'MULTIPLE CHOICE'}
            </span>
            
            {currentQ.type === 'fitb' ? (
              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-relaxed">
                  <span className="text-amber-400">{currentQ.en}</span> <br/>
                  <span className="text-lg opacity-70 font-sans">({currentQ.ta})</span>
                </h2>
                <div className="mt-4 p-4 bg-white/[0.05] rounded-xl border border-white/[0.08]">
                  <h3 className="font-telugu text-[26px] font-bold text-white">
                    {currentQ.te_q}
                  </h3>
                  <p className="font-mono text-sm text-slate-500 mt-1">{currentQ.tr_q}</p>
                </div>
              </div>
            ) : currentQ.type === 'mcq' ? (
              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-relaxed">
                  <span className="text-amber-400">{currentQ.en}</span> <br/>
                  <span className="text-lg opacity-70 font-sans">({currentQ.ta})</span>
                </h2>
              </div>
            ) : (
              <h2 className="font-display text-2xl font-bold text-white">
                What is the Telugu word for <span className="text-amber-400">"{currentQ.en}"</span> ({currentQ.ta})?
              </h2>
            )}
          </div>

          {/* Question Body Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.ans;

              let btnStyle = "border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]";
              if (isAnswered) {
                if (isCorrect) btnStyle = "border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-semibold";
                else if (isSelected) btnStyle = "border-red-500/50 bg-red-950/40 text-red-300";
                else btnStyle = "border-white/[0.05] opacity-40";
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleMCQSubmit(idx, isCorrect)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 font-sans text-lg text-left transition ${btnStyle}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold font-telugu text-[22px]">{opt.te}</span>
                    <span className="text-xs opacity-70 font-mono mt-1">{opt.tr}</span>
                  </div>
                  {isAnswered && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-400" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-400" />}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation */}
          {isAnswered && (
            <div className="space-y-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] p-5 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                {answersSubmitted[currentQ.id] ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="h-4 w-4" /> Incorrect
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 font-sans text-sm font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-400"
              >
                <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Final Result Screen */
        <div className="rounded-3xl border border-white/[0.1] bg-slate-900/70 backdrop-blur-md p-8 text-center shadow-2xl space-y-6 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-600 to-amber-400 text-white shadow-xl shadow-amber-500/30">
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
              Level {activeLevel} Evaluation
            </span>
            <h2 className="font-display text-3xl font-bold text-white">
              You Completed Level {activeLevel}!
            </h2>
            <p className="font-sans text-sm text-slate-400 max-w-md mx-auto">
              You scored {scorePercentage}% accuracy on this level. Keep up the great work!
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-white">{scorePercentage}%</p>
              <p className="text-[11px] text-slate-500">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-amber-400">+{passed ? 50 : 10} XP</p>
              <p className="text-[11px] text-slate-500">Earned XP</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-emerald-400">{scoreCount}/{questions.length}</p>
              <p className="text-[11px] text-slate-500">Correct</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-white/[0.1] bg-white/[0.05] px-6 py-3 font-sans text-sm font-bold text-white hover:bg-white/[0.09]"
            >
              <RotateCcw className="h-4 w-4" /> Retake Level
            </button>
            
            {passed && activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-emerald-500"
              >
                Next Level <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setActiveLevel(null)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:from-amber-500 hover:to-amber-400"
            >
              <Map className="h-4 w-4" /> View All Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
