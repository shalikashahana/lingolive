import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, Sparkles, Volume2, Mic, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, RotateCw, Lock, BookOpen, Layers, Settings, Globe, Play, Flame, Star, ChevronLeft, VolumeX, MessageSquare
} from "lucide-react";
import CuteCatAvatar from "../../components/catTeacher/CuteCatAvatar";
import GeminiKeysConfigModal from "../../components/catTeacher/GeminiKeysConfigModal";
import { get50LevelCurriculumForLanguage } from "../../services/catCurriculumService";
import { generateCatReviewSession } from "../../services/geminiTeacherService";
import { speakText, stopSpeech, startVoiceRecognition, stopVoiceRecognition } from "../../services/voiceSpeechService";

const LANGUAGES_LIST = [
  { code: "en", id: "english", name: "English", flag: "🇬🇧" },
  { code: "te", id: "telugu", name: "Telugu", flag: "🏛️" },
  { code: "ml", id: "malayalam", name: "Malayalam", flag: "🌴" },
  { code: "hi", id: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "ja", id: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", id: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "zh", id: "chinese", name: "Chinese", flag: "🇨🇳" },
  { code: "th", id: "thai", name: "Thai", flag: "🇹🇭" },
  { code: "ar", id: "arabic", name: "Arabic", flag: "🇦🇪" }
];

export default function AiCatTeacherDashboard() {
  const [selectedLangCode, setSelectedLangCode] = useState(() => {
    return localStorage.getItem("lingolive_target_language") || "en";
  });

  const selectedLangObj = LANGUAGES_LIST.find(l => l.code === selectedLangCode) || LANGUAGES_LIST[0];
  const targetLanguageId = selectedLangObj.id;

  // Unlocked level state per language
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [curriculum, setCurriculum] = useState([]);
  const [activeLevelNum, setActiveLevelNum] = useState(null); // null = level selection grid view

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Practice Stage State
  const [catState, setCatState] = useState("LEVEL_PASSED");
  const [tasksList, setTasksList] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isTaskAnswered, setIsTaskAnswered] = useState(false);
  const [isTaskCorrect, setIsTaskCorrect] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [passedReview, setPassedReview] = useState(false);

  // Reliable score ref to prevent stale async React state updates
  const correctScoreRef = useRef(0);
  const transcriptEndRef = useRef(null);

  // Load unlocked level & curriculum when language changes
  useEffect(() => {
    const savedLevel = localStorage.getItem(`lingolive_cat_unlocked_level_${targetLanguageId}`);
    setUnlockedLevel(savedLevel ? parseInt(savedLevel, 10) : 1);

    const curr = get50LevelCurriculumForLanguage(targetLanguageId);
    setCurriculum(curr);
    setActiveLevelNum(null);
  }, [targetLanguageId]);

  // Auto scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, isListening, currentTaskIndex]);

  // Start Level Voice Practice Session
  const startLevelPractice = async (levelNum) => {
    stopSpeech();
    setActiveLevelNum(levelNum);
    setLoading(true);
    setSessionCompleted(false);
    setPassedReview(false);
    correctScoreRef.current = 0;
    setCorrectCount(0);
    setCurrentTaskIndex(0);
    setIsTaskAnswered(false);
    setIsTaskCorrect(false);
    setTextInput("");
    setTranscripts([]);
    setCatState("LEVEL_PASSED");

    const levelObj = curriculum.find(l => l.level === levelNum);
    const rawItems = levelObj ? levelObj.tasks : [];

    // Fetch 5-task review session with randomized retry seed
    const generatedTasks = await generateCatReviewSession({
      language: targetLanguageId,
      category: levelObj ? levelObj.milestone : "Voice Review",
      level: levelNum,
      items: rawItems,
      retrySeed: Math.random()
    });

    setTasksList(generatedTasks);
    setLoading(false);

    if (generatedTasks && generatedTasks.length > 0) {
      startTaskTurn(generatedTasks[0], 0, generatedTasks.length, levelNum);
    }
  };

  const startTaskTurn = (qData, taskIdx, totalTasks, levelNum) => {
    setIsTaskAnswered(false);
    setIsTaskCorrect(false);
    setCatState("LEVEL_PASSED");

    const questionMsg = `Meow! 🐾 Level ${levelNum} Task (${taskIdx + 1}/${totalTasks}): ${qData.questionText}`;
    addTranscript("cat", questionMsg);

    speakCatVoice(qData.questionText, () => {
      // 400ms buffer after TTS ends before starting mic listening
      setTimeout(() => {
        autoStartListening(qData, taskIdx, totalTasks);
      }, 400);
    });
  };

  const addTranscript = (sender, text) => {
    setTranscripts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const speakCatVoice = (text, onComplete = null) => {
    setCatState("TALKING");
    speakText(text, targetLanguageId,
      () => setCatState("TALKING"),
      () => {
        setCatState(isTaskAnswered ? (isTaskCorrect ? "CORRECT" : "OOPS") : "LEVEL_PASSED");
        if (onComplete) onComplete();
      }
    );
  };

  const autoStartListening = (qData = tasksList[currentTaskIndex], taskIdx = currentTaskIndex, totalTasks = tasksList.length) => {
    if (isTaskAnswered || sessionCompleted) return;
    setIsListening(true);
    setCatState("LISTENING");

    startVoiceRecognition(
      targetLanguageId,
      (spokenText) => {
        setIsListening(false);
        evaluateAnswer(spokenText, qData, taskIdx, totalTasks);
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

    if (normUser === normCorrect || normUser.includes(normCorrect) || normCorrect.includes(normUser)) {
      return true;
    }

    const subParts = targetOption.split(/[\/\,\-]/).map((s) => normalize(s)).filter((s) => s.length >= 2);
    if (subParts.some((part) => normUser.includes(part) || part.includes(normUser))) {
      return true;
    }

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

  const evaluateAnswer = (userAnswerText, qData = tasksList[currentTaskIndex], taskIdx = currentTaskIndex, totalTasks = tasksList.length) => {
    if (isTaskAnswered || !userAnswerText || !qData) return;

    // Ignore Cat's own speech phrases if microphone picks up speaker echo
    if (
      userAnswerText.includes("Meow!") ||
      userAnswerText.includes("Task (") ||
      userAnswerText.includes("Yay! You're right") ||
      userAnswerText.includes("Oh no...")
    ) {
      return;
    }

    setIsTaskAnswered(true);
    setIsListening(false);
    stopVoiceRecognition();

    addTranscript("user", userAnswerText);

    const correctOption = qData.options[qData.correctIndex] || "";
    const acceptableAnswers = Array.isArray(qData.acceptableAnswers) ? qData.acceptableAnswers : [];

    const matches = checkAnswerMatch(userAnswerText, correctOption) ||
                    acceptableAnswers.some((ans) => checkAnswerMatch(userAnswerText, ans)) ||
                    qData.options.some((opt, idx) => idx === qData.correctIndex && checkAnswerMatch(userAnswerText, opt));

    if (matches) {
      correctScoreRef.current += 1;
      const newScore = correctScoreRef.current;
      setCorrectCount(newScore);
      setIsTaskCorrect(true);
      setCatState("CORRECT");
      const catResponse = `Correct! 🎉`;
      addTranscript("cat", catResponse);

      speakCatVoice(catResponse, () => {
        proceedToNextTurn(taskIdx, totalTasks, newScore);
      });
    } else {
      setIsTaskCorrect(false);
      setCatState("OOPS");
      const catResponse = `Incorrect! 😢 Answer: ${correctOption}`;
      addTranscript("cat", catResponse);

      speakCatVoice(catResponse, () => {
        proceedToNextTurn(taskIdx, totalTasks, correctScoreRef.current);
      });
    }
  };

  const proceedToNextTurn = (taskIdx, totalTasks, currentScore = correctScoreRef.current) => {
    if (taskIdx + 1 < totalTasks) {
      setTimeout(() => {
        const nextIdx = taskIdx + 1;
        setCurrentTaskIndex(nextIdx);
        startTaskTurn(tasksList[nextIdx], nextIdx, totalTasks, activeLevelNum);
      }, 1500);
    } else {
      // All 5 tasks completed! Check score (Min 3/5 required to unlock next level)
      setTimeout(() => {
        setSessionCompleted(true);
        const finalScore = correctScoreRef.current;

        if (finalScore >= 3) {
          setPassedReview(true);
          setCatState("CORRECT");
          const finalMsg = `🎉 Outstanding! You scored ${finalScore}/5! Level ${activeLevelNum + 1} is now UNLOCKED!`;
          addTranscript("cat", finalMsg);
          speakCatVoice(finalMsg);

          if (activeLevelNum === unlockedLevel && activeLevelNum < 50) {
            const nextLvl = activeLevelNum + 1;
            setUnlockedLevel(nextLvl);
            localStorage.setItem(`lingolive_cat_unlocked_level_${targetLanguageId}`, nextLvl.toString());
          }
        } else {
          setPassedReview(false);
          setCatState("OOPS");
          const finalMsg = `Oh no! You scored ${finalScore}/5. You need at least 3 out of 5 correct to unlock Level ${activeLevelNum + 1}. Let me ask 5 new questions from Level ${activeLevelNum}! 💪`;
          addTranscript("cat", finalMsg);
          speakCatVoice(finalMsg);
        }
      }, 1000);
    }
  };

  const handleManualTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || isTaskAnswered) return;
    const inputVal = textInput.trim();
    setTextInput("");
    evaluateAnswer(inputVal);
  };

  const currentQ = tasksList[currentTaskIndex];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 pt-4 px-4 sm:px-8 font-sans">
      
      {/* Top Header Bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#14213D] tracking-tight flex items-center gap-3">
            🐾 Cat AI Voice Teacher Dashboard
          </h1>
          <p className="text-sm font-semibold text-[#14213D]/60 mt-1">
            50-Level Voice Learning Curriculum • Pass Min 3/5 Tasks per Level to Unlock
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Target Language Switcher */}
          <div className="relative">
            <select
              value={selectedLangCode}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedLangCode(code);
                localStorage.setItem("lingolive_target_language", code);
              }}
              className="px-4 py-2.5 bg-white border border-[#14213D]/15 rounded-2xl text-xs font-bold text-[#14213D] shadow-sm focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer pr-8"
            >
              {LANGUAGES_LIST.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Container: Level Grid OR Voice Practice Stage */}
      {activeLevelNum === null ? (
        /* LEVEL SELECTION GRID (50 Levels) */
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Milestone Tabs & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-3xl border border-amber-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Milestone 1 (Levels 1–10)</h4>
                <p className="text-xs text-amber-800/80 font-medium">Essential Words & Core Vocabulary</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-3xl border border-pink-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-pink-900">Milestone 2 (Levels 11–30)</h4>
                <p className="text-xs text-pink-800/80 font-medium">Daily Expressions & Short Sentences</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-3xl border border-purple-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-900">Milestone 3 (Levels 31–50)</h4>
                <p className="text-xs text-purple-800/80 font-medium">Advanced Conversations & Quizzes</p>
              </div>
            </div>
          </div>

          {/* 50 Level Cards Grid */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-[#14213D]/10 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-4">
              <span className="text-base font-extrabold text-[#14213D] flex items-center gap-2">
                {selectedLangObj.flag} {selectedLangObj.name} Curriculum Levels
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Unlocked: Level 1 to {unlockedLevel} / 50
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
              {curriculum.map((item) => {
                const isCompleted = item.level < unlockedLevel;
                const isCurrentUnlocked = item.level === unlockedLevel;
                const isLocked = item.level > unlockedLevel;

                let cardStyle = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
                if (isCompleted) {
                  cardStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 hover:scale-105 cursor-pointer shadow-sm";
                } else if (isCurrentUnlocked) {
                  cardStyle = "bg-gradient-to-br from-amber-400 to-pink-400 text-white font-black border-2 border-amber-300 shadow-lg scale-105 cursor-pointer animate-pulse";
                }

                return (
                  <button
                    key={item.level}
                    disabled={isLocked}
                    onClick={() => startLevelPractice(item.level)}
                    className={`h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all p-2 relative ${cardStyle}`}
                  >
                    <span className="text-xs font-mono font-bold">L{item.level}</span>
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isCurrentUnlocked && <Play className="w-5 h-5 text-white" />}
                    {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    <span className="text-[9px] truncate max-w-full font-sans text-center opacity-80">
                      {item.milestoneType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* ACTIVE VOICE PRACTICE STAGE (5 Tasks per Level) */
        <div className="max-w-3xl mx-auto space-y-4">
          
          <button
            onClick={() => {
              stopSpeech();
              setActiveLevelNum(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to 50 Levels Grid
          </button>

          <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6] rounded-3xl shadow-2xl border-4 border-amber-200/90 overflow-hidden flex flex-col">
            
            {/* Stage Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-amber-500/10 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-amber-500 text-white rounded-full text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  {selectedLangObj.name.toUpperCase()} • LEVEL {activeLevelNum}
                </span>
                <span className="text-xs font-bold text-amber-900/80">
                  Target: Score Min 3/5 to Unlock Level {activeLevelNum + 1}
                </span>
              </div>
            </div>

            {/* Task Progress Bar */}
            <div className="bg-amber-100/60 px-6 py-2.5 border-b border-amber-200/40 flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Current Score: {correctCount}/5</span>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-full transition-all ${
                      idx < currentTaskIndex || sessionCompleted
                        ? "w-6 bg-emerald-500"
                        : idx === currentTaskIndex
                        ? "w-6 bg-amber-500 animate-pulse"
                        : "w-3 bg-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-mono">{sessionCompleted ? "5/5" : `${currentTaskIndex + 1}/5`}</span>
              </div>
            </div>

            {/* Cat Stage & Visual Display */}
            <div className="p-6 space-y-4">
              
              <div className="text-center">
                {sessionCompleted ? (
                  passedReview ? (
                    <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tracking-wide">
                      ✨ LEVEL {activeLevelNum} PASSED ({correctCount}/5)! LEVEL {activeLevelNum + 1} UNLOCKED! ✨
                    </motion.h3>
                  ) : (
                    <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-rose-500 tracking-wide">
                      🔒 SCORE {correctCount}/5 • NEED MIN 3/5 TO UNLOCK NEXT LEVEL
                    </motion.h3>
                  )
                ) : catState === "CORRECT" ? (
                  <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-emerald-600 tracking-wide">
                    ✨ CORRECT! ✨
                  </motion.h3>
                ) : catState === "OOPS" ? (
                  <motion.h3 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-2xl font-black text-rose-500 tracking-wide">
                    💪 KEEP TRYING! 💪
                  </motion.h3>
                ) : (
                  <h3 className="text-2xl font-black text-amber-900 tracking-wide">
                    🎉 LEVEL {activeLevelNum} VOICE PRACTICE 🎉
                  </h3>
                )}
              </div>

              {/* Cat Avatar Display */}
              <div className="flex justify-center py-2 relative">
                <CuteCatAvatar state={catState} size={170} />

                {isListening && (
                  <div className="absolute top-0 bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg animate-bounce flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Listening to your voice...
                  </div>
                )}
              </div>

              {/* Real-time Voice AI Transcript Box */}
              <div className="bg-white/90 border-2 border-amber-200/80 rounded-2xl p-4 shadow-inner space-y-3 min-h-[160px] max-h-[240px] overflow-y-auto">
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
                    Cat AI Teacher is preparing Level {activeLevelNum} tasks...
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

              {/* Option Cards Fallback */}
              {currentQ && currentQ.options && !sessionCompleted && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {currentQ.options.map((opt, idx) => {
                    const isCorrectOpt = idx === currentQ.correctIndex;
                    let optStyle = "bg-white border-gray-200 hover:bg-amber-50 text-gray-800";
                    if (isTaskAnswered) {
                      if (isCorrectOpt) optStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold";
                      else optStyle = "bg-gray-100 border-gray-200 text-gray-400 opacity-60";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isTaskAnswered}
                        onClick={() => evaluateAnswer(opt)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between shadow-sm ${optStyle}`}
                      >
                        <span className="truncate pr-1">{opt}</span>
                        {isTaskAnswered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-gray-50/90 border-t border-amber-200/60 flex flex-col gap-3">
              <form onSubmit={handleManualTextSubmit} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => autoStartListening()}
                  disabled={isTaskAnswered || isListening || sessionCompleted}
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
                  disabled={isTaskAnswered || sessionCompleted}
                  placeholder="Or type your answer..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                />

                {!sessionCompleted ? (
                  <button
                    type="submit"
                    disabled={!textInput.trim() || isTaskAnswered}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Send
                  </button>
                ) : passedReview ? (
                  <button
                    type="button"
                    onClick={() => startLevelPractice(activeLevelNum + 1)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 animate-bounce"
                  >
                    Start Level {activeLevelNum + 1} <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startLevelPractice(activeLevelNum)}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  >
                    Retry Level {activeLevelNum} <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Gemini Keys Config Modal */}
      <GeminiKeysConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
