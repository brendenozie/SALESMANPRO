'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const IconMap = {
  AcademicCapIcon,
  LightBulbIcon,
  UserGroupIcon,
  CheckCircleIcon,
};

export default function MoriahExcellenceSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const headline = storeFormData?.name || "Unlock Your Academic Excellence";
  const mainDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths.";
  
  const coreValues = storeFormData?.CoreValues?.slice(0, 4) || [];
  const imageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f";

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Background Accent - Ultra soft */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(30,64,175,0.03)_0%,rgba(255,255,255,0)_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* --- Left: The Visual Storytelling (5 Columns) --- */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Main Subject Image - Using an Apple-style rounded bezel */}
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-white">
                <Image
                  src={imageUrl}
                  loader={({src})=>src}
                  alt="Academic Excellence"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Glass Value Cards - Displaced for Depth */}
              <div className="absolute -right-12 top-10 flex flex-col gap-4 z-20">
                {coreValues.slice(0, 2).map((item: any, i: number) => {
                  const Icon = IconMap[item.icon as keyof typeof IconMap] || AcademicCapIcon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white/80 backdrop-blur-xl border border-white p-5 rounded-[2rem] shadow-xl flex items-center gap-4 w-64"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{item.title}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Decorative Blur Element */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-[60px] -z-10" />
            </motion.div>
          </div>

          {/* --- Right: The Content (7 Columns) --- */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">The Moriah Standard</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-light text-slate-900 leading-[1.1] tracking-tight mb-8">
                Building a <span className="font-semibold">legacy of excellence</span> in every child.
              </h2>

              <p className="text-xl text-slate-500 mb-12 leading-relaxed font-normal">
                {mainDescription}
              </p>

              {/* The "Bottom Half" Grid for remaining values */}
              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                {coreValues.slice(2, 4).map((item: any, i: number) => {
                  const Icon = IconMap[item.icon as keyof typeof IconMap] || CheckCircleIcon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-400">Integrated into our daily international curriculum.</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Suite */}
              <div className="flex flex-wrap items-center gap-8">
                <button className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-slate-200">
                  Join the Community
                </button>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">Learn more</span>
                  <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                    <ArrowRightIcon className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}