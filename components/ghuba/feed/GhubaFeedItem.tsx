"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiFillPlayCircle, AiFillHeart } from "react-icons/ai";
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
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

  // Determine effective media type taking error fallback into account
  const videoSrc = item.media.videos[0];
  const hasVideo = item.media.primaryType === "VIDEO" && Boolean(videoSrc) && !videoError;
  const isGallery = !hasVideo && item.media.images.length > 1;

  // Reset gallery position when feed item becomes inactive
  useEffect(() => {
    if (!isActive) {
      setActiveImageIndex(0);
      if (galleryContainerRef.current) {
        galleryContainerRef.current.scrollLeft = 0;
      }
    }
  }, [isActive]);

  const handleGalleryScroll = () => {
    if (!galleryContainerRef.current) return;
    const container = galleryContainerRef.current;
    if (container.clientWidth > 0) {
      const newIndex = Math.round(container.scrollLeft / container.clientWidth);
      if (newIndex >= 0 && newIndex < item.media.images.length && newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (galleryContainerRef.current) {
      const width = galleryContainerRef.current.clientWidth;
      galleryContainerRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
      setActiveImageIndex(index);
    }
  };

  // Autoplay & Hardware Decoder Lifecycle Management
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // Check Save-Data mode or 2G connections
    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    const isSaveData = Boolean(nav?.connection?.saveData || nav?.connection?.effectiveType === "2g");

    if (isActive) {
      if (isSaveData) {
        // In Save-Data mode, don't auto-download video stream; keep poster visible
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
      // Inactive: pause and release hardware decoders to prevent mobile browser crashes
      video.pause();
      setIsPlaying(false);
      // Cleanly detach video source buffer on inactive slides
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

  // Handle tap / click to toggle play / pause or double-tap to like
  const handleContainerClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered -> Like
      triggerHeartBurst();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Single tap -> Toggle Play / Pause on videos
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
  };

  const flashPlayIndicator = () => {
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  };

  const triggerHeartBurst = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const currentImageDetail = item.media.imageDetails?.[activeImageIndex];
  const imageVariants = currentImageDetail?.variants;

  return (
    <article
      className="relative h-[100dvh] w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black select-none"
      onClick={handleContainerClick}
    >
      {/* 1. MEDIA LAYER */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-neutral-950">
        {hasVideo ? (
          <div className="relative h-full w-full flex items-center justify-center">
            {/* Zero-Black-Screen Poster Frame (visible while buffering / paused) */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
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
          /* Multi-image swipeable & scrollable gallery */
          <div className="relative h-full w-full overflow-hidden">
            {/* Blurred background for aesthetic framing */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 transition-all duration-500"
              style={{
                backgroundImage: `url(${imageVariants?.feed || item.media.images[activeImageIndex] || item.media.poster})`,
              }}
            />

            {/* Horizontal Scroll Snap Container */}
            <div
              ref={galleryContainerRef}
              onScroll={handleGalleryScroll}
              className="relative z-10 flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {item.media.images.map((imgUrl, idx) => {
                const detail = item.media.imageDetails?.[idx];
                const variants = detail?.variants;
                return (
                  <div
                    key={idx}
                    className="relative flex-shrink-0 w-full h-full snap-start snap-always flex items-center justify-center p-2"
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
                        alt={`${item.title} - ${idx + 1}`}
                        className="h-full w-full object-contain pointer-events-none transition-transform duration-500"
                        loading={isActive && Math.abs(activeImageIndex - idx) <= 1 ? "eager" : "lazy"}
                        draggable={false}
                        style={detail?.blurDataUrl ? { backgroundImage: `url(${detail.blurDataUrl})`, backgroundSize: "cover" } : undefined}
                      />
                    </picture>
                  </div>
                );
              })}
            </div>

            {/* Left Chevron Navigation Button */}
            {activeImageIndex > 0 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex - 1, e)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}

            {/* Right Chevron Navigation Button (offset so it does not collide with feed action buttons) */}
            {activeImageIndex < item.media.images.length - 1 && (
              <button
                type="button"
                onClick={(e) => scrollToImage(activeImageIndex + 1, e)}
                className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all active:scale-95"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            )}

            {/* Slide Counter Badge */}
            <div className="absolute top-16 right-4 z-20 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white/90 border border-white/20 shadow-md">
              <span>{activeImageIndex + 1} / {item.media.images.length}</span>
            </div>

            {/* Gallery Dots Indicator */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-1.5 p-2 pointer-events-auto">
              {item.media.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => scrollToImage(idx, e)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx ? "w-6 bg-amber-400 shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Single Image Presentation */
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
              style={{
                backgroundImage: `url(${item.media.poster || item.media.thumbnail})`,
              }}
            />
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={item.media.poster || item.media.thumbnail || ""}
                alt={item.title}
                className="h-full w-full object-contain"
                loading={isActive ? "eager" : "lazy"}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Vignette & Deal Badges */}
      <div className="absolute top-16 left-4 z-20 flex flex-wrap gap-2">
        {item.discountPercentage && item.discountPercentage >= 20 ? (
          <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-lg animate-pulse">
            🔥 FLASH DEAL
          </span>
        ) : null}

        {item.type && (
          <span className="rounded-full bg-black/50 border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
            {item.type}
          </span>
        )}
      </div>

      {/* 3. Play / Pause Overlay Flash */}
      {showPlayIcon && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/20 animate-fade-out">
          <div className="rounded-full bg-black/60 p-4 text-white/90 backdrop-blur-md shadow-2xl">
            <PlayCircleIcon className="h-14 w-14" />
          </div>
        </div>
      )}

      {/* 4. Double Tap Heart Burst */}
      {showHeartBurst && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center animate-bounce">
          <HeartIcon className="h-28 w-28 text-rose-500 drop-shadow-2xl" />
        </div>
      )}

      {/* 5. Right Action Bar */}
      <GhubaFeedActions
        item={item}
        isMuted={isMuted}
        onToggleSound={onToggleSound}
        onOpenComments={onOpenComments}
        onUpdateEngagement={onUpdateEngagement}
      />

      {/* 6. Bottom Commerce & Metadata Bar */}
      <GhubaFeedCommerceBar
        item={item}
        onOpenBooking={onOpenBooking}
        onOpenEnquiry={onOpenEnquiry}
      />
    </article>
  );
};
