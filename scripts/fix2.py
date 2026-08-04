import os

file_path = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\pages\TeluguSentences.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    <div className="flex h-screen bg-gray-50 overflow-hidden">'
end_marker = '      {/* Main Content Area */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    new_sidebar = r'''    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-72 h-screen bg-white border-r border-[#14213D]/10 flex flex-col shadow-sm shrink-0">
        {/* Top Section */}
        <div className="p-6 border-b border-[#14213D]/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
              <Languages className="w-6 h-6 text-[#C9A227]" /> Mozhify
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14213D]/5 px-3 py-1.5 font-mono text-xs font-semibold text-[#14213D]/70 w-fit">
            Telugu Learning
          </span>
          <button 
            onClick={() => navigate("/")}
            className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#14213D]/60 hover:text-[#14213D] hover:bg-[#14213D]/5 rounded-lg transition-colors border border-transparent hover:border-[#14213D]/10 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Main
          </button>
        </div>

        {/* Middle Section (Navigation) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {TABS.map((tabName) => {
            const getIcon = (name) => {
              if (name.includes("Vowels")) return <span className="text-sm font-telugu text-current">అ</span>;
              if (name.includes("Consonants")) return <span className="text-sm font-telugu text-current">క</span>;
              if (name.includes("Words")) return <BookOpen className="w-4 h-4 text-current" />;
              if (name.includes("Numbers")) return <span className="text-sm font-mono font-bold text-current">12</span>;
              if (name.includes("Sentences")) return <BookOpen className="w-4 h-4 text-current" />;
              if (name.includes("Quiz")) return <Zap className="w-4 h-4 text-current" />;
              return <CheckCircle2 className="w-4 h-4 text-current" />;
            };

            const isActive = activeTab === tabName;

            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#14213D] text-white shadow-md"
                    : "text-[#14213D]/70 hover:bg-[#14213D]/5 hover:text-[#14213D]"
                }`}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${
                  isActive ? "bg-white/20" : "bg-[#14213D]/10"
                }`}>
                  {getIcon(tabName)}
                </div>
                <span className="text-sm text-left truncate">{tabName}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-5 border-t border-[#14213D]/10 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${stats.streak > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                <span className="text-xs font-semibold text-[#14213D]/70">Streak</span>
              </div>
              <span className={`font-mono font-bold ${stats.streak > 0 ? "text-amber-600" : "text-[#14213D]/40"}`}>{stats.streak}</span>
            </div>
            <div className="w-px h-8 bg-[#14213D]/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${stats.xp > 0 ? "text-[#C9A227] fill-[#C9A227]" : "text-gray-400"}`} />
                <span className="text-xs font-semibold text-[#14213D]/70">Points</span>
              </div>
              <span className={`font-mono font-bold ${stats.xp > 0 ? "text-[#C9A227]" : "text-[#14213D]/40"}`}>{stats.xp}</span>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#14213D]/10 shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#14213D]/5 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#3F6656]" />
                </div>
                <span className="text-xs font-semibold truncate text-[#14213D]">{user.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

'''
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(before + new_sidebar + after)
    print("Sidebar fixed successfully.")
else:
    print("Could not find markers.")
