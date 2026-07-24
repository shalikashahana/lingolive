import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { INITIAL_ANALYTICS, CEFR_BANDS } from "../../data/mockData";
import {
  ArrowLeft,
  Flame,
  Zap,
  BookMarked,
  BookOpen,
  TrendingUp,
  BarChart3,
  Award,
  MessageSquare,
  Sparkles,
  Target,
  BrainCircuit,
  MessageCircle,
  Activity,
  ScrollText,
  Map
} from "lucide-react";

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(INITIAL_ANALYTICS);
  const [localStats, setLocalStats] = useState({
    english: { maxLevel: 1, xp: 0 },
    telugu: { streak: 0, xp: 0, maxLevel: 1 },
    sentences: { practiced: 0 },
    grammar: { interactions: 0 },
    idioms: { flips: 0 },
    story: { read: 0 }
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const { user } = useAuth();
  
  useEffect(() => {
    // 1. Fetch Backend Stats (if any)
    async function fetchAnalytics() {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (!data.error) {
              setStats({ ...INITIAL_ANALYTICS, ...data });
            }
          }
        } catch (e) {
          console.error("Failed to fetch analytics", e);
        }
      }
    }
    fetchAnalytics();

    // 2. Load Local Storage Stats per Activity
    const savedEnglishMaxLevel = parseInt(localStorage.getItem("lingolive_max_unlocked_level") || "1", 10);
    const englishXP = (savedEnglishMaxLevel - 1) * 150;

    const savedTelugu = JSON.parse(localStorage.getItem("telugu_stats") || '{"streak":0,"xp":0}');
    const savedMaxLevel = parseInt(localStorage.getItem("telugu_quiz_unlocked_level") || "1", 10);
    
    const savedSentences = JSON.parse(localStorage.getItem("sentences_stats") || '{"practiced":0}');
    const savedGrammar = JSON.parse(localStorage.getItem("grammar_stats") || '{"interactions":0}');
    const savedIdioms = JSON.parse(localStorage.getItem("idioms_stats") || '{"flips":0}');
    const savedStory = JSON.parse(localStorage.getItem("story_stats") || '{"read":0}');
    
    setLocalStats({
      english: { maxLevel: savedEnglishMaxLevel, xp: englishXP },
      telugu: { ...savedTelugu, maxLevel: savedMaxLevel },
      sentences: savedSentences,
      grammar: savedGrammar,
      idioms: savedIdioms,
      story: savedStory
    });

    const lang = localStorage.getItem("lingolive_target_language") || "en";
    setTargetLanguage(lang);
  }, [user]);

  const allTabs = [
    { id: "overview", label: "Overview", icon: BarChart3, lang: "all" },
    { id: "english_quiz", label: "Quiz Overview", icon: Target, lang: "en" },
    { id: "telugu_quiz", label: "Telugu Overview", icon: Map, lang: "te" },
    { id: "sentences", label: "Sentences", icon: MessageCircle, lang: "en" },
    { id: "grammar", label: "Grammar", icon: BrainCircuit, lang: "en" },
    { id: "idioms", label: "Idioms", icon: Sparkles, lang: "en" },
    { id: "stories", label: "Stories", icon: BookOpen, lang: "en" },
  ];

  const tabs = allTabs.filter(tab => tab.lang === "all" || tab.lang === targetLanguage);

  return (
    <div className="space-y-8 pb-16">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#14213D] shadow-sm hover:bg-[#14213D]/5 transition-colors border border-[#14213D]/10 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-[#14213D] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/20 px-3 py-1 font-mono text-xs font-bold text-[#C9A227]">
            <TrendingUp className="h-3.5 w-3.5" /> Performance Dashboard
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Fluency & Progress Insights
          </h1>
          <p className="max-w-xl font-sans text-sm text-white/70">
            Track your CEFR proficiency growth, daily study streaks, vocabulary mastery, and Gemma AI evaluation scores.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-[#14213D]/10 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-t-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#14213D] text-white shadow-md"
                  : "text-[#14213D]/60 hover:text-[#14213D] hover:bg-[#14213D]/5"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#C9A227]" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 space-y-3">
                <div className="flex items-center justify-between text-amber-600">
                  <span className="font-mono text-xs font-bold uppercase">Daily Streak</span>
                  <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-mono text-3xl font-bold text-amber-900">{Math.max(stats.streak_days, localStats.telugu.streak)} Days</p>
                  <p className="font-sans text-xs text-amber-800/70">Active learning streak</p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#C9A227]/30 bg-gradient-to-br from-[#C9A227]/15 to-yellow-500/5 p-6 space-y-3">
                <div className="flex items-center justify-between text-[#8C6D13]">
                  <span className="font-mono text-xs font-bold uppercase">Earned XP</span>
                  <Zap className="h-6 w-6 text-[#C9A227] fill-[#C9A227]" />
                </div>
                <div>
                  <p className="font-mono text-3xl font-bold text-[#5C4505]">{Math.max(stats.xp_points, localStats.telugu.xp, localStats.english.xp)} XP</p>
                  <p className="font-sans text-xs text-[#8C6D13]/70">Total experience points</p>
                </div>
              </div>
            </div>

            {/* CEFR Progression */}
            <div className="rounded-3xl border border-[#14213D]/10 bg-white p-6 shadow-sm space-y-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
                <h2 className="font-display text-xl font-bold text-[#14213D]">CEFR Band Progression</h2>
                <span className="font-mono text-xs text-[#14213D]/60">Target: C2 Mastery</span>
              </div>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.cefr_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14213D1A" />
                    <XAxis 
                      dataKey="band" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#14213D', fontSize: 12, fontWeight: 700}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#14213D', fontSize: 12}} 
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      cursor={{fill: '#14213D0A'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold', color: '#14213D'}}
                      formatter={(value) => [`${value}% Mastered`, 'Progress']}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {stats.cefr_distribution.map((entry, index) => {
                        const colorMap = {
                          'A1': '#64748b',
                          'A2': '#0ea5e9',
                          'B1': '#f59e0b',
                          'B2': '#10b981',
                          'C1': '#4f46e5',
                          'C2': '#db2777'
                        };
                        return <Cell key={`cell-${index}`} fill={colorMap[entry.band] || '#C9A227'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ENGLISH QUIZ TAB */}
        {activeTab === "english_quiz" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="font-mono text-xs font-bold uppercase">Highest Level</span>
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-indigo-950">{localStats.english.maxLevel}</p>
                <p className="font-sans text-xs text-indigo-800/70">Max level unlocked</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#C9A227]/20 bg-gradient-to-br from-[#C9A227]/10 to-yellow-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-[#8C6D13]">
                <span className="font-mono text-xs font-bold uppercase">Quiz XP</span>
                <Zap className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[#5C4505]">{localStats.english.xp}</p>
                <p className="font-sans text-xs text-[#8C6D13]/70">Estimated XP from quizzes</p>
              </div>
            </div>
          </div>
        )}

        {/* TELUGU QUIZ TAB */}
        {activeTab === "telugu_quiz" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-amber-600">
                <span className="font-mono text-xs font-bold uppercase">Highest Level</span>
                <Map className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-amber-950">{localStats.telugu.maxLevel}</p>
                <p className="font-sans text-xs text-amber-800/70">Max level unlocked</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#C9A227]/20 bg-gradient-to-br from-[#C9A227]/10 to-yellow-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-[#8C6D13]">
                <span className="font-mono text-xs font-bold uppercase">Quiz XP</span>
                <Zap className="h-6 w-6 text-[#C9A227]" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[#5C4505]">{localStats.telugu.xp}</p>
                <p className="font-sans text-xs text-[#8C6D13]/70">XP Earned in Quizzes</p>
              </div>
            </div>
          </div>
        )}

        {/* SENTENCES TAB */}
        {activeTab === "sentences" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-pink-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-rose-600">
                <span className="font-mono text-xs font-bold uppercase">Sentences Practiced</span>
                <MessageCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-rose-950">{localStats.sentences.practiced}</p>
                <p className="font-sans text-xs text-rose-800/70">Contextual usages reviewed</p>
              </div>
            </div>
          </div>
        )}

        {/* GRAMMAR TAB */}
        {activeTab === "grammar" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#3F6656]/20 bg-gradient-to-br from-[#3F6656]/10 to-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-[#3F6656]">
                <span className="font-mono text-xs font-bold uppercase">Grammar Interactions</span>
                <BrainCircuit className="h-6 w-6 text-[#3F6656]" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[#2a4539]">{localStats.grammar.interactions}</p>
                <p className="font-sans text-xs text-[#3F6656]/70">Grammar rules explored</p>
              </div>
            </div>
          </div>
        )}

        {/* IDIOMS TAB */}
        {activeTab === "idioms" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-purple-600">
                <span className="font-mono text-xs font-bold uppercase">Idioms Viewed</span>
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-purple-950">{localStats.idioms.flips}</p>
                <p className="font-sans text-xs text-purple-800/70">Native expressions learned</p>
              </div>
            </div>
          </div>
        )}

        {/* STORIES TAB */}
        {activeTab === "stories" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-blue-600">
                <span className="font-mono text-xs font-bold uppercase">Stories Read</span>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-blue-950">{localStats.story.read}</p>
                <p className="font-sans text-xs text-blue-800/70">Total narratives completed</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
