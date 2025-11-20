"use client";

import React from "react";
import { motion } from "framer-motion";
import { IBlog } from "@/types/typings";

// ---------------------------------------------------------
// MOCK DATA & ASSETS
// ---------------------------------------------------------
const relatedBlogs = [
  {
    id: "related1",
    title: "How to build a sustainable home in the modern era",
    category: "Lifestyle",
    authorName: "Sarah Johnson",
    img: "https://placehold.co/600x400/1E40AF/FFFFFF?text=Sustainable+Home",
    slug: "sustainable-home",
  },
  {
    id: "related2",
    title: "The future of artificial intelligence in creative design",
    category: "Technology",
    authorName: "David Chen",
    img: "https://placehold.co/600x400/6D28D9/FFFFFF?text=AI+Design",
    slug: "ai-design",
  },
  {
    id: "related3",
    title: "Exploring the hidden gems of the Amazon rainforest",
    category: "Travel",
    authorName: "Maria Garcia",
    img: "https://placehold.co/600x400/059669/FFFFFF?text=Amazon",
    slug: "amazon-gems",
  },
  {
    id: "related4",
    title: "Mastering the art of digital photography at night",
    category: "Photography",
    authorName: "Emily White",
    img: "https://placehold.co/600x400/94A3B8/FFFFFF?text=Photography",
    slug: "digital-photo",
  },
];

interface PopularBlogsSectionProps {
  blogs: IBlog[];
  themeSettings: Record<string, any> | null;
}

const PopularBlogsSection = ({ blogs: dynamicNews, themeSettings }: PopularBlogsSectionProps) => {
  
  // 1. THEME EXTRACTION
  const primaryColor = themeSettings?.primaryColor || "#8b5cf6"; // Default Violet
  const secondaryColor = themeSettings?.secondaryColor || "#ec4899"; // Default Pink

  // 2. DATA PREPARATION
  const newsItems =
    Array.isArray(dynamicNews) && dynamicNews.length > 0
      ? dynamicNews.slice(0, 4).map((post) => ({
          title: post.title,
          img: post.coverImage || "https://placehold.co/600x400/333333/666666?text=No+Image",
          link: post.slug ? `/blogs/${post.slug}` : "#",
          authorName: post.authorName || "Guest Author",
          category: (post.categories && post.categories[0]) || "General",
          id: post.id || Math.random().toString(36).substring(7),
        }))
      : relatedBlogs.map(blog => ({
          ...blog,
          link: blog.slug ? `/blogs/${blog.slug}` : "#"
      }));

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/1f2937/4b5563?text=Image+Fallback";
  };

  // 3. ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative py-24 bg-slate-950 font-sans overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-400 to-fuchsia-400">Reads</span>
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-teal-300 to-indigo-500 mb-6" />
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Hand-picked articles that are trending among our readers this week.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {newsItems.map((blog) => (
            <motion.article
              key={blog.id}
              variants={cardVariants}
              className="group relative flex flex-col h-full"
            >
              <a href={blog.link} className="flex flex-col h-full">
                
                {/* Image Container with Hover Zoom */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl mb-5 shadow-lg ring-1 ring-white/10">
                  {/* Floating Category Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span 
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full"
                      style={{ boxShadow: `0 4px 20px -5px ${primaryColor}40` }} // Glow based on theme
                    >
                      {blog.category}
                    </span>
                  </div>

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Main Image */}
                  <img
                    src={blog.img}
                    alt={blog.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={handleImageError}
                  />
                </div>

                {/* Content Body */}
                <div className="flex flex-col flex-grow px-2">
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-100 leading-snug mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-300 transition-all duration-300">
                    {blog.title}
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">
                        {blog.authorName.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{blog.authorName}</span>
                    </div>

                    {/* Animated Arrow */}
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 group-hover:bg-indigo-600 transition-colors duration-300"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} // Fallback if no theme
                    >
                      <svg 
                        className="w-4 h-4 text-slate-400 group-hover:text-white transform -rotate-45 group-hover:rotate-0 transition-all duration-300" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="/blogs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            View All Articles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default PopularBlogsSection;