"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  UsersIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  QueueListIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/components/site/EditableElement';

const CourseCard = ({ course, primaryColor, index }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-gray-100 transition-all duration-500 hover:border-gray-900"
    >
      {/* 1. Technical Image Header */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <EditableElement targetId={`courses2.home.courses.course${index}.imageUrl`} fieldType="image" label={`Course ${index + 1} Image`}>
          <Image decoding="async"
            src={course.imageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"}
            alt={course.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
          />
        </EditableElement>
        
        {/* Sharp Corporate Label */}
        <div 
          className="absolute bottom-0 left-0 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <EditableElement targetId={`courses2.home.courses.course${index}.gradeLevel`} fieldType="text" label={`Course ${index + 1} Grade`}>
            <span>{course.gradeLevel || 'Standard'}</span>
          </EditableElement>
        </div>
      </div>

      {/* 2. Professional Content Block */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {course.enrolledStudents || '120'} Candidates
            </span>
          </div>
          <div className="w-[1px] h-3 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Term</span>
          </div>
        </div>

        <EditableElement targetId={`courses2.home.courses.course${index}.title`} fieldType="text" label={`Course ${index + 1} Title`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            {course.title}
          </h3>
        </EditableElement>
        
        <EditableElement targetId={`courses2.home.courses.course${index}.description`} fieldType="textarea" label={`Course ${index + 1} Description`}>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
            {course.description}
          </p>
        </EditableElement>

        {/* 3. The "Specifications" Footer */}
        <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Framework</span>
            <span className="text-[11px] font-bold text-gray-900 uppercase italic">Global Std.</span>
          </div>
          <button 
            type="button"
            className="flex items-center justify-end gap-2 text-xs font-black uppercase tracking-widest text-gray-900 group-hover:text-blue-600 transition-colors"
          >
            Syllabus <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProfessionalProgramsSection({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  
  const courses = storeFormData?.courses && storeFormData?.courses?.length > 0 ? storeFormData.courses : [
    { id: 1, title: 'Early Years Foundation', description: 'Nurturing curiosity through play-based international learning standards and cognitive development frameworks.', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', gradeLevel: 'Level I' },
    { id: 2, title: 'Primary Discovery Path', description: 'Academic rigor balanced with character development, creative arts, and foundational logic.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', gradeLevel: 'Level II' },
    { id: 3, title: 'Junior Secondary Innovation', description: 'Specialized STEM curriculum designed for high-performance leaders and future technical innovators.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7', gradeLevel: 'Level III' },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden border-b border-gray-100">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Swiss Grid Style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <QueueListIcon className="w-5 h-5" style={{ color: primaryColor }} />
              <EditableElement targetId="courses2.home.courses.badge" fieldType="text" label="Courses Badge">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Program Catalog 2026</span>
              </EditableElement>
            </div>
            <EditableElement targetId="courses2.home.courses.title" fieldType="text" label="Courses Title">
              <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter leading-[0.95]">
                Institutional <span className="text-gray-300 font-light italic">curriculum</span> pathways.
              </h2>
            </EditableElement>
          </div>

          <EditableElement targetId="courses2.home.courses.cta" fieldType="text" label="Prospectus Button">
            <button
              type="button"
              className="group px-10 py-5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black active:scale-95"
            >
              View Full Prospectus
            </button>
          </EditableElement>
        </div>

        {/* High-Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {courses.slice(0, 3).map((course: any, idx: number) => (
            <CourseCard key={course.id || idx} index={idx} course={course} primaryColor={primaryColor} />
          ))}
        </div>

        {/* Institutional Trust Footer */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 items-center opacity-60 grayscale">
          <div className="flex items-center gap-6">
            <ShieldCheckIcon className="w-10 h-10 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Accreditation</span>
              <span className="text-sm font-bold text-gray-500">KICD / ISO 9001:2026</span>
            </div>
          </div>
          <div className="h-[1px] bg-gray-200 hidden md:block" />
          <div className="flex flex-col md:items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3">Certified Training Partner</span>
            <div className="flex gap-10 text-xl font-black tracking-tighter text-gray-900 uppercase italic">
              <span>Cambridge</span>
              <span>I.B.O.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}