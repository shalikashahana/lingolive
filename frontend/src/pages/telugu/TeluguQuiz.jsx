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
          localStorage.setItem("telugu_stats", JSON.stringify({
            streak: savedStats.streak === 0 ? 1 : savedStats.streak,
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
                <span className={`font-display text-xl font-bold ${isLocked ? "text-gray-500" : "text-[#14213D]"}`}>Module {moduleNum}</span>
                <span className={`font-sans text-xs font-semibold mt-1 ${isLocked ? 'text-gray-400' : 'text-[#14213D]/70'}`}>
                  Levels {startLevelNum} - {endLevelNum}
                </span>
                <div className="mt-4">
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
              className="flex items-center gap-1 rounded-xl bg-white border border-[#14213D]/10 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/5 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <h2 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
               <Map className="w-6 h-6 text-[#C9A227]" /> Module {activeModule} Levels
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
                    ? "border-[#C9A227] bg-[#C9A227]/10 ring-2 ring-[#C9A227]/50 shadow-lg hover:-translate-y-1"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50 hover:-translate-y-1"
                    : "border-[#14213D]/10 bg-gray-50/60 opacity-60 cursor-not-allowed"
                }`}
              >
                {/* Status Icon */}
                <div className="absolute top-3 right-3">
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
                  {isLocked && <svg className="h-4 w-4 text-[#14213D]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-xl font-bold mb-2 shadow-sm ${
                  isCurrent ? 'bg-gradient-to-br from-[#C9A227] to-amber-500 text-white' :
                  isCompleted ? 'bg-white text-emerald-600 border border-emerald-100' :
                  'bg-white text-gray-400 border border-gray-100'
                }`}>
                  {levelNum}
                </div>
                <span className={`font-sans text-xs font-bold ${isLocked ? 'text-gray-400' : 'text-[#14213D]'}`}>
                  Level {levelNum}
                </span>
                {isCurrent && (
                  <span className="mt-1 font-mono text-[9px] font-bold text-[#C9A227] uppercase tracking-wider">
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
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-xl sm:p-10 space-y-8 relative">
          <button 
            onClick={() => setActiveLevel(null)} 
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-[#14213D]/5 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Levels
          </button>
          
          {/* Top Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#14213D]">
              <span className="flex items-center gap-1 text-[#C9A227]">
                <Languages className="h-4 w-4 text-[#C9A227]" /> Level {activeLevel}
              </span>
              <span>
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
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-[#14213D]/5 px-3 py-1 font-mono text-xs font-semibold text-[#14213D]/70 uppercase tracking-wider">
              {currentQ.type === 'fitb' ? 'FILL IN THE BLANKS' : 'MULTIPLE CHOICE'}
            </span>
            
            {currentQ.type === 'fitb' ? (
              <div>
                <h2 className="font-display text-2xl font-bold text-[#14213D] leading-relaxed">
                  <span className="text-[#C9A227]">{currentQ.en}</span> <br/>
                  <span className="text-lg opacity-70 font-sans">({currentQ.ta})</span>
                </h2>
                <div className="mt-4 p-4 bg-[#F8F6F0] rounded-xl border border-[#14213D]/10">
                  <h3 className="font-telugu text-[26px] font-bold text-[#14213D]">
                    {currentQ.te_q}
                  </h3>
                  <p className="font-mono text-sm opacity-60 mt-1">{currentQ.tr_q}</p>
                </div>
              </div>
            ) : currentQ.type === 'mcq' ? (
              <div>
                <h2 className="font-display text-2xl font-bold text-[#14213D] leading-relaxed">
                  <span className="text-[#C9A227]">{currentQ.en}</span> <br/>
                  <span className="text-lg opacity-70 font-sans">({currentQ.ta})</span>
                </h2>
              </div>
            ) : (
              <h2 className="font-display text-2xl font-bold text-[#14213D]">
                What is the Telugu word for <span className="text-[#C9A227]">"{currentQ.en}"</span> ({currentQ.ta})?
              </h2>
            )}
          </div>

          {/* Question Body Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = opt.ans;

              let btnStyle = "border-[#14213D]/15 bg-white text-[#14213D] hover:bg-[#F8F6F0]";
              if (isAnswered) {
                if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-900";
                else btnStyle = "border-[#14213D]/10 opacity-50";
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
                  {isAnswered && isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-600 fill-emerald-100" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-600 fill-red-100" />}
                </button>
              );
            })}
          </div>

          {/* Answer Feedback & Explanation */}
          {isAnswered && (
            <div className="space-y-4 rounded-2xl bg-[#F8F6F0] p-5 border border-[#14213D]/10 animate-fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                {answersSubmitted[currentQ.id] ? (
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-700">
                    <XCircle className="h-4 w-4" /> Incorrect
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#14213D] py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90"
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
              You scored {scorePercentage}% accuracy on this level. Keep up the great work!
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startLevel(activeLevel)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-[#14213D]/20 bg-white px-6 py-3 font-sans text-sm font-bold text-[#14213D] hover:bg-[#F8F6F0]"
            >
              <RotateCcw className="h-4 w-4" /> Retake Level
            </button>
            
            {passed && activeLevel < totalLevels && (
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Next Level <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setActiveLevel(null)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#14213D] px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90"
            >
              <Map className="h-4 w-4 text-[#C9A227]" /> View All Levels
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
