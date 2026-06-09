'use client';

import React, { useState } from 'react';

const NewsletterSection = ({ className }: { className?: string }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log('Subscribed:', email);
  };

  return (
    <section className={`relative my-12 mx-4 overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-transparent px-6 py-16 sm:px-12 md:py-20 lg:px-20 transition-colors duration-300 ${className || ''}`}>
      {/* Decorative background glow ambient effects */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-600/15 dark:bg-orange-600/20 opacity-70 dark:opacity-100 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/15 dark:bg-amber-500/20 opacity-70 dark:opacity-100 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Small feature badge */}
        <span className="inline-flex items-center rounded-full bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20 dark:ring-orange-500/30 mb-6 tracking-wide uppercase">
          ✨ Weekly Updates
        </span>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
          Stay ahead of the <span className="bg-gradient-to-r select-none from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 bg-clip-text text-transparent">curve.</span>
        </h2>
        
        <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          Get zero-spam, highly curated industry insights, exclusive offers, and product updates delivered straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:rounded-2xl bg-white sm:bg-white dark:sm:bg-white/5 sm:p-2 ring-1 ring-slate-200 dark:ring-white/10 sm:focus-within:ring-orange-500 dark:sm:focus-within:ring-orange-500/50 shadow-sm dark:shadow-none transition-all duration-300">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your best email"
              className="w-full rounded-2xl bg-white dark:bg-white/5 px-5 py-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 dark:ring-none sm:border-0 sm:bg-transparent dark:sm:bg-transparent sm:px-4 sm:py-3 sm:ring-0 sm:focus:ring-0"
            />
            <button
              type="submit"
              className="group flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 sm:py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
            >
              Join the club
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </form>

        {/* Trust signal */}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your privacy is safe with us. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;