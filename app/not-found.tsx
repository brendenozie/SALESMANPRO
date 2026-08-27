"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      
      {/* Subtle, Sophisticated Background Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-200/50 dark:bg-indigo-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-xl mx-auto flex flex-col items-center">
        
        {/* Clean, Minimalist Error Badge */}
        <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mb-6">
          Error 404
        </span>

        {/* Executive Typography */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
          Page not found
        </h1>

        {/* Clear, Professional Context */}
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Please check the URL or return home.
        </p>
        
        {/* Balanced, Clean Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 rounded-lg transition-all duration-200 shadow-sm text-center"
          >
            Return to Dashboard
          </Link>
          
          <button 
            onClick={() => { if (typeof window !== 'undefined') window.history.back() }} 
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg transition-all duration-200 text-center"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}