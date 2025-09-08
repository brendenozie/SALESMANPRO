"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image for optimized images
import { StarIcon, TvIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid'; // Solid icon for play button
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Course = {
  id: string; // Assuming an ID for each course
  title: string;
  description: string;
  imageUrl: string; // Changed from 'image' to 'imageUrl' for clarity and consistency
  gradeLevel?: string; // Changed from 'grade' to 'gradeLevel'
  averageRating?: number; // Changed from 'rating' to 'averageRating', now a number
  enrolledStudents?: number; // Changed from 'students' to 'enrolledStudents', now a number
  // Add other fields from your Course model if relevant for display
  ctaText?: string; // e.g., "Enroll Now"
  ctaLink?: string; // Link to the course details page
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  courses?: Course[]; // Array of Course objects
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     themeSettings: { primaryColor: '#fd2121', secondaryColor: '#FFC107' }, // Example colors
//     courses: [
//       {
//         id: 'course-1',
//         title: 'Electrical Engineering Fundamentals',
//         imageUrl: 'https://images.unsplash.com/photo-1581092911880-99757754f40f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // More realistic image
//         description: 'Dive deep into circuits, power systems, and electronics with hands-on projects and expert guidance.',
//         gradeLevel: 'University Level',
//         averageRating: 4.8,
//         enrolledStudents: 120,
//         ctaText: 'View Course',
//         ctaLink: '/courses/electrical-engineering',
//       },
//       {
//         id: 'course-2',
//         title: 'General English Proficiency',
//         imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4486576102?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         description: 'Master grammar, enhance vocabulary, and perfect your communication skills for academic and professional success.',
//         gradeLevel: 'All Levels',
//         averageRating: 4.9,
//         enrolledStudents: 250,
//         ctaText: 'Enroll Now',
//         ctaLink: '/courses/general-english',
//       },
//       {
//         id: 'course-3',
//         title: 'Civil Engineering Design',
//         imageUrl: 'https://images.unsplash.com/photo-1581092911880-99757754f40f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         description: 'Learn to design, construct, and maintain infrastructures that shape our modern world, from bridges to buildings.',
//         gradeLevel: 'Advanced Diploma',
//         averageRating: 4.7,
//         enrolledStudents: 90,
//         ctaText: 'Learn More',
//         ctaLink: '/courses/civil-engineering',
//       },
//       {
//         id: 'course-4',
//         title: 'Textile Engineering Innovations',
//         imageUrl: 'https://images.unsplash.com/photo-1594918231010-0a3b2b5f5f0b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         description: 'Explore the fascinating world of fibers, fabrics, and textile production, blending science with creativity.',
//         gradeLevel: 'Undergraduate',
//         averageRating: 4.5,
//         enrolledStudents: 75,
//         ctaText: 'Discover Course',
//         ctaLink: '/courses/textile-engineering',
//       },
//       {
//         id: 'course-5',
//         title: 'Advanced Mathematics',
//         imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d88f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         description: 'Build a strong foundation in calculus, algebra, and geometry, essential for problem-solving and critical thinking.',
//         gradeLevel: 'All Grades',
//         averageRating: 4.9,
//         enrolledStudents: 300,
//         ctaText: 'Start Learning',
//         ctaLink: '/courses/advanced-mathematics',
//       },
//       {
//         id: 'course-6',
//         title: 'Information Technology Fundamentals',
//         imageUrl: 'https://images.unsplash.com/photo-1593642532781-0393ee809550?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         description: 'Stay ahead in the digital age with courses covering programming, cybersecurity, data science, and more.',
//         gradeLevel: 'Diploma',
//         averageRating: 4.9,
//         enrolledStudents: 180,
//         ctaText: 'Explore IT',
//         ctaLink: '/courses/information-technology',
//       },
//     ],
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Static fallback data for courses
const fallbackCourses: Course[] = [
  {
    id: 'fb-course-1',
    title: 'Introduction to Web Development',
    imageUrl: 'https://placehold.co/600x350/3498DB/FFFFFF?text=Web+Dev',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build your first website.',
    gradeLevel: 'Beginner',
    averageRating: 4.7,
    enrolledStudents: 500,
    ctaText: 'Start Learning',
    ctaLink: '#',
  },
  {
    id: 'fb-course-2',
    title: 'Digital Marketing Essentials',
    imageUrl: 'https://placehold.co/600x350/2ECC71/FFFFFF?text=Digital+Marketing',
    description: 'Understand SEO, social media, and content marketing to grow your online presence.',
    gradeLevel: 'Intermediate',
    averageRating: 4.5,
    enrolledStudents: 300,
    ctaText: 'Discover Course',
    ctaLink: '#',
  },
  {
    id: 'fb-course-3',
    title: 'Graphic Design Masterclass',
    imageUrl: 'https://placehold.co/600x350/9B59B6/FFFFFF?text=Graphic+Design',
    description: 'Unleash your creativity with Photoshop, Illustrator, and InDesign.',
    gradeLevel: 'All Levels',
    averageRating: 4.9,
    enrolledStudents: 400,
    ctaText: 'View Details',
    ctaLink: '#',
  },
];

export default function CoursesSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; // A vibrant amber/yellow for highlights

  // Determine which courses to render: dynamic or fallback
  const coursesToRender = Array.isArray(storeFormData?.courses) && storeFormData.courses.length > 0
    ? storeFormData.courses
    : fallbackCourses;


  console.log('Courses to Render:', coursesToRender);
  
  // Animation variants for section content
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  // Animation variants for course cards
  const cardItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image";
  };

  return (
    <div className="font-sans">
      {/* Main Courses Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Heading */}
        <motion.div
          className="mb-14 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
            Explore Our <span style={{ color: primaryColor }}>Main Courses</span>
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Discover a diverse range of programs crafted to ignite your passion and accelerate your career. Each course is designed for excellence and taught by industry experts.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {coursesToRender.map((course) => (
            <motion.div
              key={course.id}
              className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200
                          transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              variants={cardItemVariants}
            >
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={course.imageUrl || 'https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image'}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError}
                />
                {/* Image Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircleIcon className={`w-16 h-16 text-white text-opacity-80 group-hover:text-opacity-100 transition-colors duration-300`} style={{ color: accentColor }} />
                </div>
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{course.title}</h3>
                <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-3">
                  {course.description}
                </p>
                {/* Info row */}
                <div className="flex items-center text-sm text-gray-700 gap-6 mb-6">
                  {course.gradeLevel && (
                    <span className="flex items-center gap-2 font-medium">
                      <TvIcon className={`w-5 h-5`} style={{ color: accentColor }} /> {course.gradeLevel}
                    </span>
                  )}
                  {course.averageRating !== undefined && (
                    <span className="flex items-center gap-2 font-medium">
                      <StarIcon className={`w-5 h-5`} style={{ color: accentColor }} /> {course.averageRating.toFixed(1)}
                    </span>
                  )}
                  {course.enrolledStudents !== undefined && (
                    <span className="flex items-center gap-2 font-medium">
                      <UsersIcon className={`w-5 h-5`} style={{ color: accentColor }} /> {course.enrolledStudents.toLocaleString()} Students
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: `0 5px 15px ${primaryColor}40` }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-white py-3 rounded-md text-lg font-bold
                              transition-all duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                  style={{
                    background:`${primaryColor}`
                    // background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                    // '--tw-ring-color': `${accentColor} !important` as any
                  }}
                  onClick={() => window.location.href = course.ctaLink || '#'}
                >
                  {course.ctaText || 'Learn More'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls (Static for now, can be made dynamic with more complex state) */}
        <div className="mt-16 flex justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 rounded-full hover:bg-white transition-all duration-200`}
            style={{
              borderColor: accentColor,
              color: accentColor,
              '--tw-hover-bg': accentColor,
              '--tw-hover-text': 'white', // Explicitly set hover text color
            } as React.CSSProperties}
            onClick={() => console.log('Previous Page')}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
          <span className="text-lg font-semibold text-gray-800">
            1 <span className="text-gray-500">/ 5</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 border-2 rounded-full hover:bg-white transition-all duration-200`}
            style={{
              borderColor: accentColor,
              color: accentColor,
              '--tw-hover-bg': accentColor,
              '--tw-hover-text': 'white', // Explicitly set hover text color
            } as React.CSSProperties}
            onClick={() => console.log('Next Page')}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
