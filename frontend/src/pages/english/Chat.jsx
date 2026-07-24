import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RefreshCw,
  Lightbulb,
  Zap
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const levelNum = searchParams.get("level") || "13";
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello! I'm Gemma, your AI English conversational tutor. We are currently focusing on Level ${levelNum} (Advanced Nuanced Vocabulary & Persuasion). What topic would you like to discuss today?`,
      corrections: null,
      timestamp: "09:30 AM"
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      let token = "";
      if (user) {
        token = await user.getIdToken();
      }
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/chat/message`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ message: userText, level: levelNum }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.reply,
            corrections: data.corrections || null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error("Backend offline");
      }
    } catch (err) {
      // Intelligent fallback logic simulating Gemma tutor response & corrections
      setTimeout(() => {
        let fakeCorrection = null;
        if (userText.toLowerCase().includes("i go") || userText.toLowerCase().includes("very good") || userText.toLowerCase().includes("i think so that")) {
          fakeCorrection = {
            original: userText,
            improved: userText.replace(/very good/gi, "exceptionally articulate").replace(/i think so that/gi, "I am of the opinion that"),
            explanation: "In C1 level discussions, replace basic adjectives like 'very good' with precise words like 'articulate' or 'compelling'."
          };
        }

        const replyOptions = [
          `That is a very compelling point! When discussing Level ${levelNum} topics, how would you evaluate the long-term impact on global communication?`,
          `I really appreciate your clarity. Notice how using words like 'pragmatic' or 'scrutinize' can elevate your sentence structure even further. Would you like to try rephrasing that?`,
          `Excellent fluency! You expressed that idea with natural flow. What other aspects of this topic would you like to explore next?`
        ];

        const randomReply = replyOptions[Math.floor(Math.random() * replyOptions.length)];

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: randomReply,
            corrections: fakeCorrection,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setLoading(false);
      }, 1000);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-[#14213D]/10 bg-white shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#14213D]/10 bg-[#14213D] px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C9A227] text-[#14213D] shadow-md">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-white">Gemma AI Tutor</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-500/30">
                ● Live Tutor
              </span>
            </div>
            <p className="font-mono text-xs text-white/60">
              Level {levelNum} • Real-time Grammar & Fluency Coaching
            </p>
          </div>
        </div>

        <button
          onClick={() => speakText(messages[messages.length - 1]?.text)}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-sans text-xs font-semibold text-white hover:bg-white/20"
        >
          <Volume2 className="h-4 w-4 text-[#C9A227]" /> Listen Reply
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F8F6F0]/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-bold shadow-sm ${
                msg.sender === "user"
                  ? "bg-[#3F6656] text-white"
                  : "bg-[#14213D] text-[#C9A227]"
              }`}
            >
              {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>

            {/* Bubble Container */}
            <div className="max-w-2xl space-y-2">
              <div
                className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-[#14213D] text-white rounded-tr-none"
                    : "bg-white text-[#14213D] border border-[#14213D]/10 rounded-tl-none"
                }`}
              >
                <p className="font-sans">{msg.text}</p>
                <span className={`block mt-2 font-mono text-[10px] text-right ${
                  msg.sender === "user" ? "text-white/50" : "text-[#14213D]/40"
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {/* Live Grammar Correction Card (if any) */}
              {msg.corrections && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-sans text-xs space-y-2 text-amber-900 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span>Fluency Recommendation</span>
                  </div>
                  <div className="space-y-1">
                    <p className="line-through text-red-600/80">Original: "{msg.corrections.original}"</p>
                    <p className="font-semibold text-emerald-700">Better Phrasal: "{msg.corrections.improved}"</p>
                  </div>
                  <p className="text-amber-800/80 italic">{msg.corrections.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#14213D] text-[#C9A227]">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl bg-white border border-[#14213D]/10 px-4 py-3 text-xs text-[#14213D]/60 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-[#C9A227]" />
              <span>Gemma AI is formulating natural feedback…</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="border-t border-[#14213D]/10 bg-white p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message in English… (Gemma will coach your grammar)"
            className="flex-1 rounded-2xl border border-[#14213D]/15 bg-[#F8F6F0] px-4 py-3 font-sans text-sm text-[#14213D] outline-none focus:border-[#3F6656] focus:ring-2 focus:ring-[#3F6656]/20"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9A227] text-[#14213D] shadow-md transition hover:brightness-105 disabled:opacity-50"
          >
            <Send className="h-5 w-5 fill-[#14213D]" />
          </button>
        </div>
      </form>
    </div>
  );
}
