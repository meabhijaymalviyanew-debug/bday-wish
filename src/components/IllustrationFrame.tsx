import React, { useRef } from "react";
import { motion } from "motion/react";
import { Heart, ImagePlus, Sparkles } from "lucide-react";

interface IllustrationFrameProps {
  illustrationUrl: string | null;
  caption?: string;
  compact?: boolean;
  onSelectFile: (file: File) => void;
}

export const IllustrationFrame: React.FC<IllustrationFrameProps> = ({
  illustrationUrl,
  caption,
  compact = false,
  onSelectFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto w-full ${compact ? "max-w-sm" : "max-w-md"}`}
    >
      {/* Floating decorative sparkles around frame */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-3 -top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E7C989]/70 bg-[#FFFDF9] text-gold-400 shadow-sm"
      >
        <Sparkles className="h-4 w-4" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-3 -right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-blush-200 bg-[#FFFDF9] text-blush-400 shadow-sm"
      >
        <Heart className="h-4 w-4 fill-blush-200" />
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload custom anime illustration"
      />

      {/* Rounded Archival Keepsake Frame */}
      <div className="keepsake-frame-shadow overflow-hidden rounded-[1.75rem] border border-[#E7C989]/75 bg-[#FFFDF9] p-3.5 sm:p-4">
        <div className="overflow-hidden rounded-[1.25rem] border border-[#F0E1C4] bg-[#FCF7EE]">
          {illustrationUrl ? (
            <div className="relative">
              <img
                src={illustrationUrl}
                alt="Custom anime illustration for Riya Didi"
                referrerPolicy="no-referrer"
                className={`block w-full object-contain bg-[#FFFDF8] ${
                  compact ? "max-h-[240px]" : "max-h-[340px]"
                }`}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2.5 right-2.5 inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-[#E7C989]/80 bg-[#FFFDF9]/95 px-3.5 py-1.5 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-blush-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 whitespace-nowrap"
              >
                <ImagePlus className="h-3.5 w-3.5 text-blush-400" />
                Change Image
              </button>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center px-6 text-center ${
                compact ? "py-8" : "py-12"
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F5] text-blush-400">
                <ImagePlus className="h-5 w-5" />
              </div>
              <p className="font-serif text-2xl font-semibold text-ink">
                Your Custom Anime Illustration
              </p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
                Place your exact artwork here without altering a single pixel—it
                will also appear inside the 3D gilded easel on stage.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full bg-blush-400 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blush-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush-400 focus-visible:ring-offset-2 whitespace-nowrap"
              >
                <ImagePlus className="h-4 w-4" />
                Upload Illustration
              </button>
            </div>
          )}
        </div>

        {caption && (
          <p className="pb-1 pt-4 text-center font-script text-2xl text-ink sm:text-[1.7rem]">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
};
