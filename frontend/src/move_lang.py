import re

# File 1: TeluguSentences.jsx
ts_file = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\pages\TeluguSentences.jsx'
with open(ts_file, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Import Globe
ts_content = ts_content.replace(
    'Play, Volume2, Eye, EyeOff, User, Filter, LogOut, Lock, Star, Flame, Zap, BarChart3',
    'Play, Volume2, Eye, EyeOff, User, Filter, LogOut, Lock, Star, Flame, Zap, BarChart3, Globe'
)

# Add state and logic
state_logic = '''  const [activeTab, setActiveTab] = useState("Vowels (అచ్చులు - Acchulu)");

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
    window.location.reload(); 
  };
'''
ts_content = ts_content.replace('  const [activeTab, setActiveTab] = useState("Vowels (అచ్చులు - Acchulu)");', state_logic)

# Add UI next to Mozhify
ui_code = '''          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
              <Languages className="w-6 h-6 text-[#C9A227]" /> Mozhify
            </h1>
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center justify-center h-8 px-2.5 gap-1.5 rounded-lg border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-[#C9A227] group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[13px] leading-none">{currentLanguage.flag}</span>
                <span className="font-sans text-[11px] font-bold uppercase mt-0.5">
                  {currentLanguage.code}
                </span>
              </button>
              {langDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-[#14213D]/10 bg-white py-2 shadow-xl z-50">
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
          </div>'''

ts_content = ts_content.replace(
    '''          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
              <Languages className="w-6 h-6 text-[#C9A227]" /> Mozhify
            </h1>
          </div>''',
    ui_code
)

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(ts_content)

# File 2: AppLayout.jsx
al_file = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\components\AppLayout.jsx'
with open(al_file, 'r', encoding='utf-8') as f:
    al_content = f.read()

app_layout_replace = '''  if (isTeluguDashboard) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-gray-50">
        {children}
      </div>
    );
  }'''

# Find the block from "if (isTeluguDashboard) {" to "    );" that contains the language switcher and replace it.
# We'll use regex for multiline replace
al_content = re.sub(
    r'if \(isTeluguDashboard\) \{.*?return \(\s*<div className="relative h-screen w-full overflow-hidden bg-gray-50">.*?(?:<div className="absolute top-4 right-4 md:right-8 z-50">.*?</div>.*?</div>).*?\{children\}\s*</div>\s*\);\s*\}',
    app_layout_replace,
    al_content,
    flags=re.DOTALL
)

with open(al_file, 'w', encoding='utf-8') as f:
    f.write(al_content)

print("Moved language switcher to TeluguSentences.jsx sidebar!")
