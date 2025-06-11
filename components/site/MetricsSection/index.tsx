'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  CubeIcon,
  UserGroupIcon,
  TrophyIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

interface MetricsSectionProps {
  products: number;
  customers: number;
  awardsCount: number;
  support: string | number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function MetricsSection({
  products,
  customers,
  awardsCount,
  support,
}: MetricsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  const metrics = [
    { label: 'Products', value: products, Icon: CubeIcon },
    { label: 'Happy Customers', value: customers, Icon: UserGroupIcon },
    { label: 'Awards Won', value: awardsCount, Icon: TrophyIcon },
    { label: '24/7 Support', value: support, Icon: LifebuoyIcon },
  ];

  return (
    <Section title="Our Achievements" background="light">
      <motion.div
        className="
          flex flex-col space-y-6
          sm:flex-row sm:space-y-0 sm:space-x-6
          lg:space-x-8
          max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8
        "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {metrics.map((metric, idx) => {
          const { label, value, Icon } = metric;
          return (
            <motion.div
              key={label}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              className="
                flex-1 
                
                transition-all duration-300 
                flex flex-col items-center text-center 
                py-8 px-6
              "
            >
              {/* Icon in colored circle */}
              <div
                className="
                  w-16 h-16 
                  rounded-full 
                  flex items-center justify-center 
                  mb-4
                "
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                }}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>

              {/* Value with underline accent */}
              <div className="relative mb-2">
                <span className="text-3xl font-extrabold text-gray-900">
                  {value}
                </span>
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-10 rounded-full"
                  style={{ background: primary }}
                />
              </div>

              {/* Label */}
              <span className="text-gray-700 font-medium text-lg">
                {label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}
