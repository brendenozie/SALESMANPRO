"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Utility function for Next.js Image loader
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-pulse">
          Gathering insights for you...
        </p>
      </div>
    );
  }

  const { slug, bannerUrl, name, description, themeSettings, CoreValues } =
    storeFormData;

  const primaryColor = themeSettings?.primaryColor ?? "#43A047";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFB300";

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
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

  const itemSlideIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  // --- Core Values Logic ---
  const values = CoreValues ?? [];
  let listValues = values;
  let guaranteedValue: typeof values[number] | null = null;

  if (values.length === 1) {
    listValues = [];
    guaranteedValue = values[0];
  } else if (values.length === 4) {
    listValues = values.slice(0, 3);
    guaranteedValue = values[3];
  }

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      {/* Dynamic Background Blob Shapes */}
      <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
        <motion.div
          className="absolute rounded-full -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            repeatType: "mirror",
          }}
        />
        <motion.div
          className="absolute rounded-full -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "mirror",
            delay: 5,
          }}
        />
      </div>

      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          background: `radial-gradient(circle, ${primaryColor}30 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Text Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-2 lg:order-1 text-center lg:text-left"
        >
          <motion.span
            className="inline-block text-base font-semibold tracking-widest uppercase"
            variants={itemSlideIn}
          >
            Our Journey & Commitment
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            variants={itemSlideIn}
          >
            About{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundColor: `${primaryColor}` }}
            >
              {name}
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90"
            variants={itemSlideIn}
          >
            {description ||
              `At ${name}, we're passionate about simplifying your life through exceptional service. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying.`}
          </motion.p>

          {/* Core Values Section */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
          >
            {listValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemSlideIn}
                custom={index}
                className="flex flex-col items-center p-6 rounded-2xl transition-all duration-300 transform bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 group relative"
                style={{ border: `2px solid ${primaryColor}20` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="mb-4 text-white p-3 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-50">
                    {value.title}
                  </h3>
                  <p className="text-sm opacity-90 text-center text-gray-700 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Guaranteed Section */}
          {guaranteedValue && (
            <motion.div
              variants={itemSlideIn}
              className="relative col-span-1 md:col-span-3 p-8 rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.02] flex flex-col sm:flex-row items-center justify-between mt-6"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300"></div>
              <div className="relative text-white text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1">
                  {guaranteedValue.title || "Guaranteed Satisfaction"}
                </h3>
                <p className="text-sm opacity-90">
                  {guaranteedValue.description ||
                    "We stand behind our work. Your complete satisfaction is our ultimate priority."}
                </p>
              </div>
              <div className="w-16 h-16 mt-4 sm:mt-0 flex items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300 flex-shrink-0">
                {guaranteedValue.icon || (
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                )}
              </div>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8"
            variants={itemSlideIn}
          >
            <Link
              href={`/${slug}/contact`}
              className="px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2"
              style={
                {
                  backgroundColor: primaryColor,
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Get a Quote
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href={`/${slug}/faq`}
              className="px-8 py-4 border-2 rounded-full font-medium transition-all duration-300 ease-in-out hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              style={
                {
                  borderColor: primaryColor,
                  color: primaryColor,
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Read FAQs
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center lg:justify-start order-1 lg:order-2"
        >
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl">
            {/* Background "Frame" */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: primaryColor }}
            />

            {/* Main Image */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"}
              alt={`${name} About Image`}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-500 ease-in-out group-hover:scale-105"
              loader={loader}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
