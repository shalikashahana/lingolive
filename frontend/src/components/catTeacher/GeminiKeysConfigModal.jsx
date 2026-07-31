import React, { useState } from "react";
import { Key, X, Check, Globe, Sparkles, Lock } from "lucide-react";
import { getGeminiApiKeyForLanguage, setGeminiApiKeyForLanguage } from "../../services/geminiTeacherService";

const LANGUAGES_LIST = [
  { id: "english", label: "English", flag: "🇬🇧", envName: "VITE_GEMINI_API_KEY_ENGLISH" },
  { id: "hindi", label: "Hindi (हिंदी)", flag: "🇮🇳", envName: "VITE_GEMINI_API_KEY_HINDI" },
  { id: "malayalam", label: "Malayalam (മലയാളം)", flag: "🌴", envName: "VITE_GEMINI_API_KEY_MALAYALAM" },
  { id: "telugu", label: "Telugu (తెలుగు)", flag: "🏛️", envName: "VITE_GEMINI_API_KEY_TELUGU" },
  { id: "japanese", label: "Japanese (日本語)", flag: "🇯🇵", envName: "VITE_GEMINI_API_KEY_JAPANESE" },
  { id: "korean", label: "Korean (한국어)", flag: "🇰🇷", envName: "VITE_GEMINI_API_KEY_KOREAN" },
  { id: "chinese", label: "Chinese (中文)", flag: "🇨🇳", envName: "VITE_GEMINI_API_KEY_CHINESE" },
  { id: "thai", label: "Thai (ไทย)", flag: "🇹🇭", envName: "VITE_GEMINI_API_KEY_THAI" },
  { id: "arabic", label: "Arabic (العربية)", flag: "🇦🇪", envName: "VITE_GEMINI_API_KEY_ARABIC" }
];

export default function GeminiKeysConfigModal({ isOpen, onClose }) {
  const [keysState, setKeysState] = useState(() => {
    const initial = {};
    LANGUAGES_LIST.forEach((lang) => {
      initial[lang.id] = getGeminiApiKeyForLanguage(lang.id) || "";
    });
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (langId, value) => {
    setKeysState((prev) => ({ ...prev, [langId]: value }));
  };

  const handleSaveAll = () => {
    LANGUAGES_LIST.forEach((lang) => {
      setGeminiApiKeyForLanguage(lang.id, keysState[lang.id]);
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200/50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Key className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                Gemini AI Voice Teacher Settings <Sparkles className="w-4 h-4 text-amber-200" />
              </h2>
              <p className="text-xs text-white/80">Configure separate Gemini API keys for each of the 9 languages</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Per-Language API Routing</span>
              You can set separate Gemini API keys for each language. If left blank, it automatically falls back to your global <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-mono">VITE_GEMINI_API_KEY</code> environment variable or offline cat responses!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {LANGUAGES_LIST.map((lang) => (
              <div key={lang.id} className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200/60 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </label>
                  <span className="text-[10px] font-mono text-gray-400">
                    {lang.envName.replace("VITE_GEMINI_API_KEY_", "")}
                  </span>
                </div>
                <input
                  type="password"
                  value={keysState[lang.id] || ""}
                  onChange={(e) => handleChange(lang.id, e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSaveAll}
            className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${
              savedSuccess 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : "bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-95"
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Keys Saved!
              </>
            ) : (
              <>Save API Keys</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
