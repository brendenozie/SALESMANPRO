'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon, BellAlertIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative bg-zinc-950 border border-white/5 p-12 md:p-20 text-center rounded-sm"
        >
          {/* Ornamental Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-600/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-600/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-amber-600/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-600/50" />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-900 rounded-full border border-white/5">
              <EnvelopeIcon className="w-8 h-8 text-amber-600 stroke-[1]" />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
            Join the <span className="italic">Collector’s Circle</span>
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto mb-10 leading-relaxed">
            Receive early access to limited editions, invitations to private viewings, and horological insights curated by our master watchmakers.
          </p>

          <form className="max-w-md mx-auto relative group">
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent border-b border-zinc-800 py-4 pl-2 pr-32 text-white font-light placeholder:text-zinc-700 focus:outline-none focus:border-amber-600 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-0 bottom-2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 hover:bg-amber-600 hover:text-white transition-all"
              >
                Join Now
              </button>
            </div>
          </form>

          {/* Privacy/Trust Markers */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Global Access</span>
            </div>
            <div className="flex items-center gap-2">
              <BellAlertIcon className="w-4 h-4 text-white" />
              <span className="text-[9px] uppercase tracking-widest text-white">Priority Alerts</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative background text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] uppercase select-none whitespace-nowrap">
        Privileged Access
      </div>
    </section>
  );
}