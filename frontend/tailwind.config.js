/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        bone: "#F3EFE4",
        gold: "#C9A227",
        moss: "#3F6656",
        charcoal: "#24211B",
        // New landing page palette
        lingo: {
          deep:    "#1a0a3c",
          purple:  "#2d1b69",
          violet:  "#4c2d8a",
          lavender:"#7c5cbf",
          pink:    "#e879b8",
          rose:    "#f4a6d0",
          sky:     "#a78bfa",
        },
      },
      fontFamily: {
        display:  ["Fraunces", "serif"],
        sans:     ["'Plus Jakarta Sans'", "sans-serif"],
        mono:     ["'IBM Plex Mono'", "monospace"],
        telugu:   ["'Noto Sans Telugu'", "sans-serif"],
        script:   ["'Pacifico'", "cursive"],
        body:     ["'Nunito'", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%":     { transform: "translateY(-18px) rotate(2deg)" },
        },
        twinkle: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%":     { opacity: "0.3", transform: "scale(0.6)" },
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        bubblePop: {
          "0%":   { opacity: "0", transform: "scale(0.5)" },
          "80%":  { transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        float:      "float 4s ease-in-out infinite",
        floatSlow:  "floatSlow 6s ease-in-out infinite",
        twinkle:    "twinkle 2s ease-in-out infinite",
        slideInUp:  "slideInUp 0.8s ease-out forwards",
        bubblePop:  "bubblePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [], // Trigger rebuild
};
