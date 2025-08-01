"use client";
import React, { useRef } from "react";
import { motion as Motion } from "framer-motion";
import Link from "next/link";

const Join = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission
    console.log("Form submitted!");
  };

  return (
    <section
      className="relative px-6 sm:px-16 lg:px-24 py-20 bg-gray-50 overflow-hidden"
      id="join-us"
    >
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-300 to-pink-200 rounded-full blur-3xl opacity-30 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-20 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10 p-8 rounded-3xl bg-white shadow-2xl border border-gray-100">
        {/* Text Section */}
        <Motion.div
          className="relative max-w-lg text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase leading-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Ready to
            </span>
            <span className="text-gray-900">Take Your Sales</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              to the Next Level?
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
            Join thousands of sales professionals who are closing more deals and growing their business with our platform.
          </p>
        </Motion.div>

        {/* Form Section */}
        <Motion.div
          className="w-full max-w-lg lg:w-1/2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <form
            ref={formRef}
            onSubmit={handleJoin}
            className="flex flex-col gap-6"
          >
            <input
              type="email"
              name="user_email"
              placeholder="Enter your professional email address"
              required
              className="w-full px-5 py-4 text-gray-800 placeholder-gray-400 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
            />
            <button
              type="submit"
              className="w-full py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Sign Up for Free
            </button>
          </form>
        </Motion.div>
      </div>
    </section>
  );
};

export default Join;