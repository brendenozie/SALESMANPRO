"use client";

import React from "react";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import nb from "../assets/nb.png";
import adidas from "../assets/adidas.png";
import nike from "../assets/nike.png";
import tick from "../assets/tick.png";
import { motion as Motion } from "framer-motion";

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Reasons = () => {
  return (
    <section className="bg-gray-50 text-gray-900 py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Image Gallery Section */}
          <Motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative"
            initial="hidden"
            whileInView="show"
            variants={containerVariants}
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Main Image */}
            <Motion.div 
              className="col-span-2 lg:col-span-3 rounded-xl overflow-hidden shadow-2xl"
              variants={itemVariants}
            >
              <img
                src={image1.src}
                alt="A salesperson closing a deal"
                className="w-full h-80 lg:h-[28rem] object-cover transition-transform duration-500 hover:scale-110"
              />
            </Motion.div>
            {/* Supporting Images */}
            <Motion.img
              src={image2.src}
              alt="Efficient management of sales"
              className="w-full h-48 lg:h-56 object-cover rounded-xl shadow-lg transition-transform duration-500 hover:scale-110"
              variants={itemVariants}
            />
            <Motion.img
              src={image3.src}
              alt="A dashboard showcasing sales analytics"
              className="w-full h-48 lg:h-56 object-cover rounded-xl shadow-lg transition-transform duration-500 hover:scale-110"
              variants={itemVariants}
            />
            <Motion.img
              src={image3.src}
              alt="A dashboard showcasing sales analytics"
              className="w-full h-48 lg:h-56 object-cover rounded-xl shadow-lg transition-transform duration-500 hover:scale-110"
              variants={itemVariants}
            />
            {/* The commented out image4 has been removed for a cleaner 3-image grid layout */}
          </Motion.div>

          {/* Text Section */}
          <div className="flex flex-col gap-8">
            
            {/* Header Section */}
            <Motion.div
              className="uppercase text-base lg:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 tracking-widest"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Key Benefits
            </Motion.div>

            <Motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400">Platform?</span>
            </Motion.h2>

            {/* Reasons List */}
            <Motion.ul
              className="flex flex-col gap-6 text-lg lg:text-xl font-medium"
              initial="hidden"
              whileInView="show"
              variants={containerVariants}
              viewport={{ once: true, amount: 0.5 }}
            >
              {[
                "Streamline your sales process effortlessly",
                "Track real-time performance and analytics",
                "Boost productivity with AI-powered tools",
                "Foster stronger customer relationships",
              ].map((reason, index) => (
                <Motion.li key={index} className="flex items-center gap-4" variants={itemVariants}>
                  <img
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    src={tick.src}
                    alt="Checkmark"
                  />
                  <span className="text-gray-600">
                    {reason}
                  </span>
                </Motion.li>
              ))}
            </Motion.ul>

            {/* Partners Section */}
            <Motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-500 text-sm font-semibold mb-4">
                Trusted by Industry Leaders
              </p>
              <div className="flex gap-8 items-center">
                {[nb, adidas, nike].map((company, idx) => (
                  <img
                    key={idx}
                    src={company.src}
                    alt={`Partner ${idx + 1}`}
                    className="w-14 h-auto filter grayscale hover:grayscale-0 transition-all duration-500"
                  />
                ))}
              </div>
            </Motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reasons;