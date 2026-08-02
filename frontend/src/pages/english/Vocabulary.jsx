import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { VOCABULARY_LIST, CEFR_BANDS } from "../../data/mockData";
import {
  Volume2,
  CheckCircle2,
  Search,
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
  const [activeTab, setActiveTab] = useState("flashcards");
  const [flippedCards, setFlippedCards] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    async function fetchLearned() {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/progress/me`, {
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
    setVocabList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, learned: !v.learned } : v))
    );
    
    if (user) {
      try {
        const token = await user.getIdToken();
        const updatedList = vocabList.map((v) => (v.id === id ? { ...v, learned: !v.learned } : v));
        const newLearnedIds = updatedList.filter(v => v.learned).map(v => v.id);
        
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/vocabulary/1/learn`, {
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
    if (selectedCefr !== "ALL" && selectedCefr !== "A-Z" && v.cefr_level !== selectedCefr) return false;
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 font-sans text-white">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 shadow-2xl">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Vocabulary Masterclass
        </h1>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          Master 200+ essential CEFR words with 3D interactive flashcards, speech audio, and definitions.
        </p>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words or definitions..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
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
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cefr}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-2xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-sans text-xs font-semibold transition ${
                activeTab === "flashcards" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-sans text-xs font-semibold transition ${
                activeTab === "list" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" /> List
            </button>
          </div>
        </div>
      </div>

      {/* Alphabet Filter */}
      {selectedCefr === "A-Z" && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-sm">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                selectedLetter === letter
                  ? "bg-sky-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
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

            return (
              <div
                key={v.id}
                className="group relative h-64 w-full [perspective:1000px]"
              >
                <div
                  className={`relative h-full w-full rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-xl transition-all duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* FRONT side */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full px-2.5 py-0.5 font-mono text-xs font-bold bg-blue-500/20 text-sky-300 border border-blue-500/30">
                        {v.cefr_level}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLearned(v.id);
                        }}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          v.learned
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {v.learned ? "Learned" : "Mark Learned"}
                      </button>
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="font-heading text-2xl font-bold text-white capitalize">
                        {v.word}
                      </h3>
                      <p className="font-mono text-xs text-slate-400">{v.pronunciation_ipa}</p>
                      <span className="inline-block rounded-lg bg-white/5 px-2.5 py-0.5 font-sans text-xs italic text-sky-400 border border-white/5">
                        {v.part_of_speech}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(v.word);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 font-sans text-xs font-semibold text-sky-300 border border-blue-500/20 hover:bg-blue-500/20"
                      >
                        <Volume2 className="h-4 w-4 text-sky-400" /> Audio
                      </button>

                      <button
                        onClick={() => toggleFlip(v.id)}
                        className="flex items-center gap-1 font-sans text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-sky-400" /> Flip Card
                      </button>
                    </div>
                  </div>

                  {/* BACK side */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-[#050816] p-6 text-white border border-sky-400/20 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-400">Definition</span>
                      <button
                        onClick={() => toggleFlip(v.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="font-sans text-sm text-slate-200 leading-relaxed">
                        {v.definition}
                      </p>
                      <div className="rounded-xl bg-white/5 p-3 font-sans text-xs text-sky-200 italic border border-white/10">
                        "{v.example_sentence}"
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        onClick={() => playAudio(v.example_sentence)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-sky-400 hover:underline"
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
        /* List View */
        <div className="space-y-3">
          {filteredVocab.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-lg font-bold text-white capitalize">
                    {v.word}
                  </h3>
                  <span className="font-mono text-xs text-slate-500">{v.pronunciation_ipa}</span>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 font-sans text-xs italic text-sky-400">
                    {v.part_of_speech}
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-sky-300 border border-blue-500/30">
                    {v.cefr_level}
                  </span>
                </div>
                <p className="font-sans text-sm text-slate-300">{v.definition}</p>
                <p className="font-sans text-xs text-sky-300 italic">"{v.example_sentence}"</p>
              </div>

              <div className="flex items-center gap-2 border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                <button
                  onClick={() => playAudio(v.word)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-sky-400 hover:bg-blue-500/20 border border-blue-500/20"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleLearned(v.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    v.learned
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/30"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {v.learned ? "Learned" : "Mark Learned"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
