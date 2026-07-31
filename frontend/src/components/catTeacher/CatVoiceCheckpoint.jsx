import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Check, XCircle, SkipForward, Play, Volume2 } from "lucide-react";
import CuteCatAvatar from "./CuteCatAvatar";
import { speakText, startVoiceRecognition, stopSpeech, stopVoiceRecognition } from "../../services/voiceSpeechService";

export default function CatVoiceCheckpoint({ isOpen, onClose, phaseData, onComplete, learningLanguage = "english", sourceLanguage = "tamil" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [catState, setCatState] = useState("LEVEL_PASSED");
  const [catMessage, setCatMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // References
  const items = phaseData?.sentences || [];
  
  // Use ref to avoid stale closures in callbacks
  const getCurrentItem = () => items[currentIndexRef.current];

  useEffect(() => {
    if (isOpen && phaseData) {
      startSession();
    }
    return () => {
      stopSpeech();
      stopVoiceRecognition();
    };
  }, [isOpen, phaseData]);

  const speakCat = (text, emotion = "TALKING", onEnd = null) => {
    setCatState(emotion);
    setCatMessage(text);
    speakText(text, "english", null, () => {
      setCatState("LEVEL_PASSED");
      if (onEnd) onEnd();
    });
  };

  const startSession = () => {
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setScore(0);
    setIsCompleted(false);
    setUserTranscript("");
    
    // Determine prompt based on target language
    const langName = learningLanguage.charAt(0).toUpperCase() + learningLanguage.slice(1);
    const sourceName = sourceLanguage.charAt(0).toUpperCase() + sourceLanguage.slice(1);
    const introMsg = `Let's practice ${phaseData.phase}! I will say the ${sourceName} meaning, and you tell me the ${langName} phrase.`;
    
    speakCat(introMsg, "HAPPY", () => {
      askCurrentQuestion(0);
    });
  };

  const askCurrentQuestion = (index) => {
    if (index >= items.length) {
      finishSession();
      return;
    }
    const item = items[index];
    setUserTranscript("");
    
    const sourceText = item[sourceLanguage];
    const fullMessage = `How do you say: "${sourceText}" ?`;
    setCatState("TALKING");
    setCatMessage(fullMessage);
    
    // Speak prompt part first, then the source text with correct voice
    speakText("How do you say", "english", null, () => {
      speakText(sourceText, sourceLanguage, null, () => {
        setCatState("LEVEL_PASSED");
        handleStartListening();
      });
    });
  };

  const handleStartListening = () => {
    setIsListening(true);
    setCatState("LISTENING");
    // We intentionally do NOT change catMessage here so the user can still read the question!
    
    startVoiceRecognition(learningLanguage, (transcript) => {
      setIsListening(false);
      setUserTranscript(transcript);
      evaluateAnswer(transcript);
    }, (error) => {
      setIsListening(false);
      setCatState("OOPS");
      setCatMessage("Oops, I couldn't hear you clearly. Please try again or skip.");
    });
  };

  const cleanText = (text) => text.toLowerCase().replace(/[.,!?;:]/g, "").trim();

  const evaluateAnswer = (transcript) => {
    const item = getCurrentItem();
    if (!item) return;
    const target = cleanText(item[learningLanguage]);
    const spoken = cleanText(transcript);
    
    // Simple evaluation (if spoken contains main words or is close enough)
    if (spoken.includes(target) || target.includes(spoken) || spoken.length > target.length * 0.7) {
      setScore(prev => prev + 1);
      speakCat(`Purr-fect! You said it right! The answer is: ${item[learningLanguage]}`, "CORRECT", () => {
        nextQuestion();
      });
    } else {
      speakCat(`Good try, but the correct phrase is: ${item[learningLanguage]}. Let's move on!`, "OOPS", () => {
        nextQuestion();
      });
    }
  };

  const nextQuestion = () => {
    const nextIdx = currentIndexRef.current + 1;
    setCurrentIndex(nextIdx);
    currentIndexRef.current = nextIdx;
    
    if (nextIdx < items.length) {
      setTimeout(() => askCurrentQuestion(nextIdx), 1000);
    } else {
      finishSession();
    }
  };

  const skipQuestion = () => {
    stopSpeech();
    stopVoiceRecognition();
    setIsListening(false);
    const item = getCurrentItem();
    speakCat(`Okay, skipping! The answer was: ${item?.[learningLanguage] || ""}`, "OOPS", () => {
      nextQuestion();
    });
  };

  const finishSession = () => {
    setIsCompleted(true);
    const passPercentage = (score / items.length) * 100;
    if (passPercentage >= 70) {
      speakCat(`Meow-velous! You completed the phase with a great score of ${score} out of ${items.length}!`, "HAPPY");
      if (onComplete) onComplete(score, items.length);
    } else {
      speakCat(`You scored ${score} out of ${items.length}. Keep practicing to get better!`, "WAVING");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14213D]/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={() => { stopSpeech(); stopVoiceRecognition(); onClose(); }}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#14213D]/5 text-[#14213D]/50 transition-colors hover:bg-[#14213D]/10 hover:text-[#14213D]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center p-8 text-center">
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="font-display text-2xl font-bold text-[#14213D]">
                Cat AI Oral Exam
              </h2>
              <p className="font-sans text-[#14213D]/60 text-sm mt-1">
                {phaseData?.phase}
              </p>
            </div>

            {/* Cat Stage */}
            <div className="relative mb-6 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-[#F8F6F0] to-[#EAE6D7] shadow-inner">
              <CuteCatAvatar state={catState} size={150} />
            </div>

            {/* Dialogue Bubble */}
            <div className="relative mb-8 w-full max-w-md rounded-2xl bg-[#14213D]/5 p-5 text-center">
              <p className="font-sans text-lg font-medium text-[#14213D]">
                {catMessage}
              </p>
            </div>

            {/* Interaction Area */}
            {!isCompleted ? (
              <div className="w-full space-y-6">
                <div className="flex justify-between text-xs font-bold text-[#14213D]/50 px-4">
                  <span>Question {currentIndex + 1} of {items.length}</span>
                  <span>Score: {score}</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#14213D]/5">
                  <motion.div
                    className="h-full bg-[#C9A227]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / items.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="mt-4 min-h-[60px] bg-white/50 rounded-xl p-3 border border-[#14213D]/10 text-sm font-medium text-[#14213D]/80">
                  {userTranscript ? `You said: "${userTranscript}"` : (isListening ? "Listening..." : "Tap mic to answer")}
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={skipQuestion}
                    disabled={isListening}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-[#14213D]/10 bg-white text-[#14213D]/50 hover:bg-[#14213D]/5 disabled:opacity-50"
                  >
                    <SkipForward className="h-6 w-6" />
                  </button>
                  <button
                    onClick={isListening ? stopVoiceRecognition : handleStartListening}
                    className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-[#14213D] text-white hover:scale-105"
                    }`}
                  >
                    <Mic className={`h-7 w-7 ${isListening ? "animate-bounce" : ""}`} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="rounded-2xl bg-[#3F6656]/10 p-6 text-center">
                  <h3 className="font-display text-2xl font-bold text-[#3F6656] mb-2">Phase Completed!</h3>
                  <p className="text-4xl font-black text-[#14213D] mb-4">{score} <span className="text-xl text-[#14213D]/50">/ {items.length}</span></p>
                  <p className="text-sm font-medium text-[#3F6656]/80">Excellent work! You've passed the oral checkpoint.</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-[#14213D] py-4 font-bold text-white shadow-lg hover:bg-[#14213D]/90 hover:shadow-xl"
                >
                  Return to Lessons
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
