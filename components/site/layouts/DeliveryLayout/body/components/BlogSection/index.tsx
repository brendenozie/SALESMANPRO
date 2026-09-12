"use client";
import React from "react";

import { motion } from "framer-motion";
import { 
  CalendarIcon, 
  UserIcon, 
  ArrowRightIcon, 
  BookOpenIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/solid";
import Image from "next/image";

const POSTS = [
  {
    id: 1,
    title: "Optimizing Route Freight for Cold Chain Logistics",
    excerpt: "How new temperature-controlled rail systems are changing the game for pharmaceutical transport across Europe.",
    date: "Feb 12, 2026",
    author: "Admin",
    category: "Solutions",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: 2,
    title: "The Rise of Autonomous Logistics Operations",
    date: "Feb 10, 2026",
    author: "Strategy Team",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&q=80&w=400",
    featured: false
  },
  {
    id: 3,
    title: "Navigating Global Trade Shifts in 2026",
    date: "Feb 08, 2026",
    author: "Market Analyst",
    category: "Market",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400",
    featured: false
  }
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export function BlogSection() {
  const featuredPost = POSTS.find(p => p.featured);
  const regularPosts = POSTS.filter(p => !p.featured);

  return (
    <section id="news" className="py-24 lg:py-40 bg-white relative overflow-hidden font-sans">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-orange-600"
            >
              <BookOpenIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Knowledge Base</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 leading-none uppercase italic tracking-tighter">
              Industry <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Intelligence</span>
            </h2>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="group flex items-center gap-4 px-10 py-5 bg-slate-950 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl"
          >
            Explore Journal <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* --- FEATURED COLUMN --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-100 mb-10 shadow-2xl">
              <Image 
                src={featuredPost?.image || ""} 
                alt={featuredPost?.title || ""}
                width={1200}
                height={800}
                loader={loader}
                className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute top-8 left-8">
                <span className="px-6 py-3 bg-white/90 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl">
                  {featuredPost?.category}
                </span>
              </div>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" /> {featuredPost?.date}
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-500" /> {featuredPost?.author}
                </div>
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-950 leading-[1.1] tracking-tight group-hover:text-orange-600 transition-colors">
                {featuredPost?.title}
              </h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                {featuredPost?.excerpt}
              </p>
              <button className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] text-slate-950 border-b-2 border-orange-500 pb-2 hover:gap-6 transition-all">
                Full Story <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* --- SIDEBAR LIST --- */}
          <div className="lg:col-span-5 space-y-12 lg:pt-4">
            {regularPosts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="group flex gap-8 items-center cursor-pointer"
              >
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden shrink-0 shadow-lg group-hover:shadow-orange-500/20 transition-all duration-500">
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    width={200}
                    height={200}
                    loader={loader}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{post.category}</span>
                  <h4 className="text-xl font-black text-slate-950 leading-tight group-hover:text-orange-600 transition-colors tracking-tight">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{post.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Newsletter Pod - "The Logistics Digest" */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative p-10 rounded-[3rem] bg-slate-950 text-white overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center rotate-12 shadow-lg shadow-orange-600/20">
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-black italic uppercase leading-none tracking-tighter">
                    The Logistics <br /><span className="text-orange-500">Digest</span>
                  </h4>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Join 15,000+ logistics pros receiving our weekly trade analysis.
                </p>
                <div className="relative flex items-center">
                  <input 
                    type="email" 
                    placeholder="E-mail address" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-600"
                  />
                  <button className="absolute right-2 p-4 bg-orange-600 rounded-xl hover:bg-white hover:text-orange-600 transition-all group">
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              {/* Decorative radial blur */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-500/10 blur-2xl" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}