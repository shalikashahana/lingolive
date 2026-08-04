import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, BookOpen, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import alphabetData from "../../data/malayalamAlphabetData.json";

export default function MalayalamAlphabet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("swarangal");

  const tabs = [
    { id: "swarangal", label: "Vowels (സ്വരങ്ങൾ)" },
    { id: "vyanjanangal", label: "Consonants (വ്യഞ്ജനങ്ങൾ)" },
    { id: "chillaksharangal", label: "Chillu Letters (ചില്ലക്ഷരങ്ങൾ)" }
  ];

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

  const currentLanguageCode = localStorage.getItem("mozhify_target_language") || "en";
  const currentLanguage = availableLanguages.find(l => l.code === currentLanguageCode) || availableLanguages[0];

  const changeLanguage = (code) => {
    localStorage.setItem("mozhify_target_language", code);
    setLangDropdownOpen(false);
    window.location.href = "/";
  };

  const handleSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ml-IN";
    window.speechSynthesis.speak(utterance);
  };

  const currentLetters = alphabetData.alphabet[activeTab];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#14213D]">Malayalam Alphabet</h1>
              <p className="text-xs text-gray-500 font-sans">{alphabetData.total_letters} Total Letters</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="group flex items-center justify-center h-10 w-10 md:h-10 md:w-auto md:px-3 gap-2 rounded-xl border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
            >
              <Globe className="h-4 w-4 text-[#C9A227] group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-lg leading-none hidden md:inline">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-sans text-sm font-bold uppercase">
                {currentLanguage.code}
              </span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#14213D]/10 bg-white py-2 shadow-xl z-50">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center gap-3 px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                      currentLanguageCode === lang.code
                        ? "bg-[#14213D]/5 text-[#C9A227]"
                        : "text-[#14213D] hover:bg-[#14213D]/5"
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

        {/* Tabs */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full font-sans text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#14213D] text-white shadow-md shadow-[#14213D]/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {currentLetters.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group relative flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleSpeak(item.letter)}
              >
                {/* Decorative background circle on hover */}
                <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 text-center space-y-4 w-full">
                  <div className="flex justify-between w-full absolute -top-2 left-0 right-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-50 px-2 py-0.5 rounded-full">{item.type}</span>
                    <button className="text-emerald-500 bg-emerald-50 rounded-full p-1 hover:bg-emerald-100">
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="font-display text-6xl text-[#14213D] group-hover:text-emerald-600 transition-colors duration-300 mt-4">
                    {item.letter}
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 border-t border-gray-100 pt-3 w-full">
                    <span className="font-sans text-sm font-bold text-gray-700">
                      {item.transliteration}
                    </span>
                    <span className="font-sans text-xs font-medium text-gray-500">
                      Tamil: {item.tamil_transliteration}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
