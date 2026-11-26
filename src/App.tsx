import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  CHAPTERS,
  ChapterId,
  ILLUSTRATION_STORAGE_KEY,
} from "./data/birthdayContent";
import { BirthdayCanvas } from "./components/BirthdayCanvas";
import { OpeningCurtain } from "./components/OpeningCurtain";
import { ChapterOverlay } from "./components/ChapterOverlay";
import { BottomDock } from "./components/BottomDock";
import { InteractiveTarget } from "./three/BirthdaySceneManager";

const PASTEL_CONFETTI = [
  "#DC6D96",
  "#FFD1E2",
  "#BCA9F0",
  "#E7C989",
  "#FFFDF9",
];

function firePastelConfetti(intensity: "gentle" | "grand" = "gentle"): void {
  confetti({
    particleCount: intensity === "grand" ? 105 : 70,
    spread: intensity === "grand" ? 84 : 72,
    origin: { y: 0.62 },
    colors: PASTEL_CONFETTI,
  });

  if (intensity === "grand") {
    window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 58,
        origin: { x: 0.08, y: 0.68 },
        colors: PASTEL_CONFETTI,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 58,
        origin: { x: 0.92, y: 0.68 },
        colors: PASTEL_CONFETTI,
      });
    }, 180);
  }
}

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [activeChapter, setActiveChapter] = useState<ChapterId>("cake");
  const [explore3D, setExplore3D] = useState(false);
  const [candlesLit, setCandlesLit] = useState(true);
  const [wishGranted, setWishGranted] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(ILLUSTRATION_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const currentChapterMeta = useMemo(
    () => CHAPTERS.find((c) => c.id === activeChapter) ?? CHAPTERS[0],
    [activeChapter]
  );
  const currentIndex = useMemo(
    () => CHAPTERS.findIndex((c) => c.id === activeChapter),
    [activeChapter]
  );

  // Keyboard shortcut 'H' to toggle Zen/Cinema dock visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "h" || e.key === "H") {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenSurprise = useCallback(() => {
    setIsOpened(true);
    setActiveChapter("cake");
    setExplore3D(false);
    setCelebrationCount((c) => c + 1);
  }, []);

  const handleMakeWish = useCallback(() => {
    setCandlesLit(false);
    setWishGranted(true);
    setCelebrationCount((c) => c + 1);
    firePastelConfetti("grand");
  }, []);

  const handleRelightCandles = useCallback(() => {
    setCandlesLit(true);
    setWishGranted(false);
  }, []);

  const handleToggleCandles = useCallback(() => {
    if (candlesLit) {
      handleMakeWish();
    } else {
      handleRelightCandles();
    }
  }, [candlesLit, handleMakeWish, handleRelightCandles]);

  const handleCelebrate = useCallback(() => {
    setCelebrationCount((c) => c + 1);
    firePastelConfetti("grand");
  }, []);

  const handleSelectChapter = useCallback((chapter: ChapterId) => {
    setActiveChapter(chapter);
    setExplore3D(false);
  }, []);

  const handleNextChapter = useCallback(() => {
    const nextIdx = (currentIndex + 1) % CHAPTERS.length;
    setActiveChapter(CHAPTERS[nextIdx].id);
    setExplore3D(false);
  }, [currentIndex]);

  const handleSelectIllustration = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setIllustrationUrl(result);
      try {
        window.localStorage.setItem(ILLUSTRATION_STORAGE_KEY, result);
      } catch {
        // Large images may exceed localStorage quota; still rendered in session
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Direct 3D raycast interaction callbacks
  const handleSceneInteract = useCallback(
    (target: InteractiveTarget) => {
      if (!isOpened) return;
      if (target === "candles") {
        setActiveChapter("cake");
        setExplore3D(false);
        if (candlesLit) {
          handleMakeWish();
        } else {
          handleRelightCandles();
        }
      } else if (target === "easel") {
        setActiveChapter("memory");
        setExplore3D(false);
      } else if (target === "letter") {
        setActiveChapter("letter");
        setExplore3D(false);
      } else if (target === "gifts") {
        firePastelConfetti("gentle");
        setActiveChapter("remember");
        setExplore3D(false);
      }
    },
    [isOpened, candlesLit, handleMakeWish, handleRelightCandles]
  );

  // Use panoramic overview when opening curtain is up, else active chapter camera preset
  const cameraPosition: [number, number, number] = isOpened
    ? currentChapterMeta.cameraPosition
    : [0, 3.8, 9.2];
  const cameraTarget: [number, number, number] = isOpened
    ? currentChapterMeta.cameraTarget
    : [0, 1.35, 0];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#FAF2F5]">
      {/* Full-Bleed 3D Birthday Keepsake Stage */}
      <BirthdayCanvas
        cameraPosition={cameraPosition}
        cameraTarget={cameraTarget}
        candlesLit={candlesLit}
        illustrationUrl={illustrationUrl}
        celebrationCount={celebrationCount}
        onInteract={handleSceneInteract}
      />

      {/* Opening Curtain Experience */}
      <AnimatePresence>
        {!isOpened && (
          <OpeningCurtain onOpenSurprise={handleOpenSurprise} />
        )}
      </AnimatePresence>

      {/* Main Birthday Experience UI */}
      {isOpened && (
        <>
          {/* Minimal Single-Row Header */}
          <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 flex items-center justify-between gap-6 px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => handleSelectChapter("cake")}
              className="pointer-events-auto cursor-pointer font-serif text-xl font-bold tracking-tight text-ink transition-colors hover:text-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 rounded whitespace-nowrap shrink-0"
            >
              For Riya Didi
            </button>

            <div className="pointer-events-auto flex items-center gap-4 text-xs font-medium text-ink-soft">
              <span className="hidden tabular-nums sm:inline">
                0{currentIndex + 1} / 0{CHAPTERS.length} ·{" "}
                {currentChapterMeta.label}
              </span>
              {explore3D && (
                <button
                  type="button"
                  onClick={() => setExplore3D(false)}
                  className="min-h-[34px] cursor-pointer rounded-full border border-[#E7C989]/80 bg-[#FFFDF9]/95 px-3.5 py-1 text-xs font-semibold text-ink shadow-xs transition-colors hover:bg-blush-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap shrink-0"
                >
                  Back to {currentChapterMeta.label}
                </button>
              )}
            </div>
          </header>

          {/* Active Chapter Keepsake Content */}
          <ChapterOverlay
            activeChapter={activeChapter}
            explore3D={explore3D}
            candlesLit={candlesLit}
            wishGranted={wishGranted}
            illustrationUrl={illustrationUrl}
            celebrateClicks={celebrationCount}
            onMakeWish={handleMakeWish}
            onRelightCandles={handleRelightCandles}
            onSelectIllustration={handleSelectIllustration}
            onCelebrate={handleCelebrate}
            onNextChapter={handleNextChapter}
            onCloseTo3D={() => setExplore3D(true)}
          />

          {/* Collapsible Bottom Control Dock */}
          <BottomDock
            activeChapter={activeChapter}
            explore3D={explore3D}
            candlesLit={candlesLit}
            collapsed={dockCollapsed}
            onSelectChapter={handleSelectChapter}
            onToggleExplore3D={() => setExplore3D((prev) => !prev)}
            onToggleCandles={handleToggleCandles}
            onCelebrate={handleCelebrate}
            onToggleCollapsed={() => setDockCollapsed((prev) => !prev)}
          />
        </>
      )}
    </div>
  );
}
