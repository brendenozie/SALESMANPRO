'use client';

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowLongRightIcon,
  CheckCircleIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// --- UTILS ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// Rotating Text Component for the "Seal"
const RotatingBadge = ({ text, color }: { text: string, color: string }) => {
  const characters = text.split("");
  return (
    <motion.div 
      className="relative w-32 h-32 flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      {characters.map((char, i) => (
        <span
          key={i}
          className="absolute text-xs font-bold uppercase tracking-widest"
          style={{
            color: color,
            height: "100%",
            transform: `rotate(${i * (360 / characters.length)}deg)`,
            transformOrigin: "0 64px", // Radius of the circle
          }}
        >
          {char}
        </span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
         <StarIcon className="w-8 h-8" style={{ color: color }} />
      </div>
    </motion.div>
  );
};

export default function AboutSection() {
  const { storeFormData } = useStoreContext();
  const containerRef = useRef(null);

  // Parallax Logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  // Items move at different speeds to create depth
  const yBackground = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yContent = useTransform(scrollYProgress, [0, 1], [50, -50]);

  if (!storeFormData) return null;

  const { slug, bannerUrl, name, description, themeSettings, CoreValues } = storeFormData;
  const primaryColor = themeSettings?.primaryColor || "#000000";
  
  // Use a guaranteed description length for design balance
  const shortDesc = description && description.length > 300 
    ? description.substring(0, 300) + "..." 
    : description || "We are dedicated to providing the best service in the industry.";

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden bg-white dark:bg-gray-950">
      
      {/* --- BACKGROUND GEOMETRY --- */}
      {/* A subtle grid pattern for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* The Large Color Block Anchor (Left Side) */}
      <motion.div 
        style={{ backgroundColor: primaryColor, y: yBackground }}
        className="absolute left-0 top-20 bottom-20 w-[15%] lg:w-[25%] rounded-r-3xl opacity-10 dark:opacity-20 hidden md:block"
      />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- LAYOUT CONTAINER --- */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch min-h-[600px]">
          
          {/* 1. IMAGE SECTION (Back Layer) */}
          <div className="w-full lg:w-7/12 relative lg:order-2 mb-10 lg:mb-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[400px] lg:h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image 
                src={bannerUrl || "/placeholder.jpg"} 
                alt={name}
                loader={loader}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Rotating Badge (Visual Flair) - Bottom Right of Image */}
              <div className="absolute bottom-6 right-6 bg-white dark:bg-gray-900 rounded-full shadow-lg p-1 hidden sm:block">
                 <RotatingBadge text={`• ESTABLISHED • TRUSTED • QUALITY • ${name} `} color={primaryColor} />
              </div>
            </motion.div>
          </div>

          {/* 2. CONTENT CARD (Front Layer - Overlapping) */}
          {/* Negative margin pulls this over the image on Desktop */}
          <motion.div 
             style={{ y: yContent }}
             className="w-full lg:w-6/12 lg:-mr-24 lg:z-20 lg:self-center lg:order-1 relative"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 lg:translate-x-12 xl:translate-x-24">
              
              {/* Header */}
              <div className="mb-8">
                <h4 
                  className="font-bold tracking-widest uppercase text-xs mb-4 flex items-center gap-3"
                  style={{ color: primaryColor }}
                >
                  <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }}></span>
                  Who We Are
                </h4>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 dark:text-white leading-[1.1]">
                  Defining standard in <br/>
                  <span className="italic font-light opacity-60">excellence.</span>
                </h2>
              </div>

              {/* Body Text */}
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {shortDesc}
              </p>

              {/* Core Values as "Pills" */}
              {CoreValues && CoreValues.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-10">
                  {CoreValues.slice(0, 4).map((val: any, idx: number) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      <CheckCircleIcon className="w-4 h-4" style={{ color: primaryColor }} />
                      {val.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Area */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link 
                  href={`/${slug}/about`}
                  className="group flex items-center gap-3 text-lg font-bold transition-colors"
                  style={{ color: primaryColor }}
                >
                  Read our full story
                  <ArrowLongRightIcon className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}