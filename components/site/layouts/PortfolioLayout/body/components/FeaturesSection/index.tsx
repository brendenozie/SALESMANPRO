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

import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

const icons = {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
};

type IconKey = keyof typeof icons;

// Fallback data for a standalone preview to make the component self-contained
const storeData = {
  themeSettings: {
    primaryColor: '#06b6d4',
    accentColor: '#f472b6',
  },
  tagline: 'Delivering exceptional services with a personal touch.',
  bannerUrl: null, // Placeholder, can be replaced with a real URL if needed
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Animation variants for a springy, staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function FeaturesClient() {

  const { storeFormData } = useStoreContext() as {storeFormData : StoreForm};
  
  const { themeSettings = {}, bannerUrl, tagline } = storeFormData || storeData;
  

  const primary = themeSettings?.primaryColor || "#06b6d4";
  const highlight = themeSettings?.accentColor || "#10B981";
  
  const features: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "CheckIcon", title: "Creative Portfolio", desc: "Showcase of selected works and case studies to highlight my expertise." },
    { icon: "UserGroupIcon", title: "Client Testimonials", desc: "Real feedback from clients I have collaborated with, demonstrating impact." },
    { icon: "AdjustmentsVerticalIcon", title: "Personal Branding", desc: "Tailored strategies to build and elevate your personal brand presence." },
    { icon: "ClockIcon", title: "Consultation", desc: "Schedule a session to discuss projects, career guidance, or collaboration." },
    { icon: "LockClosedIcon", title: "Secure Collaborations", desc: "Confidential and professional engagement on all projects and contracts." },
    { icon: "Cog6ToothIcon", title: "Custom Solutions", desc: "Bespoke services aligned to your unique goals and industry requirements." },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-12 bg-white text-gray-900 overflow-hidden">
      {/* Dynamic, blurred radial gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gray-50/50 backdrop-filter backdrop-blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${primary}2A 0%, transparent 60%)`,
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
        <motion.span
          className="inline-block text-sm font-semibold px-5 py-2 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-100 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          My Expertise & Services
        </motion.span>
        <motion.h2
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Why Clients <span style={{ color: primary }}>Choose My Services</span>
        </motion.h2>
        {tagline && (
          <motion.p
            className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            {tagline}
          </motion.p>
        )}
      </div>

      {/* Feature Cards Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map(({ icon, title, desc }, idx) => {
          const Icon = icons[icon];
          return (
            <motion.div
              key={title}
              className="group bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl hover:shadow-2xl hover:shadow-emerald-100/60 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              variants={itemVariants}
              whileHover={{ scale: 1.03, translateY: -5 }}
            >
              {/* Subtle light glow on hover (behind content) */}
              <div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at center, ${primary}22 0%, transparent 70%)`,
                  filter: 'blur(30px)',
                }}
              />
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-5 relative z-10"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${primary}, ${highlight})`,
                  boxShadow: `0 0 15px ${primary}66`,
                }}
              >
                <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 relative z-10">
                {title}
              </h3>
              <p className="text-md text-gray-600 mt-2 relative z-10">{desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
