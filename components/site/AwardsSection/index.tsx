'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';
import { Award } from '../../types'; // Assuming this is defined elsewhere

// Sample Data to demonstrate the component
const sampleAwards = [
  { imageUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3?w=800&q=80', name: 'Digital Innovator Award', url: '#' },
  { imageUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598?w=800&q=80', name: 'Excellence in E-commerce', url: '#' },
  { imageUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033?w=800&q=80', name: 'Best New Product 2023', url: '#' },
  { imageUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e?w=800&q=80', name: 'Industry Leader of the Year', url: '#' },
  { imageUrl: 'https://images.unsplash.com/photo-1621376823337-3715c97f4c02?w=800&q=80', name: 'Consumer Choice Winner', url: '#' },
  { name: 'Recognized by Forbes', url: '#' }, // Example with no image
  { name: 'Top 10 Startup', url: '#' }, // Example with no image
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } },
};

export default function AwardsSection({ awards = sampleAwards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  if (!awards || awards.length === 0) return null;

  return (
    <Section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* New Title & Subtitle */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Recognized for Excellence
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our commitment to quality has earned us recognition from leading organizations. We're honored to be celebrated for our innovation and impact.
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {awards.map((award, idx) => {
            const src = award?.imageUrl ?? award?.url ?? award?.icon ?? '';
            const altText = award?.name ?? `Award ${idx + 1}`;
            const label = award?.name;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="
                  relative
                  bg-white rounded-2xl overflow-hidden
                  shadow-md hover:shadow-xl
                  transition-all duration-300
                  group cursor-pointer
                "
              >
                {/* Image Container */}
                <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center">
                  {src ? (
                    <Image
                      src={src}
                      alt={altText}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="p-4">
                        <span className="text-xl sm:text-2xl font-semibold text-gray-800 text-center">
                            {label}
                        </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}