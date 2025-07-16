"use client";

import React, { useState } from 'react'; // Import useState
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Image from 'next/image';
import { PlayCircleIcon, ClockIcon, UserIcon, WifiIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Updated icons for relevance

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (adjusted for this section's context)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Faster stagger for cards
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 }, // Fade in from slightly below, with a subtle scale up
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

// Placeholder for Video Item structure
interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    src: string; // The actual video URL
    instructor: string;
    durationMinutes: number;
    level: 'Beginner' | 'Intermediate' | 'Advanced'; // Added complexity/level
    isLive?: boolean; // New flag for live classes
}

// Dummy data for demonstration
const dummyVideos: VideoItem[] = [
    {
        id: 'vid1',
        title: 'Full Body HIIT Blast',
        thumbnail: '/images/video-hiit.jpg', // Ensure these images exist in public/images
        src: '/videos/sample-video.mp4', // Use a real sample video or placeholder
        instructor: 'Coach Alex',
        durationMinutes: 30,
        level: 'Advanced',
    },
    {
        id: 'vid2',
        title: 'Beginner Yoga Flow',
        thumbnail: '/images/video-yoga.jpg',
        src: '/videos/sample-video.mp4',
        instructor: 'Sarah Lee',
        durationMinutes: 45,
        level: 'Beginner',
        isLive: true,
    },
    {
        id: 'vid3',
        title: 'Core Strength & Stability',
        thumbnail: '/images/video-core.jpg',
        src: '/videos/sample-video.mp4',
        instructor: 'Dr. Emily',
        durationMinutes: 20,
        level: 'Intermediate',
    },
    {
        id: 'vid4',
        title: 'Mindful Meditation Guide',
        thumbnail: '/images/video-meditation.jpg',
        src: '/videos/sample-video.mp4',
        instructor: 'Zen Master Kim',
        durationMinutes: 15,
        level: 'Beginner',
    },
    {
        id: 'vid5',
        title: 'Dance Cardio Party',
        thumbnail: '/images/video-dance.jpg',
        src: '/videos/sample-video.mp4',
        instructor: 'Javier Diaz',
        durationMinutes: 40,
        level: 'Intermediate',
        isLive: true,
    },
    {
        id: 'vid6',
        title: 'Advanced Weight Training',
        thumbnail: '/images/video-weights.jpg',
        src: '/videos/sample-video.mp4',
        instructor: 'Ben "The Beast" Green',
        durationMinutes: 60,
        level: 'Advanced',
    },
];

// ----------------------------------------------------------------------------
// VirtualClassesSection: Transformed for intuitive, engaging, captivating, and beautiful design
// ----------------------------------------------------------------------------
export default function VirtualClassesSection({ videos = dummyVideos }: { videos?: VideoItem[] }) {
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    return (
        <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 relative"> {/* Soft, inviting gradient background */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <motion.h2
                    className="mb-14 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Dive Into Our <span className="text-primary-dark">Virtual Classes & On-Demand Library</span> 🚀
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" // Increased gap
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {videos.map((vid) => (
                        <motion.div
                            key={vid.id}
                            className="relative cursor-pointer rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100" // Enhanced card styling
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedVideo(vid)}
                            aria-label={`Play video: ${vid.title}`}
                        >
                            {/* Thumbnail Image with Gradient Overlay and Live Indicator */}
                            <div className="relative h-56 w-full overflow-hidden"> {/* Increased height */}
                                <Image
                                    src={vid.thumbnail}
                                    alt={vid.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transform transition-transform duration-500 ease-in-out" // Subtle zoom on hover
                                    loader={loader}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={vid.isLive} // Prioritize loading live class thumbnails
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" /> {/* Darker gradient for text contrast */}

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <motion.div
                                        className="p-4 bg-white/90 backdrop-blur-sm rounded-full text-primary-dark shadow-lg"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <PlayCircleIcon className="h-10 w-10" /> {/* Larger, more prominent play icon */}
                                    </motion.div>
                                </div>

                                {/* Live Indicator Badge */}
                                {vid.isLive && (
                                    <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                                        LIVE <WifiIcon className="inline-block h-3 w-3 ml-1" />
                                    </span>
                                )}
                            </div>

                            {/* Video Details */}
                            <div className="p-5 flex flex-col space-y-2"> {/* Increased padding, better spacing */}
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-dark transition-colors duration-200">{vid.title}</h3>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <UserIcon className="h-4 w-4 mr-1 text-primary-light" />
                                    <span>{vid.instructor}</span>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <ClockIcon className="h-4 w-4 mr-1 text-primary-light" />
                                    <span>{vid.durationMinutes} min</span>
                                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold"
                                          style={{
                                              backgroundColor: vid.level === 'Beginner' ? '#D1FAE5' : vid.level === 'Intermediate' ? '#FEF3C7' : '#FEE2E2',
                                              color: vid.level === 'Beginner' ? '#065F46' : vid.level === 'Intermediate' ? '#92400E' : '#991B1B'
                                          }}>
                                        {vid.level}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to action for more videos */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <a
                        href="/virtual-library" // Link to your full virtual library page
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Browse Full Video Library
                        <ArrowRightIcon className="h-5 w-5 ml-3" />
                    </a>
                </motion.div>
            </div>

            {/* Lightbox Modal with enhanced styling */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4" // Darker overlay, some padding
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedVideo(null)} // Close on background click
                    >
                        <motion.div
                            className="relative w-full max-w-5xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl" // Darker modal background, larger max-width, more rounded
                            initial={{ scale: 0.7, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.7, y: 50 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        >
                            {/* Close Button */}
                            <button
                                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full bg-white/10 hover:bg-white/20"
                                onClick={() => setSelectedVideo(null)}
                                aria-label="Close video player"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {/* Video Title (inside modal) */}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent text-white text-lg font-semibold z-10">
                                {selectedVideo.title}
                            </div>
                            {/* Video Player */}
                            <video
                                src={selectedVideo.src}
                                controls
                                autoPlay
                                className="w-full h-auto aspect-video rounded-3xl" // Maintain aspect ratio, apply border-radius to video
                                onEnded={() => setSelectedVideo(null)} // Close modal when video ends
                            >
                                Your browser does not support the video tag.
                            </video>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}