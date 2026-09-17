"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AiFillHeart } from "react-icons/ai";
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { GhubaFeedItem as GhubaFeedItemType } from "@/lib/ghuba-feed-service";
import { GhubaFeedActions } from "./GhubaFeedActions";
import { GhubaFeedCommerceBar } from "./GhubaFeedCommerceBar";

interface GhubaFeedItemProps {
  item: GhubaFeedItemType;
  isActive: boolean;
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
  isMuted,
  onToggleSound,
  onOpenComments,
  onOpenBooking,
  onOpenEnquiry,
  onUpdateEngagement,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const lastTapRef = useRef<number>(0);

  const videoSrc = item.media.videos[0];
  const hasVideo = item.media.primaryType === "VIDEO" && Boolean(videoSrc) && !videoError;
  const isGallery = !hasVideo && item.media.images.length > 1;

  useEffect(() => {
    if (!isActive) {
      setActiveImageIndex(0);
      if (galleryContainerRef.current) {
        galleryContainerRef.current.scrollLeft = 0;
      }
    }
  }, [isActive]);

  const handleGalleryScroll = useCallback(() => {
    if (!galleryContainerRef.current) return;
    const container = galleryContainerRef.current;
    if (container.clientWidth > 0) {
      const newIndex = Math.round(container.scrollLeft / container.clientWidth);
      if (newIndex >= 0 && newIndex < item.media.images.length && newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex);
      }
    }
  }, [activeImageIndex, item.media.images.length]);

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

  const triggerHeartBurst = useCallback(() => {
    setShowHeartBurst(true);
    // Auto-like integration could be added here via onUpdateEngagement
    setTimeout(() => setShowHeartBurst(false), 900);
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        triggerHeartBurst();
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
      className="relative h-[100dvh] w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-neutral-950 select-none"
      onClick={handleContainerClick}
    >
      {/* 1. MEDIA LAYER */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center">
        {hasVideo ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-in-out ${
                isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{
                backgroundImage: `url(${item.media.poster})`,
              }}
            />
            <video
              ref={videoRef}
              poster={item.media.poster}
              playsInline
              loop
              muted={isMuted}
              preload={isActive ? "auto" : "none"}
              onError={() => {
                console.warn("Video failed to load for listing", item.id);
                setVideoError(true);
              }}
              className="relative z-10 h-full w-full object-cover sm:object-contain"
            />
          </div>
        ) : isGallery ? (
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110 transition-all duration-700 ease-in-out"
              style={{
                backgroundImage: `url(${imageVariants?.feed || item.media.images[activeImageIndex] || item.media.poster})`,
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
                  <div
                    key={idx}
                    className="relative flex-shrink-0 w-full h-full snap-start snap-always flex items-center justify-center p-0"
                  >
                    <picture className="h-full w-full flex items-center justify-center pointer-events-none">
                      {variants?.feed && (
                        <source media="(max-width: 768px)" srcSet={variants.feed} type="image/webp" />
                      )}
                      {variants?.full && (
                        <source srcSet={variants.full} type="image/webp" />
                      )}
                      <img
                        src={variants?.feed || imgUrl}
                        alt={`${item.title} - Slide ${idx + 1}`}
                        className="h-full w-full object-contain pointer-events-none drop-shadow-2xl transition-transform duration-500"
                        loading={isActive && Math.abs(activeImageIndex - idx) <= 1 ? "eager" : "lazy"}
                        draggable={false}
                        style={detail?.blurDataUrl ? { backgroundImage: `url(${detail.blurDataUrl})`, backgroundSize: "cover" } : undefined}
                      />
                    </picture>
                  </div>
                );
              })}
            </div>

            {/* Gallery Navigation UI */}
            {activeImageIndex > 0 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex - 1, e)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-6 w-6 stroke-2" />
              </button>
            )}

            {activeImageIndex < item.media.images.length - 1 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex + 1, e)}
                className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all active:scale-95"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-6 w-6 stroke-2" />
              </button>
            )}

            {/* Slide Indicators */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-1.5 p-2 pointer-events-none">
              <div className="flex gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {item.media.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => scrollToImage(idx, e)}
                    className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                      activeImageIndex === idx ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 scale-110"
              style={{
                backgroundImage: `url(${item.media.poster || item.media.thumbnail})`,
              }}
            />
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={item.media.poster || item.media.thumbnail || ""}
                alt={item.title}
                className="h-full w-full object-contain drop-shadow-2xl"
                loading={isActive ? "eager" : "lazy"}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. PROTECTIVE GRADIENTS (Ensures text/icons are always readable) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

      {/* 3. Top Badges */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap gap-2">
        {item.discountPercentage && item.discountPercentage >= 20 ? (
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white shadow-lg animate-pulse">
            🔥 FLASH DEAL
          </span>
        ) : null}

        {item.type && (
          <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md shadow-sm">
            {item.type}
          </span>
        )}
        
        {isGallery && (
           <span className="rounded-full bg-black/40 border border-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
             {activeImageIndex + 1} / {item.media.images.length}
           </span>
        )}
      </div>

      {/* 4. Play / Pause Overlay Flash */}
      <div
        className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 ${
          showPlayIcon ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="rounded-full bg-black/40 p-4 text-white backdrop-blur-md shadow-2xl scale-110">
          <PlayCircleIcon className="h-16 w-16 stroke-1" />
        </div>
      </div>

      {/* 5. Double Tap Heart Burst */}
      <div
        className={`pointer-events-none absolute inset-0 z-40 flex items-center justify-center transition-all duration-500 ease-out ${
          showHeartBurst ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <AiFillHeart className="h-32 w-32 text-rose-500 drop-shadow-[0_0_25px_rgba(225,29,72,0.6)]" />
      </div>

      {/* 6. Right Action Bar */}
      <div className="absolute right-2 bottom-28 z-30 sm:right-4 sm:bottom-32">
        <GhubaFeedActions
          item={item}
          isMuted={isMuted}
          onToggleSound={onToggleSound}
          onOpenComments={onOpenComments}
          onUpdateEngagement={onUpdateEngagement}
        />
      </div>

      {/* 7. Bottom Commerce & Metadata Bar */}
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