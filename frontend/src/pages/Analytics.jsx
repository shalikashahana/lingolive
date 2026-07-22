import { INITIAL_ANALYTICS, CEFR_BANDS } from "../data/mockData";
import {
  Flame,
  Zap,
  BookMarked,
  BookOpen,
  TrendingUp,
  BarChart3,
  Award,
  Clock,
  Sparkles
} from "lucide-react";

export default function Analytics() {
  const stats = INITIAL_ANALYTICS;

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

      {/* Top 4 Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak Card */}
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

        {/* XP Card */}
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

        {/* Words Learned Card */}
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 space-y-3">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="font-mono text-xs font-bold uppercase">Vocab Bank</span>
            <BookMarked className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-mono text-3xl font-bold text-emerald-950">{stats.words_learned_count}</p>
            <p className="font-sans text-xs text-emerald-800/70">Mastered C1/C2 words</p>
          </div>
        </div>

        {/* Accuracy Card */}
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
      </div>

      {/* CEFR Progression & Skill Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CEFR Distribution */}
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

        {/* Skill Rating Breakdown */}
        <div className="rounded-3xl border border-[#14213D]/10 bg-white p-6 shadow-sm space-y-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#14213D]/10 pb-4">
            <h2 className="font-display text-xl font-bold text-[#14213D]">Skill Matrix (Gemma AI)</h2>
            <span className="font-mono text-xs text-[#C9A227]">AI Evaluated</span>
          </div>

          <div className="space-y-4">
            {[
              { name: "Grammatical Accuracy", score: 88 },
              { name: "Vocabulary Variety", score: 92 },
              { name: "Pronunciation & IPA", score: 85 },
              { name: "Conversational Fluency", score: 90 },
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
    </div>
  );
}
