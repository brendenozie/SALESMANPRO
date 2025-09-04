import { useStoreContext } from '@/contexts/StoreContext';
import React from 'react';

// Sample data to be used when props are not available
const sampleData = {
  slug: 'blume-sleep-tape',
  marketplaceListings: [],
  themeSettings: {
    primaryColor: '#0A192F', // Deep Navy
    secondaryColor: '#532D93', // Muted Lavender
  },
  bannerUrl: 'http://googleusercontent.com/image_generation_content/0',
};

export default function SleepTapeAd() {
  const { storeFormData } = useStoreContext();
  const {
    slug,
    marketplaceListings = [],
    themeSettings = {},
    bannerUrl,
  } = storeFormData || sampleData;

  const primary = themeSettings.primaryColor || '#f97316'; // fallback orange
  const secondary = themeSettings.secondaryColor || '#3b82f6'; // fallback blue

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Text Block */}
        <div className="text-center md:text-left z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Dreamy Sleep, Waking Glow
          </h1>
          <h2 className="mt-4 text-2xl md:text-4xl font-semibold text-white/90 font-serif">
            Experience Tranquility
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl">
            Improve your nightly rest with Blume Sleep Tape. Experience a serene journey to deep relaxation and rejuvenation, night after night.
          </p>
          <button className="mt-8 inline-block bg-white text-black font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105">
            Begin Your Restful Night
          </button>
        </div>

        {/* Image Block */}
        <div className="flex justify-center md:justify-end relative z-10">
          <div className="relative">
            <img
              src={bannerUrl}
              alt="Blume Sleep Tape"
              className="w-72 md:w-80 lg:w-96 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-2 border-white/20"
            />
            {/* Soft, glowing orb effect */}
            <div
              className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-40 blur-3xl animate-pulse-slow"
              style={{ background: secondary }}
            />
          </div>
        </div>
      </div>

      {/* Background Starry Effect (Decorative) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://example.com/starry-night-texture.png')] opacity-10" />
      </div>

      {/* CSS for custom animation */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s infinite;
        }
      `}</style>
    </section>
  );
}