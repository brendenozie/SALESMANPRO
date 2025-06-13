'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  UserGroupIcon,
  TrophyIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface MetricsSectionProps {
  products: number;
  customers: number;
  awardsCount: number;
  support: string | number;
}

const MetricCard = ({
  label,
  value,
  Icon,
  primary,
  secondary,
}: {
  label: string;
  value: number | string;
  Icon: any;
  primary: string;
  secondary: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center group hover:shadow-2xl transition-all duration-300"
    >
      <div
        className="w-16 h-16 rounded-full mb-4 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform"
        style={{
          background: `${primary}`,
        }}
      >
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-4xl font-bold text-gray-800 dark:text-white">
        {value}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm font-bold uppercase ">{label}</p>
    </motion.div>
  );
};

export default function MetricsSection({
  products,
  customers,
  awardsCount,
  support,
}: MetricsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#6366f1';
  const secondary = themeSettings.secondaryColor || '#14b8a6';

  const metrics = [
    { label: 'Products Available', value: products, Icon: CubeIcon },
    { label: 'Happy Customers', value: customers, Icon: UserGroupIcon },
    { label: 'Awards Achieved', value: awardsCount, Icon: TrophyIcon },
    { label: '24/7 Support Hours', value: support, Icon: LifebuoyIcon },
  ];

  return (
    <section
      className="py-24 bg-gradient-to-b from-white to-gray-100 dark:from-zinc-950 dark:to-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-12">
          Powered by Impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              Icon={metric.Icon}
              primary={primary}
              secondary={secondary}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
