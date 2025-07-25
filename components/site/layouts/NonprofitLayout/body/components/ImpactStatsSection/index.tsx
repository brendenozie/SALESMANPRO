"use client";

import React from 'react';
import { motion } from 'framer-motion';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Stat = {
  id: string; // Added ID for keying
  label: string;
  value: string; // Value can be a number or string like "5000+"
  order: number; // For sorting
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  name?: string; // For section title
  metrics?: Stat[]; // Array of Stat objects for impact metrics (renamed from 'stats' to 'metrics' for clarity with schema)
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed for this section
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     metrics: [
//       { id: 'metric-1', label: "Children Fed", value: "1,200+", order: 1 },
//       { id: 'metric-2', label: "Lives Touched", value: "850+", order: 2 },
//       { id: 'metric-3', label: "Volunteers Engaged", value: "300+", order: 3 },
//       { id: 'metric-4', label: "Funds Raised", value: "$500K+", order: 4 },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

export default function ImpactStatsSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange

  // Determine which metrics to render: dynamic or fallback
  const metricsToRender = Array.isArray(storeFormData?.metrics) && storeFormData.metrics.length > 0
    ? storeFormData.metrics.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : [ // Fallback stats if `metrics` from context is empty
        { id: 'fb-metric-1', value: "1,200+", label: "Children Fed", order: 1 },
        { id: 'fb-metric-2', value: "850+", label: "Lives Touched", order: 2 },
        { id: 'fb-metric-3', value: "300+", label: "Volunteers", order: 3 },
        { id: 'fb-metric-4', value: "$500K+", label: "Funds Raised", order: 4 },
      ];

  const sectionTitle = storeFormData?.name ? `Our Impact in Numbers at ${storeFormData.name}` : "Our Impact in Numbers";

  return (
    <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metricsToRender.map((stat, i) => (
            <motion.div
              key={i} // Use unique ID from data
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
              className="text-center bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center"
            >
              <h3
                className="text-5xl md:text-6xl font-extrabold animate-pulse"
                style={{ color: primaryColor }}
              >
                {stat.value}
              </h3>
              <p className="mt-3 text-lg text-gray-700 font-semibold">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
