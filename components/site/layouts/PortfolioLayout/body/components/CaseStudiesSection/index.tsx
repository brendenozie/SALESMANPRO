"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { ICoreValue } from "@/types/typings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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
      stiffness: 110,
      damping: 16,
    },
  },
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}&w=${width}&q=${quality || 75}`;
};

interface CoreValuesSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  CoreValues: ICoreValue[];
}

export default function CoreValuesSection({ themeSettings, CoreValues }: CoreValuesSectionProps) {
  const primaryColor = themeSettings?.primaryColor || "#000000";

  const coreValuesToRender: ICoreValue[] =
    CoreValues && CoreValues.length > 0
      ? CoreValues
      : [
          {
            id: "cv1",
            title: "Patient-Centered Care",
            description: "Your health and comfort are our primary focus. We tailor our services to meet your individual needs.",
            icon: "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80",
          },
          {
            id: "cv2",
            title: "Trusted Expertise",
            description: "Our board-certified professionals and staff are committed to providing the highest quality care.",
            icon: "https://images.unsplash.com/photo-1621524231095-ded43b8b2d6f?q=80",
          },
          {
            id: "cv3",
            title: "Community Wellness",
            description: "We are an integral part of the community, actively promoting public health and well-being.",
            icon: "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80",
          },
          {
            id: "cv4",
            title: "Innovative Solutions",
            description: "Leveraging the latest medical technology to provide accurate diagnoses and effective treatments.",
            icon: "https://images.unsplash.com/photo-1580281658629-3f98bde5a1ad?q=80",
          },
        ];

  return (
    <AnimatePresence>
      <section
        id="core-values"
        className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
      >
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Heading */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Foundational Pillars
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
              variants={itemVariants}
            >
              Our Guiding <span style={{ color: primaryColor }}>Core Values</span>
            </motion.h2>

            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              The principles that guide our mission, inspire our people, and shape the care we deliver every day.
            </motion.p>
          </motion.div>

          {/* Core Values Architecture Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {coreValuesToRender.map((item, idx) => (
              <motion.div
                key={item.id || `cv-${idx}`}
                className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden p-4 justify-between items-start transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-full flex flex-col h-full">
                  
                  {/* Clean Framed Media Port */}
                  {item.icon && (
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-slate-100 mb-5 bg-slate-50">
                      <Image
                        src={item.icon}
                        loader={imageLoader}
                        alt={item.title}
                        fill
                        sizes="(max-w-7xl) 25vw, 50vw"
                        className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Structural Text Matrix */}
                  <div className="flex flex-col flex-grow px-2 pb-2">
                    <h3 className="text-lg font-bold mb-2.5 text-slate-900 tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className="text-sm text-slate-500 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}