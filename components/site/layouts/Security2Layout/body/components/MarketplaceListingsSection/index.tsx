'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ShoppingCartIcon,
  CameraIcon, 
  WifiIcon, // For Networked devices
  RadioIcon, 
  FingerPrintIcon, // For Biometric
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';
// Assuming useStoreContext, MarketListingForm are imported correctly

// Loader for Next.js Image component
const imageLoader = ({ src, width, quality }: any) => {
 return `${src}?w=${width}&q=${quality || 75}`;
};

// --- EXPANDED PHYSICAL SECURITY PRODUCT FALLBACK DATA (7 items) ---
const defaultListings: MarketListingForm[] = [
 {
   id: '1', name: '4K Ultra-HD Dome Camera', finalPrice: 450.00, quantity: 50, isAvailable: true,
   description: 'Vandal-proof indoor/outdoor camera with 100ft night vision and advanced AI detection.',
   images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img1' }], tags: ['CCTV', 'Outdoor'], isOnOffer: true,
   // ... Minimal required MarketListingForm fields set to defaults or null
   duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isFlashDeal: false, isNewArrival: false, isFeatured: true, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null,
   isDiscounted: false
 },
 {
  id: '2', name: 'Rugged Digital Walkie Talkie', finalPrice: 150.00, quantity: 120, isAvailable: true,
  description: 'Durable, waterproof two-way radio with extended battery life and secure, encrypted channels.',
  images: [{ url: 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img2' }], tags: ['Communication', 'Radio'],
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
 {
  id: '3', name: 'Biometric Access Control Reader', finalPrice: 220.00, quantity: 30, isAvailable: true,
  description: 'High-speed fingerprint and RFID access reader for secure entry points and time-tracking.',
  images: [{ url: 'https://images.unsplash.com/photo-1590483321590-449e79391090?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img3' }], tags: ['Access Control', 'Biometric'], isNewArrival: true,
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
 {
  id: '4', name: 'High-Gain Mesh WiFi Extender', finalPrice: 99.00, quantity: 200, isAvailable: true,
  description: 'Extends coverage for wireless cameras and network devices across large commercial areas.',
  images: [{ url: 'https://images.unsplash.com/photo-1549497042-3a85b6a7a72d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img4' }], tags: ['Networking', 'Wireless'], 
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
 {
  id: '5', name: 'Commercial 32-Ch NVR', finalPrice: 1200.00, quantity: 15, isAvailable: true,
  description: 'Network Video Recorder supporting up to 32 cameras with 40TB expandable storage.',
  images: [{ url: 'https://images.unsplash.com/photo-1520697526685-c49c71c49603?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img5' }], tags: ['Storage', 'NVR'], 
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
 {
  id: '6', name: 'Heavy Duty Siren & Strobe', finalPrice: 85.00, quantity: 75, isAvailable: true,
  description: '120dB outdoor siren with bright strobe light for immediate intrusion deterrence.',
  images: [{ url: 'https://images.unsplash.com/photo-1528698827571-3c6b1ad4c556?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img6' }], tags: ['Alarm', 'Deterrence'], isDiscounted: true,
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
 {
  id: '7', name: 'Covert Mini Body Camera', finalPrice: 180.00, quantity: 90, isAvailable: true,
  description: 'Tiny, discreet camera with 8-hour battery and local SD card recording for surveillance.',
  images: [{ url: 'https://images.unsplash.com/photo-1627918739947-6b19888d3632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', id: 'img7' }], tags: ['Covert', 'Wearable'], 
  // ... Minimal required MarketListingForm fields set to defaults or null
  duration: undefined, productCategoryId: '', subCategory: undefined, option: [], color: [], size: [], weight: [], material: [], buyingPrice: 0, sellingPrice: 0, pricingTiers: [], isOnOffer: false, isFlashDeal: false, isNewArrival: true, isDiscounted: false, isFeatured: false, bedrooms: [], studios: [], features: [], bookingSlots: [], requiredClientInfo: [], amenities: [], delivery: true, paymentOption: 'QUOTE', status: 'ACTIVE', location: null
 },
];
// --- END FALLBACK DATA ---

// Framer Motion variants
const headerVariants = {
 hidden: { opacity: 0, y: 30 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const cardContainerVariants = {
 hidden: { opacity: 0 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.1, // Stagger less for a faster full grid reveal
   delayChildren: 0.2,
  },
 },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
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

// Helper to determine the main tag/type icon
const getProductIcon = (tag: string): React.ElementType => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('cctv') || lowerTag.includes('camera')) return CameraIcon;
    if (lowerTag.includes('radio') || lowerTag.includes('communication')) return RadioIcon;
    if (lowerTag.includes('biometric') || lowerTag.includes('access')) return FingerPrintIcon;
    if (lowerTag.includes('network') || lowerTag.includes('wifi') || lowerTag.includes('nvr')) return WifiIcon;
    return CameraIcon;
}


export default function MarketplaceListingsSection({ name, slug, themeSettings, marketplaceListings }: MarketplaceListingsSectionProps) {
 
 // Keeping the Light Mode Deep Blue aesthetic
  const primaryColor = themeSettings?.primaryColor || '#0056B3'; // Deep Blue (Primary)
 const secondaryColor = themeSettings?.secondaryColor || '#007BFF'; // Standard Blue (Accent)

 // --- Data Processing Logic ---
 const allListings: MarketListingForm[] = Array.isArray(marketplaceListings) && marketplaceListings.length > 0
  ? marketplaceListings.filter(item => item.isAvailable).slice(0, 7) // Limit to 7 items
  : defaultListings.slice(0, 7); // Use 7 default items

 if (allListings.length === 0) {
  return null; 
 }

 const formatPrice = (price: number) => {
   return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);
 };
  
 const cssVars = {
  '--primary': primaryColor,
  '--secondary': secondaryColor,
 } as React.CSSProperties;


 return (
  <AnimatePresence>
   <section id="inventory" className="relative py-24 md:py-32 px-6 lg:px-12 bg-gray-50 text-gray-900 overflow-hidden" style={cssVars}>
    
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
      Featured Hardware Inventory
     </p>
     <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
      Essential <span style={{ color: primaryColor }}>Security Products</span>
     </h2>
     <p className="mt-4 text-xl text-gray-600">
      Browse our top-selling, high-performance security equipment trusted by professionals.
     </p>
    </motion.div>

    {/* --- 3-COLUMN PRODUCT GRID --- */}
    <motion.div
     className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
     variants={cardContainerVariants}
     initial="hidden"
     whileInView="visible"
     viewport={{ once: true, amount: 0.1 }}
    >
     {allListings.map((item, idx) => {
                const ItemIcon = getProductIcon(item.tags[0] || '');
                return (
       <motion.div
        key={item.id || idx}
        className="relative group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        variants={cardVariants}
       >
                <Link href={`/${slug}/product/${item.id}`} className="block">
                  {/* Image Container with Badge */}
         <div className="relative w-full h-48 bg-gray-200">
          <Image
           src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1594917534599-4c275997237e?q=80&w=2670&auto=format&fit=crop'}
           loader={imageLoader}
           alt={item.name}
           fill
           className="object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
                      {/* Status Badge */}
                      {(item.isOnOffer || item.isNewArrival) && (
                          <span 
                            className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold text-white uppercase rounded-full shadow-md ${
                              item.isOnOffer ? 'bg-red-600' : 'bg-green-500'
                            }`}
                          >
                            {item.isOnOffer ? 'Sale' : 'New'}
                          </span>
                      )}
         </div>
                  
                  {/* Product Details */}
         <div className="p-5 flex flex-col justify-between h-[calc(100%-12rem)]">
          <div>
           <div className="text-xs font-semibold uppercase mb-1 flex items-center gap-1 text-gray-500">
                          <ItemIcon className="w-4 h-4" />
                          {item.tags?.[0] || 'Hardware'}
                      </div>
           <h3 className="text-xl font-bold mb-2 leading-snug text-gray-900 line-clamp-2">
            {item.name}
           </h3>
           <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {item.description}
           </p>
          </div>

                    {/* Price and CTA */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
           <p className="text-2xl font-extrabold" style={{ color: primaryColor }}>
            {formatPrice(item.finalPrice || 0)}
           </p>
           <div 
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-300 hover:ring-4 hover:ring-opacity-50"
            style={
              {
                backgroundColor: secondaryColor,
                color: '#fff',
                boxShadow: `0 4px 10px -2px ${secondaryColor}60`,
                ['--tw-ring-color' as any]: secondaryColor
              } as React.CSSProperties
            }
           >
            Add to Quote
                        <ShoppingCartIcon className="w-4 h-4" />
           </div>
          </div>
         </div>
                </Link>
       </motion.div>
      );
            })}
    </motion.div>

    {/* Footer CTA */}
    <div className="text-center mt-16">
     <Link
      href={`/${slug}/products`}
      className="inline-flex items-center gap-3 text-lg font-bold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-[1.03] shadow-xl text-white border-2 border-transparent"
      style={{ backgroundColor: primaryColor, boxShadow: `0 8px 20px -5px ${primaryColor}80` }}
     >
      Explore Full 70+ Product Catalog
      <ArrowRightIcon className="w-5 h-5 ml-1" />
     </Link>
    </div>

   </section>
  </AnimatePresence>
 );
}