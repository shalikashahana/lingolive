import re

# 1. Update ArabicDashboard.jsx
with open('src/pages/arabic/ArabicDashboard.jsx', 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

dashboard_content = re.sub(
    r'function InteractiveQuizCard.*?return \(\n\s*<div.*?\n}\n\nexport default function ArabicDashboard',
    'export default function ArabicDashboard',
    dashboard_content,
    flags=re.DOTALL
)

quiz_block_regex = r'\{activeTab === "Quiz" && \(\s*<div className="space-y-6">.*?</div>\s*\)\}'
if re.search(quiz_block_regex, dashboard_content, re.DOTALL):
    dashboard_content = re.sub(
        quiz_block_regex,
        '{activeTab === "Quiz" && (\n              <ArabicQuiz onExit={() => setActiveTab("Home")} />\n            )}',
        dashboard_content,
        flags=re.DOTALL
    )

if 'import ArabicQuiz from "./ArabicQuiz";' not in dashboard_content:
    dashboard_content = dashboard_content.replace(
        'import arabicQuizData from "../../data/arabicQuizData.json";',
        'import arabicQuizData from "../../data/arabicQuizData.json";\nimport ArabicQuiz from "./ArabicQuiz";'
    )

with open('src/pages/arabic/ArabicDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(dashboard_content)

# 2. Update ArabicQuiz.jsx
with open('src/pages/arabic/ArabicQuiz.jsx', 'r', encoding='utf-8') as f:
    quiz_content = f.read()

# Fix the flatQuizData definition (handle new array format vs old format)
quiz_content = re.sub(
    r'const flatQuizData = arabicQuizData\.modules\.flatMap\(m => m\.quiz\);',
    r'const flatQuizData = Array.isArray(arabicQuizData) ? arabicQuizData : (arabicQuizData.modules ? arabicQuizData.modules.flatMap(m => m.quiz) : []);',
    quiz_content
)

# Fix the question rendering
quiz_content = re.sub(
    r'\{currentQ\.type === \'fitb\' \? \(.*?\n\s*\) \: currentQ\.type === \'mcq\' \? \(.*?\n\s*\) \: \(.*?\n\s*\)\}',
    '''{(() => {
              const qEn = currentQ.question_en || currentQ.question_english || currentQ.en;
              const qTa = currentQ.question_ta || currentQ.question_tamil || currentQ.ta;
              return (
                <h2 className="font-display text-2xl font-bold text-[#14213D]">
                  What is the Arabic word for <span className="text-[#C9A227]">"{qEn}"</span> ({qTa})?
                </h2>
              );
            })()}''',
    quiz_content,
    flags=re.DOTALL
)

# Fix the options mapping
quiz_content = re.sub(
    r'const isCorrect = opt\.ans;.*?<span className="font-bold font-telugu text-\[22px\]">\{opt\.te\}</span>.*?<span className="text-xs opacity-70 font-mono mt-1">\{opt\.tr\}</span>',
    '''const val = opt.text || opt.arabic;
              const transliteration = opt.transliteration;
              const meaning = opt.meaning;
              const isCorrect = val === currentQ.correct_answer || opt.ans;

              let btnStyle = "border-[#14213D]/15 bg-white text-[#14213D] hover:bg-[#F8F6F0]";
              if (isAnswered) {
                if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                else if (isSelected) btnStyle = "border-red-500 bg-red-50 text-red-900";
                else btnStyle = "border-[#14213D]/10 opacity-50";
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleMCQSubmit(idx, isCorrect, val)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 font-sans text-lg text-left transition ${btnStyle}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold font-arabic text-[22px]" dir="rtl">{val}</span>
                    {transliteration && <span className="text-xs opacity-70 font-mono mt-1">{transliteration}</span>}
                    {meaning && <span className="text-xs opacity-70 font-mono mt-1">{meaning}</span>}
                  </div>''',
    quiz_content,
    flags=re.DOTALL
)

# Also fix the modules generation in ArabicQuiz to strictly show exactly 1 Module with exactly 10 Levels if we only have 100 questions.
# But dynamically doing it based on totalLevels is better.
quiz_content = re.sub(
    r'const levelsPerModule = 40;',
    r'const levelsPerModule = 10;',
    quiz_content
)

with open('src/pages/arabic/ArabicQuiz.jsx', 'w', encoding='utf-8') as f:
    f.write(quiz_content)

print("Done")
