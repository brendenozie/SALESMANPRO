"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import banner from "@/assets/banner.png";
import { motion as Motion } from "framer-motion";

const loaderProp = ({ src }: any) => {
  return src;
};

const PlayStoreBanner = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative w-full h-[800px] md:h-[600px] rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between text-gray-900 px-6 md:px-12 lg:px-20 py-24">
      {/* Background with subtle gradient blur */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-50 to-white">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-red-300 to-pink-200 rounded-full blur-3xl opacity-50 -top-20 -left-20 animate-pulse-slow"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-40 bottom-10 right-20 animate-pulse-slow delay-500"></div>
      </div>

      {/* Left Side: App Mockup */}
      <Motion.div
        className="relative flex items-center justify-center w-full md:w-1/2 z-10 p-4"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <Image
          src={banner}
          alt="Salesman App Mockup"
          width={400}
          height={400}
          loader={loaderProp}
          className="transform hover:scale-105 hover:rotate-1 transition-transform duration-500 ease-in-out"
        />
      </Motion.div>

      {/* Right Side: Text and Call-to-Action */}
      <Motion.div
        className="relative flex flex-col items-center md:items-start justify-center space-y-6 md:w-1/2 text-center md:text-left z-10"
        initial="hidden"
        whileInView="show"
        variants={containerVariants}
        viewport={{ once: true, amount: 0.5 }}
      >
        {/* Headline */}
        <Motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 drop-shadow-lg"
          variants={itemVariants}
        >
          Supercharge Your <br /> Sales Success
        </Motion.h1>

        {/* Supporting Text */}
        <Motion.p
          className="text-base md:text-lg text-gray-700 leading-relaxed max-w-lg"
          variants={itemVariants}
        >
          Seamlessly manage leads, boost performance, and close deals faster with an intuitive app tailored to elevate your sales journey.
        </Motion.p>

        {/* Call-to-Action Buttons */}
        <Motion.div
          className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 pt-4"
          variants={itemVariants}
        >
          <Link
            href="https://play.google.com/store/apps/details?id=co.ke.tulivuapps.salesmanapp"
            className="inline-block bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 text-white py-4 px-10 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300"
          >
            Get Started Now
          </Link>
          <Link
            href="/features"
            className="inline-block bg-transparent border-2 border-red-600 text-red-600 py-4 px-10 rounded-full font-bold text-lg hover:bg-red-600 hover:text-white hover:scale-105 transition-transform duration-300"
          >
            Learn More
          </Link>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default PlayStoreBanner;