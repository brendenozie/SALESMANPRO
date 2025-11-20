'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  SparklesIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import { IPromotion } from "@/types/typings";

// --- TYPES & UTILS ---

// interface IPromotion {
//   title?: string;
//   description?: string;
//   bannerUrl?: string;
//   featureImage1?: string;
//   ctaText?: string;
//   ctaLink?: string;
//   perks?: Array<{ id: string; label: string; icon?: string }>;
// }

interface ExcellenceSectionProps {
  slug: string;
  themeSettings: any;
  promotions: IPromotion[];
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// Simple icon resolver (You can expand this based on your library)
const resolveIcon = (iconName?: string) => {
  const icons: any = {
    SparklesIcon,
    PuzzlePieceIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
  };
  return icons[iconName || ''] || CheckCircleIcon;
};

// --- COMPONENTS ---

// A single feature card with hover effects
const FeatureCard = ({ title, description, icon: Icon, index, primaryColor }: any) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
    >
      {/* Hover Gradient Border Effect */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-opacity-10 transition-colors pointer-events-none"
           style={{ borderColor: primaryColor }}
      />

      <div className="flex items-start justify-between">
        <div 
          className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300"
          style={{ backgroundColor: "var(--bg-color)" }}
        >
          {/* We use style specifically for the hover bg color injection */}
          <style jsx>{`
            .group:hover .icon-bg-${index} {
              background-color: ${primaryColor} !important;
              color: white !important;
            }
          `}</style>
          <div className={`icon-bg-${index} p-2 rounded-xl transition-colors duration-300`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <span className="text-4xl font-bold opacity-5 font-serif select-none">0{index + 1}</span>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function ExcellenceSection({ slug, themeSettings, promotions }: ExcellenceSectionProps) {
  const promotion: IPromotion | null = promotions && promotions.length > 0 ? promotions[0] : null;

  const primaryColor = themeSettings?.primaryColor || "#000000";
  const secondaryColor = themeSettings?.secondaryColor || "#FFB300";
  
  const featureImage = promotion?.bannerUrl ?? promotion?.featureImage1 ?? themeSettings?.aboutImage ?? "https://via.placeholder.com/600x800";

  // Default Perks Data
  const defaultPerks = [
    { id: "1", title: "Unrivaled Quality", icon: 'SparklesIcon', description: "Every detail is scrutinized to meet the highest global standards." },
    { id: "2", title: "Tailored Solutions", icon: 'PuzzlePieceIcon', description: "We adapt entirely to your specific requirements and goals." },
    { id: "3", title: "Swift Reliability", icon: 'CheckCircleIcon', description: "Consistent performance delivered exactly when you need it." },
    { id: "4", title: "Forward Innovation", icon: 'RocketLaunchIcon', description: "Utilizing the latest methodologies to keep you ahead." },
  ];

  const perks = promotion?.perks?.length && promotion?.perks.length > 0
      ? promotion.perks.map((p, i) => ({
          id: p.id,
          title: p.label,
          icon: p.icon || defaultPerks[i]?.icon, 
          description: defaultPerks[i]?.description // Using default descriptions for layout fullness if dynamic ones are missing
        }))
      : defaultPerks;

  return (
    <section className="relative py-24 lg:py-32 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* --- BACKGROUND TEXTURE --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
           style={{ backgroundColor: primaryColor }} />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
             <span className="h-[2px] w-12" style={{ backgroundColor: primaryColor }} />
             <span className="text-sm font-bold tracking-widest uppercase text-gray-500">Our Promise</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1]"
          >
            {promotion?.title || "Excellence isn't an act, it's a "}
            <span className="relative whitespace-nowrap text-transparent bg-clip-text" 
                  style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                {promotion?.title ? "" : " habit."}
            </span>
          </motion.h2>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: The Anchor Image (Portrait) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-4 relative min-h-[400px] lg:min-h-full rounded-3xl overflow-hidden shadow-2xl group"
          >
            <Image
              src={featureImage}
              alt="Excellence Feature"
              loader={loader}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Floating Stat Card Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
                        <TrophyIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Award Winning</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Service of the Year</p>
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Right: The Feature Grid */}
          <div className="lg:col-span-8">
             <motion.div 
               initial="hidden"
               whileInView="visible"
               variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
               viewport={{ once: true }}
               className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full"
             >
               {perks.map((perk, idx) => (
                 <div key={perk.id} className="h-full">
                   <FeatureCard 
                      index={idx}
                      title={perk.title}
                      description={perk.description}
                      icon={resolveIcon(perk.icon)}
                      primaryColor={primaryColor}
                   />
                   {/* Instructional Diagram Trigger:
                       If we are talking about "Innovation" or "Forward Thinking", 
                       a process cycle diagram is often helpful context. */}
                   {perk.title.toLowerCase().includes('forward') && (
                      <span className="hidden">

{/* [Image of continuous improvement cycle] */}
</span> 
                   )}
                 </div>
               ))}
             </motion.div>

             {/* CTA Area */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 flex justify-end"
             >
                <Link 
                  href={promotion?.ctaLink || `/${slug}/contact`}
                  className="group flex items-center gap-3 text-lg font-semibold px-8 py-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <span style={{ color: primaryColor }}>{promotion?.ctaText || "Start your project"}</span>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}