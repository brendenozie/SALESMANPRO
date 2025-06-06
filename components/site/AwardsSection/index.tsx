'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

interface Award {
  imageUrl?: string;
  icon?: string;
  url?: string;
  name?: string;
}

interface AwardsSectionProps {
  awards: (Award | string)[];
}

const awardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const awardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (idx: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: idx * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function AwardsSection({ awards }: AwardsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#10B981';   // emerald fallback
  const secondary = themeSettings.secondaryColor || '#3B82F6'; // blue fallback

  if (!awards || awards.length === 0) return null;

  return (
    <Section title="Awards & Recognition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* On mobile: allow horizontal scroll; on larger: show grid */}
        <motion.div
          className="
            flex space-x-6 overflow-x-auto 
            sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 
            sm:space-x-0 sm:gap-6
          "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={awardContainerVariants}
        >
          {awards.map((award, idx) => {
            let src: string;
            let altText: string;
            let label: string | undefined;

            if (typeof award === 'string') {
              src = award;
              altText = `Award ${idx + 1}`;
              label = undefined;
            } else {
              src = award.imageUrl ?? award.url ?? award.icon ?? '';
              altText = award.name ?? `Award ${idx + 1}`;
              label = award.name;
            }

            return (
              <motion.div
                key={idx}
                className="
                  flex-shrink-0 
                  sm:flex-shrink 
                  relative 
                  flex flex-col items-center
                "
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={awardVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="
                    relative
                    bg-white/80 backdrop-blur-sm
                    rounded-full 
                    w-28 h-28 md:w-32 md:h-32 
                    flex items-center justify-center 
                    shadow-lg
                  "
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
                    <span className="text-gray-400 text-sm text-center">
                      No Image
                    </span>
                  )}
                  {/* Gradient Accent Slice */}
                  <div
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-tl-full"
                    style={{
                      background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    }}
                  />
                </motion.div>
                {label && (
                  <p className="mt-2 text-center text-sm font-medium text-gray-700 truncate w-28 md:w-32">
                    {label}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
