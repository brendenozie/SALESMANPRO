import Picard from "@/components/Picard";
import React, { useRef } from "react";
import { picardData } from "@/constant/Data";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const Pic = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="destinations"
      data-testid="destinations"
      className="relative flex flex-col py-12 rounded-lg bg-gradient-to-b from-[#fdfdfd] to-[#f3f4f6] text-gray-800"
    >
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-[#ffe4c4] rounded-full opacity-40 -top-20 -left-32 blur-[150px] animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#ffcc80] rounded-full opacity-30 top-16 right-[-60px] blur-[120px] animate-pulse delay-500"></div>
      </div>

      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
          Explore Our Offerings
        </h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Discover a variety of options designed to cater to your fitness needs
          and help you achieve your goals.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative flex items-center justify-center">
        <div
          ref={scrollContainer}
          className="overflow-hidden snap-x snap-mandatory scrollbar-hide w-full md:w-4/5 lg:w-3/4"
        >
          <div className="flex space-x-6 lg:space-x-6">
            {picardData.map((card) => (
              <Picard
                key={card.id}
                title={card.title}
                desc={card.desc}
              />
            ))}
          </div>
        </div>

        {/* Left Scroll Button */}
        <button
          aria-label="Scroll left"
          className="hidden md:block p-4 backdrop-blur-lg rounded-full absolute top-1/2 -translate-y-1/2 left-4 bg-gray-200 shadow-xl text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
          onClick={scrollLeft}
        >
          <ChevronLeftIcon className="h-8 w-8" />
        </button>

        {/* Right Scroll Button */}
        <button
          aria-label="Scroll right"
          className="hidden md:block p-4 backdrop-blur-lg rounded-full absolute top-1/2 -translate-y-1/2 right-4 bg-gray-200 shadow-xl text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
          onClick={scrollRight}
        >
          <ChevronRightIcon className="h-8 w-8" />
        </button>
      </div>

      {/* Decorative Dots for Mobile */}
      <div className="mt-6 flex justify-center space-x-2 md:hidden">
        {picardData.map((_, index) => (
          <span
            key={index}
            className="w-3 h-3 rounded-full bg-gray-400 hover:bg-gray-500 cursor-pointer transition duration-300"
          ></span>
        ))}
      </div>
    </section>
  );
};

export default Pic;
