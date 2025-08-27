"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { BuildingLibraryIcon, GlobeAltIcon, LightBulbIcon } from "@heroicons/react/24/outline";

// --- Feature Data ---
// Icons remain the same but will stand out more against the light background.
const features = [
  {
    title: "Instant Storefront",
    description: "Create and customize your online store in just a few clicks.",
    icon: <BuildingLibraryIcon className="h-8 w-8 text-red-500" />,
  },
  {
    title: "Free Website",
    description: "Get a stunning, modern website automatically with your store.",
    icon: <GlobeAltIcon className="h-8 w-8 text-red-500" />,
  },
  {
    title: "All-in-One Toolkit",
    description: "Manage products, payments, and orders from a single dashboard.",
    icon: <LightBulbIcon className="h-8 w-8 text-red-500" />,
  },
];

// --- Main Banner Component ---
export default function Banner() {
  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        {/* --- Animated Aurora Background (Light Version) --- */}
        {/* Switched to lighter, pastel gradients with higher opacity to create a soft, ethereal glow on a light background. */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-pink-200/70 via-red-200/70 to-transparent blur-3xl"
            initial={{ x: -200, y: -200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5 } }}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-cyan-200/70 via-yellow-200/70 to-transparent blur-3xl"
            initial={{ x: 200, y: 200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5, delay: 0.3 } }}
          />
        </div>

        {/* --- Hero Content Section --- */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-12 pt-24 md:pt-0">
          {/* Left: Text Content */}
          {/* Text colors changed from white/slate-300 to dark gray for readability */}
          <motion.div
            className="space-y-8 text-center md:text-left"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.h1
              className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
            >
              Launch Your
              <br />
              <span className=" text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 ">
                Online Universe
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-700 max-w-lg mx-auto md:mx-0"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
            >
              Build your store, get a free website, and start selling with an
              all-in-one toolkit designed for growth. No hassle, just results.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
            >
              <motion.button
                className="px-8 py-4 bg-red-600 text-white font-bold rounded-full shadow-lg shadow-red-200/80"
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(129, 140, 248, 0.7)" }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your Store
              </motion.button>
              <motion.button
                className="px-8 py-4 border border-gray-300 text-gray-800 font-bold rounded-full"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.95 }}
              >
                How It Works
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right: Interactive Hero Image */}
          <InteractiveHeroImage />
        </div>

        {/* --- Features Section --- */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} index={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Interactive Hero Image Sub-component ---
function InteractiveHeroImage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [10, -10], { clamp: true });
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10], { clamp: true });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className="relative flex justify-center items-center h-full row-start-1 md:col-start-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5, ease: "easeOut" } }}
    >
      <motion.div
        className="relative w-full max-w-md lg:max-w-lg"
        style={{ rotateX, rotateY, transition: "transform 0.1s ease-out" }}
      >
        <img
          src="https://placehold.co/600x600/F9FAFB/374151?text=Hero+Image"
          alt="Hero Illustration"
          className="w-full h-auto drop-shadow-2xl rounded-2xl"
        />
        {/* Floating UI elements with updated colors for light mode */}
        <motion.div
          className="absolute top-10 -right-12 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          style={{ translateX: useTransform(mouseX, [-200, 200], [20, -20]), translateY: useTransform(mouseY, [-200, 200], [20, -20]) }}
        >
          🎉 Free Website Included
        </motion.div>
        <motion.div
          className="absolute bottom-10 -left-12 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          style={{ translateX: useTransform(mouseX, [-200, 200], [-20, 20]), translateY: useTransform(mouseY, [-200, 200], [-20, 20]) }}
        >
          🚀 Ready to Sell
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// --- Feature Card Sub-component ---
function FeatureCard({ icon, title, description, index }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      // Switched from dark to a semi-transparent white background with a light border
      className="p-8 bg-white/50 backdrop-blur-lg rounded-2xl border border-gray-200 text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
}