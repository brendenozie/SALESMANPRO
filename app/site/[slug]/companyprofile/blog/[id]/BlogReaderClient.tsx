"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  CalendarIcon, 
  EyeIcon, 
  HandThumbUpIcon, 
  ChevronLeftIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface BlogReaderClientProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string | null;
    coverImage: string | null;
    categories: string[];
    publishedAt: string | null;
    createdAt: string;
    views: number;
    likes: number;
    author: { name: string; profileImage?: string } | null;
  };
}

export default function BlogReaderClient({ blog }: BlogReaderClientProps) {
  // Reading tracking pipeline
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 pb-32 font-sans relative selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ===== AMBIENT LIGHTING ===== */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

      {/* ===== READING PROGRESS MATRIX ACCENT ===== */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-50 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
        style={{ scaleX }} 
      />

      {/* ===== CONTEXT NAVIGATION ROW ===== */}
      <nav className="w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
          <Link 
            href="/blog/products" 
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors uppercase tracking-widest group"
          >
            <ChevronLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Index
          </Link>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block truncate max-w-sm">
            Briefing: {blog.title}
          </div>
        </div>
      </nav>

      {/* ===== HERO METADATA ZONE ===== */}
      <header className="max-w-3xl mx-auto px-4 pt-20 sm:pt-28 pb-12 relative z-10">
        <div className="flex items-center flex-wrap gap-2 mb-8">
          {blog.categories?.length > 0 ? (
            blog.categories.map((category) => (
              <span 
                key={category} 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase"
              >
                <TagIcon className="w-3 h-3" />
                {category}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              <TagIcon className="w-3 h-3" /> General
            </span>
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-100 mb-6 leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-lg sm:text-xl text-zinc-400 font-light leading-relaxed mb-10 border-l-2 border-amber-500/50 pl-5">
            {blog.excerpt}
          </p>
        )}

        {/* AUTHOR & INTEGRATION DATA FIELDS */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-zinc-800/50 text-xs font-mono text-zinc-400 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            {blog.author?.profileImage ? (
              <img 
                src={blog.author.profileImage} 
                alt={blog.author.name} 
                className="w-10 h-10 rounded-full border-2 border-zinc-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-500">
                {blog.author?.name?.charAt(0) || "S"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-zinc-200 font-bold">{blog.author?.name || "System Core"}</span>
              <span className="text-[9px] text-amber-500/80 mt-0.5">Verified Contributor</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-zinc-500" />
              {blog.views} Reads
            </span>
          </div>
        </div>
      </header>

      {/* ===== FEATURED GRAPHIC STAGE ===== */}
      {blog.coverImage && (
        <div className="max-w-5xl mx-auto px-4 mb-20 relative z-10">
          <div className="w-full aspect-[21/10] bg-zinc-900 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl relative group">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ===== DETAILED RICH CONTENT INGESTION PANEL ===== */}
      <main className="max-w-3xl mx-auto px-4 relative z-10">
        <article 
          className="prose prose-invert prose-zinc max-w-none text-zinc-300 font-light
            prose-headings:text-zinc-100 prose-headings:tracking-tight prose-headings:font-bold
            prose-h2:text-2xl prose-h2:border-b prose-h2:border-zinc-800/50 prose-h2:pb-3 prose-h2:mt-16
            prose-h3:text-xl
            prose-p:text-base prose-p:leading-loose prose-p:mb-8
            prose-a:text-amber-400 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-amber-300 prose-a:transition-colors
            prose-code:text-amber-200 prose-code:bg-amber-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
            prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:p-6 prose-pre:backdrop-blur-sm
            prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-zinc-900/40 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:text-zinc-400 prose-blockquote:italic
            prose-ul:list-disc prose-ol:list-decimal prose-li:text-base prose-li:leading-relaxed prose-li:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: blog.content || `<p className="text-xs font-mono text-zinc-600 uppercase tracking-widest text-center py-12">No layout records compiled for this content field token.</p>` }}
        />

        {/* ===== END OF FOOTNOTES SIGNOFF ===== */}
        <div className="mt-24 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse" />
            End of Dispatch // Transmission Terminated
          </div>
          <button 
            disabled
            className="h-10 px-6 border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-400 rounded-lg flex items-center gap-2 select-none shadow-[0_4px_14px_0_rgba(0,0,0,0.39)]"
          >
            <HandThumbUpIcon className="h-4 w-4 text-amber-500" /> {blog.likes} Endorsements
          </button>
        </div>
      </main>
    </div>
  );
}