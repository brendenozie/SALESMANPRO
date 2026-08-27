"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalculatorIcon, ChartBarIcon, NewspaperIcon } from "@heroicons/react/24/outline"; // New icons

// Dummy data for Market Insights
const regions = [
  { name: "North America", avgPrice: 42500 },
  { name: "Europe", avgPrice: 38000 },
  { name: "Asia", avgPrice: 31000 },
  { name: "Oceania", avgPrice: 45000 },
  { name: "South America", avgPrice: 28000 },
];

const blogPosts = [
  { id: 1, title: "5 Tips for Buying Your First Electric Vehicle", href: "/blog/ev-tips" },
  { id: 2, title: "Understanding Loan Terms: What You Need to Know", href: "/blog/loan-terms" },
  { id: 3, title: "The Resale Value of Luxury Cars in 2025", href: "/blog/luxury-resale" },
  { id: 4, title: "Hybrid vs. Gas: Making the Right Choice", href: "/blog/hybrid-gas" },
];

// Reusing consistent animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
};

export default function MarketInsightsSection() {
  const [loanAmount, setLoanAmount] = useState(30000); // Increased default for better examples
  const [interestRate, setInterestRate] = useState(6.5); // More realistic rate
  const [termYears, setTermYears] = useState(5);

  const monthlyPayment =
    (loanAmount * (interestRate / 100 / 12)) /
    (1 - Math.pow(1 + (interestRate / 100 / 12), -termYears * 12));

  // Input styling for consistency
  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none";

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-950 relative overflow-hidden"
    >
      {/* Background Shapes for Visual Appeal */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '-2s' }}></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '-4s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            Market Insights & Smart Tools 📈
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empower your decisions with our comprehensive market insights and helpful financial tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Auto Loan Calculator */}
          <motion.div
            variants={cardVariants}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-blue-100 dark:border-gray-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-4">
                <CalculatorIcon className="w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold">Auto Loan Calculator</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Estimate your monthly payments with ease.
              </p>
              <div className="space-y-5">
                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loan Amount ($)
                  </label>
                  <input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className={inputStyle}
                  />
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 mt-2"
                    style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((loanAmount - 1000) / 99000) * 100}%, #E5E7EB ${((loanAmount - 1000) / 99000) * 100}%, #E5E7EB 100%)` }}
                  />
                </div>
                <div>
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className={inputStyle}
                  />
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 mt-2"
                    style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((interestRate - 1) / 19) * 100}%, #E5E7EB ${((interestRate - 1) / 19) * 100}%, #E5E7EB 100%)` }}
                  />
                </div>
                <div>
                  <label htmlFor="termYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Term (Years)
                  </label>
                  <input
                    id="termYears"
                    type="number"
                    value={termYears}
                    onChange={(e) => setTermYears(Number(e.target.value))}
                    className={inputStyle}
                  />
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={termYears}
                    onChange={(e) => setTermYears(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 mt-2"
                    style={{ background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((termYears - 1) / 6) * 100}%, #E5E7EB ${((termYears - 1) / 6) * 100}%, #E5E7EB 100%)` }}
                  />
                </div>
              </div>
            </div>
            <motion.div
              layout // Animate layout changes
              className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-3xl font-extrabold text-blue-700 dark:text-blue-400 text-center"
            >
              Monthly Payment: ${isFinite(monthlyPayment) ? monthlyPayment.toFixed(2) : "0.00"}
            </motion.div>
          </motion.div>

          {/* Regional Average & Blog Links */}
          <div className="space-y-8 flex flex-col">
            {/* Average Vehicle Price by Region */}
            <motion.div
              variants={cardVariants}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-purple-100 dark:border-gray-700 flex-grow"
            >
              <div className="flex items-center text-purple-600 dark:text-purple-400 mb-4">
                <ChartBarIcon className="w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold">Average Vehicle Price by Region</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Understand price trends across different geographies.
              </p>
              <ul className="space-y-4">
                {regions.map((region) => (
                  <motion.li
                    key={region.name}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 ease-in-out"
                    whileHover={{ scale: 1.01 }}
                  >
                    <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">{region.name}</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-300 text-xl">
                      ${region.avgPrice.toLocaleString()}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Latest Buying Guides */}
            <motion.div
              variants={cardVariants}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-green-100 dark:border-gray-700 flex-grow"
            >
              <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
                <NewspaperIcon className="w-8 h-8 mr-3" />
                <h3 className="text-2xl font-bold">Latest Buying Guides</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Stay informed with expert advice and helpful tips.
              </p>
              <ul className="space-y-4">
                {blogPosts.map((post) => (
                  <motion.li
                    key={post.id}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link href={post.href} className="flex items-center group text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition duration-200">
                      <span className="mr-3 text-blue-400 dark:text-blue-600 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                        →
                      </span>
                      <span className="font-medium text-lg group-hover:underline">
                        {post.title}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}