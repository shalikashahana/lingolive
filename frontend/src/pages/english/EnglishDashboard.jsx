import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Quote,
  Map,
  Flame,
  Zap,
  Target,
  Award,
  BarChart3,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Lock
} from "lucide-react";

const DEFAULT_STATS = {
  streak: 0,
  xp: 0,
  nextLevelXp: 100,
  level: 1,
  cefr: "A1",
  interviewScore: null,
  vocabMastered: 0,
  vocabTotal: 200,
  weeklyActivity: [
    { day: "Mon", minutes: 0 },
    { day: "Tue", minutes: 0 },
    { day: "Wed", minutes: 0 },
    { day: "Thu", minutes: 0 },
    { day: "Fri", minutes: 0 },
    { day: "Sat", minutes: 0 },
    { day: "Sun", minutes: 0 },
  ],
  achievements: [
    { id: "streak_master", title: "Streak Master", description: "Maintain a 5-day practice streak", unlocked: false, progress_text: "0/5 days", category: "streak" },
    { id: "grammar_guru", title: "Grammar Guru", description: "Pass 10 grammar modules", unlocked: false, progress_text: "0/10 modules", category: "grammar" },
    { id: "idiom_titan", title: "Idiom Titan", description: "Master 50 native idioms", unlocked: false, progress_text: "0/50 idioms", category: "idioms" },
  ],
  todayMission: {
    title: "Level 1 Mission",
    rewardXp: 100,
    items: [
      { id: 1, text: "Complete Level 1 Grammar & Quiz", completed: false, path: "/grammar" },
      { id: 2, text: "Practice Daily Sentences with Audio", completed: false, path: "/sentences" },
      { id: 3, text: "Read 1 Short Story & Answer Quiz", completed: false, path: "/story" },
    ]
  }
};

export default function EnglishDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
            setStats({
              streak: data.streak_days || 0,
              xp: data.xp_points || 0,
              nextLevelXp: data.next_level_xp || 100,
              level: data.current_level || 1,
              cefr: data.cefr_band || "A1",
              interviewScore: data.interview_readiness,
              vocabMastered: data.words_learned_count || 0,
              vocabTotal: data.vocab_total || 200,
              weeklyActivity: data.weekly_activity || DEFAULT_STATS.weeklyActivity,
              achievements: data.achievements || DEFAULT_STATS.achievements,
              todayMission: data.today_mission ? {
                title: data.today_mission.title,
                rewardXp: data.today_mission.reward_xp,
                items: data.today_mission.items
              } : DEFAULT_STATS.todayMission
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard user progress", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardStats();
  }, [user]);

  const totalWeeklyMinutes = stats.weeklyActivity.reduce((sum, item) => sum + (item.minutes || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 pt-2 font-sans text-white">
      
      {/* ── 1. Hero Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 sm:p-10 shadow-2xl"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 text-xs font-mono font-bold text-sky-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              CEFR Level {stats.cefr} ({stats.level === 1 && stats.xp === 0 ? "Not Started" : `Level ${stats.level}`})
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">{user?.displayName || "Learner"}</span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-400 leading-relaxed">
              {stats.streak > 0 ? (
                <>You are on a <span className="text-amber-400 font-bold">{stats.streak}-day streak</span>! Keep practicing daily to maintain momentum.</>
              ) : (
                <>Start your learning streak today by completing your first lesson module!</>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate("/path")}
            className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <span>{stats.level === 1 && stats.xp === 0 ? "Start Path" : "Continue Path"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* ── 2. Command Center Key Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Metric */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Daily Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-number text-2xl font-extrabold text-amber-400">{stats.streak}</span>
              <span className="text-xs text-slate-400 font-semibold">Days Active</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="h-6 w-6 fill-amber-400" />
          </div>
        </div>

        {/* XP Progress Metric */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-white/[0.03]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level {stats.level} XP</span>
            <span className="font-number text-xs font-bold text-sky-400">{stats.xp} / {stats.nextLevelXp}</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.xp / stats.nextLevelXp) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {Math.max(0, stats.nextLevelXp - stats.xp)} XP remaining to Level {stats.level + 1}
          </span>
        </div>

        {/* Interview Readiness */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Interview Readiness</span>
            {stats.interviewScore !== null && stats.interviewScore !== undefined ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-number text-2xl font-extrabold text-emerald-400">{stats.interviewScore}%</span>
                <span className="text-xs text-emerald-400 font-semibold">{stats.cefr} Ready</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-400">Not Available</span>
                <span className="text-[10px] text-slate-500 font-medium">Assessment Required</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Vocabulary Progress */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vocabulary Progress</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-number text-2xl font-extrabold text-sky-400">{stats.vocabMastered}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {stats.vocabTotal} Words</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── 3. Today's Mission & AI Coach Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Mission (2 cols) */}
        <div className="md:col-span-2 glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-400" />
                <h3 className="font-heading text-lg font-bold text-white">{stats.todayMission.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 font-mono text-xs font-semibold">
                +{stats.todayMission.rewardXp} XP Reward
              </span>
            </div>

            <div className="space-y-3">
              {stats.todayMission.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-500 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${item.completed ? "text-slate-300 line-through" : "text-slate-200"}`}>
                      {item.text}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate("/path")}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Lessons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Gemma AI Coach Card (1 col) */}
        <div className="glass-card p-6 border border-white/10 rounded-3xl bg-gradient-to-b from-blue-900/30 to-slate-900/40 flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-1">Gemma AI Conversation</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Practice real-time conversational speaking with instant feedback on pronunciation and vocabulary usage.
            </p>
          </div>

          <button
            onClick={() => navigate("/chat")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] text-xs"
          >
            <span>Open AI Conversation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 4. Activity Chart & Achievements Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weekly Activity Bar Chart (2 cols) */}
        <div className="md:col-span-2 glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <h3 className="font-heading text-lg font-bold text-white">Weekly Activity (Minutes)</h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">Total: {totalWeeklyMinutes} mins</span>
          </div>

          {/* Bar chart visualization or Empty State */}
          {totalWeeklyMinutes === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 py-6 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-300">No activity recorded this week</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Complete daily lessons to track your practice time here</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-40 pt-4 px-2">
              {stats.weeklyActivity.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono font-semibold text-sky-300">{item.minutes}m</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-xl transition-all duration-500 hover:brightness-125"
                    style={{ height: `${Math.max(4, (item.minutes / 60) * 100)}%` }}
                  />
                  <span className="text-xs font-medium text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Badges Showcase (1 col) */}
        <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-lg font-bold text-white">Achievements</h3>
          </div>

          <div className="space-y-3">
            {stats.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  ach.unlocked
                    ? "bg-white/10 border-amber-500/30 text-white"
                    : "bg-white/5 border-white/5 opacity-60 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.unlocked ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500"
                  }`}>
                    {ach.category === "streak" ? (
                      <Flame className="w-5 h-5" />
                    ) : ach.category === "grammar" ? (
                      <BrainCircuit className="w-5 h-5" />
                    ) : (
                      <Quote className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {ach.title} {!ach.unlocked && "(Locked)"}
                    </h4>
                    <p className="text-[10px] text-slate-400">{ach.description}</p>
                  </div>
                </div>
                {!ach.unlocked && (
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Main Learning Modules Grid ── */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-6">Learning Modules</h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Learning Path Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/path")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center">
                <Map className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                  Structured Learning Path
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Follow our 100-level English roadmap to build your proficiency step-by-step.
              </p>
              <span className="inline-block font-mono text-[10px] font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-full">
                {stats.level === 1 && stats.xp === 0 ? "Status: Not Started" : `Current: Level ${stats.level}`}
              </span>
            </div>
          </motion.button>

          {/* Daily Sentences Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/sentences")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                Daily Sentences & Audio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Learn essential everyday phrases with speech audio and native translations.
              </p>
            </div>
          </motion.button>

          {/* Grammar Guide Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/grammar")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                Grammar Guide
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Master the rules of English syntax, from basic tenses to advanced phrasing.
              </p>
            </div>
          </motion.button>

          {/* Native Idioms Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/idioms")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Quote className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-purple-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-1">
                Native Idioms
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sound like a native speaker! Learn over 100+ popular English idioms.
              </p>
            </div>
          </motion.button>

          {/* Reading Practice Card */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/story")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-amber-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                Reading Stories
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Read engaging short stories to improve vocabulary and comprehension.
              </p>
            </div>
          </motion.button>

          {/* Vocabulary Flashcards */}
          <motion.button
            variants={itemVariants}
            onClick={() => navigate("/vocabulary")}
            className="group relative text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                <Target className="h-6 w-6" />
              </div>
              <div className="h-9 w-9 rounded-full bg-white/5 group-hover:bg-sky-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                Vocabulary Flashcards
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice essential vocabulary with interactive flashcards and audio.
              </p>
            </div>
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
}
