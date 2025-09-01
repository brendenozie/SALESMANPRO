'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

// Utility function for Next.js Image loader
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Define benefits with updated icons and descriptions
const brandBenefits = [
  {
    title: 'Effortless Booking',
    description: 'A seamless, intuitive process that gets you scheduled in just a few clicks.',
    Icon: CheckCircleIcon,
  },
  {
    title: 'Unmatched Quality',
    description: 'Our certified professionals are dedicated to delivering excellence every time.',
    Icon: SparklesIcon,
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden fees, no surprises. What you see is exactly what you pay.',
    Icon: ShieldCheckIcon,
  },
  {
    title: '24/7 Availability',
    description: 'We offer flexible scheduling to fit your busy life, anytime, anywhere.',
    Icon: ClockIcon,
  },
];

export default function AboutAndBenefitsSection() {
  const { storeFormData } = useStoreContext();

  // Sample data to make the component runnable without a context provider
  const sampleData = {
    name: 'SwiftServe',
    description: 'At SwiftServe, we’re committed to connecting you with top-tier professionals for all your needs. From home services to personal care, our platform guarantees a seamless and satisfying experience from start to finish.',
    bannerUrl: 'https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    themeSettings: {
      primaryColor: '#00A880',
      secondaryColor: '#FFB300',
    }
  };

  const {
    name = 'Our Service',
    description,
    bannerUrl,
    themeSettings,
  } = storeFormData || sampleData;

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#FFB300';

  // Animation variants for staggered effects
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <section className="relative bg-gray-50 py-24 lg:py-36 text-gray-900 overflow-hidden">
      {/* Dynamic Background Blob Shapes */}
      <div className="absolute inset-0 z-0 opacity-5 blur-3xl">
        <motion.div
          className="absolute rounded-full -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Image with "floating" card effect */}
          <motion.div
            className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group"
            initial={{ opacity: 0, scale: 0.95, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <Image
              src={bannerUrl || '/images/relaxed-woman.jpg'}
              loader={loader}
              alt="A happy customer enjoying a service"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-gray-900/5 to-transparent"></div>
          </motion.div>

          {/* Right Column: Text Content and Benefits Grid */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="show"
            variants={containerVariants}
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.span
              className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm"
              variants={itemVariants}
            >
              Our Mission
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900"
              variants={itemVariants}
            >
              Experience the <span style={{ color: primaryColor }}>Difference</span>: Seamless Service, Unmatched Quality.
            </motion.h2>
            <motion.p
              className="text-lg text-gray-700 max-w-xl leading-relaxed"
              variants={itemVariants}
            >
              {description || 'We are dedicated to providing an unparalleled service experience, focusing on your comfort, convenience, and complete satisfaction.'}
            </motion.p>
            
            {/* Benefits Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6"
              variants={containerVariants}
            >
              {brandBenefits.map(({ title, description, Icon }, i) => (
                <motion.div
                  key={title}
                  className="flex items-start space-x-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 group"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #10B981)`,
                      boxShadow: `0 4px 15px ${primaryColor}44`,
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}