"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  EyeIcon, 
  HandThumbUpIcon, 
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
  category: string | null;
  subCategory: string | null;
  tags: string[];
  author: { name: string; profileImage?: string } | null;
  publishedAt: string | null;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
};

interface BlogsClientProps {
  companyId: string;
  blogs: BlogItem[];
  categoriesData?: any[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export default function BlogsClient({
  companyId,
  blogs,
  totalItems,
  totalPages,
  currentPage,
}: BlogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>("All");

  // Pagination Handler
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Extract unique categories from current page's blogs
  const extractedCategories = Array.from(
    new Set(
      blogs.flatMap((b) => {
        const cats = [];
        if (b.categories && b.categories.length > 0) cats.push(...b.categories);
        if (b.category) cats.push(b.category);
        return cats;
      })
    )
  ).filter(Boolean);
  
  const allCategories = ["All", ...extractedCategories];

  // Client-side filtering for the current page
  const filteredBlogs = filter === "All"
    ? blogs
    : blogs.filter((blog) => 
        blog.category === filter || 
        (blog.categories && blog.categories.includes(filter))
      );

  // Extract the top featured article if present on page 1 to create an immediate focal point
  const featuredBlog = currentPage === 1 && filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  const gridBlogs = featuredBlog ? filteredBlogs.slice(1) : filteredBlogs;

  // Formatting Helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "UNKNOWN DATE";
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden py-24 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
              Published Perspectives & Engineering Logs
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 uppercase">
              Articles <br />
              <span className="text-zinc-500 font-light italic capitalize">& Strategic Dispatches</span>
            </h1>
          </div>

          {/* Category Filter Pills */}
          {allCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                    filter === cat
                      ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Master Feed Content */}
        {blogs.length === 0 ? (
          <div className="py-24 text-center border border-zinc-900 bg-zinc-900/30 rounded-3xl backdrop-blur-sm">
            <p className="text-xs font-mono text-zinc-500 tracking-wide uppercase">
              No publications compiled under this cluster index yet.
            </p>
          </div>
        ) : filteredBlogs.length === 0 ? (
           <div className="py-24 text-center border border-zinc-900 bg-zinc-900/30 rounded-3xl backdrop-blur-sm">
            <p className="text-xs font-mono text-zinc-500 tracking-wide uppercase">
              No articles found for the selected category.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article Span (Only on Page 1) */}
            {featuredBlog && (
              <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden mb-12 backdrop-blur-sm transition-colors hover:border-zinc-700"
              >
                <Link href={`/blog/${featuredBlog.slug}`} className="relative h-72 lg:h-full w-full overflow-hidden block">
                  {featuredBlog.coverImage ? (
                    <img 
                      src={featuredBlog.coverImage} 
                      alt={featuredBlog.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent opacity-80 pointer-events-none" />
                </Link>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center flex-wrap gap-4 text-xs font-mono tracking-widest uppercase text-amber-500 mb-6">
                    <span className="flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5" /> 
                      {featuredBlog.categories?.[0] || featuredBlog.category || 'General'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-3 text-zinc-400">
                      <span className="flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" /> {featuredBlog.views}</span>
                      <span className="flex items-center gap-1"><HandThumbUpIcon className="h-3.5 w-3.5" /> {featuredBlog.likes}</span>
                    </span>
                  </div>
                  
                  <Link href={`/blog/${featuredBlog.slug}`} className="block">
                    <h2 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-4 leading-tight group-hover:text-amber-400 transition-colors">
                      {featuredBlog.title}
                    </h2>
                  </Link>
                  
                  <p className="text-zinc-400 font-light leading-relaxed mb-8 text-base line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-800/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-300">
                        {featuredBlog.author?.name || 'Editorial Team'}
                      </span>
                      <span className="text-xs text-zinc-500 font-light uppercase">
                        {formatDate(featuredBlog.publishedAt || featuredBlog.createdAt)}
                      </span>
                    </div>
                    <Link 
                      href={`/blog/${featuredBlog.slug}`}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors"
                    >
                      <ArrowUpRightIcon className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Standard Grid Layout */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridBlogs.map((blog, index) => (
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={blog.id}
                    className="group flex flex-col bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/60 transition-all duration-300"
                  >
                    <Link href={`/blog/${blog.slug}`} className="relative h-48 overflow-hidden block">
                      {blog.coverImage ? (
                         <img 
                          src={blog.coverImage} 
                          alt={blog.title}
                          className="w-full h-full object-cover grayscale opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center" />
                      )}
                      <div className="absolute top-4 left-4 backdrop-blur-md bg-zinc-950/80 border border-zinc-700/50 px-3 py-1 rounded-lg pointer-events-none">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                          {blog.categories?.[0] || blog.category || 'General'}
                        </span>
                      </div>
                    </Link>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <Link href={`/blog/${blog.slug}`} className="block mb-3">
                        <h3 className="text-xl font-bold text-zinc-100 leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6 line-clamp-3">
                        {blog.excerpt}
                      </p>
                      
                      <div className="mt-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                          <div className="flex items-center gap-3 text-xs text-zinc-500 uppercase font-mono">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
                          </div>
                          <Link href={`/blog/${blog.slug}`} className="flex items-center gap-1 text-xs text-amber-500/70 font-medium group-hover:text-amber-400 transition-colors uppercase tracking-wider">
                            Read <ArrowUpRightIcon className="w-3 h-3" />
                          </Link>
                        </div>
                        
                        {/* Functionality: Retained views & likes from original */}
                        <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-mono">
                          <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" /> {blog.views}</span>
                          <span className="flex items-center gap-1"><HandThumbUpIcon className="w-3 h-3" /> {blog.likes}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}

        {/* Structural Pagination Control Bar */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-between items-center bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm rounded-xl p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-lg border border-zinc-700 bg-zinc-900/50 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-all"
            >
              <ChevronLeftIcon className="h-4 w-4" /> Prev
            </button>
            
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                const isActive = currentPage === pageNumber;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={isActive}
                    className={`w-9 h-9 rounded-lg text-xs font-mono transition-all border ${
                      isActive
                        ? "bg-amber-500 text-zinc-950 border-transparent font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden text-xs font-mono text-amber-500/80 tracking-widest">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 px-4 rounded-lg border border-zinc-700 bg-zinc-900/50 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-all"
            >
              Next <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}