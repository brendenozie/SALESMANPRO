"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  StarIcon, 
  UsersIcon, 
  PlayIcon,
  AcademicCapIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/solid'; // Hero Icons as requested
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type Course = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  gradeLevel?: string;
  averageRating?: number;
  enrolledStudents?: number;
  ctaText?: string;
  ctaLink?: string;
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const CourseCard = ({ course, primaryColor, accentColor, cardItemVariants }: any) => {
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            className={clsx('w-3.5 h-3.5 transition-colors', i < fullStars ? 'text-yellow-400' : 'text-gray-300')} 
          />
        ))}
        <span className="ml-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <motion.div variants={cardItemVariants} className="h-full">
      <motion.a
        href={course.ctaLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
        whileHover={{ y: -8 }}
      >
        {/* Image Container */}
        <div className="relative w-full h-52 overflow-hidden">
          <Image
            src={course.imageUrl || 'https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image'}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loader={loader}
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Floating Grade Badge */}
          {course.gradeLevel && (
            <div className="absolute top-4 left-4 z-10">
              <span 
                className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded-full shadow-lg" 
                style={{ backgroundColor: primaryColor }}
              >
                {course.gradeLevel}
              </span>
            </div>
          )}

          {/* Enhanced Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3">
            {renderRating(course.averageRating || 0)}
            <div className="flex items-center gap-1 text-gray-400">
              <UsersIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{course.enrolledStudents?.toLocaleString()}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
            {course.description}
          </p>
          
          <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              {course.ctaText || 'Enroll Now'}
            </span>
            <div 
              className="p-2 rounded-lg transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
              style={{ color: primaryColor }}
            >
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
}

export default function CoursesSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; 

  const coursesToRender = storeFormData?.courses?.length > 0 ? storeFormData.courses : [
    { id: '1', title: 'Modern Web Architectures', description: 'Deep dive into React, Next.js and Cloud Infrastructure for scalable apps.', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000', gradeLevel: 'Intermediate', averageRating: 4.9, enrolledStudents: 1240 },
    { id: '2', title: 'UI/UX Visual Design', description: 'Master the art of high-fidelity prototyping and design systems.', imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1000', gradeLevel: 'All Levels', averageRating: 4.8, enrolledStudents: 850 },
    { id: '3', title: 'AI Implementation', description: 'Leveraging LLMs and Neural Networks in real-world business environments.', imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000', gradeLevel: 'Advanced', averageRating: 5.0, enrolledStudents: 420 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-gray-50/50 dark:bg-gray-950 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Simple & Clean */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Featured <span style={{ color: primaryColor }}>Programs</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Advance your skills with our industry-leading curriculum and mentorship.
            </p>
          </div>
          <motion.a
            whileHover={{ x: 5 }}
            href="/all-courses"
            className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-70"
            style={{ color: primaryColor }}
          >
            View All Courses
            <ChevronRightIcon className="w-5 h-5" />
          </motion.a>
        </div>

        {/* Courses Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {coursesToRender.map((course: any) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              primaryColor={primaryColor} 
              accentColor={accentColor} 
              cardItemVariants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}