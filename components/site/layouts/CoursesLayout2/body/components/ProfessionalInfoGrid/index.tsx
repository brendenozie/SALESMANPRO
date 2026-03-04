"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  AcademicCapIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  BriefcaseIcon 
} from "@heroicons/react/24/outline"; // Heroicons
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import clsx from 'clsx';

// --- Professional Animation Variant ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] } 
  }
};

const InfoCard = ({ title, description, icon: Icon, image, link, primaryColor }: any) => {
  return (
    <motion.div 
      variants={cardFadeUp}
      className="group flex flex-col bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300"
    >
      {/* 1. Image Header (Optional) */}
      {image && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Image+Unavailable";
            }}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
          />
        </div>
      )}

      {/* 2. Content Body */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <div 
            className="p-2.5 bg-gray-50 border border-gray-100 transition-colors group-hover:bg-white"
            style={{ color: primaryColor }}
          >
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-gray-500 transition-colors">
            Insight
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        {/* 3. Footer Action */}
        <a 
          href={link || "#"} 
          className="inline-flex items-center text-xs font-black uppercase tracking-[0.15em] text-gray-900 group-hover:opacity-70 transition-all"
        >
          View Documentation
          <ArrowRightIcon className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </motion.div>
  );
};

export default function ProfessionalInfoGrid({storeFormData}: { storeFormData: any }) {
  // const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';

  // Mapping dynamic stats or fallback to high-quality corporate buckets
  const infoData = [
    {
      title: 'Strategic Curriculum',
      description: 'Validated by industry leaders to ensure every module translates directly into professional competency.',
      icon: BriefcaseIcon,
      image: "https://images.unsplash.com/photo-1454165833767-027ffea9e778?q=80&w=1000",
      link: '#curriculum'
    },
    {
      title: 'Measurable Outcomes',
      description: 'Track your trajectory with advanced analytics and performance-based assessment frameworks.',
      icon: ChartBarIcon,
      image: null, // Minimalist version
      link: '#analytics'
    },
    {
      title: 'Global Network',
      description: 'Connect with a curated community of alumni and professionals across 40+ countries.',
      icon: UserGroupIcon,
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000",
      link: '#community'
    },
    {
        title: 'Accredited Success',
        description: 'Every program is backed by institutional certification, providing lasting credibility to your portfolio.',
        icon: AcademicCapIcon,
        image: null,
        link: '#accreditation'
      }
  ];

  return (
    <section className="relative z-20 py-24 bg-white px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section for the Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: primaryColor }}>
              Infrastructure
            </h2>
            <p className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              A structured approach to <br /> 
              <span className="text-gray-400 font-light">professional development.</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            We provide the technical and theoretical foundation required for high-stakes career transitions.
          </p>
        </div>

        {/* The Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {infoData.map((item, idx) => (
            <InfoCard 
              key={idx} 
              {...item} 
              primaryColor={primaryColor} 
            />
          ))}
        </motion.div>

        {/* Optional Bottom Line for visual finish */}
        <div className="mt-20 border-t border-gray-100 pt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <span>System Vers. 2026.1</span>
            <span>Security Verified</span>
        </div>
      </div>
    </section>
  );
}