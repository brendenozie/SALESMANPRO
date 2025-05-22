"use client";
import React, { useState } from "react";
import leftArrow from "../assets/leftArrow.png";
import rightArrow from "../assets/rightArrow.png";
import { testimonialsData } from "../data/testimonialsData";
import { motion as MotionComponent } from "framer-motion";

const Testimonials = () => {
  const [selected, setSelected] = useState(0);
  const tLength = testimonialsData.length;
  const transition = { type: "spring", duration: 1 };

  const handlePrevious = () => {
    setSelected(selected === 0 ? tLength - 1 : selected - 1);
  };

  const handleNext = () => {
    setSelected(selected === tLength - 1 ? 0 : selected + 1);
  };

  return (
    <div className="relative w-full py-16 rounded-lg px-6 md:px-12 lg:px-20  text-gray-900 ">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-[#fa5042] rounded-full opacity-20 -top-20 -left-32 blur-[150px] animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#ffa739] rounded-full opacity-10 top-16 right-[-60px] blur-[120px] animate-pulse delay-500"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 items-center justify-between">
        {/* Left Section: Text Content */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-lg md:text-xl font-semibold uppercase text-[#fa5042]">
            Testimonials
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fa5042] to-[#ffa739]">
            Sales That <br /> Speak Success
          </h1>
          <MotionComponent.p
            key={selected}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={transition}
            className="text-lg md:text-xl text-gray-700 italic leading-relaxed"
          >
            "{testimonialsData[selected].review}"
          </MotionComponent.p>
          <div className="text-gray-500 text-sm md:text-base mt-2">
            <span className="font-semibold text-[#fa5042]">
              {testimonialsData[selected].name}
            </span>{" "}
            - {testimonialsData[selected].status}
          </div>
          <div className="text-gray-600 text-sm italic">
            Closed {testimonialsData[selected].dealsClosed} deals | Customer
            Satisfaction: {testimonialsData[selected].customerSatisfaction}%
          </div>
        </div>

        {/* Right Section: Image & Arrows */}
        <div className="flex-1 relative flex justify-center items-center">
          {/* Background Accent Elements */}
          <MotionComponent.div
            className="absolute w-72 h-80 border-4 border-[#fa5042] rounded-lg"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...transition, duration: 1.5 }}
          ></MotionComponent.div>
          <MotionComponent.div
            className="absolute w-72 h-80 bg-gradient-to-r from-[#fa5042] to-[#ffa739] rounded-lg blur-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...transition, duration: 1.5 }}
          ></MotionComponent.div>

          {/* Testimonial Image */}
          <MotionComponent.img
            key={selected}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={transition}
            src={testimonialsData[selected].image?.src}
            alt={testimonialsData[selected].name}
            className="relative w-64 h-72 rounded-lg object-cover shadow-lg"
          />

          {/* Arrow Controls */}
          <div className="absolute flex gap-6 bottom-0">
            <img
              className="w-10 h-10 cursor-pointer transition-transform transform hover:scale-110"
              src={leftArrow.src}
              alt="Previous Testimonial"
              onClick={handlePrevious}
              tabIndex={0}
              role="button"
              aria-label="Previous Testimonial"
            />
            <img
              className="w-10 h-10 cursor-pointer transition-transform transform hover:scale-110"
              src={rightArrow.src}
              alt="Next Testimonial"
              onClick={handleNext}
              tabIndex={0}
              role="button"
              aria-label="Next Testimonial"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
