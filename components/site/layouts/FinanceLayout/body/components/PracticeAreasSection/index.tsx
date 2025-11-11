"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';

// --- ICONS ---
const BriefcaseIcon = ({ className = "h-10 w-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 7.5v9a.75.75 0 00.75.75h16.5a.75.75 0 00.75-.75v-9H3zM12 11.25a1.5 1.5 0 00-3 0v1.5a1.5 1.5 0 003 0v-1.5z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = ({ className = "ml-2 h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h12.564l-4.78-4.78a.75.75 0 011.06-1.06l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.78-4.78H4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// --- MOCK DATA ---
const mockData = {
  marketplaceListings: [
    {
      id: "1",
      name: "Corporate & Business Law",
      description: "Navigate business formation, M&A, and regulatory compliance with expert legal counsel.",
      finalPrice: 500,
      images: [{ url: "https://images.unsplash.com/photo-1579762635293-9c869911e3b5" }],
    },
    {
      id: "2",
      name: "Strategic Financial Advisory",
      description: "Develop robust financial plans, investment strategies, and wealth management solutions.",
      finalPrice: 850,
      images: [{ url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4" }],
    },
  ],
  themeSettings: {
    primaryColor: "#004085",
    secondaryColor: "#1F77B4",
    accentColor: "#66B2FF",
  },
};

// --- MAIN COMPONENT ---
interface PracticeAreasSectionProps {
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  } | null;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function PracticeAreasSection({ themeSettings, marketplaceListings }: PracticeAreasSectionProps) {
  const primary = themeSettings?.primaryColor || "#004085";
  const secondary = themeSettings?.secondaryColor || "#1F77B4";
  const accent = themeSettings?.accentColor || "#66B2FF";

  const listings = marketplaceListings?.length ? marketplaceListings : mockData.marketplaceListings;

  return (
    <section
      id="services"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{
        background: `radial-gradient(circle at center, #ffffff 0%, #f3f6fa 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${accent})` }}
          >
            Our Core Expertise
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our <strong>specialized services</strong> provide clarity and strategic advantage.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {listings.map((listing) => (
            <motion.a
              key={listing.id}
              href={"#"}
              variants={itemVariants}
              whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
              }}
              className="group relative bg-white border border-gray-200 rounded-2xl shadow-md p-8 flex flex-col transition-all duration-300"
            >
              {/* Icon */}
              <div
                className="p-4 rounded-xl mb-6 w-fit bg-gradient-to-tr from-blue-50 to-blue-100 text-blue-600 shadow-sm"
                style={{ color: primary }}
              >
                <BriefcaseIcon />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                {listing.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                {listing.description}
              </p>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-lg font-semibold text-blue-700">
                  Starting at ${listing.finalPrice}
                </p>
                <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                  View Details
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
