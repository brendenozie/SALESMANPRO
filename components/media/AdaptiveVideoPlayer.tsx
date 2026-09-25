"use client";

import React, { useEffect, useRef } from "react";

interface AdaptiveVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
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

    if (src.includes(".m3u8")) {
      // Check for native HLS (Safari, iOS)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        // Dynamically import hls.js if available in the environment
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
              });
              hlsInstance.loadSource(src);
              hlsInstance.attachMedia(video);
            } else {
              video.src = src;
            }
          })
          .catch(() => {
            video.src = src;
          });
      }
    } else {
      // Direct MP4 / WebM
      video.src = src;
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
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
