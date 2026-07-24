import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, GraduationCap, ArrowRight, BrainCircuit, Globe2, MessageSquare, Quote, Map } from "lucide-react";

export default function EnglishDashboard() {
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
        className="relative overflow-hidden flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#14213D] via-[#1a2f5c] to-[#0f172a] p-8 sm:p-12 text-white shadow-2xl"
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
            <Sparkles className="h-4 w-4" /> English Masterclass
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
            Fluent English
          </h1>
          <p className="max-w-xl font-sans text-base sm:text-lg text-white/70 leading-relaxed mx-auto sm:mx-0">
            Immerse yourself in English through structured paths, grammar mastery, and interactive conversations. What would you like to practice today?
          </p>
        </div>
      </motion.div>

      {/* Main Categories Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {/* Learning Path Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/path")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#14213D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14213D] text-white shadow-inner">
              <Map className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#14213D] group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D]">
              Learning Path
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Follow our structured 100-level roadmap to build your English proficiency step-by-step.
            </p>
          </div>
        </motion.button>

        {/* Sentences Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/sentences")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
              <MessageSquare className="h-7 w-7" />
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
              Learn essential sentences for everyday conversations. Includes Tamil translations with audio.
            </p>
          </div>
        </motion.button>

        {/* Grammar Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/grammar")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-blue-600 transition-colors">
              Grammar Guide
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Master the rules of English syntax, from basic tenses to advanced phrasing.
            </p>
          </div>
        </motion.button>

        {/* Idioms Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/idioms")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-inner">
              <Quote className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-purple-600 transition-colors">
              Native Idioms
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Sound like a native speaker! Learn over 100+ popular English idioms and how to use them.
            </p>
          </div>
        </motion.button>

        {/* Stories Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/story")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-orange-600 transition-colors">
              Reading Practice
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Read engaging short stories to improve your vocabulary and comprehension skills.
            </p>
          </div>
        </motion.button>

        {/* AI Chat Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate("/chat")}
          className="group relative flex flex-col items-start justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#C9A227]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10 flex w-full items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A227]/10 text-[#C9A227] shadow-inner">
              <Globe2 className="h-7 w-7" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-[#C9A227] group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 mt-8 text-left space-y-2">
            <h2 className="font-display text-2xl font-bold text-[#14213D] group-hover:text-[#C9A227] transition-colors">
              AI Conversation
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              Chat with our interactive AI tutor to practice real-life conversational flow.
            </p>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
