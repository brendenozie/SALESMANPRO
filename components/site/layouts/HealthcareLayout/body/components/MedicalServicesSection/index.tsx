"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

// Mock loader
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface MedicalServicesSectionProps {
  services: Array<{ id: string; name: string; imageUrl: string; slug: string; description?: string }>;
  storeSlug: string;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function MedicalServicesSection({ services, storeSlug }: MedicalServicesSectionProps) {
  const router = useRouter();

  return (
    <section id="services" className="relative py-24 lg:py-32 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      
      {/* --- Background Pattern (CSS Dots) --- */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-bold uppercase tracking-wider mb-6">
              <SparklesIcon className="w-4 h-4" />
              World Class Care
            </span>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Our Expert <span className="relative inline-block">
                <span className="relative z-10">Medical Services</span>
                {/* Yellow Highlight Underline */}
                <svg className="absolute bottom-1 left-0 w-full h-3 text-yellow-300 -z-0 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="10" fill="none" />
                </svg>
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              We combine advanced technology with compassionate care to provide a wide range of medical services tailored to your needs.
            </p>
          </motion.div>
        </div>

        {/* --- Services Grid --- */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {services.map((svc) => (
            <motion.div
              key={svc.id}
              variants={cardVariants}
              className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 cursor-pointer"
              onClick={() => router.push(`/${storeSlug}/service/${svc.slug}`)}
            >
              
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={svc.imageUrl || "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop"}
                  alt={svc.name}
                  loader={customLoader}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Dark Gradient Overlay (Only visible on hover for text readability contrast) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating Icon/Badge - Moves slightly on hover */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-lg transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                    {/* You can replace this with a specific icon per service if available */}
                    <div className="w-6 h-6 rounded-full border-2 border-teal-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="flex-1 p-8 flex flex-col relative">
                
                {/* Decorative Line */}
                <div className="w-12 h-1 bg-teal-500 rounded-full mb-4 transition-all duration-500 group-hover:w-20" />

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-600 transition-colors duration-300">
                  {svc.name}
                </h3>

                {svc.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {svc.description}
                  </p>
                )}

                {/* Bottom Action Area */}
                <div className="mt-auto flex items-center text-sm font-bold text-gray-900 dark:text-white group/btn">
                  <span className="mr-2 group-hover:mr-4 transition-all duration-300">Learn More</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                    <ArrowRightIcon className="w-4 h-4 transform group-hover:-rotate-45 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Footer CTA --- */}
        <div className="mt-20 text-center">
            <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${storeSlug}/all-services`)}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
                View Full Service Menu
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
        </div>

      </div>
    </section>
  );
}