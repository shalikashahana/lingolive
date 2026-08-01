import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";




/* ── Stars scattered across the hero ── */
const STARS = [
  { top: "6%",  left: "4%",  size: 3, delay: "0s" },
  { top: "14%", left: "14%", size: 5, delay: "0.6s" },
  { top: "5%",  left: "32%", size: 4, delay: "1.1s" },
  { top: "22%", left: "42%", size: 3, delay: "0.3s" },
  { top: "8%",  left: "58%", size: 6, delay: "1.7s" },
  { top: "4%",  left: "76%", size: 4, delay: "0.9s" },
  { top: "16%", left: "90%", size: 3, delay: "0.2s" },
  { top: "35%", left: "2%",  size: 5, delay: "2.1s" },
  { top: "42%", left: "94%", size: 4, delay: "1.4s" },
  { top: "68%", left: "8%",  size: 3, delay: "0.8s" },
  { top: "75%", left: "86%", size: 5, delay: "1.9s" },
  { top: "84%", left: "28%", size: 4, delay: "0.5s" },
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

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/select-language");
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
      navigate("/select-language");
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
    <div className="landing-root">
      {/* ────── Background Stars ────── */}
      {STARS.map((s, i) => (
        <span key={i} className="star" style={{ top: s.top, left: s.left, "--s": `${s.size}px`, animationDelay: s.delay }} />
      ))}

      {/* ────── World Skyline Silhouette (Bottom Left) ────── */}
      <div className="world-skyline">
        <svg viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path
            d="M0 200 L0 160 L15 160 L15 140 L25 120 L35 140 L35 160 L50 160 L50 130 L60 110 L70 130 L70 160 L85 160 L85 90 C85 70 100 50 115 50 C130 50 145 70 145 90 L145 160 L160 160 L160 130 L170 130 L170 160 L195 160 L195 100 L210 100 L210 80 L215 60 L220 80 L220 100 L235 100 L235 160 L250 160 L250 140 L260 140 L260 160 L280 160 L280 120 L295 90 L310 120 L310 160 L330 160 L330 140 L345 140 L345 160 L370 160 L370 130 L380 130 L380 160 L400 160 L400 150 L420 150 L420 160 L500 160 L500 200 Z"
            fill="url(#skylineGrad)"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c084fc" />
              <stop offset="1" stopColor="#1e1b4b" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>



      {/* ────── Navigation ────── */}
      <nav className="landing-nav">
        {/* Mozhify Logo */}
        <div className="nav-logo">
          <div className="logo-icon-bubble">
            <span className="logo-globe">🌐</span>
            <span className="logo-paw-badge">🐾</span>
          </div>
          <span className="logo-text">Mozhify</span>
        </div>

        {/* Nav links */}
        <div className="nav-links">
          <Link to="/about" className="nav-link">
            <span className="nav-icon">🌐</span> About Us
          </Link>
        </div>


      </nav>

      {/* ────── Hero Section ────── */}
      <main className="landing-hero">
        {/* Left Content */}
        <div className="hero-left">
          <div className="hero-welcome-wrap">
            <p className="hero-welcome">Welcome to</p>
            <span className="welcome-heart">♡</span>
          </div>

          <h1 className="hero-title">
            Mozh<span className="title-paw-i">ı<span className="title-paw">🐾</span></span>fy
          </h1>

          <p className="hero-subtitle">
            <span className="sparkle-left">✦✦</span> Speak beyond borders <span className="sparkle-right">✦✦</span>
          </p>

          <div className="hero-cta-wrapper">
            <button className="hero-cta" onClick={() => setShowAuth(true)}>
              Touch to learn languages <span className="cta-paw">🐾</span>
            </button>

            {/* Paper Airplane Trailing Path SVG */}
            <svg className="paper-plane-path" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 10 50 Q 80 10 160 30"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
                strokeDasharray="6 6"
                fill="none"
              />
              {/* Paper airplane icon */}
              <g transform="translate(160, 25) rotate(-15)">
                <path d="M 0 0 L 16 8 L 4 10 L 0 16 Z" fill="#ffffff" />
                <path d="M 4 10 L 16 8 L 0 0 Z" fill="#e2e8f0" />
              </g>
            </svg>
          </div>
        </div>


      </main>

      {/* ────── Auth Modal ────── */}
      {showAuth && (
        <div className="modal-backdrop" onClick={() => setShowAuth(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>✕</button>

            <div className="modal-header">
              <h2 className="modal-title">
                {mode === "signin" ? "Welcome back to Mozhify! 🐾" : "Join Mozhify Today 🌏"}
              </h2>
              <p className="modal-sub">
                {mode === "signin"
                  ? "Pick up your language streak where you left off."
                  : "Start speaking new languages effortlessly."}
              </p>
            </div>

            {/* Google sign-in */}
            <button
              className="google-btn"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="divider"><span>or</span></div>

            <form onSubmit={handleEmailAuth} className="auth-form">
              <label className="field-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@example.com"
              />

              <label className="field-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••"
              />

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="mode-switch">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                className="mode-btn"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              >
                {mode === "signin" ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ────── Styles ────── */}
      <style>{`
        .landing-root {
          min-height: 100vh;
          width: 100%;
          background: url('/earth-bg.jpg') bottom center / 100% auto no-repeat,
                      linear-gradient(165deg, #1b0c3f 0%, #2e185c 30%, #24144d 60%, #150a30 100%);
          position: relative;
          overflow: hidden;
          font-family: 'Nunito', 'Plus Jakarta Sans', sans-serif;
        }

        /* Stars */
        .star {
          position: absolute;
          width: var(--s, 4px);
          height: var(--s, 4px);
          background: #ffffff;
          border-radius: 50%;
          animation: starTwinkle 2.5s ease-in-out infinite;
          opacity: 0.8;
          box-shadow: 0 0 6px #ffffff;
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.6); }
        }

        /* World Skyline Silhouette */
        .world-skyline {
          position: absolute;
          bottom: 40px;
          left: 0;
          width: 420px;
          height: 180px;
          pointer-events: none;
          z-index: 5;
        }



        /* Nav Bar */
        .landing-nav {
          position: relative;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 60px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 24px;
          color: white;
          letter-spacing: -0.5px;
        }
        .logo-icon-bubble {
          position: relative;
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);
        }
        .logo-globe { font-size: 20px; }
        .logo-paw-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          font-size: 11px;
        }
        .logo-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 26px;
          background: linear-gradient(135deg, #ffffff 60%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          gap: 36px;
          align-items: center;
        }
        .nav-link {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s, transform 0.2s;
        }
        .nav-link:hover {
          color: #f472b6;
          transform: translateY(-1px);
        }
        .nav-icon { font-size: 15px; }

        .nav-cta {
          background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
          color: white;
          border: none;
          border-radius: 30px;
          padding: 12px 28px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(168, 85, 247, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .nav-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 32px rgba(168, 85, 247, 0.6);
        }

        /* Hero Section */
        .landing-hero {
          position: relative;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: calc(100vh - 100px);
          padding: 0 60px 40px 60px;
          gap: 40px;
        }
        .hero-left {
          flex: 1;
          max-width: 520px;
          animation: heroFadeIn 0.8s ease-out forwards;
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hero-welcome-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .hero-welcome {
          font-family: 'Pacifico', cursive;
          font-size: clamp(24px, 3.2vw, 36px);
          color: #f472b6;
          margin: 0;
          text-shadow: 0 2px 18px rgba(244, 114, 182, 0.5);
        }
        .welcome-heart {
          font-size: 24px;
          color: #f472b6;
        }

        .hero-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(64px, 8.5vw, 105px);
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 10px 0;
          line-height: 1;
          letter-spacing: -2px;
          text-shadow: 0 6px 40px rgba(168, 85, 247, 0.5);
          display: flex;
          align-items: center;
        }
        .title-paw-i {
          position: relative;
          display: inline-block;
        }
        .title-paw {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(20px, 2.5vw, 32px);
        }

        .hero-subtitle {
          font-size: clamp(16px, 2.2vw, 20px);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.88);
          margin: 0 0 36px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.3px;
        }
        .sparkle-left, .sparkle-right {
          color: #f472b6;
          font-size: 16px;
        }

        .hero-cta-wrapper {
          position: relative;
          display: inline-block;
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #ec4899 0%, #c084fc 100%);
          color: white;
          border: none;
          border-radius: 40px;
          padding: 18px 40px;
          font-family: 'Nunito', sans-serif;
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(236, 72, 153, 0.5);
          transition: transform 0.25s, box-shadow 0.25s;
          letter-spacing: 0.4px;
        }
        .hero-cta:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 14px 44px rgba(236, 72, 153, 0.7);
        }
        .cta-paw { font-size: 18px; }

        .paper-plane-path {
          position: absolute;
          top: 100%;
          left: 100px;
          width: 180px;
          height: 60px;
          pointer-events: none;
          overflow: visible;
        }

        .hero-right {
          flex: 1.2;
          max-width: 580px;
          position: relative;
          align-self: flex-end;
          margin-bottom: -40px;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 7, 35, 0.82);
          backdrop-filter: blur(10px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modalBgFade 0.25s ease;
        }
        @keyframes modalBgFade { from { opacity: 0; } to { opacity: 1; } }

        .modal-card {
          background: linear-gradient(165deg, #2e185c 0%, #150a30 100%);
          border: 1.5px solid rgba(168, 85, 247, 0.35);
          border-radius: 28px;
          padding: 40px 36px 36px;
          width: 100%;
          max-width: 420px;
          position: relative;
          box-shadow: 0 30px 90px rgba(10, 5, 30, 0.85);
          animation: modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-close {
          position: absolute;
          top: 18px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .modal-close:hover { background: rgba(244, 114, 182, 0.3); color: white; }

        .modal-header { margin-bottom: 24px; }
        .modal-title {
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: white;
          margin: 0 0 6px;
        }
        .modal-sub {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: white;
          border: none;
          border-radius: 14px;
          padding: 13px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #333;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.4);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: rgba(255, 255, 255, 0.35);
          font-size: 12px;
          font-weight: 600;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.12);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 4px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .field-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255, 255, 255, 0.35); }
        .field-input:focus {
          border-color: #f472b6;
          background: rgba(244, 114, 182, 0.08);
        }

        .form-error {
          font-size: 13px;
          color: #f87171;
          margin: 0;
          font-weight: 600;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: white;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(236, 72, 153, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 4px;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(236, 72, 153, 0.6);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .mode-switch {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          margin: 20px 0 0;
        }
        .mode-btn {
          background: none;
          border: none;
          color: #f472b6;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .mode-btn:hover { color: #fbcfe8; }

        /* Responsive */
        @media (max-width: 900px) {
          .landing-hero {
            flex-direction: column;
            padding: 20px 24px 40px;
            text-align: center;
            gap: 20px;
          }
          .hero-welcome-wrap, .hero-subtitle { justify-content: center; }
          .hero-right { max-width: 360px; }
          .landing-nav { padding: 18px 24px; }
          .nav-links { display: none; }
        }

      `}</style>
    </div>
  );
}
