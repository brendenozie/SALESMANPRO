'use client';

import React from 'react';
import { motion } from 'framer-motion';

const banners = [
  {
    id: 'summer',
    label: 'FEATURED COLLECTION',
    title: 'CLEARANCE SUMMER',
    imgSrc: '/images/handbag.jpg',
    bgClass: 'bg-yellow-100',
    imgPosition: 'right',
  },
  {
    id: 'winter',
    label: 'FEATURED COLLECTION',
    title: 'CLEARANCE WINTER',
    imgSrc: '/images/hoodie.jpg',
    bgClass: 'bg-pink-100',
    imgPosition: 'left',
  },
];

export default function PromotionSection() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="grid gap-8 md:grid-cols-2">
        {banners.map(({ id, label, title, imgSrc, bgClass, imgPosition }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className={`
              relative flex items-center rounded-3xl shadow-lg overflow-hidden transition-transform transform hover:scale-[1.01]
              ${bgClass}
              ${imgPosition === 'right' ? 'flex-row' : 'flex-row-reverse'}
            `}
          >
            {/* Text Content */}
            <div className="w-1/2 p-8 lg:p-10">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-gray-700 uppercase">
                {label}
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {title}
              </h2>
              <button className="mt-6 inline-block border-2 border-gray-800 px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-800 hover:text-white transition-colors rounded-full shadow-sm">
                SHOP NOW
              </button>
            </div>

            {/* Image Block */}
            <div className="w-1/2 h-full overflow-hidden">
              <img
                src={imgSrc}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
