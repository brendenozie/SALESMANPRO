"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { StarIcon, ShieldCheckIcon, TruckIcon, CurrencyDollarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-pulse">Gathering insights for you...</p>
      </div>
    );
  }

  const {
    slug,
    bannerUrl,
    name,
    description,
    themeSettings,
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  const coreValues = [
    {
      title: "Unmatched Quality",
      description: "Our commitment to excellence ensures every service is performed to the highest standards.",
      icon: <StarIcon className="w-8 h-8" />,
    },
    {
      title: "Seamless Convenience",
      description: "Effortless booking, flexible scheduling, and reliable service at your doorstep.",
      icon: <TruckIcon className="w-8 h-8" />,
    },
    {
      title: "Transparent Pricing",
      description: "Enjoy clear, competitive rates with no hidden fees. Quality service doesn't have to break the bank.",
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
    },
  ];

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
        staggerChildren: 0.2,
      },
    },
  };

  const itemSlideIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-gray-50 text-gray-900">

      {/* Dynamic Background Shapes */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute rounded-full opacity-10 blur-3xl -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full opacity-10 blur-3xl -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
        />
      </div>

      <div className="absolute inset-0 z-0 opacity-5" style={{ background: `radial-gradient(circle, ${primaryColor}20 1px, transparent 1px)` , backgroundSize: '20px 20px' }} />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center lg:justify-end order-2 lg:order-1"
        >
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group">
            {/* Background "Frame" with a subtle offset */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: primaryColor }}
            />

            {/* Main Image with refined hover effect */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"}
              alt={`${name} About Image`}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl shadow-xl transition-all duration-500 ease-in-out group-hover:scale-105"
              loader={loader}
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </div>
        </motion.div>

        {/* Right: Text Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-1 lg:order-2 text-center lg:text-left"
        >
          <motion.span
            className="inline-block text-sm font-semibold tracking-widest uppercase"
            style={{ color: secondaryColor }}
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
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {name}
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90"
            variants={itemSlideIn}
          >
            {description || `At ${name}, we're passionate about simplifying your life through exceptional service. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying.`}
          </motion.p>

          {/* Core Values / Perks Section: Grid of value cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemSlideIn}
                custom={index}
                className="flex flex-col items-center p-6 rounded-2xl transition-all duration-300 transform
                        bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1"
                style={{
                  border: `2px solid transparent`,
                  borderImage: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor}) 1`,
                }}
              >
                <div className="mb-4" style={{ color: secondaryColor }}>
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{value.title}</h3>
                <p className="text-sm opacity-90 text-center text-gray-700">{value.description}</p>
              </motion.div>
            ))}

            {/* New: Dedicated Interactive Callout Card */}
            <motion.div
              variants={itemSlideIn}
              className="relative col-span-1 md:col-span-2 p-8 rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300"></div>
              <div className="relative flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold mb-1">Guaranteed Satisfaction</h3>
                  <p className="text-sm opacity-90">We stand behind our work. Your complete satisfaction is our ultimate priority.  </p>
                </div>
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300 flex-shrink-0">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8"
            variants={itemSlideIn}
          >
            <Link
              href={`/${slug}/contact`}
              className="px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties}
            >
              Get a Quote
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href={`/${slug}/faq`}
              className="px-8 py-4 border-2 rounded-full font-medium transition-all duration-300 ease-in-out
                       hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-opacity-50"
              style={{ borderColor: primaryColor, color: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties}
            >
              Read FAQs
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}