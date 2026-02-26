'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';

interface Props {
  primaryColor?: string;
  secondaryColor?: string;
}

export default function StoreFeatures({
  primaryColor = '#48348F',
  secondaryColor = '#6B46C1',
}: Props) {
  const features = [
    {
      icon: TruckIcon,
      title: 'Free Delivery',
      description: 'Delivery to any point of the city and regions',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Easy & Secure',
      description: 'Online payment with credit and debit card',
    },
    {
      icon: PhoneIcon,
      title: '24/7 Support',
      description: 'We are always ready to take your call',
    },
    {
      icon: SparklesIcon,
      title: '100% Organic',
      description: 'All products are 100% organic, certified',
    },
  ];

  return (
    <section className="relative bg-white py-16 md:py-20">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="
                  group
                  bg-white
                  rounded-2xl
                  p-6
                  shadow-sm
                  hover:shadow-xl
                  transition-all
                  duration-300
                  border border-gray-100
                  text-center
                "
              >
                {/* Icon Container */}
                <div
                  className="
                    mx-auto mb-4
                    w-14 h-14
                    flex items-center justify-center
                    rounded-xl
                    transition-all
                    duration-300
                  "
                  style={{
                    backgroundColor: `${primaryColor}15`,
                  }}
                >
                  <Icon
                    className="h-7 w-7"
                    style={{ color: primaryColor }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: secondaryColor }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}