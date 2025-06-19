'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function FeaturesSection() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    bannerUrl,
    themeSettings,
    marketplaceListings = [],
    stats = [],
    metrics = [],
    pricingTiers = [],
  } = storeFormData;

  const features = [
    {
      Icon: CheckIcon,
      title: 'Effortless Booking',
      description: 'Book any service in seconds—anywhere, anytime.',
    },
    {
      Icon: UserGroupIcon,
      title: 'Top Service Providers',
      description: `Choose from ${marketplaceListings.length}+ skilled professionals.`,
    },
    {
      Icon: LockClosedIcon,
      title: 'Secure Payments',
      description: 'Protected transactions with MPESA & more.',
    },
    {
      Icon: AdjustmentsVerticalIcon,
      title: 'Tailored Packages',
      description: pricingTiers[0]?.description || 'Pick what suits your needs.',
    },
    {
      Icon: ClockIcon,
      title: 'Live Availability',
      description: 'Book in real-time and avoid surprises.',
    },
    {
      Icon: Cog6ToothIcon,
      title: 'Trusted & Vetted',
      description: 'Each expert is hand-verified for quality service.',
    },
  ];

  const primaryColor = themeSettings?.primaryColor || '#10b981';

  const featuredPricing = pricingTiers.find((p) => p.isFeatured);

  return (
    <section className="relative bg-gray-950 py-24 px-6 sm:px-12 text-white overflow-hidden">
      {/* Background blur and glow */}
      <div className="absolute inset-0 -z-10">
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt={`${name} background`}
            fill
            loader={loader}
            className="object-cover opacity-10"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          className="inline-block text-sm font-semibold bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          What You’ll Love
        </motion.span>

        <motion.h2
          className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Why Choose {name}
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {description || 'Enjoy fast, flexible and reliable service booking — from anywhere.'}
        </motion.p>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map(({ Icon, title, description }, i) => (
          <motion.div
            key={title}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div
              className="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md mb-4"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #6366f1)`,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition">
              {title}
            </h3>
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          </motion.div>
        ))}
      </div>
      {/* Pricing & Stats */}
      <div className="mt-20 max-w-3xl mx-auto text-center space-y-4">
        {featuredPricing && (
          <>
            <h4 className="text-xl font-bold text-emerald-400">
              Starting at KES {featuredPricing.price}
            </h4>
            <p className="text-sm text-gray-300">{featuredPricing.description}</p>
          </>
        )}

        {(stats.length > 0 || metrics.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-10">
            {[...stats, ...metrics].map(({ label, value, iconUrl }, i) => (
              <motion.div
                key={label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    loader={loader}
                    alt={label}
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                )}
                <h5 className="text-lg font-bold text-white">{value}</h5>
                <p className="text-sm text-gray-400">{label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
