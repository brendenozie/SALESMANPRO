"use client";

import React, { useState, useRef, useEffect } from "react";
import { AiFillPlayCircle, AiFillHeart } from "react-icons/ai";
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const lastTapRef = useRef<number>(0);

  // Determine effective media type taking error fallback into account
  const hasVideo = item.media.primaryType === "VIDEO" && item.media.videos.length > 0 && !videoError;
  const isGallery = !hasVideo && item.media.images.length > 1;

  // Autoplay / pause control based on viewport activity
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            // Autoplay restriction fallback
            console.warn("Autoplay muted required or prevented", err.message);
            setIsPlaying(false);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, hasVideo]);

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
        videoRef.current.play();
        setIsPlaying(true);
        flashPlayIndicator();
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

  return (
    <article
      className="relative h-[100dvh] w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-black select-none"
      onClick={handleContainerClick}
    >
      {/* 1. MEDIA LAYER */}
      <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-neutral-950">
        {hasVideo ? (
          <video
            ref={videoRef}
            src={item.media.videos[0]}
            poster={item.media.poster}
            playsInline
            loop
            muted={isMuted}
            preload={isActive ? "auto" : "metadata"}
            onError={() => {
              console.warn("Video failed to load for listing", item.id);
              setVideoError(true);
            }}
            className="h-full w-full object-cover sm:object-contain"
          />
        ) : isGallery ? (
          /* Multi-image slideshow / gallery */
          <div className="relative h-full w-full overflow-hidden">
            {/* Blurred background for aesthetic framing */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
              style={{
                backgroundImage: `url(${item.media.images[activeImageIndex] || item.media.poster})`,
              }}
            />

            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={item.media.images[activeImageIndex] || item.media.poster || ""}
                alt={item.title}
                className="h-full w-full object-contain transition-transform duration-700 hover:scale-105"
                loading={isActive ? "eager" : "lazy"}
              />
            </div>

            {/* Gallery Dots Indicator */}
            <div className="absolute top-16 left-0 right-0 z-20 flex justify-center gap-1.5 p-2">
              {item.media.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImageIndex === idx ? "w-6 bg-amber-400" : "w-1.5 bg-white/40"
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
            <AiFillPlayCircle className="h-14 w-14" />
          </div>
        </div>
      )}

      {/* 4. Double Tap Heart Burst */}
      {showHeartBurst && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center animate-bounce">
          <AiFillHeart className="h-28 w-28 text-rose-500 drop-shadow-2xl" />
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
