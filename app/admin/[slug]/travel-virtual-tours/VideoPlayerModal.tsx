"use client";

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

// Function to reliably extract the YouTube video ID from various URL formats.
const getYouTubeVideoId = (url: string) => {
  // Regex to match YouTube video ID from various URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enable/disable scrolling on the body when the modal opens/closes
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  if (!isOpen) return null;

  const videoId = getYouTubeVideoId(videoUrl);
  // Construct the correct YouTube embed URL with autoplay and controls
  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3`
    : videoUrl; // Fallback to original URL if ID cannot be extracted

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-lg bg-black bg-opacity-80 flex items-center justify-center z-[1000] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          className="bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-8 w-full max-w-6xl relative transform"
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100
          }}
          onClick={(e:any) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <motion.button
            onClick={onClose}
            className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-white bg-indigo-600 rounded-full p-2 hover:bg-indigo-700 transition-colors z-50 shadow-lg"
            aria-label="Close video player"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-8 h-8" />
          </motion.button>
          
          <h2 className="text-3xl font-bold text-white mb-6 text-center leading-tight drop-shadow-md">{title}</h2>
          
          <div className="relative pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-inner-xl">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              src={embedSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayerModal;