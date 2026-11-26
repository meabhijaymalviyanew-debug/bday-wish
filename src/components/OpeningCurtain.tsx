import React, { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Heart, Sparkles } from "lucide-react";
import { OPENING_COPY } from "../data/birthdayContent";

interface OpeningCurtainProps {
  onOpenSurprise: () => void;
}

const CELEBRATION_HEARTS = Array.from({ length: 14 }, (_, idx) => ({
  id: idx,
  left: `${8 + ((idx * 19) % 84)}%`,
  delay: idx * 0.045,
  isHeart: idx % 2 === 0,
}));

export const OpeningCurtain: React.FC<OpeningCurtainProps> = ({
  onOpenSurprise,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    const palette = ["#DC6D96", "#FFD1E2", "#BCA9F0", "#E7C989", "#FFFDF9"];
    confetti({
      particleCount: 95,
      spread: 82,
      origin: { y: 0.56 },
      colors: palette,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0.08, y: 0.65 },
        colors: palette,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 0.92, y: 0.65 },
        colors: palette,
      });
    }, 200);

    window.setTimeout(() => {
      onOpenSurprise();
    }, 860);
  };

  return (
    <motion.div
      key="opening-curtain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-40 flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF6F9] via-[#FCF6EA] to-[#F3ECFF] px-6"
    >
      {/* Subtle static ambient pastel glow spheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#FFD6E6]/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-[#DDD2FA]/45 blur-3xl"
      />

      {/* Rising hearts & sparkles triggered on button click */}
      {isOpening && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {CELEBRATION_HEARTS.map((item) => (
            <motion.div
              key={item.id}
              style={{ left: item.left }}
              initial={{ opacity: 0, y: "72vh", scale: 0.7 }}
              animate={{
                opacity: [0, 1, 0],
                y: "-12vh",
                scale: [0.7, 1.2, 0.9],
              }}
              transition={{
                duration: 1.05,
                delay: item.delay,
                ease: "easeOut",
              }}
              className="absolute text-blush-400"
            >
              {item.isHeart ? (
                <Heart className="h-5 w-5 fill-blush-300" />
              ) : (
                <Sparkles className="h-5 w-5 text-gold-400" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Stationery Invitation Card */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="keepsake-frame-shadow relative z-10 w-full max-w-lg rounded-[2rem] border border-[#E7C989]/60 bg-[#FFFDF9] px-8 py-12 text-center sm:px-12 sm:py-14"
      >
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F5] text-blush-400">
          <Sparkles className="h-6 w-6" />
        </div>

        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl [text-wrap:balance]">
          {OPENING_COPY.heading}
        </h1>

        <p className="mx-auto mt-5 max-w-md font-sans text-base leading-relaxed text-ink-soft sm:text-lg">
          {OPENING_COPY.subtext}
        </p>

        <div className="mt-10">
          <motion.button
            type="button"
            onClick={handleOpen}
            disabled={isOpening}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#DC6D96] via-[#CD7AB4] to-[#9E84DB] px-8 py-3.5 font-sans text-base font-semibold text-white shadow-md transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:ring-offset-2 disabled:opacity-80 whitespace-nowrap"
          >
            <span>{isOpening ? "Opening Your Surprise..." : OPENING_COPY.cta}</span>
          </motion.button>
        </div>

        <p className="mt-7 font-script text-2xl text-ink-soft/80">
          crafted with warmth &amp; gratitude
        </p>
      </motion.div>
    </motion.div>
  );
};
