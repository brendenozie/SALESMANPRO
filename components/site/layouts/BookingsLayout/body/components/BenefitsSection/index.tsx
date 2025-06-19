'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckBadgeIcon,
  LockClosedIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const benefits = [
  {
    title: "Effortless Booking",
    Icon: CheckBadgeIcon,
  },
  {
    title: "Secure Payments",
    Icon: LockClosedIcon,
  },
  {
    title: "Personalized Experience",
    Icon: SparklesIcon,
  },
  {
    title: "Flexible Scheduling",
    Icon: CalendarDaysIcon,
  },
];

export default function BenefitsSection() {
  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden text-white">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/relaxed-woman.jpg"
          loader={loader}
          alt="Relaxed client"
          fill
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/10 flex flex-col lg:flex-row overflow-hidden">
          {/* Text Side */}
          <div className="w-full lg:w-1/2 p-10 lg:p-16 space-y-6">
            <motion.span
              className="inline-block bg-emerald-400/10 text-emerald-300 text-sm font-semibold px-4 py-1.5 rounded-full"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Customer Benefits
            </motion.span>

            <motion.h2
              className="text-3xl sm:text-4xl font-bold leading-snug text-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your Perfect Massage Experience, Just a Click Away
            </motion.h2>

            <motion.p
              className="text-gray-300 max-w-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Book, manage, and enjoy your sessions with ease—secure, personalized, and hassle-free.
            </motion.p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {benefits.map(({ title, Icon }, i) => (
                <motion.li
                  key={title}
                  className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 transition p-3 rounded-xl border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-500 text-white flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white">{title}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Image Side */}
          <div className="w-full lg:w-1/2 h-96 lg:h-auto relative">
            <Image
              src="/images/relaxed-woman.jpg"
              loader={loader}
              alt="Relaxed client"
              fill
              className="object-cover rounded-tr-3xl lg:rounded-tr-none lg:rounded-br-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
