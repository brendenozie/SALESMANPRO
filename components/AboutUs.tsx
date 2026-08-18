"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  BuildingStorefrontIcon, 
  ShoppingBagIcon, 
  BanknotesIcon, 
  TruckIcon, 
  SparklesIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { motion, useMotionValue, useTransform, animate, MotionValue } from "framer-motion";
import body from "@/assets/body.png";

// Helper Component for animated counters
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      delay: 0.3,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

// Sub-component for floating statistic / proof cards
function StatCard({ icon, value, label, prefix = "", suffix = "+", className = "", mouseX, mouseY }: StatCardProps) {
  const translateX = useTransform(mouseX, [-200, 200], [-12, 12]);
  const translateY = useTransform(mouseY, [-200, 200], [-12, 12]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "circOut" }}
      viewport={{ once: true }}
      style={{ x: translateX, y: translateY }}
      className={`flex items-center gap-3.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 w-60 shadow-xl shadow-slate-900/5 z-20 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {prefix}
          <AnimatedCounter value={value} />
          {suffix}
        </h4>
        <p className="text-xs text-slate-500 font-medium leading-snug">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AboutUs() {
  const { data: session } = useSession();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [6, -6], { clamp: true });
  const rotateY = useTransform(mouseX, [-400, 400], [-6, 6], { clamp: true });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  return (
    <section id="about-us" className="relative w-full py-24 px-6 md:px-12 bg-white text-slate-800 overflow-hidden border-t border-slate-100">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/60 rounded-full filter blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[450px] h-[450px] bg-amber-100/50 rounded-full filter blur-3xl pointer-events-none -z-10" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Visual Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: "1200px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex justify-center items-center order-2 lg:order-1"
        >
          <motion.div
            className="relative w-full max-w-md lg:max-w-lg"
            style={{ rotateX, rotateY }}
          >
            {/* Gradient Frame */}
            <div className="relative w-full p-[3px] rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 shadow-2xl shadow-orange-950/10">
              <div className="w-full h-full bg-slate-900 rounded-[21px] overflow-hidden relative group">
                <Image
                  src={body}
                  alt="Merchant using SalesmanPro E-Commerce OS"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover aspect-square opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                  loader={({ src }) => src}
                />
                
                {/* Store Status Overlay Tag */}
                <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Store Engine Active 24/7
                </div>
              </div>
            </div>

            {/* Floating Stat Cards */}
            <StatCard
              icon={<BuildingStorefrontIcon className="w-6 h-6" />}
              value={10000}
              suffix="+"
              label="Active Independent Merchants"
              className="absolute -bottom-6 -left-4 md:-left-8"
              mouseX={mouseX}
              mouseY={mouseY}
            />
            
            <StatCard
              icon={<BanknotesIcon className="w-6 h-6 text-emerald-600" />}
              value={100}
              suffix="%"
              label="Automated M-PESA Verification"
              className="absolute -top-6 -right-4 md:-right-8"
              mouseX={mouseX}
              mouseY={mouseY}
            />
          </motion.div>
        </motion.div>

        {/* Right Content Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-1 lg:order-2 text-left"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100/80 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <SparklesIcon className="w-4 h-4 text-orange-600" />
            Built for Modern Commerce
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]"
          >
            Your Complete Online Store. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              Zero Manual Back & Forth.
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-600 leading-relaxed">
            At <span className="font-bold text-slate-900">SalesmanPro</span>, we replace tedious DM conversations with a full self-service e-commerce operating system. Give your customers a seamless web catalog where they browse, check out with M-PESA STK Push, and select nationwide delivery options—all on autopilot.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-3.5 pt-2">
            {[
              "Custom store domain with instant setup & zero coding",
              "Direct M-PESA Paybill, Till & STK Push auto-reconciliation",
              "Integrate and manage your courier routes at checkout"
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckBadgeIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 font-medium text-sm md:text-base">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Action CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            {!session ? (
              <button 
                onClick={handleGoogleSignIn}
                className="rounded-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-8 py-3.5 shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
              >
                Launch Store Free
              </button>
            ) : (
              <Link
                href="/dashboards"
                className="rounded-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-8 py-3.5 shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
              >
                Go to Merchant Dashboard
              </Link>
            )}
            
            <button 
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-8 py-3.5 hover:bg-slate-50 transition-all duration-200 text-center"
            >
              Explore Features
            </button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}