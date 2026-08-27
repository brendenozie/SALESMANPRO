"use client";

import React, { useRef } from "react";
import { motion as Motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Join = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for form submission
    console.log("Form submitted!");
  };

  return (
    <section id="contact" className="relative px-6 sm:px-16 lg:px-24 py-24 bg-gray-50 overflow-hidden">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-gradient-to-r from-purple-200 to-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center p-8 sm:p-12 lg:p-16 rounded-3xl bg-white shadow-2xl border border-gray-100">
        {/* Animated Headline */}
        <Motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-yellow-400">Transform Your Sales?</span>
        </Motion.h2>

        {/* Sub-headline */}
        <Motion.p
          className="mt-4 text-lg text-gray-600"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join thousands of professionals who are closing more deals and growing their business.
        </Motion.p>

        {/* Form Section */}
        <Motion.div
          className="mt-12 w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <form
            ref={formRef}
            onSubmit={handleJoin}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="email"
              name="user_email"
              placeholder="Enter your professional email"
              required
              className="flex-1 px-5 py-4 text-gray-800 placeholder-gray-400 bg-gray-100 border-2 border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center justify-center space-x-2 px-8 py-4 font-bold text-white bg-gradient-to-r from-pink-600 to-yellow-400 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Start Free Trial</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required. Cancel anytime.
          </p>
        </Motion.div>
      </div>
    </section>
  );
};

export default Join;