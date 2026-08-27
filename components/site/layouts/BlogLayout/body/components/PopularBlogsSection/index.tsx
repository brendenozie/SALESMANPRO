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
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
    slug: "sustainable-home",
  },
  {
    id: "related2",
    title: "The future of artificial intelligence in creative design",
    category: "Technology",
    authorName: "David Chen",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    slug: "ai-design",
  },
  {
    id: "related3",
    title: "Exploring the hidden gems of the Amazon rainforest",
    category: "Travel",
    authorName: "Maria Garcia",
    img: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=600&auto=format&fit=crop",
    slug: "amazon-gems",
  },
  {
    id: "related4",
    title: "Mastering the art of digital photography at night",
    category: "Photography",
    authorName: "Emily White",
    img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    slug: "digital-photo",
  },
];

interface PopularBlogsSectionProps {
  blogs: IBlog[];
  themeSettings: Record<string, any> | null;
}

const PopularBlogsSection = ({ blogs: dynamicNews, themeSettings }: PopularBlogsSectionProps) => {
  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const newsItems = React.useMemo(() => {
    return Array.isArray(dynamicNews) && dynamicNews.length > 0
      ? dynamicNews.slice(0, 4).map((post) => ({
          title: post.title,
          img: post.coverImage || "https://placehold.co/600x400/1e293b/ffffff?text=Image+Unavailable",
          link: post.slug ? `/blogs/${post.slug}` : "#",
          authorName: post.authorName || "System Contributor",
          category: (post.categories && post.categories[0]) || "General",
          id: post.id || Math.random().toString(36).substring(7),
        }))
      : relatedBlogs.map(blog => ({
          ...blog,
          link: blog.slug ? `/blogs/${blog.slug}` : "#"
        }));
  }, [dynamicNews]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/1e293b/ffffff?text=Image+Unavailable";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== SECTION HEADER BLOCK ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-900">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
              Popular Reads
            </h2>
            <p className="text-sm text-slate-400 font-normal">
              Review our most high-traffic editorial publications and technical analysis boards from the past week.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a
              href="/blogs"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              View All Publications
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ===== INDUSTRIAL CARD GRID MATRIX ===== */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-900 border border-slate-900 rounded-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {newsItems.map((blog) => {
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <motion.article
                key={blog.id}
                variants={cardVariants}
                className="bg-slate-950 flex flex-col h-full relative transition-colors duration-200 group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  borderBottom: isHovered ? `2px solid ${primaryColor}` : '2px solid transparent',
                  marginBottom: '-2px'
                }}
                
              >
                <a href={blog.slug ? `/blog/listings/${blog.slug}` : "#"} className="flex flex-col h-full p-6">
                  
                  {/* Aspect Box Image Frame */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded border border-slate-800 mb-5">
                    <img
                      src={blog.img}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Document Body Wrapper */}
                  <div className="flex flex-col flex-grow justify-between">
                    <div>
                      {/* Monospace Metadata Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                          {blog.category}
                        </span>
                      </div>

                      {/* Content Structural Header */}
                      <h3 className="text-sm font-semibold text-slate-200 tracking-wide leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {blog.title}
                      </h3>
                    </div>

                    {/* Footer Identity Block */}
                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-400 font-mono">
                          {blog.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[110px]">
                          {blog.authorName}
                        </span>
                      </div>

                      {/* Directional Navigation Indicator */}
                      <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        <svg 
                          className="w-3 h-3 transform transition-transform duration-200 group-hover:translate-x-0.5" 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
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

export default PopularBlogsSection;