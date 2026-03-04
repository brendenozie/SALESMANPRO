"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  StarIcon, 
  UsersIcon, 
  ArrowUpRightIcon, 
  BookmarkIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'; // Using outline for refinement
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// --- Refined Course Card ---
const CourseCard = ({ course, primaryColor, secondaryColor }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
    >
      {/* 1. Image Header with Glass Badge */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={course.imageUrl || 'https://images.unsplash.com/photo-1523050335102-c62595487d15?q=80&w=800'}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loader={loader}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
        
        {/* Floating Grade Badge */}
        {course.gradeLevel && (
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
              {course.gradeLevel}
            </span>
          </div>
        )}

        {/* Save/Bookmark Icon */}
        <button className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 transition-all">
          <BookmarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Content Body */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <StarIconSolid className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-slate-900">{course.averageRating || '5.0'}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <UsersIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-tighter">
              {course.enrolledStudents?.toLocaleString() || '120'} Enrolled
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
          {course.title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-light">
          {course.description}
        </p>

        {/* 3. Actions */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <a 
            href={course.ctaLink || "#"} 
            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2 group/link"
          >
            Explore Curriculum 
            <ArrowUpRightIcon className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Enroll
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CoursesSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const courses = storeFormData?.courses?.length > 0 ? storeFormData.courses : [
    { title: "Advanced Mathematics", description: "Exploring complex calculus and theoretical physics for high-achievers.", gradeLevel: "Grade 10-12", enrolledStudents: 450 },
    { title: "Classical Literature", description: "A deep dive into the foundations of Western thought and contemporary prose.", gradeLevel: "Grade 9-12", enrolledStudents: 320 },
    { title: "Robotics & AI", description: "Hands-on engineering focusing on future-ready automation and software logic.", gradeLevel: "STEM Elective", enrolledStudents: 280 }
  ];

  return (
    <section className="py-32 bg-[#FCFCFD] relative overflow-hidden">
      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Academic Catalog
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.1]">
              Our <span className="italic font-light" style={{ color: primaryColor }}>Flagship</span> <br /> 
              Learning Pathways
            </h2>
          </div>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-light border-l-2 border-slate-100 pl-6 mb-2">
            Each program is curated by faculty experts to ensure academic rigor while fostering individual curiosity.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course: any, i: number) => (
            <CourseCard 
              key={i} 
              course={course} 
              primaryColor={primaryColor} 
              secondaryColor={secondaryColor} 
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <button 
            className="group inline-flex flex-col items-center gap-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-900 transition-colors">
              Discover All {courses.length}+ Programs
            </span>
            <div className="w-px h-12 bg-slate-200 group-hover:h-16 group-hover:bg-slate-900 transition-all duration-500" />
          </button>
        </div>
      </div>
    </section>
  );
}