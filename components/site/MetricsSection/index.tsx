'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';


// MetricCard component to display a single feature
const MetricCard = ({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center space-y-2 p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
    >
      <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full mb-4">
        <Icon className="w-12 h-12 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
        {description}
      </p>
    </motion.div>
  );
};

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

// Main section
export default function MetricsSection({ coreValues }: MetricCardProps) {

  const CoreValues = [
    {
      id: '68ba95433e05e5090f8bb781',
      companyId: '68b597b7de9bdd2ba7479f34',
      title: 'Secure Payment',
      description: 'Secure on every order',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '68ba95433e05e5090f8bb782',
      companyId: '68b597b7de9bdd2ba7479f34',
      title: '24/7 Support',
      description: 'Contact us 24 hrs a day',
      icon: 'PhoneIcon',
    },
    {
      id: '68ba95433e05e5090f8bb783',
      companyId: '68b597b7de9bdd2ba7479f34',
      title: 'Fast Delivery',
      description: 'Fast delivery on your doorstep',
      icon: 'TruckIcon',
    },
  ];
  const coreValuesToUse = coreValues && coreValues.length > 0 ? coreValues : CoreValues;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans p-8 flex items-center justify-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Why Choose Us?
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
          We're committed to providing the best experience with our top-tier service.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {coreValuesToUse.map((value: ICoreValue) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon =
              ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon) as (
                props: React.ComponentProps<'svg'>
              ) => JSX.Element;
            return (
              <MetricCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
