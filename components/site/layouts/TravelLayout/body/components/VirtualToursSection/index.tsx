"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircleIcon, // For virtual tour play button
  MapPinIcon, // For location in tour card
  ClockIcon, // For duration in tour card
  TagIcon, // For category in tour card
  XMarkIcon, // For modal close button
  ArrowRightIcon, // For view all button
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

// --- Shared Utilities (from previous sections for consistency) ---

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Base64 encoded SVG for a simple blur placeholder
const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// Animation variants for consistent staggered reveals across sections
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Delay between child animations
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring for a gentle bounce
      damping: 15,    // More damping for a smoother stop
    },
  },
};

// --- Dummy Data for Virtual Tours (Enhanced) ---
const virtualTours = [
  {
    id: "vt1",
    title: "Explore the Amazon Rainforest",
    description: "A breathtaking journey into the heart of the world's largest rainforest.",
    thumbnail: "https://images.unsplash.com/photo-1546522301-447544d673f4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1", // Example YouTube embed URL
    duration: "5 min",
    location: "Amazon, Brazil",
    category: "Nature & Wildlife",
  },
  {
    id: "vt2",
    title: "A Walk Through Ancient Rome",
    description: "Step back in time and witness the grandeur of the Roman Empire.",
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197cefa08d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/q_2h_2Q00c0?autoplay=1", // Example YouTube embed URL
    duration: "7 min",
    location: "Rome, Italy",
    category: "History & Culture",
  },
  {
    id: "vt3",
    title: "Safari in Serengeti National Park",
    description: "Witness the Great Migration and Africa's iconic wildlife up close.",
    thumbnail: "https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/FwV8h6rC2i0?autoplay=1", // Example YouTube embed URL
    duration: "6 min",
    location: "Serengeti, Tanzania",
    category: "Adventure & Wildlife",
  },
  {
    id: "vt4",
    title: "Underwater Wonders of Maldives",
    description: "Dive into crystal-clear waters and discover vibrant marine life.",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-c1341c22956c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/0G3_m8J0B7o?autoplay=1", // Example YouTube embed URL
    duration: "4 min",
    location: "Maldives",
    category: "Beach & Diving",
  },
  {
    id: "vt5",
    title: "Kyoto Cherry Blossom Festival",
    description: "Experience the ephemeral beauty of Japan's iconic cherry blossoms.",
    thumbnail: "https://images.unsplash.com/photo-1545562083-d73b08767ef2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/5yS8K2b82oE?autoplay=1", // Example YouTube embed URL
    duration: "3 min",
    location: "Kyoto, Japan",
    category: "Nature & Culture",
  },
  {
    id: "vt6",
    title: "Hiking the Himalayas",
    description: "Conquer majestic peaks and discover serene mountain monasteries.",
    thumbnail: "https://images.unsplash.com/photo-1596547671043-f11186e246c1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/nLg6q9Fw6u4?autoplay=1", // Example YouTube embed URL
    duration: "8 min",
    location: "Nepal",
    category: "Adventure & Trekking",
  },
];


// VirtualTourModal.jsx
function VirtualTourModal({ videoUrl, onClose }) {
  useEffect(() => {
    // Disable scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Close modal when clicking outside video
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking video
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition"
          aria-label="Close video"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>
        <iframe
          src={videoUrl}
          title="Virtual Tour"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </motion.div>
    </motion.div>
  );
}

// VirtualTourCard.jsx
function VirtualTourCard({ tour, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative flex-shrink-0 w-80 h-56 rounded-2xl overflow-hidden shadow-lg cursor-pointer group border border-gray-100" // Larger size
      onClick={() => onOpen(tour.videoUrl)}
    >
      <Image
        src={tour.thumbnail}
        alt={tour.title}
        layout="fill"
        objectFit="cover"
        className="transform transition-transform duration-500 group-hover:scale-110" // Smooth zoom on hover
        loader={customLoader}
        placeholder="blur"
        blurDataURL={blurSvg}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.span
          initial={{ opacity: 0.8, scale: 0.9 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="text-white text-6xl drop-shadow-lg"
          aria-label={`Play ${tour.title}`}
        >
          <PlayCircleIcon className="h-20 w-20 text-white/90 group-hover:text-white transition-colors duration-200" />
        </motion.span>
      </div>

      {/* Tour Info */}
      <div className="absolute bottom-4 left-4 right-4 text-white z-20">
        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{tour.title}</h3>
        <p className="text-sm text-gray-200 flex items-center mb-1">
          <MapPinIcon className="h-4 w-4 mr-1" /> {tour.location}
        </p>
        <p className="text-sm text-gray-200 flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" /> {tour.duration}
          <span className="mx-2">•</span>
          <TagIcon className="h-4 w-4 mr-1" /> {tour.category}
        </p>
      </div>
    </motion.div>
  );
}

// VirtualTours.jsx
export default function VirtualTours() {
  const [modalVideoUrl, setModalVideoUrl] = useState(null);

  const openModal = (url) => {
    setModalVideoUrl(url);
  };

  const closeModal = () => {
    setModalVideoUrl(null);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white overflow-hidden"> {/* Gradient background */}
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Immersive Virtual Tours
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Experience your next destination before you even pack your bags. Step into breathtaking landscapes and vibrant cultures from home.
        </motion.p>

        <motion.div
          className="flex space-x-6 overflow-x-auto pb-6 px-2 md:px-0 hide-scrollbar scroll-smooth" // Horizontal scrollable carousel
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {virtualTours.map((tour) => (
            <motion.div key={tour.id} variants={itemVariants}>
              <VirtualTourCard tour={tour} onOpen={openModal} />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link href="/virtual-tours" passHref>
            <motion.button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 font-bold text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center mx-auto gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Discover More Tours <ArrowRightIcon className="h-5 w-5 ml-2" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      <AnimatePresence>
        {modalVideoUrl && (
          <VirtualTourModal videoUrl={modalVideoUrl} onClose={closeModal} />
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </section>
  );
}