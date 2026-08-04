import React, { useState, useEffect, useMemo } from "react";
import { calculateNewStreak } from "../../utils/streak";
import { useNavigate } from "react-router-dom";
import alphabetData from "../../data/hindiAlphabetData.json";
import hindiWordsData from "../../data/hindiWordsData.json";
import hindiNumbersData from "../../data/hindiNumbersData.json";
import hindiSentencesData from "../../data/hindiSentencesData.json";
import hindiQuizData from "../../data/hindiQuizData.json";
import { useAuth } from "../../context/AuthContext";
import { 
  BookOpen, Sparkles, Languages, CheckCircle2, ChevronRight, ArrowLeft,
  Play, Volume2, Eye, EyeOff, User, LogOut, Lock, Star, Flame, Zap, BarChart3, Globe, LayoutDashboard, Search, MessageCircle, ChevronDown, ChevronUp, Clock, Target, Award, Compass, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CatVoiceCheckpoint from "../../components/catTeacher/CatVoiceCheckpoint";
import HindiChat from "./HindiChat";
import HindiQuiz from "./HindiQuiz";

function ProgressRing({ progress, size = 44, strokeWidth = 4, color = "#FF9800" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-amber-950/20"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-amber-300">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

function WordCard({ word, playAudio, index, isCompleted, isInProgress, isLocked, onInteract }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative flex flex-col p-5 bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl border transition-all duration-300 overflow-hidden h-full shadow-lg ${
        isInProgress ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/20" : 
        isCompleted ? "border-emerald-500/40 bg-emerald-950/15" : 
        "border-white/10 bg-slate-900/60"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1.5">
          {isCompleted && <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>}
          {isInProgress && <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"><Play className="w-3 h-3 animate-pulse" /> Active</span>}
          {isLocked && <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10"><Lock className="w-3 h-3" /> Locked</span>}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInteract(); }}
          disabled={isLocked}
          className={`p-2 rounded-2xl border transition-all ${
            isLocked ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed" : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-slate-950 hover:scale-110 active:scale-95"
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1">
        <div className="text-2xl font-bold font-sans text-white mb-2 flex items-start gap-2 break-words">
          {word.digit && (
            <span className="mt-1 flex-shrink-0 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
              {word.digit}.
            </span>
          )}
          <span className={isLocked ? "blur-[3px] opacity-50" : "text-amber-100"}>{word.hindi}</span>
        </div>
        
        <div className={`flex flex-wrap gap-2 mb-4 ${isLocked ? "opacity-40" : ""}`}>
          <span className="font-mono text-[11px] font-semibold bg-white/5 border border-white/10 text-amber-300/80 px-2.5 py-1 rounded-xl">
            {word.english_transliteration}
          </span>
          {word.tamil_transliteration && (
            <span className="font-sans text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-xl">
              {word.tamil_transliteration}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 pt-3">
        {!revealed ? (
          <button 
            onClick={() => !isLocked && setRevealed(true)}
            disabled={isLocked}
            className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold tracking-wide rounded-2xl transition-all ${
              isLocked 
                ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed" 
                : "text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} 
            {isLocked ? "Locked" : "View Translation"}
          </button>
        ) : (
          <div 
            onClick={() => setRevealed(false)} 
            className="flex flex-col gap-1 cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative"
          >
            <div className="flex justify-between items-start pr-6">
              <div className="flex flex-col gap-1">
                <span className="font-sans font-bold text-sm text-white">
                  {word.english_meaning}
                </span>
                <span className="font-sans font-medium text-xs text-slate-400">
                  {word.tamil_meaning}
                </span>
              </div>
              <EyeOff className="absolute top-3 right-3 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HindiDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const savedTab = localStorage.getItem("hindi_active_tab");
  const [activeTab, setActiveTabState] = useState(savedTab || "Home");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem("hindi_active_tab", tab);
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
    "Alphabets (वर्णमाला)",
    "Essential Words",
    "Numbers",
    "Sentences",
    "Quiz",
    "Real-time AI Coach"
  ];

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
    const savedProgressStr = localStorage.getItem("hindi_progress");
    const defaultProgress = { swarangal: 0, vyanjanangal: 0, chillaksharangal: 0, words: 0, numbers: 0, sentences: 0, quiz: 0 };
    const savedProgress = savedProgressStr ? JSON.parse(savedProgressStr) : defaultProgress;
    setProgress({ ...defaultProgress, ...savedProgress });

    const savedStats = JSON.parse(localStorage.getItem("hindi_stats") || '{"streak":0,"xp":0}');
    setStats(savedStats);
  }, []);

  const playAudio = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleInteraction = (type, index, text) => {
    playAudio(text);
    if (index === progress[type]) {
      const newProgress = { ...progress, [type]: index + 1 };
      const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(stats);
      const newStats = { streak: updatedStreak, lastActiveDate, xp: stats.xp + 10 };
      
      setProgress(newProgress);
      setStats(newStats);
      
      localStorage.setItem("hindi_progress", JSON.stringify(newProgress));
      localStorage.setItem("hindi_stats", JSON.stringify(newStats));
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

  const [activeWordPartView, setActiveWordPartView] = useState(null);
  const [activeNumberPartView, setActiveNumberPartView] = useState(null);
  const [activeSentenceModuleView, setActiveSentenceModuleView] = useState(null);
  const [activeSentenceLevelView, setActiveSentenceLevelView] = useState(null);
  const [activeSentencePartView, setActiveSentencePartView] = useState(null);

  const formattedHindiSentences = useMemo(() => {
    const parts = [];
    hindiSentencesData.modules.forEach((mod, modIndex) => {
      const sentences = mod.sentences;
      for (let i = 0; i < sentences.length; i += 10) {
        const partSentences = sentences.slice(i, i + 10);
        const levelIndex = Math.floor(i / 100);
        const levelNum = levelIndex + 1;
        parts.push({
          moduleIndex: modIndex,
          moduleName: mod.module,
          levelIndex: levelIndex,
          levelName: levelNum,
          phase: `Module ${mod.module} - Level ${levelNum} - Part ${Math.floor(i / 10) + 1} (${i + 1}-${i + partSentences.length})`,
          context: mod.description || "Basic Sentences",
          sentences: partSentences.map(s => ({
            english: s.english_meaning || "",
            tamil: s.tamil_meaning || "",
            hindi: s.hindi || "",
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
    return JSON.parse(localStorage.getItem("hindi_cat_completed_phases") || "{}");
  });

  const handleCheckpointComplete = (score, total) => {
    if (checkpointPhase) {
      const updated = { ...completedPhases, [checkpointPhase.phase]: { score, total } };
      setCompletedPhases(updated);
      localStorage.setItem("hindi_cat_completed_phases", JSON.stringify(updated));
    }
  };

  const filteredData = useMemo(() => {
    let dataToFilter = formattedHindiSentences;
    if (!searchQuery.trim()) {
      if (activeSentenceModuleView !== null) {
        dataToFilter = dataToFilter.filter(p => p.moduleIndex === activeSentenceModuleView);
        if (activeSentenceLevelView !== null) {
          dataToFilter = dataToFilter.filter(p => p.levelIndex === activeSentenceLevelView);
        }
      }
      return dataToFilter;
    }
    return dataToFilter.map(phaseObj => {
      const matchingSentences = phaseObj.sentences.filter(s => {
        const enMatch = s.english.toLowerCase().includes(searchQuery.toLowerCase());
        const taMatch = s.tamil.includes(searchQuery);
        const hiMatch = s.hindi.includes(searchQuery);
        return enMatch || taMatch || hiMatch;
      });
      return { ...phaseObj, sentences: matchingSentences };
    }).filter(phaseObj => phaseObj.sentences.length > 0);
  }, [searchQuery, formattedHindiSentences, activeSentenceModuleView, activeSentenceLevelView]);

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

  // Hindi Cultural Saffron Theme Cards
  const dashboardCards = [
    { key: "swarangal", label: "Vowels (स्वर)", native: "स्वर", tab: TABS[1], icon: "अ", total: alphabetData.alphabet.swarangal.length, color: "#FF9800", estimatedTime: "15 mins", difficulty: "Beginner" },
    { key: "vyanjanangal", label: "Consonants (व्यंजन)", native: "व्यंजन", tab: TABS[1], icon: "क", total: alphabetData.alphabet.vyanjanangal.length, color: "#E65100", estimatedTime: "30 mins", difficulty: "Beginner" },
    { key: "chillaksharangal", label: "Halant Letters (हलन्त)", native: "हलन्त", tab: TABS[1], icon: "क्", total: alphabetData.alphabet.chillaksharangal.length, color: "#F59E0B", estimatedTime: "20 mins", difficulty: "Intermediate" },
    { key: "words", label: "Essential Words", native: "शब्दावली", tab: TABS[2], icon: "📚", total: hindiWordsData.words.length, color: "#0EA5E9", estimatedTime: "45 mins", difficulty: "Beginner" },
    { key: "numbers", label: "Numbers", native: "संख्याएँ", tab: TABS[3], icon: "🔢", total: hindiNumbersData.numbers.length, color: "#EC4899", estimatedTime: "25 mins", difficulty: "Beginner" },
    { key: "sentences", label: "Sentences", native: "वाक्य", tab: TABS[4], icon: "💬", total: hindiSentencesData.total_sentences, color: "#10B981", estimatedTime: "60 mins", difficulty: "Intermediate" },
    { key: "quiz", label: "Quiz Dashboard", native: "प्रश्नोत्तरी", tab: TABS[5], icon: "🧠", total: hindiQuizData.total_questions, color: "#8B5CF6", estimatedTime: "20 mins", difficulty: "All Levels" }
  ];

  const renderLetterGrid = (type, lettersArray) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {lettersArray.map((letter, idx) => {
        const isCompleted = idx < progress[type];
        const isInProgress = idx === progress[type];
        const isLocked = idx > progress[type];

        return (
          <motion.div 
            key={idx}
            whileHover={!isLocked ? { y: -3, scale: 1.03 } : {}}
            onClick={() => !isLocked && handleInteraction(type, idx, letter.letter)}
            className={`group relative flex flex-col items-center justify-between aspect-square p-3 rounded-2xl border transition-all duration-300 overflow-hidden ${
              isInProgress
                ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-lg cursor-pointer"
                : isCompleted
                ? "border-emerald-500/40 bg-emerald-950/20 cursor-pointer"
                : "border-white/5 bg-slate-900/40 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex w-full items-center justify-between z-10">
               <span className="font-mono text-[10px] font-bold text-slate-400">{idx + 1}</span>
               {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
               {isInProgress && <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />}
               {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
            </div>

            <div className="my-1 flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-bold bg-white/5 text-amber-300 border border-white/10 shadow-sm group-hover:border-amber-500/40 transition-colors">
              <span className={`text-3xl font-bold font-sans ${isLocked ? 'text-slate-600' : 'text-amber-200 group-hover:text-amber-400'} transition-colors`}>
                {letter.letter}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10 w-full px-1">
              <span className="font-mono text-[10px] font-semibold bg-white/5 text-slate-300 px-1.5 py-0.5 rounded-lg w-full text-center truncate border border-white/5">
                {letter.transliteration}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden font-sans text-white">
      {/* ── Left Sidebar ── */}
      <aside className="w-64 h-screen bg-[#090d1f]/95 border-r border-amber-500/10 flex flex-col backdrop-blur-2xl shrink-0">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
              <Zap className="h-5 w-5 fill-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight leading-none block text-base">Mozhify</span>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Hindi Edition</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs"
            >
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>{currentLanguage.flag}</span>
            </button>
            {langDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a]/95 py-2 shadow-2xl backdrop-blur-2xl z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      currentLanguageCode === lang.code ? "bg-amber-500/10 text-amber-400" : "text-slate-300 hover:bg-white/5"
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

        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main
          </button>
        </div>

        <div className="px-6 pt-3 pb-1">
          <span className="font-mono text-[10px] font-bold text-amber-400/60 uppercase tracking-widest">Core Modules</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {TABS.map((tabName) => {
            const getIcon = (name) => {
              if (name === "Home") return <LayoutDashboard className="w-4 h-4" />;
              if (name.includes("Alphabets")) return <span className="text-sm font-sans font-bold">अ</span>;
              if (name.includes("Words")) return <BookOpen className="w-4 h-4" />;
              if (name.includes("Numbers")) return <span className="text-xs font-mono font-bold">12</span>;
              if (name.includes("Sentences")) return <MessageCircle className="w-4 h-4" />;
              if (name.includes("Quiz")) return <Zap className="w-4 h-4" />;
              return <CheckCircle2 className="w-4 h-4" />;
            };
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-600/30 to-yellow-500/10 border border-amber-500/40 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-amber-400" : "text-slate-500"}>{getIcon(tabName)}</span>
                  <span className="truncate text-left">{tabName}</span>
                </div>
                {isActive && <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <Flame className={`w-4 h-4 ${stats.streak > 0 ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
              <div>
                <div className="font-bold text-sm text-amber-300 leading-none">{stats.streak}d</div>
                <div className="text-[9px] font-mono text-amber-600 uppercase tracking-wider mt-0.5">Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-2">
              <Zap className={`w-4 h-4 ${stats.xp > 0 ? "text-sky-400 fill-sky-400" : "text-slate-500"}`} />
              <div>
                <div className="font-bold text-sm text-sky-300 leading-none">{stats.xp}</div>
                <div className="text-[9px] font-mono text-sky-600 uppercase tracking-wider mt-0.5">XP</div>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-2.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-xs font-bold text-slate-950">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "H"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || "Hindi Learner"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#050816] custom-scrollbar">
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-16">
          
          {/* ── Content View Tabs ── */}
          <div className="space-y-6">
            {activeTab === "Home" && (
              <div className="space-y-8 animate-fade-in">
                {/* ── Hero Banner ── */}
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#0f172a] to-[#050816] p-8 sm:p-10 shadow-2xl"
                >
                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
                  <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        Hindi Fundamentals · Devanagari Script
                      </div>
                      <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
                        Namaste,{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                          {user?.displayName?.split(" ")[0] || "Learner"}!
                        </span>
                      </h1>
                      <p className="max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
                        Master Devanagari vowels, consonants, essential vocabulary, and real-world conversation phrases step-by-step.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shrink-0">
                      <ProgressRing progress={Math.min(100, ((progress.swarangal + progress.vyanjanangal + progress.words) / 100) * 100)} size={56} strokeWidth={5} color="#FF9800" />
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Overall Goal</div>
                        <div className="text-lg font-extrabold text-white">Hindi Mastery</div>
                        <div className="text-[11px] text-amber-400 font-medium">Keep up the daily streak!</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Mission & Continue Learning Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#0f172a] to-[#090d1f] flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                          <Target className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Daily Target Mission</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono text-xs font-bold border border-amber-500/20">+50 XP Reward</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { text: "Learn 5 Devanagari Vowels (स्वर)", tab: "Alphabets (वर्णमाला)", done: progress.swarangal >= 5 },
                        { text: "Study 10 Hindi Words", tab: "Essential Words", done: progress.words >= 10 },
                        { text: "Take Hindi Skill Practice Quiz", tab: "Quiz Dashboard", done: false },
                      ].map((item, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveTab(item.tab)}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {item.done ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-slate-600 shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${item.done ? "text-slate-400 line-through" : "text-slate-200"}`}>{item.text}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/30 via-[#0f172a] to-[#050816] flex flex-col justify-between space-y-4 shadow-xl">
                    <div>
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md mb-3 font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Continue Learning</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Pick up right where you left off. Daily practice builds fluency fast.
                      </p>
                    </div>



                    <button
                      onClick={() => setActiveTab("Real-time AI Coach")}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] text-xs mt-3"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Real-time AI Coach</span>
                    </button>
                  </div>
                </div>

                {/* Module Cards Grid */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Hindi Modules</h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardCards.map((card) => {
                      const completed = progress[card.key] || 0;
                      const pct = card.total ? Math.min(100, Math.round((completed / card.total) * 100)) : 0;
                      
                      return (
                        <motion.button
                          key={card.key}
                          whileHover={{ y: -4, scale: 1.01 }}
                          onClick={() => setActiveTab(card.tab)}
                          className="group relative text-left p-6 rounded-3xl border border-white/10 bg-[#0f172a]/90 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-6 w-full">
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md bg-amber-500/20 border border-amber-500/30">
                              {card.icon}
                            </div>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              {card.difficulty}
                            </span>
                          </div>

                          <div className="w-full space-y-2">
                            <div className="flex items-baseline justify-between">
                              <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">
                                {card.label}
                              </h3>
                              <span className="text-xs font-sans text-amber-400 font-bold">{card.native}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {card.estimatedTime}</span>
                              <span className="font-bold text-amber-300">{pct}%</span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Alphabets (वर्णमाला)" && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-amber-400" /> Vowels (स्वर)
                  </h3>
                  {renderLetterGrid("swarangal", alphabetData.alphabet.swarangal)}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-emerald-400" /> Consonants (व्यंजन)
                  </h3>
                  {renderLetterGrid("vyanjanangal", alphabetData.alphabet.vyanjanangal)}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Languages className="w-6 h-6 text-indigo-400" /> Halant Letters (हलन्त)
                  </h3>
                  {renderLetterGrid("chillaksharangal", alphabetData.alphabet.chillaksharangal)}
                </div>
              </div>
            )}

            {activeTab === "Essential Words" && (
              <div className="space-y-6">
                {activeWordPartView === null ? (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-sky-400" /> {hindiWordsData.words.length} Essential Hindi Words
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: Math.ceil(hindiWordsData.words.length / 10) }).map((_, i) => {
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
                            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 ${
                              isLocked 
                                ? "border-white/5 bg-slate-900/40 opacity-50 cursor-not-allowed" 
                                : isInProgress
                                ? "border-amber-500 bg-amber-500/10 shadow-lg"
                                : "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50"
                            }`}
                          >
                            <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-slate-600" : isInProgress ? "text-amber-400" : "text-emerald-400"}`} />
                            <span className="text-lg font-bold text-white">{partName}</span>
                            <div className="mt-3">
                              {isLocked ? <Lock className="w-5 h-5 text-slate-600" /> : 
                               isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
                               <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">In Progress</span>}
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
                      className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                    </button>
                    
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-sky-400" /> Part {activeWordPartView + 1}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {hindiWordsData.words.slice(activeWordPartView * 10, (activeWordPartView + 1) * 10).map((word, relIdx) => {
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
                             onInteract={() => handleInteraction('words', globalIdx, word.hindi)} 
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
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-pink-400" /> {hindiNumbersData.numbers.length} Hindi Numbers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: Math.ceil(hindiNumbersData.numbers.length / 10) }).map((_, i) => {
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
                            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 ${
                              isLocked 
                                ? "border-white/5 bg-slate-900/40 opacity-50 cursor-not-allowed" 
                                : isInProgress
                                ? "border-amber-500 bg-amber-500/10 shadow-lg"
                                : "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50"
                            }`}
                          >
                            <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-slate-600" : isInProgress ? "text-amber-400" : "text-emerald-400"}`} />
                            <span className="text-lg font-bold text-white">{partName}</span>
                            <div className="mt-3">
                              {isLocked ? <Lock className="w-5 h-5 text-slate-600" /> : 
                               isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
                               <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">In Progress</span>}
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
                      className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                    </button>
                    
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-pink-400" /> Part {activeNumberPartView + 1}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {hindiNumbersData.numbers.slice(activeNumberPartView * 10, (activeNumberPartView + 1) * 10).map((number, relIdx) => {
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
                             onInteract={() => handleInteraction('numbers', globalIdx, number.hindi)} 
                           />
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Sentences" && (
              <div className="space-y-8 pb-16 w-full max-w-4xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0f172a] to-[#050816] p-8 border border-amber-500/30 shadow-2xl">
                  <h1 className="text-3xl font-extrabold text-white mb-2">Daily Conversations (वाक्य)</h1>
                  <p className="text-sm text-slate-400">Master everyday Hindi sentences grouped by practical scenarios.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sentences in Hindi, English or Tamil..."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 pl-12 pr-4 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-4">
                  {activeSentenceModuleView === null && !searchQuery.trim() ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from(new Set(formattedHindiSentences.map(p => p.moduleIndex))).map((moduleIdx) => {
                        const moduleData = formattedHindiSentences.filter(p => p.moduleIndex === moduleIdx);
                        const moduleName = moduleData[0]?.moduleName || (moduleIdx + 1);
                        const totalSentences = moduleData.reduce((sum, part) => sum + part.sentences.length, 0);
                        
                        return (
                          <button
                            key={moduleIdx}
                            onClick={() => setActiveSentenceModuleView(moduleIdx)}
                            className="flex flex-col items-center justify-center p-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 shadow-lg"
                          >
                            <MessageCircle className="w-8 h-8 mb-3 text-amber-400" />
                            <span className="text-lg font-bold text-white">Module {moduleName}</span>
                            <div className="mt-3">
                              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">{totalSentences} Sentences</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : activeSentenceLevelView === null && !searchQuery.trim() ? (
                    <div className="space-y-6 pt-4">
                      <button 
                        onClick={() => setActiveSentenceModuleView(null)}
                        className="mb-4 flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from(new Set(filteredData.map(p => p.levelIndex))).map((levelIdx) => {
                          const levelData = filteredData.filter(p => p.levelIndex === levelIdx);
                          const levelName = levelData[0]?.levelName || (levelIdx + 1);
                          const totalSentences = levelData.reduce((sum, part) => sum + part.sentences.length, 0);
                          const totalParts = levelData.length;
                          
                          return (
                            <button
                              key={levelIdx}
                              onClick={() => setActiveSentenceLevelView(levelIdx)}
                              className="flex flex-col items-center justify-center p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-300 shadow-sm"
                            >
                              <BookOpen className="w-6 h-6 mb-2 text-amber-400" />
                              <span className="text-sm font-bold text-white text-center">Level {levelName}</span>
                              <span className="text-xs text-slate-400 mt-1">{totalParts} Parts • {totalSentences} Sentences</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : activeSentencePartView === null && !searchQuery.trim() ? (
                    <div className="space-y-6 pt-4">
                      <button 
                        onClick={() => setActiveSentenceLevelView(null)}
                        className="mb-4 flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Levels
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredData.map((data) => (
                          <button
                            key={data.phase}
                            onClick={() => setActiveSentencePartView(data.phase)}
                            className="flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 bg-slate-900/40 hover:bg-white/5 transition-all duration-300 shadow-sm"
                          >
                            <BookOpen className="w-6 h-6 mb-2 text-amber-400" />
                            <span className="text-sm font-bold text-white text-center">{data.phase}</span>
                            <span className="text-xs text-slate-400 mt-1">{data.sentences.length} Sentences</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4">
                      {!searchQuery.trim() && (
                        <button 
                          onClick={() => setActiveSentencePartView(null)}
                          className="mb-4 flex items-center gap-2 text-xs font-bold text-amber-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                        </button>
                      )}
                      {filteredData
                        .filter(data => searchQuery.trim() || data.phase === activeSentencePartView)
                        .map((data) => (
                          <div key={data.phase} className="space-y-4">
                            {/* Cat Checkpoint Button */}
                            <div className="mb-6">
                              <button
                                onClick={() => setCheckpointPhase(data)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-900/40 border border-amber-500/30 p-4 font-bold text-amber-300 shadow-md hover:shadow-lg transition-all hover:bg-amber-500/30"
                              >
                                <Sparkles className="h-5 w-5 text-amber-400" />
                                Phase Oral Checkpoint with Cat AI Teacher
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {data.sentences.map((sentence, sIndex) => {
                                const isTranslated = visibleTranslations[`${data.phase}-${sIndex}`];
                                return (
                                  <div key={sIndex} className="p-5 rounded-2xl bg-[#0f172a]/80 backdrop-blur-sm border border-white/10 hover:border-amber-500/30 transition-all shadow-lg flex flex-col justify-between min-h-[140px]">
                                    <div className="flex items-start justify-between mb-4">
                                      <p className="text-xl font-bold text-amber-200 text-left w-full pr-4 leading-relaxed">{sentence.hindi}</p>
                                      <button onClick={() => playAudio(sentence.hindi)} className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-all shrink-0">
                                        <Volume2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div>
                                      <button onClick={() => toggleTranslation(sIndex, data.phase)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                                        {isTranslated ? "Hide Translation" : "View Translation"}
                                      </button>
                                      {isTranslated && (
                                        <div className="pt-3 mt-2 border-t border-white/10 text-xs space-y-1.5 text-slate-300 animate-fade-in">
                                          <p><strong className="text-white">Meaning:</strong> {sentence.english}</p>
                                          <p className="italic font-mono text-amber-300/80">{sentence.transliteration}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Checkpoint Modal */}
                <CatVoiceCheckpoint
                  isOpen={!!checkpointPhase}
                  onClose={() => setCheckpointPhase(null)}
                  phaseData={checkpointPhase}
                  onComplete={handleCheckpointComplete}
                  learningLanguage="hindi"
                  sourceLanguage="english"
                />
              </div>
            )}

            {activeTab === "Quiz" && (
              <div className="animate-fade-in -mx-6 sm:-mx-8">
                <HindiQuiz />
              </div>
            )}

            {activeTab === "Real-time AI Coach" && (
              <div className="animate-fade-in -mx-6 sm:-mx-8">
                <HindiChat />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
