"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from "next/image";
import { ArrowRightIcon, CalendarDaysIcon, TicketIcon, UserGroupIcon } from '@heroicons/react/24/solid';

// Mocking the image loader for demonstration purposes.
// In a real Next.js app, this might not be necessary if your next.config.js is set up.
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
    hover: {
        scale: 1.2,
        rotate: 10,
        transition: {
            duration: 0.3,
            yoyo: Infinity
        }
    }
}

export default function HeroComponent({
  name,
  bannerUrl,
}: {
  name: string;
  bannerUrl: string;
}) {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gray-900 text-white flex items-center justify-center p-4">
      {/* Background Aurora Effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center lg:text-left"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Explore Events at <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{name}</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
            Your ultimate destination for discovering and booking tickets for the most exciting upcoming events. Join our community and never miss out!
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center lg:justify-start flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(192, 132, 252, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform duration-300"
            >
              Get Started
            </motion.button>
            <motion.a
              href="https://example.com/learn-more"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white font-semibold py-3 px-6 rounded-full flex items-center gap-2 transition-transform duration-300"
            >
              Learn More <ArrowRightIcon className="h-4 w-4" />
            </motion.a>
          </motion.div>

           {/* Features Section */}
           <motion.div variants={itemVariants} className="mt-12 flex justify-center lg:justify-start items-center gap-8 text-gray-400">
               <motion.div whileHover="hover" className="text-center flex flex-col items-center">
                   <motion.div variants={iconVariants}>
                       <CalendarDaysIcon className="h-8 w-8 text-purple-400"/>
                   </motion.div>
                   <p className="text-sm mt-2">Diverse Events</p>
               </motion.div>
                <motion.div whileHover="hover" className="text-center flex flex-col items-center">
                    <motion.div variants={iconVariants}>
                        <TicketIcon className="h-8 w-8 text-pink-400"/>
                    </motion.div>
                    <p className="text-sm mt-2">Easy Booking</p>
                </motion.div>
                <motion.div whileHover="hover" className="text-center flex flex-col items-center">
                    <motion.div variants={iconVariants}>
                       <UserGroupIcon className="h-8 w-8 text-indigo-400"/>
                    </motion.div>
                   <p className="text-sm mt-2">Community</p>
               </motion.div>
           </motion.div>

        </motion.div>

        {/* Image Content */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // A nice bouncy ease
            className="relative flex justify-center items-center"
        >
            <div className="relative w-[300px] h-[450px] md:w-[350px] md:h-[525px] rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-500 hover:scale-105">
                <Image
                    priority
                    src={bannerUrl}
                    loader={customLoader}
                    layout="fill"
                    objectFit="cover"
                    alt="Event Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}