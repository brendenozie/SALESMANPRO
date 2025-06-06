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
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  const bgClass = clsx({
    'bg-gray-50 dark:bg-gray-900': background === 'light',
    'bg-gray-900 text-white': background === 'dark',
    '': background === 'none',
  });

  // Inline CSS for gradient text and underline
  const gradientTextStyle = {
    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
  };

  const gradientUnderlineStyle = {
    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
  };

  const containerPadding = 'px-4 sm:px-6 lg:px-8';

  return (
    <section className={clsx('py-16', bgClass)}>
      <div className={clsx('max-w-7xl mx-auto', containerPadding)}>
        {title && (
          <>
            {/* Animated Gradient Title */}
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={titleVariants}
              style={gradientTextStyle}
              className="text-3xl sm:text-4xl font-extrabold mb-4"
            >
              {title}
            </motion.h2>

            {/* Gradient Underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-1 rounded mb-8 origin-left"
              style={gradientUnderlineStyle}
            />
          </>
        )}

        {/* Content Wrapper: animate children into view */}
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
