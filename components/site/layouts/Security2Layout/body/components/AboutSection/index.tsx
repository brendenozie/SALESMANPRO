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

const storeData = {
  name: 'SecurePro Tech',
  tagline: 'Unwavering commitment to digital defense and compliance.',
  description: `As a premier cybersecurity firm, our mission is to deliver next-generation defense solutions that guarantee business continuity and compliance. We combine elite human intelligence with automated systems to predict, detect, and neutralize threats before they impact your operations. Our dedication is to transform your security from a cost center into a core competitive advantage.`,
  themeSettings: {
    primaryColor: '#00A880',
    secondaryColor: '#3B82F6',
  },
  stats: [
    { label: 'Threats Neutralized', value: '1.2M+' },
    { label: 'Client Uptime', value: '99.99%' },
    { label: 'Global Certs', value: '50+' },
    { label: 'Incident Response', value: '< 15m' },
  ],
  heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1593720219276-0b1e447cc362?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'linear' },
  },
};

const statIconMap = [
  GlobeAltIcon,
  ServerStackIcon,
  BeakerIcon,
  ShieldCheckIcon,
];

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

  const title = name || storeData.name;
  const aboutText = description || storeData.description;

  const defaultStatsData = storeData.stats;
  const statsData = Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData;

  const imgSrc = bannerUrl || heroSlides?.[0]?.productImageUrl || heroSlides?.[0]?.imageUrl || storeData.heroSlides[0]?.productImageUrl;

  const contactHref = contactEmail ? `mailto:${contactEmail}` : slug ? `/${slug}/contact` : '/contact';

  return (
    <AnimatePresence>
      <section id="about" className="relative overflow-hidden bg-white text-gray-900 py-28 md:py-36 border-b border-gray-100">
        
        {/* STRUCTURAL BACKGROUND TELEMETRY MESHGRID */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-900 h-full" />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT TELEMETRY CONTAINER PANEL */}
          <motion.div
            className="lg:col-span-5 w-full relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="border border-gray-100 p-2 bg-gray-50/50">
              <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 border border-gray-200">
                <Image decoding="async"
                  src={imgSrc}
                  alt="Infrastructure security matrix blueprint" 
                  layout="fill"
                  objectFit="cover"
                  className=" mix-blend-multiply opacity-90 transition-all duration-300 group-hover:scale-102"
                  priority
                />
                {/* System identification overlay anchors */}
                <div className="absolute top-3 left-3 bg-gray-950 text-[9px] font-mono font-black text-white px-2 py-0.5 uppercase tracking-widest">
                  IMG_SRC // OPT_V01
                </div>
              </div>
            </div>
            
            {/* LOWER TECHNICAL ANCHOR BLOCK */}
            <div className="mt-4 flex items-center justify-between border-t border-b border-gray-100 py-3 px-1">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">[SYS_PERIMETER_SECURE]</span>
              <span className="text-[10px] font-mono text-gray-300">REF_ID // {title.toUpperCase().replace(/\s+/g, '_')}</span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: INDUSTRIAL CONTENT HARDENING ROUTINE */}
          <motion.div
            className="lg:col-span-7 flex flex-col space-y-10"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  OVERVIEW // IDENTITY_MATRIX
                </p>
              </div>

              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1] mb-6">
                BUILDING A FOUNDATION OF CYBER RESILIENCE
              </h2>

              <p className="text-xs font-mono text-gray-400 leading-relaxed uppercase max-w-xl">
                {tagline || storeData.tagline}
              </p>
            </div>

            <div className="border-t border-b border-gray-100 py-8">
              <p className="text-xs font-mono text-gray-500 leading-relaxed space-y-4 max-w-2xl">
                {aboutText}
              </p>
            </div>

            {/* PERFORMANCE LOG STATS MATRIX */}
            <div>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest block mb-4 text-gray-400">
                METRIC_TELEMETRY // PERFORMANCE_LOGS
              </span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-l border-gray-100">
                {statsData.map(({ label, value }, idx) => {
                  const Icon = statIconMap[idx % statIconMap.length]; 
                  const hexIndex = `0${idx + 1}`.slice(-2);
                  return (
                    <div
                      key={idx}
                      className="p-4 border-r border-b border-gray-100 flex flex-col justify-between min-h-[120px]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono font-bold text-gray-300">[MTRX_{hexIndex}]</span>
                        <Icon className="w-3 h-3 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xl font-mono font-black tracking-tighter text-gray-900">
                          {value}
                        </p>
                        <p className="text-[9px] font-mono font-bold uppercase tracking-tight text-gray-400 mt-1">
                          {label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROUTINE DISPATCH TRIGGER LINK */}
            <motion.div variants={itemVariants} className="pt-4">
              <a
                href={contactHref}
                className="inline-flex items-center gap-3 text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-4 px-6 w-fit border border-transparent hover:border-gray-950"
              >
                Schedule Security Consultation
                <ArrowRightIcon className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}