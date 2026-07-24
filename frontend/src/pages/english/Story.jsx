import { useState, useEffect } from "react";
import { storyPages } from "../../data/storyData";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export default function Story() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = storyPages.length;

  // Handle keyboard navigation
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
      
      // Update story read stat if reaching the last page
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

  // Helper to safely render text with paragraphs
  const renderText = (text) => {
    return text.split('\n\n').map((paragraph, idx) => (
      <p key={idx} className="mb-4 leading-relaxed text-gray-800">
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#14213D] text-[#C9A227] rounded-xl shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#14213D]">
            The Dusty Corner
          </h1>
        </div>
        <div className="text-sm font-medium text-[#14213D]/70 bg-white px-4 py-2 rounded-full shadow-sm border border-[#14213D]/10">
          Page {currentPage + 1} of {totalPages}
        </div>
      </div>

      {/* Book Container */}
      <div className="w-full max-w-4xl bg-[#FCFAF5] rounded-l-md rounded-r-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1),_inset_10px_0_20px_rgba(0,0,0,0.05)] border-y border-r border-[#14213D]/10 relative overflow-hidden transition-all duration-500 min-h-[60vh] flex flex-col">
        
        {/* Book Binding effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#e3dac3] to-transparent border-r border-[#14213D]/5 z-10 pointer-events-none"></div>

        {/* Content Area */}
        <div className="flex-grow p-8 sm:p-12 md:p-16 pl-12 sm:pl-16 font-serif text-lg md:text-xl transition-opacity duration-300">
          {renderText(currentText)}
        </div>

        {/* Pagination Controls */}
        <div className="mt-auto px-8 py-6 border-t border-[#14213D]/5 flex items-center justify-between bg-white/50 backdrop-blur-sm z-20">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-[#14213D]/5 active:bg-[#14213D]/10 text-[#14213D]"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex gap-2">
            {/* Page Indicators (show a few around current) */}
            {[...Array(totalPages)].map((_, idx) => {
              // Show only relevant dots (first, last, and around current)
              if (
                idx === 0 || 
                idx === totalPages - 1 || 
                (idx >= currentPage - 2 && idx <= currentPage + 2)
              ) {
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentPage === idx 
                        ? 'bg-[#C9A227] w-6' 
                        : 'bg-[#14213D]/20 hover:bg-[#14213D]/40'
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                );
              }
              // Show ellipsis if there's a gap
              if (
                (idx === 1 && currentPage > 3) || 
                (idx === totalPages - 2 && currentPage < totalPages - 4)
              ) {
                return <span key={idx} className="text-[#14213D]/40 text-xs flex items-center">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-[#14213D] text-white hover:bg-[#14213D]/90 active:bg-black shadow-md hover:shadow-lg"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Help text */}
      <p className="mt-6 text-sm text-[#14213D]/50 font-medium flex items-center gap-2">
        <span className="hidden sm:inline">Use arrow keys to navigate pages</span>
        <span className="sm:hidden">Swipe or use buttons to navigate</span>
      </p>

    </div>
  );
}
