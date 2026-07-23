import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teluguAlphabet } from "../data/teluguAlphabetData";
import { teluguWords } from "../data/teluguWordsData";
import { teluguNumbers } from "../data/teluguNumbersData";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Sparkles, Languages, CheckCircle2, ChevronRight, Play, Volume2, Eye, EyeOff, User, Filter, LogOut } from "lucide-react";

function WordCard({ word, playAudio }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="group relative flex flex-col p-4 bg-white rounded-2xl border border-gray-200 transition-all hover:border-[#14213D] hover:-translate-y-1 hover:shadow-lg shadow-sm">
      <button 
        onClick={(e) => { e.stopPropagation(); playAudio(word.telugu); }}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-50 shadow-sm border border-gray-100 hover:bg-[#C9A227]/20 transition-colors z-10"
      >
        <Volume2 className="w-4 h-4 text-gray-500 hover:text-[#C9A227]" />
      </button>

      <span className="text-xl font-bold text-[#14213D] mb-1 pr-8 flex items-center gap-2">
        {word.number && <span className="bg-[#C9A227]/20 text-[#14213D] px-2 py-0.5 rounded text-sm">{word.number}.</span>}
        {word.telugu}
      </span>
      <div className="flex gap-2 mb-4">
        <span className="font-mono text-[11px] bg-gray-100/80 text-gray-500 px-2 py-0.5 rounded transition-colors group-hover:bg-[#14213D]/5">
          {word.transliteration}
        </span>
        {word.tamil_transliteration && (
          <span className="font-sans font-medium text-[11px] bg-gray-100/80 text-gray-500 px-2 py-0.5 rounded transition-colors group-hover:bg-[#14213D]/5">
            {word.tamil_transliteration}
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-gray-100 pt-3">
        {!revealed ? (
          <button 
            onClick={() => setRevealed(true)}
            className="flex items-center gap-1.5 w-full justify-center py-2 text-xs font-semibold text-[#14213D]/60 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-[#14213D] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Show Translation
          </button>
        ) : (
          <div 
            onClick={() => setRevealed(false)} 
            className="flex flex-col gap-1 cursor-pointer group/reveal p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors relative"
          >
            <div className="flex justify-between items-start pr-6">
              <span className="font-sans font-semibold text-sm text-[#14213D]">
                {word.english}
              </span>
              <EyeOff className="absolute top-2.5 right-2 w-3.5 h-3.5 text-gray-400 group-hover/reveal:text-[#14213D] transition-colors" />
            </div>
            <span className="font-sans text-xs text-[#14213D]/70 pr-6">
              {word.tamil}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeluguDashboard() {
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
  
  const TABS = [
    vowels.category_name,
    consonants.category_name,
    "Essential Words",
    "Numbers (1-100)"
  ];

  const playAudio = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "te-IN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
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
    <div className="space-y-8 pb-16">
      {/* Title & User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
           <Languages className="w-6 h-6 text-[#C9A227]" /> Telugu Dashboard
        </h1>
        {user && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 text-[#14213D]/70 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10">
              <User className="w-4 h-4 text-[#3F6656]" />
              <span className="text-sm font-semibold truncate max-w-[200px]">{user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors shadow-sm border border-red-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Hero Level Banner */}
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
              Learn the {teluguAlphabet.native_name} Alphabet
            </h1>
            <p className="max-w-2xl font-sans text-sm text-white/70 leading-relaxed">
              Master the core {teluguAlphabet.total_core_letters} letters of Telugu. 
              Start with the vowels (Acchulu) and progress to the consonants (Hallulu) to build your foundation.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:w-64">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Total Letters</span>
                <span className="font-mono font-bold text-[#C9A227]">{teluguAlphabet.total_core_letters} Core</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="font-mono text-xl font-bold text-white">{vowels.total_count}</p>
                <p className="text-[11px] text-white/60">Vowels</p>
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-[#C9A227]">{consonants.total_count}</p>
                <p className="text-[11px] text-white/60">Consonants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Categories Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#14213D]/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center overflow-x-auto hide-scrollbar">
        <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#14213D]/60 pr-2 whitespace-nowrap">
          <Filter className="h-3.5 w-3.5" /> Module:
        </span>
        <div className="flex items-center gap-2">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 font-sans text-sm font-semibold transition ${
                activeTab === tabName
                  ? "bg-[#14213D] text-white shadow-sm"
                  : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
              }`}
            >
              {tabName}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#14213D]/5">
          {activeTab === vowels.category_name && (
          <div className="space-y-10">
            {vowels.subsets.map((subset) => (
              <div key={subset.type} className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#C9A227]" /> {subset.type}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {subset.letters.map((letter, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => playAudio(letter.char)}
                      className="group relative flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-[#14213D] hover:border-[#14213D] hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      <Volume2 className="absolute top-3 right-3 w-4 h-4 text-gray-300 group-hover:text-[#C9A227]/50 transition-colors" />
                      <span className="text-4xl font-bold text-[#14213D] group-hover:text-[#C9A227] transition-colors mb-2">
                        {letter.char}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className="font-mono text-xs bg-gray-200/50 group-hover:bg-white/10 group-hover:text-white/80 text-gray-500 px-2 py-0.5 rounded transition-colors">
                          {letter.transliteration}
                        </span>
                        <span className="font-sans font-medium text-xs bg-gray-200/50 group-hover:bg-white/10 group-hover:text-white/80 text-gray-500 px-2 py-0.5 rounded transition-colors">
                          {letter.tamil}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === consonants.category_name && (
          <div className="space-y-4">
             <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
                <Languages className="w-5 h-5 text-[#3F6656]" /> Basic Consonants
             </h3>
             <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {consonants.letters.map((letter, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => playAudio(letter.char)}
                    className="group relative flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-[#14213D] hover:border-[#14213D] hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    <Volume2 className="absolute top-2 right-2 w-3.5 h-3.5 text-gray-300 group-hover:text-[#C9A227]/50 transition-colors" />
                    <span className="text-3xl font-bold text-[#14213D] group-hover:text-[#C9A227] transition-colors mb-2">
                      {letter.char}
                    </span>
                    <div className="flex gap-1.5 mt-1">
                      <span className="font-mono text-[11px] bg-gray-200/50 group-hover:bg-white/10 group-hover:text-white/80 text-gray-500 px-1.5 py-0.5 rounded transition-colors">
                        {letter.transliteration}
                      </span>
                      <span className="font-sans font-medium text-[11px] bg-gray-200/50 group-hover:bg-white/10 group-hover:text-white/80 text-gray-500 px-1.5 py-0.5 rounded transition-colors">
                        {letter.tamil}
                      </span>
                    </div>
                  </div>
                ))}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {groupedWords[activeWordCategory].map((word) => (
                  <WordCard key={word.id} word={word} playAudio={playAudio} />
                ))}
              </div>
            </div>
          </div>
        )}

         {activeTab === "Numbers (1-100)" && (
           <div className="space-y-4">
             <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-[#3F6656]" /> 1 to 100
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {teluguNumbers.numbers.map((num) => (
                 <WordCard key={`num-${num.number}`} word={num} playAudio={playAudio} />
               ))}
             </div>
           </div>
         )}
        </div>
    </div>
  );
}
