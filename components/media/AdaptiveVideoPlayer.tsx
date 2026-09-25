"use client";

import React, { useEffect, useRef } from "react";

interface AdaptiveVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

// Resilient helper to dynamically load Hls.js at runtime without failing webpack compilation during next build
function loadHlsRuntime(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  // 1. If Hls is already loaded on window, reuse it
  if ((window as any).Hls) {
    return Promise.resolve((window as any).Hls);
  }

  // 2. Otherwise inject Hls.js script tag dynamically from reliable CDN
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("sp-hls-runtime") as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as any).Hls) {
        return resolve((window as any).Hls);
      }
      existingScript.addEventListener("load", () => resolve((window as any).Hls));
      existingScript.addEventListener("error", (err) => reject(err));
      return;
    }

    const script = document.createElement("script");
    script.id = "sp-hls-runtime";
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if ((window as any).Hls) {
        resolve((window as any).Hls);
      } else {
        reject(new Error("Hls.js loaded but window.Hls is not defined"));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export default function AdaptiveVideoPlayer({
  src,
  poster,
  className = "w-full aspect-video rounded-2xl bg-black",
  autoPlay = true,
}: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hlsInstance: any = null;
    let isCancelled = false;

    if (src.includes(".m3u8")) {
      // Native HLS for Safari and iOS WebKit
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        // Dynamic runtime load for Chromium, Firefox, Edge, etc.
        loadHlsRuntime()
          .then((Hls) => {
            if (isCancelled || !videoRef.current) return;
            if (Hls && Hls.isSupported && Hls.isSupported()) {
              hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
              });
              hlsInstance.loadSource(src);
              hlsInstance.attachMedia(videoRef.current);
            } else {
              videoRef.current.src = src;
            }
          })
          .catch((err) => {
            console.warn("[AdaptiveVideoPlayer] Hls.js dynamic runtime unavailable, falling back to direct source:", err);
            if (!isCancelled && videoRef.current) {
              videoRef.current.src = src;
            }
          });
      }
    } else {
      // Direct MP4 / WebM progressive video
      video.src = src;
    }

    return () => {
      isCancelled = true;
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch (_) {}
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      autoPlay={autoPlay}
      poster={poster}
      className={className}
    >
      Your browser does not support the video tag.
    </video>
  );
}

