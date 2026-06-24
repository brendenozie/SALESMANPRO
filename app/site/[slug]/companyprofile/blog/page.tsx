"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';

// --- Types ---
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  slug: string;
  featured?: boolean;
}

// --- Institutional Mock Data ---
const insightsData: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Navigating Volatility: Structural Risk Mitigation in Q3 Gold Markets',
    excerpt: 'An executive analysis on how institutional buyers are leveraging forward contracts and secured escrow nodes to insulate physical bullion acquisitions from unprecedented macroeconomic headwinds.',
    category: 'Market Analysis',
    author: 'Aurum Intelligence Desk',
    date: 'August 14, 2026',
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
    slug: 'q3-gold-market-volatility',
    featured: true,
  },
  {
    id: 'post-2',
    title: 'The Future of Copper Cathodes in Global Grid Electrification',
    excerpt: 'As international clean energy rollouts accelerate, we examine the supply-side constraints and delivery vectors required to sustain industrial-grade wiring systems.',
    category: 'Industrial Metals',
    author: 'Infrastructure Strategy Team',
    date: 'August 02, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
    slug: 'copper-cathodes-grid-electrification',
  },
  {
    id: 'post-3',
    title: 'Optimizing Transcontinental Freight: Jet Air vs. Bulk Sea Corridors',
    excerpt: 'A detailed breakdown of payload valuation, critical timelines, and intrinsic security profiles when routing high-value physical assets across global logistics channels.',
    category: 'Logistics',
    author: 'Global Freight Division',
    date: 'July 28, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop',
    slug: 'air-vs-sea-freight-optimization',
  },
  {
    id: 'post-4',
    title: 'LBMA Compliance and the New Standard for Supply Chain Transparency',
    excerpt: 'How rigorous assaying and ironclad physical auditing frameworks are protecting delivery vectors and ensuring tier-1 purity standards from extraction to fulfillment.',
    category: 'Compliance',
    author: 'Aurum Audit Group',
    date: 'July 15, 2026',
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
    slug: 'lbma-compliance-transparency',
  },
  {
    id: 'post-5',
    title: 'Emerging Extraction Hubs: East Africa\'s Growing Role in Precious Metals',
    excerpt: 'Leveraging our strategic base in Kenya, we explore the verified regional extraction hubs driving the next wave of global bullion liquidity and secure procurement.',
    category: 'Regional Focus',
    author: 'Aurum Intelligence Desk',
    date: 'June 30, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
    slug: 'east-africa-extraction-hubs',
  }
];

export default function BlogHub() {
  const [filter, setFilter] = useState<string>('All');
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(insightsData.map(post => post.category)))];
  
  const filteredPosts = filter === 'All' 
    ? insightsData 
    : insightsData.filter(post => post.category === filter);

  const featuredPost = filteredPosts.find(post => post.featured) || filteredPosts[0];
  const gridPosts = filteredPosts.filter(post => post.id !== featuredPost.id);

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
              Executive Briefings
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
              Market Intelligence <br />
              <span className="text-zinc-500 font-light italic">& Strategic Dispatches</span>
            </h1>
            <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
              Proprietary insights from the Aurum intelligence desk, covering macroeconomic volatility, transcontinental logistics, and high-value asset compliance.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
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
        </div>

        {/* Featured Article Span */}
        {featuredPost && (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden mb-12 backdrop-blur-sm transition-colors hover:border-zinc-700"
          >
            <div className="relative h-72 lg:h-full w-full overflow-hidden">
              <img 
                src={featuredPost.imageUrl} 
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
            </div>
            
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-amber-500 mb-6">
                <span className="flex items-center gap-1.5"><TagIcon className="w-3.5 h-3.5" /> {featuredPost.category}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-zinc-400">{featuredPost.readTime}</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-4 leading-tight group-hover:text-amber-400 transition-colors">
                {featuredPost.title}
              </h2>
              
              <p className="text-zinc-400 font-light leading-relaxed mb-8 text-base">
                {featuredPost.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-800/50">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-300">{featuredPost.author}</span>
                  <span className="text-xs text-zinc-500 font-light">{featuredPost.date}</span>
                </div>
                <a 
                  // href={`/blog/${featuredPost.slug}`}
                  href="#"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors"
                >
                  <ArrowUpRightIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.article>
        )}

        {/* Standard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridPosts.map((post, index) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={post.id}
              className="group flex flex-col bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/60 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 backdrop-blur-md bg-zinc-950/60 border border-zinc-700/50 px-3 py-1 rounded-lg">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-zinc-100 mb-3 leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                  <a href={`/blog/${post.slug}`} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {post.title}
                  </a>
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-amber-500/70 font-medium group-hover:text-amber-400 transition-colors">
                    Read Report <ArrowUpRightIcon className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}