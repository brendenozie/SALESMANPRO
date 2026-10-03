"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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

  const formatCount = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

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

      if (!res.ok) throw new Error(res.status === 401 ? "unauthorized" : "failed");

      const data = await res.json();
      if (typeof data.likesCount === "number") setLikesCount(data.likesCount);
      onUpdateEngagement?.(item.listingId, {
        viewerState: { ...item.viewerState, liked: nextLiked },
        engagement: { ...item.engagement, likesCount: nextCount },
      });
    } catch (err: any) {
      setLiked(!nextLiked);
      setLikesCount(likesCount);
      toast.error(err.message === "unauthorized" ? "Please sign in to like" : "Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;

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

      if (!res.ok) throw new Error(res.status === 401 ? "unauthorized" : "failed");

      const data = await res.json();
      if (typeof data.savesCount === "number") setSavesCount(data.savesCount);
      toast.success(nextSaved ? "Saved to Wishlist!" : "Removed from Wishlist", { icon: nextSaved ? '🔖' : undefined });
      
      onUpdateEngagement?.(item.listingId, {
        viewerState: { ...item.viewerState, saved: nextSaved },
        engagement: { ...item.engagement, savesCount: nextCount },
      });
    } catch (err: any) {
      setSaved(!nextSaved);
      setSavesCount(savesCount);
      toast.error(err.message === "unauthorized" ? "Please sign in to save" : "Failed to save listing");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${item.publicUrl}` : item.publicUrl;

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
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const actionButtonClass = "flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg transition-colors hover:bg-black/60";

  return (
    <div className="flex flex-col items-center gap-5 text-white">
      {/* 1. Seller Profile Avatar */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative mb-2 flex flex-col items-center">
        <Link
          href={item.seller.slug ? `/site/${item.seller.slug}` : item.publicUrl}
          className="relative block h-12 w-12 overflow-hidden rounded-full border-[2.5px] border-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {item.seller.logoUrl ? (
            <img src={item.seller.logoUrl} alt={item.seller.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-500 to-rose-500 font-bold text-white text-sm">
              {item.seller.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>
        {item.seller.isVerified && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-0.5 border border-white text-white shadow-md">
            <HiCheckBadge className="h-4 w-4" />
          </span>
        )}
      </motion.div>

      {/* 2. Like Button */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleToggleLike}
          className={liked ? "flex h-11 w-11 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] border border-rose-500 backdrop-blur-md" : actionButtonClass}
        >
          <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            {liked ? <AiFillHeart className="h-6 w-6" /> : <AiOutlineHeart className="h-6 w-6" />}
          </motion.div>
        </motion.button>
        <span className="text-[11px] font-bold drop-shadow-md tracking-wide">{formatCount(likesCount)}</span>
      </div>

      {/* 3. Comment Button */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onOpenComments(item); }}
          className={actionButtonClass}
        >
          <AiOutlineMessage className="h-6 w-6" />
        </motion.button>
        <span className="text-[11px] font-bold drop-shadow-md tracking-wide">{formatCount(item.engagement.commentsCount)}</span>
      </div>

      {/* 4. Save Button */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleToggleSave}
          className={saved ? "flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-400 backdrop-blur-md" : actionButtonClass}
        >
          <motion.div animate={saved ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            {saved ? <AiFillBook className="h-6 w-6" /> : <AiOutlineBook className="h-6 w-6" />}
          </motion.div>
        </motion.button>
        <span className="text-[11px] font-bold drop-shadow-md tracking-wide">{formatCount(savesCount)}</span>
      </div>

      {/* 5. Share Button */}
      <div className="flex flex-col items-center gap-1.5">
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleShare} className={actionButtonClass}>
          <AiOutlineShareAlt className="h-6 w-6" />
        </motion.button>
        <span className="text-[11px] font-bold drop-shadow-md tracking-wide">Share</span>
      </div>

      {/* 6. Sound Toggle */}
      {item.media.primaryType === "VIDEO" && (
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onToggleSound(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-lg"
          >
            {isMuted ? <IoVolumeMuteOutline className="h-5 w-5" /> : <AiOutlineSound className="h-5 w-5 text-emerald-400" />}
          </motion.button>
        </div>
      )}

      {/* 7. More Options Menu */}
      <div className="relative mt-2">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setShowMoreMenu((p) => !p); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white/80 hover:text-white"
        >
          <HiEllipsisHorizontal className="h-5 w-5" />
        </motion.button>

        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 bottom-12 w-48 rounded-xl border border-white/10 bg-black/80 p-1.5 shadow-2xl backdrop-blur-xl text-sm font-medium text-white z-50 origin-bottom-right"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={item.publicUrl} className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/15" onClick={() => setShowMoreMenu(false)}>
                View Full Details
              </Link>
              <Link href={item.seller.slug ? `/site/${item.seller.slug}` : "#"} className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/15" onClick={() => setShowMoreMenu(false)}>
                Visit Store Profile
              </Link>
              <button type="button" className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/15" onClick={(e) => { handleShare(e); setShowMoreMenu(false); }}>
                Copy Link
              </button>
              <div className="h-px w-full bg-white/10 my-1" />
              <button type="button" className="w-full rounded-lg px-3 py-2.5 text-left text-rose-400 transition-colors hover:bg-rose-500/20" onClick={() => { toast.success("Our team will review this listing."); setShowMoreMenu(false); }}>
                Report Listing
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};