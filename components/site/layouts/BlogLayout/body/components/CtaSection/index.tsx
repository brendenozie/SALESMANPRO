"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from "@/contexts/StoreContext";

interface NewsletterSectionProps {
  themeSettings?: Record<string, any> | null;
}

const NewsletterSection = ({ themeSettings }: NewsletterSectionProps) => {
  const [email, setEmail] = useState('');
  const { storeFormData } = useStoreContext() || {};
  
  // Theme Parameter Resolution
  const primaryColor = themeSettings?.primaryColor || storeFormData?.themeSettings?.primaryColor || "#f97316";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="bg-slate-950 border border-slate-900 rounded-lg p-8 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          variants={containerVariants}
        >
          {/* Left Column Text Block Frame */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                Distribution Pipeline
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
              Join Our Community
            </h2>
            <p className="text-sm text-slate-400 font-normal leading-relaxed">
              Receive high-density technical insights, platform optimization analysis, and exclusive engineering content delivered directly to your node.
            </p>
          </div>

          {/* Right Column Interactive Input Frame */}
          <form 
            onSubmit={handleSubmit} 
            className="w-full lg:max-w-md flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full h-11 pl-10 pr-4 rounded bg-slate-950 text-slate-200 text-xs border border-slate-800 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 rounded text-xs font-semibold text-slate-950 uppercase tracking-wider transition-opacity duration-150 active:scale-[0.99] select-none text-center shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;