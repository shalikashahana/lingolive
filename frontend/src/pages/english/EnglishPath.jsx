import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { generate100Levels, CEFR_BANDS } from "../../data/mockData";
import {
  Zap,
  CheckCircle2,
  Lock,
  Play,
  Star,
  BookOpen,
  MessageSquareCode,
  Sparkles,
  Trophy,
  Filter,
  X,
  ChevronRight,
  Loader2,
  RotateCcw
} from "lucide-react";

export default function EnglishPath() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleResetProgress = async () => {
    try {
      if (user) {
        const token = await user.getIdToken();
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/progress/reset`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error("Reset error:", e);
    }
    localStorage.setItem('mozhify_max_unlocked_level', '1');
    localStorage.removeItem('telugu_quiz_unlocked_level');
    localStorage.removeItem('malayalam_quiz_unlocked_level');
    localStorage.removeItem('korean_quiz_unlocked_level');
    localStorage.removeItem('sentences_stats');
    localStorage.removeItem('grammar_stats');
    localStorage.removeItem('idioms_stats');
    localStorage.removeItem('story_stats');
    
    const defaultLevels = generate100Levels().map(lvl => ({
      ...lvl,
      status: lvl.level_number === 1 ? 'unlocked' : 'locked',
      stars: 0,
      score: 0
    }));
    setLevels(defaultLevels);
    setCurrentLevel(defaultLevels[0]);
  };
  
  const [selectedCefr, setSelectedCefr] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLevelModal, setSelectedLevelModal] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      let dataLevels = [];
      let dataCurrentLevel = 1;
      let usedMock = false;

      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/progress/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.levels && data.levels.length > 0) {
              dataLevels = data.levels;
              dataCurrentLevel = data.current_level;
            } else {
              usedMock = true;
            }
          } else {
            usedMock = true;
          }
        } catch (err) {
          console.error("Failed to fetch dashboard data:", err);
          usedMock = true;
        }
      } else {
        usedMock = true;
      }

      if (usedMock) {
        // Fallback to mock data if backend isn't seeded or user not logged in
        const maxUnlocked = parseInt(localStorage.getItem('mozhify_max_unlocked_level') || '1', 10);
        dataCurrentLevel = maxUnlocked;
        const defaultLevels = generate100Levels();
        dataLevels = defaultLevels.map(lvl => {
          if (lvl.level_number < maxUnlocked) {
            return { ...lvl, status: 'completed', stars: 3, score: 90 };
          } else if (lvl.level_number === maxUnlocked) {
            return { ...lvl, status: 'unlocked', score: 0 };
          } else {
            return { ...lvl, status: 'locked', score: 0 };
          }
        });
      }

      setLevels(dataLevels);
      setCurrentLevel(dataLevels.find(l => l.level_number === dataCurrentLevel) || dataLevels[0]);
      setLoading(false);
    }
    fetchDashboard();
  }, [user]);

  const completedCount = levels.filter((l) => l.status === "completed").length;

  // Filtering
  const filteredLevels = levels.filter((l) => {
    if (selectedCefr !== "ALL" && l.cefr_band !== selectedCefr) return false;
    if (selectedStatus !== "ALL" && l.status !== selectedStatus) return false;
    return true;
  });


  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A227]" />
      </div>
    );
  }
  
  if (!currentLevel) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center text-[#14213D] font-sans">
        Failed to load levels. Ensure backend is running and database is seeded.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Level Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14213D] p-6 text-white shadow-xl sm:p-10">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-48 w-48 rounded-full bg-[#3F6656]/20 blur-2xl" />

        <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A227] px-3 py-1 font-mono text-xs font-bold text-[#14213D]">
                <Sparkles className="h-3.5 w-3.5" />
                Current Level: {currentLevel.level_number} / 100
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-medium text-white/80 backdrop-blur-sm border border-white/10">
                CEFR {currentLevel.cefr_band} Advanced
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {currentLevel.title}
            </h1>
            <p className="max-w-2xl font-sans text-sm text-white/70 leading-relaxed">
              {currentLevel.description}
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/quiz?level=${currentLevel.level_number}`)}
                className="flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-3 font-sans text-sm font-bold text-[#14213D] shadow-lg transition hover:brightness-110 active:scale-95"
              >
                <Zap className="h-4 w-4 fill-[#14213D]" />
                <span>Continue Learning</span>
              </button>

              <button
                onClick={() => navigate(`/chat?level=${currentLevel.level_number}`)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 font-sans text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/15"
              >
                <MessageSquareCode className="h-4 w-4 text-[#C9A227]" />
                <span>Practice with Gemma AI</span>
              </button>

              <button
                onClick={handleResetProgress}
                className="flex items-center gap-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-3 font-sans text-xs font-bold hover:bg-rose-500/30 transition shadow-md"
                title="Reset all level progress to Level 1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Level 1</span>
              </button>
            </div>
          </div>

          {/* Right Progress Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:w-64">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Quiz Progress</span>
                <span className="font-mono font-bold text-[#C9A227]">{completedCount}% Complete</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-amber-400 transition-all duration-500"
                  style={{ width: `${completedCount}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="font-mono text-xl font-bold text-white">{completedCount}</p>
                <p className="text-[11px] text-white/60">Passed</p>
              </div>
              <div>
                <p className="font-mono text-xl font-bold text-[#C9A227]">100</p>
                <p className="text-[11px] text-white/60">Total Levels</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & CEFR Milestones Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#14213D]/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#14213D]/60 pr-2">
            <Filter className="h-3.5 w-3.5" /> Filter CEFR:
          </span>
          {["ALL", "B1", "B2", "C1", "C2"].map((cefr) => (
            <button
              key={cefr}
              onClick={() => setSelectedCefr(cefr)}
              className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition ${
                selectedCefr === cefr
                  ? "bg-[#14213D] text-white shadow-sm"
                  : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
              }`}
            >
              {cefr}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-[#14213D]/10 pt-3 sm:border-t-0 sm:pt-0">
          <span className="font-mono text-xs font-semibold text-[#14213D]/60 pr-2">Status:</span>
          {[
            { key: "ALL", label: "All" },
            { key: "completed", label: "Completed" },
            { key: "in-progress", label: "Active" },
            { key: "unlocked", label: "Unlocked" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`rounded-xl px-3 py-1.5 font-sans text-xs font-medium transition ${
                selectedStatus === st.key
                  ? "bg-[#3F6656] text-white shadow-sm"
                  : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 100-Level Interactive Roadmap Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-[#14213D]">100-Level Quiz Dashboard</h2>
          <span className="font-mono text-xs font-medium text-[#14213D]/60">
            Showing {filteredLevels.length} quizzes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredLevels.map((lvl) => {
            const isCompleted = lvl.status === "completed";
            const isInProgress = lvl.status === "in-progress";
            const isUnlocked = lvl.status === "unlocked";
            const isLocked = lvl.status === "locked";

            const bandInfo = CEFR_BANDS[lvl.cefr_band];

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (!isLocked) navigate(`/quiz?level=${lvl.level_number}`);
                }}
                disabled={isLocked}
                className={`relative flex flex-col items-center justify-between rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isInProgress
                    ? "border-[#C9A227] bg-[#C9A227]/10 ring-2 ring-[#C9A227]/50 shadow-lg"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-50/50"
                    : isUnlocked
                    ? "border-[#14213D]/20 bg-white"
                    : "border-[#14213D]/10 bg-gray-50/60 opacity-60"
                }`}
              >
                {/* Level number badge & status icon */}
                <div className="flex w-full items-center justify-between">
                  <span className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold ${bandInfo.badgeBg}`}>
                    {lvl.cefr_band}
                  </span>
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
                  {isInProgress && <Play className="h-4 w-4 text-[#C9A227] fill-[#C9A227] animate-bounce" />}
                  {isLocked && <Lock className="h-4 w-4 text-[#14213D]/40" />}
                </div>

                {/* Level Icon / Avatar */}
                <div className="my-3 flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-bold transition shadow-sm bg-gradient-to-br text-white shadow-[#14213D]/10">
                  <div className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${bandInfo.color}`}>
                    {lvl.level_number}
                  </div>
                </div>

                {/* Title */}
                <p className="line-clamp-2 h-9 font-sans text-xs font-semibold text-[#14213D]">
                  {lvl.title}
                </p>

                {/* Stars / Score indicator */}
                <div className="mt-2 flex items-center justify-center gap-1">
                  {isCompleted ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < lvl.stars ? "text-amber-500 fill-amber-500" : "text-gray-300"
                        }`}
                      />
                    ))
                  ) : isInProgress ? (
                    <span className="font-mono text-[11px] font-bold text-[#C9A227]">In Progress</span>
                  ) : isUnlocked ? (
                    <span className="font-mono text-[11px] font-medium text-[#3F6656]">Ready</span>
                  ) : (
                    <span className="font-mono text-[11px] text-gray-400">Locked</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
