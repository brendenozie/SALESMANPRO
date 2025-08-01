import React from "react";
import { motion as Motion } from "framer-motion";

interface CardProps {
  title: string;
  desc: string;
  icon?: React.ReactNode; // Assuming an icon prop for visual representation
}

const Picard = ({ title, desc, icon }: CardProps) => {
  return (
    <Motion.div
      className="flex flex-col min-w-[300px] max-w-[300px] h-[350px] p-8 rounded-2xl bg-white shadow-xl snap-center
        hover:scale-105 hover:shadow-2xl transition-all duration-300 transform-gpu
        border border-gray-100 cursor-pointer"
      whileHover={{ y: -10 }}
    >
      {/* Icon Section */}
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 via-red-500 to-yellow-400 flex items-center justify-center text-white text-3xl shadow-lg">
          {icon ? icon : "🚀"} {/* Default icon if none is provided */}
        </div>
      </div>

      {/* Title and Description */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {desc}
        </p>
      </div>

      {/* Decorative Line */}
      <div className="h-[3px] w-12 bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 rounded-full mt-auto"></div>
    </Motion.div>
  );
};

export default Picard;