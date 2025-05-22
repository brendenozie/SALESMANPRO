"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion as Motion } from "framer-motion";
import heroImage from "../assets/hero_image.png";

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

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="relative h-screen  ">
      {/* Background Accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-400 to-purple-300 rounded-full blur-3xl top-[-100px] left-[-150px] opacity-30"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-yellow-300 to-orange-200 rounded-full blur-3xl bottom-[-100px] right-[-150px] opacity-30"></div>
      </div>

      {/* Content */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between h-full px-6 lg:px-16">
        {/* Left Section: Hero Text */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-snug">
            Revolutionize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">Sales</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Achieve your sales goals effortlessly with cutting-edge tools designed to simplify your workflow.
          </p>
          <div className="flex justify-center lg:justify-start gap-4 mt-6">
            <button className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-300 text-white font-bold rounded-full shadow-md hover:from-yellow-400 hover:to-orange-500 transition-transform hover:scale-105">
              Get Started
            </button>
            <button className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full shadow-md hover:bg-gray-900 hover:text-white transition-transform hover:scale-105">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Section: Features */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Motion.div
              key={index}
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 mt-2">{feature.description}</p>
            </Motion.div>
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div className="absolute bottom-0 right-0 lg:right-16 w-1/2 max-w-lg">
        <Motion.img
          src={heroImage.src}
          alt="Hero Illustration"
          className="w-full h-auto drop-shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </div>
  </div>    
  );
};

export default Banner;
