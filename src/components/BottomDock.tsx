import React from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Flame,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { CHAPTERS, ChapterId } from "../data/birthdayContent";

interface BottomDockProps {
  activeChapter: ChapterId;
  explore3D: boolean;
  candlesLit: boolean;
  collapsed: boolean;
  onSelectChapter: (chapter: ChapterId) => void;
  onToggleExplore3D: () => void;
  onToggleCandles: () => void;
  onCelebrate: () => void;
  onToggleCollapsed: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeChapter,
  explore3D,
  candlesLit,
  collapsed,
  onSelectChapter,
  onToggleExplore3D,
  onToggleCandles,
  onCelebrate,
  onToggleCollapsed,
}) => {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 flex w-[min(920px,94vw)] -translate-x-1/2 flex-col items-center">
      {/* Collapsible Zen / Cinema Mode Toggle attached to top edge of dock */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        title="Toggle controls (H)"
        className="pointer-events-auto mb-1.5 inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-full border border-[#E7C989]/70 bg-[#FFFDF9]/95 px-3.5 py-1 text-xs font-medium text-ink-soft shadow-xs transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
      >
        {collapsed ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Show Controls
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            Hide Controls
          </>
        )}
      </button>

      {/* Unified Horizontal Bottom Control Dock — solid/rgba surface, zero backdrop-filter over WebGL */}
      <motion.nav
        aria-label="Birthday keepsake navigation"
        initial={false}
        animate={{
          y: collapsed ? 110 : 0,
          opacity: collapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: collapsed ? "none" : "auto" }}
        className="flex w-full items-center justify-between gap-2 overflow-x-auto rounded-2xl border border-[#E7C989]/75 bg-[rgba(255,253,249,0.96)] px-2.5 py-2 shadow-lg"
      >
        {/* Chapter Tabs */}
        <div
          role="tablist"
          aria-label="Birthday chapters"
          className="flex items-center gap-1"
        >
          {CHAPTERS.map((chapter) => {
            const isActive = !explore3D && activeChapter === chapter.id;
            return (
              <button
                key={chapter.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onSelectChapter(chapter.id)}
                className={`min-h-[38px] cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap shrink-0 sm:text-[13px] ${
                  isActive
                    ? "bg-blush-400 text-white shadow-xs"
                    : "text-ink-soft hover:bg-[#FFF0F5] hover:text-ink"
                }`}
              >
                {chapter.label}
              </button>
            );
          })}
        </div>

        {/* Hairline Separator */}
        <div
          aria-hidden="true"
          className="hidden h-6 w-px shrink-0 bg-[#EADCE2] sm:block"
        />

        {/* 3D Scene Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleCandles}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#E7C989]/75 bg-[#FCF7EE] px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-[#FFF0F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap shrink-0"
          >
            {candlesLit ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-blush-400" />
                Wish
              </>
            ) : (
              <>
                <Flame className="h-3.5 w-3.5 text-gold-500" />
                Relight
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleExplore3D}
            aria-pressed={explore3D}
            className={`inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap shrink-0 ${
              explore3D
                ? "border-lavender-400 bg-lavender-400 text-white"
                : "border-[#E9DCE3] bg-[#FFFDF9] text-ink-soft hover:bg-[#F7F4FF] hover:text-ink"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            3D Orbit
          </button>

          <button
            type="button"
            onClick={onCelebrate}
            aria-label="Launch birthday confetti"
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#E9DCE3] bg-[#FFF8FB] px-3 py-1.5 text-xs font-semibold text-blush-500 transition-colors hover:bg-blush-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap shrink-0"
          >
            <PartyPopper className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Confetti</span>
          </button>
        </div>
      </motion.nav>
    </div>
  );
};
