import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import englishTamilQuizData from "../../data/englishTamilQuizData.json";
import { useAuth } from "../../context/AuthContext";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Map,
  X
} from "lucide-react";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const levelNum = parseInt(searchParams.get("level") || "13", 10);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
  // Track if we are doing initial load so we don't accidentally overwrite DB with default state
  const isInitialLoad = useRef(true);

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      setLoadingProgress(true);
      if (user) {
        try {
          const token = await user.getIdToken();
          const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          const res = await fetch(`${baseUrl}/progress/level/${levelNum}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.quiz_state && Object.keys(data.quiz_state).length > 0) {
              const qs = data.quiz_state;
              setCurrentIndex(qs.currentIndex || 0);
              setAnswersSubmitted(qs.answersSubmitted || {});
              setScoreCount(qs.scoreCount || 0);
              setQuizFinished(qs.quizFinished || false);
            }
          }
        } catch (e) {
          console.error("Failed to load quiz progress from backend", e);
          // Fallback to local storage if API fails
          const saved = localStorage.getItem(`mozhify_quiz_progress_${levelNum}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setCurrentIndex(parsed.currentIndex || 0);
              setAnswersSubmitted(parsed.answersSubmitted || {});
              setScoreCount(parsed.scoreCount || 0);
              setQuizFinished(parsed.quizFinished || false);
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      setSelectedOption(null);
      
      // Always load 10 questions per level from user's full Tamil-to-English dataset
      const totalAvailableLevels = Math.max(1, Math.ceil(englishTamilQuizData.length / 10));
      const startIndex = ((levelNum - 1) % totalAvailableLevels) * 10;
      const levelItems = englishTamilQuizData.slice(startIndex, startIndex + 10);

      const realQuestions = levelItems.map((item) => {
        const correctIdx = item.options.indexOf(item.correct_answer);
        return {
          id: item.id,
          type: "mcq",
          question: `What is the English word for "${item.question_tamil}" (${item.tamil_transliteration})?`,
          question_tamil: item.question_tamil,
          tamil_transliteration: item.tamil_transliteration,
          options: item.options,
          correct_index: correctIdx >= 0 ? correctIdx : 0,
          correct_answer: item.correct_answer,
          explanation: `"${item.question_tamil}" (${item.tamil_transliteration}) means "${item.correct_answer}".`
        };
      });

      setQuestions(realQuestions);
      setLoadingProgress(false);
      isInitialLoad.current = false;
    };

    fetchProgress();
  }, [levelNum, user]);

  // Save progress on state change
  useEffect(() => {
    if (isInitialLoad.current || loadingProgress) return;
    
    const state = { currentIndex, answersSubmitted, scoreCount, quizFinished };
    
    // Always save locally as fallback
    localStorage.setItem(
      `mozhify_quiz_progress_${levelNum}`,
      JSON.stringify(state)
    );

    if (quizFinished) {
      const scorePercentage = Math.round((scoreCount / questions.length) * 100);
      const passed = scorePercentage >= 80;
      if (passed) {
        const currentMax = parseInt(localStorage.getItem('mozhify_max_unlocked_level') || '1', 10);
        if (levelNum + 1 > currentMax) {
          localStorage.setItem('mozhify_max_unlocked_level', (levelNum + 1).toString());
        }
      }
    }
    
    // Save to backend
    const saveProgress = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          await fetch(`${baseUrl}/progress/level/${levelNum}/test-state`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              last_attempted_test_id: currentIndex,
              quiz_state: state
            })
          });
        } catch (e) {
          console.error("Failed to save quiz progress to backend", e);
        }
      }
    };
    
    saveProgress();
  }, [levelNum, currentIndex, answersSubmitted, scoreCount, quizFinished, user, loadingProgress]);

  const maxUnlocked = parseInt(localStorage.getItem('mozhify_max_unlocked_level') || '1', 10);
  const alreadyCompleted = levelNum < maxUnlocked;

  if (alreadyCompleted) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 pb-16 pt-8">
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-8 text-center shadow-2xl space-y-6 sm:p-12 relative animate-fade-in">
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-[#14213D]/5 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-[#14213D]">
              You have completed successfully!
            </h2>
            <p className="font-sans text-sm text-[#14213D]/70 max-w-md mx-auto">
              You have already mastered Level {levelNum}.
            </p>
          </div>
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate(`/quiz?level=${levelNum + 1}`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#14213D] px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90 transition"
            >
              <span>Unlock Next Level</span>
              <ArrowRight className="h-4 w-4 text-[#C9A227]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingProgress || generatingQuiz) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#14213D] animate-bounce text-[#C9A227]">
          <Zap className="h-6 w-6" />
        </div>
        <div className="text-[#14213D] font-semibold animate-pulse">
          {generatingQuiz ? "Gemma is crafting your personalized quiz..." : "Loading Test Progress..."}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-red-500 font-semibold">Failed to load quiz. Please try again later.</div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = answersSubmitted[currentQ.id] !== undefined;

  const handleMCQSubmit = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQ.correct_index;
    setAnswersSubmitted((prev) => ({ ...prev, [currentQ.id]: isCorrect }));
    if (isCorrect) setScoreCount((prev) => prev + 1);
  };

  const handleFillSubmit = (e) => {
    e.preventDefault();
    if (isAnswered || !textAnswer.trim()) return;
    const isCorrect = textAnswer.trim().toLowerCase() === currentQ.correct_answer.toLowerCase();
    setAnswersSubmitted((prev) => ({ ...prev, [currentQ.id]: isCorrect }));
    if (isCorrect) setScoreCount((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTextAnswer("");
    } else {
      setQuizFinished(true);
    }
  };

  const scorePercentage = Math.round((scoreCount / questions.length) * 100);
  const passed = scorePercentage >= 80;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {!quizFinished ? (
        <div className="rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-xl sm:p-10 space-y-8 relative">
          <button 
            onClick={() => navigate('/')} 
            className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-[#14213D]/5 px-3 py-1.5 font-sans text-xs font-bold text-[#14213D]/60 hover:bg-[#14213D]/10 transition"
          >
            <X className="h-3.5 w-3.5" /> Exit Quiz
          </button>
          {/* Top Progress bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#14213D]">
              <span className="flex items-center gap-1 text-[#C9A227]">
                <Zap className="h-4 w-4 fill-[#C9A227]" /> Level {levelNum} Quiz
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
              {currentQ.type}
            </span>
            <h2 className="font-display text-2xl font-bold text-[#14213D]">
              {currentQ.question}
            </h2>
          </div>

          {/* Question Body Options */}
          {currentQ.type === "fill-blank" ? (
            <form onSubmit={handleFillSubmit} className="space-y-4">
              <input
                type="text"
                disabled={isAnswered}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here…"
                className="w-full rounded-2xl border border-[#14213D]/20 bg-[#F8F6F0] p-4 font-sans text-base text-[#14213D] outline-none focus:border-[#3F6656] focus:ring-2 focus:ring-[#3F6656]/20 disabled:opacity-70"
              />
              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!textAnswer.trim()}
                  className="w-full rounded-xl bg-[#C9A227] py-3 font-sans text-sm font-bold text-[#14213D] shadow-md transition hover:brightness-105 disabled:opacity-50"
                >
                  Submit Answer
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correct_index;

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
                    onClick={() => handleMCQSubmit(idx)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 font-sans text-sm text-left transition ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600 fill-red-100" />}
                  </button>
                );
              })}
            </div>
          )}

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
              <p className="font-sans text-xs text-[#14213D]/80 leading-relaxed">
                {currentQ.explanation}
              </p>
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
              Level {levelNum} Evaluation
            </span>
            <h2 className="font-display text-3xl font-bold text-[#14213D]">
              {passed ? "Congratulations! Level Unlocked" : "Keep Practicing!"}
            </h2>
            <p className="font-sans text-sm text-[#14213D]/70 max-w-md mx-auto">
              {passed
                ? `You scored ${scorePercentage}% accuracy and unlocked the next level on your roadmap!`
                : `You scored ${scorePercentage}%. An 80% accuracy score is required to unlock Level ${levelNum + 1}.`}
            </p>
          </div>

          {/* Stats Box */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-[#F8F6F0] p-4 text-center">
            <div>
              <p className="font-mono text-2xl font-bold text-[#14213D]">{scorePercentage}%</p>
              <p className="text-[11px] text-[#14213D]/60">Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-[#C9A227]">+{passed ? 150 : 30} XP</p>
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
              onClick={() => {
                setQuizFinished(false);
                setCurrentIndex(0);
                setScoreCount(0);
                setAnswersSubmitted({});
                localStorage.removeItem(`mozhify_quiz_progress_${levelNum}`);
                localStorage.removeItem(`mozhify_quiz_questions_${levelNum}`);
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-[#14213D]/20 bg-white px-6 py-3 font-sans text-sm font-bold text-[#14213D] hover:bg-[#F8F6F0]"
            >
              <RotateCcw className="h-4 w-4" /> Retake Quiz
            </button>
            {passed ? (
              <button
                onClick={() => {
                  setQuizFinished(false);
                  setCurrentIndex(0);
                  setScoreCount(0);
                  setAnswersSubmitted({});
                  navigate(`/quiz?level=${levelNum + 1}`);
                }}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#14213D] px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90"
              >
                <span>Proceed to Level {levelNum + 1}</span>
                <ArrowRight className="h-4 w-4 text-[#C9A227]" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-[#14213D] px-6 py-3 font-sans text-sm font-bold text-white shadow-md hover:bg-[#14213D]/90"
              >
                <Map className="h-4 w-4 text-[#C9A227]" /> Return to Roadmap
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
