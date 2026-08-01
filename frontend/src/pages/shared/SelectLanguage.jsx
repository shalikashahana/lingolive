import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Globe, ArrowRight } from "lucide-react";

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

export default function SelectLanguage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(localStorage.getItem("lingolive_target_language") || "en");
  const { user } = useAuth();

  const handleSelect = (code) => {
    localStorage.setItem("lingolive_target_language", code);
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
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] font-sans text-[#14213D] selection:bg-[#C9A227]/30 p-6">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl shadow-[#14213D]/10 md:p-12 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#3F6656]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-4 mb-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14213D] text-[#C9A227] shadow-lg">
            <Globe className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#14213D]">
            What language do you want to learn?
          </h1>
          <p className="font-sans text-sm text-[#14213D]/60 max-w-md mx-auto">
            Choose the target language you want to practice. You can switch this at any time from the dashboard.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected === lang.code
                  ? "border-[#14213D] bg-[#14213D] text-white shadow-xl shadow-[#14213D]/20 scale-[1.02]"
                  : "border-[#14213D]/10 bg-white hover:border-[#14213D]/30 hover:bg-[#14213D]/5 hover:shadow-md"
              }`}
            >
              <div className="text-3xl filter drop-shadow-sm">{lang.flag}</div>
              <div className="flex flex-col">
                <span className={`font-sans font-bold text-lg ${selected === lang.code ? "text-white" : "text-[#14213D]"}`}>
                  {lang.nativeName}
                </span>
                <span className={`font-sans text-xs ${selected === lang.code ? "text-white/70" : "text-[#14213D]/50"}`}>
                  {lang.name}
                </span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
