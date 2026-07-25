import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, GraduationCap, ArrowRight, BrainCircuit, Globe2 } from "lucide-react";

export default function GenericLanding({ languageName, path }) {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16 pt-4">
      {/* Premium Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#1a2f5c] via-[#2a437a] to-[#14213D] p-8 sm:p-12 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A227] opacity-20 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10 space-y-4 text-center sm:text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-1.5 font-mono text-xs font-bold text-[#e6c148] backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4" /> {languageName} Journey
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
            Learn {languageName} Fast
          </h1>
          <p className="max-w-xl font-sans text-base sm:text-lg text-white/70 leading-relaxed mx-auto sm:mx-0">
            Master the language with our structured lessons and interactive quizzes. What would you like to practice today?
          </p>
        </div>
      </motion.div>

      {/* Main Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {/* Dashboard Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(path)}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-emerald-600 transition-colors">
              Daily Sentences
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Learn essential {languageName} sentences for everyday conversations. Includes translations with audio.
            </p>
          </div>
        </motion.button>

        {/* Quiz Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(path + "?tab=quiz")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#C9A227]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A227]/10 text-[#C9A227] shadow-inner">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#C9A227] group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-[#C9A227] transition-colors">
              Interactive Quiz
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Test your knowledge with progressive levels. Master vocabulary and grammar through smart challenges.
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Upcoming Features Section (Optional extra polish) */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="rounded-3xl border border-gray-100 bg-gray-50/50 p-8 text-center mt-12"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <BrainCircuit className="h-6 w-6 text-gray-400" />
          <Globe2 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-sans text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">COMING SOON</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          We're working on adding advanced Grammar lessons and interactive Story modes for {languageName}. Stay tuned!
        </p>
      </motion.div>
    </div>
  );
}
