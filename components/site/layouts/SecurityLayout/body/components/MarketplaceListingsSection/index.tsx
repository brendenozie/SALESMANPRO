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
    images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img1' }], tags: ['CCTV', 'Outdoor'], isOnOffer: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isFlashDeal: false, isNewArrival: false, isFeatured: true, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null, isDiscounted: false,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '2', name: 'Rugged Digital Walkie Talkie', finalPrice: 150.00, quantity: 120, isAvailable: true,
    description: 'Durable, waterproof two-way radio with extended battery life and secure, encrypted channels.',
    images: [{ url: 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img2' }], tags: ['Communication', 'Radio'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '3', name: 'Biometric Access Control Reader', finalPrice: 220.00, quantity: 30, isAvailable: true,
    description: 'High-speed fingerprint and RFID access reader for secure entry points and time-tracking.',
    images: [{ url: 'https://images.unsplash.com/photo-1590483321590-449e79391090?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img3' }], tags: ['Access Control', 'Biometric'], isNewArrival: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '4', name: 'High-Gain Mesh WiFi Extender', finalPrice: 99.00, quantity: 200, isAvailable: true,
    description: 'Extends coverage for wireless cameras and network devices across large commercial areas.',
    images: [{ url: 'https://images.unsplash.com/photo-1549497042-3a85b6a7a72d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img4' }], tags: ['Networking', 'Wireless'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '5', name: 'Commercial 32-Ch NVR', finalPrice: 1200.00, quantity: 15, isAvailable: true,
    description: 'Network Video Recorder supporting up to 32 cameras with 40TB expandable storage.',
    images: [{ url: 'https://images.unsplash.com/photo-1520697526685-c49c71c49603?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img5' }], tags: ['Storage', 'NVR'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '6', name: 'Heavy Duty Siren & Strobe', finalPrice: 85.00, quantity: 75, isAvailable: true,
    description: '120dB outdoor siren with bright strobe light for immediate intrusion deterrence.',
    images: [{ url: 'https://images.unsplash.com/photo-1528698827571-3c6b1ad4c556?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img6' }], tags: ['Alarm', 'Deterrence'], isDiscounted: true,
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
  {
    id: '7', name: 'Covert Mini Body Camera', finalPrice: 180.00, quantity: 90, isAvailable: true,
    description: 'Tiny, discreet camera with 8-hour battery and local SD card recording for surveillance.',
    images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img7' }], tags: ['Covert', 'Wearable'],
    duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  },
];

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 22 } },
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
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; 

  const allListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
    ? marketplaceListings.filter(item => item.isAvailable).slice(0, 7) 
    : defaultListings.slice(0, 7);

  if (allListings.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  };
  
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <AnimatePresence>
      <section 
        id="inventory" 
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-gray-50 text-gray-900 overflow-hidden border-b border-gray-100" 
        style={cssVars}
      >
        {/* BACKGROUND ACCENT ARCHITECTURE */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" />

        {/* HEADLINE MATRIX */}
        <div className="max-w-7xl mx-auto mb-20">
          <motion.div
            className="text-left max-w-3xl"
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Hardware Deployment
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              Essential Security Assets
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed">
              Browse professional-grade, high-performance security equipment validated for field infrastructure.
            </p>
          </motion.div>
        </div>

        {/* GRID UNIT */}
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {allListings.map((item, idx) => {
            const ItemIcon = getProductIcon(item.tags[0] || '');
            return (
              <motion.div
                key={item.id || idx}
                className="relative group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full"
                variants={cardVariants}
                whileHover={{ y: -4 }}
              >
                <Link href={`/${slug}/product/${item.id}`} className="flex flex-col h-full group-hover:no-underline">
                  
                  {/* IMAGE CONTEXT BOX */}
                  <div className="relative w-full h-56 bg-gray-100 overflow-hidden border-b border-gray-50">
                    <Image
                      src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop'}
                      loader={imageLoader}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={idx < 3}
                    />
                    
                    {/* CRISP DATA STATUS BADGES */}
                    {(item.isOnOffer || item.isNewArrival) && (
                      <span 
                        className={`absolute top-4 left-4 px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-white rounded-md shadow-sm ${
                          item.isOnOffer ? 'bg-red-500' : 'bg-gray-900'
                        }`}
                      >
                        {item.isOnOffer ? 'OFFER' : 'NEW'}
                      </span>
                    )}
                  </div>
                    
                  {/* HARDWARE DESCRIPTION METRICS */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-gray-400">
                        <ItemIcon className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: primaryColor }} />
                        <span>{item.tags?.[0] || 'Hardware Asset'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2 line-clamp-1 group-hover:text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* VALUATION INTERACTIVE COMPONENT */}
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 leading-none mb-1">MSRP USD</span>
                        <p className="text-xl font-black tracking-tight text-gray-900">
                          ${formatPrice(item.finalPrice || 0)}
                        </p>
                      </div>
                      
                      <div 
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          color: '#111827',
                        }}
                      >
                        <span className="group-hover:text-black">Request Quote</span>
                        <ShoppingCartIcon className="w-3.5 h-3.5 text-gray-500 group-hover:text-black transition-transform duration-200 group-hover:scale-105" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* EXTERNAL CORE CATALOG CTA */}
        <div className="text-center mt-20">
          <Link href={`/${slug}/products`}>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 font-bold tracking-wide text-xs uppercase px-8 py-4 rounded-xl text-white shadow-md"
              style={{ 
                backgroundColor: primaryColor, 
                boxShadow: `0 6px 20px -4px ${primaryColor}30`,
              }}
            >
              Analyze Complete Lineup
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </div>

      </section>
    </AnimatePresence>
  );
}