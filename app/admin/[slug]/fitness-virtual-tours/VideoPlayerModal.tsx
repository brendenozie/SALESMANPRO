"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

// Extract YouTube video ID safely
const getYouTubeVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  /** Lock body scroll */
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /** Escape key to close */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const videoId = getYouTubeVideoId(videoUrl);
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : videoUrl;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="
            relative w-full max-w-5xl rounded-3xl
            bg-white dark:bg-zinc-900
            shadow-2xl border border-black/10 dark:border-white/10
            overflow-hidden
          "
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white line-clamp-1">
              {title}
            </h2>

            <motion.button
              onClick={onClose}
              aria-label="Close video"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="
                rounded-full p-2
                bg-zinc-100 hover:bg-zinc-200
                dark:bg-zinc-800 dark:hover:bg-zinc-700
                transition-colors
              "
            >
              <XMarkIcon className="h-5 w-5 text-zinc-800 dark:text-white" />
            </motion.button>
          </div>

          {/* Video */}
          <div className="relative aspect-video bg-black">
            <iframe
              src={embedSrc}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Optional footer hint (mobile UX) */}
          <div className="px-6 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Tap outside or press <span className="font-medium">Esc</span> to close
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayerModal;