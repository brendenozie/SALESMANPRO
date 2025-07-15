"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Make sure to import Image from next/image
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // For features and CTA button

// Framer Motion variants (reusing for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger for pricing cards
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Cards animate from slightly below
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7, // Smooth entrance duration
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F"; // From services section
const cardBackground = "#1B2A41"; // From services section
const accentColor = "#66B2FF"; // A bright blue for highlights
const primaryBlue = "#004085"; // From hero
const secondaryBlue = "#1F77B4"; // From hero
const textColorLight = "#E0E7FF"; // Lighter blue for text on dark background
const textColorMuted = "#A7B8D6"; // Muted blue for secondary text

// Interface for consultation plans
interface ConsultationPlan {
  id: string | number;
  title: string;
  description: string; // Added for more context
  price: string;
  frequency: string;
  features: string[];
  featured?: boolean; // To highlight a specific package
  buttonText: string; // Custom button text
}

// Sample data for consultation packages
const samplePackages: ConsultationPlan[] = [
  {
    id: 'basic',
    title: 'Foundational Insight',
    description: 'Ideal for initial guidance and understanding your legal or financial landscape.',
    price: '$299',
    frequency: 'One-time consultation',
    features: [
      '60-minute in-depth session',
      'Initial situation assessment',
      'High-level strategy overview',
      'Q&A with a specialist',
      'Post-consultation summary email',
    ],
    buttonText: 'Book Now',
  },
  {
    id: 'premium',
    title: 'Strategic Partnership',
    description: 'Comprehensive planning and advisory for complex legal or financial challenges.',
    price: '$999',
    frequency: 'Monthly Retainer (3-month minimum)',
    features: [
      'Unlimited consultations',
      'Dedicated lead advisor',
      'Customized action plan',
      'Ongoing tactical support',
      'Priority response time',
      'Quarterly performance review',
    ],
    featured: true, // This package will be highlighted
    buttonText: 'Get Started',
  },
  {
    id: 'enterprise',
    title: 'Tailored Enterprise Solutions',
    description: 'Bespoke solutions crafted for complex corporate and institutional requirements.',
    price: 'Contact Us',
    frequency: 'Customized Pricing',
    features: [
      'Dedicated enterprise team',
      'On-site consultations available',
      'Integrated legal & financial services',
      'Risk management & compliance',
      'Proprietary data insights',
      '24/7 priority support',
    ],
    buttonText: 'Request Quote',
  },
];

interface ConsultationPackagesProps {
  packages?: ConsultationPlan[]; // Allow packages to be passed as a prop
}

export default function ConsultationPackagesSection({ packages }: ConsultationPackagesProps) {
  const packagesToDisplay = packages && packages.length > 0 ? packages : samplePackages;

  return (
    <section
      id="consultation-packages"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: `linear-gradient(to right, ${cardBackground}, ${darkBackground})` }} // Subtle gradient background
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/mesh-pattern-dark.svg" // Subtle organic mesh pattern
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Unlock Your Potential with Our Packages
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect level of support to achieve your legal and financial objectives.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch" // items-stretch ensures equal height
        >
          {packagesToDisplay.map((plan: ConsultationPlan, i: number) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`relative rounded-3xl p-8 shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.03] group flex flex-col justify-between
                ${plan.featured
                  ? "bg-gradient-to-br from-blue-700 to-blue-900 text-white border-2 border-blue-500 shadow-blue-950/50" // Featured style
                  : "bg-gradient-to-br from-[#1B2A41] to-[#122033] text-white border border-transparent hover:border-blue-500/50" // Default style
                }`}
            >
              <div>
                {plan.featured && (
                  <div className="absolute -top-4 right-6 bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1 rounded-full shadow-lg rotate-3">
                    Most Popular
                  </div>
                )}
                <h3 className="text-3xl font-extrabold mb-3 leading-tight group-hover:text-blue-200 transition-colors duration-300">
                  {plan.title}
                </h3>
                <p className="text-blue-200/80 mb-6 text-sm">
                  {plan.description}
                </p>

                <p className="text-5xl font-bold mb-2 leading-none">
                  {plan.price}
                </p>
                <p className={`mb-8 text-base ${plan.featured ? 'text-blue-200' : 'text-blue-300/70'}`}>
                  {plan.frequency}
                </p>

                <ul className="space-y-4 mb-8 text-base">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <CheckIcon className={`h-6 w-6 flex-shrink-0 mr-3 ${plan.featured ? 'text-yellow-400' : 'text-blue-400'}`} />
                      <span className={`${plan.featured ? 'text-white' : 'text-blue-100/90'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 px-6 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center
                  ${plan.featured
                    ? "bg-white text-blue-800 hover:bg-gray-100 border border-transparent"
                    : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 hover:border-blue-700"
                  }`}
              >
                {plan.buttonText}
                <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}