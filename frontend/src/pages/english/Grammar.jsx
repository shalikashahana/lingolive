import { useState, useMemo, useEffect } from "react";
import { grammarData } from "../../data/grammarData";
import { BookA, MessageCircle, Volume2, Languages, ChevronDown, ChevronUp, Search, GraduationCap, ArrowLeft, Layers, Component, FileText, Sparkles } from "lucide-react";
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

  // Reset navigation if searching
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

    // Update grammar interactions stat
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

  // Render search results directly
  const renderSearchResults = () => {
    return (
      <div className="space-y-6">
        <h3 className="font-display text-xl font-bold text-[#14213D] mb-4">Search Results</h3>
        <div className="space-y-8">
          {filteredData.map((category) =>
            category.subcategories.map((sub) =>
              sub.sections.map((section) => {
                const sectionKey = `${category.originalCIdx}-${sub.originalSIdx}-${section.originalSecIdx}`;
                return (
                  <div key={sectionKey} className="space-y-4">
                    <h4 className="font-bold text-[#3F6656] border-b border-[#14213D]/10 pb-2">
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

  // Render a single sentence item
  const renderItem = (item, itemKey) => {
    const isTransVisible = visibleTranslations[itemKey];
    
    return (
      <div key={itemKey} className="p-4 sm:p-6 rounded-2xl border border-[#14213D]/10 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-[#F8F6F0]/50 p-4 rounded-xl border border-[#14213D]/5">
            <MessageCircle className="h-5 w-5 text-[#C9A227] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#14213D] text-base leading-relaxed">
                {item.english}
              </p>
              {item.tamil && (
                <p className="text-sm text-[#3F6656] mt-1.5 font-medium leading-relaxed">
                  {item.tamil}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => playAudio(item.english)}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-[#14213D]/10 px-3 py-1.5 text-xs font-semibold text-[#14213D]/70 transition-all hover:bg-[#3F6656]/5 hover:text-[#3F6656] hover:border-[#3F6656]/30 shadow-sm"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Listen
            </button>
            
            <button
              onClick={() => toggleTranslation(itemKey)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                isTransVisible
                  ? "bg-[#3F6656] border-[#3F6656] text-white"
                  : "bg-white border-[#14213D]/10 text-[#14213D]/70 hover:bg-[#3F6656]/5 hover:text-[#3F6656] hover:border-[#3F6656]/30"
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
                <div className="mt-3 rounded-xl bg-[#3F6656]/5 p-4 sm:p-5 border-l-4 border-[#3F6656]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F6656] mb-1.5">Explanation</h4>
                  <p className="text-sm text-[#14213D]/80 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Determine header content based on active state
  let headerTitle = "Grammar Mastery";
  let headerDescEn = "Learn English grammar step-by-step. Select a module below to start mastering tenses and rules.";
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
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Premium Animated Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#3F6656] via-[#2c4a3f] to-[#1a2e26] p-8 sm:p-10 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A227] opacity-20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#14213D] opacity-30 blur-3xl"></div>
        
        <div className="relative z-10 space-y-4 text-center sm:text-left flex flex-col items-center sm:items-start">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#e6c148] backdrop-blur-md"
          >
            <BookA className="h-4 w-4" /> Core Grammar
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            {headerTitle}
          </h1>
          <div className="max-w-xl text-center sm:text-left flex flex-col gap-2">
            <p className="font-sans text-base sm:text-lg text-white/90 leading-relaxed">
              {headerDescEn}
            </p>
            {headerDescTa && (
              <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed border-t border-white/10 pt-2 mt-1">
                {headerDescTa}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#14213D]/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for sentences or rules..."
          className="w-full bg-white/80 backdrop-blur-md border border-[#14213D]/15 rounded-2xl py-4 pl-12 pr-4 font-sans text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3F6656]/50 focus:border-[#3F6656]/50 transition-all text-[#14213D] placeholder:text-[#14213D]/40"
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#14213D]/10">
            <GraduationCap className="h-12 w-12 text-[#14213D]/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#14213D]">No grammar topics found</h3>
            <p className="text-[#14213D]/60 mt-1">Try adjusting your search terms.</p>
          </div>
        ) : searchQuery.trim() !== "" ? (
          renderSearchResults()
        ) : (
          // DRILL DOWN VIEW
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
                    className="group relative flex flex-col items-start p-6 rounded-2xl border border-[#14213D]/10 bg-white/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-[#3F6656]/30 text-left overflow-hidden"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 bg-[#3F6656]/5 rounded-bl-full transition-transform group-hover:scale-110" />
                    <div className="h-12 w-12 rounded-xl bg-[#3F6656]/10 text-[#3F6656] flex items-center justify-center mb-4">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#14213D] mb-2">
                      {category.category}
                    </h3>
                    <p className="text-sm text-[#14213D]/60 font-medium">
                      {category.subcategories.length} {category.subcategories.length === 1 ? 'Module' : 'Modules'} available
                    </p>
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14213D]/10 bg-white text-[#14213D]/60 transition-colors hover:bg-[#14213D]/5 hover:text-[#14213D]"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="font-display text-2xl font-bold text-[#14213D]">
                    {filteredData[activeCategoryIdx].category}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredData[activeCategoryIdx].subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSubcategoryIdx(idx)}
                      className="group relative flex flex-col items-start p-6 rounded-2xl border border-[#14213D]/10 bg-white/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-[#C9A227]/40 text-left overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 h-24 w-24 bg-[#C9A227]/5 rounded-bl-full transition-transform group-hover:scale-110" />
                      <div className="h-10 w-10 rounded-xl bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center mb-3">
                        <Component className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#14213D] mb-1">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-[#14213D]/60 font-medium">
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14213D]/10 bg-white text-[#14213D]/60 transition-colors hover:bg-[#14213D]/5 hover:text-[#14213D]"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#3F6656] mb-1">
                      {filteredData[activeCategoryIdx].category}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#14213D] leading-none">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].name}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections.map((section, secIdx) => (
                    <button
                      key={secIdx}
                      onClick={() => setActiveSectionIdx(secIdx)}
                      className="group relative flex flex-col items-start p-5 rounded-2xl border border-[#14213D]/10 bg-white/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-[#3F6656]/30 text-left overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 h-20 w-20 bg-[#3F6656]/5 rounded-bl-full transition-transform group-hover:scale-110" />
                      <div className="h-8 w-8 rounded-lg bg-[#3F6656]/10 text-[#3F6656] flex items-center justify-center mb-3">
                        <FileText className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-[#14213D] text-sm sm:text-base leading-snug pr-4">
                        {section.title} {completedPhases[section.title] && <span className="ml-1 text-[#C9A227]">⭐</span>}
                      </h3>
                      <p className="text-sm text-[#14213D]/60 font-medium mt-2">
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14213D]/10 bg-white text-[#14213D]/60 transition-colors hover:bg-[#14213D]/5 hover:text-[#14213D]"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C9A227] mb-1">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].name}
                    </p>
                    <h2 className="font-display text-xl font-bold text-[#14213D] leading-none">
                      {filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx].title}
                      {completedPhases[filteredData[activeCategoryIdx].subcategories[activeSubcategoryIdx].sections[activeSectionIdx].title] && (
                        <span className="ml-2 inline-flex items-center text-sm font-bold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">⭐ Passed</span>
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
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#14213D] to-[#1a2f5c] p-4 font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <Sparkles className="h-5 w-5 text-[#C9A227]" />
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
