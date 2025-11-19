'use client';

import React from 'react';
import Link from 'next/link';
import { TruckIcon, ShieldCheckIcon, PhoneIcon } from '@heroicons/react/24/outline';

// Dummy data for when no promotions are available
const dummyPromotionData = {
  title: 'Best Wear Shoes for Better Tracking ',
  subtitle: 'The Ultimate Comfort and Style', // Added a strong subtitle
  description:
    'It’s simple, comfortable, and effective. Experience the best tracking and training anywhere. Our shoes are designed to provide unparalleled comfort and support, ensuring you stay on your feet all day long. Whether you’re hitting the trails or navigating the urban jungle, our footwear combines cutting-edge technology with stylish design to keep you moving forward with confidence.',
  bannerUrl: 'https://images.unsplash.com/photo-1542315668-3be3a7d2e626?auto=format&fit=crop&w=800&q=80', // A calming, training-focused image
  ctaText: 'Get Yours Now',
  ctaLink: '#',
  themePrimary: '#C9D4FF', // Soft Sky Blue (Light)
  themeSecondary: '#3B82F6', // Vibrant Blue (Accent)
  featureImage1: 'https://images.unsplash.com/photo-1541893041908-1643c7b889a9?auto=format&fit=crop&w=400&q=80', // Image of a person sleeping peacefully
  featureImage2: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab93b?auto=format&fit=crop&w=400&q=80', // Close-up of comfortable fabric/texture
  perks: [
    { icon: TruckIcon, text: 'Free Shipping Over 50' },
    { icon: ShieldCheckIcon, text: '30-Day Money-Back Guarantee' },
    { icon: PhoneIcon, text: 'Dedicated Support' },
  ],
  trustLogos: [],
};

interface SleepTapeAdProps {
  promotions?: any;
  themeSettings?: any;
}


export default function SleepTapeAd({ promotions, themeSettings }: SleepTapeAdProps) {
  const promotion = promotions?.length >= 1 ? promotions[1] : null;
  const adData = promotion || dummyPromotionData;

  // Use the promotion's theme colors, or fall back to store settings, then to defaults
  const primary = adData.themePrimary || themeSettings?.primaryColor || '#C9D4FF';
  const secondary = adData.themeSecondary || themeSettings?.secondaryColor || '#3B82F6';
  const accentText = '#1f2937'; // Dark gray text for contrast on light background

  return (
    <section 
      className="relative py-24 md:py-32 overflow-hidden"
      // style={{
      //   backgroundColor: primary, // Soft, light primary color
      // }}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* --- Left Block: Images & Value --- */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-8">
            {/* Main Product Image (Intuitive) */}
            <div className="relative w-full max-w-sm">
                <img
                  src={adData.bannerUrl || dummyPromotionData.bannerUrl}
                  alt={adData.title || 'Ad Image'}
                  className="w-full rounded-3xl shadow-3xl transform rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-[1.03] border-4 border-white"
                />
            </div>
            
            {/* Feature Images (Engaging - layered and floating) */}
            <div className="flex -space-x-12 relative w-full justify-center lg:justify-end pr-10">
                <img 
                    src={adData.featureImage1 || dummyPromotionData.featureImage1} 
                    alt="Feature 1" 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-xl border-4 border-white transform translate-y-4 hover:translate-y-0 transition-transform duration-500"
                />
                <img 
                    src={adData.featureImage2 || dummyPromotionData.featureImage2} 
                    alt="Feature 2" 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-xl border-4 border-white transform -translate-y-4 hover:translate-y-0 transition-transform duration-500 delay-150"
                />
            </div>
        </div>

        {/* --- Right Block: Text, CTA, & Perks --- */}
        <div className="lg:col-span-7 text-center lg:text-left z-10">
          
          {/* Subtitle */}
          <p className="text-xl font-medium tracking-widest uppercase mb-3" style={{ color: secondary }}>
            {adData.subtitle || dummyPromotionData.subtitle}
          </p>
          
          {/* Title (Captivating) */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-fade-in-down" style={{ color: accentText }}>
            {adData.title || dummyPromotionData.title}
          </h1>
          
          {/* Description */}
          <p className="mt-6 text-lg md:text-xl max-w-2xl" style={{ color: accentText }}>
            {adData.description || dummyPromotionData.description}
          </p>

          {/* CTA Button */}
          {adData.ctaLink && (
            <Link href={adData.ctaLink || '/shop'} passHref>
              <button 
                className="mt-10 inline-block text-white font-bold py-4 px-12 rounded-full shadow-2xl transition duration-300 transform hover:scale-[1.03] hover:shadow-primary-glow border-2 border-transparent"
                style={{ 
                    backgroundColor: secondary,
                    '--shadow-color': secondary // Custom CSS variable for glow
                } as React.CSSProperties}
              >
                {adData.ctaText || 'Learn More'}
              </button>
            </Link>
          )}

          {/* Perks/Trust Block (Intuitive) */}
          <div className="mt-12 pt-6 border-t border-gray-300 grid grid-cols-3 gap-6 text-left">
            {(adData.perks || dummyPromotionData.perks).map((perk: { icon: React.ElementType; text: string }, index: number) => {
              const IconComponent = perk.icon; // Assuming the icon is passed as a component or similar
              return (
                <div key={index} className="flex flex-col items-center lg:items-start text-sm md:text-base">
                  <IconComponent className="w-8 h-8 mb-2" style={{ color: secondary }} />
                  <p className="font-semibold" style={{ color: accentText }}>{perk.text}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
      
      {/* Background Decor: Subtle white wave/mask effect at the bottom */}
      <div className="absolute bottom-0 w-full h-1/4 bg-white opacity-50 transform skew-y-[-2deg] origin-bottom-left" />

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }

        .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .hover\\:shadow-primary-glow:hover {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3), 0 0 20px 8px var(--shadow-color); /* Subtle blue glow */
        }
      `}</style>
    </section>
  );
}