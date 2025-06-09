import { StarIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function HeroSection() {
  return (
    <div className="bg-white py-12 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Left Content */}
      <div className="flex-1 max-w-xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Business Coaching Can Change <span className="text-teal-600 underline decoration-wavy">Everything</span>
        </h1>
        <p className="text-gray-600 text-base">
          Ready to reach your goals? Book a free 30-minute call with our top coaches. Connect with the ideal coach and start creating your effective strategy.
        </p>
        <div className="flex gap-4 flex-wrap">
          <button className="bg-orange-500 hover:bg-orange-600 text-white">View Services</button>
          <button className="border-gray-300 hover:border-teal-600 text-teal-700">
            Schedule a Call
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="text-gray-500 text-sm">REVIEWED ON</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-4 w-4 text-red-500 fill-red-500" />
            ))}
          </div>
          <div className="text-gray-600 text-sm">109 REVIEWS</div>
        </div>
        <div className="text-black font-semibold mt-1 text-lg">Clutch</div>
      </div>

      {/* Right Content */}
      <div className="relative flex-1">
        <div className="rounded-3xl overflow-hidden bg-teal-800 p-4">
          <img
            src="/mnt/data/1cfb0465-464f-454a-add6-ad2b0fd2c2e4.png"
            alt="Business Coach"
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>

        {/* Awards Badge */}
        <div className="absolute top-4 right-4 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
          <div className="bg-orange-500 text-white rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">10+ Awards Won</span>
        </div>
      </div>
    </div>
  );
}
