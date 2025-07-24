"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

const icons = {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
} as const;

type IconKey = keyof typeof icons;

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function FeaturesClient() {
  const { storeFormData } = useStoreContext() as {storeFormData : StoreForm};

  const { themeSettings = {}, bannerUrl, tagline } = storeFormData;

  const primary = themeSettings.primaryColor || "#06b6d4";
  const highlight = themeSettings.accentColor || "#f472b6";

  const features: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "CheckIcon", title: "Creative Portfolio", desc: "Showcase of selected works and case studies to highlight my expertise." },
    { icon: "UserGroupIcon", title: "Client Testimonials", desc: "Real feedback from clients I have collaborated with, demonstrating impact." },
    { icon: "AdjustmentsVerticalIcon", title: "Personal Branding", desc: "Tailored strategies to build and elevate your personal brand presence." },
    { icon: "ClockIcon", title: "Consultation", desc: "Schedule a session to discuss projects, career guidance, or collaboration." },
    { icon: "LockClosedIcon", title: "Secure Collaborations", desc: "Confidential and professional engagement on all projects and contracts." },
    { icon: "Cog6ToothIcon", title: "Custom Solutions", desc: "Bespoke services aligned to your unique goals and industry requirements." },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
      {/* Optional Background Image */}
      {bannerUrl && (
        <div className="absolute inset-0 -z-10">
          <Image src={bannerUrl} alt="Background" fill className="object-cover opacity-20" loader={loader} />
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent dark:from-gray-900/80" />
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Expertise & Services
        </motion.h2>
        {tagline && (
          <motion.p
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {tagline}
          </motion.p>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feat, idx) => {
          // const Icon = icons[feat.icon];
          return (
            <motion.div
              key={feat.title}
              className="group bg-white dark:bg-gray-800 border border-transparent hover:border-highlight rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <div
                className="w-12 h-12 mb-4 rounded-full flex items-center justify-center bg-primary text-white group-hover:bg-highlight transition-colors"
                style={{ backgroundColor: primary }}
              >
                {/* <Icon className="w-6 h-6" /> */}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {feat.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feat.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .border-highlight { border-color: ${highlight}; }
        .bg-primary { background-color: ${primary}; }
        .group-hover\\:bg-highlight:hover { background-color: ${highlight}; }
      `}</style>
    </section>
  );
}
