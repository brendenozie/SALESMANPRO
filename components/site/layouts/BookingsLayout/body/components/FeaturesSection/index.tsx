'use client';

import React from "react";
import Image from "next/image";
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const features = [
  {
    Icon: CheckIcon,
    title: "Effortless Booking",
    description: "Book your massage in seconds—anywhere, anytime.",
  },
  {
    Icon: UserGroupIcon,
    title: "Choose Your Therapist",
    description: "Select from top-rated, vetted professionals.",
  },
  {
    Icon: LockClosedIcon,
    title: "Secure Payments",
    description: "Protected transactions via trusted gateways.",
  },
  {
    Icon: AdjustmentsVerticalIcon,
    title: "Custom Options",
    description: "Tailor services to your exact needs.",
  },
  {
    Icon: ClockIcon,
    title: "Real-Time Scheduling",
    description: "View and manage bookings on your time.",
  },
  {
    Icon: Cog6ToothIcon,
    title: "Vetted Experts",
    description: "Skilled, licensed, and passionate therapists.",
  },
];

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function FeaturesSection() {
  return (
    <section className="relative bg-gray-950 py-24 px-6 sm:px-12 text-white overflow-hidden">
      {/* Background blur and glow */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/spa-massage.jpg"
          alt="Spa background"
          fill
          loader={loader}
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90" />
      </div>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          className="inline-block text-sm font-semibold bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          What You’ll Love
        </motion.span>

        <motion.h2
          className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Modern Massage Booking, Redefined
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover a seamless way to book massages with confidence. From therapist selection to secure payments, every detail is designed for comfort and clarity.
        </motion.p>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map(({ Icon, title, description }, i) => (
          <motion.div
            key={title}
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl transition group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 text-white flex items-center justify-center shadow-md mb-4">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition">
              {title}
            </h3>
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
