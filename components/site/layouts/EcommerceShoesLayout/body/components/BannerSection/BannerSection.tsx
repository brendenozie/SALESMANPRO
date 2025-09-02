

import React, { useState } from 'react';

export default function BannerSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="bg-[#f8f1eb] py-20 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto text-center">
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-white to-gray-100 text-gray-900 font-sans rounded-2xl shadow-2xl p-6 md:p-12 lg:p-20">
      {/* Background radial gradient for a subtle, premium glow */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-indigo-400 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-fuchsia-400 blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-10 md:space-y-0 md:space-x-10">
        
        {/* Text and CTA section */}
        <div className="flex-1 max-w-2xl">
          <p className="text-lg sm:text-xl font-medium text-indigo-600 mb-2 tracking-wide uppercase">New Arrivals</p>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Step Into Style. <br className="hidden sm:inline" /> Elevate Your Game.
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl font-light leading-relaxed">
            Discover a fusion of cutting-edge design and unparalleled comfort. Our exclusive collection is engineered for performance and styled for the streets.
          </p>
          
          {/* Interactive Button */}
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="mt-8 px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-gray-900 animate-fade-in"
          >
            {isHovered ? 'Explore The Collection' : 'Shop Now'}
          </button>
        </div>

        {/* Image showcase section with layered images and parallax effect */}
        <div className="flex-1 w-full relative group transform transition-transform duration-500 ease-in-out hover:scale-105">
          {/* Main shoe image */}
          <img
            src="https://images.unsplash.com/photo-1605340628286-905b76609f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Premium running shoe"
            className="relative z-10 w-full rounded-xl shadow-2xl transition-transform duration-500 ease-in-out group-hover:rotate-6"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/1920x1080/000000/ffffff?text=Shoes+Store+Banner";
            }}
          />
          {/* Subtly layered second shoe image */}
          <img
            src="https://images.unsplash.com/photo-1542291026-79eddc872736?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Premium sneaker"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 -rotate-12 z-0 opacity-50 transition-transform duration-500 ease-in-out group-hover:rotate-12"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/1920x1080/000000/ffffff?text=Shoes+Store+Banner";
            }}
          />
        </div>
      </div>
    </div>
    </div>
    </section>
  );
};

