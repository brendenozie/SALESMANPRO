"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { IBlog } from "@/types/typings";

const fallbackNews: any[] = [
  {
    id: "f1",
    title: "Global leaders unite to address climate crisis at COP26",
    publishedAt: "2026-04-21T10:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop",
    slug: "climate-crisis-cop26",
    categories: ["Environment"],
    author: { name: "Guest Author", profileImage: null },
  },
  {
    id: "f2",
    title: "Cybersecurity experts warn of increased threats in digital age",
    publishedAt: "2026-04-20T11:30:00Z",
    coverImage: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop",
    slug: "cybersecurity-threats",
    categories: ["Technology"],
    author: { name: "Guest Author", profileImage: null },
  },
  {
    id: "f3",
    title: "Athlete achieves historic win at world championships",
    publishedAt: "2026-04-19T09:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop",
    slug: "historic-win",
    categories: ["Sports"],
    author: { name: "Guest Author", profileImage: null },
  },
];

interface LatestNewsSectionProps {
  blogs: IBlog[];
  themeSettings: Record<string, any> | null;
}

const LatestNewsSection = ({ blogs, themeSettings }: LatestNewsSectionProps) => {
  const primaryColor = themeSettings?.primaryColor || "#f97316";
  const newsItems = Array.isArray(blogs) && blogs.length > 0 ? blogs.slice(0, 3) : fallbackNews;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/1e293b/ffffff?text=Image+Unavailable";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { 
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
              Latest Insights
            </h2>
            <p className="text-sm text-slate-400 font-normal">
              Stay informed with the newest strategic indicators, technical updates, and reports.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="/blog/listings"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              View Archives
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ===== BALANCED GRID LAYOUT FRAME ===== */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-900 border border-slate-900 rounded-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20px" }}
        >
          {newsItems.map((item, idx) => {
            const dateObj = formatDate(item.createdAt || item.publishedAt || new Date().toISOString());
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <motion.article
                key={idx}
                variants={cardVariants}
                className="bg-slate-950 flex flex-col h-full relative transition-colors duration-200 group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  borderBottom: isHovered ? `2px solid ${primaryColor}` : '2px solid transparent',
                  marginBottom: '-2px'
                }}
              >
                <a href={item.slug ? `/blog/listings/${item.slug}` : "#"} className="flex flex-col h-full p-6">
                  
                  {/* Clean Framed Media Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900 rounded border border-slate-800">
                    <img
                      src={item.coverImage || "https://placehold.co/600x400"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      onError={handleImageError}
                    />
                    
                    {/* Minimal Absolute Content Indicators */}
                    {item.categories && item.categories.length > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider bg-slate-950/80 backdrop-blur border border-slate-800 rounded-sm">
                          {item.categories[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Metadata Block Elements */}
                  <div className="mt-5 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Meta Date Row */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-2">
                        <span>{dateObj.month}</span>
                        <span>{dateObj.day}</span>
                        <span>•</span>
                        <span>{dateObj.year}</span>
                      </div>

                      {/* Structural Header Title */}
                      <h3 className="text-base font-semibold text-slate-200 tracking-wide line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    {/* Footer Signature Element */}
                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <img 
                          src={item.author?.profileImage || `https://ui-avatars.com/api/?name=${item.author?.name || 'User'}&background=1e293b&color=ffffff`}
                          alt="Author avatar profile frame"
                          className="w-5 h-5 rounded-full border border-slate-800"
                        />
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
                          {item.author?.name || "System Editor"}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                        <span>Read</span>
                        <svg 
                          className="w-3.5 h-3.5 transform transition-transform duration-200 group-hover:translate-x-0.5" 
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </a>
              </motion.article>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default LatestNewsSection;