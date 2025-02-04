import React from "react";
import Ndata from "./Ndata";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";

const NewArrivals = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            {/* Animated New Icon */}
            <div className="w-14 h-14 bg-yellow-500 flex items-center justify-center rounded-full shadow-lg animate-pulse">
              <img
                src="https://img.icons8.com/glyph-neue/64/ffffff/new.png"
                alt="New Arrivals Icon"
                className="w-10 h-10"
              />
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Latest <span className="text-yellow-400">Arrivals</span>
            </h2>
          </div>
          <button className="px-4 py-2 bg-yellow-400 text-black rounded-full shadow hover:bg-yellow-300 hover:ring-4 hover:ring-yellow-300 hover:ring-opacity-50 transition flex items-center space-x-2">
            <span>View All</span>
            <ArrowRightCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {Ndata.map((val, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl shadow-xl transform transition-transform duration-500 hover:scale-105 hover:shadow-2xl"
            >
              {/* Product Image */}
              <img
                src={val.cover}
                alt={`Product image of ${val.name}`}
                className="w-full h-64 sm:h-72 md:h-80 lg:h-[420px] object-cover rounded-xl transform transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay - Adjusted Opacity */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 dark:from-black/80 dark:to-black/40 group-hover:opacity-90 transition-opacity"></div>

              {/* Simplified Glow Effect on Hover */}
              <div className="absolute inset-0 group-hover:bg-white/5 dark:group-hover:bg-black/10 transition-all duration-500"></div>

              {/* Text Box */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/30 dark:bg-black/40 backdrop-blur-lg p-6 rounded-lg shadow-lg transition-all duration-500">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white drop-shadow-lg truncate">
                  {val.name}
                </h4>
                <span className="text-yellow-400 font-bold text-lg mt-2 inline-block">
                  ${val.price}
                </span>
              </div>

              {/* Add to Cart Button */}
              <button className="absolute bottom-6 right-6 bg-yellow-400 text-black px-4 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
