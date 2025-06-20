'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function FeaturesSection() {
  const { storeFormData } = useStoreContext();
  let dynamicFeatures : any[] = [];
  const { themeSettings = {}, bannerUrl, name, } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#10b981';
  const secondaryColor = themeSettings.secondaryColor || '#047857';
  const accentBg = `${primaryColor}20`;

  // Fallback static features if dynamicFeatures not provided
  const staticFeatures = [
    {
      iconKey: 'CheckIcon',
      title: 'Creative Portfolio',
      description: 'Showcase of selected works and case studies to highlight my expertise.',
    },
    {
      iconKey: 'UserGroupIcon',
      title: 'Client Testimonials',
      description: 'Real feedback from clients I have collaborated with, demonstrating impact.',
    },
    {
      iconKey: 'AdjustmentsVerticalIcon',
      title: 'Personal Branding',
      description: 'Tailored strategies to build and elevate your personal brand presence.',
    },
    {
      iconKey: 'ClockIcon',
      title: 'Consultation',
      description: 'Schedule a session to discuss projects, career guidance, or collaboration.',
    },
    {
      iconKey: 'LockClosedIcon',
      title: 'Secure Collaborations',
      description: 'Confidential and professional engagement on all projects and contracts.',
    },
    {
      iconKey: 'Cog6ToothIcon',
      title: 'Custom Solutions',
      description: 'Bespoke services aligned to your unique goals and industry requirements.',
    },
  ];

  const featuresData: Array<{
    iconKey?: string;
    iconUrl?: string;
    title: string;
    description: string;
  }> =
    Array.isArray(dynamicFeatures) && dynamicFeatures.length > 0
      ? dynamicFeatures.map((f: any) => ({
          iconKey: f.iconKey,
          iconUrl: f.iconUrl,
          title: f.title || '',
          description: f.description || '',
        }))
      : staticFeatures;

  return (
    <section className="relative py-28 px-6 sm:px-12 overflow-hidden bg-white dark:bg-gray-900">
      {/* Decorative blobs */}
      <div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Background image overlay if any */}
      {bannerUrl && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bannerUrl}
            alt={`${name || 'Background'} feature background`}
            fill
            className="object-cover opacity-10"
            loader={loader}
            priority={false}
          />
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90" />
        </div>
      )}

      {/* Header */}
      <div className="relative max-w-4xl mx-auto text-center mb-16 z-10">
        <motion.span
          className="inline-block text-sm font-semibold px-4 py-1 rounded-full shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ backgroundColor: accentBg, color: primaryColor }}
        >
          What I Offer
        </motion.span>
        <motion.h2
          className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ color: '#111827' }}
        >
          My Expertise & Services
        </motion.h2>
        {storeFormData.tagline && (
          <motion.p
            className="mt-4 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ color: '#4B5563' }}
          >
            {storeFormData.tagline}
          </motion.p>
        )}
      </div>

      {/* Features Grid */}
      <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {featuresData.map(({ iconKey, iconUrl, title, description }, i) => {
          const IconComponent =
            (iconKey && iconMap[iconKey]) || CheckIcon;
          return (
            <motion.div
              key={`${title}-${i}`}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full"
                style={{ backgroundColor: accentBg }}
              >
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={title}
                    loader={loader}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                ) : (
                  <IconComponent className="w-6 h-6 text-[color:var(--icon-color)]" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
                {description}
              </p>
            </motion.div>
          );
        })}
      </div>
      <style jsx>{`
        :root {
          --icon-color: ${primaryColor};
        }
      `}</style>
    </section>
  );
}
