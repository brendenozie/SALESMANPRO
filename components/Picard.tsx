"use client";

import React, { ElementType } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import {
  BuildingStorefrontIcon,
  AcademicCapIcon,
  HomeModernIcon,
  TicketIcon,
  GlobeAmericasIcon,
  HeartIcon,
  TruckIcon,
  FilmIcon,
  SparklesIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

export interface PicardCardData {
  id: string;
  title: string;
  desc: string;
  badge: string;
  categoryKey: string;
  icon: ElementType;
  gradientClass: string;
  features: string[];
}

export const picardData: PicardCardData[] = [
  {
    id: "retail",
    title: "Retail & Multi-Counter POS",
    desc: "Multi-branch counter checkout, barcode scanner integration, thermal receipts, low-stock warnings, and automated M-PESA STK pushes.",
    badge: "Commerce & Retail",
    categoryKey: "retail",
    icon: BuildingStorefrontIcon,
    gradientClass: "from-orange-500 to-amber-500",
    features: ["Multi-Counter POS", "Thermal Receipt Printing", "Live Stock Sync", "Instant STK Push"],
  },
  {
    id: "schools",
    title: "Schools & Education",
    desc: "Complete academic management: student admissions, grade books, report cards, fee invoice collection, school bus routes, and digital library loans.",
    badge: "Education",
    categoryKey: "school",
    icon: AcademicCapIcon,
    gradientClass: "from-blue-600 to-indigo-600",
    features: ["Fee Collection Invoices", "Exam Report Cards", "Transport Route Dispatch", "Library Catalog"],
  },
  {
    id: "realestate",
    title: "Real Estate & Property",
    desc: "Manage properties, showings, buyer inquiries, sales agent commission splits, tenant lease contracts, room assignments, and maintenance logs.",
    badge: "Real Estate",
    categoryKey: "realestate",
    icon: HomeModernIcon,
    gradientClass: "from-amber-600 to-yellow-500",
    features: ["Property Listings", "Tenant Lease Tracking", "Agent Commissions", "Showing Inquiries"],
  },
  {
    id: "events",
    title: "Events & Ticketing",
    desc: "Sell VIP and regular tickets online, issue digital passes, check in attendees with instant QR code scanning, and monitor real-time gate sales.",
    badge: "Ticketing & Events",
    categoryKey: "events",
    icon: TicketIcon,
    gradientClass: "from-purple-600 to-pink-600",
    features: ["Tiered Ticket Sales", "QR Code Gate Check-In", "Attendee Manifest", "Instant STK Checkout"],
  },
  {
    id: "travel",
    title: "Travel & Tour Operators",
    desc: "Showcase tour packages, manage destination booking calendars, assign travel guides, handle customer inquiries, and accept online deposits.",
    badge: "Travel & Safaris",
    categoryKey: "travel",
    icon: GlobeAmericasIcon,
    gradientClass: "from-emerald-500 to-teal-600",
    features: ["Tour Package Builder", "Departure Calendars", "Travel Expert Booking", "Online Reservations"],
  },
  {
    id: "fitness",
    title: "Fitness & Wellness",
    desc: "Run gym memberships, manage personal trainer appointments, publish class schedules, monitor attendance, and sell gear via counter POS.",
    badge: "Fitness & Gyms",
    categoryKey: "fitness",
    icon: HeartIcon,
    gradientClass: "from-rose-500 to-orange-500",
    features: ["Membership Subscriptions", "Class Schedules", "Trainer Bookings", "Counter POS"],
  },
  {
    id: "logistics",
    title: "Logistics & Fleet Dispatch",
    desc: "Track shipments, assign drivers to vehicles, log fuel expenditures, schedule delivery routes, and generate client dispatch manifests.",
    badge: "Delivery & Fleet",
    categoryKey: "delivery",
    icon: TruckIcon,
    gradientClass: "from-cyan-600 to-blue-600",
    features: ["Shipment Manifests", "Driver Route Dispatch", "Vehicle Fuel Logs", "Real-Time Tracking"],
  },
  {
    id: "media",
    title: "Media & Content Publishing",
    desc: "Publish videos, articles, and podcast episodes. Offer subscriber-only content, manage featured sponsors, and monetize your digital audience.",
    badge: "Media & Studios",
    categoryKey: "media",
    icon: FilmIcon,
    gradientClass: "from-violet-600 to-purple-600",
    features: ["Video & Audio Library", "Subscriber Paywall", "Editorial Articles", "Sponsor Ad Slots"],
  },
];

interface PicardProps {
  title: string;
  desc: string;
  badge: string;
  icon: ElementType;
  gradientClass: string;
  features?: string[];
  index?: number;
}

export default function Picard({
  title,
  desc,
  badge,
  icon: Icon,
  gradientClass,
  features = [],
  index = 0,
}: PicardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth tilt transformations
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    mouseX.set(x);
    mouseY.set(y);

    // Calculate subtle 3D tilt
    const middleX = width / 2;
    const middleY = height / 2;
    rotateX.set(((y - middleY) / middleY) * -4);
    rotateY.set(((x - middleX) / middleX) * 4);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-[320px] sm:w-[360px] h-[440px] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl"
    >
      {/* Dynamic Cursor Light Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              rgba(234, 88, 12, 0.08),
              transparent 80%
            )
          `,
        }}
      />

      {/* Top Header Section */}
      <div className="relative z-20 space-y-6">
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 stroke-[2]" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-400/10 px-3 py-1 rounded-full border border-orange-500/20 dark:border-orange-400/20">
            {badge}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {desc}
          </p>
        </div>

        {/* Feature Chips */}
        {features.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {features.map((feat, i) => (
              <span key={i} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 truncate">
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Interactive Bar */}
      <div className="relative z-20 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        <span>Explore feature</span>
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
          <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </motion.div>
  );
}