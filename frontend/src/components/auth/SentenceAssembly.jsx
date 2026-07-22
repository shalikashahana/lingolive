import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SENTENCES = [
  ["Confidence", "is", "built", "one", "sentence", "at", "a", "time."],
  ["Fluency", "is", "a", "habit,", "not", "a", "gift."],
  ["Every", "word", "you", "learn", "opens", "a", "door."],
];

export default function SentenceAssembly() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("assembling"); // assembling -> holding -> dissolving

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("holding"), 2200);
    const t2 = setTimeout(() => setPhase("dissolving"), 4200);
    const t3 = setTimeout(() => {
      setIndex((i) => (i + 1) % SENTENCES.length);
      setPhase("assembling");
    }, 4900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [index]);

  const words = SENTENCES[index];

  return (
    <div className="relative flex h-64 w-full max-w-md flex-wrap items-center justify-center gap-x-2 gap-y-3">
      <AnimatePresence mode="wait">
        {phase !== "dissolving" ? (
          <motion.div
            key={`sentence-${index}`}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3"
          >
            {words.map((word, i) => (
              <motion.span
                key={`${index}-${i}`}
                initial={{
                  opacity: 0,
                  x: (i % 2 === 0 ? -1 : 1) * (40 + i * 8),
                  y: (i % 3 === 0 ? -1 : 1) * (24 + i * 4),
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{
                  delay: i * 0.12,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                className="font-display text-2xl text-bone md:text-3xl"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`dissolve-${index}`}
            initial={{ opacity: 1, filter: "blur(0px)" }}
            animate={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.6 }}
            className="font-display text-2xl text-bone md:text-3xl"
          >
            {words.join(" ")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
