"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShareAlt,
  AiFillBook,
  AiOutlineBook,
  AiOutlineSound,
} from "react-icons/ai";
import { IoVolumeMuteOutline } from "react-icons/io5";
import { HiEllipsisHorizontal, HiCheckBadge } from "react-icons/hi2";
import { GhubaFeedItem } from "@/lib/ghuba-feed-service";

interface GhubaFeedActionsProps {
  item: GhubaFeedItem;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenComments: (item: GhubaFeedItem) => void;
  onUpdateEngagement?: (listingId: string, updates: Partial<GhubaFeedItem>) => void;
}

export const GhubaFeedActions: React.FC<GhubaFeedActionsProps> = ({
  item,
  isMuted,
  onToggleSound,
  onOpenComments,
  onUpdateEngagement,
}) => {
  const [liked, setLiked] = useState(item.viewerState.liked);
  const [likesCount, setLikesCount] = useState(item.engagement.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  const [saved, setSaved] = useState(item.viewerState.saved);
  const [savesCount, setSavesCount] = useState(item.engagement.savesCount);
  const [isSaving, setIsSaving] = useState(false);

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Format count (e.g., 1200 -> 1.2K)
  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    // Optimistic UI update
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);
    setIsLiking(true);

    try {
      const res = await fetch(`/api/ghuba/listings/${item.listingId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to like listings");
        } else {
          toast.error("Failed to update like");
        }
        // Rollback
        setLiked(!nextLiked);
        setLikesCount(likesCount);
        return;
      }

      const data = await res.json();
      if (typeof data.likesCount === "number") {
        setLikesCount(data.likesCount);
      }
      onUpdateEngagement?.(item.listingId, {
        viewerState: { ...item.viewerState, liked: nextLiked },
        engagement: { ...item.engagement, likesCount: nextCount },
      });
    } catch {
      // Rollback on network error
      setLiked(!nextLiked);
      setLikesCount(likesCount);
      toast.error("Network error updating like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;

    // Optimistic UI update
    const nextSaved = !saved;
    const nextCount = nextSaved ? savesCount + 1 : Math.max(0, savesCount - 1);

    setSaved(nextSaved);
    setSavesCount(nextCount);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/ghuba/listings/${item.listingId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to save listings to your wishlist");
        } else {
          toast.error("Failed to update saved item");
        }
        // Rollback
        setSaved(!nextSaved);
        setSavesCount(savesCount);
        return;
      }

      const data = await res.json();
      if (typeof data.savesCount === "number") {
        setSavesCount(data.savesCount);
      }
      toast.success(nextSaved ? "Saved to your Wishlist!" : "Removed from Wishlist");
      onUpdateEngagement?.(item.listingId, {
        viewerState: { ...item.viewerState, saved: nextSaved },
        engagement: { ...item.engagement, savesCount: nextCount },
      });
    } catch {
      // Rollback
      setSaved(!nextSaved);
      setSavesCount(savesCount);
      toast.error("Network error saving listing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}${item.publicUrl}`
      : item.publicUrl;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out ${item.title} on Ghuba Marketplace!`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    // Fallback: Clipboard copy
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Listing link copied to clipboard!");
    } else {
      toast("Listing link: " + shareUrl);
    }
  };

  return (
    <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 text-white">
      {/* 1. Seller Profile Avatar */}
      <div className="relative mb-2 flex flex-col items-center">
        <Link
          href={item.seller.slug ? `/site/${item.seller.slug}` : item.publicUrl}
          className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          title={`Visit ${item.seller.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          {item.seller.logoUrl ? (
            <img
              src={item.seller.logoUrl}
              alt={item.seller.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-500 to-rose-500 font-bold text-white text-sm">
              {item.seller.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>
        {item.seller.isVerified && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-0.5 text-white shadow">
            <HiCheckBadge className="h-4 w-4" />
          </span>
        )}
      </div>

      {/* 2. Like Button */}
      <button
        type="button"
        onClick={handleToggleLike}
        className="group flex flex-col items-center gap-1 transition-transform active:scale-75"
        aria-label={liked ? "Unlike listing" : "Like listing"}
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
            liked
              ? "bg-rose-600/90 text-white shadow-lg shadow-rose-600/30"
              : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          {liked ? (
            <AiFillHeart className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          ) : (
            <AiOutlineHeart className="h-6 w-6 transition-transform group-hover:scale-110" />
          )}
        </div>
        <span className="text-xs font-semibold drop-shadow-md">{formatCount(likesCount)}</span>
      </button>

      {/* 3. Comment Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenComments(item);
        }}
        className="group flex flex-col items-center gap-1 transition-transform active:scale-75"
        aria-label="Open comments"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60 text-white">
          <AiOutlineMessage className="h-6 w-6 transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-semibold drop-shadow-md">
          {formatCount(item.engagement.commentsCount)}
        </span>
      </button>

      {/* 4. Save / Bookmark Button */}
      <button
        type="button"
        onClick={handleToggleSave}
        className="group flex flex-col items-center gap-1 transition-transform active:scale-75"
        aria-label={saved ? "Remove from saved" : "Save listing"}
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
            saved
              ? "bg-amber-500/90 text-white shadow-lg shadow-amber-500/30"
              : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          {saved ? (
            <AiFillBook className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          ) : (
            <AiOutlineBook className="h-6 w-6 transition-transform group-hover:scale-110" />
          )}
        </div>
        <span className="text-xs font-semibold drop-shadow-md">{formatCount(savesCount)}</span>
      </button>

      {/* 5. Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="group flex flex-col items-center gap-1 transition-transform active:scale-75"
        aria-label="Share listing"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60 text-white">
          <AiOutlineShareAlt className="h-6 w-6 transition-transform group-hover:scale-110" />
        </div>
        <span className="text-xs font-semibold drop-shadow-md">Share</span>
      </button>

      {/* 6. Sound Toggle */}
      {item.media.primaryType === "VIDEO" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSound();
          }}
          className="group flex flex-col items-center gap-1 transition-transform active:scale-75"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          title={isMuted ? "Unmute sound" : "Mute sound"}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60 text-white">
            {isMuted ? (
              <IoVolumeMuteOutline className="h-6 w-6" />
            ) : (
              <AiOutlineSound className="h-6 w-6 text-emerald-400" />
            )}
          </div>
          <span className="text-[10px] font-medium drop-shadow-md">
            {isMuted ? "Muted" : "Sound"}
          </span>
        </button>
      )}

      {/* 7. More Options Menu */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMoreMenu((prev) => !prev);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white"
          aria-label="More options"
        >
          <HiEllipsisHorizontal className="h-5 w-5" />
        </button>

        {showMoreMenu && (
          <div
            className="absolute right-0 bottom-12 z-50 w-44 rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl text-xs text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={item.publicUrl}
              className="block rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
              onClick={() => setShowMoreMenu(false)}
            >
              View Full Details
            </Link>
            <Link
              href={item.seller.slug ? `/site/${item.seller.slug}` : "#"}
              className="block rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
              onClick={() => setShowMoreMenu(false)}
            >
              Visit Store Profile
            </Link>
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/10"
              onClick={(e) => {
                handleShare(e);
                setShowMoreMenu(false);
              }}
            >
              Copy Link
            </button>
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-rose-400 transition-colors hover:bg-rose-500/20"
              onClick={() => {
                toast.success("Thank you for your report. Our team will review this listing.");
                setShowMoreMenu(false);
              }}
            >
              Report Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
