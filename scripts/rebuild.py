import re

file_path = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\pages\TeluguSentences.jsx'

part1 = r"""import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeluguQuiz from "./TeluguQuiz";
import { teluguAlphabet } from "../data/teluguAlphabetData";
import { teluguWords } from "../data/teluguWordsData";
import { teluguNumbers } from "../data/teluguNumbersData";
import { teluguSentences } from "../data/teluguSentencesData";
import { useAuth } from "../context/AuthContext";
import { 
  BookOpen, Sparkles, Languages, CheckCircle2, ChevronRight, ArrowLeft,
  Play, Volume2, Eye, EyeOff, User, Filter, LogOut, Lock, Star, Flame, Zap, BarChart3 
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
  const [activeTab, setActiveTab] = useState("Vowels (అచ్చులు - Acchulu)");

  const vowels = teluguAlphabet.categories.find(c => c.category_name.includes("Vowels"));
  const consonants = teluguAlphabet.categories.find(c => c.category_name.includes("Consonants"));

  const groupedWords = teluguWords.words.reduce((acc, word) => {
    if (!acc[word.category]) acc[word.category] = [];
    acc[word.category].push(word);
    return acc;
  }, {});

  const wordCategories = Object.keys(groupedWords);
  const [activeWordCategory, setActiveWordCategory] = useState(wordCategories[0]);

  const groupedSentencesByModule = teluguSentences.reduce((acc, sentence, idx) => {
    const setNum = Math.floor(idx / 10) + 1;
    const moduleNum = Math.floor((setNum - 1) / 50) + 1;
    const moduleName = `Module ${moduleNum}`;
    const category = `Part ${setNum} (${(setNum - 1) * 10 + 1}-${setNum * 10})`;
    
    if (!acc[moduleName]) acc[moduleName] = {};
    if (!acc[moduleName][category]) acc[moduleName][category] = [];
    acc[moduleName][category].push({
      ...sentence,
      telugu: sentence.te,
      english: sentence.en,
      tamil: sentence.ta,
      transliteration: sentence.tr,
      number: sentence.id
    });
    return acc;
  }, {});

  const [activeSentenceModule, setActiveSentenceModule] = useState(null);
  const [activeSentencePartView, setActiveSentencePartView] = useState(null);
  
  const TABS = [
    vowels.category_name,
    consonants.category_name,
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
              <Languages className="w-6 h-6 text-[#C9A227]" /> Mozhify
            </h1>
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
              if (name.includes("Vowels")) return <span className="text-sm font-telugu text-current">అ</span>;
              if (name.includes("Consonants")) return <span className="text-sm font-telugu text-current">క</span>;
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
"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the Hero Banner and Content Grid from the current file.
# The current file has them inside `<main className="flex-1 flex flex-col overflow-y-auto">\n        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-16">`
start_marker = '<div className="relative overflow-hidden rounded-3xl bg-[#14213D]'
# Extract from start_marker to end of file, except the last few closing tags

start_idx = content.find(start_marker)
remaining = content[start_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(part1 + "          " + remaining)

print("Rebuilt file successfully.")
