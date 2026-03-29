"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  AcademicCapIcon, 
  CheckBadgeIcon, 
  PlayIcon, 
  ClockIcon, 
  UsersIcon, 
  GlobeAltIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function CourseDetailView({ course, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const [activeModule, setActiveModule] = useState<number | null>(0);

  // Mock curriculum if none provided
  const curriculum = [
    { title: "Foundations & Theory", duration: "4 Weeks", topics: ["Core Concepts", "Historical Context", "Safety Protocols"] },
    { title: "Advanced Methodologies", duration: "6 Weeks", topics: ["Applied Techniques", "Case Studies", "Collaborative Projects"] },
    { title: "Capstone & Certification", duration: "2 Weeks", topics: ["Final Assessment", "Portfolio Review", "Industry Integration"] },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] font-sans selection:bg-blue-100">
      
      {/* --- HERO SECTION: SPLIT IMMERSION --- */}
      <section className="relative lg:h-screen flex flex-col lg:flex-row overflow-hidden border-b border-slate-100 dark:border-zinc-900">
        <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center relative z-10 bg-white dark:bg-[#050505]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="px-4 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {course.gradeLevel || 'Advanced Placement'}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <StarIconSolid className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">4.9 (1.2k Reviews)</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white leading-[1.1] mb-8">
              {course.title || "Modern Architectural Principles"}
            </h1>

            <p className="text-lg text-slate-500 dark:text-zinc-400 font-light leading-relaxed max-w-xl mb-12">
              {course.description || "Master the intersection of classical aesthetics and modern engineering. A comprehensive pathway designed for the next generation of innovators."}
            </p>

            <div className="flex flex-wrap gap-8 mb-12">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900">
                  <UsersIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Enrolled</p>
                  <p className="font-bold dark:text-white">{course.enrolledStudents?.toLocaleString() || '850'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900">
                  <GlobeAltIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Language</p>
                  <p className="font-bold dark:text-white">English / French</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 rounded-2xl text-white font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-500/20"
                style={{ backgroundColor: primaryColor }}
              >
                Enroll in Program
              </motion.button>
              <button className="px-10 py-5 rounded-2xl border border-slate-200 dark:border-zinc-800 font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <PlayIcon className="w-4 h-4 fill-current" /> Watch Trailer
              </button>
            </div>
          </motion.div>
        </div>

        {/* Hero Image / Visual Side */}
        <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-full bg-slate-100">
          <Image
            src={course.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200'}
            alt="Course Focus"
            fill
            className="object-cover"
            loader={loader}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#050505] via-transparent lg:block hidden" />
          
          {/* Floating Accolade */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 right-12 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl max-w-xs"
          >
            <CheckBadgeIcon className="w-10 h-10 text-blue-500 mb-4" />
            <p className="text-sm font-bold dark:text-white leading-tight">University Accredited Certification upon completion.</p>
          </motion.div>
        </div>
      </section>

      {/* --- CURRICULUM SECTION: INTERACTIVE ACCORDION --- */}
      <section className="py-32 px-6 lg:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-20">
          
          {/* Left: Content Info */}
          <div className="lg:col-span-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Course Outline</h2>
            <h3 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-8 leading-tight">
              A meticulously <span className="italic font-light">structured</span> learning experience.
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 mb-12 font-light leading-relaxed">
              We break down complex subjects into digestible modules, ensuring a balance between theoretical depth and practical application. 
            </p>

            <div className="space-y-4">
              {['12 Comprehensive Modules', 'Exclusive Interview Series', 'Downloadable Assets', 'Private Community Access'].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Curriculum List */}
          <div className="lg:col-span-7 space-y-4">
            {curriculum.map((module, idx) => (
              <div 
                key={idx}
                className={`group rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                  activeModule === idx 
                  ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black shadow-2xl' 
                  : 'border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50'
                }`}
              >
                <button 
                  onClick={() => setActiveModule(activeModule === idx ? null : idx)}
                  className="w-full p-8 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-4xl font-serif italic ${activeModule === idx ? 'opacity-40' : 'text-slate-200 dark:text-zinc-800'}`}>
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-lg tracking-tight">{module.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ClockIcon className="w-3.5 h-3.5 opacity-60" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform duration-500 ${activeModule === idx ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeModule === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 dark:border-black/10">
                        {module.topics.map((topic, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <AcademicCapIcon className="w-4 h-4 opacity-40" />
                            <span className="text-sm font-light">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STICKY MOBILE ACTION BAR --- */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/20 shadow-2xl flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Limited Access</p>
            <p className="text-lg font-bold dark:text-white">KSh 14,500</p>
          </div>
          <button 
            className="px-8 py-4 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest shadow-xl"
            style={{ backgroundColor: primaryColor }}
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}