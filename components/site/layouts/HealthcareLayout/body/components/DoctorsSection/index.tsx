"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserGroupIcon, ArrowRightIcon, CalendarDaysIcon, StarIcon } from '@heroicons/react/24/solid';

// Mocking the image loader
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface DoctorsSectionProps {
  doctors: Array<{ id: string; name: string; username: string; subtitle: string; imageUrl: string; specializations?: string[] }>;
  storeSlug: string;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

export default function DoctorsSection({ doctors, storeSlug }: DoctorsSectionProps) {
  const router = useRouter();

  return (
    <section id="doctors" className="relative py-24 lg:py-32 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Abstract Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-x-1/2 opacity-60" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-50 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/3 opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
                <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4"
                >
                    World-Class Care
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
                >
                    Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Specialists</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 text-lg text-gray-600 dark:text-gray-400"
                >
                    Highly qualified professionals dedicated to providing you with the best medical care.
                </motion.p>
            </div>

            {/* Desktop 'View All' Button */}
            <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => router.push(`/${storeSlug}/doctors`)}
                className="hidden md:inline-flex items-center font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors"
            >
                View All Doctors
                <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.button>
        </div>

        {/* --- Doctors Grid --- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {doctors.map((doc) => (
            <motion.div
              key={doc.id}
              variants={cardVariants}
              className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
              onClick={() => router.push(`/${storeSlug}/doctor/${doc.id}`)}
            >
                {/* Image Layer */}
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={doc.imageUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"}
                        alt={`Dr. ${doc.name}`}
                        fill
                        loader={customLoader}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                </div>

                {/* Status Indicator (Fake 'Available' Badge) */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full z-10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-white">Available</span>
                </div>

                {/* Content Layer */}
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end h-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    
                    {/* Doctor Info */}
                    <div className="relative z-20">
                        <p className="text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1">
                            {doc.specializations?.[0] || "Specialist"}
                        </p>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            Dr. {doc.name.split(' ')[0]} 
                            <span className="block text-lg font-medium text-gray-300">{doc.name.split(' ').slice(1).join(' ')}</span>
                        </h3>
                        
                        {/* Rating (Decorative) */}
                        <div className="flex items-center gap-1 mt-2 mb-4 opacity-80">
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-gray-300 font-medium">4.9 (120+ Reviews)</span>
                        </div>

                        {/* Hidden Action Button that slides up */}
                        <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-500 opacity-0 group-hover:opacity-100">
                            <button className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                                <CalendarDaysIcon className="w-5 h-5" />
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Footer CTA */}
        <div className="mt-12 text-center md:hidden">
          <button 
            onClick={() => router.push(`/${storeSlug}/doctors`)}
            className="inline-flex items-center px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold shadow-lg"
          >
            View All Doctors
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}