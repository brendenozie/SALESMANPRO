"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon, } from '@heroicons/react/24/solid'; // Added ArrowRightIcon for consistency
import { StarIcon, TvIcon, UsersIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Added for MainCoursesSection

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {
  // Animation variants for hero text and buttons
  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        duration: 0.8,
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

  // Animation variants for info cards
  const cardContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.15
      },
    },
  };

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

  // Data for MainCoursesSection
  const courses = [
    {
      title: 'Electrical Engineering',
      image: 'https://placehold.co/600x350/FF8C00/FFFFFF?text=Electrical', // More vibrant orange
      grade: '3rd Grade',
      rating: '4.8',
      students: '120',
      description: 'Dive deep into circuits, power systems, and electronics with hands-on projects and expert guidance.',
    },
    {
      title: 'General English',
      image: 'https://placehold.co/600x350/228B22/FFFFFF?text=English', // Forest Green
      grade: 'All Levels',
      rating: '4.9',
      students: '250',
      description: 'Master grammar, enhance vocabulary, and perfect your communication skills for academic and professional success.',
    },
    {
      title: 'Civil Engineering',
      image: 'https://placehold.co/600x350/8A2BE2/FFFFFF?text=Civil', // Blue Violet
      grade: 'Advanced',
      rating: '4.7',
      students: '90',
      description: 'Learn to design, construct, and maintain infrastructures that shape our modern world, from bridges to buildings.',
    },
    {
      title: 'Textile Engineering',
      image: 'https://placehold.co/600x350/DDA0DD/FFFFFF?text=Textile', // Plum
      grade: 'Undergraduate',
      rating: '4.5',
      students: '75',
      description: 'Explore the fascinating world of fibers, fabrics, and textile production, blending science with creativity.',
    },
    {
      title: 'Mathematics',
      image: 'https://placehold.co/600x350/4169E1/FFFFFF?text=Mathematics', // Royal Blue
      grade: 'All Grades',
      rating: '4.9',
      students: '300',
      description: 'Build a strong foundation in calculus, algebra, and geometry, essential for problem-solving and critical thinking.',
    },
    {
      title: 'Information Technology',
      image: 'https://placehold.co/600x350/FF4500/FFFFFF?text=IT', // Orange Red
      grade: 'Diploma',
      rating: '4.9',
      students: '180',
      description: 'Stay ahead in the digital age with courses covering programming, cybersecurity, data science, and more.',
    },
  ];

  return (
    <div className="font-sans">
      {/* Main Courses Section - Redesigned */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 text-center" // Lighter background, better padding
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={cardContainerVariants} // Reusing container variants
      >
        {/* Heading */}
        <motion.div
          className="mb-14 max-w-3xl mx-auto" // Wider and centered
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight">
            Explore Our <span className="text-orange-600 dark:text-orange-400">Main Courses</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            Discover a diverse range of programs crafted to ignite your passion and accelerate your career. Each course is designed for excellence and taught by industry experts.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"> {/* Increased gap, wider max-width */}
          {courses.map((course, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700
                         transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              variants={cardItemVariants} // Reusing item variants for individual cards
            >
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={customLoader({ src: course.image, width: 600 })}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/600x350/A0A0A0/FFFFFF?text=Course+Image";
                  }}
                />
                {/* Image Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircleIcon className="w-16 h-16 text-white text-opacity-80 group-hover:text-yellow-400 transition-colors duration-300" />
                </div>
              </div>
              <div className="p-6 text-left"> {/* Increased padding */}
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h3> {/* Larger, bolder title */}
                <p className="text-gray-600 dark:text-gray-400 text-base mb-4 leading-relaxed"> {/* Adjusted font size and line height */}
                  {course.description}
                </p>
                {/* Info row */}
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-6 mb-6"> {/* Increased gap */}
                  <span className="flex items-center gap-2 font-medium">
                    <TvIcon className='w-5 h-5 text-indigo-500' /> {course.grade}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <StarIcon className='w-5 h-5 text-yellow-500' /> {course.rating}
                  </span>
                  <span className="flex items-center gap-2 font-medium">
                    <UsersIcon className='w-5 h-5 text-green-500' /> {course.students} Students
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(249, 115, 22, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg text-lg font-bold
                             hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-md
                             focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-75"
                  onClick={() => console.log(`Apply for ${course.title} clicked!`)}
                >
                  Enroll Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-16 flex justify-center items-center gap-4"> {/* Increased top margin */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 border-2 border-orange-500 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
            onClick={() => console.log('Previous Page')}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </motion.button>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            1 <span className="text-gray-500">/ 5</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 border-2 border-orange-500 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200"
            onClick={() => console.log('Next Page')}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.section>

      {/* Tailwind CSS keyframe animation for the blob effect */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
