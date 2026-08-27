"use client";

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

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const podcasts = [
  { title: 'Social Media Power: Amplifying Your Blog’s Reach', img: '/images/podcast1.jpg' },
  { title: 'SEO Mastery: How to Rank Higher on Google', img: '/images/podcast2.jpg' },
  { title: 'Monetizing Your Blog: Turning Passion into Profit', img: '/images/podcast3.jpg' },
];


export default function LatestPodcastSection() {
  return (
    <section>
    {/* Latest Podcast */}
    <h2 className="text-2xl font-semibold mb-6">Latest Podcast</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {podcasts.map((pc, idx) => (
        <motion.div
          key={idx}
          className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col"
          whileHover={{ scale: 1.02 }}
        >
          <img src={pc.img} alt={pc.title} className="w-full h-40 object-cover" />
          <div className="p-4 flex-1 flex flex-col justify-between">
            <h3 className="font-semibold text-lg mb-4">{pc.title}</h3>
            <button className="mt-auto px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
              Listen Now
            </button>
          </div>
        </motion.div>
      ))}
    </div>
    <div className="mt-6 text-center">
      <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition">
        Browse All Podcasts
      </button>
    </div>
  </section>
  );
}
