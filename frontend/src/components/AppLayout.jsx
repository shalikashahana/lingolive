import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Map,
  BookOpen,
  BookMarked,
  MessageSquareCode,
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
  MessageCircle
} from "lucide-react";

export default function AppLayout({ children, userStats = { streak: 5, xp: 1420, level: 13, cefr: 'C1' } }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { label: "Quiz Dashboard", path: "/", icon: Map },
    { label: "Vocabulary", path: "/vocabulary", icon: BookMarked },
    { label: "Reading", path: "/reading", icon: BookOpen },
    { label: "AI Tutor", path: "/chat", icon: MessageSquareCode, badge: "Gemma" },
    { label: "Quizzes", path: "/quiz", icon: Zap, hidden: true },
    { label: "Sentences", path: "/sentences", icon: MessageCircle },
    { label: "Idioms", path: "/idioms", icon: Sparkles },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Story", path: "/story", icon: Library },
    { label: "Videos", path: "/videos", icon: Video },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6F0] font-sans text-[#14213D] selection:bg-[#C9A227]/30">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-[#14213D]/10 bg-white/80 backdrop-blur-xl z-20 shadow-[4px_0_24px_rgba(20,33,61,0.02)]">
        {/* Brand logo */}
        <div className="p-6 border-b border-[#14213D]/5">
          <Link to="/" className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-[#14213D]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-[#C9A227] shadow-sm">
              <Zap className="h-6 w-6 fill-[#C9A227]" />
            </div>
            <span>LingoLive</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#3F6656]/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3F6656]">
            <Sparkles className="w-3 h-3" />
            AI Powered
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center justify-between rounded-xl px-4 py-3 font-sans text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#14213D] text-white shadow-md shadow-[#14213D]/20 translate-x-1"
                    : "text-[#14213D]/70 hover:bg-[#14213D]/5 hover:text-[#14213D]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "text-[#C9A227] scale-110" : "text-[#14213D]/50 group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#C9A227]/20 text-[#C9A227]"}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Stats & Profile (Bottom of sidebar) */}
        <div className="p-4 border-t border-[#14213D]/5 bg-[#14213D]/[0.02]">
          
          {/* Stats Row */}
          <div className="flex items-center justify-between gap-2 mb-4 px-1">
            <div className="flex flex-col items-center justify-center flex-1 bg-amber-500/10 rounded-lg py-2 border border-amber-500/20" title="Streak">
              <Flame className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse mb-1" />
              <span className="text-xs font-bold text-amber-700">{userStats.streak}d</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 bg-[#C9A227]/10 rounded-lg py-2 border border-[#C9A227]/20" title="XP">
              <Zap className="h-5 w-5 text-[#C9A227] fill-[#C9A227] mb-1" />
              <span className="text-xs font-bold text-[#8C6D13]">{userStats.xp}</span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 bg-[#3F6656]/10 rounded-lg py-2 border border-[#3F6656]/20" title="Level">
              <span className="text-[10px] font-bold text-[#3F6656]/60 mb-0.5">{userStats.cefr}</span>
              <span className="text-xs font-bold text-[#3F6656]">Lvl {userStats.level}</span>
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex w-full items-center gap-3 rounded-xl border border-[#14213D]/10 bg-white p-2 hover:border-[#14213D]/30 hover:bg-[#14213D]/5 transition-colors"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#14213D] to-[#2a3a5c] text-sm font-bold text-white shadow-sm">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "L"}
                </div>
              )}
              <div className="flex flex-col items-start overflow-hidden text-left flex-1">
                <span className="font-sans text-sm font-bold text-[#14213D] truncate w-full">
                  {user?.displayName || "Learner"}
                </span>
                <span className="font-sans text-xs font-medium text-[#14213D]/60 truncate w-full">
                  {user?.email || "learner@lingolive.app"}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-[#14213D]/10 bg-white p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-lg z-50">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden absolute top-0 left-0 w-full z-40 flex flex-col">
        <header className="border-b border-[#14213D]/10 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-[#14213D]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213D] text-[#C9A227]">
                <Zap className="h-4 w-4 fill-[#C9A227]" />
              </div>
              <span>LingoLive</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700">
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                {userStats.streak}
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#14213D]/15 bg-white text-[#14213D]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="border-b border-[#14213D]/10 bg-white px-4 py-3 shadow-xl h-[calc(100vh-60px)] overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold ${
                      isActive ? "bg-[#14213D] text-white shadow-md" : "text-[#14213D]/80 hover:bg-[#14213D]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? "text-[#C9A227]" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-[#C9A227]/20 text-[#C9A227]"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <div className="mt-4 pt-4 border-t border-[#14213D]/10">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left font-sans text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative bg-gradient-to-br from-[#F8F6F0] to-[#f0efe9]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-20">
          {children}
        </div>
      </main>

    </div>
  );
}
