"use client";

import React from "react";
import { ArchiveBoxArrowDownIcon, ArrowUpRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";

const PROJECTS = [
  {
    title: "Logistics Division",
    category: "Global Logistics",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gridClass: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Transport Hub",
    category: "Infrastructure",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "Waste Management",
    category: "Waste Management",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    gridClass: "lg:col-span-3 lg:row-span-1",
  }
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export function WorkShowcase() {
  return (
    <section id="solutions" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Abstract Background Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-orange-500"
            >
              <ArchiveBoxArrowDownIcon className="fill-current w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-[0.4em]">Portfolio</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none uppercase italic">
              Recent <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '1px white' }}>Showcase</span>
            </h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-xs text-right hidden md:block"
          >
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Precision-engineered logistics solutions for the world&apos;s most demanding industries.
            </p>
          </motion.div>
        </div>

        {/* --- MASONRY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className={`group relative overflow-hidden rounded-3xl cursor-none ${project.gridClass}`}
            >
              {/* Image with Parallax-like scale */}
              <Image decoding="async" 
                src={project.image} 
                alt={project.title}
                fill
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" 
              />
              
              {/* Intelligent Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Content Detail */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="overflow-hidden">
                  <motion.span 
                    className="block text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2 translate-y-8 group-hover:translate-y-0 transition-transform duration-500"
                  >
                    {project.category}
                  </motion.span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="overflow-hidden">
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-none uppercase italic group-hover:text-orange-500 transition-colors duration-300">
                      {project.title}
                    </h3>
                  </div>
                  
                  {/* Floating Action Button */}
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                    <ArrowUpRightIcon className="text-black w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Hover Border Border */}
              <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/50 rounded-3xl transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* --- FOOTER CTA --- */}
        <div className="mt-16 flex justify-center">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] rounded-full hover:bg-orange-500 hover:text-white transition-all flex items-center gap-4"
           >
             View All Projects <PlusIcon className="w-4 h-4" />
           </motion.button>
        </div>
      </div>
    </section>
  );
}