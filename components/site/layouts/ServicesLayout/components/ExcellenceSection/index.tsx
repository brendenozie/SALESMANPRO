"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  SparklesIcon, PuzzlePieceIcon, RocketLaunchIcon, CheckCircleIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Placeholder for company logos
const companyLogos: string[] = [
  '/images/logos/google.svg',
  '/images/logos/microsoft.svg',
  '/images/logos/shopify.svg',
  '/images/logos/stripe.svg',
  '/images/logos/netflix.svg',
];

export default function ExcellenceSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Crafting excellence...</p>
      </div>
    );
  }

  const {
    slug,
    name,
    themeSettings,
  } = storeFormData;

  // Use the refined color palette
  const primaryColor = themeSettings?.primaryColor ?? "#43A047";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFB300";

  const featureImage: string = storeFormData?.themeSettings?.aboutImage || '/images/placeholders/feature-main.jpg';

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const textReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <section className="relative bg-gray-50 dark:bg-gray-950 py-16 lg:py-24 overflow-hidden text-gray-900 dark:text-gray-50">

      {/* Dynamic Background Blob Shapes */}
      <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
        <motion.div
          className="absolute rounded-full -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
        />
      </div>

      <div className="absolute inset-0 z-0 opacity-5" style={{ background: `radial-gradient(circle, ${primaryColor}20 1px, transparent 1px)` , backgroundSize: '20px 20px' }} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Top Section: Trust Bar */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h3
            className="text-gray-600 dark:text-gray-400 text-lg font-semibold uppercase tracking-wider mb-8"
            variants={textReveal}
          >
            Trusted by
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundColor: `${primaryColor}` }}
            >
              {" "}Industry Leaders
            </span>
          </motion.h3>
          <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-8">
            {companyLogos.map((logoUrl: string, idx: number) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                transition={{ delay: idx * 0.1 }}
              >
                <Image
                  loader={loader}
                  src={logoUrl}
                  alt={`Partner logo ${idx + 1}`}
                  width={120}
                  height={50}
                  className="object-contain h-12 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        ---

        {/* Main Excellence Section - Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Image with unique background frame */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.3 }}
            className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group col-span-1 lg:col-span-1 shadow-2xl"
          >
            {/* Background "Frame" with a subtle offset for depth */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: secondaryColor }}
            />
            {/* Main Image */}
            <Image
              src={featureImage}
              alt="Our commitment to excellence"
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-500 ease-in-out group-hover:scale-105"
              loader={loader}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </motion.div>

          {/* Right Column: Main Headline & Value Propositions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-8 col-span-1 lg:col-span-1 text-center lg:text-left flex flex-col justify-center"
          >
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
              variants={textReveal}
            >
              We’re Driven by{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundColor: ` ${primaryColor}` }}
              >
                Excellence
              </span>
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-90"
              variants={textReveal}
            >
              We go beyond just providing a service. We're dedicated to crafting a seamless and exceptional experience, ensuring every detail is handled with precision and care.
            </motion.p>

            {/* Value Propositions List: Cleaner Grid */}
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-4"
              variants={staggerContainer}
            >
              {[
                { title: "Uncompromising Quality", icon: <SparklesIcon className="w-8 h-8" />, description: "Our commitment to excellence ensures every service is performed to the highest standards." },
                { title: "Tailored Solutions", icon: <PuzzlePieceIcon className="w-8 h-8" />, description: "We offer customized services designed to meet your unique needs and preferences." },
                { title: "Reliable & Efficient", icon: <CheckCircleIcon className="w-8 h-8" />, description: "You can count on us for dependable service that is both fast and effective." },
                { title: "Innovative Approach", icon: <RocketLaunchIcon className="w-8 h-8" />, description: "We utilize modern techniques and tools to provide a cutting-edge service experience." },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  variants={cardVariants}
                  className="flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 transform bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative"
                >
                  <div className="flex-shrink-0 p-2 rounded-full text-white" style={{ backgroundColor: secondaryColor }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              className="pt-8 flex flex-wrap justify-center lg:justify-start gap-4"
              variants={textReveal}
            >
              <Link
                href={`/${slug}/services`}
                className="inline-block px-8 py-4 rounded-full text-white font-bold shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={{ backgroundColor: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties}
              >
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}