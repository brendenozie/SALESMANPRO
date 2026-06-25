'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ShoppingCartIcon,
  CameraIcon, 
  WifiIcon,
  RadioIcon, 
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import { ListingMarketStatus, ListingSystemStatus, ListingTransactionType, MarketListingForm } from '@/types/typings';

const imageLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const defaultListings: MarketListingForm[] = [
  {
    id: '1', name: '4K Ultra-HD Dome Camera', finalPrice: 450.00, quantity: 50, isAvailable: true,
    description: 'Vandal-proof indoor/outdoor camera with 100ft night vision and advanced AI detection.',
    images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop', id: 'img1' }], tags: ['CCTV', 'Outdoor'], isOnOffer: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isFlashDeal: false, isNewArrival: false, isFeatured: true, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    isDiscounted: false, listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '2', name: 'Rugged Digital Walkie Talkie', finalPrice: 150.00, quantity: 120, isAvailable: true,
    description: 'Durable, waterproof two-way radio with extended battery life and secure, encrypted channels.',
    images: [{ url: 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop', id: 'img2' }], tags: ['Communication', 'Radio'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '3', name: 'Biometric Access Control Reader', finalPrice: 220.00, quantity: 30, isAvailable: true,
    description: 'High-speed fingerprint and RFID access reader for secure entry points and time-tracking.',
    images: [{ url: 'https://images.unsplash.com/photo-1590483321590-449e79391090?q=80&w=2670&auto=format&fit=crop', id: 'img3' }], tags: ['Access Control', 'Biometric'], isNewArrival: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '4', name: 'High-Gain Mesh WiFi Extender', finalPrice: 99.00, quantity: 200, isAvailable: true,
    description: 'Extends coverage for wireless cameras and network devices across large commercial areas.',
    images: [{ url: 'https://images.unsplash.com/photo-1549497042-3a85b6a7a72d?q=80&w=2670&auto=format&fit=crop', id: 'img4' }], tags: ['Networking', 'Wireless'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '5', name: 'Commercial 32-Ch NVR', finalPrice: 1200.00, quantity: 15, isAvailable: true,
    description: 'Network Video Recorder supporting up to 32 cameras with 40TB expandable storage.',
    images: [{ url: 'https://images.unsplash.com/photo-1520697526685-c49c71c49603?q=80&w=2670&auto=format&fit=crop', id: 'img5' }], tags: ['Storage', 'NVR'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '6', name: 'Heavy Duty Siren & Strobe', finalPrice: 85.00, quantity: 75, isAvailable: true,
    description: '120dB outdoor siren with bright strobe light for immediate intrusion deterrence.',
    images: [{ url: 'https://images.unsplash.com/photo-1528698827571-3c6b1ad4c556?q=80&w=2670&auto=format&fit=crop', id: 'img6' }], tags: ['Alarm', 'Deterrence'], isDiscounted: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '7', name: 'Covert Mini Body Camera', finalPrice: 180.00, quantity: 90, isAvailable: true,
    description: 'Tiny, discreet camera with 8-hour battery and local SD card recording for surveillance.',
    images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop', id: 'img7' }], tags: ['Covert', 'Wearable'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE, listingSystemStatus: ListingSystemStatus.DRAFT, listingTransactionType: ListingTransactionType.SALE
  },
];

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'linear' } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'linear' } },
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

const getProductIcon = (tag: string): React.ElementType => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('cctv') || lowerTag.includes('camera')) return CameraIcon;
  if (lowerTag.includes('radio') || lowerTag.includes('communication')) return RadioIcon;
  if (lowerTag.includes('biometric') || lowerTag.includes('access')) return FingerPrintIcon;
  if (lowerTag.includes('network') || lowerTag.includes('wifi') || lowerTag.includes('nvr')) return WifiIcon;
  return CameraIcon;
};

export default function MarketplaceListingsSection({ name, slug, themeSettings, marketplaceListings }: MarketplaceListingsSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#00A880';

  const allListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
    ? marketplaceListings.filter(item => item.isAvailable).slice(0, 7)
    : defaultListings.slice(0, 7);

  if (allListings.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price);
  };

  return (
    <AnimatePresence>
      <section id="inventory" className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 border-b border-gray-100 overflow-hidden">
        
        {/* BACKGROUND TELEMETRY MESHGRID */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-900 h-full" />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* ASYMMETRIC LOGISTICS HEADER */}
          <motion.div
            className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  HARDWARE_DEPLOYMENT // STOCKS
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
                CRITICAL HARDWARE INVENTORY
              </h2>
            </div>
            <p className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm lg:mt-8">
              Field-ready physical perimeter components, cryptographic units, and secure operational endpoints optimized for zero-degradation deployment matrices.
            </p>
          </motion.div>

          {/* HIGH-DENSITY SECURE ITEM CHANNELS */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-100"
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {allListings.map((item, idx) => {
              const ItemIcon = getProductIcon(item.tags[0] || '');
              const hexIndex = `0${idx + 1}`.slice(-2);
              
              return (
                <motion.div
                  key={item.id || idx}
                  className="p-6 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors flex flex-col justify-between group relative"
                  variants={cardVariants}
                >
                  <Link href={`/${slug}/product/${item.id}`} className="block h-full flex flex-col justify-between">
                    <div>
                      {/* IMAGE MATRIX CONTAINER */}
                      <div className="relative w-full aspect-[16/10] border border-gray-200 p-1 mb-6 bg-gray-50">
                        <div className="absolute top-1 left-1 bg-white text-[8px] font-mono font-black uppercase px-1.5 py-0.5 z-20 border-r border-b border-gray-100 text-gray-500">
                          RAW_FEED // {hexIndex}
                        </div>
                        
                        {(item.isOnOffer || item.isNewArrival) && (
                          <span className="absolute top-1 right-1 px-2 py-0.5 text-[8px] font-mono font-black uppercase text-white z-20" style={{ backgroundColor: primaryColor }}>
                            {item.isOnOffer ? 'MARKDOWN' : 'NEW_ALLOCATION'}
                          </span>
                        )}
                        
                        <div className="relative w-full h-full overflow-hidden grayscale filter contrast-[1.04]">
                          <Image
                            src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop'}
                            loader={imageLoader}
                            alt={item.name}
                            fill
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>

                      {/* FIELD DATA SPECS */}
                      <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                        <ItemIcon className="w-3 h-3 stroke-[2]" />
                        <span>{item.tags?.[0] || 'UNCLASSIFIED'}</span>
                      </div>

                      <h3 className="text-sm font-mono font-black uppercase tracking-tight text-gray-900 mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      
                      <p className="text-xs font-mono text-gray-400 leading-relaxed mb-6 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* PRICING & CALL-TO-ACTION STRIP */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div className="font-mono">
                        <span className="block text-[8px] text-gray-300 font-bold uppercase leading-none mb-0.5">VAL_UNIT_USD</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatPrice(item.finalPrice || 0)}
                        </span>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-wider py-2 px-3 border border-gray-200 text-gray-400 group-hover:text-gray-900 group-hover:border-gray-900 transition-colors">
                        Queue Quote
                        <ShoppingCartIcon className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* TELEMETRY ARCHIVE MASTER DISPATCH ROUTE */}
          <motion.div 
            className="mt-16 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col gap-1 text-left w-full md:w-auto">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">REGISTRY_STREAM_ACCESS</span>
              <p className="text-xs font-mono text-gray-400">Query complete secure procurement manifests.</p>
            </div>

            <Link
              href={`/${slug}/products`}
              className="inline-flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider py-4 px-8 text-white transition-opacity w-full md:w-auto justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              Access Global Registry Index
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </section>
    </AnimatePresence>
  );
}