import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, Mic, CheckCircle2, XCircle, ArrowRight, Settings, RotateCw, X, Award, MessageSquare, RotateCcw } from "lucide-react";
import CuteCatAvatar from "./CuteCatAvatar";
import { speakText, stopSpeech, startVoiceRecognition } from "../../services/voiceSpeechService";
import { generateCatReviewSession } from "../../services/geminiTeacherService";

export default function CatTeacherModal({
  isOpen,
  onClose,
  language = "english",
  category = "Quiz",
  level = 1,
  items = [],
  onOpenSettings,
  onUnlockNextLevel
}) {
  const [catState, setCatState] = useState("LEVEL_PASSED");
  const [questionsList, setQuestionsList] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Real-time Conversation Transcript & Score State
  const [transcripts, setTranscripts] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isStepAnswered, setIsStepAnswered] = useState(false);
  const [isStepCorrect, setIsStepCorrect] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [passedReview, setPassedReview] = useState(false);

  const transcriptEndRef = useRef(null);

  // Auto scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, isListening, currentStepIndex]);

  // Load review session when modal opens
  useEffect(() => {
    if (isOpen) {
      loadReviewSession();
    } else {
      stopSpeech();
    }
  }, [isOpen, level, language, category]);

  const loadReviewSession = async () => {
    setLoading(true);
    setSessionCompleted(false);
    setPassedReview(false);
    setCorrectCount(0);
    setCurrentStepIndex(0);
    setIsStepAnswered(false);
    setIsStepCorrect(false);
    setTextInput("");
    setTranscripts([]);
    setCatState("LEVEL_PASSED");

    // Fetch 5-question review session with unique retry seed
    const list = await generateCatReviewSession({ language, category, level, items, retrySeed: Math.random() });
    setQuestionsList(list);
    setLoading(false);

    if (list && list.length > 0) {
      startQuestionTurn(list[0], 0, list.length);
    }
  };

  const startQuestionTurn = (qData, stepIdx, totalSteps) => {
    setIsStepAnswered(false);
    setIsStepCorrect(false);
    setCatState("LEVEL_PASSED");

    const headerMsg = `Meow! 🐾 Level ${level} Voice Review (${stepIdx + 1}/${totalSteps}): ${qData.questionText}`;
    addTranscript("cat", headerMsg);

    speakCatVoice(qData.questionText, () => {
      // Auto-start mic listening after Cat finishes reading question!
      autoStartListening(qData, stepIdx, totalSteps);
    });
  };

  const addTranscript = (sender, text) => {
    setTranscripts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender, // 'cat' or 'user'
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const speakCatVoice = (text, onComplete = null) => {
    setCatState("TALKING");
    speakText(text, language, 
      () => setCatState("TALKING"),
      () => {
        setCatState(isStepAnswered ? (isStepCorrect ? "CORRECT" : "OOPS") : "LEVEL_PASSED");
        if (onComplete) onComplete();
      }
    );
  };

  const autoStartListening = (qData = questionsList[currentStepIndex], stepIdx = currentStepIndex, totalSteps = questionsList.length) => {
    if (isStepAnswered || sessionCompleted) return;
    setIsListening(true);
    setCatState("LISTENING");

    startVoiceRecognition(
      language,
      (spokenText) => {
        setIsListening(false);
        evaluateAnswer(spokenText, qData, stepIdx, totalSteps);
      },
      (err) => {
        setIsListening(false);
        setCatState("LEVEL_PASSED");
      }
    );
  };

  const checkAnswerMatch = (userText, targetOption) => {
    if (!userText || !targetOption) return false;

    const normalize = (str) =>
      str
        .toLowerCase()
        .replace(/[\/\-\_\,\.\?\!\;\:\(\)\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normUser = normalize(userText);
    const normCorrect = normalize(targetOption);

    // 1. Direct normalized match or inclusion
    if (normUser === normCorrect || normUser.includes(normCorrect) || normCorrect.includes(normUser)) {
      return true;
    }

    // 2. Sub-phrase match (e.g. if option is "Welcome / Greetings", check "welcome" or "greetings")
    const subParts = targetOption.split(/[\/\,\-]/).map((s) => normalize(s)).filter((s) => s.length >= 2);
    if (subParts.some((part) => normUser.includes(part) || part.includes(normUser))) {
      return true;
    }

    // 3. Word token overlap match (if at least 50% of words in correct answer match user input)
    const userWords = normUser.split(" ").filter((w) => w.length > 1);
    const correctWords = normCorrect.split(" ").filter((w) => w.length > 1);
    if (correctWords.length > 0) {
      const matchCount = correctWords.filter((w) => userWords.includes(w)).length;
      if (matchCount / correctWords.length >= 0.5) {
        return true;
      }
    }

    return false;
  };

  const evaluateAnswer = (userAnswerText, qData = questionsList[currentStepIndex], stepIdx = currentStepIndex, totalSteps = questionsList.length) => {
    if (isStepAnswered || !userAnswerText || !qData) return;
    setIsStepAnswered(true);
    setIsListening(false);
    
    // Add user speech to transcript
    addTranscript("user", userAnswerText);

    const correctOption = qData.options[qData.correctIndex] || "";
    const acceptableAnswers = Array.isArray(qData.acceptableAnswers) ? qData.acceptableAnswers : [];
    
    // Check correctness using smart normalization & acceptable answer pool
    const matches = checkAnswerMatch(userAnswerText, correctOption) ||
                    acceptableAnswers.some((ans) => checkAnswerMatch(userAnswerText, ans)) ||
                    qData.options.some((opt, idx) => idx === qData.correctIndex && checkAnswerMatch(userAnswerText, opt));

    let updatedCorrectCount = correctCount;
    if (matches) {
      updatedCorrectCount = correctCount + 1;
      setCorrectCount(updatedCorrectCount);
      setIsStepCorrect(true);
      setCatState("CORRECT");
      const catResponse = `Correct! 🎉`;
      addTranscript("cat", catResponse);
      
      speakCatVoice(catResponse, () => {
        proceedToNextTurn(stepIdx, totalSteps, updatedCorrectCount);
      });
    } else {
      setIsStepCorrect(false);
      setCatState("OOPS");
      const catResponse = `Incorrect! 😢 Answer: ${correctOption}`;
      addTranscript("cat", catResponse);
      
      speakCatVoice(catResponse, () => {
        proceedToNextTurn(stepIdx, totalSteps, updatedCorrectCount);
      });
    }
  };

  const proceedToNextTurn = (stepIdx, totalSteps, currentScore = correctCount) => {
    if (stepIdx + 1 < totalSteps) {
      setTimeout(() => {
        const nextIdx = stepIdx + 1;
        setCurrentStepIndex(nextIdx);
        startQuestionTurn(questionsList[nextIdx], nextIdx, totalSteps);
      }, 1500);
    } else {
      // All 3 review questions completed! Check score (Minimum 2/3 required to pass)
      setTimeout(() => {
        setSessionCompleted(true);
        if (currentScore >= 2) {
          setPassedReview(true);
          setCatState("CORRECT");
          const finalMsg = `🎉 Outstanding! You scored ${currentScore}/3! Level ${level + 1} is now UNLOCKED!`;
          addTranscript("cat", finalMsg);
          speakCatVoice(finalMsg);
          if (onUnlockNextLevel) {
            onUnlockNextLevel(level + 1);
          }
        } else {
          setPassedReview(false);
          setCatState("OOPS");
          const finalMsg = `Oh no! You scored ${currentScore}/3. You need at least 2/3 correct to unlock Level ${level + 1}. Let's retry 3 new questions from Level ${level}! 💪`;
          addTranscript("cat", finalMsg);
          speakCatVoice(finalMsg);
        }
      }, 1000);
    }
  };

  const handleManualTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isStepAnswered) return;
    const inputVal = textInput.trim();
    setTextInput("");
    evaluateAnswer(inputVal);
  };

  if (!isOpen) return null;

  const currentQ = questionsList[currentStepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6] rounded-3xl shadow-2xl border-4 border-amber-200/90 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 bg-amber-500 text-white rounded-full text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              {language.toUpperCase()} • LEVEL {level} REVIEW
            </span>
            <span className="text-xs font-bold text-amber-900/80">
              {passedReview ? `➡️ Next: Level ${level + 1}` : `🔒 Target: Score Min 2/3`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Configure Gemini API Keys"
                className="p-2 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition-all shadow-sm"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-amber-200 text-gray-500 hover:text-gray-900 transition-all shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="bg-amber-100/60 px-6 py-2 border-b border-amber-200/40 flex items-center justify-between text-xs font-bold text-amber-900">
          <span>Score: {correctCount}/3 (Need Min 2/3 to unlock Level {level + 1})</span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  idx < currentStepIndex || sessionCompleted
                    ? "w-8 bg-emerald-500"
                    : idx === currentStepIndex
                    ? "w-8 bg-amber-500 animate-pulse"
                    : "w-4 bg-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 font-mono">{sessionCompleted ? "3/3" : `${currentStepIndex + 1}/3`}</span>
          </div>
        </div>

        {/* Main Body: Cat Avatar + Conversation Transcript */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Top Status Banner */}
          <div className="text-center">
            {sessionCompleted ? (
              passedReview ? (
                <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tracking-wide flex items-center justify-center gap-2">
                  ✨ PASSED ({correctCount}/3)! LEVEL {level + 1} UNLOCKED! ✨
                </motion.h3>
              ) : (
                <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-rose-500 tracking-wide flex items-center justify-center gap-2">
                  🔒 SCORE {correctCount}/3 - RETRY NEEDED (MIN 2/3 REQUIRED)
                </motion.h3>
              )
            ) : catState === "CORRECT" ? (
              <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tracking-wide flex items-center justify-center gap-2">
                ✨ CORRECT! ✨
              </motion.h3>
            ) : catState === "OOPS" ? (
              <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-rose-500 tracking-wide flex items-center justify-center gap-2">
                💪 KEEP TRYING! 💪
              </motion.h3>
            ) : (
              <h3 className="text-2xl font-black text-amber-900 tracking-wide flex items-center justify-center gap-2">
                🎉 LEVEL {level} VOICE REVIEW 🎉
              </h3>
            )}
            <p className="text-xs font-bold text-amber-800/80 mt-0.5">
              Score at least 2 out of 3 correct to unlock Level {level + 1}!
            </p>
          </div>

          {/* Cat Avatar Display */}
          <div className="flex justify-center py-1 relative">
            <CuteCatAvatar state={catState} size={160} />

            {/* Listening Pulse Indicator */}
            {isListening && (
              <div className="absolute top-2 bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Listening to your voice...
              </div>
            )}
          </div>

          {/* Live Conversation Transcript Window */}
          <div className="bg-white/90 border-2 border-amber-200/80 rounded-2xl p-4 shadow-inner space-y-3 min-h-[160px] max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900/70 border-b border-amber-100 pb-2">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Real-Time Voice AI Transcript
              </span>
              <button 
                onClick={() => currentQ && speakCatVoice(currentQ.questionText)}
                className="hover:text-amber-900 flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Replay Voice
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs font-bold text-amber-800">
                <RotateCw className="w-4 h-4 animate-spin text-amber-600" />
                Cat Teacher is preparing Level {level} review questions...
              </div>
            ) : (
              <div className="space-y-3">
                {transcripts.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: item.sender === "user" ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-2.5 ${item.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {item.sender === "cat" && (
                      <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs flex-shrink-0">
                        🐱
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        item.sender === "user"
                          ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-br-none"
                          : "bg-amber-50 border border-amber-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <div className="text-[9px] opacity-75 font-mono mb-0.5">
                        {item.sender === "user" ? "🎙️ You (Voice)" : "🐾 Cat AI Teacher"} • {item.timestamp}
                      </div>
                      {item.text}
                    </div>

                    {item.sender === "user" && (
                      <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                        👤
                      </div>
                    )}
                  </motion.div>
                ))}

                {isListening && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end gap-2.5">
                    <div className="bg-rose-100 border border-rose-300 text-rose-800 px-3 py-2 rounded-2xl text-xs font-bold animate-pulse flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-600 animate-bounce" /> Listening to your answer...
                    </div>
                  </motion.div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>

          {/* Quick Option Cards Fallback for Current Question */}
          {currentQ && currentQ.options && !sessionCompleted && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-gray-500 flex justify-between items-center">
                <span>Or select option answer:</span>
                <span className="text-[10px] text-amber-700">Click or speak option name</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {currentQ.options.map((opt, idx) => {
                  const isCorrectOpt = idx === currentQ.correctIndex;
                  let optStyle = "bg-white border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-gray-800";
                  if (isStepAnswered) {
                    if (isCorrectOpt) optStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold";
                    else optStyle = "bg-gray-100 border-gray-200 text-gray-400 opacity-60";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isStepAnswered}
                      onClick={() => evaluateAnswer(opt)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between shadow-sm ${optStyle}`}
                    >
                      <span className="truncate pr-1">{opt}</span>
                      {isStepAnswered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-gray-50/90 border-t border-amber-200/60 flex flex-col gap-3">
          
          <form onSubmit={handleManualTextSubmit} className="flex gap-2">
            <button
              type="button"
              onClick={() => autoStartListening()}
              disabled={isStepAnswered || isListening || sessionCompleted}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white"
              }`}
            >
              <Mic className={`w-4 h-4 ${isListening ? "animate-bounce" : ""}`} />
              {isListening ? "Listening..." : "Tap to Speak"}
            </button>

            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isStepAnswered || sessionCompleted}
              placeholder="Or type your answer..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />

            {!sessionCompleted ? (
              <button
                type="submit"
                disabled={!textInput.trim() || isStepAnswered}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
              >
                Send
              </button>
            ) : passedReview ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 animate-bounce"
              >
                Start Level {level + 1} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={loadReviewSession}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                Retry Level {level} Review <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </form>

        </div>

      </motion.div>
    </div>
  );
}
