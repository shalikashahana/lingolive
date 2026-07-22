import { useState, useEffect } from "react";
import { Video, PlayCircle, CheckCircle2 } from "lucide-react";

const VIDEO_DATA = [
  {
    id: "video-1",
    title: "Introduction Lesson",
    description: "Start your language journey here.",
    level: "A1",
    src: "https://www.youtube.com/embed/yKYVBIYhwDw?si=VYOYPOVf0TbK4bRO"
  },
  {
    id: "video-2",
    title: "Advanced Lesson",
    description: "Take your skills to the next level.",
    level: "A1",
    src: "https://www.youtube.com/embed/aNYEtGxjGVc?si=Lfak5yc4K_lRLcUJ"
  }
];

export default function Videos() {
  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = localStorage.getItem("lingolive_watched_videos");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("lingolive_watched_videos", JSON.stringify(watchedVideos));
  }, [watchedVideos]);

  const toggleWatched = (id) => {
    setWatchedVideos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex flex-col min-h-[80vh] px-4 py-8 sm:px-6">
      
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#14213D] text-[#C9A227] rounded-xl shadow-md">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-[#14213D]">
              Video Lessons
            </h1>
            <p className="text-sm font-medium text-[#14213D]/60 mt-1">
              Learn through immersive YouTube lessons
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grouped by Level */}
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {Object.entries(
          VIDEO_DATA.reduce((acc, video) => {
            const level = video.level || "Other";
            if (!acc[level]) acc[level] = [];
            acc[level].push(video);
            return acc;
          }, {})
        ).map(([level, videos]) => (
          <div key={level}>
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-[#14213D] font-display">
                {level} Level
              </h2>
              <div className="h-px flex-1 bg-[#14213D]/10"></div>
            </div>
            
            {/* Videos Grid for this Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {videos.map((video) => {
                const isWatched = !!watchedVideos[video.id];
                
                return (
                  <div 
                    key={video.id} 
                    className={`bg-white rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-300 hover:-translate-y-1 ${isWatched ? "hover:shadow-[0_8px_40px_rgba(63,102,86,0.12)] border-[#3F6656]/20 bg-[#3F6656]/[0.02]" : "hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] border-[#14213D]/5"}`}
                  >
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center border border-[#14213D]/10">
                      <iframe 
                        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isWatched ? 'opacity-80' : 'opacity-100'}`}
                        src={video.src}
                        title={video.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      ></iframe>
                      {isWatched && (
                        <div className="absolute top-3 right-3 bg-[#3F6656] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm bg-opacity-90 z-10 pointer-events-none">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Watched
                        </div>
                      )}
                    </div>
                    <div className="px-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#14213D] leading-tight mb-1">
                            {video.title}
                          </h3>
                          <p className="text-sm text-[#14213D]/60 font-medium">
                            {video.description}
                          </p>
                        </div>
                        <button 
                          onClick={() => toggleWatched(video.id)}
                          title={isWatched ? "Mark as unread" : "Mark as watched"}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                            isWatched 
                              ? "bg-[#3F6656]/10 text-[#3F6656] hover:bg-[#3F6656]/20 shadow-sm" 
                              : "bg-[#14213D]/5 text-[#14213D] hover:bg-[#14213D] hover:text-[#C9A227]"
                          }`}
                        >
                          {isWatched ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
