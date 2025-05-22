"use client";

import React from "react";
import { programsData } from "../data/programsData";
import RightArrow from "../assets/rightArrow.png";
import { motion as Motion } from "framer-motion";

const ProgramCard = ({ heading, details }: any) => {
  return (
    <Motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(to right, #ffa739, #fa5042)",
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex flex-col bg-white p-6 gap-6 text-gray-900 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Program Icon */}
      <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-[#fa5042] to-[#ffa739] rounded-full shadow-lg">
        <span className="text-2xl font-bold text-white">★</span>
      </div>

      {/* Program Heading */}
      <h3 className="text-xl font-semibold">{heading}</h3>

      {/* Program Details */}
      <p className="text-sm leading-relaxed text-gray-600">{details}</p>

      {/* Learn More Button */}
      <div className="flex items-center gap-3 mt-4 text-sm font-medium text-[#fa5042] hover:text-[#ffa739] transition-colors">
        <span>Learn More</span>
        <img
          className="w-4"
          src={RightArrow.src}
          alt="Right Arrow Icon"
          aria-label="Learn More"
        />
      </div>
    </Motion.div>
  );
};

const OurPrograms = () => {
  return (
    <section
      className="flex flex-col gap-16 px-6 lg:px-20 py-20  rounded-lg "
      id="programs"
      aria-labelledby="programs-header"
    >
      {/* Programs Header */}
      <header
        id="programs-header"
        className="text-center uppercase text-gray-900 tracking-wide"
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa5042] to-[#ffa739]">
            Empower Your
          </span>{" "}
          Sales Journey{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa5042] to-[#ffa739]">
            Today
          </span>
        </h2>
      </header>

      {/* Programs Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {programsData.map((program) => (
          <ProgramCard
            key={program.heading}
            heading={program.heading}
            details={program.details}
          />
        ))}
      </div>
    </section>
  );
};

export default OurPrograms;
