import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Flower2,
  Heart,
  PartyPopper,
  Ribbon,
  RotateCcw,
  Sparkles,
  Star,
  Sun,
  X,
} from "lucide-react";
import {
  ChapterId,
  HEARTFELT_WISHES,
  HERO_COPY,
  ILLUSTRATION_CAPTION,
  LETTER_HEADING,
  LETTER_PARAGRAPHS,
  REMEMBER_CARDS,
  RememberCardItem,
} from "../data/birthdayContent";
import { IllustrationFrame } from "./IllustrationFrame";

interface ChapterOverlayProps {
  activeChapter: ChapterId;
  explore3D: boolean;
  candlesLit: boolean;
  wishGranted: boolean;
  illustrationUrl: string | null;
  celebrateClicks: number;
  onMakeWish: () => void;
  onRelightCandles: () => void;
  onSelectIllustration: (file: File) => void;
  onCelebrate: () => void;
  onNextChapter: () => void;
  onCloseTo3D: () => void;
}

const renderRememberIcon = (icon: RememberCardItem["icon"]) => {
  switch (icon) {
    case "heart":
      return <Heart className="h-5 w-5 fill-blush-200 text-blush-400" />;
    case "sun":
      return <Sun className="h-5 w-5 text-gold-500" />;
    case "sparkles":
      return <Sparkles className="h-5 w-5 text-lavender-400" />;
    case "star":
      return <Star className="h-5 w-5 fill-gold-300 text-gold-500" />;
    case "flower":
      return <Flower2 className="h-5 w-5 text-blush-400" />;
    case "ribbon":
      return <Ribbon className="h-5 w-5 text-lavender-400" />;
  }
};

export const ChapterOverlay: React.FC<ChapterOverlayProps> = ({
  activeChapter,
  explore3D,
  candlesLit,
  wishGranted,
  illustrationUrl,
  celebrateClicks,
  onMakeWish,
  onRelightCandles,
  onSelectIllustration,
  onCelebrate,
  onNextChapter,
  onCloseTo3D,
}) => {
  const [openCards, setOpenCards] = useState<number[]>([]);

  const toggleCard = (id: number) => {
    setOpenCards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (explore3D) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {activeChapter === "cake" && (
        <motion.div
          key="chapter-cake"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between px-4 pb-28 pt-16 sm:px-8 sm:pb-32 sm:pt-18"
        >
          {/* Top Hero Title — Center viewport stays 100% open for the 3D Cake */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl md:text-[3.45rem] [text-wrap:balance]">
              {HERO_COPY.heading}
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-sans text-sm leading-relaxed text-ink-soft sm:text-base">
              {HERO_COPY.subtext}
            </p>
          </motion.div>

          {/* Bottom Interactive Wish Action above Dock */}
          <div className="pointer-events-auto mx-auto flex flex-col items-center gap-2.5">
            <AnimatePresence mode="wait">
              {candlesLit ? (
                <motion.div
                  key="make-wish-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.button
                    type="button"
                    onClick={onMakeWish}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#DC6D96] to-[#B08CE2] px-7 py-3 font-sans text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:ring-offset-2 sm:text-base whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4" />
                    {HERO_COPY.wishButton}
                  </motion.button>
                  <p className="font-sans text-xs text-ink-soft">
                    Drag to orbit the 3D cake · Click the candles or press Make a
                    Wish
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="wish-granted-wrap"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="rounded-2xl border border-[#E7C989]/70 bg-[#FFFDF9]/95 px-6 py-3 shadow-sm">
                    <p className="font-serif text-xl font-semibold text-ink sm:text-2xl">
                      {HERO_COPY.wishGranted}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {wishGranted && (
                      <button
                        type="button"
                        onClick={onRelightCandles}
                        className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-blush-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 rounded px-2 whitespace-nowrap"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Relight candles
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onNextChapter}
                      className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 text-xs font-semibold text-blush-500 transition-colors hover:text-blush-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 rounded px-2 whitespace-nowrap"
                    >
                      Continue to Memory
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {activeChapter === "memory" && (
        <motion.div
          key="chapter-memory"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 pb-28 pt-16 sm:px-8"
        >
          <div className="pointer-events-auto keepsake-scroll max-h-full w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#E7C989]/65 bg-[#FFFDF9]/96 p-6 shadow-lg sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-soft">
                  Chapter 02 · Keepsake Illustration
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">
                  A Cherished Snapshot
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseTo3D}
                aria-label="Inspect 3D easel"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E9DCE3] bg-[#FFF8FB] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <IllustrationFrame
              illustrationUrl={illustrationUrl}
              caption={ILLUSTRATION_CAPTION}
              onSelectFile={onSelectIllustration}
            />

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-soft">
                Also displayed on the 3D gilded easel
              </span>
              <button
                type="button"
                onClick={onNextChapter}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-blush-400 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                Read the Letter
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeChapter === "letter" && (
        <motion.div
          key="chapter-letter"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 pb-28 pt-16 sm:px-8"
        >
          <article className="letter-stationery keepsake-frame-shadow keepsake-scroll pointer-events-auto relative max-h-full w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#E7C989]/70 px-6 py-8 sm:px-12 sm:py-11">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#EADBC4] pb-4">
              <div>
                <p className="text-xs font-medium text-ink-soft">
                  Chapter 03 · Personal Note
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">
                  {LETTER_HEADING}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseTo3D}
                aria-label="Close letter to explore 3D"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E8D7BE] bg-[#FFFDF9] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 font-serif text-[1.18rem] leading-[1.82] text-ink sm:text-[1.3rem] sm:leading-[1.88]">
              {LETTER_PARAGRAPHS.map((paragraph, index) => {
                const isSalutation = index === 0;
                const isClosing = index === LETTER_PARAGRAPHS.length - 1;
                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.045, 0.38),
                    }}
                    className={
                      isSalutation
                        ? "font-script text-3xl font-bold text-blush-500 sm:text-4xl"
                        : isClosing
                          ? "pt-2 font-serif text-xl font-semibold italic text-ink sm:text-2xl"
                          : ""
                    }
                  >
                    {paragraph}
                  </motion.p>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#EADBC4] pt-5">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <Heart className="h-4 w-4 fill-blush-300 text-blush-400" />
                <span>Sealed with genuine gratitude</span>
              </div>
              <button
                type="button"
                onClick={onNextChapter}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-blush-400 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                Little Reminders
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        </motion.div>
      )}

      {activeChapter === "remember" && (
        <motion.div
          key="chapter-remember"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 pb-28 pt-16 sm:px-8"
        >
          <div className="pointer-events-auto keepsake-scroll max-h-full w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[#E7C989]/65 bg-[#FFFDF9]/96 p-6 shadow-lg sm:p-9">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-soft">
                  Chapter 04 · Tap each card to reveal its note
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl [text-wrap:balance]">
                  Little Things I Want You To Remember
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseTo3D}
                aria-label="Close cards to explore 3D"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E9DCE3] bg-[#FFF8FB] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REMEMBER_CARDS.map((card, idx) => {
                const isOpen = openCards.includes(card.id);
                return (
                  <motion.button
                    key={card.id}
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    aria-expanded={isOpen}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    className={`group flex min-h-[168px] w-full cursor-pointer flex-col justify-between rounded-2xl border border-[#ECDFE5] ${card.tintClass} p-5 text-left transition-colors hover:border-blush-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs">
                        {renderRememberIcon(card.icon)}
                      </div>
                      <span className="font-sans text-xs font-medium text-ink-soft tabular-nums">
                        {isOpen ? "Opened" : `0${card.id}`}
                      </span>
                    </div>

                    <div className="mt-4 flex-1">
                      <AnimatePresence mode="wait">
                        {!isOpen ? (
                          <motion.div
                            key="front"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <h3 className="font-serif text-2xl font-semibold text-ink">
                              {card.title}
                            </h3>
                            <p className="mt-1.5 text-xs text-ink-soft">
                              Click to open note
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="revealed"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.25 }}
                          >
                            <p className="font-serif text-[1.22rem] font-semibold leading-snug text-ink">
                              &ldquo;{card.message}&rdquo;
                            </p>
                            <p className="mt-2.5 text-xs font-medium text-blush-500">
                              Click to fold
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-soft tabular-nums">
                {openCards.length} of {REMEMBER_CARDS.length} reminders opened
              </span>
              <button
                type="button"
                onClick={onNextChapter}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-blush-400 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                Birthday Wishes
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeChapter === "wishes" && (
        <motion.div
          key="chapter-wishes"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 pb-28 pt-16 sm:px-8"
        >
          <div className="pointer-events-auto keepsake-scroll max-h-full w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#E7C989]/65 bg-[#FFFDF9]/96 p-6 shadow-lg sm:p-9">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-ink-soft">
                  Chapter 05 · Birthday Blessings
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl [text-wrap:balance]">
                  A Few Wishes From My Heart ✨
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseTo3D}
                aria-label="Close wishes to explore 3D"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E9DCE3] bg-[#FFF8FB] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="space-y-3.5">
              {HEARTFELT_WISHES.map((wish, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.11,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -2.5, 0] }}
                    transition={{
                      duration: 4.2 + idx * 0.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-[#EFE2E8] bg-[#FFF8FB] px-5 py-4"
                  >
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FDF3DF] text-xs font-semibold text-gold-500 tabular-nums">
                      0{idx + 1}
                    </span>
                    <p className="font-serif text-xl font-medium leading-relaxed text-ink sm:text-[1.35rem]">
                      {wish}
                    </p>
                  </motion.div>
                </motion.li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCelebrate}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#E7C989] bg-[#FCF7EE] px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-blush-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                Release Birthday Sparkles
              </button>
              <button
                type="button"
                onClick={onNextChapter}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-blush-400 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                Final Surprise
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeChapter === "finale" && (
        <motion.div
          key="chapter-finale"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center px-4 pb-28 pt-16 sm:px-8"
        >
          <div className="pointer-events-auto keepsake-scroll max-h-full w-full max-w-xl overflow-y-auto rounded-[2rem] border border-[#E7C989]/70 bg-[#FFFDF9]/96 px-6 py-7 text-center shadow-lg sm:px-10 sm:py-9">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onCloseTo3D}
                aria-label="Close finale card to explore 3D"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#E9DCE3] bg-[#FFF8FB] text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="font-serif text-3xl font-bold text-ink sm:text-4xl [text-wrap:balance]">
              Happy Birthday Once Again, Riya Didi! 🎂💗
            </h2>

            <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-soft sm:text-base">
              Keep smiling that warm smile, keep shining just the way you do,
              and always remember how deeply appreciated you are.
            </p>

            <div className="mt-6">
              <IllustrationFrame
                illustrationUrl={illustrationUrl}
                compact
                onSelectFile={onSelectIllustration}
              />
            </div>

            <p className="mt-5 font-script text-3xl text-blush-500">
              Stay happy always, Didi ✨
            </p>

            <div className="mt-5 flex flex-col items-center gap-2.5">
              <motion.button
                type="button"
                onClick={onCelebrate}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#DC6D96] via-[#CD7AB4] to-[#9E84DB] px-7 py-3 font-sans text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:ring-offset-2 sm:text-base whitespace-nowrap"
              >
                <PartyPopper className="h-4 w-4" />
                Shower Birthday Confetti ✨
              </motion.button>

              {celebrateClicks > 0 && (
                <p className="text-xs font-medium text-ink-soft tabular-nums">
                  {celebrateClicks === 1
                    ? "Sending you a warm birthday cheer! 💗"
                    : `Sending ${celebrateClicks}x extra birthday smiles your way! 💗`}
                </p>
              )}
            </div>

            <p className="mt-6 border-t border-[#EFE2E8] pt-4 text-xs text-ink-soft/80">
              Made with genuine affection &amp; gratitude — Wishing you the
              happiest year ahead ❤️
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
