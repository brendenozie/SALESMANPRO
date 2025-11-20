'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StarIcon, ArrowRightIcon, ChatBubbleLeftRightIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface PatientSectionProps {
  name: string;
  slug: string;
  testimonials: Array<{
    id: string;
    authorName: string;
    quote: string;
    rating: number;
    service?: string;
    avatarUrl?: string;
  }>;
}

// Mocking the image loader
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
};

export default function PatientSection({ name, slug, testimonials }: PatientSectionProps) {
  const router = useRouter();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'
        }`}
      />
    ));
  };

  return (
    <section className="relative py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* --- Background Decoration --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md mb-6"
            >
                <div className="flex -space-x-1">
                    {[1,2,3,4,5].map((star) => <StarIcon key={star} className="w-4 h-4 text-yellow-400" />)}
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Excellent 4.9/5</span>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6"
            >
                Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Patients</span>
            </motion.h2>
            
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-400"
            >
                Don't just take our word for it. Read genuine stories from people who trust us with their health.
            </motion.p>
        </div>

        {/* --- Testimonials Grid --- */}
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id || i}
              variants={cardVariants}
              className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 flex flex-col h-full"
            >
              {/* Decorative Big Quote Mark */}
              <span className="absolute top-6 right-8 text-9xl font-serif leading-none text-gray-100 dark:text-gray-700 opacity-50 select-none pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                &rdquo;
              </span>

              {/* Rating */}
              <div className="flex mb-6 relative z-10">
                {renderStars(t.rating)}
              </div>

              {/* Quote Text */}
              <blockquote className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-8 relative z-10 flex-grow">
                "{t.quote}"
              </blockquote>

              {/* Author Section */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-gray-700 relative z-10">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {t.avatarUrl ? (
                        <Image 
                            src={t.avatarUrl} 
                            alt={t.authorName} 
                            loader={customLoader}
                            fill 
                            className="object-cover" 
                            sizes="48px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                            {t.authorName.charAt(0)}
                        </div>
                    )}
                </div>
                
                <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t.authorName}
                        <CheckBadgeIcon className="w-4 h-4 text-blue-500" title="Verified Patient" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex flex-wrap gap-1">
                        <span>Verified Patient</span>
                        {t.service && (
                            <>
                                <span>•</span>
                                <span className="text-blue-600 dark:text-blue-400">{t.service}</span>
                            </>
                        )}
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Footer CTA --- */}
        <div className="mt-20 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/reviews`)}
            className="inline-flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            Read All Success Stories
            <ChatBubbleLeftRightIcon className="w-5 h-5 ml-3 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}