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
  ArrowLongRightIcon
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
  categoriesData: any[];
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

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  // Extract the top featured article if present on page 1 to create an immediate focal point
  const featuredBlog = currentPage === 1 && blogs.length > 0 ? blogs[0] : null;
  const gridBlogs = featuredBlog ? blogs.slice(1) : blogs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ===== VISITOR VIEWPORT HEADER ===== */}
        <div className="flex flex-col items-start pb-12 mb-12 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              Published Perspectives & Engineering Logs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase">
            Articles
          </h1>
        </div>

        {/* ===== MASTER FEED CONTENT MATRIX ===== */}
        {blogs.length === 0 ? (
          <div className="py-24 text-center border border-slate-900 bg-slate-950 rounded">
            <p className="text-xs font-mono text-slate-600 tracking-wide uppercase">
              No publications compiled under this cluster index yet.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* --- HERO LEADING HIGHLIGHT (Only on Page 1) --- */}
            {featuredBlog && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-16 border-b border-slate-900"
              >
                <Link 
                  href={`/blog/${featuredBlog.slug}`}
                  className="lg:col-span-7 aspect-[16/10] bg-slate-900 border border-slate-900 rounded overflow-hidden block relative"
                >
                  {featuredBlog.coverImage ? (
                    <img
                      src={featuredBlog.coverImage}
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800" />
                  )}
                </Link>

                <div className="lg:col-span-5 flex flex-col items-start">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 block">
                    {featuredBlog.categories?.[0] || 'Uncategorized'}
                  </div>
                  <Link href={`/blog/${featuredBlog.slug}`} className="block group-hover:text-slate-200">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase mb-4 leading-snug transition-colors">
                      {featuredBlog.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                  
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-900/60">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {new Date(featuredBlog.publishedAt || featuredBlog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </span>
                    <Link 
                      href={`/blog/${featuredBlog.slug}`}
                      className="text-white flex items-center gap-1.5 font-bold tracking-wider uppercase group-hover:gap-2.5 transition-all"
                    >
                      Read Article <ArrowLongRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- GRID GRID REPOSITORIES --- */}
            {gridBlogs.length > 0 && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                {gridBlogs.map((blog) => (
                  <motion.article
                    key={blog.id}
                    variants={itemVariants}
                    className="group flex flex-col items-start"
                  >
                    <Link 
                      href={`/blog/${blog.slug}`}
                      className="w-full aspect-[16/10] bg-slate-900 border border-slate-900 rounded overflow-hidden mb-4 block relative"
                    >
                      {blog.coverImage ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800" />
                      )}
                    </Link>

                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-2">
                      {blog.categories?.[0] || 'General'}
                    </div>

                    <Link href={`/blog/${blog.slug}`} className="block">
                      <h3 className="text-sm font-bold tracking-wide text-slate-200 group-hover:text-white transition-colors uppercase line-clamp-2 mb-2 leading-snug">
                        {blog.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>

                    <div className="w-full flex items-center justify-between mt-auto pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-600">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><EyeIcon className="h-3 w-3" /> {blog.views}</span>
                        <span className="flex items-center gap-0.5"><HandThumbUpIcon className="h-3 w-3" /> {blog.likes}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}

          </div>
        )}

        {/* ===== STRUCTURAL PAGINATION CONTROL BAR ===== */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-between items-center bg-slate-950 border border-slate-900 rounded p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded border border-slate-800 bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1 transition-colors"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" /> Back
            </button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                const isActive = currentPage === pageNumber;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={isActive}
                    className={`w-8 h-8 rounded text-xs font-mono transition-all border ${
                      isActive
                        ? "bg-slate-100 text-slate-950 border-transparent font-bold"
                        : "bg-slate-950 text-slate-500 border-slate-900 hover:border-slate-800 hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden text-xs font-mono text-slate-600">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-3 rounded border border-slate-800 bg-slate-950 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1 transition-colors"
            >
              Next <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}