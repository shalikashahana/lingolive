import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import GoogleButton from "../../components/auth/GoogleButton";
import SentenceAssembly from "../../components/auth/SentenceAssembly";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
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
      navigate("/dashboard");
    } catch (err) {
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
    <div className="grid min-h-screen w-full md:grid-cols-[55%_45%]">
      {/* Left — brand / signature animation */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-ink px-12 md:flex">
        <div className="absolute left-12 top-12 font-mono text-xs uppercase tracking-widest text-bone/50">
          LingoLive
        </div>
        <SentenceAssembly />
        <div className="absolute bottom-12 flex items-center gap-3 font-mono text-xs text-bone/60">
          <span className="rounded-full border border-gold/40 px-3 py-1 text-gold">
            B2 → C1
          </span>
          <span>Intermediate to fluent, one level at a time.</span>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex flex-col items-center justify-center bg-bone px-6 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-charcoal">
            {mode === "signin" ? "Welcome back" : "Start learning"}
          </h1>
          <p className="mt-2 font-sans text-sm text-charcoal/60">
            {mode === "signin"
              ? "Pick up your streak where you left off."
              : "Create your account to begin your first level."}
          </p>

          <div className="mt-8">
            <GoogleButton onClick={handleGoogle} loading={loading} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-charcoal/10" />
            <span className="font-mono text-xs text-charcoal/40">or</span>
            <div className="h-px flex-1 bg-charcoal/10" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="font-sans text-xs font-medium text-charcoal/70">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 font-sans text-sm text-charcoal outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="font-sans text-xs font-medium text-charcoal/70">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 font-sans text-sm text-charcoal outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gold px-4 py-3 font-sans text-sm font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center font-sans text-sm text-charcoal/60">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-moss underline-offset-2 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
