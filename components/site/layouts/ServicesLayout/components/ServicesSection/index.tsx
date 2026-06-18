'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRightIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  CheckIcon,
  TicketIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import BookingFormModal from "../BookingFormModal"; 
import { MarketListingForm } from "@/types/typings";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

interface ServicesSectionProps {
  marketplaceListings: MarketListingForm[];
  themeSettings: any;
  slug: string;
}

export default function ServicesSpotlightDeck({ 
  marketplaceListings, 
  themeSettings, 
  slug 
}: ServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<MarketListingForm | null>(null);

  if (!marketplaceListings || marketplaceListings.length === 0) return null;

  const primaryColor = themeSettings?.primaryColor ?? "#10b981"; 

  // Frame transition physics
  const transitionPreset = { duration: 0.7, ease: [0.16, 1, 0.3, 1] };

  return (
    <section className="relative w-full py-24 sm:py-32 bg-white dark:bg-gray-950 text-gray-950 dark:text-white overflow-hidden">
      
      {/* Background Ambience Gradients */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-gray-100 dark:bg-gray-900/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 dark:bg-neutral-900/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Dynamic Structural Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
              <SparklesIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>Bespoke Offerings</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-[0.95]">
              Curated <br />
              <span className="font-light italic tracking-normal text-gray-400 dark:text-gray-500">Experiences.</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed font-normal">
            A meticulous collection of signature items structured explicitly around your high standards. Select an entry to review parameters.
          </p>
        </div>

        {/* Asymmetric Kinetic Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {marketplaceListings.map((service, index) => {
            // Determine structural layout column span to break standard grid boxes
            const isLargeSpan = index % 3 === 0;
            const columnSpan = isLargeSpan ? "md:col-span-8" : "md:col-span-4";
            const rowHeight = isLargeSpan ? "min-h-[480px] lg:min-h-[560px]" : "min-h-[380px] lg:min-h-[460px]";

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                onClick={() => setSelectedService(service)}
                className={`group relative ${columnSpan} ${rowHeight} rounded-3xl overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-sm flex flex-col justify-end p-8 lg:p-12 transition-all duration-500 hover:border-gray-200 dark:hover:border-gray-700`}
              >
                {/* Image Composition Layer with Micro Parallax Zoom */}
                <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                  <Image
                    src={service.images?.[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"}
                    alt={service.name}
                    loader={loader}
                    fill
                    className="object-cover opacity-60 dark:opacity-40 transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
                  />
                  {/* Clean Shadow Gradient Isolation Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 dark:from-black/95 dark:via-black/50 to-transparent mix-blend-multiply" />
                </div>

                {/* Card Context Data Overlay */}
                <div className="relative z-10 w-full text-white">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5">
                      {service.category || "Premium Class"}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <StarIconSolid className="w-3.5 h-3.5" />
                      <span>4.9</span>
                    </div>
                  </div>

                  <h3 className={`font-black tracking-tight uppercase leading-none group-hover:text-gray-200 transition-colors ${isLargeSpan ? 'text-2xl sm:text-4xl max-w-xl' : 'text-xl sm:text-2xl'}`}>
                    {service.name}
                  </h3>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base Rate</p>
                      <p className="text-xl font-serif font-medium mt-0.5" style={{ color: primaryColor }}>
                        ${(service.finalPrice ?? service.sellingPrice ?? 0).toFixed(0)}
                      </p>
                    </div>

                    <div className="h-10 w-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:scale-110">
                      <ArrowUpRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cinematic Right-Side Sheet Overlap Layout Container */}
      <AnimatePresence>
        {selectedService && (
          <>
            {/* Dark Sheet Dimmer Matte */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-gray-950/40 backdrop-blur-md z-[100]"
            />

            {/* Expansive Sliding Context Sheet Component */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={transitionPreset}
              className="fixed top-0 right-0 h-full w-full max-w-5xl bg-white dark:bg-gray-900 z-[101] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Column Section: High Impact Background Artwork Visuals */}
              <div className="relative w-full md:w-5/12 h-[30vh] md:h-full bg-gray-100 dark:bg-gray-950 overflow-hidden">
                <Image
                  src={selectedService.images?.[0] || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"}
                  alt={selectedService.name}
                  loader={loader}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white dark:from-gray-900 via-transparent to-transparent pointer-events-none z-10" />
                
                {/* Floating Escape Controller Button */}
                <button 
                  onClick={() => setSelectedService(null)}
                  className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column Section: Information Fields Content Architecture */}
              <div className="w-full md:w-7/12 h-[70vh] md:h-full overflow-y-auto flex flex-col p-8 sm:p-12 lg:p-16 custom-scrollbar bg-white dark:bg-gray-900">
                
                {/* Structural Category Details Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    <span>{selectedService.category || "Bespoke Assignment Package"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> 2-3 Hours Estimated</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
                    {selectedService.name}
                  </h3>
                </div>

                {/* Package Core Narrative Column */}
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal mb-8">
                  {selectedService.description || "An optimized operational suite framework tailored perfectly to streamline complex targets while maintaining unmatched luxury production characteristics."}
                </p>

                {/* Dynamic Sequence Map Tracker Workflow Panel */}
                <div className="mb-10 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Execution Lifecycle Timeline</h4>
                  <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
                    {[
                      { step: "01", name: "Consult" },
                      { step: "02", name: "Schedule" },
                      { step: "03", name: "Process" },
                      { step: "04", name: "Fulfill" }
                    ].map((phase, idx) => (
                      <div key={idx} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 flex-1 w-full">
                        <div className="text-xs font-mono font-bold px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm">
                          {phase.step}
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">{phase.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Premium Feature Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  {["All materials included", "Elite priority handling", "Full structural insurance", "Post-process metrics report"].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      <div className="h-5 w-5 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 text-emerald-500 shrink-0">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Dynamic Billing Form Mounting Element */}
                <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Investment Matrix Estimate</span>
                    <span className="text-3xl font-serif font-medium text-gray-900 dark:text-white mt-1 block">
                      ${(selectedService.finalPrice ?? selectedService.sellingPrice ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {/* Mounting context target component directly passes through data object cleanly */}
                    <BookingFormModal service={selectedService} />
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}