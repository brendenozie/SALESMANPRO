"use client";

import { GlobeAltIcon, UsersIcon } from "@heroicons/react/24/outline";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import body from "@/assets/body.png";

// Helper Component for the animated number counter
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      delay: 0.5, // Start animation after the component is in view
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

// Sub-component for the floating statistic cards for better structure
function StatCard({ icon, value, label, className, isTime = false }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  className?: string;
  isTime?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "circOut" }}
      viewport={{ once: true }}
      // Light-mode styling for the "glassmorphism" effect
      className={`flex items-center gap-4 bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-4 w-52 shadow-lg ${className}`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        {/* Light-mode text colors */}
        <h4 className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={value} />
          {isTime ? "/7" : "+"}
        </h4>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}


export default function AboutUs() {
  // Animation variants for staggering children elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time delay between each child animating in
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
        ease: "easeInOut",
      },
    },
  };

  return (
    // Main section with a light background
    <section className="relative w-full py-24 px-6 md:px-12 bg-white text-gray-800 overflow-hidden">
      {/* Subtle background glows for visual appeal in light mode */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full filter blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-200/30 rounded-full filter blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Content - Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="space-y-8"
        >
          <motion.h2
            variants={itemVariants}
            // Darker gradient for better contrast on a light background
            className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-yellow-500"
          >
            From Idea to Empire.
            <br />
            We Handle the Tech.
          </motion.h2>

          {/* Light-mode text colors */}
          <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
            At <span className="font-semibold text-gray-900">SalesmanPro</span>, we turn entrepreneurial dreams into digital realities.
            Our platform provides everything you need to {" "}
            <span className="text-red-600 font-medium">
              launch, manage, and scale your online business
            </span>
            , effortlessly.
          </motion.p>
          
          <motion.p variants={itemVariants} className="text-gray-600 leading-relaxed">
            Focus on your craft, connect with your customers, and build your brand. We'll take care of the complex stuff behind the scenes.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px -5px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-red-600 text-white font-semibold px-8 py-3 transition-shadow duration-300"
            >
              Start Your Journey
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" /* bg-gray-100 */ }}
              whileTap={{ scale: 0.95 }}
              // Light-mode secondary button styles
              className="rounded-full border border-gray-300 text-gray-800 font-semibold px-8 py-3 transition-colors duration-300"
            >
              Explore Features
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content - Visuals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative flex justify-center items-center"
        >
          {/* Glowing Border Effect remains effective */}
          <div className="relative w-full max-w-md p-1 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500">
            {/* Inner background is now white */}
            <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/20">
              {/* Replaced Next.js Image with a standard img tag to resolve the error */}
              <img
                src={body.src || "https://placehold.co/500x500/E2E8F0/475569?text=Your+Image"} // Replace with your compelling, high-quality image
                alt="A successful entrepreneur using SalesmanPro"
                width={500}
                height={500}
                className="object-cover aspect-square"
              />
            </div>
          </div>

          {/* Floating Stat Cards with updated props */}
          <StatCard
            icon={<UsersIcon className="text-indigo-600" />}
            value={10000}
            label="Businesses Empowered"
            className="absolute -bottom-8 -left-8"
          />
          <StatCard
            icon={<GlobeAltIcon className="text-indigo-600" />}
            value={24} // Will display as 24/7
            label="Global Support"
            className="absolute -top-8 -right-8"
            isTime
          />
        </motion.div>
      </div>
    </section>
  );
}
