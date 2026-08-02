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
import { INITIAL_ANALYTICS } from "../../data/mockData";
import {
  ArrowLeft,
  Flame,
  Zap,
  BookOpen,
  TrendingUp,
  BarChart3,
  Sparkles,
  Target,
  BrainCircuit,
  MessageCircle,
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
    { id: "english_quiz", label: "Quiz Path", icon: Target, lang: "en" },
    { id: "telugu_quiz", label: "Telugu Overview", icon: Map, lang: "te" },
    { id: "sentences", label: "Sentences", icon: MessageCircle, lang: "en" },
    { id: "grammar", label: "Grammar", icon: BrainCircuit, lang: "en" },
    { id: "idioms", label: "Idioms", icon: Sparkles, lang: "en" },
    { id: "stories", label: "Stories", icon: BookOpen, lang: "en" },
  ];

  const tabs = allTabs.filter(tab => tab.lang === "all" || tab.lang === targetLanguage);

  return (
    <div className="space-y-8 pb-16 font-sans text-white">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs font-bold text-sky-300">
            <TrendingUp className="h-3.5 w-3.5 text-sky-400" /> Performance Analytics
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Fluency & Progress Insights
          </h1>
          <p className="max-w-xl text-sm text-slate-400 leading-relaxed">
            Track your CEFR proficiency growth, daily study streaks, vocabulary mastery, and AI evaluation metrics.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-sky-300" : ""}`} />
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
              <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="font-mono text-xs font-bold uppercase">Daily Streak</span>
                  <Flame className="h-6 w-6 fill-amber-400" />
                </div>
                <div>
                  <p className="font-number text-3xl font-extrabold text-white">
                    {Math.max(stats.streak_days, localStats.telugu.streak)} Days
                  </p>
                  <p className="text-xs text-slate-400">Active learning streak</p>
                </div>
              </div>

              <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
                <div className="flex items-center justify-between text-sky-400">
                  <span className="font-mono text-xs font-bold uppercase">Total XP</span>
                  <Zap className="h-6 w-6 fill-sky-400" />
                </div>
                <div>
                  <p className="font-number text-3xl font-extrabold text-white">
                    {Math.max(stats.xp_points, localStats.telugu.xp, localStats.english.xp)} XP
                  </p>
                  <p className="text-xs text-slate-400">Total experience points</p>
                </div>
              </div>
            </div>

            {/* CEFR Progression */}
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] shadow-2xl space-y-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="font-heading text-xl font-bold text-white">CEFR Band Progression</h2>
                <span className="font-mono text-xs text-sky-400 font-semibold">Target: C2 Mastery</span>
              </div>
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.cefr_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis 
                      dataKey="band" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 700}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 12}} 
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 'bold', color: '#FFFFFF'}}
                      formatter={(value) => [`${value}% Mastered`, 'Progress']}
                    />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {stats.cefr_distribution.map((entry, index) => {
                        const colorMap = {
                          'A1': '#64748b',
                          'A2': '#38bdf8',
                          'B1': '#f59e0b',
                          'B2': '#22c55e',
                          'C1': '#2563eb',
                          'C2': '#e11d48'
                        };
                        return <Cell key={`cell-${index}`} fill={colorMap[entry.band] || '#38bdf8'} />;
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
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-sky-400">
                <span className="font-mono text-xs font-bold uppercase">Highest Unlocked Level</span>
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.english.maxLevel}</p>
                <p className="text-xs text-slate-400">Roadmap level reached</p>
              </div>
            </div>
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-blue-400">
                <span className="font-mono text-xs font-bold uppercase">Quiz XP</span>
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.english.xp}</p>
                <p className="text-xs text-slate-400">Estimated XP from quizzes</p>
              </div>
            </div>
          </div>
        )}

        {/* TELUGU TAB */}
        {activeTab === "telugu_quiz" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-amber-400">
                <span className="font-mono text-xs font-bold uppercase">Highest Telugu Level</span>
                <Map className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.telugu.maxLevel}</p>
                <p className="text-xs text-slate-400">Max level unlocked</p>
              </div>
            </div>
          </div>
        )}

        {/* SENTENCES TAB */}
        {activeTab === "sentences" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="font-mono text-xs font-bold uppercase">Sentences Practiced</span>
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.sentences.practiced}</p>
                <p className="text-xs text-slate-400">Contextual usages reviewed</p>
              </div>
            </div>
          </div>
        )}

        {/* GRAMMAR TAB */}
        {activeTab === "grammar" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-sky-400">
                <span className="font-mono text-xs font-bold uppercase">Grammar Interactions</span>
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.grammar.interactions}</p>
                <p className="text-xs text-slate-400">Grammar rules explored</p>
              </div>
            </div>
          </div>
        )}

        {/* IDIOMS TAB */}
        {activeTab === "idioms" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-purple-400">
                <span className="font-mono text-xs font-bold uppercase">Idioms Viewed</span>
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.idioms.flips}</p>
                <p className="text-xs text-slate-400">Native expressions learned</p>
              </div>
            </div>
          </div>
        )}

        {/* STORIES TAB */}
        {activeTab === "stories" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-blue-400">
                <span className="font-mono text-xs font-bold uppercase">Stories Read</span>
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="font-number text-3xl font-extrabold text-white">{localStats.story.read}</p>
                <p className="text-xs text-slate-400">Total narratives completed</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
