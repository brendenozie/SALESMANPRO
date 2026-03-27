"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  PlayIcon, 
  XMarkIcon, 
  HeartIcon, 
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  ArrowLongRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS --- */
const STORIES = [
  {
    id: 1,
    name: "Amani",
    location: "Kibera, Nairobi",
    impact: "Clean Water Access",
    quote: "The walk for water used to take 3 hours. Now, it takes 3 minutes.",
    thumb: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
    color: "bg-emerald-600"
  },
  {
    id: 2,
    name: "Dr. Omondi",
    location: "Mathare Valley",
    impact: "Mobile Clinic Lead",
    quote: "We aren't just treating patients; we are building a resilient health network.",
    thumb: "https://images.unsplash.com/photo-1576091160550-2173bdd99625?auto=format&fit=crop&w=800&q=80",
    color: "bg-blue-600"
  },
  {
    id: 3,
    name: "Sarah",
    location: "Nairobi CBD",
    impact: "Entrepreneurship Grant",
    quote: "My tailoring business now supports 4 other families in my community.",
    thumb: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
    color: "bg-orange-600"
  }
];

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


export default function CommunityStoriesGallery() {
  const [selectedVideo, setSelectedVideo] = useState<null | typeof STORIES[0]>(null);

  return (
    <section className="bg-stone-950 py-32 overflow-hidden selection:bg-orange-500">
      <div className="container mx-auto px-6">
        
        {/* Header: Cinematic Presence */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">The Human Archive</span>
            </motion.div>
            
            <h2 className="text-7xl md:text-9xl font-bold text-white leading-[0.8] tracking-tighter uppercase italic">
              Voices of <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #f97316' }}>Change.</span>
            </h2>
          </div>
          
          <p className="text-stone-400 max-w-sm text-sm font-medium italic leading-relaxed">
            Real people. Real progress. Watch the stories of those leading the transformation across the city.
          </p>
        </div>

        {/* The Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORIES.map((story, idx) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedVideo(story)}
            >
              {/* Card Base */}
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5">
                <Image 
                  src={story.thumb} 
                  alt={story.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                  loader={loader}
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className={`w-12 h-1 text-white mb-6 transition-all duration-500 group-hover:w-full ${story.color}`} />
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">
                    {story.location}
                  </p>
                  <h3 className="text-4xl font-bold text-white mb-4 italic tracking-tight">
                    {story.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-widest">
                     <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                     <span>Watch Story</span>
                  </div>
                </div>

                {/* Play Button Center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                      <PlayIcon className="w-10 h-10 text-white" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fullscreen Video Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-stone-950 flex items-center justify-center p-6 md:p-20"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform"
              >
                <XMarkIcon className="w-10 h-10" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 max-w-7xl w-full items-center">
                {/* Video Placeholder */}
                <div className="lg:col-span-8 aspect-video bg-stone-900 rounded-[3rem] relative overflow-hidden flex items-center justify-center border border-white/5 shadow-2xl">
                   <div className="text-center">
                      <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                         <PlayIcon className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-stone-500 font-mono text-xs uppercase tracking-widest italic">Streaming High-Fidelity Cinema...</p>
                   </div>
                </div>

                {/* Story Context */}
                <div className="lg:col-span-4 text-white">
                  <div className={`inline-block px-4 py-2 rounded-xl mb-8 ${selectedVideo.color}`}>
                     <span className="text-[10px] font-black uppercase tracking-widest">{selectedVideo.impact}</span>
                  </div>
                  
                  <h4 className="text-6xl font-bold tracking-tighter italic mb-8">"{selectedVideo.name}'s Journey"</h4>
                  
                  <p className="text-xl font-serif italic text-stone-400 leading-relaxed mb-12">
                    {selectedVideo.quote}
                  </p>

                  <div className="space-y-6 pt-12 border-t border-white/10">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center">
                          <HeartIcon className="w-6 h-6 text-orange-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-stone-500">Direct Outcome</p>
                          <p className="font-bold">Sustainable Livelihood</p>
                       </div>
                    </div>
                    
                    <button className="w-full py-6 bg-white text-stone-950 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-600 hover:text-white transition-all">
                       Support This Cause
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}