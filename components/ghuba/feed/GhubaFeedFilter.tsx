"use client";

import React from "react";
import Link from "next/link";
import { HiArrowLeft, HiSparkles } from "react-icons/hi2";
import { FeedListingType } from "@/lib/ghuba-feed-service";

interface GhubaFeedFilterProps {
  currentType: FeedListingType | null;
  onSelectType: (type: FeedListingType | null) => void;
  backUrl?: string;
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
  backUrl = "/site/ghuba",
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pt-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      {/* Back Button */}
      <Link
        href={backUrl}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 hover:text-white transition-colors"
        aria-label="Back to Marketplace"
        title="Back to Marketplace"
      >
        <HiArrowLeft className="h-5 w-5" />
      </Link>

      {/* Filter Tabs */}
      <nav className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 p-1 backdrop-blur-md">
        {TABS.map((tab) => {
          const isActive = currentType === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onSelectType(tab.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-black shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Ghuba Live / Reels Badge */}
      <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-400 backdrop-blur-md">
        <HiSparkles className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">GHUBA REELS</span>
      </div>
    </header>
  );
};
