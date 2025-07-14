"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Correct import for useRouter in Next.js 13+
import Image from 'next/image'; // Import Next.js Image component
import { UserGroupIcon, ArrowRightIcon,} from '@heroicons/react/24/solid'; // Importing relevant solid icons

// Mocking the image loader - Keep if not fully in Next.js Image optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface DoctorsSectionProps {
  doctors: Array<{ id: string; name: string; subtitle: string; imageUrl: string; specializations?: string[] }>; // Added optional specializations
  storeSlug: string;
}

export default function DoctorsSection({ doctors, storeSlug }: DoctorsSectionProps) {
  const router = useRouter();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      }
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-20 lg:py-28 relative overflow-hidden">
      {/* Background Dots/Pattern for Visual Texture */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E")` }}></div>


      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-purple-500/15 text-purple-700 dark:bg-purple-400/20 dark:text-purple-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Dedicated Team
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Meet Our <span className="text-indigo-600 dark:text-indigo-400">Expert Doctors</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            Our team of compassionate and highly skilled medical professionals is here to serve you.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"> {/* Increased gap */}
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl p-8 text-center cursor-pointer
                         transform transition-all duration-300 ease-in-out group hover:-translate-y-2 relative overflow-hidden" // Added overflow-hidden for subtle gradient
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }} // Trigger earlier
              variants={cardVariants}
              transition={{ delay: idx * 0.1 }} // Staggered animation
              whileHover={{ scale: 1.03 }} // Keep a slight scale for consistency with other cards
              onClick={() => router.push(`/${storeSlug}/doctor/${doc.id}`)}
              onKeyDown={(e:any) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/${storeSlug}/doctor/${doc.id}`);
              }}
              aria-label={`View profile of Dr. ${doc.name}, ${doc.subtitle}`}
            >
              {/* Subtle overlay gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>

              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-teal-500 dark:border-teal-400 mb-6 shadow-md transform group-hover:scale-105 transition-transform duration-300"> {/* Larger image, bolder border */}
                <Image
                  src={doc.imageUrl}
                  alt={`Dr. ${doc.name}`}
                  loader={customLoader}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Responsive image sizes
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Dr. {doc.name}
              </h3>
              <p className="text-base font-medium text-blue-600 dark:text-blue-400 mb-4">
                {doc.subtitle}
              </p>

              {/* Optional: Display specializations as tags */}
              {doc.specializations && doc.specializations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                  {doc.specializations.map((spec, i) => (
                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* View Profile Button on card hover (or always visible if preferred) */}
              <div className="mt-6">
                <span className="inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold group-hover:underline group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200">
                  View Profile
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action for all doctors */}
        <div className="text-center mt-20">
          <motion.button
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 30px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${storeSlug}/doctors`)} // Link to your full doctors page
            aria-label="View all our expert doctors"
          >
            View All Doctors
            <UserGroupIcon className="w-6 h-6 ml-3" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}