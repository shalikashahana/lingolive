import React, { useState, useEffect, useMemo } from "react";
import { calculateNewStreak } from "../../utils/streak";
import { useNavigate } from "react-router-dom";
import alphabetData from "../../data/malayalamAlphabetData.json";
import malayalamWordsData from "../../data/malayalamWordsData.json";
import malayalamNumbersData from "../../data/malayalamNumbersData.json";
import malayalamSentencesData from "../../data/malayalamSentencesData.json";
import malayalamQuizData from "../../data/malayalamQuizData.json";
import { useAuth } from "../../context/AuthContext";
import MalayalamQuiz from "./MalayalamQuiz";
import MalayalamChat from "./MalayalamChat";
import { 
  BookOpen, Sparkles, Languages, CheckCircle2, ChevronRight, ArrowLeft,
  Play, Volume2, Eye, EyeOff, User, LogOut, Lock, Star, Flame, Zap, BarChart3, Globe, LayoutDashboard, Search, MessageCircle, ChevronDown, ChevronUp, Bot 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CatVoiceCheckpoint from "../../components/catTeacher/CatVoiceCheckpoint";

function WordCard({ word, playAudio, index, isCompleted, isInProgress, isLocked, onInteract }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div className={`group relative flex flex-col p-5 bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden h-full ${
      isInProgress ? "border-amber-500 ring-2 ring-amber-500/30" : 
      isCompleted ? "border-emerald-500/30 bg-emerald-500/10/30" : 
      "border-white/10"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
      
      {/* Top action/status bar */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isInProgress && <Play className="w-4 h-4 text-amber-500 animate-pulse" />}
          {isLocked && <Lock className="w-4 h-4 text-white/40" />}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInteract(); }}
          disabled={isLocked}
          className={`p-1.5 rounded-xl shadow-sm border transition-all z-10 hover:scale-110 active:scale-95 ${
            isLocked ? "bg-white/5 border-white/10 cursor-not-allowed opacity-50" : "bg-white/5 border-[#ffffff]/5 hover:bg-amber-500/10 hover:border-amber-500/20"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isLocked ? "text-slate-500" : "text-white/60 hover:text-amber-500"}`} />
        </button>
      </div>

      <div className="flex-1">
        <span className="text-[22px] font-bold font-sans leading-[1.7] tracking-wide text-white mb-3 pr-2 flex items-start gap-2 break-words">
          {word.digit && (
            <span className="mt-1 flex-shrink-0 bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/20 text-[#8C6D13] px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-sm">
              {word.digit}.
            </span>
          )}
          <span className={isLocked ? "blur-[2px] opacity-70" : ""}>{word.malayalam}</span>
        </span>
        
        <div className={`flex flex-wrap gap-2 mb-5 ${isLocked ? "opacity-50" : ""}`}>
          <span className="font-mono text-[11px] font-medium bg-white/5 border border-white/10 text-white/70 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-white/10">
            {word.english_transliteration}
          </span>
          {word.tamil_transliteration && (
            <span className="font-sans text-[11px] font-medium bg-white/5 border border-white/10 text-white/70 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-white/10">
              {word.tamil_transliteration}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[#ffffff]/5 pt-4">
        {!revealed ? (
          <button 
            onClick={() => !isLocked && setRevealed(true)}
            disabled={isLocked}
            className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold tracking-wide rounded-xl transition-all ${
              isLocked 
                ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                : "text-white/60 bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
            {isLocked ? "Locked" : "View Translation"}
          </button>
        ) : (
          <div 
            onClick={() => setRevealed(false)} 
            className="flex flex-col gap-1.5 cursor-pointer group/reveal p-3 -mx-3 -mb-3 rounded-xl hover:bg-white/5 transition-colors relative"
          >
            <div className="flex justify-between items-start pr-8">
              <div className="flex flex-col gap-1">
                <span className="font-sans font-bold text-sm text-white leading-tight">
                  {word.english_meaning}
                </span>
                <span className="font-sans font-medium text-[13px] text-white/60 leading-tight">
                  {word.tamil_meaning}
                </span>
              </div>
              <EyeOff className="absolute top-3.5 right-3 w-4 h-4 text-white/40 group-hover/reveal:text-white transition-colors" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InteractiveQuizCard({ question, index, isCompleted, isInProgress, isLocked, onInteract, playAudio }) {
  const [selectedOpt, setSelectedOpt] = useState(null);

  const handleSelect = (optKey) => {
    if (isLocked || selectedOpt) return;
    setSelectedOpt(optKey);
    playAudio(question.malayalam);
    if (optKey === question.correct_option) {
       // Wait a bit so user can see it turn green, then unlock next
       setTimeout(() => {
         onInteract();
       }, 500);
    }
  };

  return (
    <div className={`group relative flex flex-col p-5 bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden h-full ${
      isCompleted ? "border-emerald-500/30 bg-emerald-500/10/30" : 
      isInProgress ? "border-[#8b5cf6]/50 ring-2 ring-[#8b5cf6]/30 bg-purple-500/10/30" :
      "border-white/10 opacity-70"
    }`}>
      {/* Top action/status bar */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isInProgress && <Play className="w-4 h-4 text-[#8b5cf6] animate-pulse" />}
          {isLocked && <Lock className="w-4 h-4 text-white/40" />}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); playAudio(question.malayalam); }}
          disabled={isLocked}
          className={`p-1.5 rounded-xl shadow-sm border transition-all z-10 hover:scale-110 active:scale-95 ${
            isLocked ? "bg-white/5 border-white/10 cursor-not-allowed opacity-50" : "bg-white/5 border-[#ffffff]/5 hover:bg-[#8b5cf6]/10 hover:border-[#8b5cf6]/20"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isLocked ? "text-slate-500" : "text-white/60 hover:text-[#8b5cf6]"}`} />
        </button>
      </div>

      <div className="flex-1 mb-4">
        <span className="text-[22px] font-bold font-sans leading-[1.7] tracking-wide text-white mb-3 pr-2 flex items-start gap-2 break-words">
          <span className="mt-1 flex-shrink-0 bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#6d28d9] px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-sm">
            {question.q_no}.
          </span>
          <span className={isLocked ? "blur-[2px] opacity-70" : ""}>{question.malayalam}</span>
        </span>
        
        <div className={`flex flex-wrap gap-2 mb-2 ${isLocked ? "opacity-50" : ""}`}>
          <span className="font-mono text-[11px] font-medium bg-white/5 border border-white/10 text-white/70 px-2.5 py-1 rounded-lg">
            {question.english_transliteration}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto border-t border-[#ffffff]/5 pt-4">
        {Object.entries(question.options || {}).map(([key, val]) => {
           let btnClass = "bg-[#0f172a] border-white/10 hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 text-white";
           
           if (selectedOpt) {
              if (key === question.correct_option) {
                 btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold";
              } else if (key === selectedOpt) {
                 btnClass = "bg-red-50 border-red-500 text-red-700";
              } else {
                 btnClass = "bg-[#0f172a] border-white/10 opacity-50";
              }
           } else if (isCompleted && key === question.correct_option) {
               btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold opacity-70";
           }

           return (
             <button 
               key={key} 
               disabled={isLocked || selectedOpt !== null || isCompleted}
               onClick={() => handleSelect(key)}
               className={`text-left px-4 py-2.5 border rounded-xl text-sm transition-all shadow-sm flex items-center gap-3 ${btnClass} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${selectedOpt && key === question.correct_option ? 'bg-emerald-200 text-emerald-800' : selectedOpt && key === selectedOpt ? 'bg-red-200 text-red-800' : 'bg-white/5 text-slate-400'}`}>{key}</span> 
               {val}
             </button>
           );
        })}
      </div>
    </div>
  );
}

export default function MalayalamDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const savedTab = localStorage.getItem("malayalam_active_tab");
  const [activeTab, setActiveTabState] = useState(savedTab || "Home");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem("malayalam_active_tab", tab);
  };

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const availableLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "th", name: "Thai", flag: "🇹🇭" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
  ];
  const currentLanguageCode = localStorage.getItem("mozhify_target_language") || "en";
  const currentLanguage = availableLanguages.find(l => l.code === currentLanguageCode) || availableLanguages[0];

  const changeLanguage = (code) => {
    localStorage.setItem("mozhify_target_language", code);
    setLangDropdownOpen(false);
    window.location.href = "/"; 
  };

  const TABS = [
    "Home",
    "Alphabets (അക്ഷരമാല)",
    "Essential Words",
    "Numbers",
    "Sentences",
    "Quiz",
    "AI Conversation"
  ];

  // Progress Tracking State
  const [progress, setProgress] = useState({
    swarangal: 0,
    vyanjanangal: 0,
    chillaksharangal: 0,
    words: 0,
    numbers: 0,
    sentences: 0,
    quiz: 0
  });
  const [stats, setStats] = useState({ streak: 0, xp: 0 });

  useEffect(() => {
    const savedProgressStr = localStorage.getItem("malayalam_progress");
    const defaultProgress = { swarangal: 0, vyanjanangal: 0, chillaksharangal: 0, words: 0, numbers: 0, sentences: 0, quiz: 0 };
    const savedProgress = savedProgressStr ? JSON.parse(savedProgressStr) : defaultProgress;
    setProgress({ ...defaultProgress, ...savedProgress });

    const savedStats = JSON.parse(localStorage.getItem("malayalam_stats") || '{"streak":0,"xp":0}');
    setStats(savedStats);
  }, []);

  const playAudio = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ml-IN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleInteraction = (type, index, text) => {
    playAudio(text);
    if (index === progress[type]) {
      const newProgress = { ...progress, [type]: index + 1 };
      const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(stats);
      const newStats = { streak: updatedStreak, lastActiveDate, xp: stats.xp + 10 
      };
      
      setProgress(newProgress);
      setStats(newStats);
      
      localStorage.setItem("malayalam_progress", JSON.stringify(newProgress));
      localStorage.setItem("malayalam_stats", JSON.stringify(newStats));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const [activeWordModuleView, setActiveWordModuleView] = useState(null);
  const [activeWordPartView, setActiveWordPartView] = useState(null);
  const [activeNumberPartView, setActiveNumberPartView] = useState(null);
  const [activeSentenceModuleView, setActiveSentenceModuleView] = useState(null);
  const [activeQuizModuleView, setActiveQuizModuleView] = useState(null);
  const [activeQuizPartView, setActiveQuizPartView] = useState(null);

  const formattedMalayalamSentences = useMemo(() => {
    const parts = [];
    malayalamSentencesData.modules.forEach((mod, modIndex) => {
      const sentences = mod.sentences;
      for (let i = 0; i < sentences.length; i += 10) {
        const partSentences = sentences.slice(i, i + 10);
        parts.push({
          moduleIndex: modIndex,
          moduleName: mod.module,
          phase: `Module ${mod.module} - Part ${Math.floor(i / 10) + 1} (${i + 1}-${i + partSentences.length})`,
          context: mod.description || "Basic Sentences",
          sentences: partSentences.map(s => ({
            english: s.english_meaning || "",
            tamil: s.tamil_meaning || "",
            malayalam: s.malayalam || "",
            transliteration: s.english_transliteration || ""
          }))
        });
      }
    });
    return parts;
  }, []);

  const [activePhaseKey, setActivePhaseKey] = useState(null);
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [checkpointPhase, setCheckpointPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState(() => {
    return JSON.parse(localStorage.getItem("malayalam_cat_completed_phases") || "{}");
  });

  const handleCheckpointComplete = (score, total) => {
    if (checkpointPhase) {
      const updated = { ...completedPhases, [checkpointPhase.phase]: { score, total } };
      setCompletedPhases(updated);
      localStorage.setItem("malayalam_cat_completed_phases", JSON.stringify(updated));
    }
  };

  const filteredData = useMemo(() => {
    let dataToFilter = formattedMalayalamSentences;
    
    if (!searchQuery.trim()) {
      if (activeSentenceModuleView !== null) {
        return dataToFilter.filter(p => p.moduleIndex === activeSentenceModuleView);
      } else {
        return [];
      }
    }
    
    return dataToFilter.map(phaseObj => {
      const matchingSentences = phaseObj.sentences.filter(s => {
        const enMatch = s.english.toLowerCase().includes(searchQuery.toLowerCase());
        const taMatch = s.tamil.includes(searchQuery);
        const mlMatch = s.malayalam.includes(searchQuery);
        return enMatch || taMatch || mlMatch;
      });
      return { ...phaseObj, sentences: matchingSentences };
    }).filter(phaseObj => phaseObj.sentences.length > 0);
  }, [searchQuery, formattedMalayalamSentences, activeSentenceModuleView]);

  const togglePhase = (phaseKey) => {
    setActivePhaseKey(activePhaseKey === phaseKey ? null : phaseKey);
    setVisibleTranslations({});
  };

  const toggleTranslation = (sIndex, phaseKey) => {
    const key = `${phaseKey}-${sIndex}`;
    setVisibleTranslations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Dashboard overview cards
  const dashboardCards = [
    { key: "swarangal", label: "Vowels (സ്വരങ്ങൾ)", tab: TABS[1], icon: "അ", total: alphabetData.alphabet.swarangal.length, color: "amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { key: "vyanjanangal", label: "Consonants (വ്യഞ്ജനങ്ങൾ)", tab: TABS[1], icon: "ക", total: alphabetData.alphabet.vyanjanangal.length, color: "emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { key: "chillaksharangal", label: "Chillu Letters (ചില്ലക്ഷരങ്ങൾ)", tab: TABS[1], icon: "ൺ", total: alphabetData.alphabet.chillaksharangal.length, color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { key: "words", label: "Essential Words", tab: TABS[2], icon: "📚", total: malayalamWordsData.words.length, color: "#0ea5e9", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { key: "numbers", label: "Numbers", tab: TABS[3], icon: "🔢", total: malayalamNumbersData.numbers.length, color: "#ec4899", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    { key: "sentences", label: "Sentences", tab: TABS[4], icon: "💬", total: malayalamSentencesData.total_sentences, color: "#f59e0b", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { key: "quiz", label: "Quiz", tab: TABS[5], icon: "🧠", total: malayalamQuizData.total_questions, color: "#8b5cf6", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { key: "ai", label: "AI Conversation", tab: TABS[6], icon: "🤖", total: "∞", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ];

  const renderLetterGrid = (type, lettersArray) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
      {lettersArray.map((letter, idx) => {
        const isCompleted = idx < progress[type];
        const isInProgress = idx === progress[type];
        const isLocked = idx > progress[type];

        return (
          <div 
            key={idx} 
            onClick={() => !isLocked && handleInteraction(type, idx, letter.letter)}
            className={`group relative flex flex-col items-center justify-between aspect-square p-3 rounded-2xl border transition-all duration-300 overflow-hidden ${
              isInProgress
                ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/50 shadow-lg cursor-pointer"
                : isCompleted
                ? "border-emerald-500/30 bg-emerald-500/10/50 cursor-pointer"
                : "border-white/10 bg-slate-900/40 opacity-70 cursor-not-allowed"
            } ${!isLocked ? 'hover:-translate-y-1 hover:shadow-md' : ''}`}
          >
            <div className="flex w-full items-center justify-between z-10">
               <span className="font-mono text-[10px] font-bold text-white/60">{idx + 1}</span>
               {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
               {isInProgress && <Play className="w-4 h-4 text-emerald-500 fill-emerald-500 animate-bounce" />}
               {isLocked && <Lock className="w-4 h-4 text-white/40" />}
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
            {!isLocked && <Volume2 className="absolute top-6 right-2 w-3.5 h-3.5 text-white/20 group-hover:text-emerald-500 transition-colors" />}
            
            <div className="my-1 flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-bold transition shadow-sm bg-gradient-to-br text-white shadow-[#ffffff]/10 bg-[#0f172a]">
              <span className={`text-[32px] font-bold font-sans leading-none ${isLocked ? 'text-slate-500' : 'text-white group-hover:text-emerald-500'} transition-colors drop-shadow-sm`}>
                {letter.letter}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10 w-full px-1">
              <span className="font-mono text-[10px] font-semibold bg-white/5 text-white/70 px-1.5 py-0.5 rounded w-full text-center truncate">
                {letter.transliteration}
              </span>
              <div className="flex justify-center gap-1 mt-1">
                {isCompleted ? (
                   Array.from({ length: 3 }).map((_, i) => (
                     <Star key={i} className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                   ))
                 ) : isInProgress ? (
                   <span className="font-mono text-[9px] font-bold text-emerald-500">In Progress</span>
                 ) : (
                   <span className="font-mono text-[9px] text-slate-500">Locked</span>
                 )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-white/5 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 h-screen bg-[#0f172a] border-r border-white/10 flex flex-col shadow-sm shrink-0">
        {/* Top Section */}
        <div className="p-6 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Languages className="w-6 h-6 text-amber-500" /> Mozhify
            </h1>
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center justify-center h-8 px-2.5 gap-1.5 rounded-lg border border-white/10 bg-[#0f172a]/90 backdrop-blur-md text-white shadow-sm hover:border-amber-500 hover:text-amber-500 transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[13px] leading-none">{currentLanguage.flag}</span>
                <span className="font-sans text-[11px] font-bold uppercase mt-0.5">
                  {currentLanguage.code}
                </span>
              </button>
              {langDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a] py-2 shadow-xl z-50">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex w-full items-center gap-3 px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                        currentLanguageCode === lang.code
                          ? "bg-white/5 text-amber-500"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 font-mono text-xs font-semibold text-white/70 w-fit">
            Malayalam Learning
          </span>
          <button 
            onClick={() => navigate("/")}
            className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main
          </button>
        </div>

        {/* Middle Section (Navigation) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {TABS.map((tabName) => {
            const getIcon = (name) => {
              if (name === "Home") return <LayoutDashboard className="w-4 h-4 text-current" />;
              if (name === "AI Conversation") return <Bot className="w-4 h-4 text-current" />;
              if (name.includes("Alphabets")) return <span className="text-sm font-sans text-current">അ</span>;
              if (name.includes("Words")) return <BookOpen className="w-4 h-4 text-current" />;
              return <CheckCircle2 className="w-4 h-4 text-current" />;
            };

            const isActive = activeTab === tabName;

            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#ffffff] text-[#0f172a] shadow-md"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                  isActive ? "bg-[#0f172a]/20" : "bg-white/10"
                }`}>
                  {getIcon(tabName)}
                </div>
                <span className="text-sm text-left truncate">{tabName}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-5 border-t border-white/10 bg-white/5/50 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${stats.streak > 0 ? "text-amber-500 fill-amber-500" : "text-slate-500"}`} />
                <span className="text-xs font-semibold text-white/70">Streak</span>
              </div>
              <span className={`font-mono font-bold ${stats.streak > 0 ? "text-amber-600" : "text-white/40"}`}>{stats.streak}</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${stats.xp > 0 ? "text-amber-500 fill-amber-500" : "text-slate-500"}`} />
                <span className="text-xs font-semibold text-white/70">Points</span>
              </div>
              <span className={`font-mono font-bold ${stats.xp > 0 ? "text-amber-500" : "text-white/40"}`}>{stats.xp}</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-semibold truncate text-white">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-16">
          {/* Content Area Grid */}
          <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-10 shadow-sm border border-[#ffffff]/5">
            {activeTab === "Home" && (
              <div className="space-y-6 animate-fade-in">
                {/* Top Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1f40] via-[#162a55] to-[#090e1c] p-6 text-white shadow-xl sm:p-8 border border-white/10 mb-6">
                  <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
                  <div className="absolute -bottom-10 right-20 h-48 w-48 rounded-full bg-blue-500/15 blur-2xl" />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          Malayalam Fundamentals · {alphabetData.total_letters} Letters
                        </span>
                      </div>

                      <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Welcome back, <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">{user?.displayName?.split(" ")[0] || "Learner"}</span>
                      </h1>
                      <p className="max-w-xl font-sans text-sm text-slate-300 leading-relaxed">
                        Start your learning streak today by completing your first lesson module!
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      <button
                        onClick={() => setActiveTab("Alphabets (അക്ഷരമാല)")}
                        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-6 py-3.5 font-sans text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Start Learning</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Stats Row (4 cards) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {/* Daily Streak */}
                  <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Daily Streak</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-amber-400">{stats.streak}</span>
                        <span className="text-xs text-slate-400 font-semibold">Days Active</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Flame className={`h-6 w-6 ${stats.streak > 0 ? "fill-amber-400 text-amber-400" : "text-slate-500"}`} />
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level 1 XP</span>
                      <span className="text-xs font-bold text-amber-400">{stats.xp} / 500</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (stats.xp / 500) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{Math.max(0, 500 - stats.xp)} XP remaining to Level 2</span>
                  </div>

                  {/* Alphabet Progress */}
                  <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alphabet Progress</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-emerald-400">{progress.swarangal + progress.vyanjanangal + progress.chillaksharangal}</span>
                        <span className="text-xs text-slate-400 font-semibold">/ {alphabetData.total_letters} Letters</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-xl font-bold font-sans text-emerald-400">അ</span>
                    </div>
                  </div>

                  {/* Words Learned */}
                  <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Words Learned</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-sky-400">{progress.words}</span>
                        <span className="text-xs text-slate-400 font-semibold">/ {malayalamWordsData.words?.length || 200} Words</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* ── Today's Mission + AI Coach ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  {/* Mission Checklist (2 cols) */}
                  <div className="md:col-span-2 p-6 border border-white/[0.08] rounded-3xl bg-white/[0.03] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                          <h3 className="text-lg font-bold text-white">Today's Mission</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 font-mono text-xs font-bold border border-amber-500/20">+50 XP Reward</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { text: "Learn 5 Malayalam Vowels (സ്വരങ്ങൾ)", tab: "Alphabets (അക്ഷരമാല)", done: progress.swarangal >= 5 },
                          { text: "Study 10 Essential Words", tab: "Essential Words", done: progress.words >= 10 },
                          { text: "Practice with Quiz Dashboard", tab: "Quiz", done: progress.quiz > 0 },
                        ].map((item, i) => (
                          <div
                            key={i}
                            onClick={() => setActiveTab(item.tab)}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] cursor-pointer hover:bg-white/[0.08] transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {item.done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-slate-500 shrink-0" />
                              )}
                              <span className={`text-sm font-medium ${item.done ? "text-slate-400 line-through" : "text-slate-200"}`}>{item.text}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => setActiveTab("Alphabets (അക്ഷരമാല)")}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <span>View All Lessons</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Gemma AI Coach (1 col) */}
                  <div className="p-6 border border-amber-500/20 rounded-3xl bg-gradient-to-b from-amber-900/20 to-slate-900/40 flex flex-col justify-between">
                    <div>
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                        <Bot className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Gemma AI Conversation</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Practice real-time Malayalam conversations with instant feedback on pronunciation and vocabulary usage.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("AI Conversation")}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] text-xs"
                    >
                      <span>Open AI Conversation</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Module Cards Grid ── */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">All Modules</h2>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {dashboardCards.map((card) => (
                      <button
                        key={card.key}
                        onClick={() => setActiveTab(card.tab)}
                        className={`flex flex-col items-start gap-4 p-6 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.bg} ${card.border}`}
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-2xl font-bold text-white" 
                          style={{ backgroundColor: card.color }}
                        >
                          {card.icon}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-white">{card.label}</h3>
                          <p className="font-mono text-sm font-semibold text-white/60 mt-1">
                            {progress[card.key]} / {card.total} Completed
                          </p>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-[#0f172a]/50 mt-2 overflow-hidden border border-black/5">
                          <div 
                            className="h-full rounded-full transition-all duration-700" 
                            style={{ backgroundColor: card.color, width: `${(progress[card.key] / card.total) * 100}%` }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "Alphabets (അക്ഷരമാല)" && (
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-amber-500" /> Vowels (സ്വരങ്ങൾ)
                  </h3>
                  {renderLetterGrid("swarangal", alphabetData.alphabet.swarangal)}
                </div>

                <div className="space-y-6">
                  <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-emerald-500" /> Consonants (വ്യഞ്ജനങ്ങൾ)
                  </h3>
                  {renderLetterGrid("vyanjanangal", alphabetData.alphabet.vyanjanangal)}
                </div>

                <div className="space-y-6">
                  <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-[#6366f1]" /> Chillu Letters (ചില്ലക്ഷരങ്ങൾ)
                  </h3>
                  {renderLetterGrid("chillaksharangal", alphabetData.alphabet.chillaksharangal)}
                </div>
              </div>
            )}

            {activeTab === "Essential Words" && (
              <div className="space-y-6">
                {activeWordPartView === null ? (
                  <div className="space-y-4 pt-4">
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#0ea5e9]" /> {malayalamWordsData.words.length} Essential Words
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: Math.ceil(malayalamWordsData.words.length / 10) }).map((_, i) => {
                        const startIdx = i * 10;
                        const endIdx = (i + 1) * 10;
                        const partName = `Part ${i + 1} (${startIdx + 1}-${endIdx})`;
                        const isLocked = progress.words < startIdx;
                        const isCompleted = progress.words >= endIdx;
                        const isInProgress = !isLocked && !isCompleted;
                        
                        return (
                          <button
                            key={partName}
                            disabled={isLocked}
                            onClick={() => setActiveWordPartView(i)}
                            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                              isLocked 
                                ? "border-white/10 bg-slate-900/40 opacity-70 cursor-not-allowed" 
                                : isInProgress
                                ? "border-amber-500 bg-amber-500/10 shadow-lg"
                                : "border-emerald-500/30 bg-emerald-500/10/50 hover:shadow-md"
                            }`}
                          >
                            <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-slate-500" : isInProgress ? "text-amber-500" : "text-emerald-500"}`} />
                            <span className={`font-display text-lg font-bold ${isLocked ? "text-slate-400" : "text-white"}`}>{partName}</span>
                            <div className="mt-3">
                              {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : 
                               isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                               <span className="text-xs font-bold text-amber-500 bg-amber-500/20 px-3 py-1 rounded-full">In Progress</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    <button 
                      onClick={() => setActiveWordPartView(null)}
                      className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors bg-[#0f172a] px-4 py-2 rounded-xl shadow-sm border border-white/10 w-fit"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                    </button>
                    
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#0ea5e9]" /> Part {activeWordPartView + 1} ({(activeWordPartView * 10) + 1}-{(activeWordPartView + 1) * 10})
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {malayalamWordsData.words.slice(activeWordPartView * 10, (activeWordPartView + 1) * 10).map((word, relIdx) => {
                         const globalIdx = (activeWordPartView * 10) + relIdx;
                         const isCompleted = globalIdx < progress.words;
                         const isInProgress = globalIdx === progress.words;
                         const isLocked = globalIdx > progress.words;
                         return (
                           <WordCard 
                             key={globalIdx} 
                             word={word} 
                             index={globalIdx}
                             isCompleted={isCompleted}
                             isInProgress={isInProgress}
                             isLocked={isLocked}
                             onInteract={() => handleInteraction('words', globalIdx, word.malayalam)} 
                           />
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Numbers" && (
              <div className="space-y-6">
                {activeNumberPartView === null ? (
                  <div className="space-y-4 pt-4">
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#ec4899]" /> {malayalamNumbersData.numbers.length} Numbers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: Math.ceil(malayalamNumbersData.numbers.length / 10) }).map((_, i) => {
                        const startIdx = i * 10;
                        const endIdx = (i + 1) * 10;
                        const partName = `Part ${i + 1} (${startIdx + 1}-${endIdx})`;
                        const isLocked = progress.numbers < startIdx;
                        const isCompleted = progress.numbers >= endIdx;
                        const isInProgress = !isLocked && !isCompleted;
                        
                        return (
                          <button
                            key={partName}
                            disabled={isLocked}
                            onClick={() => setActiveNumberPartView(i)}
                            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                              isLocked 
                                ? "border-white/10 bg-slate-900/40 opacity-70 cursor-not-allowed" 
                                : isInProgress
                                ? "border-amber-500 bg-amber-500/10 shadow-lg"
                                : "border-emerald-500/30 bg-emerald-500/10/50 hover:shadow-md"
                            }`}
                          >
                            <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-slate-500" : isInProgress ? "text-amber-500" : "text-emerald-500"}`} />
                            <span className={`font-display text-lg font-bold ${isLocked ? "text-slate-400" : "text-white"}`}>{partName}</span>
                            <div className="mt-3">
                              {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : 
                               isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                               <span className="text-xs font-bold text-amber-500 bg-amber-500/20 px-3 py-1 rounded-full">In Progress</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    <button 
                      onClick={() => setActiveNumberPartView(null)}
                      className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors bg-[#0f172a] px-4 py-2 rounded-xl shadow-sm border border-white/10 w-fit"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                    </button>
                    
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#ec4899]" /> Part {activeNumberPartView + 1} ({(activeNumberPartView * 10) + 1}-{(activeNumberPartView + 1) * 10})
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {malayalamNumbersData.numbers.slice(activeNumberPartView * 10, (activeNumberPartView + 1) * 10).map((number, relIdx) => {
                         const globalIdx = (activeNumberPartView * 10) + relIdx;
                         const isCompleted = globalIdx < progress.numbers;
                         const isInProgress = globalIdx === progress.numbers;
                         const isLocked = globalIdx > progress.numbers;
                         return (
                           <WordCard 
                             key={globalIdx} 
                             word={number} 
                             index={globalIdx}
                             isCompleted={isCompleted}
                             isInProgress={isInProgress}
                             isLocked={isLocked}
                             onInteract={() => handleInteraction('numbers', globalIdx, number.malayalam)} 
                           />
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Sentences" && (
              <div className="space-y-8 pb-20 w-full max-w-4xl mx-auto">
                {/* Premium Animated Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#ffffff] via-[#1a2f5c] to-[#0f172a] p-8 sm:p-10 text-white shadow-2xl"
                >
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500 opacity-20 blur-3xl"></div>
                  <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500 opacity-30 blur-3xl"></div>
                  
                  <div className="relative z-10 space-y-4 text-center sm:text-left flex flex-col items-center sm:items-start">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs font-bold text-[#e6c148] backdrop-blur-md"
                    >
                      <Sparkles className="h-4 w-4" /> Fluent Expressions
                    </motion.div>
                    <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                      Daily Conversations
                    </h1>
                    <p className="max-w-xl font-sans text-base sm:text-lg text-white/70 leading-relaxed text-center sm:text-left">
                      Master everyday Malayalam sentences grouped by real-life contexts. Use the search bar to find specific phrases instantly.
                    </p>
                  </div>
                </motion.div>

                {/* Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() && filteredData.length > 0) {
                        setActivePhaseKey(filteredData[0].phase);
                      }
                    }}
                    placeholder="Search for sentences in Malayalam, English or Tamil..."
                    className="w-full bg-[#0f172a]/90 backdrop-blur-md border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-sans text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-white placeholder:text-white/40"
                  />
                </motion.div>

                {/* Accordion Layout */}
                <div className="flex flex-col gap-4">
                  {!searchQuery.trim() && activeSentenceModuleView === null ? (
                    <div className="space-y-4 pt-4">
                      <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#f59e0b]" /> {malayalamSentencesData.total_sentences} Sentences
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {malayalamSentencesData.modules.map((moduleData, i) => (
                          <button
                            key={moduleData.module}
                            onClick={() => setActiveSentenceModuleView(i)}
                            className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 border-white/10 hover:border-amber-500 bg-[#0f172a] hover:bg-amber-500/5 shadow-sm hover:shadow-md"
                          >
                            <BookOpen className="w-8 h-8 mb-3 text-amber-500" />
                            <span className="font-display text-lg font-bold text-white">Module {moduleData.module}</span>
                            {moduleData.category && <span className="text-sm text-slate-400 mt-2 text-center">{moduleData.category}</span>}
                            <div className="mt-4">
                              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{moduleData.total_sentences || moduleData.sentences.length} Sentences</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {!searchQuery.trim() && activeSentenceModuleView !== null && (
                        <div className="mb-2">
                          <button 
                            onClick={() => setActiveSentenceModuleView(null)}
                            className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors bg-[#0f172a] px-4 py-2 rounded-xl shadow-sm border border-white/10 w-fit"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
                          </button>
                        </div>
                      )}

                      {filteredData.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-white/60 font-sans text-lg">No matches found for "{searchQuery}"</p>
                        </div>
                      ) : (
                        filteredData.map((data, index) => {
                          const isActive = activePhaseKey === data.phase;
                          
                          return (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(index * 0.05, 0.5) }}
                              key={data.phase} 
                              className={`rounded-3xl border ${isActive ? 'border-white/15 shadow-xl bg-[#0f172a]/90 backdrop-blur-md' : 'border-white/10 bg-slate-900/40 backdrop-blur-sm'} transition-all duration-300 overflow-hidden`}
                            >
                          {/* Accordion Header */}
                          <button
                            onClick={() => togglePhase(data.phase)}
                            className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-white/5 transition-colors"
                          >
                            <div>
                              <h2 className={`font-display text-2xl font-extrabold ${isActive ? 'text-white' : 'text-white/80'}`}>
                                {data.phase} {completedPhases[data.phase] && <span className="ml-2 inline-flex items-center text-sm font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">⭐ Passed</span>}
                              </h2>
                              <p className="font-sans text-sm text-white/60 mt-1">
                                {data.context} • {data.sentences.length} items
                              </p>
                            </div>
                            <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                              {isActive ? <ChevronUp className="h-6 w-6 text-white" /> : <ChevronDown className="h-6 w-6 text-white/60" />}
                            </div>
                          </button>

                          {/* Accordion Content */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-[#ffffff]/5"
                              >
                                <div className="p-6 sm:p-8 pt-6">
                                  {/* Cat Checkpoint Button */}
                                  <div className="mb-8">
                                    <button
                                      onClick={() => setCheckpointPhase(data)}
                                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffffff] to-[#1a2f5c] p-4 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                                    >
                                      <Sparkles className="h-5 w-5 text-amber-500" />
                                      Phase Oral Checkpoint with Cat AI Teacher
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    {data.sentences.map((sentence, sIndex) => {
                                      const isTranslated = visibleTranslations[`${data.phase}-${sIndex}`];
                                      
                                      return (
                                        <div key={sIndex} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl bg-[#0f172a] border border-white/10 hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
                                          <div className="flex-shrink-0 mt-1">
                                            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                              <MessageCircle className="h-5 w-5" />
                                            </div>
                                          </div>
                                          
                                          <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                              <p className="font-sans text-xl sm:text-2xl text-white font-medium leading-snug break-words">
                                                {sentence.malayalam}
                                              </p>
                                              <button 
                                                onClick={() => playAudio(sentence.malayalam)}
                                                className="p-2.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-amber-500 transition-colors flex-shrink-0"
                                              >
                                                <Volume2 className="h-5 w-5" />
                                              </button>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                              <button
                                                onClick={() => toggleTranslation(sIndex, data.phase)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-500/10 text-amber-700 hover:bg-amber-100 transition-colors"
                                              >
                                                <Languages className="h-4 w-4" />
                                                {isTranslated ? "Hide Translation" : "View Translation"}
                                              </button>
                                            </div>
                                            
                                            <AnimatePresence>
                                              {isTranslated && (
                                                <motion.div
                                                  initial={{ opacity: 0, y: -10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  exit={{ opacity: 0, y: -10 }}
                                                  className="pt-3 border-t border-white/10 space-y-2"
                                                >
                                                  <p className="font-sans text-white/80">
                                                    <strong className="text-white">Meaning:</strong> {sentence.english}
                                                  </p>
                                                  <p className="font-sans text-white/60 text-sm">
                                                    {sentence.tamil}
                                                  </p>
                                                  <p className="font-sans text-white/60 text-sm italic font-mono bg-white/5 p-2 rounded-lg mt-2">
                                                    {sentence.transliteration}
                                                  </p>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          </motion.div>
                        );
                      })
                    )}
                  </>
                )}
                </div>
                
                {/* Checkpoint Modal */}
                <CatVoiceCheckpoint
                  isOpen={!!checkpointPhase}
                  onClose={() => setCheckpointPhase(null)}
                  phaseData={checkpointPhase}
                  onComplete={handleCheckpointComplete}
                  learningLanguage="malayalam"
                  sourceLanguage="english"
                />
              </div>
            )}

            {activeTab === "Quiz" && (
              <div className="-mx-4 sm:-mx-10 -my-6 sm:-my-10">
                <MalayalamQuiz onExit={() => setActiveTab(TABS[0])} />
              </div>
            )}

            {activeTab === "AI Conversation" && (
              <div className="-mx-4 sm:-mx-10 -my-6 sm:-my-10 h-screen max-h-[800px]">
                <MalayalamChat />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
