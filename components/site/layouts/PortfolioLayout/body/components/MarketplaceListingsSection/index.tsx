'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ListingMarketStatus, ListingSystemStatus, ListingTransactionType, MarketListingForm } from '@/types/typings';
import BookingFormModal from '../BookingFormModal';

// Loader for Next.js Image component
const imageLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Fallback data for a standalone preview
const defaultListings: MarketListingForm[] = [
  {
    id: '1',
    name: 'Consulting Session',
    description: 'A focused, one-on-one session to address your most pressing business challenges and align your digital strategy.',
    finalPrice: 250,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null,
    option: [],
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '2',
    name: 'Webinar Series',
    description: 'Access to a five-part masterclass series focused on advanced strategic planning, workflow optimization, and scaling metrics.',
    finalPrice: 50,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null,
    option: [],
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '3',
    name: 'Ebook: Growth Blueprint',
    description: 'A comprehensive, metrics-driven digital guide tailored to safely scaling your modern architecture and system assets.',
    finalPrice: 25,
    duration: undefined,
    productCategoryId: '',
    subCategory: undefined,
    tags: [],
    color: [],
    size: [],
    weight: [],
    material: [],
    quantity: 0,
    images: [],
    buyingPrice: 0,
    sellingPrice: 0,
    pricingTiers: [],
    isAvailable: false,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    bedrooms: [],
    studios: [],
    features: [],
    bookingSlots: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: false,
    paymentOption: '',
    status: 'ACTIVE',
    location: null,
    option: [],
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 15,
    },
  },
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
  const [activeService, setActiveService] = useState<MarketListingForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const primaryColor = themeSettings?.primaryColor || '#000000';

  const dynamicListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
    ? marketplaceListings
    : defaultListings;

  if (dynamicListings.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <section id="marketplace" className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100">
        
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header Segment */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <ShoppingBagIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Digital Resources & Expertise
              </p>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.15]"
              variants={itemVariants}
            >
              Explore Our <span style={{ color: primaryColor }}>{name || 'Marketplace'}</span>
            </motion.h2>

            {/* Sub-description */}
            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              Discover individual products, accelerator bundles, and tailored premium services built to inject immediate, quantifiable asset leverage into your enterprise.
            </motion.p>
          </motion.div>

          {/* Grid of Minimalist Architectural Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {dynamicListings.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Image Container with Crisp Scale Transition */}
                <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <Image
                    src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop'}
                    loader={imageLoader}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                
                {/* Content Body */}
                <div className="p-8 flex flex-col flex-1 justify-between items-start">
                  <div className="w-full">
                    {/* Minimal Core Tag Label */}
                    <div className="mb-4">
                      <span className="inline-block text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        Resource Portfolio
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-xl font-bold mb-3 text-slate-900 tracking-tight leading-snug">
                      {item.name}
                    </h3>
                    
                    {/* Card Description */}
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing Action Line */}
                  <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Value Assessment</span>
                      <p className="text-2xl font-black tracking-tight text-slate-900">
                        ${(item.finalPrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveService(item);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg border-2 transition-all duration-200 active:scale-95 shadow-sm"
                      style={{ 
                        backgroundColor: primaryColor, 
                        borderColor: primaryColor,
                        color: '#ffffff' 
                      }}
                    >
                      Configure Asset
                      <ArrowRightIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- PREMIUM COMPREHENSIVE MODAL FRAME --- */}
      <AnimatePresence>
        {isModalOpen && activeService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            
            {/* Structural High-Contrast Backdrop */}
            <motion.div 
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Body Card Frame */}
            <motion.div
              initial={{ scale: 0.98, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 15, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] z-10 text-slate-900"
            >
              {/* Close Button Trigger Node */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-30 p-2 bg-white/80 hover:bg-slate-100 border border-slate-200 text-slate-900 rounded-lg transition-all"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" strokeWidth={2.5} />
              </button>

              {/* Left Column Component Viewport (Details & Diagram) */}
              <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200 bg-white">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded mb-4">
                  Asset Specifications
                </span>
                
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4">
                  {activeService.name}
                </h2>
                
                <p className="text-sm text-slate-500 leading-relaxed font-normal mb-8">
                  {activeService.description || "Detailed specification matrix of this digital solution asset."}
                </p>

                {/* Instructional Flowchart Graphic Structure */}
                <div className="mb-8 p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-slate-500" /> Operational Integration Map
                  </h4>
                  <div className="relative w-full aspect-[2.5/1] bg-white rounded-lg overflow-hidden border border-slate-200">
                    <Image
                      src={activeService.images?.[0]?.url || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80"}
                      alt="Service Integration Flow Chart Graphic"
                      loader={imageLoader}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-80 mix-blend-multiply"
                    />
                  </div>
                  <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
                    Sequential Implementation Nodes: <span className="font-bold text-slate-600">Acquire Assets</span> → Sync Protocol → Deploy → Measure Return.
                  </p>
                </div>
                
                {/* Feature Check Grid Elements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-semibold text-slate-700">
                  {["Premium Grade Output", "Direct Pipeline Integration", "Full Satisfaction Protocol"].map(feature => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <CheckCircleIcon className="w-5 h-5 text-slate-900 shrink-0" strokeWidth={2.5} /> 
                      <span className="tracking-tight text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Component Viewport (Booking Form Engine) */}
              <div className="w-full md:w-5/12 bg-slate-50 flex flex-col justify-between">
                <div className="p-8 md:p-12 overflow-y-auto flex-1">
                  <div className="mb-8 pb-6 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Asset Price</p>
                    <p className="text-4xl font-black tracking-tight text-slate-900 mt-1">
                      ${(activeService.finalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  {/* Embedded Form Node */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <BookingFormModal service={activeService} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}