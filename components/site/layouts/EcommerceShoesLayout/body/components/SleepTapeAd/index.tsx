'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import React from 'react';
import Link from 'next/link';

// Dummy data for when no promotions are available
const dummyPromotionData = {
  title: 'Discover Something New Sample',
  description:'Explore our latest collection and find items designed to fit your lifestyle. Quality, comfort, and style combined for everyday living.',
  bannerUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', // a neutral lifestyle/product image
  ctaText: 'Shop Now',
  ctaLink: '/shop',
  themePrimary: '#0A192F', // Deep Navy
  themeSecondary: '#532D93', // Muted Lavender
  featureImage1: 'https://images.unsplash.com/photo-1513708925885-1e3a4f3bfbf2',
  featureImage2: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  featureImage3: 'https://images.unsplash.com/photo-1513708925885-1e3a4f3bfbf2',
  perks: [
    { icon: 'TruckIcon', text: 'Fast & Reliable Delivery' },
    { icon: 'ShieldCheckIcon', text: 'Secure Checkout' },
    { icon: 'PhoneIcon', text: '24/7 Customer Support' },
  ],
  trustLogos: [],
};

interface SleepTapeAdProps {
  promotions?: any;
  themeSettings?: any;
}


export default function SleepTapeAd({ promotions, themeSettings }: SleepTapeAdProps) {
  // const { storeFormData } = useStoreContext();
  // const { promotions = [], themeSettings = {} } = storeFormData || {};

  // Find an active promotion to use for the ad.
  // We can use the first promotion in the list for this component.
  const promotion = promotions.length > 1 ? promotions[1] : null;

  // Use the promotion data if available, otherwise fall back to dummy data
  const adData = promotion || dummyPromotionData;

  // Use the promotion's theme colors, or fall back to store settings, then to defaults
  const primary = adData.themePrimary || themeSettings?.primaryColor || '#f97316';
  const secondary = adData.themeSecondary || themeSettings?.secondaryColor || '#3b82f6';

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
            {adData.title || dummyPromotionData.title}
          </h1>
          <h2 className="mt-4 text-2xl md:text-4xl font-semibold text-white/90 font-serif">
            Experience Tranquility
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl">
            {adData.description || dummyPromotionData.description}
          </p>
          {adData.ctaLink && (
            <Link href={adData.ctaLink || '/shop'} passHref>
              <button className="mt-8 inline-block bg-white text-black font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105">
                {adData.ctaText || 'Learn More'}
              </button>
            </Link>
          )}
        </div>

        {/* Image Block */}
        <div className="flex justify-center md:justify-end relative z-10">
          <div className="relative">
            {(
              <img
                src={adData.bannerUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                alt={adData.title || 'Ad Image'}
                className="w-72 md:w-80 lg:w-96 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 border-2 border-white/20"
              />
            )}
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