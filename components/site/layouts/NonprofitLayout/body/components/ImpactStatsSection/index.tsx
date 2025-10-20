"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CurrencyDollarIcon, HeartIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     metrics: [
//       { id: 'metric-1', label: "Children Fed", value: "1,200+", order: 1, icon: <FaChild className="text-white w-6 h-6" /> },
//       { id: 'metric-2', label: "Lives Touched", value: "850+", order: 2, icon: <FaHeart className="text-white w-6 h-6" /> },
//       { id: 'metric-3', label: "Volunteers Engaged", value: "300+", order: 3, icon: <FaUserFriends className="text-white w-6 h-6" /> },
//       { id: 'metric-4', label: "Funds Raised", value: "$500K+", order: 4, icon: <FaDollarSign className="text-white w-6 h-6" /> },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722",
//     },
//   },
// });

const StatCard = ({ stat, primaryColor, isInView }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center relative z-10 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-white bg-opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="text-4xl">{stat.icon}</div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-5xl md:text-6xl font-extrabold"
        style={{ color: primaryColor }}
      >
        {stat.value}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-2 text-lg text-gray-700 font-semibold leading-tight"
      >
        {stat.label}
      </motion.p>
    </motion.div>
  );
};

export default function ImpactStatsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';

  const metricsToRender = storeFormData?.metrics && Array.isArray(storeFormData?.metrics) && storeFormData.metrics.length > 0
    ? storeFormData.metrics.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
        { id: 'fb-metric-1', value: "1,500+", label: "Lives Impacted", order: 1, icon: <UserGroupIcon className='text-white w-6 h-6' /> },
        { id: 'fb-metric-2', value: "50+", label: "Projects Completed", order: 2, icon: <HeartIcon className='text-white w-6 h-6' /> },
        { id: 'fb-metric-3', value: "800+", label: "Donors Supported", order: 3, icon: <CurrencyDollarIcon className='text-white w-6 h-6' /> },
        { id: 'fb-metric-4', value: "20+", label: "Communities Served", order: 4, icon: <UserIcon className='text-white w-6 h-6' /> },
      ];

  const sectionTitle = storeFormData?.name ? `Our Impact in Numbers at ${storeFormData.name}` : "Our Impact in Numbers";

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at top left, ${primaryColor} 0%, transparent 50%), radial-gradient(ellipse at bottom right, #fca5a5 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-white opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold mb-2" style={{ color: primaryColor }}>
            Our Results Speak for Themselves
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Every contribution, no matter how small, adds up to a monumental impact. Here's a look at the change we've created together.
          </p>
        </motion.div>
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {metricsToRender.map((stat, i) => (
            <StatCard key={i} stat={stat} primaryColor={primaryColor} isInView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}