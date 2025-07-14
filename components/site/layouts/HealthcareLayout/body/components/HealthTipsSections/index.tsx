"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Correct import for useRouter in Next.js 13+
import { BookOpenIcon, SparklesIcon, LightBulbIcon, HeartIcon, ClipboardDocumentListIcon, ArrowRightIcon, MoonIcon, ShieldCheckIcon, SunIcon,  } from '@heroicons/react/24/solid'; // Importing more relevant and vibrant solid icons
import { BeakerIcon, BellIcon } from '@heroicons/react/24/outline';

interface HealthTipsSectionProps {
  services: Array<{ id: string; name: string; imageUrl: string; storeSlug: string; description?: string }>; // Added optional description
  storeSlug: string;
}


export default function HealthTipsSection({ services, storeSlug }: HealthTipsSectionProps) {
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
    <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-28 relative overflow-hidden">
      {/* Background Gradients/Shapes for Visual Interest */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl top-10 left-1/4 animate-blob"></div>
        <div className="absolute w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl bottom-10 right-1/4 animate-blob animation-delay-2000"></div>
        <div className="absolute w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-pink-500/15 text-pink-700 dark:bg-pink-400/20 dark:text-pink-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Empower Your Health
          </motion.span>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
          >
            Health Tips & <span className="text-teal-600 dark:text-teal-400">Trusted Insights</span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-700 dark:text-gray-300 text-center mt-4 max-w-3xl mx-auto leading-relaxed"
          >
            Explore our curated articles and resources designed to help you live a healthier, happier life.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[
            {
              title: 'Nutrition & Diet',
              description: 'Fuel your body with wholesome foods and discover balanced eating habits for vitality.',
              icon: <SunIcon className="w-12 h-12 text-green-500 dark:text-green-400" />,
              link: `/${storeSlug}/blog/nutrition-diet` // Example link
            },
            {
              title: 'Active Lifestyle',
              description: 'Simple and effective exercise routines to boost your energy and improve fitness.',
              icon: <BellIcon className="w-12 h-12 text-orange-500 dark:text-orange-400" />,
              link: `/${storeSlug}/blog/active-lifestyle`
            },
            {
              title: 'Mind & Mental Health',
              description: 'Strategies for stress management, mindfulness, and fostering emotional resilience.',
              icon: <BeakerIcon className="w-12 h-12 text-purple-500 dark:text-purple-400" />,
              link: `/${storeSlug}/blog/mental-health`
            },
            {
              title: 'Preventive Care',
              description: 'Understand the importance of screenings and vaccinations for long-term wellness.',
              icon: <ShieldCheckIcon className="w-12 h-12 text-blue-500 dark:text-blue-400" />,
              link: `/${storeSlug}/blog/preventive-care`
            },
            {
              title: 'Family Health',
              description: 'Resources and advice for maintaining the well-being of your entire family.',
              icon: <HeartIcon className="w-12 h-12 text-red-500 dark:text-red-400" />,
              link: `/${storeSlug}/blog/family-health`
            },
            {
              title: 'Sleep & Recovery',
              description: 'Optimize your rest and recovery for peak physical and mental performance.',
              icon: <MoonIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />,
              link: `/${storeSlug}/blog/sleep-recovery`
            },
          ].map((tip, i) => (
            <motion.a // Changed to <a> tag for better semantic linking
              href={tip.link}
              key={i}
              whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }} // Stronger shadow on hover
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }} // Trigger earlier
              variants={cardVariants}
              transition={{ delay: i * 0.1 }} // Staggered animation
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center flex flex-col items-center justify-between
                         transition-all duration-300 ease-in-out group transform hover:-translate-y-2 cursor-pointer" // Add translate-y on hover
              aria-label={`Read more about ${tip.title}`}
            >
              <div className="mb-6">
                {tip.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {tip.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 flex-grow">
                {tip.description}
              </p>
              <span className="inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold group-hover:underline group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-200">
                Read Article
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Call to action to view all resources/blog */}
        <div className="text-center mt-20">
          <motion.button
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400"
            whileHover={{ scale: 1.05, boxShadow: "0px 12px 30px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${storeSlug}/blog`)} // Link to your main blog/resources page
            aria-label="Visit our full Health Blog"
          >
            Visit Our Health Blog
            <BookOpenIcon className="w-6 h-6 ml-3" />
          </motion.button>
        </div>
      </div>

      {/* Tailwind CSS keyframes for blob animation (add to your global CSS or an inline style tag if necessary) */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}