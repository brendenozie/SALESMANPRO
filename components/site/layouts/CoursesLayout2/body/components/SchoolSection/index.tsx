"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowRightIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  CheckBadgeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'; // Consistent Heroicons

const IconMap = {
  AcademicCapIcon,
  LightBulbIcon,
  UserGroupIcon,
  CheckBadgeIcon,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function ProfessionalExcellenceSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const mainDescription = storeFormData?.description || "Empowering the next generation with a rigorous, industry-aligned curriculum and a focus on holistic professional development.";
  
  const coreValues = storeFormData?.CoreValues?.slice(0, 4) || [
    { title: "Academic Rigor", icon: "AcademicCapIcon" },
    { title: "Strategic Thinking", icon: "LightBulbIcon" },
    { title: "Collaborative Leadership", icon: "UserGroupIcon" },
    { title: "Global Accreditation", icon: "CheckBadgeIcon" }
  ];

  const imageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f";

  return (
    <section className="relative py-32 bg-[#fafafa] overflow-hidden border-t border-gray-100">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-20 items-start">
          
          {/* --- Left: The Intellectual Foundation (7 Columns) --- */}
          <div className="lg:col-span-7">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {/* Institutional Badge */}
              <motion.div variants={fadeUp} className="flex items-center gap-4 mb-10">
                <div className="h-[1px] w-12 bg-gray-300" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
                  Institutional Framework
                </span>
              </motion.div>

              <motion.h2 
                variants={fadeUp}
                className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tighter mb-10"
              >
                Defining the <span className="text-gray-400 font-light italic">standard</span> of modern education.
              </motion.h2>

              <motion.p 
                variants={fadeUp}
                className="text-xl text-gray-600 mb-16 leading-relaxed max-w-2xl font-medium"
              >
                {mainDescription}
              </motion.p>

              {/* High-Trust Value List */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-y-12 gap-x-8 mb-16">
                {coreValues.map((item: any, i: number) => {
                  const Icon = IconMap[item.icon as keyof typeof IconMap] || CheckBadgeIcon;
                  return (
                    <div key={i} className="group flex flex-col items-start gap-4">
                      <div 
                        className="w-12 h-12 flex items-center justify-center border border-gray-200 bg-white transition-all group-hover:border-gray-900"
                        style={{ color: i % 2 === 0 ? primaryColor : 'inherit' }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">{item.title}</h4>
                        <div className="h-[2px] w-8 bg-gray-100 group-hover:w-full transition-all duration-500" style={{ backgroundColor: `${primaryColor}20` }} />
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                          Standardized protocols integrated into our core global curriculum frameworks.
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Corporate Action Suite */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-10 pt-10 border-t border-gray-100">
                <button 
                  className="px-12 py-5 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 shadow-2xl shadow-gray-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  Request Prospectus
                </button>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">Governance & Quality</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-2" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* --- Right: The Visual Authority (5 Columns) --- */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] bg-gray-200 shadow-[40px_40px_80px_-20px_rgba(0,0,0,0.1)]"
            >
              <Image
                src={imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                alt="Institutional Excellence"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                priority
                loader={({src}) => src}
              />
              
              {/* Data Overlay Badge */}
              <div className="absolute -left-10 bottom-20 bg-white p-8 border border-gray-100 shadow-2xl hidden xl:block max-w-[200px]">
                <ShieldCheckIcon className="w-8 h-8 mb-4" style={{ color: primaryColor }} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                <p className="text-sm font-bold text-gray-900 italic">Fully Accredited Institution 2026</p>
              </div>
            </motion.div>

            {/* Background Structural Accent */}
            <div 
              className="absolute -top-10 -right-10 w-full h-full border-t-[16px] border-r-[16px] border-gray-100 -z-10" 
              style={{ borderColor: `${primaryColor}08` }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}