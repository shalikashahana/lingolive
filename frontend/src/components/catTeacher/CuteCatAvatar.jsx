import React from "react";
import { motion } from "framer-motion";

/**
 * CuteCatAvatar component rendering SVG vector illustrations matching the prompt image
 * States: 'LEVEL_PASSED' | 'CORRECT' | 'OOPS' | 'TALKING' | 'LISTENING'
 */
export default function CuteCatAvatar({ state = "LEVEL_PASSED", size = 200, className = "" }) {
  const isHappy = state === "CORRECT" || state === "HAPPY";
  const isSad = state === "OOPS" || state === "SAD";
  const isTalking = state === "TALKING";
  const isListening = state === "LISTENING";
  const isWaving = state === "LEVEL_PASSED" || state === "WAVING";

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      
      {/* Background Sparkles / Hearts / Rain Cloud based on state */}
      {isHappy && (
        <>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 0.8], y: [-10, -25, -35] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            className="absolute -top-4 -left-4 text-pink-400 text-2xl pointer-events-none"
          >
            💖
          </motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.7, 1.3, 1], opacity: [0, 1, 0.9], y: [-5, -20, -30] }}
            transition={{ repeat: Infinity, duration: 2.1, delay: 0.4, ease: "easeOut" }}
            className="absolute -top-6 right-2 text-pink-500 text-xl pointer-events-none"
          >
            ✨
          </motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.6, 1.1, 0.8], opacity: [0, 1, 0], y: [0, -15, -25] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.8 }}
            className="absolute top-1/2 -right-6 text-pink-400 text-lg pointer-events-none"
          >
            💕
          </motion.div>
        </>
      )}

      {isSad && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 flex flex-col items-center pointer-events-none z-10"
        >
          {/* Rain Cloud */}
          <svg width="60" height="35" viewBox="0 0 60 35" fill="none">
            <path d="M12 25 C6 25 2 20 5 14 C8 8 18 8 22 11 C26 5 38 5 42 11 C47 8 57 12 55 18 C58 22 55 25 50 25 Z" fill="#64748B" opacity="0.85"/>
            <path d="M15 28 L13 34 M27 28 L25 34 M39 28 L37 34" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
        </motion.div>
      )}

      {isWaving && (
        <motion.div 
          animate={{ rotate: [0, 15, -10, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute -top-3 -right-2 text-amber-400 text-xl pointer-events-none"
        >
          ✨
        </motion.div>
      )}

      {isListening && (
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute inset-0 rounded-full border-4 border-pink-400/50 pointer-events-none"
        />
      )}

      {/* Main Cat SVG Container */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={
          isHappy ? { y: [0, -8, 0], scale: [1, 1.04, 1] } :
          isSad ? { y: [0, 4, 0] } :
          isListening ? { rotate: [0, -3, 3, 0] } :
          { y: [0, -3, 0] }
        }
        transition={{ repeat: Infinity, duration: isHappy ? 1.2 : 2.5, ease: "easeInOut" }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyFur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF0E6" />
            <stop offset="50%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#E8D5C4" />
          </linearGradient>

          <linearGradient id="headFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9C8275" />
            <stop offset="40%" stopColor="#C4AA9C" />
            <stop offset="100%" stopColor="#F5E6D3" />
          </linearGradient>

          <linearGradient id="innerEar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="100%" stopColor="#FF69B4" />
          </linearGradient>

          <radialGradient id="rosyCheeks" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF85A1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF85A1" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="collarPink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6584" />
            <stop offset="100%" stopColor="#FF477E" />
          </linearGradient>

          <linearGradient id="goldHeart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Tail */}
        <motion.path
          d="M 145 160 C 175 160 185 130 175 110 C 170 100 160 105 165 115 C 170 125 160 145 140 145 Z"
          fill="#9C8275"
          animate={{ rotate: isHappy ? [0, 15, -15, 0] : [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ originX: "145px", originY: "160px" }}
        />

        {/* Body Base */}
        <ellipse cx="100" cy="155" rx="42" ry="32" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2.5" />
        {/* Chest White Patch */}
        <ellipse cx="100" cy="152" rx="26" ry="22" fill="#FFFFFF" />

        {/* Left Paw */}
        {isWaving ? (
          /* Waving Paw */
          <motion.g
            animate={{ rotate: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ originX: "65px", originY: "140px" }}
          >
            <ellipse cx="55" cy="120" rx="14" ry="12" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2" />
            <ellipse cx="55" cy="120" rx="8" ry="6" fill="#FFC0CB" />
          </motion.g>
        ) : isHappy ? (
          /* Both Paws near cheeks */
          <g>
            <ellipse cx="72" cy="138" rx="12" ry="10" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2" />
            <ellipse cx="72" cy="138" rx="6" ry="5" fill="#FFC0CB" />
          </g>
        ) : (
          /* Normal Resting Paw */
          <g>
            <ellipse cx="70" cy="168" rx="12" ry="10" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2" />
            <ellipse cx="70" cy="168" rx="6" ry="4" fill="#FFC0CB" />
          </g>
        )}

        {/* Right Paw */}
        {isHappy ? (
          <g>
            <ellipse cx="128" cy="138" rx="12" ry="10" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2" />
            <ellipse cx="128" cy="138" rx="6" ry="5" fill="#FFC0CB" />
          </g>
        ) : (
          <g>
            <ellipse cx="130" cy="168" rx="12" ry="10" fill="url(#bodyFur)" stroke="#8C7063" strokeWidth="2" />
            <ellipse cx="130" cy="168" rx="6" ry="4" fill="#FFC0CB" />
          </g>
        )}

        {/* Collar & Golden Heart Pendant */}
        <rect x="74" y="132" width="52" height="7" rx="3.5" fill="url(#collarPink)" />
        <path
          d="M 100 137 C 97 134 92 136 93 140 C 94 144 100 148 100 148 C 100 148 106 144 107 140 C 108 136 103 134 100 137 Z"
          fill="url(#goldHeart)"
          stroke="#D97706"
          strokeWidth="1"
        />

        {/* Outer Ears Base */}
        {/* Left Ear */}
        <path
          d={isSad ? "M 42 68 Q 30 95 65 80 Z" : "M 45 75 Q 35 30 75 55 Z"}
          fill="url(#headFur)"
          stroke="#8C7063"
          strokeWidth="2.5"
        />
        {/* Inner Left Ear */}
        <path
          d={isSad ? "M 46 72 Q 36 90 60 80 Z" : "M 48 70 Q 40 38 70 57 Z"}
          fill="url(#innerEar)"
        />

        {/* Right Ear */}
        <path
          d={isSad ? "M 158 68 Q 170 95 135 80 Z" : "M 155 75 Q 165 30 125 55 Z"}
          fill="url(#headFur)"
          stroke="#8C7063"
          strokeWidth="2.5"
        />
        {/* Inner Right Ear */}
        <path
          d={isSad ? "M 154 72 Q 164 90 140 80 Z" : "M 152 70 Q 160 38 130 57 Z"}
          fill="url(#innerEar)"
        />

        {/* Pink Bow Ribbon on Left Ear */}
        <g transform="translate(62, 48) rotate(-15)">
          <path d="M 0 0 C -12 -10 -12 10 0 0 Z" fill="#FF477E" stroke="#E11D48" strokeWidth="1" />
          <path d="M 0 0 C 12 -10 12 10 0 0 Z" fill="#FF477E" stroke="#E11D48" strokeWidth="1" />
          <circle cx="0" cy="0" r="3.5" fill="#FFE4E6" stroke="#E11D48" strokeWidth="1" />
        </g>

        {/* Head Main Shape */}
        <ellipse cx="100" cy="92" rx="46" ry="38" fill="url(#headFur)" stroke="#8C7063" strokeWidth="2.5" />
        {/* Muzzle / Lower Face Cream Patch */}
        <ellipse cx="100" cy="104" rx="34" ry="24" fill="#FAF0E6" />

        {/* Rosy Cheeks */}
        <circle cx="68" cy="102" r="10" fill="url(#rosyCheeks)" />
        <circle cx="132" cy="102" r="10" fill="url(#rosyCheeks)" />

        {/* Eyes */}
        {isHappy ? (
          /* Happy Arc Eyes ^^ */
          <g>
            <path d="M 72 94 Q 82 84 92 94" stroke="#3D291D" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 108 94 Q 118 84 128 94" stroke="#3D291D" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        ) : isSad ? (
          /* Sad Droopy Eyes T_T */
          <g>
            <path d="M 72 90 Q 82 98 92 92" stroke="#3D291D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 108 92 Q 118 98 128 90" stroke="#3D291D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Teardrops */}
            <circle cx="74" cy="98" r="2.5" fill="#38BDF8" />
            <circle cx="126" cy="98" r="2.5" fill="#38BDF8" />
          </g>
        ) : (
          /* Large Cute Sparkly Eyes */
          <g>
            {/* Left Eye */}
            <ellipse cx="80" cy="92" rx="10" ry="13" fill="#2B1810" />
            <ellipse cx="78" cy="88" rx="4" ry="5" fill="#FFFFFF" />
            <circle cx="83" cy="96" r="2" fill="#FFFFFF" />
            
            {/* Right Eye */}
            <ellipse cx="120" cy="92" rx="10" ry="13" fill="#2B1810" />
            <ellipse cx="118" cy="88" rx="4" ry="5" fill="#FFFFFF" />
            <circle cx="123" cy="96" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Cute Pink Nose */}
        <polygon points="96,102 104,102 100,106" fill="#FF758F" rx="1" />

        {/* Mouth */}
        {isTalking ? (
          /* Talking Mouth Open/Close Animation */
          <motion.ellipse
            cx="100"
            cy="112"
            rx="6"
            ry="6"
            fill="#E11D48"
            animate={{ ry: [3, 8, 3] }}
            transition={{ repeat: Infinity, duration: 0.25 }}
          />
        ) : isHappy ? (
          /* Big Smile */
          <path d="M 92 107 Q 100 117 108 107" stroke="#3D291D" strokeWidth="2.5" strokeLinecap="round" fill="#FF758F" />
        ) : isSad ? (
          /* Frown */
          <path d="M 94 113 Q 100 107 106 113" stroke="#3D291D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          /* Cute :3 Mouth */
          <path d="M 92 107 Q 96 112 100 107 Q 104 112 108 107" stroke="#3D291D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Whiskers */}
        <g stroke="#8C7063" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          {/* Left Whiskers */}
          <line x1="58" y1="98" x2="36" y2="94" />
          <line x1="58" y1="104" x2="34" y2="104" />
          {/* Right Whiskers */}
          <line x1="142" y1="98" x2="164" y2="94" />
          <line x1="142" y1="104" x2="166" y2="104" />
        </g>

      </motion.svg>
    </div>
  );
}
