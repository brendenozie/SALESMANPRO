"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { ICourse } from "@/types/typings";
import { useRouter } from "next/navigation";

const loader = ({ src }: { src: string }) => src;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ListingsGrid({
  courses = [],
}: {
  courses?: ICourse[];
}) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="programs" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 relative overflow-hidden">
      
      {/* Immersive Organic Blur Orbs */}
      <div 
        className="absolute top-0 right-[-10%] w-[600px] h-[600px] opacity-20 dark:opacity-10 blur-[130px] rounded-full -z-10 pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-12 left-[-10%] w-[500px] h-[500px] opacity-10 dark:opacity-5 blur-[120px] rounded-full -z-10 pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 font-black tracking-[0.25em] uppercase text-xs"
              style={{ color: primaryColor }}
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Elite Selection</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter italic uppercase leading-[0.95] transition-colors"
            >
              Curated <br /> <span className="text-neutral-400 dark:text-neutral-600 transition-colors">Experiences</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-md text-neutral-600 dark:text-neutral-400 font-medium text-sm sm:text-base leading-relaxed transition-colors"
          >
            Hand-picked training protocols architected by world-class athletes and elite performance specialists to maximize structural outcome.
          </motion.p>
        </div>

        {/* LISTINGS BENTO GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white dark:bg-neutral-900/40 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-neutral-900 border-neutral-200/80 dark:hover:border-neutral-700/60 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* HERO VISUAL COVER CONTAINER */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <Image
                    loader={loader}
                    src={course.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop"}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Dynamic Dark Gradient Veil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent dark:from-neutral-950 dark:via-transparent transition-colors duration-500" />
                  
                  {/* Floating Elements */}
                  <div className="absolute top-5 left-5">
                    <div className="px-3.5 py-1.5 bg-neutral-900/80 dark:bg-black/60 backdrop-blur-md border border-neutral-700/40 dark:border-neutral-800/80 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                      {course.code || "Premium"}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleFavorite(course.id, e)}
                    className="absolute top-5 right-5 p-3 rounded-full bg-neutral-900/40 hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-md text-white hover:text-neutral-900 dark:hover:text-white border border-neutral-700/30 transition-all shadow-sm"
                  >
                    {favorites[course.id] ? (
                      <HeartIconSolid className="h-4 w-4" style={{ color: primaryColor }} />
                    ) : (
                      <HeartIcon className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>

                {/* TEXTUAL BODY CONTENT */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                        {course.title}
                      </h3>
                      <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white italic tracking-tighter shrink-0">
                        {course.price}
                      </span>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* SUBTLE SEPARATOR & STATS */}
                  <div className="flex items-center gap-5 border-y border-neutral-200/60 dark:border-neutral-800/60 py-3.5">
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <ClockIcon className="h-4 w-4 shrink-0 opacity-80" style={{ color: primaryColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <UserCircleIcon className="h-4 w-4 shrink-0 opacity-80" style={{ color: primaryColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Master Coach</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD CTA BUTTON ACTION */}
              <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full group/btn flex items-center justify-between px-6 py-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 shadow-sm"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: "#ffffff"
                  }}
                  onClick={() => {
                    router.push(`/fitness/listings/${course.id}`);
                  }}
                >
                  <span>Secure Spot</span>
                  <div className="p-1 bg-white/20 rounded-lg group-hover/btn:translate-x-1.5 transition-transform duration-300">
                    <ArrowRightIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                </motion.button>
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM GLOBAL REDIRECT BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-col items-center"
        >
          <div className="h-[1px] w-20 bg-neutral-200 dark:bg-neutral-800 mb-8" />
          <button
            onClick={() => router.push('/fitness/listings')}
           className="text-neutral-800 dark:text-neutral-200 font-bold uppercase tracking-[0.25em] text-xs hover:opacity-80 transition-opacity flex items-center gap-3 group">
            Explore All Programs 
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
        
      </div>
    </section>
  );
}