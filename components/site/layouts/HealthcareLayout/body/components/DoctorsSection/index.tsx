// File: components/site/layouts/HealthcareLayout/components/DoctorsSection.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/solid';


// Mocking the image loader - Keep if not fully in Next.js Image optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface DoctorsSectionProps {
  doctors: Array<{ id: string; name: string; username: string; subtitle: string; imageUrl: string; specializations?: string[] }>;
  storeSlug: string;
}

export default function DoctorsSection({ doctors, storeSlug }: DoctorsSectionProps) {
  const router = useRouter();

  // Animation variants for a staggered, captivating effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Time between each child animation
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section id="doctors" className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-20 lg:py-28 relative overflow-hidden">
      {/* Background Shapes for Visual Texture */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-purple-500/15 text-purple-700 dark:bg-purple-400/20 dark:text-purple-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Meet Our Experts
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our <span className="text-indigo-600 dark:text-indigo-400">Compassionate</span> Doctors
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Discover the dedicated professionals committed to your well-being.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center cursor-pointer transform transition-all duration-500 ease-in-out group hover:shadow-2xl hover:scale-105 relative overflow-hidden"
              variants={cardVariants}
              onClick={() => router.push(`/${storeSlug}/doctor/${doc.id}`)}
              onKeyDown={(e : any) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/${storeSlug}/doctor/${doc.id}`);
              }}
              aria-label={`View profile of Dr. ${doc.name}, ${doc.subtitle}`}
            >
              {/* Doctor Image with glowing border effect */}
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-indigo-500 dark:border-indigo-400 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 transform-gpu">
                <Image
                  src={doc.imageUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                  alt={`Dr. ${doc.name}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loader={customLoader}
                />
              </div>
              
              {/* Text Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight transition-colors duration-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                Dr. {doc.name || doc.username}
              </h3>
              <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                {doc.subtitle}
              </p>

              {/* Specialization Tags */}
              {doc.specializations && doc.specializations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                  {doc.specializations.map((spec, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Hover overlay with CTA */}
              <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="inline-flex items-center text-white font-semibold text-lg animate-pulse">
                  View Profile
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action for all doctors */}
        <div className="text-center mt-20">
          <motion.button
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 30px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${storeSlug}/doctors`)}
            aria-label="View all our expert doctors"
          >
            Explore All Doctors
            <UserGroupIcon className="w-6 h-6 ml-3" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}