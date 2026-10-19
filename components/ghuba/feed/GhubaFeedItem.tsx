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
  onUpdateEngagement,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const galleryWidthRef = useRef<number>(0);
  const activeImageIndexRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [heartBurstPos, setHeartBurstPos] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const videoSrc = item.media.videos[0];
  const hasVideo = item.media.primaryType === "VIDEO" && Boolean(videoSrc) && !videoError;
  const isGallery = !hasVideo && item.media.images.length > 1;

  // Reset gallery to first image when slide leaves active window
  useEffect(() => {
    if (!isActive) {
      activeImageIndexRef.current = 0;
      setActiveImageIndex(0);
      if (galleryContainerRef.current) {
        galleryContainerRef.current.scrollLeft = 0;
      }
    }
  }, [isActive]);

  // Cache gallery width to prevent forced synchronous reflows on scroll
  useEffect(() => {
    const container = galleryContainerRef.current;
    if (!container || !isGallery) return;

    galleryWidthRef.current = container.clientWidth;
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) {
        galleryWidthRef.current = entries[0].contentRect.width;
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [isGallery]);

  // Gallery scroll index update using cached container width (0 forced reflows)
  const handleGalleryScroll = useCallback(() => {
    const container = galleryContainerRef.current;
    if (!container) return;
    const width = galleryWidthRef.current || container.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(container.scrollLeft / width);
      if (newIndex >= 0 && newIndex < item.media.images.length && newIndex !== activeImageIndexRef.current) {
        activeImageIndexRef.current = newIndex;
        setActiveImageIndex(newIndex);
      }
    }
  }, [item.media.images.length]);

  const scrollToImage = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const container = galleryContainerRef.current;
    if (container) {
      const width = galleryWidthRef.current || container.clientWidth;
      container.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
      activeImageIndexRef.current = index;
      setActiveImageIndex(index);
    }
  }, []);

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
      className="relative h-[100dvh] w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black select-none"
      onClick={handleContainerClick}
      style={{ contain: "strict" }}
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
            <div
              className={`absolute inset-0 bg-contain bg-center transition-opacity duration-500 ease-in-out ${
                isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
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
              onError={() => setVideoError(true)}
              className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
            />
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
              onScroll={handleGalleryScroll}
              className="relative z-10 flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {item.media.images.map((imgUrl, idx) => {
                const detail = item.media.imageDetails?.[idx];
                const variants = detail?.variants;
                const shouldPrioritizeSlide = isActive && idx === 0;

                return (
                  <div
                    key={idx}
                    className="relative flex-shrink-0 w-full h-full snap-start snap-always flex items-center justify-center"
                  >
                    <DecodedFeedImage
                      src={variants?.feed || imgUrl}
                      alt={`${item.title} - Slide ${idx + 1}`}
                      priority={shouldPrioritizeSlide}
                      isPriority={shouldPrioritizeSlide}
                      className="h-full w-full pointer-events-none drop-shadow-2xl"
                      blurDataUrl={detail?.blurDataUrl}
                      objectFit="contain"
                      isDataSaver={isDataSaver}
                    />
                  </div>
                );
              })}
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