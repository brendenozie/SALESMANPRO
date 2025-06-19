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

const features = [
  {
    Icon: CheckIcon,
    title: 'Effortless Booking',
    description: 'Book your massage in seconds—anywhere, anytime.',
  },
  {
    Icon: UserGroupIcon,
    title: 'Choose Your Therapist',
    description: 'Select from top-rated, vetted professionals.',
  },
  {
    Icon: LockClosedIcon,
    title: 'Secure Payments',
    description: 'Protected transactions via trusted gateways.',
  },
  {
    Icon: AdjustmentsVerticalIcon,
    title: 'Custom Options',
    description: 'Tailor services to your exact needs.',
  },
  {
    Icon: ClockIcon,
    title: 'Real-Time Scheduling',
    description: 'View and manage bookings on your time.',
  },
  {
    Icon: Cog6ToothIcon,
    title: 'Vetted Experts',
    description: 'Skilled, licensed, and passionate therapists.',
  },
];

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function FeaturesSection() {
  return (
    <section className="relative bg-white py-28 px-6 sm:px-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/spa-massage.jpg"
          alt="Blurred spa background"
          fill
          className="object-cover opacity-10"
          loader={loader}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white/95" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          className="inline-block text-sm font-semibold bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          What You’ll Love
        </motion.span>

        <motion.h2
          className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          A New Way to Book Wellness
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Enjoy modern convenience with a platform built for ease, clarity, and comfort. Every detail of your journey is refined for satisfaction.
        </motion.p>
      </div>

      {/* Features Grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map(({ Icon, title, description }, i) => (
          <motion.div
            key={title}
            className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 mb-5 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
