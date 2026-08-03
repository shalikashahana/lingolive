import React, { useState, useEffect, useMemo } from "react";
import { calculateNewStreak } from "../../utils/streak";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CatVoiceCheckpoint from "../../components/catTeacher/CatVoiceCheckpoint";
import TeluguQuiz from "./TeluguQuiz";
import { teluguAlphabet } from "../../data/teluguAlphabetData";
import { teluguWords } from "../../data/teluguWordsData";
import { teluguNumbers } from "../../data/teluguNumbersData";
import { teluguSentences } from "../../data/teluguSentencesData";
import { useAuth } from "../../context/AuthContext";
import { 
  BookOpen, Sparkles, Languages, CheckCircle2, ChevronRight, ArrowLeft,
  Play, Volume2, Eye, EyeOff, User, Filter, LogOut, Lock, Star, Flame, Zap, BarChart3, Globe, LayoutDashboard, Search, MessageCircle, ChevronDown, ChevronUp, Bot
} from "lucide-react";
import TeluguChat from "./TeluguChat";

function WordCard({ word, playAudio, index, isCompleted, isInProgress, isLocked, onInteract }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div className={`group relative flex flex-col p-5 bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden h-full ${
      isInProgress ? "border-[#C9A227] ring-2 ring-[#C9A227]/30" : 
      isCompleted ? "border-emerald-500/30 bg-emerald-50/30" : 
      "border-[#14213D]/10"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
      
      {/* Top action/status bar */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isInProgress && <Play className="w-4 h-4 text-[#C9A227] animate-pulse" />}
          {isLocked && <Lock className="w-4 h-4 text-[#14213D]/40" />}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onInteract(); }}
          disabled={isLocked}
          className={`p-1.5 rounded-xl shadow-sm border transition-all z-10 hover:scale-110 active:scale-95 ${
            isLocked ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50" : "bg-[#14213D]/5 border-[#14213D]/5 hover:bg-[#C9A227]/10 hover:border-[#C9A227]/20"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${isLocked ? "text-gray-400" : "text-[#14213D]/60 hover:text-[#C9A227]"}`} />
        </button>
      </div>

      <div className="flex-1">
        <span className="text-[22px] font-bold font-telugu leading-[1.7] tracking-wide text-[#14213D] mb-3 pr-2 flex items-start gap-2 break-words">
          {word.number && (
            <span className="mt-1 flex-shrink-0 bg-gradient-to-br from-[#C9A227]/20 to-[#C9A227]/10 border border-[#C9A227]/20 text-[#8C6D13] px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-sm">
              {word.number}.
            </span>
          )}
          <span className={isLocked ? "blur-[2px] opacity-70" : ""}>{word.telugu}</span>
        </span>
        
        <div className={`flex flex-wrap gap-2 mb-5 ${isLocked ? "opacity-50" : ""}`}>
          <span className="font-mono text-[11px] font-medium bg-[#14213D]/5 border border-[#14213D]/10 text-[#14213D]/70 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-[#14213D]/10">
            {word.transliteration}
          </span>
          {word.tamil_transliteration && (
            <span className="font-sans text-[11px] font-medium bg-[#14213D]/5 border border-[#14213D]/10 text-[#14213D]/70 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-[#14213D]/10">
              {word.tamil_transliteration}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-[#14213D]/5 pt-4">
        {!revealed ? (
          <button 
            onClick={() => !isLocked && setRevealed(true)}
            disabled={isLocked}
            className={`flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold tracking-wide rounded-xl transition-all ${
              isLocked 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "text-[#14213D]/60 bg-[#14213D]/5 hover:bg-[#14213D]/10 hover:text-[#14213D]"
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
            {isLocked ? "Locked" : "View Translation"}
          </button>
        ) : (
          <div 
            onClick={() => setRevealed(false)} 
            className="flex flex-col gap-1.5 cursor-pointer group/reveal p-3 -mx-3 -mb-3 rounded-xl hover:bg-[#14213D]/5 transition-colors relative"
          >
            <div className="flex justify-between items-start pr-8">
              <span className="font-sans font-bold text-sm text-[#14213D] leading-tight">
                {word.english}
              </span>
              <EyeOff className="absolute top-3.5 right-3 w-4 h-4 text-[#14213D]/40 group-hover/reveal:text-[#14213D] transition-colors" />
            </div>
            <span className="font-sans text-xs font-medium text-[#14213D]/60">
              {word.tamil}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeluguSentences() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const savedTab = localStorage.getItem("telugu_active_tab");
  const [activeTab, setActiveTabState] = useState(savedTab || "Home");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem("telugu_active_tab", tab);
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
  const currentLanguageCode = localStorage.getItem("lingolive_target_language") || "en";
  const currentLanguage = availableLanguages.find(l => l.code === currentLanguageCode) || availableLanguages[0];

  const changeLanguage = (code) => {
    localStorage.setItem("lingolive_target_language", code);
    setLangDropdownOpen(false);
    window.location.href = "/"; 
  };


  const vowels = teluguAlphabet.categories.find(c => c.category_name.includes("Vowels"));
  const consonants = teluguAlphabet.categories.find(c => c.category_name.includes("Consonants"));

  const groupedWords = teluguWords.words.reduce((acc, word) => {
    if (!acc[word.category]) acc[word.category] = [];
    acc[word.category].push(word);
    return acc;
  }, {});

  const [activeWordModuleView, setActiveWordModuleView] = useState(null);
  const [activeWordPartView, setActiveWordPartView] = useState(null);
  const [activeSentenceModuleView, setActiveSentenceModuleView] = useState(null);
  const [activeQuizModuleView, setActiveQuizModuleView] = useState(null);
  const [activeQuizPartView, setActiveQuizPartView] = useState(null);

  const wordCategories = Object.keys(groupedWords);
  const [activeWordCategory, setActiveWordCategory] = useState(wordCategories[0]);

  const teluguSentencesData = useMemo(() => {
    const modules = [];
    const numModules = Math.ceil(teluguSentences.length / 100);
    for (let i = 0; i < numModules; i++) {
      modules.push({
        module: String(i + 1),
        sentences: teluguSentences.slice(i * 100, (i + 1) * 100)
      });
    }
    return {
      total_sentences: teluguSentences.length,
      modules: modules
    };
  }, []);

  const formattedTeluguSentences = useMemo(() => {
    const parts = [];
    const moduleSize = 100;
    for (let i = 0; i < teluguSentences.length; i += 10) {
      const partSentences = teluguSentences.slice(i, i + 10);
      const moduleIndex = Math.floor(i / moduleSize);
      const moduleName = String(moduleIndex + 1);
      parts.push({
        moduleIndex: moduleIndex,
        moduleName: moduleName,
        phase: `Module ${moduleName} - Part ${Math.floor((i % moduleSize) / 10) + 1} (${i + 1}-${Math.min(i + 10, teluguSentences.length)})`,
        context: "Basic Sentences",
        sentences: partSentences.map(s => ({
          english: s.en || "",
          tamil: s.ta || "",
          telugu: s.te || "",
          transliteration: s.tr || ""
        }))
      });
    }
    return parts;
  }, []);

  const [activePhaseKey, setActivePhaseKey] = useState(null);
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [checkpointPhase, setCheckpointPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState(() => {
    return JSON.parse(localStorage.getItem("telugu_cat_completed_phases") || "{}");
  });

  const handleCheckpointComplete = (score, total) => {
    if (checkpointPhase) {
      const updated = { ...completedPhases, [checkpointPhase.phase]: { score, total } };
      setCompletedPhases(updated);
      localStorage.setItem("telugu_cat_completed_phases", JSON.stringify(updated));
    }
  };

  const filteredData = useMemo(() => {
    let dataToFilter = formattedTeluguSentences;
    
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
        const teMatch = s.telugu.includes(searchQuery);
        return enMatch || taMatch || teMatch;
      });
      return { ...phaseObj, sentences: matchingSentences };
    }).filter(phaseObj => phaseObj.sentences.length > 0);
  }, [searchQuery, formattedTeluguSentences, activeSentenceModuleView]);

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
  
  const TABS = [
    "Home",
    "Alphabets (అక్షరమాల)",
    "Essential Words",
    "Numbers (1-100)",
    "Sentences",
    "Quiz Dashboard",
    "AI Conversation"
  ];

  // Progress Tracking State
  const [progress, setProgress] = useState({
    vowels: 0,
    consonants: 0,
    words: 0,
    numbers: 0,
    sentences: 0
  });
  const [stats, setStats] = useState({ streak: 0, xp: 0 });

  useEffect(() => {
    const savedProgressStr = localStorage.getItem("telugu_progress");
    const defaultProgress = { vowels: 0, consonants: 0, words: 0, numbers: 0, sentences: 0 };
    const savedProgress = savedProgressStr ? JSON.parse(savedProgressStr) : defaultProgress;
    setProgress({ ...defaultProgress, ...savedProgress });

    const savedStats = JSON.parse(localStorage.getItem("telugu_stats") || '{"streak":0,"xp":0}');
    setStats(savedStats);
  }, []);

  // Dashboard overview cards
  const dashboardCards = [
    { key: "vowels", label: "Vowels (అచ్చులు)", tab: TABS[1], icon: "అ", total: vowels?.letters?.length || 16, color: "#C9A227", bg: "bg-amber-50", border: "border-amber-200" },
    { key: "consonants", label: "Consonants (హల్లులు)", tab: TABS[1], icon: "క", total: consonants?.letters?.length || 36, color: "#3F6656", bg: "bg-emerald-50", border: "border-emerald-200" },
    { key: "words", label: "Essential Words", tab: TABS[2], icon: "📚", total: teluguWords.words?.length || 0, color: "#6366f1", bg: "bg-indigo-50", border: "border-indigo-200" },
    { key: "numbers", label: "Numbers (1-100)", tab: TABS[3], icon: "🔢", total: teluguNumbers.numbers?.length || 100, color: "#ec4899", bg: "bg-pink-50", border: "border-pink-200" },
    { key: "sentences", label: "Sentences", tab: TABS[4], icon: "💬", total: teluguSentences?.length || 0, color: "#0ea5e9", bg: "bg-sky-50", border: "border-sky-200" },
    { key: "quiz", label: "Quiz Dashboard", tab: TABS[5], icon: "⚡", total: null, color: "#f97316", bg: "bg-orange-50", border: "border-orange-200" },
    { key: "ai", label: "AI Conversation", tab: TABS[6], icon: "🤖", total: null, color: "#7c3aed", bg: "bg-violet-50", border: "border-violet-200" }
  ];

  const playAudio = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "te-IN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleInteraction = (type, index, text) => {
    playAudio(text);
    
    // If they interact with the currently 'in-progress' item, unlock next and add XP
    if (index === progress[type]) {
      const newProgress = { ...progress, [type]: index + 1 };
      const { streak: updatedStreak, lastActiveDate } = calculateNewStreak(stats);
      const newStats = { streak: updatedStreak, lastActiveDate, xp: stats.xp + 10 
      };
      
      setProgress(newProgress);
      setStats(newStats);
      
      localStorage.setItem("telugu_progress", JSON.stringify(newProgress));
      localStorage.setItem("telugu_stats", JSON.stringify(newStats));
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

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden font-sans text-white">
      {/* ── Left Sidebar (dark glassmorphism) ── */}
      <aside className="w-64 h-screen bg-[#050816]/95 border-r border-white/[0.08] flex flex-col backdrop-blur-2xl shrink-0">

        {/* Brand header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-white shadow-lg shadow-amber-500/30">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight leading-none block">LingoLive</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Telugu Edition</span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/10 transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm leading-none">{currentLanguage.flag}</span>
              <span className="font-mono text-[10px] font-bold uppercase text-slate-300">{currentLanguage.code}</span>
            </button>
            {langDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a]/95 py-2 shadow-2xl backdrop-blur-2xl z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      currentLanguageCode === lang.code
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
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

        {/* Back to main */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main
          </button>
        </div>

        {/* Section label */}
        <div className="px-6 pt-3 pb-1">
          <span className="font-mono text-[10px] font-bold text-slate-600 uppercase tracking-widest">Core Modules</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {TABS.map((tabName) => {
            const getIcon = (name) => {
              if (name === "Home") return <LayoutDashboard className="w-4 h-4" />;
              if (name.includes("Alphabets")) return <span className="text-sm font-telugu">అ</span>;
              if (name.includes("Words")) return <BookOpen className="w-4 h-4" />;
              if (name.includes("Numbers")) return <span className="text-sm font-mono font-bold">12</span>;
              if (name.includes("Sentences")) return <BookOpen className="w-4 h-4" />;
              if (name.includes("Quiz")) return <Zap className="w-4 h-4" />;
              if (name.includes("AI")) return <Bot className="w-4 h-4" />;
              return <CheckCircle2 className="w-4 h-4" />;
            };
            const isActive = activeTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/15 border border-amber-500/30 text-white shadow-sm"
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

        {/* Bottom: Stats + Profile */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2" title="Daily Streak">
              <Flame className={`w-4 h-4 shrink-0 ${stats.streak > 0 ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
              <div>
                <div className={`font-bold text-sm leading-none ${stats.streak > 0 ? "text-amber-300" : "text-slate-500"}`}>{stats.streak}d</div>
                <div className="text-[9px] font-mono text-amber-600 uppercase tracking-wider mt-0.5">Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-sky-500/10 border border-sky-500/20 px-3 py-2" title="XP Points">
              <Zap className={`w-4 h-4 shrink-0 ${stats.xp > 0 ? "text-sky-400 fill-sky-400" : "text-slate-500"}`} />
              <div>
                <div className={`font-bold text-sm leading-none ${stats.xp > 0 ? "text-sky-300" : "text-slate-500"}`}>{stats.xp}</div>
                <div className="text-[9px] font-mono text-sky-600 uppercase tracking-wider mt-0.5">XP</div>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 text-xs font-bold text-white">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "L"}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user.displayName || "Learner"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#050816] custom-scrollbar">
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6 pb-16">

          {/* ── Hero Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#0c1a2e] via-[#0f1e38] to-[#050816] p-8 sm:p-10 shadow-2xl"
          >
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold text-amber-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Telugu Fundamentals · {teluguAlphabet.total_core_letters} Letters
                </div>
                <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    {user?.displayName?.split(" ")[0] || "Learner"}
                  </span>
                </h1>
                <p className="max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
                  {stats.streak > 0
                    ? <>You're on a <span className="text-amber-400 font-bold">{stats.streak}-day streak</span>! Keep practicing daily to maintain momentum.</>
                    : "Start your learning streak today by completing your first lesson module!"}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("Alphabets (అక్షరమాల)")}
                className="flex items-center gap-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <span>Start Learning</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

      {/* ── Content Area ── */}
      <div className="space-y-6">
          {activeTab === "Home" && (
            <div className="space-y-6 animate-fade-in">

              {/* ── Stats Row (4 cards) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Daily Streak */}
                <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Daily Streak</span>
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
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">Level 1 XP</span>
                    <span className="text-xs font-bold text-amber-400">{stats.xp} / 500</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (stats.xp / 500) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{Math.max(0, 500 - stats.xp)} XP remaining to Level 2</span>
                </div>

                {/* Alphabet Progress */}
                <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Alphabet Progress</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-emerald-400">{progress.vowels + progress.consonants}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ {teluguAlphabet.total_core_letters} Letters</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-xl font-bold font-telugu text-emerald-400">అ</span>
                  </div>
                </div>

                {/* Words Learned */}
                <div className="p-5 border border-white/[0.08] rounded-2xl bg-white/[0.03] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Words Learned</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-sky-400">{progress.words}</span>
                      <span className="text-xs text-slate-400 font-semibold">/ {teluguWords.words?.length || 200} Words</span>
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
                        { text: "Learn 5 Telugu Vowels (అచ్చులు)", tab: "Alphabets (అక్షరమాల)", done: progress.vowels >= 5 },
                        { text: "Study 10 Essential Words", tab: "Essential Words", done: progress.words >= 10 },
                        { text: "Practice with Quiz Dashboard", tab: "Quiz Dashboard", done: false },
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
                              <div className="h-5 w-5 rounded-full border-2 border-slate-600 shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${item.done ? "text-slate-400 line-through" : "text-slate-200"}`}>{item.text}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => setActiveTab("Alphabets (అక్షరమాల)")}
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
                      Practice real-time Telugu conversations with instant feedback on pronunciation and vocabulary usage.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardCards.map((card) => (
                    <button
                      key={card.key}
                      onClick={() => setActiveTab(card.tab)}
                      className="group relative text-left p-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] flex flex-col justify-between overflow-hidden transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-8 w-full">
                        <div
                          className="h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
                          style={{ backgroundColor: card.color }}
                        >
                          {card.icon}
                        </div>
                        <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-amber-500 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors mb-2">
                          {card.label}
                        </h3>
                        {card.total !== null ? (
                          <>
                            <p className="font-mono text-xs text-slate-400 mb-2">{progress[card.key]} / {card.total} Completed</p>
                            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ backgroundColor: card.color, width: `${(progress[card.key] / card.total) * 100}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Practice with smart challenges and interactive exercises.
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "Alphabets (అక్షరమాల)" && (
          <div className="space-y-12">
            <div className="space-y-12">
            {vowels.subsets.map((subset, subsetIdx) => (
              <div key={subset.type} className="space-y-5">
                <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
                  <Languages className="w-6 h-6 text-[#C9A227]" /> {subset.type}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-5">
                  {subset.letters.map((letter, idx) => {
                    // Global index for the vowels tab to ensure linear progression
                    const globalIdx = subsetIdx === 0 ? idx : vowels.subsets[0].letters.length + idx;
                    const isCompleted = globalIdx < progress.vowels;
                    const isInProgress = globalIdx === progress.vowels;
                    const isLocked = globalIdx > progress.vowels;
                    
                    return (
                    <div 
                      key={idx} 
                      onClick={() => !isLocked && handleInteraction('vowels', globalIdx, letter.char)}
                      className={`group relative flex flex-col items-center justify-between aspect-square p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isInProgress
                          ? "border-[#C9A227] bg-[#C9A227]/10 ring-2 ring-[#C9A227]/50 shadow-lg cursor-pointer"
                          : isCompleted
                          ? "border-emerald-500/30 bg-emerald-50/50 cursor-pointer"
                          : "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed"
                      } ${!isLocked ? 'hover:-translate-y-1 hover:shadow-md' : ''}`}
                    >
                      <div className="flex w-full items-center justify-between z-10">
                         <span className="font-mono text-[10px] font-bold text-[#14213D]/60">{globalIdx + 1}</span>
                         {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                         {isInProgress && <Play className="w-4 h-4 text-[#C9A227] fill-[#C9A227] animate-bounce" />}
                         {isLocked && <Lock className="w-4 h-4 text-[#14213D]/40" />}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                      {!isLocked && <Volume2 className="absolute top-8 right-3 w-4 h-4 text-[#14213D]/20 group-hover:text-[#C9A227] transition-colors" />}
                      
                      <div className="my-2 flex h-14 w-14 items-center justify-center rounded-2xl font-mono text-base font-bold transition shadow-sm bg-gradient-to-br text-[#14213D] shadow-[#14213D]/10 bg-white">
                        <span className={`text-[40px] font-bold font-telugu leading-none ${isLocked ? 'text-gray-400' : 'text-[#14213D] group-hover:text-[#C9A227]'} transition-colors drop-shadow-sm`}>
                          {letter.char}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 z-10 w-full px-1">
                        <span className="font-mono text-[11px] font-semibold bg-[#14213D]/5 text-[#14213D]/70 px-2 py-0.5 rounded-lg w-full text-center truncate">
                          {letter.transliteration}
                        </span>
                        <div className="flex justify-center gap-1 mt-1">
                          {isCompleted ? (
                             Array.from({ length: 3 }).map((_, i) => (
                               <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                             ))
                           ) : isInProgress ? (
                             <span className="font-mono text-[10px] font-bold text-[#C9A227]">In Progress</span>
                           ) : (
                             <span className="font-mono text-[10px] text-gray-400">Locked</span>
                           )}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            ))}
            </div>

          <div className="space-y-6">
             <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
                <Languages className="w-6 h-6 text-[#3F6656]" /> Basic Consonants
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
                {consonants.letters.map((letter, idx) => {
                  const isCompleted = idx < progress.consonants;
                  const isInProgress = idx === progress.consonants;
                  const isLocked = idx > progress.consonants;

                  return (
                  <div 
                    key={idx} 
                    onClick={() => !isLocked && handleInteraction('consonants', idx, letter.char)}
                    className={`group relative flex flex-col items-center justify-between aspect-square p-3 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isInProgress
                        ? "border-[#3F6656] bg-[#3F6656]/10 ring-2 ring-[#3F6656]/50 shadow-lg cursor-pointer"
                        : isCompleted
                        ? "border-emerald-500/30 bg-emerald-50/50 cursor-pointer"
                        : "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed"
                    } ${!isLocked ? 'hover:-translate-y-1 hover:shadow-md' : ''}`}
                  >
                    <div className="flex w-full items-center justify-between z-10">
                       <span className="font-mono text-[10px] font-bold text-[#14213D]/60">{idx + 1}</span>
                       {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                       {isInProgress && <Play className="w-4 h-4 text-[#3F6656] fill-[#3F6656] animate-bounce" />}
                       {isLocked && <Lock className="w-4 h-4 text-[#14213D]/40" />}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                    {!isLocked && <Volume2 className="absolute top-6 right-2 w-3.5 h-3.5 text-[#14213D]/20 group-hover:text-[#3F6656] transition-colors" />}
                    
                    <div className="my-1 flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-bold transition shadow-sm bg-gradient-to-br text-[#14213D] shadow-[#14213D]/10 bg-white">
                      <span className={`text-[32px] font-bold font-telugu leading-none ${isLocked ? 'text-gray-400' : 'text-[#14213D] group-hover:text-[#3F6656]'} transition-colors drop-shadow-sm`}>
                        {letter.char}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 z-10 w-full px-1">
                      <span className="font-mono text-[10px] font-semibold bg-[#14213D]/5 text-[#14213D]/70 px-1.5 py-0.5 rounded w-full text-center truncate">
                        {letter.transliteration}
                      </span>
                      <div className="flex justify-center gap-1 mt-1">
                        {isCompleted ? (
                           Array.from({ length: 3 }).map((_, i) => (
                             <Star key={i} className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                           ))
                         ) : isInProgress ? (
                           <span className="font-mono text-[9px] font-bold text-[#3F6656]">In Progress</span>
                         ) : (
                           <span className="font-mono text-[9px] text-gray-400">Locked</span>
                         )}
                      </div>
                    </div>
                  </div>
                )})}
             </div>
          </div>
        </div>
        )}

        {activeTab === "Essential Words" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {wordCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveWordCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeWordCategory === category 
                      ? "bg-[#14213D] text-white shadow-md"
                      : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-[#14213D]/10">
              <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#3F6656]" /> {activeWordCategory}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedWords[activeWordCategory].map((word, idx) => {
                   const isCompleted = idx < progress.words;
                   const isInProgress = idx === progress.words;
                   const isLocked = idx > progress.words;
                   return (
                     <WordCard 
                       key={word.id} 
                       word={word} 
                       index={idx}
                       isCompleted={isCompleted}
                       isInProgress={isInProgress}
                       isLocked={isLocked}
                       onInteract={() => handleInteraction('words', idx, word.telugu)} 
                     />
                   );
                })}
              </div>
            </div>
          </div>
        )}

         {activeTab === "Numbers (1-100)" && (
           <div className="space-y-4">
             <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-[#3F6656]" /> 1 to 100
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {teluguNumbers.numbers.map((num, idx) => {
                   const isCompleted = idx < progress.numbers;
                   const isInProgress = idx === progress.numbers;
                   const isLocked = idx > progress.numbers;
                   return (
                     <WordCard 
                       key={`num-${num.number}`} 
                       word={num} 
                       index={idx}
                       isCompleted={isCompleted}
                       isInProgress={isInProgress}
                       isLocked={isLocked}
                       onInteract={() => handleInteraction('numbers', idx, num.telugu)} 
                     />
                   );
               })}
             </div>
           </div>
         )}
         {activeTab === "Sentences" && (
            <div className="space-y-8 pb-20 w-full max-w-4xl mx-auto">
              {/* Premium Animated Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#14213D] via-[#1a2f5c] to-[#0f172a] p-8 sm:p-10 text-white shadow-2xl"
              >
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A227] opacity-20 blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#3F6656] opacity-30 blur-3xl"></div>
                
                <div className="relative z-10 space-y-4 text-center sm:text-left flex flex-col items-center sm:items-start">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#e6c148] backdrop-blur-md"
                  >
                    <Sparkles className="h-4 w-4" /> Fluent Expressions
                  </motion.div>
                  <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    Daily Conversations
                  </h1>
                  <p className="max-w-xl font-sans text-base sm:text-lg text-white/70 leading-relaxed text-center sm:text-left">
                    Master everyday Telugu sentences grouped by real-life contexts. Use the search bar to find specific phrases instantly.
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
                  <Search className="h-5 w-5 text-[#14213D]/40" />
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
                  placeholder="Search for sentences in Telugu, English or Tamil..."
                  className="w-full bg-white/80 backdrop-blur-md border border-[#14213D]/15 rounded-2xl py-4 pl-12 pr-4 font-sans text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227]/50 transition-all text-[#14213D] placeholder:text-[#14213D]/40"
                />
              </motion.div>

              {/* Accordion Layout */}
              <div className="flex flex-col gap-4">
                  {!searchQuery.trim() && activeSentenceModuleView === null ? (
                    <div className="space-y-4 pt-4">
                      <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#f59e0b]" /> {teluguSentencesData.total_sentences} Sentences
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {teluguSentencesData.modules.map((moduleData, i) => (
                          <button
                            key={moduleData.module}
                            onClick={() => setActiveSentenceModuleView(i)}
                            className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 border-[#14213D]/10 hover:border-[#C9A227] bg-white hover:bg-[#C9A227]/5 shadow-sm hover:shadow-md"
                          >
                            <BookOpen className="w-8 h-8 mb-3 text-[#C9A227]" />
                            <span className="font-display text-lg font-bold text-[#14213D]">Module {moduleData.module}</span>
                            {moduleData.category && <span className="text-sm text-gray-500 mt-2 text-center">{moduleData.category}</span>}
                            <div className="mt-4">
                              <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full">{moduleData.total_sentences || moduleData.sentences.length} Sentences</span>
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
                            className="flex items-center gap-2 text-sm font-bold text-[#14213D]/60 hover:text-[#14213D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10 w-fit"
                          >
                            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
                          </button>
                        </div>
                      )}

                      {filteredData.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-[#14213D]/60 font-sans text-lg">No matches found for "{searchQuery}"</p>
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
                              className={`rounded-3xl border ${isActive ? 'border-[#14213D]/20 shadow-xl bg-white/90 backdrop-blur-md' : 'border-[#14213D]/10 bg-white/60 backdrop-blur-sm'} transition-all duration-300 overflow-hidden`}
                            >
                              {/* Accordion Header */}
                              <button
                                onClick={() => togglePhase(data.phase)}
                                className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-[#14213D]/5 transition-colors"
                              >
                                <div>
                                  <h2 className={`font-display text-2xl font-extrabold ${isActive ? 'text-[#14213D]' : 'text-[#14213D]/80'}`}>
                                    {data.phase} {completedPhases[data.phase] && <span className="ml-2 inline-flex items-center text-sm font-bold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">⭐ Passed</span>}
                                  </h2>
                                  <p className="font-sans text-sm text-[#14213D]/60 mt-1">
                                    {data.context} • {data.sentences.length} items
                                  </p>
                                </div>
                                <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-[#14213D]/10' : 'bg-transparent'}`}>
                                  {isActive ? <ChevronUp className="h-6 w-6 text-[#14213D]" /> : <ChevronDown className="h-6 w-6 text-[#14213D]/60" />}
                                </div>
                              </button>

                              {/* Accordion Content */}
                              <AnimatePresence>
                                {isActive && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-[#14213D]/5"
                                  >
                                    <div className="p-6 sm:p-8 pt-6">
                                      {/* Cat Checkpoint Button */}
                                      <div className="mb-8">
                                        <button
                                          onClick={() => setCheckpointPhase(data)}
                                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14213D] to-[#1a2f5c] p-4 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                                        >
                                          <Sparkles className="h-5 w-5 text-[#C9A227]" />
                                          Phase Oral Checkpoint with Cat AI Teacher
                                        </button>
                                      </div>

                                      <div className="space-y-4">
                                        {data.sentences.map((sentence, sIndex) => {
                                          const isTranslated = visibleTranslations[`${data.phase}-${sIndex}`];
                                          
                                          return (
                                            <div key={sIndex} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl bg-white border border-[#14213D]/10 hover:border-[#C9A227]/30 hover:shadow-md transition-all duration-300">
                                              <div className="flex-shrink-0 mt-1">
                                                <div className="h-10 w-10 rounded-full bg-[#14213D]/5 flex items-center justify-center text-[#14213D]/40 group-hover:bg-[#C9A227]/10 group-hover:text-[#C9A227] transition-colors">
                                                  <MessageCircle className="h-5 w-5" />
                                                </div>
                                              </div>
                                              
                                              <div className="flex-1 space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                  <p className="font-serif text-xl sm:text-2xl text-[#14213D] font-medium leading-snug">
                                                    {sentence.telugu}
                                                  </p>
                                                  <button 
                                                    onClick={() => playAudio(sentence.telugu)}
                                                    className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#C9A227] transition-colors flex-shrink-0"
                                                  >
                                                    <Volume2 className="h-5 w-5" />
                                                  </button>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                  <button
                                                    onClick={() => toggleTranslation(sIndex, data.phase)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
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
                                                      className="pt-3 border-t border-gray-100 space-y-2"
                                                    >
                                                      <p className="font-sans text-[#14213D]/80">
                                                        <strong className="text-[#14213D]">Meaning:</strong> {sentence.english}
                                                      </p>
                                                      <p className="font-sans text-[#14213D]/60 text-sm">
                                                        {sentence.tamil}
                                                      </p>
                                                      <p className="font-sans text-[#14213D]/60 text-sm italic font-mono bg-gray-50 p-2 rounded-lg mt-2">
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
                learningLanguage="telugu"
                sourceLanguage="english"
              />
            </div>
         )}
         
         {activeTab === "Quiz Dashboard" && (
           <div className="-mx-4 sm:-mx-10 -my-6 sm:-my-10">
             <TeluguQuiz onExit={() => setActiveTab(TABS[0])} />
           </div>
         )}

         {activeTab === "AI Conversation" && (
           <div className="-mx-4 sm:-mx-10 -my-6 sm:-my-10">
             <TeluguChat />
           </div>
         )}
        </div>
      </div>
    </main>
  </div>
);
}
