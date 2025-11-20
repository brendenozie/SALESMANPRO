"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLongRightIcon, 
  XMarkIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  TagIcon,
  SparklesIcon 
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BookingFormModal from "../BookingFormModal";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";

// --- UTILS ---
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// --- SUB-COMPONENTS ---

// 1. The Service Card (Grid Item)
const ServiceCard = ({ service, onClick, primaryColor, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      onClick={() => onClick(service)}
      className="group cursor-pointer flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 relative"
    >
      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={service.images[0] || "/placeholder-service.jpg"}
          alt={service.name}
          loader={loader}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        
        {/* Price Tag Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
           <span className="text-xs font-bold uppercase tracking-wider text-gray-500">From</span>
           <span className="font-serif font-bold text-gray-900 dark:text-white" style={{ color: primaryColor }}>
             {(service.finalPrice ?? 0).toFixed(0)}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[var(--primary)] transition-colors" style={{ '--primary': primaryColor } as React.CSSProperties}>
            {service.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
             {service.description || "Experience premium quality tailored to your specific needs."}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
           <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <TagIcon className="w-4 h-4" />
              {service.category || "Service"}
           </div>
           <span className="flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-1" style={{ color: primaryColor }}>
              Details <ArrowLongRightIcon className="w-4 h-4" />
           </span>
        </div>
      </div>
    </motion.div>
  );
};


// --- MAIN COMPONENT ---

interface ServicesSectionProps {
  marketplaceListings: MarketListingForm[];
  themeSettings: any;
  slug: string;
}

export default function ServicesSection({ marketplaceListings, themeSettings, slug }: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<MarketListingForm | null>(null);

  // Ensure we have listings
  if (!marketplaceListings || marketplaceListings.length === 0) return null;

  const primaryColor = themeSettings?.primaryColor ?? "#000000";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  // Split Featured vs Others
  const featuredService = marketplaceListings[0];
  const otherServices = marketplaceListings.slice(1);

  return (
    <>
      <section id="services" className="relative bg-gray-50 dark:bg-gray-950 py-24 lg:py-32 overflow-hidden">
        
        {/* --- BACKGROUND --- */}
        <div className="absolute inset-0 pointer-events-none">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
             <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white dark:from-gray-950 to-transparent" />
             <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          
          {/* --- HEADER --- */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: primaryColor }}
            >
              <SparklesIcon className="w-4 h-4" />
              Curated Collection
            </motion.div>
            
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               viewport={{ once: true }}
               className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Exceptional services for <br />
              <span className="bg-clip-text"
                style={{ 
                  // backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  color: primaryColor
                 }}
              >
                 exceptional results.
              </span>
            </motion.h2>
          </div>


          {/* --- 1. FEATURED SPOTLIGHT (The Hero Card) --- */}
          {featuredService && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 mb-24"
            >
              {/* Left: Image */}
              <div className="relative min-h-[400px] lg:min-h-[500px] w-full group overflow-hidden">
                <Image
                  src={featuredService.images[0] || "/placeholder-service.jpg"}
                  alt={featuredService.name}
                  loader={loader}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                
                {/* Mobile Overlay Text */}
                <div className="absolute bottom-6 left-6 lg:hidden text-white">
                   <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-bold uppercase tracking-wider">Featured</span>
                </div>
              </div>

              {/* Right: Content */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                 <div className="mb-2 hidden lg:block">
                   <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold uppercase tracking-wider text-gray-500">Featured Selection</span>
                 </div>
                 
                 <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                   {featuredService.name}
                 </h3>
                 
                 <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                   {featuredService.description || "Unlock the full potential of your project with our signature service. Designed for impact and tailored to perfection."}
                 </p>

                 <div className="flex flex-wrap items-center gap-8 mb-10">
                    <div>
                       <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Price</p>
                       <p className="text-3xl font-serif font-medium" style={{ color: primaryColor }}>
                         {(featuredService.finalPrice ?? 0).toFixed(2)}
                       </p>
                    </div>
                    {featuredService.duration && (
                      <div>
                         <p className="text-sm text-gray-400 uppercase tracking-wide font-bold">Duration</p>
                         <p className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5" /> {featuredService.duration}
                         </p>
                      </div>
                    )}
                 </div>

                 <button
                    onClick={() => setSelectedService(featuredService)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                    style={{ backgroundColor: primaryColor }}
                 >
                    Book Appointment
                    <ArrowLongRightIcon className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          )}


          {/* --- 2. THE CATALOG GRID --- */}
          {otherServices.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherServices.map((service, idx) => (
                   <ServiceCard 
                      key={service.id} 
                      index={idx}
                      service={service} 
                      onClick={setSelectedService} 
                      primaryColor={primaryColor} 
                   />
                ))}
             </div>
          )}
          
          {/* View All Link */}
          <div className="mt-16 text-center">
            <Link href={`/service-provider/products`} className="inline-flex items-center gap-2 text-lg font-bold border-b-2 border-transparent hover:border-current transition-all pb-1" style={{ color: primaryColor }}>
               View Complete Catalog
               <ArrowLongRightIcon className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>


      {/* --- 3. PREMIUM MODAL --- */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity"
            />

            {/* Modal Card */}
            <motion.div
              layoutId={`${selectedService.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               {/* Close Button */}
               <button 
                 onClick={() => setSelectedService(null)}
                 className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
               >
                  <XMarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
               </button>

               {/* Left: Image Gallery (Scrollable on Mobile) */}
               <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={selectedService.images[0] || "/placeholder-service.jpg"}
                    alt={selectedService.name}
                    loader={loader}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent md:hidden">
                     <h3 className="text-white font-bold text-xl">{selectedService.name}</h3>
                  </div>
               </div>

               {/* Right: Details & Booking */}
               <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
                  <div className="hidden md:block mb-6">
                     <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{selectedService.category || "Service"}</span>
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{selectedService.name}</h2>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                     <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="block text-xs text-gray-400 uppercase font-bold">Price</span>
                        <span className="text-xl font-serif font-bold" style={{ color: primaryColor }}>
                          {(selectedService.finalPrice ?? 0).toFixed(2)}
                        </span>
                     </div>
                     {selectedService.duration && (
                       <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                          <span className="block text-xs text-gray-400 uppercase font-bold">Time</span>
                          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                            {selectedService.duration}
                          </span>
                       </div>
                     )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm md:text-base">
                     {selectedService.description || "This premium service includes a full consultation, execution by senior specialists, and a satisfaction guarantee."}
                  </p>

                  <div className="mt-auto">
                    <BookingFormModal service={selectedService} />
                  </div>
               </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}