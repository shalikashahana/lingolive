import re

file_path = r'c:\Users\shalika shahana\OneDrive\Documents\mozhify\frontend\src\pages\TeluguSentences.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_return = False

for i, line in enumerate(lines):
    if line.strip() == 'return (':
        in_return = True
        break
    new_lines.append(line)

new_return_block = '''  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
                className={w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 }
              >
                <div className={lex items-center justify-center w-7 h-7 rounded-lg }>
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
                <Flame className={w-4 h-4 } />
                <span className="text-xs font-semibold text-[#14213D]/70">Streak</span>
              </div>
              <span className={ont-mono font-bold }>{stats.streak}</span>
            </div>
            <div className="w-px h-8 bg-[#14213D]/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <Zap className={w-4 h-4 } />
                <span className="text-xs font-semibold text-[#14213D]/70">Points</span>
              </div>
              <span className={ont-mono font-bold }>{stats.xp}</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-16">
'''

# We need to extract the "Hero Level Banner" (lines 238-302) and "Content Area Grid" (lines 326-654)
hero_banner = ""
content_grid = ""

in_hero = False
in_content = False

for line in lines:
    if "{/* Hero Level Banner */}" in line:
        in_hero = True
    if "{/* Filter & Categories Bar */}" in line:
        in_hero = False
    if "{/* Content Area Grid */}" in line:
        in_content = True
        
    if in_hero:
        hero_banner += line
    if in_content:
        content_grid += line

new_file_content = "".join(new_lines) + new_return_block + hero_banner + content_grid[:-2] + "      </main>\n    </div>\n  );\n}\n"

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_file_content)

print("Done replacing layout!")
