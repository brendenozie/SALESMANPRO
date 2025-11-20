"use client";

import React from "react";
import { motion } from "framer-motion";
import { IBlog } from "@/types/typings";

// ---------------------------------------------------------
// MOCK / FALLBACK DATA
// ---------------------------------------------------------
const fallbackNews : any[] = [
  {
    id: "f1",
    title: "Global leaders unite to address climate crisis at COP26",
    publishedAt: "2023-04-21T10:00:00Z",
    coverImage: "https://placehold.co/600x400/22C55E/FFFFFF?text=Climate+Crisis",
    slug: "climate-crisis-cop26",
    categories: ["Environment"],
    author: { name: "Guest Author", profileImage: null },
  },
  {
    id: "f2",
    title: "Cybersecurity experts warn of increased threats in digital age",
    publishedAt: "2023-04-20T11:30:00Z",
    coverImage: "https://placehold.co/600x400/0EA5E9/FFFFFF?text=Cybersecurity",
    slug: "cybersecurity-threats",
    categories: ["Technology"],
    author: { name: "Guest Author", profileImage: null },
  },
  {
    id: "f3",
    title: "Athlete achieves historic win at world championships",
    publishedAt: "2023-04-19T09:00:00Z",
    coverImage: "https://placehold.co/600x400/EC4899/FFFFFF?text=Historic+Win",
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
  
  // 1. THEME EXTRACTION
  // Safely extract primary color or default to a cool Indigo
  const primaryColor = themeSettings?.primaryColor || "#6366f1";
  
  // Helper to convert hex to rgba for backgrounds
  const getAccentedBackground = (opacity = 0.1) => {
    // Simple logic to approximate rgba from hex would go here
    // For now, we rely on inline styles or CSS variables if available
    return primaryColor; 
  };

  // 2. DATA PROCESSING
  const newsItems = Array.isArray(blogs) && blogs.length > 0 ? blogs.slice(0, 3) : fallbackNews;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      year: date.getFullYear(),
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/1e293b/cbd5e1?text=News";
  };

  // 3. ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 15 } 
    },
  };

  return (
    <section className="relative py-24 bg-slate-950 font-sans overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-900/20 rounded-[100%] blur-[120px] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Insights</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Stay informed with the newest trends, breaking news, and in-depth editorials from our team.
            </p>
          </div>

          {/* Desktop View All Button */}
          <a
            href="/blogs"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-widest group"
          >
            View Archives
            <span 
              className="block w-8 h-[1px] bg-slate-600 group-hover:w-12 group-hover:bg-white transition-all duration-300"
            />
          </a>
        </motion.div>

        {/* BLOG GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {newsItems.map((item, idx) => {
            const dateObj = formatDate(item.createdAt || item.publishedAt || new Date().toISOString());
            
            return (
              <motion.article
                key={idx}
                variants={cardVariants}
                className="group relative flex flex-col h-full"
              >
                <a href={item.slug ? `/blogs/${item.slug}` : "#"} className="block h-full">
                  
                  {/* Card Container */}
                  <div className="relative h-full bg-slate-900/40 border border-slate-800/60 rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-500 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2">
                    
                    {/* Image Wrapper */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
                      <img
                        src={item.coverImage || "https://placehold.co/600x400"}
                        alt={item.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        onError={handleImageError}
                      />

                      {/* Floating Date Badge */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col items-center justify-center w-14 h-14 bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl text-center shadow-lg">
                        <span className="text-xs font-bold text-slate-400 uppercase">{dateObj.month}</span>
                        <span className="text-xl font-extrabold text-white leading-none">{dateObj.day}</span>
                      </div>

                      {/* Category Badge (Bottom Left of Image) */}
                      {item.categories && item.categories.length > 0 && (
                         <div className="absolute bottom-4 left-4 z-20">
                           <span 
                             className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider rounded-full backdrop-blur-md bg-white/20 border border-white/20 shadow-sm"
                             style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                           >
                             {item.categories[0]}
                           </span>
                         </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-6 flex flex-col flex-grow">
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-100 mb-3 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Author & Read Time (Spacer) */}
                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-800/50">
                         <div className="flex items-center gap-2">
                           <img 
                             src={item.author?.profileImage || `https://ui-avatars.com/api/?name=${item.author?.name || 'User'}&background=random`}
                             alt="Author"
                             className="w-6 h-6 rounded-full ring-2 ring-slate-800"
                             onError={handleImageError}
                           />
                           <span className="text-sm text-slate-400 font-medium truncate max-w-[100px]">
                             {item.author?.name || "Editor"}
                           </span>
                         </div>

                         {/* Read More Link */}
                         <div className="ml-auto flex items-center gap-1 text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                           Read
                           <svg 
                             className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor"
                             style={{ color: primaryColor }}
                           >
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                           </svg>
                         </div>
                      </div>
                    </div>
                    
                    {/* Hover Bottom Highlight Line */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-0 group-hover:w-full transition-all duration-500 ease-out"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </a>
              </motion.article>
            );
          })}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
           <a
            href="/blogs"
            className="inline-block px-8 py-3 rounded-full font-bold text-sm bg-slate-800 text-white border border-slate-700 shadow-lg hover:bg-slate-700 transition-all"
          >
            View All Articles
          </a>
        </div>

      </div>
    </section>
  );
};

export default LatestNewsSection;