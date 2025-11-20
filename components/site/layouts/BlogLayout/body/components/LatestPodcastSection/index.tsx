"use client";

import React from "react";
import { motion } from "framer-motion";
import { PlayIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

// ---------------------------------------------------------
// 1. MOCK DATA
// ---------------------------------------------------------
const fallbackPodcasts = [
  {
    id: 'podcast1',
    title: 'Social Media Power: Amplifying Your Reach',
    description: 'Learn strategies to boost your blog visibility and engagement across all platforms.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x600/F59E0B/FFFFFF?text=Social+Power', // Square images work best for vinyl look
    slug: 'social-media-power',
    duration: '42 min',
  },
  {
    id: 'podcast2',
    title: 'SEO Mastery: How to Rank Higher',
    description: 'Dive deep into search engine optimization techniques to dominate search rankings.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x600/EF4444/FFFFFF?text=SEO+Mastery',
    slug: 'seo-mastery',
    duration: '35 min',
  },
  {
    id: 'podcast3',
    title: 'Monetizing Your Passion into Profit',
    description: 'Discover various ways to generate income, from affiliate marketing to sponsorships.',
    audioUrl: '#',
    coverImage: 'https://placehold.co/600x600/0EA5E9/FFFFFF?text=Monetize',
    slug: 'monetizing-blog',
    duration: '50 min',
  },
];

// ---------------------------------------------------------
// 2. SUB-COMPONENTS (Visualizers)
// ---------------------------------------------------------

// A mini animated equalizer bar
const AudioWave = () => {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          className="w-1 bg-white rounded-t-sm"
          animate={{
            height: ["20%", "80%", "40%", "100%", "20%"],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: bar * 0.1,
          }}
        />
      ))}
    </div>
  );
};

interface LatestPodcastSectionProps {
  Podcast: any[];
}

const LatestPodcastSection = ({ Podcast: podcasts }: LatestPodcastSectionProps) => {
  
  // Data Handling
  const podcastItems = Array.isArray(podcasts) && podcasts.length > 0
    ? podcasts.slice(0, 3) // Limit to 3 for the detailed vinyl layout
    : fallbackPodcasts;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/600x600/1e293b/cbd5e1?text=Audio';
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="relative py-24 bg-slate-950 font-sans overflow-hidden">
      
      {/* Ambient Background Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-violet-400 shadow-lg shadow-violet-500/20">
              <MicrophoneIcon className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold tracking-widest text-violet-400 uppercase">
              On Air
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Episodes</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Interviews, deep dives, and audio stories curated for you.
          </p>
        </motion.div>

        {/* Podcast Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {podcastItems.map((pc, idx) => (
            <motion.div
              key={pc.id || idx}
              variants={itemVariants}
              className="group relative flex flex-col items-center"
            >
              <a href={pc.slug ? `/podcasts/${pc.slug}` : pc.audioUrl || '#'} className="block w-full max-w-sm">
                
                {/* 1. THE VINYL COVER ART INTERACTION */}
                {/* This wrapper holds the cover and the disc behind it */}
                <div className="relative w-full aspect-square mb-8">
                  
                  {/* The Disc (Vinyl) - Absolute positioned behind the image */}
                  <div className="absolute top-2 right-2 bottom-2 left-2 rounded-full bg-black border-4 border-slate-800 shadow-2xl flex items-center justify-center transform transition-transform duration-700 ease-out group-hover:translate-x-12 group-hover:rotate-[360deg]">
                    {/* Disc Grooves */}
                    <div className="w-full h-full rounded-full border-[20px] border-slate-900/80 relative opacity-80"></div>
                    {/* Disc Label */}
                    <div className="absolute w-1/3 h-1/3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                  </div>

                  {/* The Album Cover - Sits on top */}
                  <div className="relative z-10 w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 group-hover:-translate-x-4 transition-transform duration-500 ease-out">
                    <img
                      src={pc.coverImage || 'https://placehold.co/600x600'}
                      alt={pc.title}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. TEXT CONTENT */}
                <div className="text-center relative z-20 px-2">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-300 transition-colors">
                    {pc.title}
                  </h3>
                  
                  <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">
                    {pc.description || "Listen to the full episode to learn more..."}
                  </p>

                  {/* 3. ACTION BUTTON */}
                  <div className="flex items-center justify-center">
                    <button className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 hover:border-violet-500/50 transition-all duration-300 shadow-lg group/btn overflow-hidden">
                      {/* Gradient Shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-shine" />
                      
                      {/* Icon & Text */}
                      <PlayIcon className="w-4 h-4 text-violet-400" />
                      <span>Listen Now</span>
                      
                      {/* Animated Wave - Only plays on card hover */}
                      <div className="opacity-50 group-hover:opacity-100 transition-opacity ml-2">
                        <AudioWave />
                      </div>
                    </button>
                  </div>
                </div>

              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Link */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a
            href="/podcasts"
            className="inline-block text-sm font-bold text-slate-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-violet-500 pb-1 transition-colors"
          >
            Browse All Episodes
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default LatestPodcastSection;