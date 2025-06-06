'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CubeIcon, UserGroupIcon, TrophyIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

interface MetricsSectionProps {
  products: number;
  customers: number;
  awardsCount: number;
  support: string | number;
}

const metricVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (idx: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: idx * 0.15, duration: 0.5, ease: 'easeOut' },
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
  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  const metrics = [
    { label: 'Products', value: products, Icon: CubeIcon },
    { label: 'Happy Customers', value: customers, Icon: UserGroupIcon },
    { label: 'Awards Won', value: awardsCount, Icon: TrophyIcon },
    { label: '24/7 Support', value: support, Icon: LifebuoyIcon },
  ];

  return (
    <Section title="Our Achievements">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* On mobile: horizontal scroll; on sm+: grid */}
        <motion.div
          className="
            flex space-x-6 overflow-x-auto 
            sm:grid sm:grid-cols-2 lg:grid-cols-4 
            sm:space-x-0 sm:gap-8 py-8
          "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
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
                variants={metricVariants}
                className="
                  flex-shrink-0 sm:flex-shrink 
                  relative 
                  bg-white/10 backdrop-blur-sm ring-1 ring-gray-200
                  rounded-3xl shadow-lg 
                  p-6 
                  flex flex-col items-center 
                  hover:shadow-2xl hover:-translate-y-1 
                  transition-all duration-300
                  w-72
                "
              >
                {/* Gradient Icon Circle */}
                <div
                  className="
                    relative 
                    w-20 h-20 
                    rounded-full 
                    flex items-center justify-center 
                    mb-4
                  "
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  }}
                >
                  <Icon className="h-10 w-10 text-white" />
                  {/* Small gradient slice */}
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-tl-full"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    }}
                  />
                </div>

                {/* Number */}
                <motion.span
                  className="text-3xl font-extrabold text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 + 0.1, duration: 0.6, ease: 'easeOut' }}
                >
                  {value}
                </motion.span>

                {/* Label */}
                <span className="text-gray-200 text-lg font-medium text-center">
                  {label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
