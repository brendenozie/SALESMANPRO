import React from "react";
import Link from "next/link";
import Image from "next/image";
import banner from "../assets/banner.png";

const loaderProp = ({ src }: any) => {
  return src;
};

const PlayStoreBanner = () => {
  return (
    <div className="relative w-full h-[800px] md:h-[500px] rounded-md flex flex-col md:flex-row items-center justify-between  text-gray-900 px-6 md:px-12 lg:px-20">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-[#fa5042] rounded-full opacity-30 -top-20 -left-32 blur-[150px] animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#ffa739] rounded-full opacity-20 top-16 right-[-60px] blur-[120px] animate-pulse delay-500"></div>
      </div>

      {/* Left Side: App Mockup */}
      <div className="relative flex items-center justify-center w-full md:w-1/2 z-10">
        <Image
          src={banner}
          alt="Salesman App Mockup"
          width={350}
          height={350}
          loader={loaderProp}
          className="transform hover:scale-105 hover:rotate-1 transition-transform duration-500 ease-in-out"
        />
      </div>

      {/* Right Side: Text and Call-to-Action */}
      <div className="relative flex flex-col items-center md:items-start justify-center space-y-6 md:w-1/2 text-center md:text-left z-10">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fa5042] to-[#ffa739] drop-shadow-lg">
          Supercharge Your <br /> Sales Success
        </h1>

        {/* Supporting Text */}
        <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-lg">
          Seamlessly manage leads, boost performance, and close deals faster with an intuitive app tailored to elevate your sales journey.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <Link
            href="https://play.google.com/store/apps/details?id=co.ke.tulivuapps.salesmanapp"
            className="inline-block bg-gradient-to-r from-[#fa5042] to-[#ffa739] text-white py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform duration-300"
          >
            Get Started Now
          </Link>
          <Link
            href="/features"
            className="inline-block bg-transparent border-2 border-[#fa5042] text-[#fa5042] py-3 px-8 rounded-full font-bold text-lg shadow-lg hover:bg-[#fa5042] hover:text-white hover:scale-105 transition-transform duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayStoreBanner;
