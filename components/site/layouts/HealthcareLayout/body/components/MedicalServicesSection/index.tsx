"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Correct import for useRouter in Next.js 13+
import Image from 'next/image'; // Import Next.js Image component
import { ArrowRightIcon, PlusCircleIcon, } from '@heroicons/react/24/solid'; // Using solid icons for better prominence

// Mocking the image loader - Keep if not fully in Next.js Image optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface MedicalServicesSectionProps {
  services: Array<{ id: string; name: string; imageUrl: string; slug: string; description?: string }>; // Added optional description
  storeSlug: string;
}

export default function MedicalServicesSection({ services, storeSlug }: MedicalServicesSectionProps) {
  const router = useRouter();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      }
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Comprehensive Care
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Our Expert <span className="text-teal-600 dark:text-teal-400">Medical Services</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            From preventive care to specialized treatments, we're dedicated to your well-being.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"> {/* Increased gap */}
          {services.map((svc, idx) => (
            <motion.div
              key={svc.id}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer
                         transform transition-all duration-300 ease-in-out group relative" // Added group class for nested hover effects
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of element is in view
              variants={cardVariants}
              transition={{ delay: idx * 0.1 }} // Staggered animation
              whileHover={{ scale: 1.03, y: -8 }} // Lift and slightly move up on hover
              onClick={() => router.push(`/${storeSlug}/service/${svc.slug}`)}
              onKeyDown={(e:any) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/${storeSlug}/service/${svc.slug}`);
              }}
              aria-label={`Learn more about ${svc.name}`}
            >
              <div className="relative h-64 w-full overflow-hidden rounded-t-3xl"> {/* Consistent height */}
                <Image
                  src={svc.imageUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                  alt={svc.name}
                  loader={customLoader}
                  fill
                  className="object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110" // Zoom on hover
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive image sizes
                />
                {/* Subtle Overlay on Image */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300"></div>
              </div>

              <div className="p-7 text-center"> {/* Increased padding */}
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"> {/* Larger, bolder title */}
                  {svc.name}
                </h3>
                {svc.description && (
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-5 line-clamp-2"> {/* Added description field, clamped to 2 lines */}
                        {svc.description}
                    </p>
                )}
                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0px 6px 15px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 transition-all duration-200"
                  onClick={(e:any) => {
                    e.stopPropagation(); // Prevent card click event from firing twice
                    router.push(`/${storeSlug}/service/${svc.slug}`);
                  }}
                  aria-label={`Discover ${svc.name} services`}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" /> {/* More relevant icon */}
                  Discover More
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional: Call to action for all services */}
        <div className="text-center mt-20">
            <motion.button
                className="inline-flex items-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400"
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${storeSlug}/all-services`)} // Link to a page showing all services
            >
                View All Services
                <ArrowRightIcon className="w-5 h-5 ml-3" />
            </motion.button>
        </div>
      </div>
    </section>
  );
}