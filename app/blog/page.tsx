"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  ArrowUpRightIcon, 
  BookOpenIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const BLOG_POSTS = [
  {
    id: 1,
    category: "Engineering",
    title: "How we scaled our multi-tenant architecture to 10k stores",
    excerpt: "A deep dive into the database sharding and routing logic behind SalesmanPro subdomains.",
    author: "Alex Rivera",
    date: "March 12, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: 2,
    category: "Product",
    title: "Introducing: Real-time Analytics Dashboard v3",
    excerpt: "Track every click, sale, and customer interaction with our new low-latency engine.",
    author: "Sarah Chen",
    date: "March 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    id: 3,
    category: "Guides",
    title: "Setting up custom domains for your storefront",
    excerpt: "Everything you need to know about CNAME records and SSL certificates for your brand.",
    author: "James Mwangi",
    date: "March 05, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Engineering", "Product", "Guides", "Business"];

  const featuredPost = BLOG_POSTS.find(p => p.featured);
  const regularPosts = BLOG_POSTS.filter(p => !p.featured);

  return (
    <MainLayout>
          <div className="flex flex-col overflow-x-hidden"> 
            <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pt-32 pb-20 px-6">
              <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <header className="mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                  >
                    <div>
                      <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
                        The <span className="text-orange-600 underline decoration-orange-200 underline-offset-8">Dispatch</span>
                      </h1>
                      <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl">
                        Insights, updates, and stories from the team building the future of commerce.
                      </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={classNames(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all",
                            activeCategory === cat 
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </header>

                {/* Featured Post - Big Bento Style */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl mb-12 cursor-pointer transition-all hover:shadow-2xl"
                  >
                    <div className="grid lg:grid-cols-2">
                      <div className="h-64 lg:h-full relative overflow-hidden">
                        <img 
                          src={featuredPost.image} 
                          alt={featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <span className="text-orange-600 font-black uppercase tracking-widest text-sm mb-4">Featured Article</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{featuredPost.author}</p>
                              <p className="text-xs text-slate-500">{featuredPost.date} • {featuredPost.readTime}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <ArrowUpRightIcon className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {regularPosts.map((post, idx) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 flex flex-col transition-all hover:border-orange-500"
                    >
                      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden mb-6">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                          {post.category}
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex-1 flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 hover:text-orange-600 cursor-pointer transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400">{post.date}</span>
                          <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white group cursor-pointer">
                            Read More
                            <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Newsletter Signup Bento */}
                <motion.section 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="mt-20 bg-indigo-600 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <BookOpenIcon className="w-12 h-12 mx-auto mb-6 opacity-50" />
                    <h2 className="text-3xl md:text-5xl font-black mb-4">Stay in the loop.</h2>
                    <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
                      Get the latest updates on e-commerce trends and new features delivered straight to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                      <input 
                        type="email" 
                        placeholder="you@example.com"
                        className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 outline-none focus:ring-2 ring-white transition-all"
                      />
                      <button className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl">
                        Subscribe
                      </button>
                    </div>
                  </div>
                  {/* Decorative background shape */}
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full blur-[80px]" />
                </motion.section>

              </div>
            </div>
          </div>
    </MainLayout>
  );
};

// Helper for class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default BlogPage;