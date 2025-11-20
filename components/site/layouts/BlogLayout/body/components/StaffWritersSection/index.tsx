"use client";

import React from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------
// ICONS & ASSETS
// ---------------------------------------------------------
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
);
const LinkedinIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 21.227.792 22 1.771 22h20.451C23.2 22 24 21.227 24 20.271V1.729C24 .774 23.2 0 22.227 0z"/></svg>
);

// ---------------------------------------------------------
// DATA HANDLING
// ---------------------------------------------------------
const fallbackStaffWriters = [
  { name: 'Kristin Watson', role: 'Editor in Chief', img: 'https://placehold.co/200x200/F59E0B/FFFFFF?text=Kristin', articles: 42 },
  { name: 'Marvin Roy', role: 'Tech Journalist', img: 'https://placehold.co/200x200/EF4444/FFFFFF?text=Marvin', articles: 28 },
  { name: 'Leslie Aria', role: 'Senior Publisher', img: 'https://placehold.co/200x200/0EA5E9/FFFFFF?text=Leslie', articles: 35 },
  { name: 'Hawkins Alex', role: 'Content Strategy', img: 'https://placehold.co/200x200/10B981/FFFFFF?text=Hawkins', articles: 19 },
];

interface StaffWriterProps {
  Writer: any[];
}

const StaffWritersSection = ({ Writer: dynamicWriters }: StaffWriterProps) => {
  
  // Resolve Data
  const writersToDisplay = Array.isArray(dynamicWriters) && dynamicWriters.length > 0
    ? dynamicWriters.map(writer => ({
        name: writer.name || 'Unknown Writer',
        role: writer.role || writer.bio || 'Contributor',
        img: writer.profilePicture || 'https://placehold.co/200x200/334155/94a3b8?text=?',
        articles: Math.floor(Math.random() * 30) + 5, // Mock article count if missing
      }))
    : fallbackStaffWriters;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/200x200/334155/94a3b8?text=?';
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 60, damping: 12 }
    },
  };

  return (
    <section className="relative py-24 bg-slate-950 font-sans overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-500/10 rounded-full blur-[100px]" />
        {/* Dotted Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Voices Behind <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500">
                The Stories
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Meet the journalists, editors, and storytellers bringing you the latest perspectives.
            </p>
          </motion.div>

          <motion.a
            href="/writers"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group flex items-center gap-2 text-white font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md transition-all duration-300"
          >
            View All Writers
            <span className="bg-white text-slate-900 rounded-full w-6 h-6 flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-300">
              &rarr;
            </span>
          </motion.a>
        </div>

        {/* Writers Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {writersToDisplay.map((writer, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-500 hover:bg-slate-800/60 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 overflow-hidden">
                
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Avatar Wrapper */}
                <div className="relative mb-6">
                   {/* Spinning Glow Ring on Hover */}
                   <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                   
                   {/* Image */}
                   <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-slate-700 transition-colors duration-300">
                     <img
                       src={writer.img}
                       alt={writer.name}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       onError={handleImageError}
                     />
                   </div>
                   
                   {/* Article Count Badge */}
                   <div className="absolute -bottom-2 -right-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                     <span>✍️</span> {writer.articles}
                   </div>
                </div>

                {/* Info */}
                <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {writer.name}
                </h4>
                <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-500 group-hover:from-teal-300 group-hover:to-indigo-300 transition-all duration-300">
                  {writer.role}
                </p>

                {/* Social / Action Row (Slides up on hover) */}
                <div className="mt-6 w-full flex justify-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-indigo-500 transition-all duration-300">
                    <TwitterIcon />
                  </button>
                  <button className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                    <LinkedinIcon />
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default StaffWritersSection;