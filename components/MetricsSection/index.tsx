'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../contexts/StoreContext';
import Section from '../site/Section/Section';


interface Metric {
  label: string;
  value: number | string;
}

interface MetricsSectionProps {
  products: number;
  customers: number;
  awardsCount: number;
  support: string | number;
}

const metricVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: idx * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function MetricsSection({
  products,
  customers,
  awardsCount,
  support,
}: MetricsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  const metrics: Metric[] = [
    { label: 'Products', value: products },
    { label: 'Happy Customers', value: customers },
    { label: 'Awards', value: awardsCount },
    { label: '24/7 Support', value: support },
  ];

  return (
    <Section title="Our Achievements">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={metricVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center"
          >
            {/* Gradient Circle with Value */}
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4`}
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
            >
              <span className="text-3xl md:text-4xl font-extrabold text-white">
                {metric.value}
              </span>
            </div>

            {/* Label */}
            <span className="mt-2 text-lg md:text-xl font-medium text-gray-700 dark:text-gray-200">
              {metric.label}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
