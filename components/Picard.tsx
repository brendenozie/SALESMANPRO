"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  CommandLineIcon,
  PresentationChartLineIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  SquaresPlusIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

interface CardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  gradientClass: string;
}

export default function Picard({ title, desc, icon, gradientClass }: CardProps) {
  // Setup dynamic micro-tracking coordinate vectors for localized spotlight shine overlays
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative flex flex-col w-[320px] h-[360px] p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-950/[0.02] dark:shadow-none cursor-pointer overflow-hidden transform-gpu"
    >
      {/* Local Spotlight Glow Ring Matrix Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              240px circle at ${mouseX}px ${mouseY}px,
              rgba(244, 63, 94, 0.07),
              transparent 80%
            )
          `,
        }}
      />

      {/* Decorative Core Icon Container */}
      <div className="mb-6 relative">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-lg shadow-slate-900/5 dark:shadow-none p-3.5 group-hover:scale-110 transition-transform duration-300 transform-gpu`}>
          {icon}
        </div>
        {/* Blurred backing shadow under icon block */}
        <div className={`absolute inset-0 scale-90 blur-xl opacity-40 -z-10 bg-gradient-to-br ${gradientClass} group-hover:scale-110 transition-transform duration-300`} />
      </div>

      {/* Data Compartment Segment */}
      <div className="flex flex-col gap-2.5 flex-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {desc}
        </p>
      </div>

      {/* Subtle Micro-Interaction Footer Element */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          Explore Module
        </span>
        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientClass} scale-70 opacity-40 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300`} />
      </div>
    </motion.div>
  );
}

// Upgraded production datasets matching proper explicit dynamic SVG vectors
export const picardData = [
  {
    id: 1,
    title: "Intelligent Lead Capture",
    desc: "Never miss a potential sale. Our system automatically captures, organizes, and scores your leads, so you always know who to prioritize.",
    gradientClass: "from-pink-600 via-rose-500 to-orange-400",
    icon: <CommandLineIcon className="w-full h-full stroke-[1.75]" />,
  },
  {
    id: 2,
    title: "Visual Sales Pipeline",
    desc: "Get a crystal-clear overview of your deals. Drag and drop leads between stages, identify bottlenecks, and forecast revenue with confidence.",
    gradientClass: "from-blue-600 via-indigo-500 to-purple-500",
    icon: <PresentationChartLineIcon className="w-full h-full stroke-[1.75]" />,
  },
  {
    id: 3,
    title: "Smart Outreach Automation",
    desc: "Save time and never let a lead go cold. Our platform sends personalized follow-up emails and messages for you, keeping every conversation active.",
    gradientClass: "from-emerald-600 via-teal-500 to-cyan-500",
    icon: <PaperAirplaneIcon className="w-full h-full stroke-[1.75]" />,
  },
  {
    id: 4,
    title: "Real-Time Analytics",
    desc: "Track your team’s performance with beautiful dashboards and actionable insights. Understand what's working and drive continuous improvement.",
    gradientClass: "from-amber-500 via-orange-500 to-red-500",
    icon: <ChartBarIcon className="w-full h-full stroke-[1.75]" />,
  },
  {
    id: 5,
    title: "Seamless Integrations",
    desc: "Connect your favorite apps like Slack, Salesforce, and HubSpot. Our platform works with your existing tools to create a single source of truth.",
    gradientClass: "from-violet-600 via-purple-500 to-fuchsia-500",
    icon: <SquaresPlusIcon className="w-full h-full stroke-[1.75]" />,
  },
  {
    id: 6,
    title: "Mobile-First Sales",
    desc: "Manage your deals, update contacts, and log activities from anywhere. Our mobile app keeps your entire team connected and productive on the go.",
    gradientClass: "from-fuchsia-600 via-pink-500 to-rose-400",
    icon: <DevicePhoneMobileIcon className="w-full h-full stroke-[1.75]" />,
  },
];