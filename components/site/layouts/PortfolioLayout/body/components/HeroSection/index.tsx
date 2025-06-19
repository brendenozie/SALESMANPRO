'use client';

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-2xl text-center md:text-left space-y-6">
          <motion.h1
            className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transform Your Business with{" "}
            <span className="text-teal-600 underline decoration-wavy">
              Elite Coaching
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Ready to scale your goals? Schedule a free 30-minute strategy call with one of our top coaches. Clarity, growth, and breakthroughs begin here.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center md:justify-start gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-full transition">
              View Services
            </button>
            <button className="border border-teal-600 text-teal-700 hover:bg-teal-50 font-medium px-6 py-3 rounded-full transition">
              Schedule a Call
            </button>
          </motion.div>

          {/* Trust Rating */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
            <span className="text-sm text-gray-500">REVIEWED ON</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">109 Reviews</span>
          </div>
          <div className="text-black font-semibold text-base md:text-lg">on Clutch</div>
        </div>

        {/* Right Content */}
        <motion.div
          className="flex-1 relative w-full h-[360px] md:h-[460px] lg:h-[520px] overflow-hidden rounded-3xl shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img
            src="/mnt/data/1cfb0465-464f-454a-add6-ad2b0fd2c2e4.png"
            alt="Business Coach"
            className="w-full h-full object-cover rounded-3xl"
          />

          {/* Awards Badge */}
          <div className="absolute top-5 right-5 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1 rounded-full">
              <svg
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
            <span className="text-sm font-semibold text-gray-800">
              10+ Awards Won
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
