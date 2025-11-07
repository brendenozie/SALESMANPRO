'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BannerSectionProps {
  promotions?: any[];
  themeSettings?: any;
}

// --- Fallback for when no promo is provided ---
const dummyBanner = {
  title: 'Step Into Style. Elevate Your Game.',
  subtitle: 'New Arrivals',
  description:
    'Discover a fusion of cutting-edge design and unparalleled comfort. Our exclusive collection is engineered for performance and styled for the streets.',
  ctaText: 'Shop Now',
  ctaLink: '/shop',
  bannerUrl:
    'https://images.unsplash.com/photo-1605340628286-905b76609f3e?auto=format&fit=crop&w=2070&q=80',
  secondaryImage:
    'https://images.unsplash.com/photo-1542291026-79eddc872736?auto=format&fit=crop&w=2070&q=80',
  themePrimary: '#0A192F',
  themeSecondary: '#532D93',
};

export default function BannerSection({ promotions = [], themeSettings = {} }: BannerSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Pick first promotion (or fallback)
  const promo = promotions?.[2] || dummyBanner;

  // Theme colors hierarchy: promo > themeSettings > fallback
  const primary = promo.themePrimary || themeSettings?.primaryColor || '#0A192F';
  const secondary = promo.themeSecondary || themeSettings?.secondaryColor || '#532D93';

  return (
    <section
      className="relative py-20 px-6 lg:px-20 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="relative w-full overflow-hidden bg-white/10 backdrop-blur-sm text-white rounded-2xl shadow-2xl p-6 md:p-12 lg:p-20 border border-white/10">
          {/* Glowing background orbs */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <div
              className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-pulse-slow"
              style={{ background: primary }}
            />
            <div
              className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl animate-pulse-slow delay-1000"
              style={{ background: secondary }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-10 md:space-y-0 md:space-x-10">
            {/* Text + CTA */}
            <div className="flex-1 max-w-2xl">
              {promo.subtitle && (
                <p className="text-lg sm:text-xl font-medium text-white/80 mb-2 tracking-wide uppercase">
                  {promo.subtitle}
                </p>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                {promo.title}
              </h1>
              {promo.description && (
                <p className="mt-4 text-white/80 max-w-xl font-light leading-relaxed">
                  {promo.description}
                </p>
              )}

              {promo.ctaLink && (
                <Link href={promo.ctaLink} passHref>
                  <button
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="mt-8 px-10 py-4 bg-white text-black rounded-full font-bold text-lg shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white/50"
                  >
                    {isHovered ? 'Explore The Collection' : promo.ctaText || 'Shop Now'}
                  </button>
                </Link>
              )}
            </div>

            {/* Images */}
            <div className="flex-1 w-full relative group transform transition-transform duration-500 ease-in-out hover:scale-105">
              <img
                src={promo.bannerUrl || dummyBanner.bannerUrl}
                alt={promo.title || 'Banner Image'}
                className="relative z-10 w-full rounded-xl shadow-2xl transition-transform duration-500 ease-in-out group-hover:rotate-6"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1920x1080/000/fff?text=Banner+Image';
                }}
              />
              <img
                src={promo.secondaryImage || dummyBanner.secondaryImage}
                alt="Secondary Layer"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 -rotate-12 z-0 opacity-50 transition-transform duration-500 ease-in-out group-hover:rotate-12"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1920x1080/000/fff?text=Banner+Image';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative starry overlay */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://example.com/starry-night-texture.png')] opacity-10" />
      </div>

      {/* Custom animation keyframes */}
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
          animation: pulse-slow 6s infinite;
        }
      `}</style>
    </section>
  );
}
