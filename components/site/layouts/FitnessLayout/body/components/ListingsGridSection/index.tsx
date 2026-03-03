"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
  UserCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { ICourse } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

// Variants for the bento-grid entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
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

  return (
    <section id="programs" className="py-24 px-6 bg-[#050505] relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-orange-500 font-black tracking-[0.3em] uppercase text-xs"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Elite Selection</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-[0.9]"
            >
              Curated <br /> <span className="text-gray-500">Experiences</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-sm text-gray-400 font-medium leading-relaxed"
          >
            Hand-picked training protocols designed by world-class athletes and bio-performance experts.
          </motion.p>
        </div>

        {/* Listings Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              className="group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.06] transition-all duration-500"
            >
              {/* IMAGE WRAPPER */}
              <div className="relative h-80 w-full overflow-hidden">
                <Image
                  loader={loader}
                  src={course.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop"}
                  alt={course.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
                />
                
                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                
                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                     {course.code || "Premium"}
                   </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-orange-500 hover:text-black transition-all"
                >
                  <HeartIcon className="h-5 w-5" />
                </motion.button>
              </div>

              {/* CONTENT AREA */}
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-orange-500 transition-colors">
                      {course.title}
                    </h3>
                    <span className="text-2xl font-black text-white italic tracking-tighter">
                      ${course.price}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* STATS ROW */}
                <div className="flex items-center gap-6 border-y border-white/5 py-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Master Coach</span>
                  </div>
                </div>

                {/* ACTION */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full group/btn flex items-center justify-between px-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-tighter hover:bg-orange-500 transition-all"
                >
                  <span>Secure Spot</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 flex flex-col items-center"
        >
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-orange-500 to-transparent mb-8" />
          <button className="text-white font-black uppercase tracking-[0.4em] text-xs hover:text-orange-500 transition-colors flex items-center gap-4">
            Explore All Programs <ArrowRightIcon className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}