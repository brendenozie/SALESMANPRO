"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <svg
          className="absolute bottom-0 left-0 w-full opacity-20"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#fff"
            fillOpacity="0.1"
            d="M0,224L40,218.7C80,213,160,203,240,176C320,149,400,107,480,112C560,117,640,171,720,192C800,213,880,203,960,192C1040,181,1120,171,1200,186.7C1280,203,1360,245,1400,266.7L1440,288V0H0Z"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg"
        >
          How It Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-orange-100 mb-16 max-w-3xl mx-auto leading-relaxed"
        >
          Connect with top consultants and coaches in just a few steps.
          Simple, smart, and built for your growth.
        </motion.p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          {[
            {
              icon: <MagnifyingGlassIcon className="h-10 w-10" />,
              title: "1. Search & Discover",
              text: "Browse verified programs specializing in your growth area.",
            },
            {
              icon: <ChatBubbleLeftRightIcon className="h-10 w-10" />,
              title: "2. Connect & Book",
              text: "Chat, schedule, and pay securely — all in one smooth experience.",
            },
            {
              icon: <RocketLaunchIcon className="h-10 w-10" />,
              title: "3. Grow & Thrive",
              text: "Work with your chosen expert and see measurable results in your life or business.",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group flex flex-col items-center p-8 bg-white/10 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/20 hover:bg-white/15 hover:scale-105 transition-transform duration-500"
            >
              <div className="bg-white text-orange-600 p-5 rounded-full mb-6 shadow-lg group-hover:rotate-6 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-orange-100 text-center">{step.text}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative bg-white text-orange-700 rounded-3xl p-10 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto"
        >
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-3xl md:text-4xl font-extrabold mb-3">
              Let's Transform Your Journey Together
            </h3>
            <p className="text-lg text-gray-700">
              Join our growing network and empower others to reach their goals
              — while expanding your own influence.
            </p>
          </div>
          <Link
            href="/join"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold text-lg rounded-full shadow-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300"
          >
            Join as a Coach
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
