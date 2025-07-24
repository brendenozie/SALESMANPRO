"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Feature = {
  id: string;
  title: string; // Corresponds to 'label'
  description: string;
  iconUrl?: string; // Corresponds to 'icon'
  order: number; // For sorting
};

export type StoreForm = {
  name?: string; // For section title
  features?: Feature[]; // Array of Feature objects for highlights
  // Add other relevant StoreForm fields if needed for this section
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    name: 'Children\'s Hope Foundation',
    features: [
      {
        id: 'feat-1',
        title: "Medical Aid",
        description: "Providing essential healthcare and medical support to vulnerable children.",
        iconUrl: "/icons/medical.svg", // Example SVG icon path
        order: 1,
      },
      {
        id: 'feat-2',
        title: "Education Support",
        description: "Ensuring access to quality education and learning resources for a brighter future.",
        iconUrl: "/icons/education.svg",
        order: 2,
      },
      {
        id: 'feat-3',
        title: "Community Development",
        description: "Investing in sustainable community projects that uplift families and children.",
        iconUrl: "/icons/funds.svg",
        order: 3,
      },
      {
        id: 'feat-4',
        title: "Emergency Relief",
        description: "Delivering urgent aid and support in times of crisis and natural disasters.",
        iconUrl: "/icons/support.svg",
        order: 4,
      },
      {
        id: 'feat-5',
        title: "Clean Water Initiatives",
        description: "Implementing projects to provide safe and accessible drinking water to communities.",
        iconUrl: "/icons/water.svg", // New example icon
        order: 5,
      },
    ],
  } as StoreForm,
});

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Static fallback data
const fallbackFeatures = [
  {
    id: 'fb-feat-1',
    title: "Food Security",
    description: "Ensuring nutritious meals for children and families facing hunger.",
    iconUrl: "/icons/food.svg", // Placeholder icon
    order: 1,
  },
  {
    id: 'fb-feat-2',
    title: "Shelter & Safety",
    description: "Providing safe homes and protective environments for displaced children.",
    iconUrl: "/icons/shelter.svg",
    order: 2,
  },
  {
    id: 'fb-feat-3',
    title: "Child Protection",
    description: "Advocating for children's rights and protecting them from exploitation and abuse.",
    iconUrl: "/icons/protection.svg",
    order: 3,
  },
  {
    id: 'fb-feat-4',
    title: "Healthcare Access",
    description: "Facilitating access to medical services, vaccinations, and health education.",
    iconUrl: "/icons/health.svg",
    order: 4,
  },
];

export default function CoreHighlightsSection() {
  const { storeFormData } = useStoreContext();

  // Determine which features to render: dynamic or fallback
  const featuresToRender = Array.isArray(storeFormData?.features) && storeFormData.features.length > 0
    ? storeFormData.features.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackFeatures;

  const sectionTitle = storeFormData?.name ? `Our Core Mission at ${storeFormData.name}` : "Our Core Mission";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/64x64/CCCCCC/333333?text=Icon"; // Generic icon placeholder
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresToRender.map((item, idx) => (
            <motion.div
              key={item.id} // Use unique ID from data
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 mb-6 flex items-center justify-center">
                <Image
                  src={item.iconUrl || "https://placehold.co/64x64/CCCCCC/333333?text=Icon"} // Use iconUrl or fallback
                  alt={item.title}
                  width={64}
                  height={64}
                  loader={loader}
                  onError={handleImageError}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 text-base">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
