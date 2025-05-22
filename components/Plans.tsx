import React from "react";
import whiteTick from "../assets/whiteTick.png";
import fit1 from "../assets/fit1.png";
import { ISubscritption } from "../types/typings";

type Props = {
  subscriptions: ISubscritption[];
};

const Plans = ({ subscriptions }: Props) => {
  return (
    <div className="mt-16 px-4 sm:px-8 flex flex-col gap-12 sm:gap-20 relative">
      {/* Background Gradient Circles */}
      <div className="bg-[#fde4d4] absolute rounded-full blur-[160px] w-[20rem] sm:w-[32rem] h-[15rem] sm:h-[23rem] top-[4rem] left-0"></div>
      <div className="bg-[#fde4d4] absolute rounded-full blur-[160px] w-[20rem] sm:w-[32rem] h-[15rem] sm:h-[23rem] top-[10rem] right-0"></div>

      {/* Heading Section */}
      <div className="flex flex-col sm:flex-row font-bold text-3xl sm:text-4xl md:text-5xl justify-center text-transparent uppercase italic gap-4 sm:gap-8 md:gap-[2rem] text-center sm:text-left z-10">
        <span className="font-outline">Ready to Start</span>
        <span className="text-black">Your Journey</span>
        <span className="font-outline">Now with Us</span>
      </div>


      {/* Plans Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-[3rem] z-10">
        {subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((item: ISubscritption, i) => (
            <div
              className={`flex flex-col text-gray-800 gap-6 sm:gap-8 p-6 sm:p-8 w-full sm:w-[18rem] md:w-[20rem] rounded-lg shadow-lg transition-transform duration-300 transform ${
                i === 1
                  ? "scale-105 sm:scale-110 bg-gradient-to-r from-[#ffc1a6] to-[#ffe2c4]"
                  : "bg-[#f5f5f5]"
              }`}
              key={i}
            >
              {/* Plan Icon */}
              <img className="w-4 sm:w-6" src={fit1.src} alt="Icon" />

              {/* Plan Name */}
              <span className="text-base sm:text-lg font-bold">{item.name}</span>

              {/* Plan Price */}
              <span className="text-3xl sm:text-4xl font-bold">$ {item.price}</span>

              {/* Features */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 h-14">
                  <img className="w-4 sm:w-6" src={whiteTick.src} alt="Tick" />
                  <span className="text-sm sm:text-base">{item.duration}</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 h-14">
                  <img className="w-4 sm:w-6" src={whiteTick.src} alt="Tick" />
                  <span className="text-sm sm:text-base">{item.description}</span>
                </div>
              </div>

              {/* See More Benefits */}
              <div className="text-xs sm:text-sm text-gray-500 underline cursor-pointer">
                <span>See more benefits</span>
              </div>

              {/* Join Now Button */}
              <button className="mt-4 py-2 px-6 sm:py-3 sm:px-8 font-bold rounded-sm bg-[#fd782b] text-white hover:bg-[#e36d24] transition-all duration-300">
                Join now
              </button>
            </div>
          ))
        ) : (
          <div>No plans available</div>
        )}
      </div>
    </div>
  );
};

export default Plans;
