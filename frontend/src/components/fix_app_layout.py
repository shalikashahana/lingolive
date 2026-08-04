import re

file_path = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\components\AppLayout.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Coming Soon screen's language toggle
content = content.replace(
    '''            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center justify-center h-10 w-10 md:h-11 md:w-auto md:px-3 gap-2 rounded-xl border border-[#14213D]/10 bg-white text-[#14213D] shadow-sm hover:border-[#14213D]/30 transition-all"
            >
              <span className="text-lg leading-none">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-sans text-sm font-bold uppercase">
                {currentLanguage.code}
              </span>
            </button>''',
    '''            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-auto md:px-3 gap-2 rounded-xl border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
            >
              <Globe className="h-4 w-4 text-[#C9A227] group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-lg leading-none hidden md:inline">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-sans text-sm font-bold uppercase">
                {currentLanguage.code}
              </span>
            </button>'''
)

# 2. Add early return for isTeluguDashboard
early_return = '''
  if (isTeluguDashboard) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-gray-50">
        {/* Top Right Language Switcher */}
        <div className="absolute top-4 right-4 md:right-8 z-50">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-auto md:px-3 gap-2 rounded-xl border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
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
        {children}
      </div>
    );
  }
'''
content = content.replace('  return (\n    <div className="flex h-screen overflow-hidden bg-[#F8F6F0]', early_return + '\n  return (\n    <div className="flex h-screen overflow-hidden bg-[#F8F6F0]')

# 3. Update the main layout's language switcher
content = content.replace(
    '{/* Top Left Language Switcher */}',
    '{/* Top Right Language Switcher */}'
)
content = content.replace(
    '<div className="absolute top-4 left-4 md:left-8 z-30">',
    '<div className="absolute top-4 right-4 md:right-8 z-30">'
)
content = content.replace(
    '<div className="absolute left-0 top-full mt-2',
    '<div className="absolute right-0 top-full mt-2'
)

# And inject the globe icon there too if it wasn't already caught by the first replace, but wait, the first replace was for the same button structure?
# Let's just do a blanket regex replacement for that specific button:
content = re.sub(
    r'''<button\s+onClick=\{\(\) => setLangDropdownOpen\(!langDropdownOpen\)\}\s+className="flex items-center justify-center h-10 w-10 md:h-11 md:w-auto md:px-3 gap-2 rounded-xl border border-\[#14213D\]/10 bg-white text-\[#14213D\] shadow-sm hover:border-\[#14213D\]/30 transition-all"\s*>\s*<span className="text-lg leading-none">\{currentLanguage.flag\}</span>\s*<span className="hidden md:inline font-sans text-sm font-bold uppercase">\s*\{currentLanguage.code\}\s*</span>\s*</button>''',
    r'''<button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-auto md:px-3 gap-2 rounded-xl border border-[#14213D]/10 bg-white/90 backdrop-blur-md text-[#14213D] shadow-sm hover:border-[#C9A227] hover:text-[#C9A227] transition-all"
            >
              <Globe className="h-4 w-4 text-[#C9A227] group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-lg leading-none hidden md:inline">{currentLanguage.flag}</span>
              <span className="hidden md:inline font-sans text-sm font-bold uppercase">
                {currentLanguage.code}
              </span>
            </button>''',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated AppLayout successfully")
