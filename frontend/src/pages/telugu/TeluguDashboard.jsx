import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Bot,
  Flame,
  Zap,
  Trophy,
  Target,
  Play,
  MessageSquare,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.075,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedProgressBar({ value = 0, max = 100, colorClass = "from-amber-500 to-yellow-400", delay = 0 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.07] overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, ease: "easeOut", delay }}
      />
    </div>
  );
}

function ProgressRing({ value = 0, max = 100, size = 72, stroke = 5, color = "#f59e0b" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: "easeOut", delay: 0.5 }}
      />
    </svg>
  );
}

function StreakDot({ active, label, index }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05 * index, ease: "backOut" }}
        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          active
            ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 text-white"
            : "bg-white/[0.05] border border-white/[0.08] text-slate-700"
        }`}
      >
        {active ? "🔥" : ""}
      </motion.div>
      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-600 uppercase">{label}</span>
    </div>
  );
}

// ─── Module Definitions ───────────────────────────────────────────────────────

const MODULES = [
  {
    id: "sentences",
    route: "/telugu-sentences",
    label: "Daily Sentences",
    sublabel: "Foundations",
    description:
      "800+ essential Telugu sentences for everyday conversations. Audio playback and English translations included.",
    Icon: BookOpen,
    StatIcon: MessageSquare,
    badge: "🌟 Start Here",
    stat: "800+ sentences",
    progress: 32,
    cardBg: "from-emerald-950/70 via-teal-950/40 to-slate-950/70",
    border: "border-emerald-500/20 hover:border-emerald-400/35",
    iconGrad: "from-emerald-500 to-teal-400",
    barColor: "from-emerald-500 to-teal-400",
    glow: "group-hover:shadow-emerald-500/15",
    glowBlob: "bg-emerald-500/20",
    accentText: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
  },
  {
    id: "quiz",
    route: "/telugu-quiz",
    label: "Interactive Quiz",
    sublabel: "Test Yourself",
    description:
      "80 progressive levels to master Telugu vocabulary and grammar through adaptive smart challenges.",
    Icon: GraduationCap,
    StatIcon: Trophy,
    badge: "🏅 Most Popular",
    stat: "80 levels",
    progress: 18,
    cardBg: "from-amber-950/70 via-yellow-950/40 to-slate-950/70",
    border: "border-amber-500/20 hover:border-amber-400/35",
    iconGrad: "from-amber-500 to-yellow-400",
    barColor: "from-amber-500 to-yellow-400",
    glow: "group-hover:shadow-amber-500/15",
    glowBlob: "bg-amber-500/20",
    accentText: "text-amber-400",
    accentBg: "bg-amber-500/10",
  },
  {
    id: "chat",
    route: "/telugu-chat",
    label: "AI Coach",
    sublabel: "Live Practice",
    description:
      "Real-time conversations with your Gemini AI Telugu Coach. Instant corrections and voice support.",
    Icon: Bot,
    StatIcon: Sparkles,
    badge: "✨ Gemini AI",
    stat: "Live AI",
    progress: null,
    cardBg: "from-violet-950/70 via-purple-950/40 to-slate-950/70",
    border: "border-violet-500/20 hover:border-violet-400/35",
    iconGrad: "from-violet-500 to-purple-400",
    barColor: "from-violet-500 to-purple-400",
    glow: "group-hover:shadow-violet-500/15",
    glowBlob: "bg-violet-500/20",
    accentText: "text-violet-400",
    accentBg: "bg-violet-500/10",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeluguDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ streak: 0, xp: 0, level: 1, cefr: "A1" });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [dailyGoal] = useState({ done: 2, total: 5 });

  // ── Fetch live stats ──
  useEffect(() => {
    async function fetchStats() {
      if (!user) { setStatsLoaded(true); return; }
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/analytics/overview`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
            setStats({
              streak: data.streak_days ?? 0,
              xp: data.xp_points ?? 0,
              level: data.current_level ?? 1,
              cefr: data.cefr_band ?? "A1",
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      } finally {
        setStatsLoaded(true);
      }
    }
    fetchStats();
  }, [user]);

  // ── Derived values ──
  const firstName = user?.displayName?.split(" ")[0] || "Learner";
  const { text: greetingText, emoji: greetingEmoji } = getGreeting();
  const goalDone = dailyGoal.done;
  const goalTotal = dailyGoal.total;
  const goalPct = Math.round((goalDone / goalTotal) * 100);

  // Continue Learning — track last visited module
  const lastId = localStorage.getItem("mozhify_te_last") || "sentences";
  const continueMod = MODULES.find((m) => m.id === lastId) || MODULES[0];

  // Streak dots — last 7 days
  const streakDays = ["M", "T", "W", "T", "F", "S", "S"];
  const filledCount = Math.min(stats.streak, 7);
  const streakFilled = streakDays.map((_, i) => i < filledCount);

  // XP to next level threshold (simple progression)
  const xpThreshold = stats.level * 500;
  const xpInLevel = stats.xp % xpThreshold;

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-20 pt-2">

      {/* ══════════════════════════════════════════
          HERO — Personalized Welcome + Daily Goal
         ══════════════════════════════════════════ */}
      <motion.section
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d1f40] via-[#162a55] to-[#090e1c] p-8 sm:p-10 shadow-2xl"
      >
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full bg-amber-500/[0.18] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/[0.18] blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/[0.06] blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* Left: greeting + cta */}
          <div className="space-y-4 flex-1">
            {/* Badge */}
            <motion.div custom={1} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1.5 backdrop-blur-md">
              <span className="text-base leading-none">{greetingEmoji}</span>
              <span className="font-mono text-xs font-bold text-amber-300 tracking-wider">{greetingText}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={2}
              variants={fadeUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                {firstName}
              </span>
              !
            </motion.h1>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md"
            >
              Your Telugu journey continues. Every lesson you complete brings you closer to fluency. 🇮🇳
            </motion.p>

            {/* Daily Goal bar */}
            <motion.div custom={4} variants={fadeUp} className="mt-2 space-y-2.5 max-w-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
                  <Target className="h-3.5 w-3.5 text-amber-400" />
                  <span>Daily Goal</span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {goalDone}/{goalTotal} lessons · {goalPct}%
                </span>
              </div>
              <AnimatedProgressBar value={goalDone} max={goalTotal} colorClass="from-amber-500 to-yellow-400" delay={0.7} />
              <p className="text-[11px] text-slate-500 leading-snug">
                {goalTotal - goalDone > 0
                  ? `${goalTotal - goalDone} more lesson${goalTotal - goalDone > 1 ? "s" : ""} to hit your daily goal 💪`
                  : "🎉 Daily goal complete! You're on fire!"}
              </p>
            </motion.div>
          </div>

          {/* Right: Stat pills */}
          <motion.div custom={5} variants={fadeUp} className="flex flex-row lg:flex-col gap-3 flex-wrap lg:flex-nowrap">
            {/* Streak */}
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 min-w-[130px]">
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                transition={{ duration: 0.7, delay: 1.5, repeat: Infinity, repeatDelay: 4 }}
              >
                <Flame className="h-6 w-6 text-amber-400 fill-amber-400 shrink-0" />
              </motion.div>
              <div>
                <div className="text-xl font-extrabold text-white leading-none">
                  {statsLoaded ? stats.streak : "—"}
                  <span className="text-[11px] font-mono text-amber-400 ml-1">days</span>
                </div>
                <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mt-0.5">Streak</div>
              </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/[0.08] px-4 py-3 min-w-[130px]">
              <Zap className="h-6 w-6 text-sky-400 fill-sky-400 shrink-0" />
              <div>
                <div className="text-xl font-extrabold text-white leading-none">
                  {statsLoaded ? stats.xp.toLocaleString() : "—"}
                  <span className="text-[11px] font-mono text-sky-400 ml-1">XP</span>
                </div>
                <div className="text-[10px] font-mono text-sky-500 uppercase tracking-widest mt-0.5">Total Points</div>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.08] px-4 py-3 min-w-[130px]">
              <Trophy className="h-6 w-6 text-violet-400 shrink-0" />
              <div>
                <div className="text-xl font-extrabold text-white leading-none">
                  {statsLoaded ? stats.cefr : "—"}
                  <span className="text-[11px] font-mono text-violet-400 ml-1">Lv.{stats.level}</span>
                </div>
                <div className="text-[10px] font-mono text-violet-500 uppercase tracking-widest mt-0.5">Level</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════
          CONTINUE LEARNING  +  STREAK CALENDAR
         ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Continue Learning Card */}
        <motion.button
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            localStorage.setItem("mozhify_te_last", continueMod.id);
            navigate(continueMod.route);
          }}
          className="md:col-span-3 group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c1828] via-[#0f1f35] to-[#080e1c] p-6 text-left transition-all duration-300 hover:border-sky-500/25 hover:shadow-2xl hover:shadow-blue-900/20 focus:outline-none"
        >
          {/* Hover glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-sky-600/0 group-hover:bg-sky-600/12 blur-2xl transition-all duration-500" />

          {/* Live badge */}
          <div className="flex items-center gap-2 mb-5">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
            />
            <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Continue Learning
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Content */}
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${continueMod.iconGrad} shadow-lg`}>
                <continueMod.Icon className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white group-hover:text-sky-200 transition-colors duration-200">
                  {continueMod.label}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mt-1 max-w-xs">
                  {continueMod.description}
                </p>
              </div>
            </div>

            {/* Play button */}
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] group-hover:bg-sky-600/20 group-hover:border-sky-500/40 transition-all duration-300">
              <Play className="h-5 w-5 text-slate-400 group-hover:text-sky-400 transition-colors fill-current" />
            </div>
          </div>

          {/* Progress bar */}
          {continueMod.progress !== null && (
            <div className="mt-6 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-600">
                <span>Module progress</span>
                <span className="text-slate-400">{continueMod.progress}%</span>
              </div>
              <AnimatedProgressBar value={continueMod.progress} max={100} colorClass="from-sky-600 to-blue-500" delay={0.9} />
            </div>
          )}
        </motion.button>

        {/* Streak Calendar Card */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="md:col-span-2 relative overflow-hidden rounded-3xl border border-amber-500/[0.15] bg-gradient-to-br from-[#1c0e00] via-[#1a1000] to-[#0a0a0a] p-6"
        >
          <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5 relative">
            <div>
              <p className="font-mono text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1.5">
                Weekly Streak
              </p>
              <div className="flex items-end gap-2">
                <motion.span
                  animate={{ rotate: [0, -14, 14, -10, 10, 0] }}
                  transition={{ duration: 0.75, delay: 1.2, repeat: Infinity, repeatDelay: 3.5 }}
                  className="text-4xl"
                >
                  🔥
                </motion.span>
                <span className="text-5xl font-extrabold text-white leading-none pb-1">
                  {statsLoaded ? stats.streak : "—"}
                </span>
                <span className="text-base font-bold text-amber-400 pb-1.5">days</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] text-slate-600 uppercase tracking-wider">Best</p>
              <p className="text-2xl font-extrabold text-amber-500">{Math.max(stats.streak, 7)}</p>
            </div>
          </div>

          {/* 7-day dot grid */}
          <div className="flex justify-between">
            {streakDays.map((label, i) => (
              <StreakDot key={i} active={streakFilled[i]} label={label} index={i} />
            ))}
          </div>

          {/* Message */}
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs font-semibold text-amber-300 leading-snug">
            {stats.streak > 0
              ? `🎯 ${stats.streak} day${stats.streak > 1 ? "s" : ""} strong — keep the flame alive!`
              : "🎯 Start learning today to begin your streak!"}
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          LEVEL PROGRESS BAR  (full width)
         ══════════════════════════════════════════ */}
      <motion.div
        custom={8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0f172a] px-6 py-5 flex items-center gap-6"
      >
        {/* Ring */}
        <div className="relative shrink-0">
          <ProgressRing value={xpInLevel} max={xpThreshold} size={68} stroke={5} color="#8b5cf6" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-violet-400">{stats.cefr}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-violet-400 fill-violet-400" />
              <span className="text-sm font-bold text-white">Level {stats.level} · {stats.cefr}</span>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {xpInLevel.toLocaleString()} / {xpThreshold.toLocaleString()} XP
            </span>
          </div>
          <AnimatedProgressBar value={xpInLevel} max={xpThreshold} colorClass="from-violet-600 to-purple-400" delay={0.6} />
          <p className="text-[11px] text-slate-500">
            <span className="text-violet-400 font-semibold">{(xpThreshold - xpInLevel).toLocaleString()} XP</span> to reach Level {stats.level + 1}
          </p>
        </div>

        <div className="shrink-0 hidden sm:flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-3 py-2">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-bold text-violet-300">Progressing</span>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          LEARNING MODULES GRID
         ══════════════════════════════════════════ */}
      <div>
        {/* Section header */}
        <motion.div
          custom={9}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-6"
        >
          <h2 className="text-base font-bold text-white tracking-tight">Learning Modules</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <span className="font-mono text-[10px] font-bold text-slate-600 uppercase tracking-widest">3 modules</span>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((mod, i) => {
            const Icon = mod.Icon;
            const StatIcon = mod.StatIcon;
            return (
              <motion.button
                key={mod.id}
                custom={10 + i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  localStorage.setItem("mozhify_te_last", mod.id);
                  navigate(mod.route);
                }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border ${mod.border} bg-gradient-to-br ${mod.cardBg} p-6 text-left transition-all duration-300 hover:shadow-2xl ${mod.glow} focus:outline-none`}
              >
                {/* Hover glow blob */}
                <div className={`pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full ${mod.glowBlob} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500`} />

                {/* Top row: icon + badge */}
                <div className="flex items-start justify-between mb-6 relative">
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, -4, 4, 0], transition: { duration: 0.5 } }}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${mod.iconGrad} shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-sm">
                    {mod.badge}
                  </span>
                </div>

                {/* Title + description */}
                <div className="flex-1 space-y-2 relative">
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${mod.accentText}`}>
                    {mod.sublabel}
                  </p>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                    {mod.label}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Stat chip */}
                <div className={`relative mt-5 flex items-center gap-2 self-start rounded-xl ${mod.accentBg} border border-white/[0.07] px-3 py-1.5`}>
                  <StatIcon className={`h-3.5 w-3.5 ${mod.accentText}`} />
                  <span className={`font-mono text-[11px] font-bold ${mod.accentText}`}>{mod.stat}</span>
                </div>

                {/* Progress bar */}
                {mod.progress !== null && (
                  <div className="relative mt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-600">
                      <span>Progress</span>
                      <span className="text-slate-400">{mod.progress}%</span>
                    </div>
                    <AnimatedProgressBar
                      value={mod.progress}
                      max={100}
                      colorClass={mod.barColor}
                      delay={0.7 + i * 0.12}
                    />
                  </div>
                )}

                {/* CTA row */}
                <div className="relative mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-white transition-colors duration-300">
                  <span>Open module</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOTIVATIONAL FOOTER BANNER
         ══════════════════════════════════════════ */}
      <motion.div
        custom={14}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0f172a] px-6 py-5 flex items-center justify-between gap-4"
      >
        {/* Ambient tints */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-violet-500/[0.04]" />

        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ["-120%", "220%"] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
        />

        <div className="relative flex items-center gap-4">
          <span className="text-3xl shrink-0">🚀</span>
          <div>
            <p className="text-sm font-bold text-white">Practice every day, progress every way.</p>
            <p className="text-xs text-slate-500 mt-0.5">Consistency is the secret to language mastery — you've got this!</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/telugu-sentences")}
          className="relative shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-600/25 transition-all hover:from-amber-500 hover:to-yellow-400 focus:outline-none"
        >
          Practice Now
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </motion.div>

    </div>
  );
}
