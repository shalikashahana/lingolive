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
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        telugu: ["'Noto Sans Telugu'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
