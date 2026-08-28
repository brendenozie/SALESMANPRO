"use client";

import React, { ElementType } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import {
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon,
  ChatBubbleBottomCenterTextIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

export interface PicardCardData {
  id: string;
  title: string;
  desc: string;
  badge: string;
  icon: ElementType;
  gradientClass: string;
}

export const picardData: PicardCardData[] = [
  {
    id: "inventory",
    title: "Real-Time Inventory",
    desc: "Sync physical stock across all retail outlets and online storefronts automatically with instant low-stock alerts.",
    badge: "Operations",
    icon: BuildingStorefrontIcon,
    gradientClass: "from-orange-500 to-amber-500",
  },
  {
    id: "pos",
    title: "Omnichannel POS",
    desc: "Process fast counter sales, print thermal receipts, and issue instant digital invoices directly from any mobile device.",
    badge: "Checkout",
    icon: DevicePhoneMobileIcon,
    gradientClass: "from-amber-500 to-yellow-500",
  },
  {
    id: "mpesa",
    title: "Automated M-PESA Push",
    desc: "Eliminate manual payment checking with automated STK pushes and instant ledger reconciliation.",
    badge: "Payments",
    icon: BanknotesIcon,
    gradientClass: "from-emerald-500 to-teal-500",
  },
  {
    id: "whatsapp-ai",
    title: "WhatsApp AI Sales Agent",
    desc: "Engage customers 24/7 on WhatsApp. Convert customer inquiries into paid orders directly inside the chat window.",
    badge: "AI Automation",
    icon: ChatBubbleBottomCenterTextIcon,
    gradientClass: "from-orange-600 to-red-500",
  },
  {
    id: "analytics",
    title: "Profit Intelligence",
    desc: "Track real-time gross margins, top-performing items, and projected revenue growth with clear visual reports.",
    badge: "Analytics",
    icon: ChartBarIcon,
    gradientClass: "from-blue-500 to-indigo-500",
  },
  {
    id: "security",
    title: "Multi-Role Staff Access",
    desc: "Granular access control for cashiers, store managers, and accountants with complete, unalterable audit logs.",
    badge: "Security",
    icon: ShieldCheckIcon,
    gradientClass: "from-purple-500 to-pink-500",
  },
];

interface PicardProps {
  title: string;
  desc: string;
  badge: string;
  icon: ElementType;
  gradientClass: string;
  index?: number;
}

export default function Picard({
  title,
  desc,
  badge,
  icon: Icon,
  gradientClass,
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
      className="group relative w-[320px] sm:w-[360px] h-[400px] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-xl"
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

        <div className="space-y-2.5">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {desc}
          </p>
        </div>
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