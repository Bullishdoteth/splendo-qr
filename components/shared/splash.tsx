"use client";

import { useEffect, useState } from "react";
import { Utensils, Sparkles } from "lucide-react";

interface SplashScreenProps {
  /** Cookie key used to track if user has seen splash screen */
  cookieName?: string;
  /** Expiration time in seconds for the cookie (default 24h = 86400s) */
  cookieMaxAgeSeconds?: number;
  /** Minimum display duration in ms before fading out (default: 2200ms) */
  durationMs?: number;
  /** Force show for previewing / testing */
  forceShow?: boolean;
  /** Callback fired when splash screen finishes dismissing */
  onComplete?: () => void;
}

export function SplashScreen({
  cookieName = "splendo_splash_seen",
  cookieMaxAgeSeconds = 86400, // 24 hours
  durationMs = 2200,
  forceShow = false,
  onComplete,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Helper to check cookie on client
    const hasSeenSplash = (): boolean => {
      if (typeof document === "undefined") return false;
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            cookieName.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
            "=([^;]*)"
        )
      );
      return matches ? decodeURIComponent(matches[1]) === "true" : false;
    };

    // Helper to set cookie with max-age
    const setSplashCookie = () => {
      if (typeof document === "undefined") return;
      document.cookie = `${cookieName}=true; max-age=${cookieMaxAgeSeconds}; path=/; SameSite=Lax`;
    };

    if (!forceShow && hasSeenSplash()) {
      setIsVisible(false);
      return;
    }

    // New user or cookie expired: show splash & record cookie
    setIsVisible(true);
    setSplashCookie();

    // Smooth progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / durationMs) * 100), 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
      }
    }, 30);

    // Start fade out slightly before total duration
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(durationMs - 500, 500));

    // Hide completely after fade out completes
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, durationMs + 200);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [cookieName, cookieMaxAgeSeconds, durationMs, forceShow, onComplete]);

  // Don't render anything during initial client hydration check or when hidden
  if (isVisible === null || !isVisible) {
    return null;
  }

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      role="dialog"
      aria-label="Welcome to Splendo Hotel & Suites"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 bg-[#183B32] text-white select-none transition-all duration-700 ease-in-out cursor-pointer ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none backdrop-blur-none"
          : "opacity-100 scale-100 backdrop-blur-md"
      }`}
    >
      {/* Background Subtle Radial Glow & Luxury Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#235246] via-[#183B32] to-[#0F2822] opacity-90 pointer-events-none" />

      {/* Decorative Top Accent */}
      <div className="relative z-10 pt-10 flex items-center gap-2 text-white/50 text-[10px] tracking-[0.3em] font-medium uppercase">
        <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
        <span>Splendo Luxury Hospitality</span>
        <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
      </div>

      {/* Main Center Branding & Utensils Icon */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-6">
        {/* Utensils Icon with Glowing Animated Aura */}
        <div className="relative group">
          <div className="absolute -inset-4 rounded-full bg-white/10 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center transform transition duration-500 hover:scale-105">
            <Utensils className="w-12 h-12 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2 max-w-xs">
          <h1 className="text-3xl font-extrabold text-white tracking-[0.25em] font-sans drop-shadow-sm">
            SPLENDO
          </h1>
          <p className="text-xs font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
            Hotel & Suites
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mx-auto my-3" />
          <p className="text-xs text-stone-200/80 font-light tracking-wider">
            In-Room Gourmet Dining & Bar
          </p>
        </div>
      </div>

      {/* Bottom Progress & Loading Status */}
      <div className="relative z-10 w-full max-w-xs pb-8 space-y-3 text-center">
        {/* Progress Bar Container */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-200 via-white to-[#D4AF37] h-full transition-all duration-75 ease-out rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/60 font-mono tracking-wider">
          <span>Preparing menu...</span>
          <span>{progress}%</span>
        </div>

        <p className="text-[10px] text-white/40 italic">
          Tap anywhere to skip
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
