"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  PlayIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  TrophyIcon,
  IdentificationIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import { 
  ChartBarSquareIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/components/site/EditableElement';

const getStatIcon = (label: string) => {
  const low = label.toLowerCase();
  if (low.includes("student")) return UserGroupIcon;
  if (low.includes("lab") || low.includes("specialized")) return ChartBarSquareIcon;
  if (low.includes("faculty") || low.includes("expert")) return AcademicCapIcon;
  return TrophyIcon;
};

export default function ProfessionalAboutSection({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const aboutDescription = storeFormData?.description || "Empowering the next generation with a rigorous, industry-aligned curriculum and a focus on holistic professional development.";
  const videoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f";
  
  const stats = storeFormData?.stats || [
    { label: "Active Candidates", value: "5,000+" },
    { label: "Research Labs", value: "12" },
    { label: "Senior Faculty", value: "85" },
  ];

  return (
    <section className="relative py-32 bg-white border-b border-gray-100 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-stretch">
          
          {/* --- Left: The Visual Asset (6 Columns) --- */}
          <div className="lg:col-span-6 relative group">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-full min-h-[450px] bg-gray-900"
            >
              <EditableElement targetId="courses2.home.about.videoThumbnail" fieldType="image" label="About Video Thumbnail">
                <Image decoding="async"
                  src={videoThumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                  alt="Institutional Video"
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:opacity-60"
                />
              </EditableElement>
              
              {/* Professional Play Interface */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  className="w-20 h-20 bg-white flex items-center justify-center shadow-2xl transition-all group-hover:bg-opacity-100 pointer-events-auto"
                >
                  <PlayIcon className="w-8 h-8 text-gray-900" />
                </motion.button>
                <div className="mt-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-2">Internal Media</p>
                  <p className="text-sm font-bold text-white italic">"The Standard of Excellence" Overview</p>
                </div>
              </div>

              {/* Technical Overlay Label */}
              <div className="absolute top-0 right-0 bg-white p-6 border-l border-b border-gray-100 hidden md:block">
                <GlobeAltIcon className="w-6 h-6 text-gray-300 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Regional HQ</span>
              </div>
            </motion.div>
          </div>

          {/* --- Right: The Institutional Narrative (6 Columns) --- */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <IdentificationIcon className="w-5 h-5" style={{ color: primaryColor }} />
                <EditableElement targetId="courses2.home.about.badge" fieldType="text" label="About Badge">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Executive Summary</span>
                </EditableElement>
              </div>

              <EditableElement targetId="courses2.home.about.title" fieldType="text" label="About Title">
                <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter leading-[0.95] mb-10">
                  A legacy built on <br />
                  <span className="text-gray-300 italic font-light">rigor and merit.</span>
                </h2>
              </EditableElement>

              <EditableElement targetId="courses2.home.about.description" fieldType="textarea" label="About Description">
                <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-xl font-medium border-l-2 pl-8" style={{ borderColor: `${primaryColor}20` }}>
                  {aboutDescription}
                </p>
              </EditableElement>

              {/* Stats Ledger - Clean Horizontal Lines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 border-y border-gray-100 mb-12">
                {stats.map((stat: any, i: number) => {
                  const Icon = getStatIcon(stat.label);
                  return (
                    <div key={i} className="bg-white py-8 flex flex-col gap-2">
                      <EditableElement targetId={`courses2.home.about.stat${i}.value`} fieldType="text" label={`Stat ${i + 1} Value`}>
                        <span className="text-3xl font-bold text-gray-900 tracking-tighter">{stat.value}</span>
                      </EditableElement>
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                        <EditableElement targetId={`courses2.home.about.stat${i}.label`} fieldType="text" label={`Stat ${i + 1} Label`}>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                        </EditableElement>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Suite */}
              <div className="flex flex-wrap items-center gap-10">
                <EditableElement targetId="courses2.home.about.cta" fieldType="text" label="About CTA Button">
                  <button 
                    type="button"
                    className="px-10 py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Governance Profile
                  </button>
                </EditableElement>
                
                <div className="flex items-center gap-4 group cursor-pointer border-b border-transparent hover:border-gray-900 pb-1 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Virtual Campus Tour</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Background Grid Detail (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10" 
           style={{ backgroundImage: `radial-gradient(${primaryColor} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
    </section>
  );
}