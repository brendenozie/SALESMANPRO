"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StarIcon, ArrowRightIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid'; // Importing relevant solid icons

interface PatientSectionProps {
  name: string; // Clinic name
  slug: string; // Clinic slug for linking to a 'all testimonials' or 'reviews' page
  testimonials: Array<{
    id: string; // Unique ID for each testimonial
    authorName: string;
    quote: string;
    rating: number; // e.g., 4, 5 for star rating
    service?: string; // Optional: service received (e.g., "Dental Check-up")
    avatarUrl?: string; // Optional: URL for patient avatar image
  }>;
}

export default function PatientSection({ name, slug, testimonials }: PatientSectionProps) {
  const router = useRouter();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
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

  // Helper to render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-gray-900 py-20 lg:py-28 relative overflow-hidden">
      {/* Dynamic Background Pattern / Texture */}
      <div className="absolute inset-0 z-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-8h-2v8h-4v-8h-2v8h-4v-8h-2v8h-4v-8h-2v8H0v-2h18v-4h2v4h4v-4h2v4h4v-4h2v4h4v-4h2v4h2v2h-4zm0-30V0h-2v4h-4V0h-2v4h-4V0h-2v4h-4V0h-2v4H0V2h18v4h2V2h4v4h2V2h4v4h2V2h4v4h2V4h-4zM6 34v-8H4v8H0v-2h4v-4h2v4zm0-30V0H4v4H0V2h4v4h2V4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Trusted Voices
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
          >
            What Our <span className="text-purple-600 dark:text-purple-400">Patients Say</span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-700 dark:text-gray-300 text-center mt-4 max-w-3xl mx-auto leading-relaxed"
          >
            Hear directly from those who have experienced our compassionate care and exceptional service.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id || i} // Use id if available, fallback to index
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }} // Trigger when 30% of card is in view
              variants={cardVariants}
              transition={{ delay: i * 0.1 }} // Staggered animation for each card
              whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }} // Lift and add stronger shadow
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 relative overflow-hidden
                         transform transition-all duration-300 ease-in-out hover:-translate-y-2 group" // Add translate-y hover
            >
              {/* Quote Icon Background (subtle) */}
              <div className="absolute top-6 right-6 text-gray-200 dark:text-gray-700 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 transform -rotate-12" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                {t.avatarUrl ? (
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-teal-500 dark:border-teal-400 flex-shrink-0">
                    <img
                      src={t.avatarUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} // Using img tag for mock loader, replace with Next.js Image for production
                      alt={t.authorName}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-700 flex items-center justify-center text-teal-700 dark:text-teal-100 font-bold text-xl flex-shrink-0 border-2 border-teal-500 dark:border-teal-400">
                    {t.authorName}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-xl text-gray-900 dark:text-white leading-tight">
                    {t.authorName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Verified Patient</p>
                  {t.service && (
                    <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                      Service: {t.service}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center mb-4">
                {renderStars(t.rating)}
                <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
                  {t.rating.toFixed(1)} / 5
                </span>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
                “{t.quote}”
              </p>
              
              {/* Read More / View Full Review Link */}
              <motion.a
                href={`/${slug}/reviews/${t.id || i}`} // Link to individual review page
                className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:underline transition-colors duration-200"
                whileHover={{ x: 5 }} // Slight movement on hover
              >
                Read Full Review
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </motion.a>
            </motion.div>
          ))}
        </div>

        {/* Call to action for all reviews/testimonials */}
        <div className="text-center mt-20">
          <motion.button
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 30px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/reviews`)} // Link to a page showing all reviews
            aria-label="Read all patient testimonials"
          >
            Read More Patient Stories
            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 ml-3" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}