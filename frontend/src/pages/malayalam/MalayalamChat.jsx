import { useState, useRef, useEffect } from "react";
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

const Malayalam_SCENARIOS = [
  {
    id: "free",
    label: "Free Conversation",
    labelMl: "స్వేచ్ఛా సంభాషణ",
    icon: MessageSquare,
    promptPrefix: "",
    welcome: () => `Hello! I'm Gemma, your AI Malayalam Coach! 😊 I'm here to help you learn Malayalam from scratch — don't worry if you don't know any Malayalam yet, that's totally okay! We'll go step by step. Just type in English and I'll teach you useful Malayalam phrases. Let's start! What would you like to learn today?`,
  },
  {
    id: "market",
    label: "Market Shopping",
    labelMl: "బజారులో కొనుగోలు",
    icon: Compass,
    promptPrefix: "[Market Shopping Scenario in Malayalam] ",
    welcome: () => `Welcome to the Market Shopping scenario! 🛒 I'll help you learn how to shop at a Malayalam market. We'll practice phrases like asking for prices, bargaining, and more — all explained in English with Malayalam words taught along the way. Ready? Tell me what you'd like to buy and I'll teach you how to say it in Malayalam!`,
  },
  {
    id: "family",
    label: "Family Conversation",
    labelMl: "కుటుంబ సంభాషణ",
    icon: Award,
    promptPrefix: "[Family Conversation Scenario in Malayalam] ",
    welcome: () => `Welcome to the Family Conversation scenario! 👨‍👩‍👧 Let's learn how to talk about family members in Malayalam. I'll guide you in English and introduce Malayalam words and phrases step by step. How many people are in your family? Tell me in English and I'll show you how to say it in Malayalam!`,
  },
  {
    id: "interview",
    label: "Job Interview",
    labelMl: "ఉద్యోగ ఇంటర్వ్యూ",
    icon: Briefcase,
    promptPrefix: "[Job Interview in Malayalam Scenario] ",
    welcome: () => `Welcome to the Job Interview Practice scenario! 💼 I'll help you learn how to introduce yourself and answer common interview questions in Malayalam. Don't worry — I'll explain everything in English first, then teach you the Malayalam way to say it. To start, tell me a little about yourself in English!`,
  },
];

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const Malayalam_SYSTEM_PROMPT = `You are Gemma, a friendly AI Malayalam Language Coach. The users you talk to are BEGINNERS who do NOT know Malayalam. They are here to LEARN Malayalam. Your primary language for communication is ENGLISH. Never assume the user knows Malayalam.

In every reply:
1. Always respond primarily in ENGLISH so the user can understand you.
2. Teach Malayalam vocabulary and phrases in a clear, beginner-friendly way. Show the Malayalam script, transliteration (romanized pronunciation), and the English meaning.
3. If the user tries to write Malayalam and makes a mistake, gently correct it in English and show the right way.
4. Keep your tone warm, encouraging, fun, and patient — like a great teacher.
5. End every reply with a simple follow-up question or a small Malayalam exercise, explained in English.

Example format for teaching a Malayalam word:
→ In Malayalam: "నమస్కారం" (Namaskāram) = Hello

Output your response ONLY as JSON in this exact format:
{
  "reply": "Your friendly, English-language response here. Teach Malayalam words/phrases with script, transliteration, and meaning. End with an English question or exercise.",
  "corrections": {
    "original": "the exact phrase the user used that needs improvement",
    "improved": "the correct Malayalam phrasing with transliteration",
    "explanation": "Brief friendly explanation in English of what was wrong and how to fix it"
  }
}
If there are no mistakes (or user typed in English only), set "corrections" to null.`;

async function callMalayalamGemini(userMessage, scenarioPrefix) {
  const fullPrompt = `${Malayalam_SYSTEM_PROMPT}\n\nUser Message: "${scenarioPrefix}${userMessage}"`;

  const res = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  if (raw.startsWith("```")) {
    raw = raw.split("\n", 1).length > 1 ? raw.split("\n").slice(1).join("\n") : raw;
    raw = raw.replace(/```$/, "").trim();
  }
  return JSON.parse(raw);
}

export default function MalayalamChat() {
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState("free");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => `te_session_${Date.now()}`);
  const [historyList, setHistoryList] = useState([]);

  const [stats, setStats] = useState({ messagesCount: 1, correctionsCount: 0, fluencyScore: 95 });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: Malayalam_SCENARIOS[0].welcome(),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lingolive_Malayalam_chat_history");
      if (saved) setHistoryList(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speakText = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "te-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported. Please type your message."); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const rec = new SR();
      rec.lang = "te-IN";
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setInputMessage((p) => (p ? `${p} ${t}` : t));
      };
      recognitionRef.current = rec;
      rec.start();
    }
  };

  const saveHistory = (msgs, scenId, sessId) => {
    const userMsgs = msgs.filter((m) => m.sender === "user");
    if (!userMsgs.length) return;
    const sc = Malayalam_SCENARIOS.find((s) => s.id === scenId) || Malayalam_SCENARIOS[0];
    const snippet = (userMsgs[0]?.text || "").slice(0, 35);
    const entry = {
      id: sessId,
      scenarioId: scenId,
      scenarioLabel: sc.label,
      title: snippet.length < userMsgs[0]?.text?.length ? snippet + "…" : snippet,
      messages: msgs,
      messagesCount: msgs.length,
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    };
    setHistoryList((prev) => {
      const updated = [entry, ...prev.filter((i) => i.id !== sessId)];
      localStorage.setItem("lingolive_Malayalam_chat_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleScenarioChange = (newId) => {
    if (newId === selectedScenario) return;
    saveHistory(messages, selectedScenario, sessionId);
    const sc = Malayalam_SCENARIOS.find((s) => s.id === newId) || Malayalam_SCENARIOS[0];
    const newSessId = `te_session_${Date.now()}`;
    const initMsg = {
      id: Date.now(),
      sender: "ai",
      text: sc.welcome(),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setSelectedScenario(newId);
    setSessionId(newSessId);
    setMessages([initMsg]);
    setInputMessage("");
    setStats({ messagesCount: 1, correctionsCount: 0, fluencyScore: 95 });
  };

  const handleStartNewChat = () => {
    saveHistory(messages, selectedScenario, sessionId);
    const sc = Malayalam_SCENARIOS.find((s) => s.id === selectedScenario) || Malayalam_SCENARIOS[0];
    const newSessId = `te_session_${Date.now()}`;
    setSessionId(newSessId);
    setMessages([{
      id: Date.now(),
      sender: "ai",
      text: sc.welcome(),
      corrections: null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);
    setInputMessage("");
    setStats({ messagesCount: 1, correctionsCount: 0, fluencyScore: 95 });
    setIsHistoryOpen(false);
  };

  const handleLoadHistorySession = (session) => {
    saveHistory(messages, selectedScenario, sessionId);
    setSelectedScenario(session.scenarioId || "free");
    setSessionId(session.id);
    setMessages(session.messages || []);
    setStats({
      messagesCount: session.messagesCount || session.messages?.length || 1,
      correctionsCount: session.messages?.filter((m) => m.corrections).length || 0,
      fluencyScore: 95
    });
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = (e, id) => {
    e.stopPropagation();
    setHistoryList((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem("lingolive_Malayalam_chat_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all Malayalam chat history?")) {
      setHistoryList([]);
      localStorage.removeItem("lingolive_Malayalam_chat_history");
    }
  };

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const text = customText || inputMessage.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInputMessage("");
    setLoading(true);

    const sc = Malayalam_SCENARIOS.find((s) => s.id === selectedScenario);

    try {
      const data = await callMalayalamGemini(text, sc?.promptPrefix || "");
      const aiReply = data.reply || "చాలా బాగుంది! (Very good!) Tell me more!";
      const corrections = data.corrections || null;

      const updatedMsgs = [...newMsgs, {
        id: Date.now() + 1,
        sender: "ai",
        text: aiReply,
        corrections,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }];
      setMessages(updatedMsgs);
      saveHistory(updatedMsgs, selectedScenario, sessionId);
      if (autoSpeak) speakText(aiReply);
      setStats((p) => ({
        messagesCount: p.messagesCount + 1,
        correctionsCount: p.correctionsCount + (corrections ? 1 : 0),
        fluencyScore: Math.min(100, Math.max(75, p.fluencyScore + (corrections ? -2 : 1)))
      }));
    } catch (err) {
      console.warn("Malayalam Gemini error:", err);
      setTimeout(() => {
        const fallback = "చాలా బాగుంది! (Very good!) మీరు మళ్ళీ ప్రయత్నించండి. (Please try again.)";
        const updatedMsgs = [...newMsgs, {
          id: Date.now() + 1,
          sender: "ai",
          text: fallback,
          corrections: null,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }];
        setMessages(updatedMsgs);
        if (autoSpeak) speakText(fallback);
        setLoading(false);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    "Hello! (Teach me to greet in Malayalam)",
    "How do I say Thank you in Malayalam?",
    "Teach me basic Malayalam words",
    "Let's have a simple conversation"
  ];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col rounded-3xl border border-amber-500/20 bg-[#050816] text-white shadow-2xl overflow-hidden font-sans">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-900/30 via-[#0f172a] to-[#050816] px-6 py-4 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-white shadow-lg shadow-amber-500/30">
              <Bot className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#050816] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-white">Malayalam AI Coach</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-400" /> Real-Time Gemini AI
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">Malayalam Language Coach • Live Voice & Text</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            <History className="h-4 w-4 text-amber-400" />
            <span>History</span>
            {historyList.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-400 text-[#050816] px-1.5 font-mono text-[10px] font-extrabold">
                {historyList.length}
              </span>
            )}
          </button>

          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              autoSpeak ? "border-amber-400/50 bg-amber-500/20 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {autoSpeak ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">Auto Voice</span>
          </button>
        </div>
      </div>

      {/* ── Scenario Mode Selector ── */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-2.5 text-xs gap-3 z-10">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500 mr-1">Mode:</span>
          {Malayalam_SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-amber-600/30 border border-amber-500/40 text-amber-300 shadow-sm"
                    : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
        <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-slate-400 shrink-0">
          <div>Messages: <span className="font-bold text-white">{stats.messagesCount}</span></div>
          <div>Tips: <span className="font-bold text-amber-400">{stats.correctionsCount}</span></div>
          <div>Fluency: <span className="font-bold text-emerald-400">{stats.fluencyScore}%</span></div>
        </div>
      </div>

      {/* ── Chat Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-tr from-amber-600 to-yellow-500 text-white"
                  : "bg-gradient-to-tr from-amber-900 to-slate-800 border border-amber-500/20 text-amber-400"
              }`}>
                {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              <div className="max-w-2xl space-y-2">
                <div className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-lg ${
                  msg.sender === "user"
                    ? "bg-amber-600 text-white rounded-tr-none"
                    : "bg-slate-900/90 border border-amber-500/10 text-slate-100 rounded-tl-none backdrop-blur-md"
                }`}>
                  <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    {msg.sender === "ai" && (
                      <button onClick={() => speakText(msg.text)} className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                        <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>వినండి (Listen)</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.corrections && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-sans text-xs space-y-2 text-amber-200 shadow-md">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      <span>Malayalam Coach Recommendation</span>
                    </div>
                    {Array.isArray(msg.corrections) ? (
                      msg.corrections.map((c, idx) => (
                        <div key={idx} className="space-y-1 pt-1 border-t border-amber-500/20">
                          {c.original && <p className="line-through text-rose-300">Original: "{c.original}"</p>}
                          {c.improved && <p className="font-semibold text-emerald-300">Better: "{c.improved}"</p>}
                          {c.explanation && <p className="text-amber-200/80 italic">{c.explanation}</p>}
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1">
                        {msg.corrections.original && <p className="line-through text-rose-300">Original: "{msg.corrections.original}"</p>}
                        {msg.corrections.improved && <p className="font-semibold text-emerald-300">Better: "{msg.corrections.improved}"</p>}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-900/50 text-amber-400 border border-amber-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-white/10 px-4 py-3 text-xs text-slate-400 flex items-center gap-2.5">
              <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
              <span>Malayalam AI analyzing your message…</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Quick Ask Chips ── */}
      <div className="border-t border-white/5 bg-[#050816]/90 px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="font-mono text-[10px] text-slate-500 uppercase font-bold shrink-0">Quick:</span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(null, chip)}
            disabled={loading}
            className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[11px] text-slate-300 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-white transition-all shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Input Form ── */}
      <form onSubmit={handleSend} className="border-t border-white/10 bg-[#0f172a]/95 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              isListening
                ? "bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/40"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            title={isListening ? "Listening…" : "Speak in English or Malayalam"}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-amber-400" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening… speak now" : "Type in English or Malayalam…"}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 font-sans text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Send className="h-5 w-5 fill-white" />
          </button>
        </div>
      </form>

      {/* ── History Drawer ── */}
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
              className="w-full max-w-md h-full bg-[#090d1f] border-l border-amber-500/20 p-6 flex flex-col justify-between shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-500/10">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-400" />
                    <h3 className="font-heading text-lg font-bold text-white">Malayalam Chat History</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs">{historyList.length}</span>
                  </div>
                  <button onClick={() => setIsHistoryOpen(false)} className="p-1 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button
                  onClick={handleStartNewChat}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 py-3 font-sans text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition-all mb-6"
                >
                  <Plus className="h-4 w-4" />
                  <span>Start New Conversation</span>
                </button>

                <div className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto custom-scrollbar pr-1">
                  {historyList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Clock className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs font-semibold text-slate-400">No saved history yet</p>
                      <p className="text-[11px]">Conversations save automatically as you chat!</p>
                    </div>
                  ) : (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistorySession(item)}
                        className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          item.id === sessionId
                            ? "bg-amber-500/15 border-amber-400/40 text-white"
                            : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-9 w-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden text-left">
                            <span className="block font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">{item.scenarioLabel}</span>
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{item.date} • {item.messagesCount} msgs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleDeleteHistory(e, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
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

              {historyList.length > 0 && (
                <div className="pt-4 border-t border-amber-500/10">
                  <button
                    onClick={handleClearAll}
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
