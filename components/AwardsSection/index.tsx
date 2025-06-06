'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../contexts/StoreContext';
import Section from '../site/Section/Section';


interface Award {
  imageUrl?: string;
  icon?: string;
  url?: string;
  name?: string;
}

interface AwardsSectionProps {
  awards: (Award | string)[];
}

const awardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (idx: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1 + idx * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function AwardsSection({ awards }: AwardsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  if (!awards || awards.length === 0) return null;

  return (
    <Section >
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 px-4 sm:px-6 lg:px-8">
        {awards.map((award, idx) => {
          // Determine the image source and alt text
          let src: string;
          let altText: string;
          if (typeof award === 'string') {
            src = award;
            altText = `Award ${idx + 1}`;
          } else {
            src = award.imageUrl ?? award.url ?? award.icon ?? '';
            altText = award.name ?? `Award ${idx + 1}`;
          }

          return (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={awardVariants}
              className="relative flex items-center justify-center"
            >
              {/* Outer Gradient Ring */}
              <div
                className="rounded-full p-0.5"
                style={{
                  background: `conic-gradient(from 180deg at 50% 50%, ${primary}, ${secondary})`,
                }}
              >
                {/* Inner Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-gray-800 rounded-full w-28 h-28 md:w-32 md:h-32 flex items-center justify-center shadow-lg overflow-hidden"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={altText}
                      width={96}
                      height={96}
                      className="object-contain w-3/4 h-3/4"
                      priority={idx < 3}
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm text-center">
                      No Image
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
