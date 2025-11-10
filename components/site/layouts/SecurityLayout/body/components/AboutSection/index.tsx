'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon, 
  GlobeAltIcon,   
  ServerStackIcon, 
  BeakerIcon,     
  ArrowRightIcon,
} from '@heroicons/react/24/solid'; 
import Image from 'next/image';
import { HeroSlide, Stat } from '@/types/typings';

// Mocking context/data for self-contained example (same data as Dark Mode)
const storeData = {
  name: 'SecurePro Tech',
  tagline: 'Unwavering commitment to digital defense and compliance.',
  description: `As a premier cybersecurity firm, our mission is to deliver next-generation defense solutions that guarantee business continuity and compliance. We combine elite human intelligence with automated systems to predict, detect, and neutralize threats before they impact your operations. Our dedication is to transform your security from a cost center into a core competitive advantage.`,
  themeSettings: {
    primaryColor: '#00A880', // Teal/Green (Safety)
    secondaryColor: '#3B82F6', // Blue (Trust/Tech)
    accentColor: '#F97316', 
  },
  stats: [
    { label: 'Threats Neutralized', value: '1.2M+' },
    { label: 'Client Uptime (2024)', value: '99.99%' },
    { label: 'Global Certifications', value: '50+' },
    { label: 'Incident Response Time', value: '< 15m' },
  ],
  heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1593720219276-0b1e447cc362?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
};

// Next.js Image Loader
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion Variants (kept for smooth experience)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const statIconMap = [
    GlobeAltIcon,
    ServerStackIcon,
    BeakerIcon,
    ShieldCheckIcon,
]

interface AboutSectionProps {
    name: string;
    tagline: string | undefined | null;
    bannerUrl:string | undefined | null;
    description: string | undefined | null;
    themeSettings: Record<string, any> | undefined | null;
    stats:Stat[] | undefined | null;
    heroSlides: HeroSlide[] | undefined | null;
    slug:string  | undefined | null;
    contactEmail:string  | undefined | null;
}

export default function AboutSectionSecurityLight({ name, tagline, bannerUrl, description, themeSettings, stats, heroSlides, slug, contactEmail }:AboutSectionProps) {
  
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
      <section id="about" className="relative overflow-hidden bg-gray-50 text-gray-900 py-24 md:py-32">
        
        {/* Dynamic Background Shapes - Light Mode */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply opacity-10 filter blur-3xl"
            style={{ backgroundColor: primaryColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full mix-blend-multiply opacity-8 filter blur-3xl"
            style={{ backgroundColor: secondaryColor }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Image with "floating" card effect */}
          <motion.div
            className="relative w-full max-w-md h-[550px] md:h-[650px] mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 transition-all duration-500 group"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            style={{ borderColor: primaryColor }} 
          >
            <Image
              src={imgSrc}
              alt={`Data security network visualization`} 
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-500 brightness-90" // Keep image slightly dark for professional contrast
              loader={loader}
            />
            {/* Overlay for Depth in Light Mode */}
            <div className="absolute inset-0 bg-white/20" /> 
            
          </motion.div>

          {/* Right Column: Text Content and Stats Grid */}
          <motion.div
            className="flex flex-col justify-center space-y-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.p
              className="uppercase tracking-[0.3em] text-sm font-bold text-gray-500"
              variants={itemVariants}
            >
              Who Protects Your Assets
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 drop-shadow-sm"
              variants={itemVariants}
            >
              Building a Foundation of <span style={{ color: primaryColor }}>Cyber Resilience</span>
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-prose"
              variants={itemVariants}
            >
              {aboutText}
            </motion.p>

            {/* Stats Grid - High-impact security metrics */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4 border-t border-b border-gray-300 mt-4" // Subtle light gray border
              variants={sectionVariants}
            >
              {statsData.map(({ label, value }, idx) => {
                  const Icon = statIconMap[idx % statIconMap.length]; 
                  return (
                    <motion.div
                      key={idx}
                      className="flex flex-col items-start space-y-1"
                      variants={statVariants}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" style={{ color: secondaryColor }} />
                        <p className="text-3xl md:text-4xl font-extrabold" style={{ color: primaryColor }}>
                          {value}
                        </p>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                        {label}
                      </p>
                    </motion.div>
                  );
              })}
            </motion.div>

            {/* Call to Action - More prominent button */}
            <motion.div variants={itemVariants} className="mt-8">
              <a
                href={contactHref}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: secondaryColor,
                  color: 'white',
                  // Subtler shadow for light mode
                  boxShadow: `0 8px 25px ${secondaryColor}44`, 
                }}
              >
                Schedule a Security Consultation
                <ArrowRightIcon className="ml-3 w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}