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
    description: 'Learn analytical distribution strategies to boost platform authority and audience scale metrics.',
    audioUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?q=80&w=400&auto=format&fit=crop',
    slug: 'social-media-power',
    duration: '42:15',
  },
  {
    id: 'podcast2',
    title: 'SEO Mastery: How to Rank Higher',
    description: 'Deep dive into crawler parsing configurations, semantic structure, and keyword indexing pipelines.',
    audioUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400&auto=format&fit=crop',
    slug: 'seo-mastery',
    duration: '35:40',
  },
  {
    id: 'podcast3',
    title: 'Monetizing Your Passion into Profit',
    description: 'Deconstruct corporate sponsorship operations, tracking link funnels, and contract negotiation pipelines.',
    audioUrl: '#',
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=400&auto=format&fit=crop',
    slug: 'monetizing-blog',
    duration: '50:10',
  },
];

// ---------------------------------------------------------
// 2. SUB-COMPONENTS (Visualizers)
// ---------------------------------------------------------
interface AudioWaveProps {
  isPlaying: boolean;
}

const AudioWave = ({ isPlaying }: AudioWaveProps) => {
  return (
    <div className="flex items-end gap-[2px] h-3 w-4">
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          className="w-[2px] bg-slate-400 group-hover:bg-white transition-colors"
          animate={isPlaying ? {
            height: ["20%", "100%", "40%", "80%", "20%"],
          } : { height: "20%" }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: bar * 0.08,
          }}
        />
      ))}
    </div>
  );
};

interface LatestPodcastSectionProps {
  Podcast?: any[];
  themeSettings?: Record<string, any> | null;
}

const LatestPodcastSection = ({ Podcast: podcasts, themeSettings }: LatestPodcastSectionProps) => {
  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const podcastItems = React.useMemo(() => {
    return Array.isArray(podcasts) && podcasts.length > 0
      ? podcasts.slice(0, 3)
      : fallbackPodcasts;
  }, [podcasts]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/400x400/1e293b/ffffff?text=Audio';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== SECTION HEADER BLOCK ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-900">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <MicrophoneIcon className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                Broadcast Index
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              Latest Episodes
            </h2>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="/blog/podcasts"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              Browse All Episodes
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ===== HIGH-DENSITY ROW INDEX MATRIX ===== */}
        <motion.div
          className="flex flex-col border border-slate-900 bg-slate-900 gap-px rounded-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {podcastItems.map((pc, idx) => {
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <motion.div
                key={pc.id || idx}
                variants={itemVariants}
                className="bg-slate-950 transition-colors duration-150 group cursor-pointer relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  borderLeft: isHovered ? `3px solid ${primaryColor}` : '3px solid transparent',
                  marginLeft: '-3px'
                }}
              >
                <a href={pc.slug ? `/blog/podcasts/${pc.slug}` : '#'} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6">
                  
                  {/* Left Content Column Frame */}
                  <div className="flex flex-1 items-start gap-4 min-w-0">
                    
                    {/* Index Sequence Counter */}
                    <span className="text-xs font-mono text-slate-600 pt-1 select-none">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Fixed Size Square Aspect Thumb Cover */}
                    <div className="w-14 h-14 bg-slate-900 rounded border border-slate-800 overflow-hidden shrink-0">
                      <img
                        src={pc.coverImage || 'https://placehold.co/400x400'}
                        alt={pc.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        onError={handleImageError}
                      />
                    </div>

                    {/* Metadata Header Identity Stack */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-200 tracking-wide line-clamp-1 group-hover:text-white transition-colors">
                        {pc.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-2xl">
                        {pc.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Analytics and Play Column Frame */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto shrink-0 gap-8 pl-6 md:pl-0 border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
                    
                    {/* Running Playback Duration Monospace Meter */}
                    <div className="flex items-center gap-3">
                      <AudioWave isPlaying={isHovered} />
                      <span className="text-xs font-mono text-slate-500 tracking-wider">
                        {pc.duration || "00:00"}
                      </span>
                    </div>

                    {/* Compact Interactive Play Square Trigger */}
                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                      <PlayIcon className="w-3.5 h-3.5" />
                    </div>

                  </div>

                </a>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default LatestPodcastSection;