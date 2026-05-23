"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Dynamic Background Glows (Visual Appeal) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-violet-500/10 dark:bg-purple-500/5 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Captivating Floating Illustration Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 flex items-center justify-center group">
          {/* Animated Outer Radar Rings */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 dark:border-indigo-500/10 animate-[ping_3s_infinite]" />
          <div className="absolute inset-8 rounded-full border border-purple-500/30 dark:border-purple-500/15 animate-[ping_4s_infinite_1s]" />
          
          {/* Central Glassmorphic Core */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white/40 dark:bg-white/[0.03] backdrop-blur-md border border-white/40 dark:border-white/[0.08] shadow-2xl flex items-center justify-center animate-[bounce_4s_ease-in-out_infinite]">
            <span role="img" aria-label="lost astronaut" className="text-7xl md:text-8xl select-none filter drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              👩‍🚀
            </span>
          </div>
        </div>

        {/* The 404 Header - Highly Styled & Fluid */}
        <div className="relative mb-2">
          <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 dark:from-white dark:via-slate-200 dark:to-slate-500">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </div>
        
        {/* Engaging Headline */}
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight mt-6 text-slate-800 dark:text-slate-100">
          Lost in deep space?
        </h2>

        {/* Empathetic & Clear Message */}
        <p className="mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        {/* Intuitive Dual-Action Navigation Controls */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Return to Dashboard
          </Link>
          
          <button 
            onClick={() => {window.history.back()}} 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}