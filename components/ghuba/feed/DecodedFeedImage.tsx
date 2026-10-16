"use client";

import React, { useState, useEffect } from "react";

// Module-level cache of image URLs that have been completely decoded by the browser engine.
// Once an image is in this set, subsequent mounts in reels render immediately without any blank gap.
const decodedImagesCache = new Set<string>();

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
}

/**
 * DecodedFeedImage
 *
 * Implements the strict image readiness lifecycle for Ghuba Feed Reels:
 * Requested -> Downloading -> Decoding -> Ready -> Displayed
 *
 * Eliminates partially decoded scanline artifacts and avoids white empty screens.
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
}) => {
  const shouldPrioritize = isPriority || priority;
  const [status, setStatus] = useState<"READY" | "DECODING" | "FAILED">(() =>
    decodedImagesCache.has(src) ? "READY" : "DECODING"
  );

  useEffect(() => {
    if (!src) return;

    if (decodedImagesCache.has(src)) {
      setStatus("READY");
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
          if (isMounted) setStatus("READY");
        })
        .catch(() => {
          // If browser decode fails (e.g. progressive abort or aborted network), fallback to onload
          img.onload = () => {
            decodedImagesCache.add(src);
            if (isMounted) setStatus("READY");
          };
          img.onerror = () => {
            if (isMounted) setStatus("FAILED");
          };
        });
    } else {
      img.onload = () => {
        decodedImagesCache.add(src);
        if (isMounted) setStatus("READY");
      };
      img.onerror = () => {
        if (isMounted) setStatus("FAILED");
      };
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  const isReady = status === "READY";
  const isFailed = status === "FAILED";

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden bg-black select-none">
      {/* 1. Contextual placeholder: ambient blurred tone or subtle brand spinner */}
      {!isReady && !isFailed && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-950"
          style={
            blurDataUrl
              ? {
                  backgroundImage: `url(${blurDataUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(20px)",
                }
              : undefined
          }
        >
          <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
        </div>
      )}

      {/* 2. Decoded image: revealed smoothly only once decoded, preserving native aspect ratio */}
      <img
        src={
          isFailed
            ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&q=80"
            : src
        }
        alt={alt}
        className={`${objectFit === "cover" ? "object-cover" : "object-contain max-h-full max-w-full"} ${className} transition-opacity duration-300 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectFit }}
        draggable={false}
        loading={shouldPrioritize ? "eager" : "lazy"}
      />
    </div>
  );
};
