"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";

// ---------------------------------------------------------
// ICONS & ASSETS
// ---------------------------------------------------------
const TwitterIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 21.227.792 22 1.771 22h20.451C23.2 22 24 21.227 24 20.271V1.729C24 .774 23.2 0 22.225 0z"/>
  </svg>
);

// ---------------------------------------------------------
// DATA HANDLING
// ---------------------------------------------------------
const fallbackStaffWriters = [
  { name: 'Kristin Watson', role: 'Editor in Chief', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', articles: 42 },
  { name: 'Marvin Roy', role: 'Tech Journalist', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop', articles: 28 },
  { name: 'Leslie Aria', role: 'Senior Publisher', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', articles: 35 },
  { name: 'Hawkins Alex', role: 'Content Strategy', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', articles: 19 },
];

interface StaffWriterProps {
  Writer: any[];
}

const StaffWritersSection = ({ Writer: dynamicWriters }: StaffWriterProps) => {
  const { storeFormData } = useStoreContext() || {};
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  const writersToDisplay = React.useMemo(() => {
    return Array.isArray(dynamicWriters) && dynamicWriters.length > 0
      ? dynamicWriters.map(writer => ({
          name: writer.name || 'Unknown Writer',
          role: writer.role || writer.bio || 'Contributor',
          img: writer.profilePicture || 'https://placehold.co/200x200/1e293b/ffffff?text=User',
          articles: Math.floor(Math.random() * 30) + 5,
        }))
      : fallbackStaffWriters;
  }, [dynamicWriters]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/200x200/1e293b/ffffff?text=User';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== SECTION HEADER BLOCK ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-900">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
              Editorial Staff
            </h2>
            <p className="text-sm text-slate-400 font-normal">
              Meet the analytical minds, designers, and authors driving our curated narratives forward.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="/blog/listings"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              View All Contributors
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ===== WRITERS GRID LAYOUT MATRIX ===== */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-900 border border-slate-900 rounded-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {writersToDisplay.map((writer, idx) => {
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-950 p-6 flex flex-col justify-between min-h-[260px] relative transition-colors duration-200 group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  borderBottom: isHovered ? `2px solid ${primaryColor}` : '2px solid transparent',
                  marginBottom: '-2px'
                }}
                onClick={() => {
                  const writerSlug = writer.name.toLowerCase().replace(/\s+/g, '-');
                  window.location.href = `/blog/listings?author=${writerSlug}`;
                }}
              >
                {/* Upper Identity Card Deck */}
                <div className="w-full flex items-start justify-between">
                  {/* Square Aspect Portrait Frame */}
                  <div className="w-20 h-20 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                    <img
                      src={writer.img}
                      alt={writer.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Clean Monospace Publication Count Metrics */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                      Released
                    </span>
                    <span className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                      {writer.articles.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Lower Identity Text Blocks */}
                <div className="mt-8 w-full flex items-end justify-between">
                  <div className="max-w-[70%]">
                    <h3 className="font-semibold text-slate-200 text-sm tracking-wide group-hover:text-white transition-colors truncate">
                      {writer.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {writer.role}
                    </p>
                  </div>

                  {/* Contextual Social Anchors */}
                  <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                    <a 
                      href="#" 
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      aria-label="Twitter profile redirection link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TwitterIcon />
                    </a>
                    <a 
                      href="#" 
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      aria-label="LinkedIn profile redirection link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <LinkedinIcon />
                    </a>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default StaffWritersSection;