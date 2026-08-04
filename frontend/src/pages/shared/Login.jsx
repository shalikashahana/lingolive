import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Zap, Sparkles, ArrowRight, ShieldCheck, Globe, CheckCircle2, Lock, Mail } from "lucide-react";

/* ── Stars scattered across the hero ── */
const STARS = [
  { top: "6%",  left: "4%",  size: 3, delay: "0s" },
  { top: "14%", left: "14%", size: 4, delay: "0.6s" },
  { top: "5%",  left: "32%", size: 3, delay: "1.1s" },
  { top: "22%", left: "42%", size: 3, delay: "0.3s" },
  { top: "8%",  left: "58%", size: 5, delay: "1.7s" },
  { top: "4%",  left: "76%", size: 4, delay: "0.9s" },
  { top: "16%", left: "90%", size: 3, delay: "0.2s" },
  { top: "35%", left: "2%",  size: 4, delay: "2.1s" },
  { top: "42%", left: "94%", size: 3, delay: "1.4s" },
  { top: "68%", left: "8%",  size: 3, delay: "0.8s" },
  { top: "75%", left: "86%", size: 4, delay: "1.9s" },
  { top: "84%", left: "28%", size: 3, delay: "0.5s" },
  { top: "86%", left: "68%", size: 3, delay: "1.2s" },
  { top: "90%", left: "48%", size: 4, delay: "2.5s" },
];

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigateBasedOnLanguage = () => {
    const code = localStorage.getItem("mozhify_target_language");
    if (code) {
      const routes = {
        en: "/dashboard",
        te: "/telugu-learning",
        ml: "/malayalam-learning",
        hi: "/hindi-learning",
        ar: "/arabic-learning",
        ko: "/korean-learning",
        th: "/thai-learning",
        zh: "/chinese-learning",
        ja: "/japanese-learning"
      };
      navigate(routes[code] || "/dashboard");
    } else {
      navigate("/select-language");
    }
  };

  useEffect(() => {
    if (user) navigateBasedOnLanguage();
  }, [user, navigate]);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigateBasedOnLanguage();
    } catch (err) {
      console.error(err);
      setError("Couldn't sign in with Google. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigateBasedOnLanguage();
    } catch {
      setError(
        mode === "signin"
          ? "Email or password is incorrect."
          : "Couldn't create your account. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-sky-500/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white opacity-40 animate-pulse pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* Top Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-white group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <span className="font-extrabold tracking-tight">Mozhify</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>About Us</span>
          </Link>

          <button
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={() => { setMode("signup"); setShowAuth(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl mb-8">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-semibold text-sky-300 uppercase tracking-widest">
            Next-Gen AI Language Platform
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Master Any Language with{" "}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
          Duolingo-level gamification meets Linear-level polish. Practice interactive conversations, vocabulary mastery, and interview prep in real time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={() => { setMode("signup"); setShowAuth(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>Start Learning Today</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-base font-semibold px-8 py-4 rounded-2xl backdrop-blur-xl transition-all"
          >
            <span>Existing Account</span>
          </button>
        </div>

        {/* Feature Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">Instant Gemma AI Feedback</h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Real-time speech correction, grammar analysis, and accent polishing powered by FastAPI.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">100-Level Structured Path</h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Clear CEFR level progression (A1 to C2) with bite-sized daily missions and interactive quizzes.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/10 rounded-3xl bg-white/[0.03]">
            <div className="h-12 w-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">Interview & Career Readiness</h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Simulated technical & professional language interviews with instant AI scoring.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setShowAuth(false)}>
          <div
            className="glass-card w-full max-w-md p-8 border border-white/15 rounded-3xl bg-[#0f172a]/95 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuth(false)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="mb-6 text-left">
              <h2 className="font-heading text-2xl font-bold text-white mb-1">
                {mode === "signin" ? "Welcome back to Mozhify" : "Create your Account"}
              </h2>
              <p className="font-sans text-xs text-slate-400">
                {mode === "signin"
                  ? "Continue your daily streak and practice languages."
                  : "Join thousands of learners reaching multilingual fluency."}
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3.5 px-4 rounded-2xl shadow-lg hover:bg-slate-100 transition-all disabled:opacity-50 mb-4"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">OR EMAIL</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
              <div>
                <label className="block font-sans text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4"
              >
                {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
