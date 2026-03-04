'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  StarIcon, 
  UsersIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'; // Using Outline for the Apple aesthetic
import { PlayIcon } from '@heroicons/react/24/solid';

const CourseCard = ({ course, primaryColor }: any) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500"
    >
      {/* 1. Immersive Media Header */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={course.imageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"}
            loader={({src})=>src}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Apple-style Frosted Grade Badge */}
        <div className="absolute top-6 left-6 backdrop-blur-md bg-white/70 border border-white/20 px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
            {course.gradeLevel || 'Standard'}
          </span>
        </div>
        
        {/* Subtle Play Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <PlayIcon className="w-6 h-6 text-slate-900" />
          </div>
        </div>
      </div>

      {/* 2. Refined Content Area */}
      <div className="p-10 flex flex-col flex-grow">
        {/* Metadata Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <StarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-900">{course.averageRating || '5.0'}</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">{course.enrolledStudents || '120'} Enrolled</span>
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-slate-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
          {course.description}
        </p>

        {/* Footer Action */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Full Term</span>
          </div>
          <button 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:gap-4 transition-all"
          >
            Details <ArrowRightIcon className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function MoriahProgramsSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const courses = storeFormData?.courses?.length > 0 ? storeFormData.courses : [
    { id: 1, title: 'Early Years Foundation', description: 'Nurturing curiosity through play-based international learning standards.', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', gradeLevel: 'Playgroup' },
    { id: 2, title: 'Primary Discovery Path', description: 'Academic rigor balanced with character development and creative arts.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', gradeLevel: 'Grade 1-6' },
    { id: 3, title: 'Junior Secondary Innovation', description: 'Specialized STEM curriculum designed for the next generation of leaders.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7', gradeLevel: 'Grade 7-9' },
  ];

  return (
    <section className="py-32 bg-[#fafafa] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.02),transparent)]" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full mb-6">
              <SparklesIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Curriculum Excellence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 tracking-tight leading-[1.1]">
              Explore our <span className="font-semibold">flagship programs.</span>
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 shadow-sm hover:shadow-md transition-all"
          >
            View All Programs
          </motion.button>
        </div>

        {/* The Course Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.slice(0, 3).map((course: any, idx: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <CourseCard course={course} primaryColor={primaryColor} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 py-12 border-y border-slate-100 flex flex-wrap justify-center md:justify-between items-center gap-12"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-900">KICD Approved</p>
                <p className="text-xs text-slate-400 font-medium">National Curriculum Standards</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-slate-200">
             <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
          </div>
          <div className="flex flex-col items-center md:items-start">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Accredited Partner</p>
             <div className="flex gap-8 grayscale opacity-50">
                <span className="text-lg font-black tracking-tighter text-slate-900 italic">CAMBRIDGE</span>
                <span className="text-lg font-black tracking-tighter text-slate-900 italic">CBC</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}