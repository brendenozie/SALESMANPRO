'use client';

import React from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, UsersIcon, SparklesIcon, PresentationChartBarIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

// Animation Variants for lists
const listContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

// --- Module Data Structure ---
const coreModules = [
  "Modules 1–2: Self Discovery - Personal Assessment and Learning Styles",
  "Module 3: Emotional Intelligence & Self-Management",
  "Modules 4–5: Managing Time, Space, Finances, and Self",
  "Module 6: Developing Great Habits",
  "Module 7: Skills Development – Decision Making, Communication, Problem Solving",
  "Module 8: Building Healthy Relationships",
  "Module 9: Health and Stress Management",
  "Module 10: Career Development Portfolio",
  "Module 11: My Life Map & Celebrating My Success",
];

const publicSpeakingModules = [
  "Modules 12–24: Foundational Public Speaking Course (C/o ACPS)",
];

const ModuleListItem = ({ text, delay, isCore }: { text: string, delay: number, isCore: boolean }) => (
  <motion.li variants={listItem} className="flex items-start gap-3">
    <CheckCircleIcon 
      className={clsx("w-6 h-6 flex-shrink-0 mt-1", 
        isCore ? "text-orange-600 dark:text-orange-400" : "text-indigo-600 dark:text-indigo-400"
      )} 
    />
    <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
      {text}
    </p>
  </motion.li>
);

// --- Program Modules Section Component ---

export default function ProgramModulesSection() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Program Structure
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2">
            The **24-Module** Transformation
          </h2>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Column 1 & 2: Core Program (11 Modules) */}
          <div className="lg:col-span-2 space-y-10">
            <motion.h3 
              className="text-3xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-3 border-b-2 border-orange-200 pb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <SparklesIcon className="w-8 h-8"/> Core Life Skills & Transition (Modules 1 - 11)
            </motion.h3>
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 list-none p-0"
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {coreModules.map((module, index) => (
                <ModuleListItem 
                  key={index} 
                  text={module} 
                  delay={index * 0.1} 
                  isCore={true}
                />
              ))}
            </motion.ul>
          </div>
          
          {/* Column 3: Optional Extension (Modules 12-24) */}
          <div className="space-y-10 lg:pl-8 lg:border-l lg:border-gray-200 dark:lg:border-gray-700">
            <motion.h3 
              className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3 border-b-2 border-indigo-200 pb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <PresentationChartBarIcon className="w-8 h-8"/> Optional Skills Extension
            </motion.h3>

            <motion.ul
              className="space-y-6 list-none p-0"
              variants={listContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <ModuleListItem 
                text={publicSpeakingModules[0]} 
                delay={0} 
                isCore={false}
              />
            </motion.ul>
            
            <div className="p-6 bg-indigo-50 dark:bg-gray-800 rounded-xl border-l-4 border-indigo-500">
              <p className="text-lg font-bold text-indigo-800 dark:text-indigo-300">
                Focus:
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-400">
                This extension transforms communication ability, building **confidence in public speaking, presentations, and interviews**—key factors for university and career success.
              </p>
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
}