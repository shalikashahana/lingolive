import re

with open('src/pages/arabic/ArabicDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'import arabicQuizData from "../../data/arabicQuizData.json";' not in content:
    content = content.replace(
        'import arabicSentencesData from "../../data/arabicSentencesData.json";',
        'import arabicSentencesData from "../../data/arabicSentencesData.json";\nimport arabicQuizData from "../../data/arabicQuizData.json";'
    )

# 2. Add InteractiveQuizCard
if 'function InteractiveQuizCard(' not in content:
    card_code = """
function InteractiveQuizCard({ question, index, isCompleted, isInProgress, isLocked, onInteract, playAudio }) {
  const [selectedOpt, setSelectedOpt] = React.useState(null);

  const handleSelect = (optKey) => {
    if (isLocked || selectedOpt) return;
    setSelectedOpt(optKey);
    const textToPlay = question.options.find(o => o.text === optKey || o.arabic === optKey)?.text || optKey;
    playAudio(textToPlay);
    if (optKey === question.correct_answer) {
       setTimeout(() => {
         onInteract();
       }, 500);
    }
  };

  const questionEn = question.question_en || question.question_english;
  const questionTa = question.question_ta || question.question_tamil;

  return (
    <div className={`group relative flex flex-col p-5 bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden h-full ${
      isCompleted ? "border-emerald-500/30 bg-emerald-50/30" : 
      isInProgress ? "border-[#8b5cf6]/50 ring-2 ring-[#8b5cf6]/30 bg-purple-50/30" :
      "border-[#14213D]/10 opacity-70"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {isInProgress && <Play className="w-4 h-4 text-[#8b5cf6] animate-pulse" />}
          {isLocked && <Lock className="w-4 h-4 text-[#14213D]/40" />}
        </div>
      </div>

      <div className="flex-1 mb-4">
        <span className="text-[18px] font-bold font-sans leading-[1.4] tracking-wide text-[#14213D] mb-2 pr-2 flex items-start gap-2 break-words">
          <span className="mt-1 flex-shrink-0 bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#6d28d9] px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-sm">
            {question.q_no || question.id || index + 1}.
          </span>
          <span className={isLocked ? "blur-[2px] opacity-70" : ""}>{questionEn}</span>
        </span>
        <div className={`flex flex-wrap gap-2 mb-2 ${isLocked ? "opacity-50" : ""}`}>
          <span className="font-mono text-[11px] font-medium bg-[#14213D]/5 border border-[#14213D]/10 text-[#14213D]/70 px-2.5 py-1 rounded-lg">
            {questionTa}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto border-t border-[#14213D]/5 pt-4">
        {(question.options || []).map((opt, i) => {
           const val = opt.text || opt.arabic;
           const transliteration = opt.transliteration;
           let btnClass = "bg-white border-[#14213D]/10 hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 text-[#14213D]";
           
           if (selectedOpt) {
              if (val === question.correct_answer) {
                 btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold";
              } else if (val === selectedOpt) {
                 btnClass = "bg-red-50 border-red-500 text-red-700";
              } else {
                 btnClass = "bg-white border-[#14213D]/10 opacity-50";
              }
           } else if (isCompleted && val === question.correct_answer) {
               btnClass = "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold opacity-70";
           }

           return (
             <button 
               key={i} 
               disabled={isLocked || selectedOpt !== null || isCompleted}
               onClick={() => handleSelect(val)}
               className={`text-left px-4 py-2.5 border rounded-xl text-sm transition-all shadow-sm flex flex-col ${btnClass} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               <span className="font-bold text-lg">{val}</span>
               {transliteration && <span className="text-xs opacity-70">{transliteration}</span>}
               {opt.meaning && <span className="text-xs opacity-70">{opt.meaning}</span>}
             </button>
           );
        })}
      </div>
    </div>
  );
}
"""
    content = content.replace(
        'export default function ArabicDashboard() {',
        card_code + '\nexport default function ArabicDashboard() {'
    )

# 3. Add to TABS
content = re.sub(
    r'(const TABS = \[\s*"Home",\s*"Alphabets \(അക്ഷരമാല\)",\s*"Essential Words",\s*"Numbers",\s*"Sentences")',
    r'\1,\n    "Quiz"',
    content
)

# 4. Add progress state
content = re.sub(
    r'(sentences: 0)(\n\s*})',
    r'\1,\n    quiz: 0\2',
    content
)
content = re.sub(
    r'(const defaultProgress = \{ letters: 0, words: 0, numbers: 0, sentences: 0) (};)',
    r'\1, quiz: 0 \2',
    content
)

# 5. Add views
if 'const [activeQuizModuleView, setActiveQuizModuleView]' not in content:
    content = content.replace(
        'const [activeSentencePartView, setActiveSentencePartView] = useState(null);',
        'const [activeSentencePartView, setActiveSentencePartView] = useState(null);\n  const [activeQuizModuleView, setActiveQuizModuleView] = useState(null);\n  const [activeQuizPartView, setActiveQuizPartView] = useState(null);'
    )

# 6. Add dashboardCard
content = re.sub(
    r'({ key: "sentences", label: "Sentences", tab: "Sentences", icon: "💬", total: arabicSentencesData\?\.total_sentences \|\| 0, color: "#f59e0b", bg: "bg-orange-50", border: "border-orange-200" })(\n\s*\];)',
    r'\1,\n    { key: "quiz", label: "Quiz", tab: "Quiz", icon: "🧠", total: 100, color: "#8b5cf6", bg: "bg-purple-50", border: "border-purple-200" }\2',
    content
)

# 7. Add rendering block
quiz_render_block = """
            {activeTab === "Quiz" && (
              <div className="space-y-6">
                {activeQuizModuleView === null ? (
                  <div className="space-y-4 pt-4">
                    <h3 className="font-display text-xl font-bold text-[#14213D] flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#8b5cf6]" /> 100 Quiz Questions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => setActiveQuizModuleView(1)}
                          className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 border-[#C9A227] bg-[#C9A227]/10 shadow-lg"
                        >
                          <BookOpen className="w-8 h-8 mb-3 text-[#C9A227]" />
                          <span className="font-display text-lg font-bold text-[#14213D]">Module 1</span>
                          <div className="mt-4">
                            <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/20 px-3 py-1 rounded-full">10 Parts (100 Qs)</span>
                          </div>
                        </button>
                    </div>
                  </div>
                ) : activeQuizPartView === null ? (
                  <div className="space-y-6 pt-4">
                    <button 
                      onClick={() => setActiveQuizModuleView(null)}
                      className="flex items-center gap-2 text-sm font-bold text-[#14213D]/60 hover:text-[#14213D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10 w-fit"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
                    </button>
                    
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#8b5cf6]" /> Module 1
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const startIdx = i * 10;
                        const endIdx = startIdx + 10;
                        const partName = `Part ${i + 1} (${startIdx + 1}-${endIdx})`;
                        
                        const partGlobalStartIdx = startIdx;
                        const partGlobalEndIdx = endIdx - 1;
                        
                        const isLocked = progress.quiz < partGlobalStartIdx;
                        const isCompleted = progress.quiz > partGlobalEndIdx;
                        const isInProgress = !isLocked && !isCompleted;
                        
                        return (
                          <button
                            key={partName}
                            disabled={isLocked}
                            onClick={() => setActiveQuizPartView(i)}
                            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                              isLocked 
                                ? "border-[#14213D]/10 bg-gray-50/60 opacity-70 cursor-not-allowed" 
                                : isInProgress
                                ? "border-[#C9A227] bg-[#C9A227]/10 shadow-lg"
                                : "border-emerald-500/30 bg-emerald-50/50 hover:shadow-md"
                            }`}
                          >
                            <BookOpen className={`w-8 h-8 mb-3 ${isLocked ? "text-gray-400" : isInProgress ? "text-[#C9A227]" : "text-emerald-500"}`} />
                            <span className={`font-display text-lg font-bold ${isLocked ? "text-gray-500" : "text-[#14213D]"}`}>{partName}</span>
                            <div className="mt-3">
                              {isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : 
                               isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                               <span className="text-xs font-bold text-[#C9A227] bg-[#C9A227]/20 px-3 py-1 rounded-full">In Progress</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4">
                    <button 
                      onClick={() => setActiveQuizPartView(null)}
                      className="flex items-center gap-2 text-sm font-bold text-[#14213D]/60 hover:text-[#14213D] transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#14213D]/10 w-fit"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to Parts
                    </button>
                    
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-bold text-[#14213D] flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#8b5cf6]" /> Module 1 - Part {activeQuizPartView + 1}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(Array.isArray(arabicQuizData) ? arabicQuizData : (arabicQuizData.modules.find(m => m.module === 1)?.quiz || [])).slice(activeQuizPartView * 10, (activeQuizPartView + 1) * 10).map((q, relIdx) => {
                         const globalIdx = (activeQuizPartView * 10) + relIdx;
                         const isCompleted = globalIdx < progress.quiz;
                         const isInProgress = globalIdx === progress.quiz;
                         const isLocked = globalIdx > progress.quiz;
                         
                         return (
                           <InteractiveQuizCard 
                             key={globalIdx} 
                             question={q} 
                             index={globalIdx}
                             isCompleted={isCompleted}
                             isInProgress={isInProgress}
                             isLocked={isLocked}
                             onInteract={() => handleInteraction('quiz', globalIdx, q.question_en || q.question_english)} 
                             playAudio={playAudio}
                           />
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
"""

if '{activeTab === "Quiz"' not in content:
    content = content.replace(
        '          </div>\n        </div>\n      </main>',
        quiz_render_block + '\n          </div>\n        </div>\n      </main>'
    )

with open('src/pages/arabic/ArabicDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
