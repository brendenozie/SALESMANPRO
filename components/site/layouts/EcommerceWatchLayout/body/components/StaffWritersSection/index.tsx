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

const staffWriters = [
  { name: 'Kristin Watson', role: 'Senior Writer', img: '/images/kristin.jpg' },
  { name: 'Marvin Roy', role: 'Journalist', img: '/images/marvin.jpg' },
  { name: 'Leslie Aria', role: 'Publisher', img: '/images/leslie.jpg' },
  { name: 'Hawkins Alex', role: 'Content Writer', img: '/images/hawkins.jpg' },
];


export default function StaffWritersSection() {
  return (
    <section>      
      {/* Staff Writers */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Staff Writers</h2>
        <a href="#" className="text-red-500 hover:underline">View All &rarr;</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {staffWriters.map((writer, idx) => (
          <motion.div
            key={idx}
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src={writer.img} alt={writer.name} className="mx-auto h-32 w-32 rounded-full object-cover" />
            <h4 className="mt-4 font-medium">{writer.name}</h4>
            <p className="text-gray-500 text-sm">{writer.role}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
