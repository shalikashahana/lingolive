import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { VOCABULARY_LIST, CEFR_BANDS } from "../../data/mockData";
import {
  Volume2,
  CheckCircle2,
  Bookmark,
  Search,
  Sparkles,
  RotateCw,
  LayoutGrid,
  ListFilter
} from "lucide-react";

export default function Vocabulary() {
  const [vocabList, setVocabList] = useState(VOCABULARY_LIST);
  const [selectedCefr, setSelectedCefr] = useState("A1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const ALPHABET = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  const [activeTab, setActiveTab] = useState("flashcards"); // 'flashcards' | 'list'
  const [flippedCards, setFlippedCards] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLearned() {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/progress/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0 && data[0].user_progress) {
              const allLearned = new Set();
              data[0].user_progress.forEach(p => {
                if (p.vocab_learned_ids) {
                  p.vocab_learned_ids.forEach(id => allLearned.add(id));
                }
              });
              setVocabList(prev => prev.map(v => ({ ...v, learned: allLearned.has(v.id) })));
            }
          }
        } catch (e) {
          console.error("Failed to fetch learned vocab", e);
        }
      }
    }
    fetchLearned();
  }, [user]);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const playAudio = (word) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleLearned = async (id) => {
    const isLearned = vocabList.find(v => v.id === id)?.learned;
    setVocabList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, learned: !v.learned } : v))
    );
    
    if (user) {
      try {
        const token = await user.getIdToken();
        const updatedList = vocabList.map((v) => (v.id === id ? { ...v, learned: !v.learned } : v));
        const newLearnedIds = updatedList.filter(v => v.learned).map(v => v.id);
        
        // Post to a general level, e.g., level 1 for now if we don't have per-level vocab mapping
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/vocabulary/1/learn`, {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ learned_ids: newLearnedIds })
        });
      } catch (e) {
        console.error("Failed to update learned vocab", e);
      }
    }
  };

  const filteredVocab = vocabList.filter((v) => {
    if (selectedCefr !== "ALL" && v.cefr_level !== selectedCefr) return false;
    if (selectedCefr === "A-Z" && selectedLetter !== "ALL") {
      if (!v.word.toLowerCase().startsWith(selectedLetter.toLowerCase())) return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        v.word.toLowerCase().includes(q) ||
        v.definition.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const learnedCount = vocabList.filter((v) => v.learned).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-[#14213D] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/20 px-3 py-1 font-mono text-xs font-bold text-[#C9A227]">
            <Sparkles className="h-3.5 w-3.5" /> 10,000 Word Bank
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Vocabulary Mastery
          </h1>
          <p className="max-w-xl font-sans text-sm text-white/70">
            Expand your intermediate & advanced vocabulary with native IPA pronunciation, definitions, and text-to-speech audio.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-[#C9A227]">{learnedCount}</p>
            <p className="text-[11px] text-white/60">Words Learned</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-white">{vocabList.length}</p>
            <p className="text-[11px] text-white/60">Total Displayed</p>
          </div>
        </div>
      </div>

      {/* Filter and View Toggles Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#14213D]/10 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#14213D]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words or definitions…"
            className="w-full rounded-xl border border-[#14213D]/15 bg-[#F8F6F0] py-2.5 pl-10 pr-4 font-sans text-sm outline-none focus:border-[#3F6656] focus:ring-2 focus:ring-[#3F6656]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* CEFR Level filter */}
          <div className="flex flex-wrap items-center gap-1">
            {["ALL", "A1", "A2", "B1", "B2", "C1", "C2", "A-Z"].map((cefr) => (
              <button
                key={cefr}
                onClick={() => {
                  setSelectedCefr(cefr);
                  if (cefr !== "A-Z") setSelectedLetter("ALL");
                }}
                className={`rounded-xl px-3 py-2 font-mono text-xs font-bold transition ${
                  selectedCefr === cefr
                    ? "bg-[#14213D] text-white"
                    : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
                }`}
              >
                {cefr}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-[#F8F6F0] p-1 border border-[#14213D]/10">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition ${
                activeTab === "flashcards" ? "bg-white text-[#14213D] shadow-sm" : "text-[#14213D]/60"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Flashcards
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition ${
                activeTab === "list" ? "bg-white text-[#14213D] shadow-sm" : "text-[#14213D]/60"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" /> List View
            </button>
          </div>
        </div>
      </div>

      {/* Alphabet Filter (Only shows when A-Z is selected) */}
      {selectedCefr === "A-Z" && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-[#14213D]/10 bg-white p-4 shadow-sm">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                selectedLetter === letter
                  ? "bg-[#C9A227] text-white"
                  : "bg-[#14213D]/5 text-[#14213D]/70 hover:bg-[#14213D]/10"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Vocabulary Display */}
      {activeTab === "flashcards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVocab.map((v) => {
            const isFlipped = flippedCards[v.id];
            const band = CEFR_BANDS[v.cefr_level] || CEFR_BANDS.C1;

            return (
              <div
                key={v.id}
                className="group relative h-64 w-full [perspective:1000px]"
              >
                <div
                  className={`relative h-full w-full rounded-3xl border border-[#14213D]/15 bg-white p-6 shadow-sm transition-all duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* FRONT side */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${band.badgeBg}`}>
                        {v.cefr_level}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLearned(v.id);
                        }}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          v.learned
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-[#14213D]/5 text-[#14213D]/60 hover:bg-[#14213D]/10"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {v.learned ? "Learned" : "Mark Learned"}
                      </button>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="font-display text-2xl font-bold text-[#14213D] capitalize">
                        {v.word}
                      </h3>
                      <p className="font-mono text-xs text-[#14213D]/60">{v.pronunciation_ipa}</p>
                      <span className="inline-block rounded-md bg-[#14213D]/5 px-2 py-0.5 font-sans text-xs italic text-[#14213D]/70">
                        {v.part_of_speech}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#14213D]/10 pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(v.word);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-[#C9A227]/10 px-3 py-1.5 font-sans text-xs font-semibold text-[#8C6D13] hover:bg-[#C9A227]/20"
                      >
                        <Volume2 className="h-4 w-4 text-[#C9A227]" /> Audio
                      </button>

                      <button
                        onClick={() => toggleFlip(v.id)}
                        className="flex items-center gap-1 font-sans text-xs font-semibold text-[#3F6656] hover:underline"
                      >
                        <RotateCw className="h-3.5 w-3.5" /> Flip Card
                      </button>
                    </div>
                  </div>

                  {/* BACK side */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-[#14213D] p-6 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#C9A227]">Definition</span>
                      <button
                        onClick={() => toggleFlip(v.id)}
                        className="text-white/60 hover:text-white"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="font-sans text-sm text-white/90 leading-relaxed">
                        {v.definition}
                      </p>
                      <div className="rounded-xl bg-white/5 p-3 font-sans text-xs text-white/80 italic border border-white/10">
                        "{v.example_sentence}"
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => playAudio(v.example_sentence)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#C9A227] hover:underline"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Listen Example
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List View */
        <div className="space-y-3">
          {filteredVocab.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#14213D]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-lg font-bold text-[#14213D] capitalize">
                    {v.word}
                  </h3>
                  <span className="font-mono text-xs text-[#14213D]/50">{v.pronunciation_ipa}</span>
                  <span className="rounded-full bg-[#14213D]/5 px-2 py-0.5 font-sans text-xs italic text-[#14213D]/70">
                    {v.part_of_speech}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-700">
                    {v.cefr_level}
                  </span>
                </div>
                <p className="font-sans text-sm text-[#14213D]/80">{v.definition}</p>
                <p className="font-sans text-xs text-[#3F6656] italic">"{v.example_sentence}"</p>
              </div>

              <div className="flex items-center gap-2 border-t border-[#14213D]/10 pt-3 sm:border-t-0 sm:pt-0">
                <button
                  onClick={() => playAudio(v.word)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A227]/10 text-[#8C6D13] hover:bg-[#C9A227]/20"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleLearned(v.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    v.learned
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      : "bg-[#14213D] text-white hover:bg-[#14213D]/90"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {v.learned ? "Learned" : "Mark as Learned"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
