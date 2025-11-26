'use client';

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  SparklesIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { IPromotion } from "@/types/typings";

// --- UTILS ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const resolveIcon = (iconName?: string) => {
  const icons: any = {
    SparklesIcon,
    PuzzlePieceIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    ChartBarIcon
  };
  return icons[iconName || ''] || SparklesIcon;
};

// --- DATA ---
const defaultPerks = [
  { 
    id: "1", 
    title: "Premium Quality", 
    icon: 'SparklesIcon', 
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    description: "Every detail matters. We enforce uncompromising standards to ensure your brand resonates with absolute clarity." 
  },
  { 
    id: "2", 
    title: "Strategic Roadmap", 
    icon: 'PuzzlePieceIcon', 
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    description: "We don't guess; we engineer. Your unique challenges require bespoke strategies, not templates." 
  },
  { 
    id: "3", 
    title: "Reliable Execution", 
    icon: 'CheckCircleIcon', 
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    description: "Time is your most valuable asset. We respect it by delivering on our promises, every single time." 
  },
  { 
    id: "4", 
    title: "Continuous Innovation", 
    icon: 'RocketLaunchIcon', 
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    description: "Stagnation is failure. We employ a cyclical process of improvement to keep you ahead of the market." 
  },
];

interface ExcellenceSectionProps {
  slug: string;
  themeSettings: any;
  promotions: IPromotion[];
}


export default function ExcellenceHorizonLight({ slug, themeSettings, promotions }: ExcellenceSectionProps) {
  const [activeId, setActiveId] = useState<string | null>("1"); 
  const promotion: IPromotion | null = promotions && promotions.length > 0 ? promotions[0] : null;
  const primaryColor = themeSettings?.primaryColor || "#6366f1"; 

  // Merge Data
  const perks = promotion?.perks?.length && promotion?.perks.length > 0
      ? promotion.perks.map((p, i) => ({
          id: p.id,
          title: p.label,
          icon: p.icon || defaultPerks[i]?.icon, 
          description: defaultPerks[i]?.description,
          image: defaultPerks[i]?.image 
        }))
      : defaultPerks;

  return (
    // Background: Bright White/Off-White
    <section className="relative py-24 bg-white text-gray-900 overflow-hidden border-t border-gray-100">
        
       {/* Subtle Background Gradient (for depth) */}
       <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white pointer-events-none" />
       
       <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-2xl mb-16"
          >
             <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-gray-900 mb-6">
                {promotion?.title || "The Art of Excellence"}
             </h2>
             <div className="h-1 w-20 mx-auto rounded-full mb-6" style={{ backgroundColor: primaryColor }} />
             <p className="text-gray-600 text-lg font-light leading-relaxed">
                {promotion?.description || "We believe that true quality is silent. It doesn't shout; it is felt. Explore the pillars that uphold our standard of work."}
             </p>
          </motion.div>

          {/* === THE HORIZONTAL ACCORDION === */}
          <div className="w-full h-[600px] flex flex-col md:flex-row gap-2 md:gap-4">
             {perks.map((perk) => {
                const Icon = resolveIcon(perk.icon);
                const isActive = activeId === perk.id;
                
                // Diagram Trigger Logic
                const showDiagram = isActive && (perk.title.toLowerCase().includes('innovation') || perk.title.toLowerCase().includes('process'));

                return (
                   <motion.div
                      key={perk.id}
                      layout
                      onClick={() => setActiveId(isActive ? null : perk.id)}
                      onMouseEnter={() => setActiveId(perk.id)}
                      // Card Styling: White background when collapsed, image reveal when active
                      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-in-out border border-gray-200 shadow-lg ${isActive ? 'flex-[3]' : 'flex-[0.5] hover:flex-[0.75] bg-white'}`}
                   >
                      {/* Background Image with Tint (Only visible/strong when active) */}
                      <div className="absolute inset-0 z-0">
                         <Image 
                            src={perk.image || defaultPerks[0].image}
                            alt={perk.title}
                            loader={loader}
                            fill
                            // Image is darker/more visible when active
                            className={`object-cover ${isActive ? 'opacity-80' : 'opacity-0'} grayscale transition-all duration-700`}
                         />
                         {/* White/Light Overlay, reduced opacity when active */}
                         <div className={`absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-90' : 'opacity-100'}`} />
                         
                         {/* Color Tint Overlay on Active */}
                         <div 
                            className="absolute inset-0 mix-blend-overlay transition-opacity duration-500"
                            style={{ backgroundColor: isActive ? primaryColor : 'transparent', opacity: isActive ? 0.4 : 0 }} 
                         />
                      </div>

                      {/* Content Container */}
                      <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                         
                         {/* Icon */}
                         <div className={`flex items-center gap-4 mb-4 ${isActive ? 'translate-y-0' : 'justify-center md:justify-start'}`}>
                            <div 
                              className={`p-3 rounded-full backdrop-blur-md border border-gray-300 transition-all duration-500`}
                              // Icon color is primary color when active, or dark gray when collapsed
                              style={{ 
                                  backgroundColor: isActive ? 'white' : 'white', 
                                  color: isActive ? primaryColor : '#4b5563', // gray-600
                                  borderColor: isActive ? primaryColor : '#d1d5db' // gray-300
                              }}
                            >
                               <Icon className="w-6 h-6" />
                            </div>
                            
                            <AnimatePresence>
                               {(!isActive) && (
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-lg font-bold uppercase tracking-widest text-gray-700 md:hidden"
                                  >
                                    {perk.title}
                                  </motion.span>
                               )}
                            </AnimatePresence>
                         </div>

                         {/* Active State Content */}
                         <AnimatePresence mode="wait">
                            {isActive && (
                               <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 20 }}
                                  transition={{ delay: 0.1, duration: 0.4 }}
                               >
                                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                     {perk.title}
                                  </h3>
                                  <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-xl mb-6">
                                     {perk.description}
                                  </p>

                                  {/* INSTRUCTIONAL DIAGRAM (Continuous Innovation) */}
                                  {showDiagram && (
                                     <div className="mb-6 p-4 rounded-xl bg-gray-100 border border-gray-200 backdrop-blur-sm max-w-md">
                                        <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                           <ChartBarIcon className="w-4 h-4 text-gray-500" />
                                           <span>Process Visualization</span>
                                        </div>
                                        <div className="relative w-full aspect-[2/1] flex items-center justify-center overflow-hidden rounded-lg bg-white">
                                            
                                            

                                             <Image   
                                                src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80"
                                                alt="Innovation Process Diagram"
                                                loader={loader}
                                                fill
                                                className="object-contain"
                                             />


                                        </div>
                                     </div>
                                  )}

                                  <Link 
                                    href={promotion?.ctaLink || `#contact`}
                                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900 hover:underline underline-offset-8 decoration-2"
                                    style={{ textDecorationColor: primaryColor }}
                                  >
                                     Learn More <ArrowRightIcon className="w-4 h-4" />
                                  </Link>
                               </motion.div>
                            )}
                         </AnimatePresence>
                      </div>

                      {/* Collapsed Vertical Text (Desktop Only) */}
                      {!isActive && (
                         <div className="absolute bottom-8 left-8 hidden md:block origin-bottom-left -rotate-90 translate-x-4">
                            <span className="text-xl font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                               {perk.title}
                            </span>
                         </div>
                      )}
                   </motion.div>
                );
             })}
          </div>

       </div>
    </section>
  );
}