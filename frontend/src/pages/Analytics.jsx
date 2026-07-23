import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { INITIAL_ANALYTICS, CEFR_BANDS } from "../data/mockData";
import {
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
  MessageCircle
} from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState(INITIAL_ANALYTICS);
  const [activeTab, setActiveTab] = useState("overview");
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
  }, [user]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "vocab", label: "Vocab & Idioms", icon: BookMarked },
    { id: "reading", label: "Reading & Stories", icon: BookOpen },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "quizzes", label: "Quizzes & Grammar", icon: Award },
  ];

  return (
    <div className="space-y-8 pb-16">
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
      <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-[#14213D]/10">
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
                  <p className="font-mono text-3xl font-bold text-amber-900">{stats.streak_days} Days</p>
                  <p className="font-sans text-xs text-amber-800/70">Active learning streak</p>
                </div>
              </div>

              <div className="rounded-3xl border border-[#C9A227]/30 bg-gradient-to-br from-[#C9A227]/15 to-yellow-500/5 p-6 space-y-3">
                <div className="flex items-center justify-between text-[#8C6D13]">
                  <span className="font-mono text-xs font-bold uppercase">Earned XP</span>
                  <Zap className="h-6 w-6 text-[#C9A227] fill-[#C9A227]" />
                </div>
                <div>
                  <p className="font-mono text-3xl font-bold text-[#5C4505]">{stats.xp_points} XP</p>
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
              <div className="space-y-5">
                {stats.cefr_distribution.map((dist) => {
                  const band = CEFR_BANDS[dist.band];
                  return (
                    <div key={dist.band} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-[#14213D]">{dist.band} — {band.label}</span>
                        <span className="font-bold text-[#3F6656]">{dist.percentage}% Mastered</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#14213D]/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${band.color} transition-all duration-500`}
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VOCAB & IDIOMS TAB */}
        {activeTab === "vocab" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="font-mono text-xs font-bold uppercase">Words Learned</span>
                <BookMarked className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-emerald-950">{stats.words_learned_count}</p>
                <p className="font-sans text-xs text-emerald-800/70">Total vocab bank</p>
              </div>
            </div>
            <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-purple-600">
                <span className="font-mono text-xs font-bold uppercase">Idioms Mastered</span>
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-purple-950">{stats.idioms_mastered_count}</p>
                <p className="font-sans text-xs text-purple-800/70">Native expressions learned</p>
              </div>
            </div>
            <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-pink-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-rose-600">
                <span className="font-mono text-xs font-bold uppercase">Sentences Practiced</span>
                <MessageCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-rose-950">{stats.sentences_practiced_count}</p>
                <p className="font-sans text-xs text-rose-800/70">Contextual usage</p>
              </div>
            </div>
          </div>
        )}

        {/* READING & STORIES TAB */}
        {activeTab === "reading" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-blue-600">
                <span className="font-mono text-xs font-bold uppercase">Stories Completed</span>
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-blue-950">{stats.stories_read_count}</p>
                <p className="font-sans text-xs text-blue-800/70">Total narratives read</p>
              </div>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-cyan-600">
                <span className="font-mono text-xs font-bold uppercase">Comprehension</span>
                <Target className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-cyan-950">{stats.reading_comprehension_score}%</p>
                <p className="font-sans text-xs text-cyan-800/70">Average understanding</p>
              </div>
            </div>
          </div>
        )}

        {/* AI CHAT TAB */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-6 space-y-3">
                <div className="flex items-center justify-between text-indigo-600">
                  <span className="font-mono text-xs font-bold uppercase">Conversations</span>
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-mono text-3xl font-bold text-indigo-950">{stats.conversations_count}</p>
                  <p className="font-sans text-xs text-indigo-800/70">AI Tutor sessions</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-3xl border border-[#14213D]/10 bg-white p-6 shadow-sm space-y-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
                <h2 className="font-display text-xl font-bold text-[#14213D]">Skill Matrix (Gemma AI)</h2>
                <span className="font-mono text-xs text-[#C9A227]">AI Evaluated</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Grammatical Accuracy", score: stats.gemma_skills.grammatical_accuracy },
                  { name: "Vocabulary Variety", score: stats.gemma_skills.vocabulary_variety },
                  { name: "Pronunciation & IPA", score: stats.gemma_skills.pronunciation },
                  { name: "Conversational Fluency", score: stats.gemma_skills.conversational_fluency },
                ].map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between rounded-2xl bg-[#F8F6F0] p-4">
                    <span className="font-sans text-sm font-semibold text-[#14213D]">{skill.name}</span>
                    <span className="rounded-xl bg-[#14213D] px-3 py-1 font-mono text-xs font-bold text-[#C9A227]">
                      {skill.score} / 100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* QUIZZES & GRAMMAR TAB */}
        {activeTab === "quizzes" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-blue-600">
                <span className="font-mono text-xs font-bold uppercase">Quiz Accuracy</span>
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-blue-950">{stats.average_accuracy}%</p>
                <p className="font-sans text-xs text-blue-800/70">Average evaluation score</p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#3F6656]/20 bg-gradient-to-br from-[#3F6656]/10 to-emerald-500/5 p-6 space-y-3">
              <div className="flex items-center justify-between text-[#3F6656]">
                <span className="font-mono text-xs font-bold uppercase">Grammar Mastery</span>
                <BrainCircuit className="h-6 w-6 text-[#3F6656]" />
              </div>
              <div>
                <p className="font-mono text-3xl font-bold text-[#2a4539]">{stats.grammar_modules_completed}</p>
                <p className="font-sans text-xs text-[#3F6656]/70">Modules completed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
