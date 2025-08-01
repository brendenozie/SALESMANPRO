"use client";
import React, { useRef } from "react";
import { motion as Motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Picard from "./Picard"; // Assuming this is a component that renders the cards
import { picardData } from "../constant/Data"; // Assuming this is your data source

const Pic = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -320, // Adjust scroll amount to match card width + gap
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: 320, // Adjust scroll amount to match card width + gap
        behavior: "smooth",
      });
    }
  };

  // Animation variants for the card entrance
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <section
      id="features-carousel"
      className="relative flex flex-col py-24 bg-gray-50 overflow-hidden"
    >
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-300 to-pink-200 rounded-full blur-3xl opacity-30 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-20 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Section Title */}
      <div className="container mx-auto px-6 lg:px-12 text-center mb-12">
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Discover Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 ">
              Powerful Features
            </span>
          </h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-600">
            Explore a suite of tools designed to streamline your workflow, boost your team's efficiency, and close more deals.
          </p>
        </Motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center justify-center w-full px-4 lg:px-0">
        {/* Left Scroll Button */}
        <button
          aria-label="Scroll left"
          className="absolute hidden md:block z-20 left-4 lg:left-8 p-3 rounded-full bg-white text-red-600 shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
          onClick={scrollLeft}
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>

        <div
          ref={scrollContainer}
          className="flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide space-x-8 lg:space-x-12 px-6 py-6"
        >
          {picardData.map((card, index) => (
            <Motion.div
              key={card.id}
              initial="hidden"
              whileInView="visible"
              variants={cardVariants}
              viewport={{ once: true, amount: 0.5 }}
              className="flex-shrink-0 snap-center"
            >
              <Picard
                title={card.title}
                desc={card.desc}
                // Assuming Picard takes an image prop
                // image={card.image}
              />
            </Motion.div>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          aria-label="Scroll right"
          className="absolute hidden md:block z-20 right-4 lg:right-8 p-3 rounded-full bg-white text-purple-600 shadow-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
          onClick={scrollRight}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
};

export default Pic;