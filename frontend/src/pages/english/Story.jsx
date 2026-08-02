import { useState, useEffect } from "react";
import { storyPages } from "../../data/storyData";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Story() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = storyPages.length;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      
      if (currentPage === totalPages - 2) {
        const currentStats = JSON.parse(localStorage.getItem("story_stats") || '{"read":0}');
        currentStats.read += 1;
        localStorage.setItem("story_stats", JSON.stringify(currentStats));
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const currentText = storyPages[currentPage];

  const renderText = (text) => {
    return text.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="mb-6 leading-relaxed text-slate-200 text-base sm:text-lg">
        {paragraph.split('\n').map((line, lineIdx) => (
          <span key={lineIdx}>
            {line}
            <br />
          </span>
        ))}
      </p>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 sm:px-6 font-sans text-white">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-sky-400 rounded-2xl border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-sky-400 uppercase tracking-widest block">Short Story Library</span>
            <h1 className="text-2xl font-bold font-heading text-white">
              The Dusty Corner
            </h1>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-sky-300 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 shadow-lg">
          Page {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* Book Container */}
      <div className="w-full max-w-4xl glass-card rounded-3xl border border-white/10 bg-[#0f172a]/90 shadow-2xl relative overflow-hidden transition-all duration-500 min-h-[55vh] flex flex-col justify-between p-8 sm:p-12">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
          >
            {renderText(currentText)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              currentPage === 0
                ? "opacity-30 cursor-not-allowed bg-white/5 text-slate-500"
                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Page</span>
          </button>

          {/* Page Indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {storyPages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentPage === idx ? "w-6 bg-sky-400" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              currentPage === totalPages - 1
                ? "opacity-30 cursor-not-allowed bg-white/5 text-slate-500"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
            }`}
          >
            <span>Next Page</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
