"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon, ShieldCheckIcon, UsersIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from "@/contexts/StoreContext";
import { ICoreValue } from "@/types/typings";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

const fallbackCoreValues: ICoreValue[] = [
  { id: "v1", title: "Patient-Centered Care", description: "Your health and comfort are our primary focus. We tailor our services to meet your individual needs.", icon: "HeartIcon" },
  { id: "v2", title: "Trusted Expertise", description: "Our board-certified professionals and staff are committed to providing the highest quality medical care.", icon: "ShieldCheckIcon" },
  { id: "v3", title: "Community Wellness", description: "We are an integral part of the community, actively promoting public health and well-being.", icon: "UsersIcon" },
  { id: "v4", title: "Innovative Solutions", description: "Leveraging the latest medical technology to provide accurate diagnoses and effective treatments.", icon: "AcademicCapIcon" },
];

const iconMap: { [key: string]: React.ElementType } = {
  HeartIcon: HeartIcon,
  ShieldCheckIcon: ShieldCheckIcon,
  UsersIcon: UsersIcon,
  AcademicCapIcon: AcademicCapIcon,
};

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  const aboutImageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const aboutText = storeFormData?.description || "Our mission is to provide compassionate, high-quality healthcare services to our community. We are dedicated to promoting wellness and restoring health with professionalism and empathy. Our team of skilled medical professionals works collaboratively to ensure every patient receives personalized care.";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#008080";
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || "#00b3b3";
  const coreValuesToRender = storeFormData?.CoreValues || fallbackCoreValues;

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-950 py-20 lg:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.span
            className="inline-block uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            style={{ backgroundColor: primaryColor, color: 'white' }}
            variants={fadeIn}
          >
            Who We Are
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 drop-shadow-md"
            variants={fadeIn}
          >
            Dedicated to Your <span style={{ color: primaryColor }}>Health</span> and <span style={{ color: secondaryColor }}>Well-being</span>
          </motion.h2>

          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-lg"
            variants={fadeIn}
          >
            {aboutText}
          </motion.p>
          
          {/* Core Values Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-8"
            variants={staggerContainer}
          >
            {coreValuesToRender.map((value) => {
              const IconComponent = iconMap[value.icon as string] || AcademicCapIcon;
              return (
                <motion.div key={value.id} variants={iconVariants} className="flex items-start">
                  <IconComponent className="w-8 h-8 mr-4 flex-shrink-0" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{value.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Image - Placed second for visual hierarchy on desktop, first on mobile */}
        <motion.div
          className="w-full relative overflow-hidden rounded-3xl shadow-2xl aspect-w-16 aspect-h-9 md:aspect-h-10 lg:aspect-h-12 border-4 border-white dark:border-gray-700 transform hover:scale-102 transition-transform duration-500 ease-in-out"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        >
          <Image
            src={aboutImageUrl}
            alt="Our dedicated healthcare team"
            loader={loader}
            fill
            className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
          />
        </motion.div>
      </div>
    </section>
  );
}