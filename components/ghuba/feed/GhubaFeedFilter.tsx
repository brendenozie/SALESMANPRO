"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiArrowLeft, HiArrowsPointingOut, HiArrowsPointingIn, HiBolt } from "react-icons/hi2";
import { FeedListingType } from "@/lib/ghuba-feed-service";

interface GhubaFeedFilterProps {
  currentType: FeedListingType | null;
  onSelectType: (type: FeedListingType | null) => void;
  backUrl?: string;
  isDataSaver?: boolean;
  onToggleDataSaver?: () => void;
}

const TABS: { label: string; value: FeedListingType | null }[] = [
  { label: "For You", value: null },
  { label: "Products", value: "ECOMMERCE" },
  { label: "Services", value: "SERVICE" },
  { label: "Vehicles", value: "AUTO" },
  { label: "Property", value: "PROPERTY" },
];

export const GhubaFeedFilter: React.FC<GhubaFeedFilterProps> = ({
  currentType,
  onSelectType,
  backUrl = "/",
  isDataSaver = false,
  onToggleDataSaver,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setFullscreenSupported(Boolean(document.fullscreenEnabled));
      const onFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignored if user or browser policy rejects fullscreen
    }
  };

  return (
    <header
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-auto"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
      role="banner"
    >
      {/* 1. Back to Marketplace */}
      <Link
        href={backUrl}
        prefetch={true}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/90 hover:bg-black/75 hover:text-white transition-colors active:scale-95 shadow-md"
        aria-label="Back to Marketplace"
        title="Back to Marketplace"
      >
        <HiArrowLeft className="h-5 w-5" />
      </Link>

      {/* 2. Filter Tabs */}
      <nav 
        className="flex items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 shadow-lg"
        aria-label="Reel categories"
      >
        {TABS.map((tab) => {
          const isActive = currentType === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onSelectType(tab.value)}
              aria-pressed={isActive}
              className={`rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? "bg-white text-black shadow-sm font-bold"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Action / Data Saver / Fullscreen */}
      <div className="flex items-center gap-1.5">
        {/* Data Saver Mode Toggle */}
        {onToggleDataSaver && (
          <button
            type="button"
            onClick={onToggleDataSaver}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors shadow-md active:scale-95 ${
              isDataSaver
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                : "bg-black/50 border-white/15 text-white/70 hover:text-white"
            }`}
            aria-label={isDataSaver ? "Data Saver mode active (tap to turn off)" : "Enable Data Saver mode"}
            title={isDataSaver ? "Data Saver ON (conserving data)" : "Turn on Data Saver mode"}
          >
            <HiBolt className={`h-3.5 w-3.5 ${isDataSaver ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="hidden sm:inline">{isDataSaver ? "Saver ON" : "Saver"}</span>
          </button>
        )}

        {fullscreenSupported && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/80 hover:text-white hover:bg-black/75 transition-colors active:scale-95 shadow-md"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <HiArrowsPointingIn className="h-4 w-4" />
            ) : (
              <HiArrowsPointingOut className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
