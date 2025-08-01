"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion as Motion } from "framer-motion";
import heroImage from "../assets/hero_image.png";

// Features data is great, no need to change it.
const features = [
  { title: "Manage Products", description: "Track your inventory and keep everything organized.", icon: "📦" },
  { title: "Client Insights", description: "Understand your clients with powerful analytics.", icon: "👥" },
  { title: "Close Deals", description: "Streamline your sales process to close more deals.", icon: "📈" },
];

const Banner = () => {
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 lg:p-16 ">
      
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 bg-gray-50 -z-10">
        <div className="absolute w-full h-full bg-radial-gradient-to-t from-gray-100 to-transparent animate-pulse-slow"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-400 to-pink-300 rounded-full blur-3xl top-[-200px] left-[-300px] opacity-40 animate-spin-slow"></div>
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tl from-yellow-300 to-orange-200 rounded-full blur-3xl bottom-[-100px] right-[-200px] opacity-30 animate-spin-slow-reverse"></div>
      </div>

      {/* Main Content Container */}
      <div className="z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-24">
        
        {/* Left Section: Hero Text and Call-to-Action */}
        <Motion.div
          className="text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            Revolutionize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Sales</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-700 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Achieve your sales goals effortlessly with cutting-edge tools designed to simplify your workflow and maximize your results.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-8">
            <Motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-600 transition-transform duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Now
            </Motion.button>
            <Motion.button
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-bold rounded-full shadow-md hover:bg-gray-900 hover:text-white transition-colors duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </Motion.button>
          </div>
        </Motion.div>

        {/* Right Section: Hero Image */}
        <div className="relative flex justify-center items-center">
          <Motion.img
            src={heroImage.src}
            alt="Hero Illustration"
            className="w-full h-auto max-w-md lg:max-w-xl drop-shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>

      </div>

      {/* Feature Cards Section (Optional, can be placed below the hero) */}
      <div className="absolute -bottom-24 w-full flex justify-center z-50 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          {features.map((feature, index) => (
            <Motion.div
              key={index}
              className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4 text-purple-600">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 mt-2">{feature.description}</p>
            </Motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Banner;