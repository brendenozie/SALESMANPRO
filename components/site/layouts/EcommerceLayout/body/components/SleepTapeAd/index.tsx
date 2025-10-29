import { useStoreContext } from '@/contexts/StoreContext';
import React from 'react';

interface SleepTapeAdProps {
  bannerUrl?: string | null;
  themeSettings?: Record<string, any> | null;
}
export default function SleepTapeAd({ bannerUrl, themeSettings }: SleepTapeAdProps) {
  
  const primary = themeSettings?.primaryColor || '#f97316'; // fallback orange
  const secondary = themeSettings?.secondaryColor || '#3b82f6'; // fallback blue

  return (
    <section
      className="relative py-20"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Text Block */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Ultimate Sleep Tapes
          </h1>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-white/90">
            Relax, Rest, Revive
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl">
            Improve your nightly rest with Blume Sleep Tape. Experience the perfect blend
            of natural ingredients that promotes deep relaxation and rejuvenation.
          </p>
          <button className="mt-8 inline-block bg-white text-black font-semibold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition duration-300">
            Shop Now
          </button>
        </div>

        {/* Image Block */}
        <div className="flex justify-center md:justify-end relative">
          <div className="relative">
            <img
              src={bannerUrl || 'https://www.unsplash.com/'}
              alt="Blume Sleep Tape"
              className="w-72 md:w-80 lg:w-96 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
            {/* Decorative Circle */}
            <div
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-30 blur-2xl"
              style={{ background: secondary }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
