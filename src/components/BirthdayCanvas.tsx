import React, { useEffect, useRef, useState } from "react";
import {
  BirthdaySceneManager,
  InteractiveTarget,
} from "../three/BirthdaySceneManager";

interface BirthdayCanvasProps {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  candlesLit: boolean;
  illustrationUrl: string | null;
  celebrationCount: number;
  onInteract: (target: InteractiveTarget) => void;
}

export const BirthdayCanvas: React.FC<BirthdayCanvasProps> = ({
  cameraPosition,
  cameraTarget,
  candlesLit,
  illustrationUrl,
  celebrationCount,
  onInteract,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<BirthdaySceneManager | null>(null);
  const onInteractRef = useRef(onInteract);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  // Mount Three.js engine once in isolated container
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const manager = new BirthdaySceneManager(container, {
        onInteract: (target) => onInteractRef.current(target),
        onContextLost: () => setWebglUnavailable(true),
        onContextRestored: () => setWebglUnavailable(false),
      });
      managerRef.current = manager;

      return () => {
        manager.dispose();
        managerRef.current = null;
      };
    } catch {
      setWebglUnavailable(true);
      return undefined;
    }
  }, []);

  // Sync camera preset smoothly
  useEffect(() => {
    managerRef.current?.setCameraPreset(cameraPosition, cameraTarget);
  }, [cameraPosition, cameraTarget]);

  // Sync candle state
  useEffect(() => {
    managerRef.current?.setCandlesLit(candlesLit);
  }, [candlesLit]);

  // Sync uploaded illustration onto the 3D easel frame
  useEffect(() => {
    managerRef.current?.setIllustrationImage(illustrationUrl);
  }, [illustrationUrl]);

  // Trigger 3D ambient particle celebration boost
  useEffect(() => {
    if (celebrationCount > 0) {
      managerRef.current?.triggerCelebrationBurst();
    }
  }, [celebrationCount]);

  return (
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#FAF2F5]">
      <div
        ref={mountRef}
        className="h-full w-full"
        aria-label="Interactive 3D birthday keepsake scene for Riya Didi"
      />
      {webglUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#FFF6F9] via-[#FCF6EA] to-[#F4EEFF] p-8 text-center">
          <div className="max-w-md rounded-2xl border border-[#E7C989]/60 bg-[#FFFDF9] p-8 shadow-sm">
            <p className="font-serif text-2xl font-semibold text-ink">
              Happy Birthday, Riya Didi!
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              3D WebGL preview is currently paused on this device, but every
              letter, memory, and birthday wish is ready to enjoy below.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
