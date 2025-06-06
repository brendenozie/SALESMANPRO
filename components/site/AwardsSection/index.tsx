'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
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

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function AwardsSection({ awards }: AwardsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  if (!awards || awards.length === 0) return null;

  return (
    <Section title="Awards & Recognition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
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
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                className="
                  relative
                  bg-white rounded-2xl overflow-hidden
                  shadow-md hover:shadow-lg hover:-translate-y-1
                  transition-all duration-300
                  group
                "
              >
                {/* Image Container */}
                <div className="relative w-full h-48 bg-gray-100">
                  {src ? (
                    <Image
                      src={src}
                      alt={altText}
                      fill
                      className="object-cover"
                      loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                      priority={idx < 4}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                </div>

                {/* Footer with Label */}
                <div className="p-4 flex flex-col items-center">
                  {label && (
                    <h3 className="text-lg font-semibold text-gray-800 text-center truncate w-full">
                      {label}
                    </h3>
                  )}
                  {/* Optional "Learn More" icon on hover */}
                  <motion.div
                    className="mt-2 opacity-0 group-hover:opacity-100 flex items-center space-x-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span className="text-sm text-gray-600 font-medium">Learn More</span>
                  </motion.div>
                </div>

                {/* Bottom Accent Bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
