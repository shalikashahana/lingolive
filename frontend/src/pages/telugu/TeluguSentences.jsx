import React, { useState, useEffect, useMemo } from "react";
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
  Play, Volume2, Eye, EyeOff, User, Filter, LogOut, Lock, Star, Flame, Zap, BarChart3, Globe, LayoutDashboard, Search, MessageCircle, ChevronDown, ChevronUp
} from "lucide-react";

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

  const formattedTeluguSentences = useMemo(() => {
    const parts = [];
    teluguSentencesData.modules.forEach((mod, modIndex) => {
      const sentences = mod.sentences;
      for (let i = 0; i < sentences.length; i += 10) {
        const partSentences = sentences.slice(i, i + 10);
        parts.push({
          moduleIndex: modIndex,
          moduleName: mod.module,
          phase: `Module ${mod.module} - Part ${Math.floor(i / 10) + 1} (${i + 1}-${i + partSentences.length})`,
          context: mod.category || "Basic Sentences",
          sentences: partSentences.map(s => ({
            english: s.english_meaning || "",
            tamil: s.tamil_meaning || "",
            telugu: s.telugu || "",
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
    "Quiz Dashboard"
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
    { key: "quiz", label: "Quiz Dashboard", tab: TABS[5], icon: "⚡", total: null, color: "#f97316", bg: "bg-orange-50", border: "border-orange-200" }
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
      const newStats = { 
        streak: stats.streak === 0 ? 1 : stats.streak, 
        xp: stats.xp + 10 
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 h-screen bg-white border-r border-[#14213D]/10 flex flex-col shadow-sm shrink-0">
        {/* Top Section */}
        <div className="p-6 border-b border-[#14213D]/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
              <Languages className="w-6 h-6 text-[#C9A227]" /> LingoLive
            </h1>
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center justify-center h-8 px-2.5 gap-1.5 rounded-lg border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-[#C9A227] group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[13px] leading-none">{currentLanguage.flag}</span>
                <span className="font-sans text-[11px] font-bold uppercase mt-0.5">
                  {currentLanguage.code}
                </span>
              </button>
              {langDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-[#14213D]/10 bg-white py-2 shadow-xl z-50">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex w-full items-center gap-3 px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                        currentLanguageCode === lang.code
                          ? "bg-[#14213D]/5 text-[#C9A227]"
                          : "text-[#14213D] hover:bg-[#14213D]/5"
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14213D]/5 px-3 py-1.5 font-mono text-xs font-semibold text-[#14213D]/70 w-fit">
            Telugu Learning
          </span>
          <button 
            onClick={() => navigate("/")}
            className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#14213D]/60 hover:text-[#14213D] hover:bg-[#14213D]/5 rounded-lg transition-colors border border-transparent hover:border-[#14213D]/10 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main
          </button>
        </div>

        {/* Middle Section (Navigation) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {TABS.map((tabName) => {
            const getIcon = (name) => {
              if (name === "Home") return <LayoutDashboard className="w-4 h-4 text-current" />;
              if (name.includes("Alphabets")) return <span className="text-sm font-telugu text-current">అ</span>;
              if (name.includes("Words")) return <BookOpen className="w-4 h-4 text-current" />;
              if (name.includes("Numbers")) return <span className="text-sm font-mono font-bold text-current">12</span>;
              if (name.includes("Sentences")) return <BookOpen className="w-4 h-4 text-current" />;
              if (name.includes("Quiz")) return <Zap className="w-4 h-4 text-current" />;
              return <CheckCircle2 className="w-4 h-4 text-current" />;
            };

            const isActive = activeTab === tabName;

            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#14213D] text-white shadow-md"
                    : "text-[#14213D]/70 hover:bg-[#14213D]/5 hover:text-[#14213D]"
                }`}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                  isActive ? "bg-white/20" : "bg-[#14213D]/10"
                }`}>
                  {getIcon(tabName)}
                </div>
                <span className="text-sm text-left truncate">{tabName}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-5 border-t border-[#14213D]/10 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${stats.streak > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                <span className="text-xs font-semibold text-[#14213D]/70">Streak</span>
              </div>
              <span className={`font-mono font-bold ${stats.streak > 0 ? "text-amber-600" : "text-[#14213D]/40"}`}>{stats.streak}</span>
            </div>
            <div className="w-px h-8 bg-[#14213D]/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${stats.xp > 0 ? "text-[#C9A227] fill-[#C9A227]" : "text-gray-400"}`} />
                <span className="text-xs font-semibold text-[#14213D]/70">Points</span>
              </div>
              <span className={`font-mono font-bold ${stats.xp > 0 ? "text-[#C9A227]" : "text-[#14213D]/40"}`}>{stats.xp}</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#14213D]/10 shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#14213D]/5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#3F6656]" />
                </div>
                <span className="text-xs font-semibold truncate text-[#14213D]">{user.email}</span>
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
          <div className="relative overflow-hidden rounded-3xl bg-[#14213D] p-6 text-white shadow-xl sm:p-10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-48 w-48 rounded-full bg-[#3F6656]/20 blur-2xl" />

        <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A227] px-3 py-1 font-mono text-xs font-bold text-[#14213D]">
                <Sparkles className="h-3.5 w-3.5" />
                Telugu Fundamentals
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-medium text-white/80 backdrop-blur-sm border border-white/10">
                Beginner
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Learn the Telugu Alphabet
            </h1>
            <p className="max-w-2xl font-sans text-sm text-white/70 leading-relaxed">
              Master the core {teluguAlphabet.total_core_letters} letters of Telugu. 
              Start with the vowels (Acchulu) and progress to the consonants (Hallulu) to build your foundation.
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab("Quiz Dashboard")}
                className="flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-3 font-sans text-sm font-bold text-[#14213D] shadow-lg transition hover:brightness-110 active:scale-95"
              >
                <Zap className="h-4 w-4 fill-[#14213D]" />
                <span>Take Quiz</span>
              </button>

              <button
                onClick={() => navigate("/analytics")}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-sans text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/15"
              >
                <BarChart3 className="h-4 w-4 text-[#C9A227]" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>

          {/* Right Progress Card (Streak and XP) */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:w-64 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Flame className={`w-5 h-5 ${stats.streak > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                 <span className="text-sm text-white/80 font-medium">Daily Streak</span>
              </div>
              <span className={`font-mono font-bold text-lg ${stats.streak > 0 ? "text-amber-500" : "text-white"}`}>{stats.streak}</span>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                 <Zap className={`w-5 h-5 ${stats.xp > 0 ? "text-[#C9A227] fill-[#C9A227]" : "text-gray-400"}`} />
                 <span className="text-sm text-white/80 font-medium">Earned XP</span>
              </div>
              <span className={`font-mono font-bold text-lg ${stats.xp > 0 ? "text-[#C9A227]" : "text-white"}`}>{stats.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#14213D]/5">
          {activeTab === "Home" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold text-[#14213D]">
                  Welcome back! 👋
                </h2>
                <p className="font-sans text-sm text-[#14213D]/60 max-w-xl">
                  Pick up where you left off or start a new lesson. Your Telugu journey is waiting for you!
                </p>
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
                      <h3 className="font-display text-lg font-bold text-[#14213D]">{card.label}</h3>
                      {card.total !== null ? (
                        <p className="font-mono text-sm font-semibold text-[#14213D]/60 mt-1">
                          {progress[card.key]} / {card.total} Completed
                        </p>
                      ) : (
                        <p className="font-sans text-sm font-semibold text-[#14213D]/60 mt-1">
                          Practice with smart challenges
                        </p>
                      )}
                    </div>
                    {/* Progress Bar (if applicable) */}
                    {card.total !== null && (
                      <div className="w-full h-1.5 rounded-full bg-white/50 mt-2 overflow-hidden border border-black/5">
                        <div 
                          className="h-full rounded-full transition-all duration-700" 
                          style={{ backgroundColor: card.color, width: `${(progress[card.key] / card.total) * 100}%` }}
                        />
                      </div>
                    )}
                  </button>
                ))}
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
        </div>
      </div>
    </main>
  </div>
);
}
