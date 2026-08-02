import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Map,
  BookOpen,
  BookMarked,
  Zap,
  BarChart3,
  Flame,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Library,
  Video,
  MessageCircle,
  BookA,
  Globe,
  Home,
  ChevronRight,
  ShieldCheck,
  Compass,
  Bot
} from "lucide-react";

export default function AppLayout({ children, userStats }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [liveStats, setLiveStats] = useState(userStats || { streak: 0, xp: 0, level: 1, cefr: 'A1' });

  useEffect(() => {
    async function fetchLiveStats() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
            setLiveStats({
              streak: data.streak_days || 0,
              xp: data.xp_points || 0,
              level: data.current_level || 1,
              cefr: data.cefr_band || "A1"
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch live sidebar stats", e);
      }
    }
    fetchLiveStats();
  }, [user]);

  const activeStats = userStats || liveStats;

  const availableLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "th", name: "Thai", flag: "🇹🇭" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
  ];

  const changeLanguage = (code) => {
    localStorage.setItem("lingolive_target_language", code);
    setLangDropdownOpen(false);
    window.location.href = "/";
  };

  const currentLanguageCode = localStorage.getItem("lingolive_target_language") || "en";
  const currentLanguage = availableLanguages.find(l => l.code === currentLanguageCode) || availableLanguages[0];

  const navItems = [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "AI Conversation", path: "/chat", icon: Bot },
    { label: "Learning Path", path: "/path", icon: Map },
    { label: "Vocabulary", path: "/vocabulary", icon: BookMarked },
    { label: "Reading Practice", path: "/reading", icon: BookOpen },
    { label: "Quizzes", path: "/quiz", icon: Zap, hidden: true },
    { label: "Daily Sentences", path: "/sentences", icon: MessageCircle },
    { label: "Native Idioms", path: "/idioms", icon: Sparkles },
    { label: "Grammar Guide", path: "/grammar", icon: BookA },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Story Library", path: "/story", icon: Library },
    { label: "Video Lessons", path: "/videos", icon: Video },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const isTeluguDashboard = currentLanguageCode === "te" && (location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/analytics" || location.pathname === "/telugu-quiz" || location.pathname === "/telugu-sentences");
  const isMalayalamDashboard = currentLanguageCode === "ml" && (location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/analytics" || location.pathname === "/malayalam-alphabet" || location.pathname === "/malayalam-learning");
  
  const targetLanguages = ["hi", "ko", "ja", "th", "zh", "ar"];
  const isNewTargetLanguage = targetLanguages.includes(currentLanguageCode) && (location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/analytics" || location.pathname.endsWith("-learning"));

  const isStandaloneDashboard = isTeluguDashboard || isMalayalamDashboard || isNewTargetLanguage;

  if (currentLanguageCode !== "en" && !isStandaloneDashboard) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050816] font-sans text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 md:right-8 z-30">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center justify-center h-10 w-auto px-4 gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-xl hover:border-sky-400/50 hover:bg-white/10 transition-all"
            >
              <Globe className="h-4 w-4 text-sky-400" />
              <span className="text-lg leading-none">{currentLanguage.flag}</span>
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
                {currentLanguage.code}
              </span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0f172a]/95 py-2 shadow-2xl backdrop-blur-2xl z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      currentLanguageCode === lang.code
                        ? "bg-blue-600/20 text-sky-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-6 max-w-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600/20 text-sky-400 border border-sky-400/30 shadow-2xl mb-6">
            <Globe className="h-10 w-10" />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white mb-3">
            {currentLanguage.name} Path
            <br />
            <span className="text-sky-400">Launching Soon</span>
          </h1>
          <p className="font-sans text-sm text-slate-400 mb-8 leading-relaxed">
            Our AI language engines are training interactive modules for {currentLanguage.name}. 
          </p>
          <button
            onClick={() => changeLanguage("en")}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-sans text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all hover:scale-105"
          >
            <span>Switch to English</span>
            <ChevronRight className="w-4 h-4 text-sky-300" />
          </button>
        </div>
      </div>
    );
  }

  if (isStandaloneDashboard) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-[#050816]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050816] font-sans text-white selection:bg-blue-500/30">
      
      {/* Desktop Sidebar */}
      {!isStandaloneDashboard && (
        <aside className="hidden md:flex flex-col w-72 border-r border-white/10 bg-[#050816]/90 backdrop-blur-2xl z-20">
          
          {/* Brand header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-white group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="leading-none text-white font-extrabold tracking-tight">LingoLive</span>
                <span className="text-[10px] font-mono text-sky-400 font-semibold uppercase tracking-widest mt-1">SaaS Edition</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
            <div className="px-3 pb-2 pt-1 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Core Modules
            </div>
            {navItems.filter(item => !item.hidden).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600/15 border border-blue-500/30 text-white shadow-lg shadow-blue-600/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Stats & Profile Drawer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02]">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center justify-center bg-amber-500/10 rounded-2xl py-2.5 border border-amber-500/20" title="Daily Streak">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold font-number text-amber-300">{activeStats.streak}d</span>
                </div>
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-wider mt-0.5">Streak</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-blue-500/10 rounded-2xl py-2.5 border border-blue-500/20" title="XP Points">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-sky-400 fill-sky-400" />
                  <span className="text-xs font-bold font-number text-sky-300">{activeStats.xp}</span>
                </div>
                <span className="text-[9px] font-mono text-sky-500 uppercase tracking-wider mt-0.5">XP</span>
              </div>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 hover:border-white/20 hover:bg-white/10 transition-colors"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="h-9 w-9 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-xs font-bold text-white shadow-md">
                    {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "L"}
                  </div>
                )}
                <div className="flex flex-col items-start overflow-hidden text-left flex-1">
                  <span className="font-sans text-xs font-bold text-white truncate w-full">
                    {user?.displayName || "Pro Learner"}
                  </span>
                  <span className="font-sans text-[11px] text-slate-400 truncate w-full">
                    {user?.email || "learner@lingolive.app"}
                  </span>
                </div>
              </button>

              {/* Profile Menu */}
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-white/10 bg-[#0f172a] p-2 shadow-2xl backdrop-blur-2xl z-50">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Header (Hidden on Desktop) */}
      {!isStandaloneDashboard && (
        <div className="md:hidden absolute top-0 left-0 w-full z-40 flex flex-col">
          <header className="border-b border-white/10 bg-[#050816]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <span>LingoLive</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                {activeStats.streak}d
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {/* Mobile Dropdown Nav */}
          {mobileMenuOpen && (
            <div className="border-b border-white/10 bg-[#050816] px-4 py-4 shadow-2xl h-[calc(100vh-60px)] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                {navItems.filter(item => !item.hidden).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold ${
                        isActive ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left font-sans text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative bg-radial-gradient custom-scrollbar">
        
        {/* Top Right Floating Language Switcher */}
        <div className="absolute top-4 right-4 md:right-8 z-30">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center justify-center h-10 px-3.5 gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-lg hover:border-sky-400/40 hover:bg-white/10 transition-all"
            >
              <Globe className="h-4 w-4 text-sky-400" />
              <span className="text-base leading-none">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
                {currentLanguage.name}
              </span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0f172a]/95 py-2 shadow-2xl backdrop-blur-2xl z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      currentLanguageCode === lang.code
                        ? "bg-blue-600/20 text-sky-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20 mt-2 md:mt-8">
          {children}
        </div>
      </main>

    </div>
  );
}
