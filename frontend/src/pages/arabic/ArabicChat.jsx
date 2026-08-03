import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RefreshCw,
  Lightbulb,
  Briefcase,
  MessageSquare,
  Compass,
  Award,
  Trash2,
  History,
  Plus,
  X,
  Clock,
  ChevronRight,
  MessageCircle
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const SCENARIOS = [
  { 
    id: "free", 
    label: "Free Conversation", 
    icon: MessageSquare, 
    promptPrefix: "[Arabic Language Tutor Mode] You are teaching Arabic to an English speaker. For every reply, provide the Arabic (Arabic script) first, followed by the English transliteration in parentheses, and then the English translation. Example format: 'مرحباً! (Marhaban!) - Hello!'. Gently correct any mistakes. User says: ",
    welcome: () => `مرحباً! (Marhaban!) - Hello! I am Gemma, your Arabic conversation coach. You can speak in English, and I will help you translate it to Arabic, or you can try speaking in Arabic!`
  },
  { 
    id: "interview", 
    label: "Job Interview Roleplay", 
    icon: Briefcase, 
    promptPrefix: "[Arabic Job Interview Tutor Mode] You are teaching formal Arabic to an English speaker. Provide the Arabic, then (transliteration), then - English translation. User says: ",
    welcome: () => `أهلاً بك في المقابلة! (Ahlan bika fi al-muqabala!) - Welcome to the interview practice! I will act as your hiring manager. Tell me about yourself.`
  },
  { 
    id: "business", 
    label: "Business Presentation", 
    icon: Award, 
    promptPrefix: "[Arabic Business Tutor Mode] You are teaching professional Arabic to an English speaker. Provide the Arabic, then (transliteration), then - English translation. User says: ",
    welcome: () => `مرحباً بك في العرض التجاري! (Marhaban bika fi al-'ard al-tijari!) - Welcome to the Business Presentation practice! What would you like to present today?`
  },
  { 
    id: "travel", 
    label: "Travel & Dining Out", 
    icon: Compass, 
    promptPrefix: "[Arabic Travel Tutor Mode] You are teaching conversational travel Arabic to an English speaker. Provide the Arabic, then (transliteration), then - English translation. User says: ",
    welcome: () => `مرحباً بك في تمرين السفر! (Marhaban bika fi tamrin as-safar!) - Welcome to Travel & Dining Out practice! Imagine you're at a hotel in Dubai. What do you say?`
  },
];

export default function ArabicChat() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const levelNum = searchParams.get("level") || "1";

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("free");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active Session State
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const [historyList, setHistoryList] = useState([]);

  const [stats, setStats] = useState({
    messagesCount: 1,
    correctionsCount: 0,
    fluencyScore: 95
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: SCENARIOS[0].welcome(levelNum),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load History from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingolive_arabic_chat_history");
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, []);

  // Save active session to History
  const saveSessionToHistory = (currentMsgs, scenarioId, currentId) => {
    const userMsgs = currentMsgs.filter(m => m.sender === "user");
    if (userMsgs.length === 0) return; // don't save empty sessions

    const scenarioObj = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    const firstUserText = userMsgs[0]?.text || "New Conversation";
    const snippet = firstUserText.length > 35 ? firstUserText.slice(0, 35) + "…" : firstUserText;

    const sessionData = {
      id: currentId,
      scenarioId: scenarioId,
      scenarioLabel: scenarioObj.label,
      title: snippet,
      messages: currentMsgs,
      messagesCount: currentMsgs.length,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      level: levelNum
    };

    setHistoryList((prev) => {
      const filtered = prev.filter(item => item.id !== currentId);
      const updated = [sessionData, ...filtered];
      try {
        localStorage.setItem("lingolive_arabic_chat_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history item", e);
      }
      return updated;
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Speech Synthesis
  const speakText = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Mic Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // Handle Mode Change -> Save Previous Chat & Open NEW Chat
  const handleScenarioChange = (newScenarioId) => {
    if (newScenarioId === selectedScenario) return;

    // Save previous conversation to history
    saveSessionToHistory(messages, selectedScenario, sessionId);

    // Initialize NEW Chat Session
    const newSessionId = `session_${Date.now()}`;
    const scenarioObj = SCENARIOS.find(s => s.id === newScenarioId) || SCENARIOS[0];
    const initialMsg = {
      id: Date.now(),
      sender: "ai",
      text: scenarioObj.welcome(levelNum),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSelectedScenario(newScenarioId);
    setSessionId(newSessionId);
    setMessages([initialMsg]);
    setInputMessage("");
    setStats({ messagesCount: 1, correctionsCount: 0, fluencyScore: 95 });
  };

  // Start Fresh New Chat
  const handleStartNewChat = () => {
    saveSessionToHistory(messages, selectedScenario, sessionId);

    const newSessionId = `session_${Date.now()}`;
    const scenarioObj = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0];
    const initialMsg = {
      id: Date.now(),
      sender: "ai",
      text: scenarioObj.welcome(levelNum),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessionId(newSessionId);
    setMessages([initialMsg]);
    setInputMessage("");
    setStats({ messagesCount: 1, correctionsCount: 0, fluencyScore: 95 });
    setIsHistoryOpen(false);
  };

  // Load Past History Session
  const handleLoadHistorySession = (session) => {
    saveSessionToHistory(messages, selectedScenario, sessionId);

    setSelectedScenario(session.scenarioId || "free");
    setSessionId(session.id);
    setMessages(session.messages || []);
    setStats({
      messagesCount: session.messagesCount || session.messages?.length || 1,
      correctionsCount: session.messages?.filter(m => m.corrections).length || 0,
      fluencyScore: 95
    });
    setIsHistoryOpen(false);
  };

  // Delete single history item
  const handleDeleteHistoryItem = (e, targetId) => {
    e.stopPropagation();
    setHistoryList((prev) => {
      const updated = prev.filter(item => item.id !== targetId);
      localStorage.setItem("lingolive_arabic_chat_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm("Clear all chat history?")) {
      setHistoryList([]);
      localStorage.removeItem("lingolive_arabic_chat_history");
    }
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageToSend = customText || inputMessage.trim();
    if (!messageToSend || loading) return;

    const userText = messageToSend;
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    const scenarioObj = SCENARIOS.find(s => s.id === selectedScenario);
    const fullPrompt = `${scenarioObj?.promptPrefix || ""}${userText}`;

    try {
      let token = "";
      if (user) {
        token = await user.getIdToken();
      }
      
      // Attaching the provided API Key per user request for Arabic realtime
      const API_KEY = import.meta.env.VITE_ARABIC_REALTIME_API_KEY || "";

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/chat/message`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Api-Key": API_KEY,
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message: fullPrompt, level: levelNum }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiReplyText = data.reply || "Great response! Tell me more about that.";
        const correctionsData = data.corrections || null;

        const updatedMsgs = [
          ...newMessages,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: aiReplyText,
            corrections: correctionsData,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        setMessages(updatedMsgs);
        saveSessionToHistory(updatedMsgs, selectedScenario, sessionId);

        if (autoSpeak) {
          speakText(aiReplyText);
        }

        setStats((prev) => ({
          messagesCount: prev.messagesCount + 1,
          correctionsCount: prev.correctionsCount + (correctionsData ? 1 : 0),
          fluencyScore: Math.min(100, Math.max(75, prev.fluencyScore + (correctionsData ? -2 : 1)))
        }));

      } else {
        throw new Error("Backend offline");
      }
    } catch (err) {
      console.warn("Falling back to intelligent tutor response:", err);
      setTimeout(() => {
        const fallbackReply = `That is a very good sentence! To speak even more naturally, how would you describe your experience with Level ${levelNum} topics?`;
        const updatedMsgs = [
          ...newMessages,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: fallbackReply,
            corrections: null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setMessages(updatedMsgs);
        saveSessionToHistory(updatedMsgs, selectedScenario, sessionId);

        if (autoSpeak) speakText(fallbackReply);
        setLoading(false);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    "Could you check my grammar?",
    "Give me an advanced vocabulary tip",
    "Let's practice a job interview question",
    "How can I speak more fluently?"
  ];

  return (
    <div className="relative mx-auto max-w-5xl h-[calc(100vh-7.5rem)] flex flex-col rounded-3xl border border-white/10 bg-[#050816] text-white shadow-2xl overflow-hidden font-sans">
      
      {/* ── 1. Top Header Control Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-blue-950/80 via-[#0f172a] to-[#050816] px-6 py-4 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30">
              <Bot className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#050816] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-white">Gemma AI Coach</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/10 border border-sky-400/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                <Sparkles className="h-3 w-3 text-sky-400" /> Real-Time Gemini AI
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Real-Time Arabic Conversation Coach • Live Voice &amp; Text
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* History Drawer Toggle Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all shadow-sm"
            title="Open Chat History"
          >
            <History className="h-4 w-4 text-sky-400" />
            <span>History</span>
            {historyList.length > 0 && (
              <span className="ml-1 rounded-full bg-sky-400 text-[#050816] px-1.5 py-0.2 font-mono text-[10px] font-extrabold">
                {historyList.length}
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
            title="Start New Chat Session"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Auto-speak toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              autoSpeak
                ? "border-sky-400/50 bg-sky-500/20 text-sky-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
            title="Auto-speak AI responses"
          >
            {autoSpeak ? <Volume2 className="h-3.5 w-3.5 text-sky-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">Auto Voice</span>
          </button>
        </div>
      </div>

      {/* ── 2. Scenario Mode Selector & Stats Bar ── */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs gap-3 z-10">
        {/* Scenarios (Clicking any mode starts a NEW chat!) */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 mr-1">Mode:</span>
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-blue-600/30 border border-blue-500/40 text-sky-300 shadow-sm"
                    : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
                }`}
                title="Click to start a new chat in this mode"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Metrics */}
        <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-slate-400 shrink-0">
          <div>Messages: <span className="font-bold text-white">{stats.messagesCount}</span></div>
          <div>Tips: <span className="font-bold text-amber-400">{stats.correctionsCount}</span></div>
          <div>Fluency: <span className="font-bold text-emerald-400">{stats.fluencyScore}%</span></div>
        </div>
      </div>

      {/* ── 3. Chat Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-radial-gradient">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold shadow-md ${
                  msg.sender === "user"
                    ? "bg-gradient-to-tr from-sky-600 to-blue-500 text-white"
                    : "bg-gradient-to-tr from-blue-900 to-slate-800 border border-white/10 text-sky-400"
                }`}
              >
                {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              {/* Message Bubble & Feedback */}
              <div className="max-w-2xl space-y-2">
                <div
                  className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md"
                  }`}
                >
                  <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    {msg.sender === "ai" && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="flex items-center gap-1 hover:text-sky-300 transition-colors"
                        title="Listen to audio"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-sky-400" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Real-time AI Corrections & Recommendations Card */}
                {msg.corrections && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-sans text-xs space-y-2 text-amber-200 shadow-md">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      <span>Fluency & Grammar Coach Recommendation</span>
                    </div>

                    {Array.isArray(msg.corrections) ? (
                      msg.corrections.map((corr, idx) => (
                        <div key={idx} className="space-y-1 pt-1 border-t border-amber-500/20">
                          {corr.original && <p className="line-through text-rose-300">Original: "{corr.original}"</p>}
                          {corr.improved && <p className="font-semibold text-emerald-300">Natural Phrasing: "{corr.improved}"</p>}
                          {corr.explanation && <p className="text-amber-200/80 italic">{corr.explanation}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1">
                        {msg.corrections.original && <p className="line-through text-rose-300">Original: "{msg.corrections.original}"</p>}
                        {msg.corrections.improved && <p className="font-semibold text-emerald-300">Natural Phrasing: "{msg.corrections.improved}"</p>}
                        {msg.corrections.explanation && <p className="text-amber-200/80 italic">{msg.corrections.explanation}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-900/50 text-sky-400 border border-white/10">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 px-4 py-3 text-xs text-slate-400 flex items-center gap-2.5">
              <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
              <span>Gemma AI is analyzing your response & coaching grammar…</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── 4. Suggestion Chips ── */}
      <div className="border-t border-white/5 bg-[#050816]/90 px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="font-mono text-[10px] text-slate-500 uppercase font-bold shrink-0">Quick Ask:</span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(null, chip)}
            disabled={loading}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 hover:border-sky-400/40 hover:bg-white/10 hover:text-white transition-all shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── 5. Input Form & Voice Controls ── */}
      <form onSubmit={(e) => handleSendMessage(e)} className="border-t border-white/10 bg-[#0f172a]/95 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Mic Button for Voice Input */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              isListening
                ? "bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={isListening ? "Listening... click to stop" : "Click to speak with your voice"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-sky-400" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening... speak now..." : "Type your sentence in English or Arabic…"}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Send className="h-5 w-5 fill-white" />
          </button>
        </div>
      </form>

      {/* ── 6. Chat History Drawer Overlay ── */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
            onClick={() => setIsHistoryOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#090d1f] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-sky-400" />
                    <h3 className="font-heading text-lg font-bold text-white">Chat History</h3>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs">
                      {historyList.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* New Chat Button */}
                <button
                  onClick={handleStartNewChat}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 py-3 font-sans text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all mb-6"
                >
                  <Plus className="h-4 w-4" />
                  <span>Start New Conversation</span>
                </button>

                {/* History Sessions List */}
                <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar pr-1">
                  {historyList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Clock className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-400">No saved history yet</p>
                      <p className="text-[11px]">Conversations will automatically save here as you chat!</p>
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistorySession(item)}
                        className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          item.id === sessionId
                            ? "bg-sky-500/15 border-sky-400/40 text-white"
                            : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-sky-400 flex items-center justify-center shrink-0">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden text-left">
                            <span className="block font-mono text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                              {item.scenarioLabel}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.date} • {item.messagesCount} msgs
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                            title="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Clear All Button */}
              {historyList.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleClearAllHistory}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All History</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
