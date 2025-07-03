"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Added ArrowRightIcon for consistency
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {

  const { storeFormData } = useStoreContext();
  
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

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <div
        className="relative h-[95vh] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          // Using a more abstract or conceptual placeholder image
          backgroundImage: 'url("https://placehold.co/1920x1080/6A0DAD/FFFFFF?text=Modern+Learning")',
          backgroundAttachment: 'fixed', // Parallax-like effect
        }}
      >
        {/* Overlay with a subtle gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-blue-900/60 flex flex-col items-center justify-center text-white text-center px-4">
          {/* Abstract geometric shapes or patterns can be added here if desired */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>


          <motion.div
            className="relative z-10 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={heroVariants}
          >
            <motion.p
              className="text-lg md:text-xl mb-3 uppercase tracking-widest font-medium text-purple-200"
              variants={itemVariants}
            >
              Unlock Your Potential
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl text-white"
              variants={itemVariants}
            >
              Welcome to <br className="md:hidden"/> <span className="text-yellow-400">Dorik School</span> of Excellence
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Discover world-class education designed to empower your future. Explore diverse courses, connect with expert tutors, and achieve academic brilliance.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(249, 115, 22, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white
                           px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300
                           focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-75"
                onClick={() => console.log('Get Started clicked!')}
              >
                Get Started
                <ArrowRightIcon className="ml-3 w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center border border-white text-white bg-transparent
                           px-8 py-4 rounded-full text-lg font-bold transition-all duration-300
                           hover:bg-white hover:text-purple-900 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-75"
                onClick={() => console.log('Watch Video clicked!')}
              >
                <PlayCircleIcon className="w-6 h-6 mr-2 text-yellow-400" />
                Watch Video
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info Cards Section */}
      <motion.section
        className="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8 "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // Animate when 20% of the section is in view
        variants={cardContainerVariants}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Scholarship Facility',
              description: 'Unlock your potential with various scholarship opportunities designed to support your educational journey.',
              image: 'https://placehold.co/400x250/FFD700/6A0DAD?text=Scholarship',
            },
            {
              title: 'Academics Excellence',
              description: 'Experience a rigorous and engaging curriculum delivered by top educators to foster intellectual growth.',
              image: 'https://placehold.co/400x250/007BFF/FFFFFF?text=Academics',
            },
            {
              title: 'Vibrant School Life',
              description: 'Participate in a dynamic student community with diverse clubs, events, and extracurricular activities.',
              image: 'https://placehold.co/400x250/28A745/FFFFFF?text=School+Life',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden cursor-pointer
                         hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              variants={cardItemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={customLoader({ src: card.image, width: 400 })}
                alt={card.title}
                className="w-full h-60 object-cover rounded-t-2xl"
                onError={(e) => { // Optional: Add error handling for image loading
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/000000?text=Image+Error";
                }}
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{card.description}</p>
                <a
                  href="#" // Replace with actual link
                  className="inline-flex items-center text-orange-600 dark:text-orange-400 font-medium hover:underline group"
                  onClick={(e) => { e.preventDefault(); console.log(`Explore ${card.title} clicked!`); }}
                >
                  Explore More
                  <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
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
