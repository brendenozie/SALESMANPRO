"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';

// --- ICONS ---
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

// --- MOCK DATA ---
const mockData = {
  marketplaceListings: [
    {
      id: "1",
      name: "Corporate Law",
      description: "Mergers, acquisitions, and compliance.",
      finalPrice: 500,
      images: [{ url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" }],
      rating: 4.9,
    },
    {
      id: "2",
      name: "Financial Advisory",
      description: "Wealth management and capital growth.",
      finalPrice: 850,
      images: [{ url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" }],
      rating: 5.0,
    },
    {
      id: "3",
      name: "IP Protection",
      description: "Patent filing and trademark security.",
      finalPrice: 720,
      images: [{ url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" }],
      rating: 4.8,
    },
  ],
};

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
};

interface PracticeAreasSectionProps {
  themeSettings?: any;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function PracticeAreasAppSection({ themeSettings, marketplaceListings }: PracticeAreasSectionProps) {
  const listings = marketplaceListings?.length ? marketplaceListings : mockData.marketplaceListings;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 sm:py-32 bg-slate-50/50 font-sans relative overflow-hidden">
      
      {/* --- APP-LIKE BACKGROUND --- */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-blue-100/50 rounded-full blur-[80px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-indigo-100/50 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADER (iOS Style) --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-blue-600 font-bold tracking-wide uppercase text-xs mb-2 block">
              Service Catalog
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Find Your Solution
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 transition-colors"
          >
            View All Services <ArrowUpRightIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* --- WIDGET GRID --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((listing: any) => {
            const isHovered = hoveredId === listing.id;

            return (
              <motion.div
                key={listing.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer"
              >
                
                {/* --- WIDGET IMAGE (Inset) --- */}
                <div className="relative h-64 rounded-[2rem] overflow-hidden">
                  <img 
                    src={listing.images?.[0]?.url || "https://via.placeholder.com/600"} 
                    alt={listing.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Glass Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="bg-white/90 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-slate-800 flex items-center gap-1">
                      <StarIcon className="w-3 h-3 text-yellow-500" /> {listing.rating || '5.0'}
                    </div>
                    <div className="bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                      {listing.finalPrice}
                    </div>
                  </div>

                  {/* Floating Action Button (FAB) */}
                  <motion.div 
                    className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-20 text-slate-900"
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? 90 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {isHovered ? (
                      <ArrowUpRightIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <PlusIcon className="w-6 h-6" />
                    )}
                  </motion.div>
                </div>

                {/* --- WIDGET CONTENT --- */}
                <div className="px-4 pt-5 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {listing.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">
                    {listing.description}
                  </p>
                  
                  {/* Progress Bar / Status Indicator (Visual Flair) */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-1.5 flex-grow bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "35%" }}
                        transition={{ delay: 0.5, duration: 1 }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Popular</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}