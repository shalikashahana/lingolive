import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Activity, Play, StopCircle } from "lucide-react";
import CuteCatAvatar from "./CuteCatAvatar";
import { speakText, startVoiceRecognition, stopSpeech, stopVoiceRecognition } from "../../services/voiceSpeechService";

export default function CatReadingEvaluator({ isOpen, onClose, passage, onComplete }) {
  const [catState, setCatState] = useState("LEVEL_PASSED");
  const [catMessage, setCatMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [evaluation, setEvaluation] = useState(null); // { accuracy, wpm, mistakes }
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isOpen && passage) {
      startIntro();
    }
    return () => {
      stopSpeech();
      stopVoiceRecognition();
    };
  }, [isOpen, passage]);

  const speakCat = (text, emotion = "TALKING", onEnd = null) => {
    setCatState(emotion);
    setCatMessage(text);
    speakText(text, "english", null, () => {
      setCatState("LEVEL_PASSED");
      if (onEnd) onEnd();
    });
  };

  const startIntro = () => {
    setEvaluation(null);
    setUserTranscript("");
    setIsListening(false);
    speakCat(`Ready to read aloud? Tap the microphone and read the passage. I will listen carefully!`, "HAPPY");
  };

  const handleStartListening = () => {
    stopSpeech();
    setIsListening(true);
    setStartTime(Date.now());
    setUserTranscript("");
    setCatState("LISTENING");
    setCatMessage("I'm listening... Start reading!");
    
    // Web Speech API continuous listening might need custom handling, 
    // but we can just capture whatever they say until they hit stop.
    // Standard SpeechRecognition only captures short bursts unless continuous=true.
    // Assuming our voiceSpeechService sets it to false, we might only get short chunks.
    // For a robust implementation, we'll append to the transcript.
    // But since startVoiceRecognition in service is single-shot, let's adapt:
    
    const rec = startVoiceRecognition("english", (transcript) => {
      setUserTranscript(prev => prev ? prev + " " + transcript : transcript);
      // Restart listening to keep capturing continuous text
      if (isListening) {
        handleStartListening();
      }
    }, (err) => {
       // if error, we might just stop or retry
       if (isListening) handleStartListening();
    });
    
    // In our modified version, we might just use the native SpeechRecognition directly here for continuous:
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let finalTrans = "";
        for (let i = 0; i < e.results.length; i++) {
          finalTrans += e.results[i][0].transcript;
        }
        setUserTranscript(finalTrans);
      };
      r.onend = () => {
         if (isListening) r.start();
      };
      try {
        r.start();
        // Override service
        window.activeReadingRec = r;
      } catch (e) {}
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    setCatState("LEVEL_PASSED");
    setCatMessage("Great job! Let me analyze your reading...");
    if (window.activeReadingRec) {
      window.activeReadingRec.onend = null;
      window.activeReadingRec.stop();
      window.activeReadingRec = null;
    }
    stopVoiceRecognition();
    setTimeout(() => {
      analyzeReading(userTranscript);
    }, 1500);
  };

  const cleanWords = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w);

  const analyzeReading = (transcript) => {
    const targetWords = cleanWords(passage.body);
    const spokenWords = cleanWords(transcript);
    
    const timeSpentMs = Date.now() - startTime;
    const minutes = timeSpentMs / 60000;
    const wpm = minutes > 0 ? Math.round(spokenWords.length / minutes) : 0;
    
    // Very basic intersection matching for accuracy
    let matchCount = 0;
    const mistakes = [];
    targetWords.forEach(tw => {
      if (spokenWords.includes(tw)) {
        matchCount++;
      } else {
        mistakes.push(tw);
      }
    });

    const accuracy = targetWords.length > 0 ? Math.round((matchCount / targetWords.length) * 100) : 100;
    
    setEvaluation({ accuracy, wpm, mistakes: [...new Set(mistakes)] });
    
    if (accuracy >= 80) {
      speakCat(`Purr-fect! Your reading was excellent. You read with ${accuracy}% accuracy!`, "HAPPY", () => {
        if (onComplete) onComplete(accuracy, wpm);
      });
    } else if (accuracy >= 50) {
      speakCat(`Good effort! You got ${accuracy}% correct. Keep practicing to improve!`, "CORRECT", () => {
        if (onComplete) onComplete(accuracy, wpm);
      });
    } else {
      speakCat(`I had trouble hearing all the words. Your accuracy was ${accuracy}%. Try reading a bit clearer next time!`, "OOPS");
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
          className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={() => { 
              setIsListening(false); 
              if (window.activeReadingRec) {
                window.activeReadingRec.onend = null;
                window.activeReadingRec.stop();
              }
              stopSpeech(); 
              stopVoiceRecognition(); 
              onClose(); 
            }}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#14213D]/5 text-[#14213D]/50 transition-colors hover:bg-[#14213D]/10 hover:text-[#14213D]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center p-8 text-center overflow-y-auto">
            <div className="mb-4 text-center">
              <h2 className="font-display text-2xl font-bold text-[#14213D]">
                Cat AI Reading Evaluator
              </h2>
            </div>

            <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#F8F6F0] to-[#EAE6D7] shadow-inner shrink-0">
              <CuteCatAvatar state={catState} size={110} />
            </div>

            <div className="relative mb-6 w-full max-w-md rounded-2xl bg-[#14213D]/5 p-4 text-center">
              <p className="font-sans text-[15px] font-medium text-[#14213D]">
                {catMessage}
              </p>
            </div>

            {!evaluation ? (
              <div className="w-full space-y-6">
                <div className="bg-[#F8F6F0] p-6 rounded-2xl text-left border border-[#14213D]/10 max-h-48 overflow-y-auto">
                  <p className="font-sans text-[15px] leading-relaxed text-[#14213D]/80">
                    {passage?.body}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {isListening && (
                    <div className="w-full bg-[#14213D]/5 p-3 rounded-xl text-sm italic text-[#14213D]/60 max-h-24 overflow-y-auto">
                      "{userTranscript || "Listening..."}"
                    </div>
                  )}

                  {!isListening ? (
                    <button
                      onClick={handleStartListening}
                      className="flex items-center gap-2 rounded-2xl bg-[#C9A227] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#b08d20] hover:shadow-xl transition-all"
                    >
                      <Mic className="h-5 w-5" /> Start Reading
                    </button>
                  ) : (
                    <button
                      onClick={handleStopListening}
                      className="flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-red-600 hover:shadow-xl transition-all animate-pulse"
                    >
                      <StopCircle className="h-5 w-5" /> Stop & Evaluate
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#3F6656]/10 p-5 text-center">
                    <p className="text-sm font-bold text-[#3F6656]/80 mb-1">Accuracy</p>
                    <p className="text-3xl font-black text-[#3F6656]">{evaluation.accuracy}%</p>
                  </div>
                  <div className="rounded-2xl bg-[#C9A227]/10 p-5 text-center">
                    <p className="text-sm font-bold text-[#8C6D13] mb-1">Speed</p>
                    <p className="text-3xl font-black text-[#C9A227]">{evaluation.wpm} <span className="text-sm font-bold">WPM</span></p>
                  </div>
                </div>

                {evaluation.mistakes.length > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-left">
                    <p className="text-sm font-bold text-red-800 mb-2">Words to practice:</p>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.mistakes.slice(0, 10).map((m, idx) => (
                        <span key={idx} className="bg-white px-2 py-1 rounded-md text-xs font-mono border border-red-200 text-red-600">
                          {m}
                        </span>
                      ))}
                      {evaluation.mistakes.length > 10 && <span className="text-xs text-red-400">+{evaluation.mistakes.length - 10} more</span>}
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-[#14213D] py-4 font-bold text-white shadow-lg hover:bg-[#14213D]/90"
                >
                  Continue Learning
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
