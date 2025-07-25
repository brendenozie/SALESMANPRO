"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
// export type Stat = {
//   id: string; // Added ID for keying
//   label: string;
//   value: string; // Value can be a number or string like "5000+"
//   order: number; // For sorting
// };

// export type ThemeSettings = {
//   primaryColor?: string;
//   secondaryColor?: string;
// };

// export type StoreForm = {
//   name?: string; // For the organization's name
//   description?: string; // For the main description paragraph
//   aboutImageUrl?: string; // New field for about section specific image
//   stats?: Stat[]; // Array of Stat objects for progress bars
//   themeSettings?: ThemeSettings;
//   // Add other relevant StoreForm fields if needed for this section
// };

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     description: 'We’ve been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. Join us in our endeavor to uplift lives and create lasting change.',
//     aboutImageUrl: 'https://images.unsplash.com/photo-1594918231010-0a3b2b5f5f0b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example image for about section
//     stats: [
//       { id: 'stat-1', label: "Children Helped", value: "1200", order: 1 },
//       { id: 'stat-2', label: "Schools Built", value: "15", order: 2 },
//       { id: 'stat-3', label: "Wells Dug", value: "30", order: 3 },
//       { id: 'stat-4', label: "Volunteers Engaged", value: "500", order: 4 },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Mock router for demonstration (replace with actual useRouter in a Next.js app)
const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
  // window.location.href = path; // Uncomment for actual redirection
};

export default function AboutUsSpotlight() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#FFFFFF'; // Default White

  // Dynamic content with fallbacks
  const sectionTitle = storeFormData?.name ? `A Trusted Non-Profit Charity Organization: ${storeFormData.name}` : "A Trusted Non-Profit Charity Organization";
  const aboutDescription = storeFormData?.description || "We’ve been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. Join us in our endeavor to uplift lives and create lasting change.";
  const aboutImage = storeFormData?.bannerUrl || "/about-child.jpg"; // Use specific about image or fallback
  const dynamicStats = storeFormData?.stats;

  // Static fallback stats if dynamic data is not provided
  const fallbackStats = [
    { id: 'fb-stat-1', label: "Lives Impacted", value: "1500", order: 1 },
    { id: 'fb-stat-2', label: "Projects Completed", value: "50", order: 2 },
    { id: 'fb-stat-3', label: "Donors Supported", value: "800", order: 3 },
    { id: 'fb-stat-4', label: "Communities Served", value: "20", order: 4 },
  ];

  // Determine which stats to render, sorted by order
  const statsToRender = Array.isArray(dynamicStats) && dynamicStats.length > 0
    ? dynamicStats.sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackStats;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x450/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src={aboutImage}
            alt="Child giving thumbs up"
            width={600}
            height={450}
            loader={loader}
            className="rounded-xl shadow-xl object-cover w-full h-auto"
            onError={handleImageError}
          />
        </motion.div>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {sectionTitle}
          </h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            {aboutDescription}
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              className="inline-flex items-center px-7 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300"
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
              onClick={() => mockRouterPush('/volunteer')} // Example link for "Be a Hero"
            >
              Be a Hero
            </button>
            <button
              onClick={() => mockRouterPush('/donate')}
              className="inline-flex items-center border px-7 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300"
              style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: 'transparent', '--tw-hover-bg': primaryColor, '--tw-hover-text': secondaryColor } as React.CSSProperties}
            >
              Help Children with Donations
            </button>
          </div>
          <div className="space-y-5">
            {statsToRender.map((stat, index) => {
              const statValueNum = parseFloat(stat.value?.replace(/\+/g, '')); // Remove '+' and parse
              const progressPercentage = Math.min(100, (statValueNum / 1500) * 100); // Max 1500 for visual scale
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${progressPercentage}%` }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-3 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <span className="text-gray-800 font-medium text-lg min-w-[120px]">
                    {stat.value}{stat.value.includes('+') ? '' : '+'}{' '} {/* Add '+' if not present */}
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
