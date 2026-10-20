"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { AiFillHeart } from "react-icons/ai";
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { GhubaFeedItem as GhubaFeedItemType } from "@/lib/ghuba-feed-service";
import { GhubaFeedActions } from "./GhubaFeedActions";
import { GhubaFeedCommerceBar } from "./GhubaFeedCommerceBar";
import { DecodedFeedImage } from "./DecodedFeedImage";

export interface GhubaFeedItemProps {
  item: GhubaFeedItemType;
  isActive: boolean;
  isAdjacent?: boolean;
  isMuted: boolean;
  isDataSaver?: boolean;
  onToggleSound: () => void;
  onOpenComments: (item: GhubaFeedItemType) => void;
  onOpenBooking: (item: GhubaFeedItemType) => void;
  onOpenEnquiry: (item: GhubaFeedItemType) => void;
  onOpenQuickBuy?: (item: GhubaFeedItemType) => void;
  onUpdateEngagement?: (listingId: string, updates: Partial<GhubaFeedItemType>) => void;
}

const GhubaFeedItemBase: React.FC<GhubaFeedItemProps> = ({
  item,
  isActive,
  isAdjacent = false,
  isMuted,
  isDataSaver = false,
  onToggleSound,
  onOpenComments,
  onOpenBooking,
  onOpenEnquiry,
  onOpenQuickBuy,
  onUpdateEngagement,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchDeltaX = useRef<number>(0);
  const touchDeltaY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [heartBurstPos, setHeartBurstPos] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  // Intelligent Video Quality Variant Selection:
  // Data Saver / 3G: 480p low-bandwidth variant
  // Standard 4G: 720p feed variant
  const rawVideoSrc = item.media.videos[0];
  const videoDetails = item.media.videoDetails?.[0];
  const videoSrc = isDataSaver && videoDetails?.variants?.low
    ? videoDetails.variants.low
    : videoDetails?.variants?.feed || rawVideoSrc;

  const hasVideo = item.media.primaryType === "VIDEO" && Boolean(videoSrc) && !videoError;
  const isGallery = !hasVideo && item.media.images.length > 1;

  // Reset slide state when leaving active viewport
  useEffect(() => {
    if (!isActive) {
      setHasRenderedFirstFrame(false);
      setIsBuffering(false);
      setActiveImageIndex(0);
    }
  }, [isActive]);

  // Touch gesture coordination for horizontal image carousels:
  // Allows native vertical scrolling (pan-y) to bubble cleanly to parent feed container,
  // while capturing horizontal swipes to transition between images.
  const handleGalleryTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isHorizontalSwipe.current = null;
  }, []);

  const handleGalleryTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    touchDeltaX.current = currentX - touchStartX.current;
    touchDeltaY.current = currentY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      const absX = Math.abs(touchDeltaX.current);
      const absY = Math.abs(touchDeltaY.current);
      if (absX > 10 || absY > 10) {
        isHorizontalSwipe.current = absX > absY;
      }
    }
  }, []);

  const handleGalleryTouchEnd = useCallback(() => {
    if (isHorizontalSwipe.current === true) {
      const threshold = 40; // minimum 40px swipe distance
      if (touchDeltaX.current < -threshold && activeImageIndex < item.media.images.length - 1) {
        setActiveImageIndex((prev) => prev + 1);
      } else if (touchDeltaX.current > threshold && activeImageIndex > 0) {
        setActiveImageIndex((prev) => prev - 1);
      }
    }
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isHorizontalSwipe.current = null;
  }, [activeImageIndex, item.media.images.length]);

  const scrollToImage = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (index >= 0 && index < item.media.images.length) {
      setActiveImageIndex(index);
    }
  }, [item.media.images.length]);

  // Video lifecycle: Active plays, Adjacent stays warm & paused (no re-download on scroll back),
  // Distant unloads to free GPU memory and decoder sessions.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (isActive) {
      if (isDataSaver) {
        // In Data Saver mode, do not auto-play to conserve mobile data
        setIsPlaying(false);
        return;
      }

      if (video.getAttribute("src") !== videoSrc) {
        video.src = videoSrc;
      }
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("[GhubaFeed] Autoplay prevented:", err.message);
            setIsPlaying(false);
          });
      }
    } else if (isAdjacent) {
      // Warm buffer: pause video but keep src attached so swiping back doesn't re-download
      video.pause();
      setIsPlaying(false);
    } else {
      // Cold buffer: unmount source to prevent memory accumulation in long sessions
      video.pause();
      setIsPlaying(false);
      if (video.getAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
    }

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [isActive, isAdjacent, hasVideo, videoSrc, isDataSaver]);

  // Background playback prevention: Immediately pause when tab is minimized or device locked
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.visibilityState === "hidden") {
        video.pause();
        setIsPlaying(false);
      } else if (isActive && !isDataSaver && !videoError) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, isDataSaver, videoError]);

  const flashPlayIndicator = useCallback(() => {
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  }, []);

  const triggerHeartBurst = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHeartBurstPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowHeartBurst(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([15]);
      } catch {}
    }
    setTimeout(() => setShowHeartBurst(false), 800);
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        triggerHeartBurst(e);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (hasVideo && videoRef.current) {
        if (videoRef.current.paused) {
          if (!videoRef.current.getAttribute("src")) {
            videoRef.current.src = videoSrc;
          }
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            flashPlayIndicator();
          });
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
          flashPlayIndicator();
        }
      }
    },
    [hasVideo, videoSrc, flashPlayIndicator, triggerHeartBurst]
  );

  const activeMediaUrl =
    item.media.imageDetails?.[activeImageIndex]?.variants?.feed ||
    item.media.images[activeImageIndex] ||
    item.media.poster ||
    item.media.thumbnail;

  return (
    <article
      className="relative h-[100dvh] w-full flex-shrink-0 overflow-hidden bg-black select-none"
      onClick={handleContainerClick}
      style={{ contain: "layout paint" }}
      aria-label={`${item.title} by ${item.seller.name}`}
    >
      {/* MEDIA LAYER */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center">
        {hasVideo ? (
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Ambient backdrop: blur-xl with contain: paint on active/adjacent, disabled on Data Saver */}
            {!isDataSaver && (isActive || isAdjacent) && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-105 pointer-events-none"
                style={{
                  backgroundImage: `url(${item.media.thumbnail || item.media.poster})`,
                  contain: "paint",
                }}
              />
            )}
            {/* Zero-Layout-Shift Poster Layer: Stays visible until the video has decoded its first frame */}
            <div
              className={`absolute inset-0 bg-contain bg-center transition-opacity duration-300 ease-in-out ${
                isPlaying && hasRenderedFirstFrame ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
              }`}
              style={{
                backgroundImage: `url(${item.media.poster || item.media.thumbnail})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            <video
              ref={videoRef}
              poster={item.media.poster}
              playsInline
              loop
              muted={isMuted}
              preload={isActive ? "auto" : isAdjacent ? "metadata" : "none"}
              onLoadedData={() => setHasRenderedFirstFrame(true)}
              onTimeUpdate={() => {
                if (!hasRenderedFirstFrame) setHasRenderedFirstFrame(true);
              }}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onError={() => {
                if (videoRef.current?.getAttribute("src")) {
                  setVideoError(true);
                }
                setIsBuffering(false);
              }}
              className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
            />

            {/* Buffering Indicator on Constrained Mobile Networks */}
            {isBuffering && isPlaying && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 border border-white/20 backdrop-blur-md shadow-2xl">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <span className="text-xs font-semibold text-white/90">Loading video...</span>
                </div>
              </div>
            )}

            {/* Data Saver Mode: Explicit Play CTA */}
            {isDataSaver && !isPlaying && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = videoRef.current;
                    if (video) {
                      if (!video.getAttribute("src")) video.src = videoSrc;
                      video.play().then(() => {
                        setIsPlaying(true);
                        flashPlayIndicator();
                      });
                    }
                  }}
                  className="flex items-center gap-2 rounded-full bg-black/80 px-5 py-2.5 text-sm font-semibold text-white border border-amber-400/50 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="text-amber-400 text-base">⚡</span>
                  <span>Tap to Watch Video</span>
                  <span className="text-xs text-white/60">(Data Saver)</span>
                </button>
              </div>
            )}
          </div>
        ) : isGallery ? (
          <div className="relative h-full w-full overflow-hidden">
            {/* Ambient background for gallery */}
            {!isDataSaver && (isActive || isAdjacent) && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-105 transition-opacity duration-500 pointer-events-none"
                style={{
                  backgroundImage: `url(${activeMediaUrl})`,
                  contain: "paint",
                }}
              />
            )}
            <div
              ref={galleryContainerRef}
              onTouchStart={handleGalleryTouchStart}
              onTouchMove={handleGalleryTouchMove}
              onTouchEnd={handleGalleryTouchEnd}
              className="relative z-10 flex h-full w-full overflow-hidden select-none"
              style={{ touchAction: "pan-y" }}
            >
              <div
                className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
                style={{
                  transform: `translateX(-${activeImageIndex * 100}%)`,
                }}
              >
                {item.media.images.map((imgUrl, idx) => {
                  const detail = item.media.imageDetails?.[idx];
                  const variants = detail?.variants;
                  const shouldPrioritizeSlide = isActive && idx === 0;

                  return (
                    <div
                      key={idx}
                      className="relative flex-shrink-0 w-full h-full flex items-center justify-center pointer-events-none"
                    >
                      <DecodedFeedImage
                        src={variants?.feed || imgUrl}
                        alt={`${item.title} - Slide ${idx + 1}`}
                        priority={shouldPrioritizeSlide}
                        isPriority={shouldPrioritizeSlide}
                        className="h-full w-full drop-shadow-2xl"
                        blurDataUrl={detail?.blurDataUrl}
                        objectFit="contain"
                        isDataSaver={isDataSaver}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gallery Navigation Controls */}
            {activeImageIndex > 0 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex - 1, e)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 shadow-xl transition-all"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-6 w-6 stroke-2" />
              </button>
            )}
            {activeImageIndex < item.media.images.length - 1 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex + 1, e)}
                className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 shadow-xl transition-all"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-6 w-6 stroke-2" />
              </button>
            )}

            {/* Slide Indicators */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-1.5 p-2 pointer-events-none">
              <div className="flex gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                {item.media.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => scrollToImage(idx, e)}
                    className="relative h-1.5 w-6 rounded-full pointer-events-auto bg-white/30 hover:bg-white/50 overflow-hidden"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    {activeImageIndex === idx && (
                      <div className="absolute inset-0 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            {!isDataSaver && (isActive || isAdjacent) && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-105 pointer-events-none"
                style={{
                  backgroundImage: `url(${item.media.thumbnail || item.media.poster})`,
                  contain: "paint",
                }}
              />
            )}
            <div className="relative h-full w-full flex items-center justify-center">
              <DecodedFeedImage
                src={item.media.poster || item.media.thumbnail || ""}
                alt={item.title}
                priority={isActive || isAdjacent}
                isPriority={isActive || isAdjacent}
                className="h-full w-full drop-shadow-2xl"
                objectFit="contain"
                isDataSaver={isDataSaver}
              />
            </div>
          </div>
        )}
      </div>

      {/* GRADIENTS FOR TEXT READABILITY */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Top Badges */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
        {item.discountPercentage && item.discountPercentage >= 20 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-lg border border-rose-400/40">
            🔥 FLASH DEAL
          </span>
        )}
        {item.type && (
          <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
            {item.type}
          </span>
        )}
      </div>

      {/* Play / Pause Overlay Flash */}
      <AnimatePresence>
        {showPlayIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="rounded-full bg-black/60 p-4 text-white shadow-2xl border border-white/20">
              <PlayCircleIcon className="h-16 w-16 stroke-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double Tap Heart Burst */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5, y: -40 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
            style={{ left: heartBurstPos.x, top: heartBurstPos.y }}
          >
            <AiFillHeart className="h-28 w-28 text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Floating Product Tag Anchor */}
      {isActive && (
        <div className="absolute top-16 left-4 z-20 pointer-events-auto animate-in fade-in duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickBuy?.(item);
            }}
            className="group flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white shadow-2xl transition-all active:scale-95"
            aria-label="Instant Buy this item"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-black text-[10px] font-black group-hover:scale-110 transition-transform">
              ⚡
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold leading-none">
              <span className="text-amber-400 font-extrabold">{item.currency} {item.price.toLocaleString()}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90 group-hover:text-amber-300 transition-colors">Instant Buy</span>
              <span className="text-[10px] text-amber-400 ml-0.5 group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Live Audio Waves Indicator */}
      {!isMuted && isPlaying && hasVideo && (
        <div className="absolute top-16 right-4 z-20 pointer-events-none flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-lg">
          <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" />
          <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 ml-1">Live Audio</span>
        </div>
      )}

      {/* Right Action Bar */}
      <div
        className="absolute right-2 z-30 sm:right-4"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 6.5rem)" }}
      >
        <GhubaFeedActions
          item={item}
          isMuted={isMuted}
          isDataSaver={isDataSaver}
          onToggleSound={onToggleSound}
          onOpenComments={onOpenComments}
          onUpdateEngagement={onUpdateEngagement}
        />
      </div>

      {/* Bottom Commerce & Metadata Bar */}
      <div
        className="absolute bottom-0 left-0 w-full z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <GhubaFeedCommerceBar
          item={item}
          onOpenBooking={onOpenBooking}
          onOpenEnquiry={onOpenEnquiry}
          onOpenQuickBuy={onOpenQuickBuy}
        />
      </div>
    </article>
  );
};

// Strict memoization comparison: Prevents re-rendering 6 inactive buffer slides on every scroll step
function areFeedItemPropsEqual(prev: GhubaFeedItemProps, next: GhubaFeedItemProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.isActive === next.isActive &&
    prev.isAdjacent === next.isAdjacent &&
    prev.isMuted === next.isMuted &&
    prev.isDataSaver === next.isDataSaver &&
    prev.item.viewerState.liked === next.item.viewerState.liked &&
    prev.item.viewerState.saved === next.item.viewerState.saved &&
    prev.item.engagement.likesCount === next.item.engagement.likesCount &&
    prev.item.engagement.commentsCount === next.item.engagement.commentsCount &&
    prev.item.engagement.savesCount === next.item.engagement.savesCount
  );
}

export const GhubaFeedItem = memo(GhubaFeedItemBase, areFeedItemPropsEqual);