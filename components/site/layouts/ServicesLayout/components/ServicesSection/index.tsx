"use client";

import React, { useState } from "react";
import { 
  ArrowLongRightIcon, 
  XMarkIcon, 
  CalendarDaysIcon, 
  TagIcon,
  SparklesIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import BookingFormModal from "../BookingFormModal";
import Link from "next/link";
import { MarketListingForm } from "@/types/typings";

// --- UTILS ---
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// --- SUB-COMPONENTS ---

// 1. The "Premium" Service Card (Grid Item)
const ServiceCard = ({ service, onClick, primaryColor, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      onClick={() => onClick(service)}
      className="group cursor-pointer relative flex flex-col h-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500"
    >
      {/* Image Container with organic shape mask (optional feel) */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={service.images[0] || "/placeholder-service.jpg"}
          alt={service.name}
          loader={loader}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Floating Price Tag */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 z-10">
           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">From</span>
           <span className="font-serif font-bold text-gray-900 dark:text-white" style={{ color: primaryColor }}>
             {(service.finalPrice ?? 0).toFixed(0)}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow relative">
        {/* Category Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-white/10 w-fit">
          <TagIcon className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">
            {service.category || "Service"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[var(--primary)] transition-colors duration-300" style={{ '--primary': primaryColor } as React.CSSProperties}>
          {service.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6">
           {service.description || "Experience premium quality tailored to your specific needs."}
        </p>

        <div className="mt-auto pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
           <div className="flex -space-x-2 overflow-hidden">
              {/* Fake Avatars for Social Proof feel */}
              {[1,2,3].map(i => (
                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200" />
              ))}
              <span className="h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-gray-500 ml-2">
                +24
              </span>
           </div>
           
           <span className="group/btn flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3" style={{ color: primaryColor }}>
             Book Now <ArrowLongRightIcon className="w-4 h-4" />
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

  if (!marketplaceListings || marketplaceListings.length === 0) return null;

  const primaryColor = themeSettings?.primaryColor ?? "#000000";
  // const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  const featuredService = marketplaceListings[0];
  const otherServices = marketplaceListings.slice(1);

  return (
    <>
      <section id="services" className="relative bg-[#FAFAFA] dark:bg-gray-950 py-24 lg:py-32 overflow-hidden">
        
        {/* --- ABSTRACT BACKGROUND SHAPES --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-gray-200/40 to-transparent dark:from-white/5 rounded-full blur-3xl opacity-50" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-gray-200/40 to-transparent dark:from-white/5 rounded-full blur-3xl opacity-50" />
           {/* Dot Grid Pattern */}
           <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50 dark:opacity-5" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 text-xs font-bold uppercase tracking-widest mb-6"
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
                 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight"
              >
                Exceptional <br />
                <span className="font-serif italic text-gray-400 dark:text-gray-600">Services.</span>
              </motion.h2>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-xs text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed"
            >
              Explore our hand-picked selection of premium services designed to elevate your lifestyle and deliver outstanding results.
            </motion.p>
          </div>


          {/* --- 1. FEATURED SPOTLIGHT (Magazine Style) --- */}
          {featuredService && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group bg-white dark:bg-gray-900 rounded-[2.5rem] p-3 md:p-4 shadow-2xl shadow-gray-200/50 dark:shadow-none mb-24 overflow-hidden border border-gray-100 dark:border-white/10"
            >
              <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 aspect-[4/3] md:aspect-[21/9]">
                <Image
                  src={featuredService.images[0] || "/placeholder-service.jpg"}
                  alt={featuredService.name}
                  loader={loader}
                  fill
                  className="object-cover opacity-90 transition-transform duration-[1.5s] group-hover:scale-105"
                />
                
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
                   <div className="mb-6">
                      <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                        <StarIconSolid className="w-3 h-3 text-yellow-400" />
                        Signature Selection
                      </div>
                      <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        {featuredService.name}
                      </h3>
                      <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed mb-8 line-clamp-3">
                        {featuredService.description || "Unlock the full potential of your project with our signature service. Designed for impact and tailored to perfection."}
                      </p>
                   </div>

                   <div className="flex flex-wrap items-center gap-6">
                      <button
                        onClick={() => setSelectedService(featuredService)}
                        className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-sm tracking-wide transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        Book Appointment
                        <ArrowLongRightIcon className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-4 text-white/80 border-l border-white/20 pl-6">
                        <div>
                           <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Price</p>
                           <p className="text-xl font-serif">{(featuredService.finalPrice ?? 0).toFixed(2)}</p>
                        </div>
                        {featuredService.duration && (
                          <div>
                             <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Duration</p>
                             <p className="text-xl font-serif">{featuredService.duration}</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
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
          <div className="mt-20 flex justify-center">
            <Link href={`/service-provider/products`} className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold transition-all hover:pr-10">
               View Complete Catalog
               <ArrowLongRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </section>


      {/* --- 3. REFINED PREMIUM MODAL --- */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl transition-opacity"
            />

            {/* Modal Card */}
            <motion.div
              layoutId={`${selectedService.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               {/* Close Button */}
               <button 
                 onClick={() => setSelectedService(null)}
                 className="absolute top-4 right-4 z-30 p-2 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/50 rounded-full backdrop-blur-md transition-all border border-transparent hover:border-gray-200"
               >
                  <XMarkIcon className="w-5 h-5 text-gray-900 dark:text-white" />
               </button>

               {/* Left: Immersive Image Panel */}
               <div className="w-full md:w-[45%] h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={selectedService.images[0] || "/placeholder-service.jpg"}
                    alt={selectedService.name}
                    loader={loader}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Overlay Info (Mobile only or always visible) */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                     <h3 className="text-3xl font-bold text-white mb-2">{selectedService.name}</h3>
                     <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
                        <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" /> 4.9 (120 Reviews)</span>
                     </div>
                  </div>
               </div>

               {/* Right: Interaction Panel */}
               <div className="w-full md:w-[55%] flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
                  
                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                     <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{selectedService.category || "Service"}</span>
                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md">Available Now</span>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-4 mb-8">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[140px]">
                           <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Total Price</span>
                           <span className="text-2xl font-serif font-bold" style={{ color: primaryColor }}>
                             {(selectedService.finalPrice ?? 0).toFixed(2)}
                           </span>
                        </div>
                        {selectedService.duration && (
                          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1 min-w-[140px]">
                             <span className="block text-xs text-gray-400 uppercase font-bold mb-1">Duration</span>
                             <span className="text-xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
                                {selectedService.duration}
                             </span>
                          </div>
                        )}
                     </div>

                     <div className="prose prose-sm dark:prose-invert prose-gray max-w-none">
                        <h4 className="text-gray-900 dark:text-white font-bold mb-2">About this service</h4>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                           {selectedService.description || "This premium service includes a full consultation, execution by senior specialists, and a satisfaction guarantee. We ensure every detail is met with precision and care."}
                        </p>
                        
                        <h4 className="text-gray-900 dark:text-white font-bold mt-6 mb-2">What's Included</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none pl-0">
                           {["Consultation", "Premium Materials", "Expert Execution", "Aftercare Support"].map((item, i) => (
                             <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {item}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>

                  {/* Fixed Bottom Action Area */}
                  <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                     <BookingFormModal service={selectedService} />
                     <p className="text-center text-xs text-gray-400 mt-3">
                        No payment required until service completion.
                     </p>
                  </div>
               </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}