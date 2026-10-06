"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { IPromotion, StoreForm } from "@/types/typings";
import { useStoreContext } from "@/contexts/StoreContext";

type FeatureItem = {
  icon: "CalendarDays" | "GlobeAlt" | "ShieldCheck" | "BellAlert";
  title: string;
  description: string;
};

const iconMap: Record<FeatureItem["icon"], React.ReactNode> = {
  CalendarDays: <CalendarDaysIcon className="w-8 h-8 text-purple-400" />,
  GlobeAlt: <GlobeAltIcon className="w-8 h-8 text-pink-400" />,
  ShieldCheck: <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />,
  BellAlert: <BellAlertIcon className="w-8 h-8 text-sky-400" />,
};

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Your original static defaults
const fallbackFeatures: FeatureItem[] = [
  {
    icon: "CalendarDays",
    title: "Easy Event Booking",
    description:
      "Find and reserve your spot at exclusive events in just a few clicks with our intuitive interface.",
  },
  {
    icon: "GlobeAlt",
    title: "Local & Global Listings",
    description:
      "Browse events happening down the street or explore unique happenings around the world.",
  },
  {
    icon: "ShieldCheck",
    title: "Secure Digital Ticketing",
    description:
      "Your tickets are stored securely and are always accessible. Buy, store, and scan with confidence.",
  },
  {
    icon: "BellAlert",
    title: "Real-Time Reminders",
    description:
      "Get timely notifications before your events start so you never miss a moment of the action.",
  },
];

interface FeaturesSectionProps {
  promotions: IPromotion[];
  description?: string | null;
}

export default function WhyChooseUsSection({ promotions, description }: FeaturesSectionProps) {

  
  // Try to pull a dynamic feature list out of themeSettings:
  // (e.g. stored in your DB as [{ icon, title, description }, ...])
  let features: FeatureItem[] = fallbackFeatures;//[];

  const raw = (promotions as any[]) ?? [];
  if (
    Array.isArray(raw) &&
    raw.every(
      (f) =>
        typeof f.icon === "string" &&
        typeof f.title === "string" &&
        typeof f.description === "string"
    )
  ) {
    features = raw as FeatureItem[];
  } else {
    features = fallbackFeatures;
  }

  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-2xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-2xl opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
            Designed for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              You
            </span>
          </h2>
          <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
            {description ||
              "Whether you're an attendee looking for your next adventure or an organizer planning a hit event, our platform is built with powerful, intuitive tools to make it happen."}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className="group relative h-full rounded-2xl p-8 bg-gray-800/40 border border-gray-700/50 transition-all duration-300 hover:border-purple-400/60 hover:-translate-y-2"
            >
              {/* Glow effect */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-md" />

              <div className="relative">
                <div className="inline-block p-4 rounded-xl bg-gray-900/80 border border-gray-700 mb-6">
                  {/* Render the correct icon */}
                  {iconMap[f.icon]}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  {f.title}
                </h3>
                <p className="text-gray-400">{f.description || "Browse events happening down the street or explore unique happenings around the world."}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
