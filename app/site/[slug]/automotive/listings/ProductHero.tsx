// components/automarket/Hero.tsx
'use client';
import { ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import React from 'react';

export default function Hero() {
  return (
    <div className="relative bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-24 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            New Arrivals Daily
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Find the car you've always <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">promised yourself.</span>
          </h1>

          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto md:mx-0">
            Experience a curated marketplace for enthusiasts. Verified histories, transparent pricing, and seamless delivery to your driveway.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#inventory" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group">
              Browse Inventory
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <a href="/sell" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm">
              Sell or Trade
            </a>
          </div>
        </div>

        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative z-0 perspective-1000">
          <img
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury Car"
            className="w-full h-auto object-contain drop-shadow-2xl transform md:rotate-y-12 md:scale-110 transition-transform duration-700 hover:rotate-y-0"
          />

          <div className="absolute -bottom-4 left-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl hidden md:block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <ShieldCheckIcon className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Certified Pre-Owned</p>
                <p className="text-slate-400 text-xs">150+ Point Inspection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
