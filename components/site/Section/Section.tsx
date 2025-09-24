'use client';

import React from 'react';
import clsx from 'clsx';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  background?: 'light' | 'dark' | 'none';
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Section({
  title,
  children,
  background = 'none',
}: SectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  const bgClass = clsx({
    'bg-gray-50': background === 'light',
    'bg-gray-900 text-white': background === 'dark',
    '': background === 'none',
  });

  // Gradient text style for the heading
  const gradientTextStyle = {
    background: `linear-gradient(90deg, ${primary})`,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  };

  // Gradient underline style
  const gradientUnderlineStyle = {
    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
  };

  const containerPadding = 'px-4 sm:px-6 lg:px-8';

  return (
    <section className={clsx('relative py-16 overflow-hidden', bgClass)}>
      {/* Optional: a subtle radial accent behind the title */}
      {title && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-[-64px] w-72 h-72 bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-transparent rounded-full blur-3xl pointer-events-none" />
      )}

      <div className={clsx('max-w-7xl mx-auto', containerPadding)}>
        {title && (
          <div className="relative mb-12 text-center">
            {/* Animated Gradient Title */}
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={titleVariants}
              style={gradientTextStyle}
              className="inline-block text-3xl sm:text-4xl md:text-5xl font-extrabold"
            >
              {title}
            </motion.h2>
            
          </div>
        )}

        {/* Animate children into view */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
          }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
