"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  StarIcon, 
  UsersIcon, 
  AcademicCapIcon,
  ArrowRightIcon,
  BookmarkSquareIcon,
  CommandLineIcon,
  BeakerIcon,
  PaintBrushIcon
} from '@heroicons/react/24/solid'; 

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const CourseCard = ({ course, primaryColor }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full bg-white border border-gray-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]"
    >
      {/* IMAGE CONTAINER with "Museum Frame" padding */}
      <div className="relative aspect-[16/10] overflow-hidden p-3 bg-white">
        <div className="relative w-full h-full overflow-hidden">
           <Image decoding="async"
            src={course.imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80'}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Subtle Color Wash on Hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* Floating Grade Badge - Minimalist */}
        {course.gradeLevel && (
          <div className="absolute top-6 left-6">
            <span 
              className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl" 
              style={{ backgroundColor: primaryColor }}
            >
              {course.gradeLevel}
            </span>
          </div>
        )}
      </div>

      {/* CONTENT: THE ACADEMIC BRIEF */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-6 bg-gray-200" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Core Curriculum</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
          {course.description}
        </p>
        
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <StarIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black text-gray-900">{course.averageRating || '5.0'}</span>
             </div>
             <div className="h-3 w-px bg-gray-200" />
             <div className="flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Capacity: {course.enrolledStudents || 'Limited'}</span>
             </div>
          </div>
          
          <motion.div 
            whileHover={{ x: 3 }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer"
            style={{ color: primaryColor }}
          >
            Syllabus
            <ArrowRightIcon className="w-3 h-3" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CoursesSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';

  const coursesToRender = storeFormData?.courses?.length > 0 ? storeFormData.courses : [
    { id: '1', title: 'Language & Literacy', description: 'Advanced phonics and creative storytelling designed to foster early global communication skills.', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80', gradeLevel: 'Level 1-3', averageRating: 5.0, enrolledStudents: '24/30' },
    { id: '2', title: 'STEM Discovery', description: 'Interactive modules in logic, basic robotics, and environmental sciences for young minds.', imageUrl: 'https://images.unsplash.com/photo-1564410267841-915d8f4d71ea?auto=format&fit=crop&q=80', gradeLevel: 'All Stages', averageRating: 4.9, enrolledStudents: 'Full' },
    { id: '3', title: 'Creative Arts & Culture', description: 'Exploring global heritage through visual arts, music theory, and performance.', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80', gradeLevel: 'Elective', averageRating: 5.0, enrolledStudents: '12/20' },
  ];

  return (
    <section className="py-24 lg:py-40 bg-white px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* SECTION HEADER: Institutional Alignment */}
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-end mb-20">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic">Global Pedagogy</span>
              <div className="h-px flex-grow bg-gray-100" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-gray-900 tracking-tighter leading-none">
              Featured <span className="italic font-light text-gray-400">Programs.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <p className="text-gray-500 font-medium mb-6 text-sm lg:text-base max-w-xs lg:ml-auto">
              A comprehensive framework designed for early-years cognitive and social excellence.
            </p>
            <button 
              className="text-[10px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-3 border-b-2 pb-2 transition-all hover:gap-5"
              style={{ color: primaryColor, borderColor: `${primaryColor}20` }}
            >
              Explore Full Curriculum
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CURRICULUM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {coursesToRender.map((course: any) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              primaryColor={primaryColor} 
            />
          ))}
        </div>

        {/* SIDE WATERMARK: Consistent with About Section */}
        <div className="absolute top-1/2 -right-20 -rotate-90 origin-center hidden xl:block pointer-events-none">
          <span className="text-[10rem] font-serif font-black text-gray-50 opacity-[0.4] select-none tracking-tighter">
            PROSPECTUS
          </span>
        </div>
      </div>
    </section>
  );
}