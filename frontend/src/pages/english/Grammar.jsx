import { useState, useMemo, useEffect } from "react";
import { grammarData } from "../../data/grammarData";
import { BookA, MessageCircle, Volume2, Languages, Search, GraduationCap, ArrowLeft, Layers, Component, FileText, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CatVoiceCheckpoint from "../../components/catTeacher/CatVoiceCheckpoint";

export default function Grammar() {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(null);
  const [activeSubcategoryIdx, setActiveSubcategoryIdx] = useState(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState(null);
  
  const [visibleTranslations, setVisibleTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [checkpointPhase, setCheckpointPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState(() => {
    return JSON.parse(localStorage.getItem("grammar_cat_completed_phases") || "{}");
  });

  const handleCheckpointComplete = (score, total) => {
    if (checkpointPhase) {
      const updated = { ...completedPhases, [checkpointPhase.phase]: { score, total } };
      setCompletedPhases(updated);
      localStorage.setItem("grammar_cat_completed_phases", JSON.stringify(updated));
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return grammarData;
    
    return grammarData.map((category, cIdx) => {
      const filteredSubcategories = category.subcategories.map((sub, sIdx) => {
        const filteredSections = sub.sections.map((section, secIdx) => {
          const matchingItems = section.items.filter(item => {
            const enMatch = item.english.toLowerCase().includes(searchQuery.toLowerCase());
            const taMatch = item.tamil.includes(searchQuery);
            return enMatch || taMatch;
          });
          return { ...section, items: matchingItems, originalSecIdx: secIdx };
        }).filter(section => section.items.length > 0 || section.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return { ...sub, sections: filteredSections, originalSIdx: sIdx };
      }).filter(sub => sub.sections.length > 0);
      
      return { ...category, subcategories: filteredSubcategories, originalCIdx: cIdx };
    }).filter(category => category.subcategories.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      setActiveCategoryIdx(null);
      setActiveSubcategoryIdx(null);
      setActiveSectionIdx(null);
    }
  }, [searchQuery]);

  const toggleTranslation = (key) => {
    setVisibleTranslations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    if (!visibleTranslations[key]) {
      const currentStats = JSON.parse(localStorage.getItem("grammar_stats") || '{"interactions":0}');
      currentStats.interactions += 1;
      localStorage.setItem("grammar_stats", JSON.stringify(currentStats));
    }
  };

  const playAudio = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderSearchResults = () => {
    return (
      <div className="space-y-6">
        <h3 className="font-heading text-xl font-bold text-white mb-4">Search Results</h3>
        <div className="space-y-6">
          {filteredData.map((category) =>
            category.subcategories.map((sub) =>
              sub.sections.map((section) => {
                const sectionKey = `${category.originalCIdx}-${sub.originalSIdx}-${section.originalSecIdx}`;
                return (
                  <div key={sectionKey} className="space-y-4">
                    <h4 className="font-mono text-xs font-bold text-sky-400 border-b border-white/10 pb-2">
                      {category.category} &gt; {sub.name} &gt; {section.title}
                    </h4>
                    <div className="space-y-4">
                      {section.items.map((item, itemIdx) => {
                        const itemKey = `${sectionKey}-${itemIdx}`;
                        return renderItem(item, itemKey);
                      })}
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    );
  };

  const renderItem = (item, itemKey) => {
    const isTransVisible = visibleTranslations[itemKey];
    
    return (
      <div key={itemKey} className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] shadow-lg transition-all hover:border-white/20 space-y-4">
        <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
          <MessageCircle className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white text-base leading-relaxed">
              {item.english}
            </p>
            {item.tamil && (
              <p className="text-sm text-sky-300 mt-1.5 font-medium leading-relaxed">
                {item.tamil}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => playAudio(item.english)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 transition-all hover:bg-blue-500/20"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Listen
          </button>
          
          <button
            onClick={() => toggleTranslation(itemKey)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              isTransVisible
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            {isTransVisible ? "Hide Explanation" : "Detailed Explanation"}
          </button>
        </div>

        <AnimatePresence>
          {isTransVisible && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl bg-blue-900/20 p-4 border-l-4 border-sky-400">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 mb-1.5">Explanation</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  let headerTitle = "Grammar Mastery";
  let headerDescEn = "Learn English grammar step-by-step. Select a module below to start mastering tenses and syntax rules.";
  let headerDescTa = null;

  if (activeCategoryIdx !== null && filteredData[activeCategoryIdx]) {
    const category = filteredData[activeCategoryIdx];
    headerTitle = category.category;
    if (category.description) {
      headerDescEn = category.description.english;
      headerDescTa = category.description.tamil;
    }
    
    if (activeSubcategoryIdx !== null && category.subcategories[activeSubcategoryIdx]) {
      const subcategory = category.subcategories[activeSubcategoryIdx];
      headerTitle = subcategory.name;
      if (subcategory.description) {
        headerDescEn = subcategory.description.english;
        headerDescTa = subcategory.description.tamil;
      }
    }
  }

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto font-sans text-white">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950 via-[#0f172a] to-[#050816] p-8 sm:p-10 shadow-2xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1 font-mono text-xs font-bold text-sky-300 w-fit">
          <BookA className="h-4 w-4 text-sky-400" /> Core Grammar Guide
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {headerTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
          {headerDescEn}
        </p>
        {headerDescTa && (
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/10 pt-2">
            {headerDescTa}
          </p>
        )}
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for sentences or grammar rules..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-sans text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors shadow-lg"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] rounded-3xl border border-white/10">
            <GraduationCap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No grammar topics found</h3>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search terms.</p>
          </div>
        ) : searchQuery.trim() !== "" ? (
          renderSearchResults()
        ) : (
          <AnimatePresence mode="wait">
            {activeCategoryIdx === null ? (
              // LEVEL 1: CATEGORIES
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filteredData.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategoryIdx(idx)}
                    className="group text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center mb-4">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                        {category.category}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {category.subcategories.length} {category.subcategories.length === 1 ? 'Module' : 'Modules'} available
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : activeSubcategoryIdx === null ? (
              // LEVEL 2: SUBCATEGORIES
              <motion.div
                key="subcategories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveCategoryIdx(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="font-heading text-2xl font-bold text-white">
                    {filteredData[activeCategoryIdx].category}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredData[activeCategoryIdx].subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSubcategoryIdx(idx)}
                      className="group text-left p-6 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                        <Component className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {sub.sections.length} {sub.sections.length === 1 ? 'Part' : 'Parts'} inside
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : activeSectionIdx === null ? (
              // LEVEL 3: SECTIONS
              <motion.div
                key="sections"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveSubcategoryIdx(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs font-mono font-bold text-sky-400 mb-1">
                      {filteredData[activeCategoryIdx].category}
                    </p>
                    <h2 className="font-heading text-2xl font-bold text-white leading-none">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections.map((section, secIdx) => (
                    <button
                      key={secIdx}
                      onClick={() => setActiveSectionIdx(secIdx)}
                      className="group text-left p-5 glass-panel-interactive rounded-3xl border border-white/10 bg-white/[0.03] flex flex-col justify-between overflow-hidden"
                    >
                      <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-sky-400 flex items-center justify-center mb-3">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                        {section.title} {completedPhases[section.title] && <span className="ml-1 text-amber-400">⭐</span>}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2">
                        {section.items.length} Sentences
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              // LEVEL 4: SENTENCES inside a Section
              <motion.div
                key="sentences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveSectionIdx(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs font-mono font-bold text-sky-400 mb-1">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].name}
                    </p>
                    <h2 className="font-heading text-xl font-bold text-white leading-none">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx].title}
                      {completedPhases[filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx].title] && (
                        <span className="ml-2 inline-flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">⭐ Passed</span>
                      )}
                    </h2>
                  </div>
                </div>

                {/* Cat AI Checkpoint Button */}
                <div className="mt-4 mb-6">
                  <button
                    onClick={() => {
                      const section = filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx];
                      setCheckpointPhase({
                        phase: section.title,
                        sentences: section.items
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 p-4 font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01]"
                  >
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    Section Oral Checkpoint with Cat AI Teacher
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx].items.map((item, itemIdx) => {
                    const sectionKey = `${activeCategoryIdx}-${activeSubcategoryIdx}-${activeSectionIdx}`;
                    const itemKey = `${sectionKey}-${itemIdx}`;
                    return renderItem(item, itemKey);
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Checkpoint Modal */}
      <CatVoiceCheckpoint
        isOpen={!!checkpointPhase}
        onClose={() => setCheckpointPhase(null)}
        phaseData={checkpointPhase}
        onComplete={handleCheckpointComplete}
      />
    </div>
  );
}
