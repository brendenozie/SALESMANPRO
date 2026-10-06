'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline'; 
import Image from 'next/image';
import { HeroSlide, Stat } from '@/types/typings';

const storeData = {
  name: 'SecurePro Tech',
  tagline: 'Unwavering commitment to digital defense and compliance.',
  description: `As a premier cybersecurity firm, our mission is to deliver next-generation defense solutions that guarantee business continuity and compliance. We combine elite human intelligence with automated systems to predict, detect, and neutralize threats before they impact your operations. Our dedication is to transform your security from a cost center into a core competitive advantage.`,
  themeSettings: {
    primaryColor: '#00A880', 
    secondaryColor: '#3B82F6', 
    accentColor: '#F97316', 
  },
  stats: [
    { label: 'Threats Neutralized', value: '1.2M+' },
    { label: 'Client Uptime', value: '99.99%' },
    { label: 'Global Certifications', value: '50+' },
    { label: 'Response Time', value: '< 15m' },
  ],
  heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1593720219276-0b1e447cc362?q=80&w=2670&auto=format&fit=crop' }],
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 22,
    },
  },
};

interface AboutSectionProps {
  name: string;
  tagline: string | undefined | null;
  bannerUrl: string | undefined | null;
  description: string | undefined | null;
  themeSettings: Record<string, any> | undefined | null;
  stats: Stat[] | undefined | null;
  heroSlides: HeroSlide[] | undefined | null;
  slug: string | undefined | null;
  contactEmail: string | undefined | null;
}

export default function AboutSectionSecurityLight({ name, tagline, bannerUrl, description, themeSettings, stats, heroSlides, slug, contactEmail }: AboutSectionProps) {
  
  const primaryColor = themeSettings?.primaryColor || storeData.themeSettings.primaryColor;
  const secondaryColor = themeSettings?.secondaryColor || storeData.themeSettings.secondaryColor;

  const title = name || storeData.name;
  const aboutText = description || storeData.description;

  const defaultStatsData = storeData.stats;
  const statsData = Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData;

  const imgSrc = bannerUrl || heroSlides?.[0]?.productImageUrl || heroSlides?.[0]?.imageUrl || storeData.heroSlides[0]?.productImageUrl;

  const contactHref = contactEmail ? `mailto:${contactEmail}` : slug ? `/${slug}/contact` : '/contact';

  return (
    <AnimatePresence>
      <section id="about" className="relative overflow-hidden bg-white text-gray-900 py-28 md:py-36 border-b border-gray-100">
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* VISUAL CONTROLLER CONTAINER */}
          <motion.div
            className="lg:col-span-5 relative w-full h-[480px] lg:h-[580px] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <Image decoding="async"
              src={imgSrc}
              alt="Data architecture and hardware matrix overview" 
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
              priority
            />
          </motion.div>

          {/* TELEMETRY OPERATIONAL SPEC SHEET CONTAINER */}
          <motion.div
            className="lg:col-span-7 flex flex-col justify-center text-left"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="inline-flex items-center gap-2 mb-4" variants={itemVariants}>
              <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Corporate Infrastructure
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]"
              variants={itemVariants}
            >
              Building Foundations for Continuous Resilience
            </motion.h2>

            <motion.p
              className="mt-6 text-xs text-gray-500 leading-relaxed max-w-2xl"
              variants={itemVariants}
            >
              {aboutText}
            </motion.p>

            {/* HIGH-DENSITY METRICS HUB */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-t border-b border-gray-100 my-8"
              variants={sectionVariants}
            >
              {statsData.slice(0, 4).map(({ label, value }, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-start justify-between"
                  variants={itemVariants}
                >
                  <p className="text-2xl font-black tracking-tight text-gray-900">
                    {value}
                  </p>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mt-1.5 leading-tight">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ACTION TRIGGERS */}
            <motion.div variants={itemVariants}>
              <a
                href={contactHref}
                className="inline-flex items-center gap-2 font-bold tracking-wide text-xs uppercase px-8 py-4 rounded-xl text-white shadow-md transition-all duration-300"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 6px 20px -4px ${primaryColor}30`,
                }}
              >
                Request Systems Auditing
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          </motion.div>
          
        </div>
      </section>
    </AnimatePresence>
  );
}