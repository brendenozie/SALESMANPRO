"use client";

import React, { useState, useEffect, useRef } from "react";

// Bounded LRU cache of image URLs that have been verified and decoded by the browser engine.
// Prevents unbounded memory growth in long browsing sessions (100+ reels) while guaranteeing
// that revisited reels render instantly with 0 blank frames.
class BoundedLRUCache {
  private cache = new Set<string>();
  private readonly maxSize: number;

  constructor(maxSize = 40) {
    this.maxSize = maxSize;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  add(key: string): void {
    if (!key) return;
    if (this.cache.has(key)) {
      // Refresh recency
      this.cache.delete(key);
      this.cache.add(key);
      return;
    }
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.values().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.add(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const decodedImagesCache = new BoundedLRUCache(40);

export function isImageDecoded(url: string): boolean {
  return decodedImagesCache.has(url);
}

export function markImageDecoded(url: string): void {
  if (url) decodedImagesCache.add(url);
}

interface DecodedFeedImageProps {
  src: string;
  alt: string;
  className?: string;
  blurDataUrl?: string;
  isPriority?: boolean;
  priority?: boolean;
  objectFit?: "contain" | "cover";
  onReady?: () => void;
  isDataSaver?: boolean;
}

/**
 * DecodedFeedImage
 *
 * Implements the strict image readiness lifecycle for Ghuba Feed Reels:
 * Requested -> Downloading -> Decoding -> Ready -> Displayed
 *
 * Eliminates partially decoded scanline artifacts and avoids white empty screens.
 * Uses a bounded LRU cache to keep memory stable over 100+ reel sessions.
 */
export const DecodedFeedImage: React.FC<DecodedFeedImageProps> = ({
  src,
  alt,
  className = "",
  blurDataUrl,
  isPriority = false,
  priority = false,
  objectFit = "contain",
  onReady,
  isDataSaver = false,
}) => {
  const shouldPrioritize = isPriority || priority;
  const isAlreadyDecoded = decodedImagesCache.has(src);
  
  const [status, setStatus] = useState<"READY" | "DECODING" | "FAILED">(() =>
    isAlreadyDecoded ? "READY" : "DECODING"
  );
  
  const onReadyCalledRef = useRef(false);

  useEffect(() => {
    if (!src) return;

    if (decodedImagesCache.has(src)) {
      setStatus("READY");
      if (!onReadyCalledRef.current && onReady) {
        onReadyCalledRef.current = true;
        onReady();
      }
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.src = src;

    if (typeof img.decode === "function") {
      img
        .decode()
        .then(() => {
          decodedImagesCache.add(src);
          if (isMounted) {
            setStatus("READY");
            if (!onReadyCalledRef.current && onReady) {
              onReadyCalledRef.current = true;
              onReady();
            }
          }
        })
        .catch(() => {
          // If browser decode is interrupted or unsupported for format, fallback to standard load
          img.onload = () => {
            decodedImagesCache.add(src);
            if (isMounted) {
              setStatus("READY");
              if (!onReadyCalledRef.current && onReady) {
                onReadyCalledRef.current = true;
                onReady();
              }
            }
          };
          img.onerror = () => {
            if (isMounted) setStatus("FAILED");
          };
        });
    } else {
      img.onload = () => {
        decodedImagesCache.add(src);
        if (isMounted) {
          setStatus("READY");
          if (!onReadyCalledRef.current && onReady) {
            onReadyCalledRef.current = true;
            onReady();
          }
        }
      };
      img.onerror = () => {
        if (isMounted) setStatus("FAILED");
      };
    }

    return () => {
      isMounted = false;
    };
  }, [src, onReady]);

  const isReady = status === "READY";
  const isFailed = status === "FAILED";

  const displaySrc = isFailed
    ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=720&auto=format&q=75"
    : src;

  return (
    <div 
      className="relative h-full w-full flex items-center justify-center overflow-hidden bg-black select-none"
      style={{ contain: "paint" }}
    >
      {/* 1. Contextual placeholder: ambient tone or subtle spinner */}
      {!isReady && !isFailed && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-950"
          style={
            blurDataUrl && !isDataSaver
              ? {
                  backgroundImage: `url(${blurDataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(20px)",
                }
              : undefined
          }
        >
          <div className="h-7 w-7 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
        </div>
      )}

      {/* 2. Decoded image: revealed smoothly once verified */}
      {(isReady || isFailed) && (
        <img
          src={displaySrc}
          alt={alt}
          className={`${
            objectFit === "cover" ? "object-cover" : "object-contain max-h-full max-w-full"
          } ${className} transition-opacity duration-200 opacity-100`}
          style={{ objectFit }}
          draggable={false}
          decoding="async"
          loading={shouldPrioritize ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};
