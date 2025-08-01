"use client";

import React from "react";
import { programsData } from "../data/programsData";
import RightArrow from "../assets/rightArrow.png";
import { motion as Motion } from "framer-motion";

// Icons from a professional library would be ideal, but for this example, we'll use placeholder SVGs
// For a real project, consider using a library like 'react-icons' or 'heroicons'
const iconSvgs = {
  icon1: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H6a1 1 0 01-1-1z" />
    </svg>
  ),
  icon2: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm6.586-1.414A2 2 0 008 3H4a1 1 0 00-1 1v2a1 1 0 001 1h4.586l.207.207a1 1 0 001.414 0L12.793 7H16a1 1 0 001-1V4a1 1 0 00-1-1h-4.586L10 4.414l-1.414-1.414zM4 9a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
    </svg>
  ),
  icon3: (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 3a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V3zM3 11a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
    </svg>
  ),
};

const ProgramCard = ({ heading, details, icon }: { heading: string; details: string; icon: any }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.05,
        y: -15, // Creates a more dramatic floating effect
        boxShadow: "0 40px 60px -15px rgba(0, 0, 0, 0.3)", // More pronounced shadow
        background: "linear-gradient(to right, #6d28d9, #e879f9)", // Consistent gradient
        color: "#fff", // Change text color to white for readability
      }}
      className="relative flex flex-col p-8 rounded-2xl gap-6 bg-white text-gray-900 shadow-lg border border-gray-200 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Icon with gradient circle */}
      <div className="absolute top-6 right-6 text-red-600 transition-colors duration-300 group-hover:text-white">
        {icon}
      </div>

      {/* Program Heading and Details */}
      <div className="z-10 transition-colors duration-300 group-hover:text-white">
        <h3 className="text-2xl font-bold">{heading}</h3>
        <p className="text-base mt-2 leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-200">{details}</p>
      </div>

      {/* Learn More Button */}
      <div className="flex items-center gap-3 mt-auto text-sm font-semibold text-red-600 group-hover:text-white transition-colors duration-300">
        <span>Explore Program</span>
        <img
          className="w-4 group-hover:translate-x-1 transition-transform duration-300"
          src={RightArrow.src}
          alt="Right Arrow Icon"
          aria-label="Explore Program"
        />
      </div>
    </Motion.div>
  );
};

const OurPrograms = () => {
  return (
    <section
      className="relative flex flex-col items-center gap-16 px-6 lg:px-20 py-24 bg-gray-50 overflow-hidden"
      id="programs"
      aria-labelledby="programs-header"
    >
      {/* Background Shapes */}
      <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-red-300 to-pink-200 rounded-full blur-3xl opacity-30 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute w-[300px] h-[300px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-20 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"></div>

      {/* Programs Header */}
      <header
        id="programs-header"
        className="text-center max-w-3xl z-10"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400">
            Empower Your Sales Journey
          </span>{" "}
          Today
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Discover a suite of powerful tools and programs designed to streamline your workflow and drive unprecedented growth.
        </p>
      </header>

      {/* Programs Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10 w-full max-w-7xl">
        {programsData.map((program, index) => (
          <ProgramCard
            key={program.heading}
            heading={program.heading}
            details={program.details}
            icon={iconSvgs[`icon${(index % 3) + 1}` as keyof typeof iconSvgs]}
          />
        ))}
      </div>
    </section>
  );
};

export default OurPrograms;