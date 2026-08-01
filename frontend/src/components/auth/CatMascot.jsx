export default function CatMascot() {
  return (
    <div className="relative w-full h-full flex items-end justify-center select-none min-h-[480px]">
      {/* ── Floating Hearts ── */}
      <FloatingHeart top="12%" left="40%" size="18px" delay="0s" color="#ff75a0" />
      <FloatingHeart top="8%" left="62%" size="15px" delay="0.8s" color="#ff8fa3" />
      <FloatingHeart top="30%" left="44%" size="14px" delay="1.5s" color="#ff75a0" />
      <FloatingHeart top="48%" left="84%" size="16px" delay="0.4s" color="#ff75a0" />

      {/* ── Multilingual Speech Bubbles ── */}
      {/* Hello (Top Center) */}
      <SpeechBubble
        text="Hello"
        bg="linear-gradient(135deg, #ff8fa3 0%, #ff6584 100%)"
        textColor="#ffffff"
        top="6%"
        left="44%"
        delay="0s"
        shadow="0 8px 24px rgba(255, 101, 132, 0.45)"
      />

      {/* வணக்கம் (Tamil - Top Right) */}
      <SpeechBubble
        text="வணக்கம்"
        bg="linear-gradient(135deg, #e4c1f9 0%, #c084fc 100%)"
        textColor="#2e1065"
        top="12%"
        left="70%"
        delay="0.6s"
        shadow="0 8px 24px rgba(192, 132, 252, 0.45)"
      />

      {/* 你好 (Chinese - Upper Left) */}
      <SpeechBubble
        text="你好"
        bg="linear-gradient(135deg, #ffd1a9 0%, #ffb77d 100%)"
        textColor="#5c2400"
        top="24%"
        left="20%"
        delay="1.2s"
        shadow="0 8px 24px rgba(255, 183, 125, 0.45)"
      />

      {/* こんにちは (Japanese - Middle Right) */}
      <SpeechBubble
        text="こんにちは"
        bg="linear-gradient(135deg, #d8f3dc 0%, #86efac 100%)"
        textColor="#14532d"
        top="32%"
        left="76%"
        delay="0.3s"
        shadow="0 8px 24px rgba(134, 239, 172, 0.45)"
      />

      {/* 안녕하세요 (Korean - Middle Left) */}
      <SpeechBubble
        text="안녕하세요"
        bg="linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)"
        textColor="#075985"
        top="44%"
        left="12%"
        delay="1.8s"
        shadow="0 8px 24px rgba(125, 211, 252, 0.45)"
      />

      {/* สวัสดี (Thai - Lower Right) */}
      <SpeechBubble
        text="สวัสดี"
        bg="linear-gradient(135deg, #fef08a 0%, #fde047 100%)"
        textColor="#713f12"
        top="50%"
        left="77%"
        delay="0.9s"
        shadow="0 8px 24px rgba(253, 224, 71, 0.45)"
      />

      {/* مرحبا (Arabic - Bottom Left) */}
      <SpeechBubble
        text="مرحبا"
        bg="linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)"
        textColor="#831843"
        top="66%"
        left="16%"
        delay="2.1s"
        shadow="0 8px 24px rgba(244, 114, 182, 0.45)"
      />

      {/* नमस्ते (Hindi - Bottom Right 1) */}
      <SpeechBubble
        text="नमस्ते"
        bg="linear-gradient(135deg, #ccfbf1 0%, #5eead4 100%)"
        textColor="#115e59"
        top="68%"
        left="73%"
        delay="1.5s"
        shadow="0 8px 24px rgba(94, 234, 212, 0.45)"
      />

      {/* ഹലോ (Malayalam - Bottom Right 2) */}
      <SpeechBubble
        text="ഹലോ"
        bg="linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)"
        textColor="#312e81"
        top="80%"
        left="79%"
        delay="2.4s"
        shadow="0 8px 24px rgba(165, 180, 252, 0.45)"
      />

      {/* ── Exact Mozhify Cat Illustration SVG ── */}
      <div
        className="relative z-10"
        style={{
          width: "340px",
          height: "380px",
        }}
      >
        <img 
          src="/cat-2d.jpg" 
          alt="Mozhify Cat"
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            mixBlendMode: "screen",
            filter: "contrast(1.4) brightness(0.65)"
          }} 
        />
      </div>
    </div>
  );
}

function SpeechBubble({ text, bg, textColor, top, left, delay, shadow }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        background: bg,
        color: textColor,
        borderRadius: "24px",
        padding: "9px 20px",
        fontSize: "15px",
        fontWeight: "900",
        fontFamily: "'Nunito', sans-serif",
        boxShadow: shadow,
        opacity: 0,
        animation: `bubblePopFloat 3.5s ease-in-out ${delay} infinite`,
        zIndex: 25,
        whiteSpace: "nowrap",
        border: "2px solid rgba(255,255,255,0.9)",
        backdropFilter: "blur(4px)",
      }}
    >
      {text}
      <span
        style={{
          position: "absolute",
          bottom: "-8px",
          left: "30%",
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "9px solid rgba(255,255,255,0.95)",
        }}
      />
      <style>{`
        @keyframes bubblePopFloat {
          0%   { opacity: 0; transform: translateY(12px) scale(0.8); }
          18%  { opacity: 1; transform: translateY(0px) scale(1); }
          82%  { opacity: 1; transform: translateY(-8px) scale(1); }
          100% { opacity: 0; transform: translateY(-16px) scale(0.85); }
        }
      `}</style>
    </div>
  );
}

function FloatingHeart({ top, left, size, delay, color }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        fontSize: size,
        color: color,
        opacity: 0,
        animation: `heartFloat 3.2s ease-in-out ${delay} infinite`,
        zIndex: 22,
        pointerEvents: "none",
      }}
    >
      ♥
      <style>{`
        @keyframes heartFloat {
          0%   { opacity: 0; transform: translateY(8px) scale(0.5); }
          30%  { opacity: 0.95; transform: translateY(-10px) scale(1.15); }
          70%  { opacity: 0.95; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.6); }
        }
      `}</style>
    </div>
  );
}
