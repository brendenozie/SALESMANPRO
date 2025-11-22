'use client';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

export default function ProductHero() {
  return (
    <div className="relative bg-violet-900 text-white py-16 overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mt-20 mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Discover the best{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-fuchsia-200">
            local services
          </span>
          .
        </h1>
        <p className="text-violet-200 text-lg max-w-2xl mx-auto mb-8">
          From top-rated barbershops to emergency plumbers, find trusted professionals in your neighborhood instantly.
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-violet-200">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Verified services
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Real Reviews
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Instant Booking
          </div>
        </div>
      </div>
    </div>
  );
}
