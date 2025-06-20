'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();
  
  let resumeUrl = "url";
  const {
    name,
    tagline,
    description,
    themeSettings = {},
    stats = [],
    heroSlides = [],
    bannerUrl,
    logoUrl,
    slug,
    contactEmail,
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#3b82f6';
  const secondaryColor = themeSettings.secondaryColor || '#10b981';

  // Title/subtitle/description
  const title = name ? `About ${name}` : 'About Me';
  const subtitle = tagline || '';
  const aboutText = description || '';

  // Stats array fallback
  const statsData: Array<{ label: string; value: string | number }> =
    Array.isArray(stats) && stats.length > 0
      ? stats
      : [
          { label: 'Years in Business', value: '–' },
          { label: 'Clients Served', value: '–' },
          { label: 'Projects Completed', value: '–' },
        ];

  // Image source
  const slide = heroSlides[0] || {};
  const imgSrc =
    slide.productImageUrl ||
    slide.imageUrl ||
    bannerUrl ||
    logoUrl ||
    '/placeholder-about.jpg';

  // CTA links
  const contactHref = contactEmail ? `mailto:${contactEmail}` : slug ? `/${slug}/contact` : '#';
  const resumeHref = resumeUrl || null;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 py-24 px-6 lg:px-20">
      {/* Decorative Shapes */}
      <div
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
        {/* Text Section */}
        <motion.div
          className="flex-1 max-w-xl text-center lg:text-left"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading with underline bar */}
          <h2 className="text-4xl font-bold mb-3">
            <span className="block">{title}</span>
            <span
              className="block w-16 h-1 mt-1"
              style={{ backgroundColor: primaryColor }}
            />
          </h2>

          {subtitle && (
            <h3
              className="text-2xl font-semibold mb-6"
              style={{ color: primaryColor }}
            >
              {subtitle}
            </h3>
          )}

          {aboutText && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {aboutText}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {statsData.map(({ label, value }, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <p
                  className="text-2xl font-bold mb-1"
                  style={{ color: primaryColor }}
                >
                  {value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <motion.a
              href={contactHref}
              className="inline-block px-6 py-3 rounded-full font-semibold text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Get in Touch
            </motion.a>
            {resumeHref && (
              <motion.a
                href={resumeHref}
                target="_blank"
                className="inline-block px-6 py-3 rounded-full font-semibold border-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Download Resume
              </motion.a>
            )}
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full max-w-sm h-96 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-500">
            <Image
              src={imgSrc}
              loader={loader}
              alt={name ? `${name} Portrait` : 'About Image'}
              fill
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
