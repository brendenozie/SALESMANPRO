"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  CalendarIcon, 
  EyeIcon, 
  HandThumbUpIcon, 
  ChevronLeftIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface BlogReaderClientProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content?: string | null; // Content block markup string source
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
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-32 font-sans relative selection:bg-slate-800 selection:text-white">
      
      {/* ===== READING PROGRESS MATRIX ACCENT ===== */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-white origin-left z-50 opacity-80" 
        style={{ scaleX }} 
      />

      {/* ===== CONTEXT NAVIGATION ROW ===== */}
      <nav className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto h-14 flex items-center justify-between">
          <Link 
            href="/blog/products" 
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-200 transition-colors uppercase tracking-wider group"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Index
          </Link>
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest hidden sm:block truncate max-w-sm">
            Reading: {blog.title}
          </div>
        </div>
      </nav>

      {/* ===== HERO METADATA ZONE ===== */}
      <header className="max-w-3xl mx-auto px-4 pt-16 sm:pt-24 pb-12">
        <div className="flex items-center gap-1.5 mb-4">
          {blog.categories?.map((category) => (
            <span 
              key={category} 
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase"
            >
              {category}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase mb-6 leading-tight">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal mb-8 border-l-2 border-slate-800 pl-4">
            {blog.excerpt}
          </p>
        )}

        {/* AUTHOR & INTEGRATION DATA FIELDS */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-900 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2.5">
            {blog.author?.profileImage && (
              <img 
                src={blog.author.profileImage} 
                alt={blog.author.name} 
                className="w-6 h-6 rounded-full grayscale border border-slate-800"
              />
            )}
            <span className="text-slate-300 font-medium">By {blog.author?.name || "System Core"}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-slate-600" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4 text-slate-600" />
              {blog.views} RECORDED
            </span>
          </div>
        </div>
      </header>

      {/* ===== FEATURED GRAPHIC STAGE ===== */}
      {blog.coverImage && (
        <div className="max-w-4xl mx-auto px-4 mb-16">
          <div className="w-full aspect-[21/10] bg-slate-900 border border-slate-900 rounded overflow-hidden">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover grayscale opacity-80"
            />
          </div>
        </div>
      )}

      {/* ===== DETAILED RICH CONTENT INGESTION PANEL ===== */}
      <main className="max-w-3xl mx-auto px-4">
        <article 
          className="prose prose-invert prose-slate max-w-none text-slate-300
            prose-headings:text-white prose-headings:uppercase prose-headings:tracking-wide prose-headings:font-bold
            prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-900 prose-h2:pb-2 prose-h2:mt-12
            prose-h3:text-sm prose-h3:tracking-normal
            prose-p:text-sm prose-p:leading-relaxed prose-p:mb-6 prose-p:text-slate-300
            prose-a:text-white prose-a:underline hover:prose-a:text-slate-400 prose-a:transition-colors
            prose-code:text-slate-200 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded prose-pre:p-4
            prose-blockquote:border-l-white prose-blockquote:text-slate-400 prose-blockquote:italic
            prose-ul:list-disc prose-ol:list-decimal prose-li:text-sm prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: blog.content || `<p className="text-xs font-mono text-slate-600">No layout records compiled for this content field token.</p>` }}
        />

        {/* ===== END OF FOOTNOTES SIGNOFF ===== */}
        <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            LOG END SECTION // SHUTTING DOWN VIEWPORT LINK
          </div>
          <button 
            disabled
            className="h-8 px-4 border border-slate-900 bg-slate-950 text-[11px] font-mono text-slate-500 rounded flex items-center gap-1.5 select-none"
          >
            <HandThumbUpIcon className="h-3.5 w-3.5 text-slate-600" /> {blog.likes} Recommendations
          </button>
        </div>
      </main>
    </div>
  );
}