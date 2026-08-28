"use client";

import React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

// --- SalesmanPro Feature Pillars Data ---
const features = [
  {
    icon: BanknotesIcon,
    title: "Instant M-PESA STK Push",
    description:
      "Automate checkout with direct STK pushes and instant reconciliation. Say goodbye to manual payment verification.",
    badge: "Payments",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: ChatBubbleBottomCenterTextIcon,
    title: "WhatsApp AI Sales Agent",
    description:
      "Turn inquiries into orders 24/7. Your AI agent answers customer questions and sends direct payment links inside chat.",
    badge: "Automation",
    gradient: "from-orange-600 to-amber-500",
  },
  {
    icon: DevicePhoneMobileIcon,
    title: "Fast Counter POS",
    description:
      "Process in-store sales in seconds on any smartphone, tablet, or desktop with instant digital receipts and invoice printing.",
    badge: "Checkout",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: BuildingStorefrontIcon,
    title: "Real-Time Stock Control",
    description:
      "Track inventory across physical counters and online stores simultaneously with automatic low-stock notifications.",
    badge: "Inventory",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: ChartBarIcon,
    title: "Profit & Growth Insights",
    description:
      "Understand your margins, best-selling items, and top staff performers with clear, real-time analytics reports.",
    badge: "Analytics",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: ShieldCheckIcon,
    title: "Multi-Role Staff Access",
    description:
      "Delegate tasks safely. Assign custom permission levels for cashiers, store managers, and accounting staff with full audit trails.",
    badge: "Security",
    gradient: "from-purple-500 to-pink-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function WhyChooseUs() {
  return (
    <section id="features" className="relative py-28 sm:py-36 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-500/10 via-amber-400/5 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Executive Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 dark:bg-orange-400/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 dark:border-orange-400/20">
              <SparklesIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Built For Modern Commerce</span>
            </span>
          </motion.div>

          {/* Clean Solid Headline */}
          <motion.h2
            className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Why smart businesses <br />
            <span className="text-orange-600 dark:text-orange-400">
              run on SalesmanPro.
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Eliminate manual tracking, speed up counter transactions, and automate sales conversions across WhatsApp and online storefronts.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}

// --- Individual Interactive Card Component ---
interface FeatureCardProps {
  feature: (typeof features)[0];
  index: number;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;
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
    rotateX.set(((y - middleY) / middleY) * -3.5);
    rotateY.set(((x - middleX) / middleX) * 3.5);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      variants={cardVariants}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col justify-between p-7 sm:p-8 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-xl h-[380px]"
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

      {/* Top Section: Icon, Badge & Text */}
      <div className="relative z-20 space-y-6">
        {/* Icon & Badge Row */}
        <div className="flex items-center justify-between">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6 stroke-[2]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-400/10 px-3 py-1 rounded-full border border-orange-500/20 dark:border-orange-400/20">
            {feature.badge}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2.5">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            {feature.description}
          </p>
        </div>
      </div>

      {/* Footer Interactive Row */}
      <div className="relative z-20 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        <span>Learn how it works</span>
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
          <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </motion.div>
  );
}