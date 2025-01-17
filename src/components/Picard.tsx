import React from "react";

interface CardProps {
  title: string;
  desc: string;
}

const Picard = ({ title, desc }: CardProps) => {
  return (
    <div className="flex flex-col min-w-[270px] gap-6 px-6 py-8 rounded-lg bg-white shadow-lg text-gray-800 snap-center transition-all transform hover:scale-105 hover:shadow-xl duration-300 h-[350px] mx-auto">
      {/* Title Section */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">{desc}</p>
      </div>

      {/* Decorative Line */}
      <div className="h-1 w-16 mx-auto sm:mx-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"></div>

      {/* Decorative Badge */}
      <div className="w-10 h-10 mx-auto sm:mx-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">★</span>
      </div>
    </div>
  );
};

export default Picard;
