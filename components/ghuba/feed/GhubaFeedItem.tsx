"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AiFillHeart } from "react-icons/ai";
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { GhubaFeedItem as GhubaFeedItemType } from "@/lib/ghuba-feed-service";
import { GhubaFeedActions } from "./GhubaFeedActions";
import { GhubaFeedCommerceBar } from "./GhubaFeedCommerceBar";

interface GhubaFeedItemProps {
  item: GhubaFeedItemType;
  isActive: boolean;
  isAdjacent?: boolean;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenComments: (item: GhubaFeedItemType) => void;
  onOpenBooking: (item: GhubaFeedItemType) => void;
  onOpenEnquiry: (item: GhubaFeedItemType) => void;
  onUpdateEngagement?: (listingId: string, updates: Partial<GhubaFeedItemType>) => void;
}

export const GhubaFeedItem: React.FC<GhubaFeedItemProps> = ({
  item,
  isActive,
  isAdjacent = false,
  isMuted,
  onToggleSound,
  onOpenComments,
  onOpenBooking,
  onOpenEnquiry,
  onUpdateEngagement,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  // Cache clientWidth to avoid forced synchronous layout reads in scroll handlers
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

  useEffect(() => {
    if (!isActive) {
      activeImageIndexRef.current = 0;
      setActiveImageIndex(0);
      if (galleryContainerRef.current) {
        galleryContainerRef.current.scrollLeft = 0;
      }
    }
  }, [isActive]);

  // Cache container width via ResizeObserver to avoid forced layout reads on scroll
  useEffect(() => {
    const container = galleryContainerRef.current;
    if (!container) return;
    galleryWidthRef.current = container.clientWidth;
    const ro = new ResizeObserver((entries) => {
      if (entries[0]) galleryWidthRef.current = entries[0].contentRect.width;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [isGallery]);

  // Does NOT read layout properties on every scroll event;
  // uses cached galleryWidthRef instead of clientWidth to avoid forced layout.
  const handleGalleryScroll = useCallback(() => {
    if (!galleryContainerRef.current) return;
    const width = galleryWidthRef.current;
    if (width > 0) {
      const newIndex = Math.round(galleryContainerRef.current.scrollLeft / width);
      if (newIndex >= 0 && newIndex < item.media.images.length && newIndex !== activeImageIndexRef.current) {
        activeImageIndexRef.current = newIndex;
        setActiveImageIndex(newIndex);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.media.images.length]); // removed activeImageIndex dep - use ref instead

  const scrollToImage = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (galleryContainerRef.current) {
      const width = galleryContainerRef.current.clientWidth;
      galleryContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
      setActiveImageIndex(index);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    const isSaveData = Boolean(nav?.connection?.saveData || nav?.connection?.effectiveType === "2g");

    if (isActive) {
      if (isSaveData) {
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
            console.warn("Autoplay muted required or prevented", err.message);
            setIsPlaying(false);
          });
      }
    } else {
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
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [isActive, hasVideo, videoSrc]);

  const flashPlayIndicator = useCallback(() => {
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  }, []);

  const triggerHeartBurst = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHeartBurstPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowHeartBurst(true);
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

  const currentImageDetail = item.media.imageDetails?.[activeImageIndex];
  const imageVariants = currentImageDetail?.variants;

  return (
    <article
      className="relative h-[100dvh] w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black select-none"
      onClick={handleContainerClick}
    >
      {/* MEDIA LAYER */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center">
        {hasVideo ? (
          <div 
            className="relative h-full w-full flex items-center justify-center animate-ghuba-fade-in"
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
                isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{ backgroundImage: `url(${item.media.poster})` }}
            />
            <video
              ref={videoRef}
              poster={item.media.poster}
              playsInline
              loop
              muted={isMuted}
              preload={isActive ? "auto" : "none"}
              onError={() => setVideoError(true)}
              className="relative z-10 h-full w-full object-cover sm:object-contain"
            />
          </div>
        ) : isGallery ? (
          <div className="relative h-full w-full overflow-hidden">
            {/* Blurred ambient background — use blur-2xl (40px) not blur-3xl (64px)
                 blur-3xl on a full-height element forces expensive GPU compositing on mobile.
                 contain: paint isolates the compositing layer to this slide only. */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 transition-opacity duration-700 ease-in-out"
              style={{
                backgroundImage: `url(${imageVariants?.feed || item.media.images[activeImageIndex] || item.media.poster})`,
                contain: "paint",
              }}
            />
            <div
              ref={galleryContainerRef}
              onScroll={handleGalleryScroll}
              className="relative z-10 flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {item.media.images.map((imgUrl, idx) => {
                const detail = item.media.imageDetails?.[idx];
                const variants = detail?.variants;
                return (
                  <div key={idx} className="relative flex-shrink-0 w-full h-full snap-start snap-always flex items-center justify-center">
                    <picture className="h-full w-full flex items-center justify-center pointer-events-none">
                      {variants?.feed && <source media="(max-width: 768px)" srcSet={variants.feed} type="image/webp" />}
                      {variants?.full && <source srcSet={variants.full} type="image/webp" />}
                      <img
                        src={variants?.feed || imgUrl}
                        alt={`${item.title} - Slide ${idx + 1}`}
                        className="h-full w-full object-contain pointer-events-none drop-shadow-2xl transition-transform duration-500"
                        loading={isActive || (isAdjacent && idx === 0) ? "eager" : "lazy"}
                        fetchPriority={isActive && idx === 0 ? "high" : (isAdjacent && idx === 0 ? "auto" : "low")}
                        draggable={false}
                        style={detail?.blurDataUrl ? { backgroundImage: `url(${detail.blurDataUrl})`, backgroundSize: "cover" } : undefined}
                      />
                    </picture>
                  </div>
                );
              })}
            </div>

            {/* Gallery Navigation UI */}
            <AnimatePresence>
              {activeImageIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={(e) => scrollToImage(activeImageIndex - 1, e)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all"
                >
                  <ChevronLeftIcon className="h-6 w-6 stroke-2" />
                </motion.button>
              )}
              {activeImageIndex < item.media.images.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={(e) => scrollToImage(activeImageIndex + 1, e)}
                  className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-xl transition-all"
                >
                  <ChevronRightIcon className="h-6 w-6 stroke-2" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Slide Indicators with Layout Animation */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-1.5 p-2 pointer-events-none">
              <div className="flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {item.media.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => scrollToImage(idx, e)}
                    className="relative h-1.5 w-6 rounded-full pointer-events-auto bg-white/30 hover:bg-white/50 overflow-hidden"
                  >
                    {activeImageIndex === idx && (
                      <motion.div
                        layoutId="activeSlideIndicator"
                        className="absolute inset-0 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            {/* Blurred ambient background — blur-2xl not blur-3xl for mobile GPU cost */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
              style={{
                backgroundImage: `url(${item.media.poster || item.media.thumbnail})`,
                contain: "paint",
              }}
            />
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={item.media.poster || item.media.thumbnail || ""}
                alt={item.title}
                className="h-full w-full object-contain drop-shadow-2xl"
                loading={isActive || isAdjacent ? "eager" : "lazy"}
                fetchPriority={isActive ? "high" : (isAdjacent ? "auto" : "low")}
              />
            </div>
          </div>
        )}
      </div>

      {/* GRADIENTS */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Top Badges */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap gap-2">
        {item.discountPercentage && item.discountPercentage >= 20 && (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-lg animate-pulse border border-rose-400/30">
            🔥 FLASH DEAL
          </span>
        )}
        {item.type && (
          <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md shadow-sm">
            {item.type}
          </span>
        )}
      </div>

      {/* Play / Pause Overlay Flash */}
      <AnimatePresence>
        {showPlayIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="rounded-full bg-black/40 p-4 text-white backdrop-blur-md shadow-2xl">
              <PlayCircleIcon className="h-16 w-16 stroke-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Positioned Double Tap Heart Burst */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -15 }}
            animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -50 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
            style={{ left: heartBurstPos.x, top: heartBurstPos.y }}
          >
            <AiFillHeart className="h-32 w-32 text-rose-500 drop-shadow-[0_0_35px_rgba(225,29,72,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Action Bar */}
      <div className="absolute right-2 bottom-28 z-30 sm:right-4 sm:bottom-32">
        <GhubaFeedActions
          item={item}
          isMuted={isMuted}
          onToggleSound={onToggleSound}
          onOpenComments={onOpenComments}
          onUpdateEngagement={onUpdateEngagement}
        />
      </div>

      {/* Bottom Commerce & Metadata Bar */}
      <div className="absolute bottom-0 left-0 w-full z-20">
        <GhubaFeedCommerceBar
          item={item}
          onOpenBooking={onOpenBooking}
          onOpenEnquiry={onOpenEnquiry}
        />
      </div>
    </article>
  );
};