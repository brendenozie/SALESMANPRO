'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, LockClosedIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { MarketListingForm } from '@/types/typings'; // Assuming MarketListingForm is correct

// Loader for Next.js Image component
const imageLoader = ({ src, width, quality }: any) => {
  // Use a simple placeholder if the actual URL logic fails
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- SECURITY-RELATED FALLBACK DATA ---
const defaultListings: MarketListingForm[] = [
  {
    id: '1',
    name: 'Threat Modeling Masterclass',
    description: 'A comprehensive video course on proactive security design and threat identification.',
    finalPrice: 499.00,
    images: [{ url: 'https://images.unsplash.com/photo-1555940250-86d1b7774e1d?q=80&w=2574&auto=format&fit=crop', id: 'img1' }],
    tags: ['Masterclass', 'Proactive'],
    // Minimal required fields for display (omitted non-essential fields for clarity)
    // ... all other MarketListingForm fields set to defaults or null
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isAvailable: false, isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: true, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', status: 'ACTIVE', location: null
  },
  {
    id: '2',
    name: 'Zero Trust Implementation Guide',
    description: 'A step-by-step PDF blueprint for migrating your network to a modern Zero Trust architecture.',
    finalPrice: 99.00,
    images: [{ url: 'https://images.unsplash.com/photo-1544485303-10e527d91d84?q=80&w=2671&auto=format&fit=crop', id: 'img2' }],
    tags: ['Ebook', 'Network'],
    // ... all other MarketListingForm fields set to defaults or null
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isAvailable: false, isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', status: 'ACTIVE', location: null
  },
  {
    id: '3',
    name: 'DevSecOps Pipeline Template',
    description: 'Ready-to-use CI/CD code templates and security automation scripts for rapid deployment.',
    finalPrice: 149.00,
    images: [{ url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2787&auto=format&fit=crop', id: 'img3' }],
    tags: ['Template', 'Automation'],
    // ... all other MarketListingForm fields set to defaults or null
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], quantity: 0, buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isAvailable: false, isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: false, paymentOption: '', status: 'ACTIVE', location: null
  },
];
// --- END FALLBACK DATA ---

// Framer Motion variants (adjusted for better visual hierarchy)
const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};
const featuredItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
};
const secondaryItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


interface MarketplaceListingsSectionProps {
  name: string | undefined | null;
  slug: string | undefined | null;
  themeSettings: { 
    primaryColor?: string; 
    secondaryColor?: string; 
  } | undefined | null;
  marketplaceListings: MarketListingForm[] | undefined | null;
}


export default function MarketplaceListingsSection({ name, slug, themeSettings, marketplaceListings }: MarketplaceListingsSectionProps) {
  
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';

  // Sort listings to put a featured item first, or use a default one.
  const allListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
    ? marketplaceListings
    : defaultListings;

  if (allListings.length === 0) {
    return null; 
  }

  // Find the most featured item for the large block
  const featuredItem = allListings.find(item => item.isFeatured) || allListings[0];
  const secondaryListings = allListings.filter(item => item.id !== featuredItem.id).slice(0, 3); // Max 3 small cards

  const formatPrice = (price: number) => {
      // Simple formatting, assuming USD for security products
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);
  };
  
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;


  return (
    <AnimatePresence>
      <section id="marketplace" className="relative py-24 md:py-32 px-6 lg:px-12 bg-gray-50 text-gray-900 overflow-hidden" style={cssVars}>
        
        {/* Header */}
        <motion.div
          className="text-center mb-16 max-w-4xl mx-auto"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <p 
            className="text-lg font-semibold uppercase tracking-widest mb-3" 
            style={{ color: primaryColor }}
          >
            Digital Vault & Resources
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
            Curated <span style={{ color: primaryColor }}>Security</span> Resources
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Instantly access blueprints, templates, and masterclasses crafted by our security experts.
          </p>
        </motion.div>

        {/* --- MAGAZINE STYLE GRID --- */}
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          
          {/* FEATURED ITEM (Large Card) */}
          <motion.div 
            className="lg:col-span-2 relative group rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200"
            variants={featuredItemVariants}
          >
            <div className="relative w-full h-80 lg:h-full">
              <Image
                src={featuredItem.images?.[0]?.url || 'https://images.unsplash.com/photo-1555940250-86d1b7774e1d?q=80&w=2574&auto=format&fit=crop'}
                loader={imageLoader}
                alt={featuredItem.name}
                fill
                className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              {/* Image Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent p-8 flex flex-col justify-end">
                <span className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">Featured Course</span>
                <h3 className="text-4xl font-extrabold text-white mb-3 leading-tight">
                  {featuredItem.name}
                </h3>
                <p className="text-lg text-gray-300 mb-4">{featuredItem.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">
                    {formatPrice(featuredItem.finalPrice || 0)}
                  </p>
                  <Link
                    href={`/${slug}/product/${featuredItem.id}`}
                    className="inline-flex items-center gap-2 text-base font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:bg-white hover:text-gray-900"
                    style={{ backgroundColor: primaryColor, color: '#fff' }}
                  >
                    Enroll Now
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SECONDARY LISTINGS (Stacked Column) */}
          <div className="lg:col-span-1 space-y-6">
            {secondaryListings.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                className="relative group bg-white rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200"
                variants={secondaryItemVariants}
              >
                <div className="flex items-start gap-4">
                  {/* Small Image/Icon for Secondary Item */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                      <Image
                          src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1544485303-10e527d91d84?q=80&w=2671&auto=format&fit=crop'}
                          loader={imageLoader}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover"
                      />
                  </div>

                  <div className="flex-grow">
                    <h4 className="text-xl font-bold mb-1 text-gray-900 leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">{item.tags[0] || 'Resource'}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold" style={{ color: primaryColor }}>
                        {formatPrice(item.finalPrice || 0)}
                      </p>
                      <Link
                        href={`/${slug}/product/${item.id}`}
                        className="text-sm font-semibold transition-colors duration-300 hover:underline"
                        style={{ color: primaryColor }}
                      >
                        Get It <ArrowRightIcon className="w-4 h-4 inline-block ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* CTA to view the entire vault */}
            <motion.div 
                className="pt-4 text-center"
                variants={secondaryItemVariants}
            >
                <Link
                    href={`/${slug}/marketplace`}
                    className="inline-flex items-center gap-3 text-base font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg"
                    style={{ backgroundColor: secondaryColor, color: '#fff' }}
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    View Entire Digital Vault
                </Link>
            </motion.div>

          </div>
        </motion.div>
      </section>
    </AnimatePresence>
  );
}