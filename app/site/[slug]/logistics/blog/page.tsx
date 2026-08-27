'use client';

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  CalendarIcon, 
  UserIcon, 
  ArrowRightIcon,
  TagIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Sample Blog Data - Replace with your dynamic data source
const SAMPLE_POSTS = [
  {
    id: 1,
    title: "The Future of Cold Chain Logistics in 2024",
    excerpt: "How IoT and real-time monitoring are revolutionizing the way we handle temperature-sensitive cargo across borders.",
    category: "Technology",
    author: "Admin",
    date: "Oct 12, 2023",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    featured: true
  },
  {
    id: 2,
    title: "Navigating Global Trade Uncertainties",
    excerpt: "Strategies for businesses to maintain supply chain resilience during fluctuating economic climates.",
    category: "Strategy",
    author: "Logistics Lead",
    date: "Sep 28, 2023",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Eco-Friendly Freight: Reducing Your Carbon Footprint",
    excerpt: "Moving beyond traditional methods to implement sustainable shipping solutions for the modern era.",
    category: "Sustainability",
    author: "Operations",
    date: "Sep 15, 2023",
    image: "https://images.unsplash.com/photo-1601309584854-29007f369f62?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Warehousing 4.0: Robotics and Automation",
    excerpt: "Exploring the shift toward automated sorting systems and the efficiency of smart warehouses.",
    category: "Innovation",
    author: "Tech Team",
    date: "Aug 30, 2023",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
  }
];

export default function BlogPage() {
  const { storeFormData } = useStoreContext();
  const { themeSettings, name = "Imevo" } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || "#f7941d";

  const featuredPost = SAMPLE_POSTS.find(p => p.featured);
  const regularPosts = SAMPLE_POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-slate-900 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-slate-50/80 skew-x-12 -translate-x-1/3 -z-10" />
        <div 
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[120px] -z-10 opacity-10" 
          style={{ backgroundColor: primaryColor }}
        />

        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-8"
              style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }}></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Insights & Industry News</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase italic mb-8">
              Beyond <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Headlines</span>
            </h1>
            
            <p className="text-slate-600 leading-relaxed text-xl font-medium italic border-l-4 pl-6 max-w-2xl" style={{ borderColor: primaryColor }}>
              Architecting the conversation around global trade, supply chain innovation, and the future of movement.
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURED POST --- */}
      {featuredPost && (
        <section className="pb-24">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden group border border-slate-100"
            >
              <div className="lg:col-span-7 relative h-[400px] lg:h-full overflow-hidden">
                <Image 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  loader={loader}
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-slate-950 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest">
                    Featured Article
                  </span>
                </div>
              </div>
              
              <div className="lg:col-span-5 p-10 lg:p-16 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span style={{ color: primaryColor }}>{featuredPost.category}</span>
                  <span>/</span>
                  <span>{featuredPost.date}</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-slate-950 leading-tight uppercase italic">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-500 leading-relaxed text-lg">
                  {featuredPost.excerpt}
                </p>
                <button className="inline-flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-widest group/btn">
                  Read Article 
                  <ArrowRightIcon className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" style={{ color: primaryColor }} />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* --- BLOG GRID --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          
          {/* Header & Filter Accents */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h3 className="text-3xl font-black text-slate-950 uppercase italic mb-2">Latest Insights</h3>
              <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['All', 'Technology', 'Strategy', 'Shipping', 'Global Trade'].map((cat) => (
                <button 
                  key={cat}
                  className="px-6 py-2 rounded-full border border-slate-200 text-xs font-bold uppercase tracking-widest hover:border-slate-900 transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {regularPosts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col"
              >
                {/* Image Masonry Accent */}
                <div className="relative mb-6">
                  <div 
                    className="absolute -inset-2 border-2 rounded-[2rem] -z-10 translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500" 
                    style={{ borderColor: `${primaryColor}33` }}
                  />
                  <div className="rounded-[1.5rem] overflow-hidden aspect-video shadow-lg relative bg-slate-100 border-4 border-white">
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill 
                      loader={loader}
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span style={{ color: primaryColor }}>{post.category}</span>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black text-slate-950 leading-snug uppercase italic group-hover:text-slate-800 transition-colors">
                    {post.title}
                  </h4>
                  
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-slate-900 uppercase">{post.author}</span>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" style={{ color: primaryColor }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination/Load More */}
          <div className="mt-24 text-center">
            <button className="h-16 px-12 bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full hover:shadow-2xl transition-all">
              Load More Stories
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}