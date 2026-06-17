"use client";

import { GlobeAltIcon, UsersIcon } from "@heroicons/react/24/outline";
import { motion, useMotionValue, useTransform, animate, MotionValue } from "framer-motion";
import { useEffect } from "react";
import body from "@/assets/body.png";
import { useSession } from "next-auth/react";

// Helper Component for the animated number counter
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      delay: 0.5,
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
  className?: string;
  isTime?: boolean;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

// Sub-component for the floating statistic cards
function StatCard({ icon, value, label, className, isTime = false, mouseX, mouseY }: StatCardProps) {
  // Softer parallax translation factor for the floating elements
  const translateX = useTransform(mouseX, [-200, 200], [-15, 15]);
  const translateY = useTransform(mouseY, [-200, 200], [-15, 15]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "circOut" }}
      viewport={{ once: true }}
      style={{ x: translateX, y: translateY }}
      className={`flex items-center gap-4 bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-4 w-52 shadow-lg z-10 ${className}`}
    >
      <div className="w-8 h-8 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={value} />
          {isTime ? "/7" : "+"}
        </h4>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AboutUs() {
  const { data: session } = useSession();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [10, -10], { clamp: true });
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10], { clamp: true });

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
        staggerChildren: 0.15,
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
    <section id="about-us" className="relative w-full py-24 px-6 md:px-12 bg-white text-gray-800 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-200/30 rounded-full filter blur-3xl opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content - Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-1 lg:order-2"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-yellow-500"
          >
            From Idea to Empire.
            <br />
            We Handle the Tech.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
            At <span className="font-semibold text-gray-900">SalesmanPro</span>, we turn entrepreneurial dreams into digital realities.
            Our platform provides everything you need to{" "}
            <span className="text-red-600 font-medium">
              launch, manage, and scale your online business
            </span>
            , effortlessly.
          </motion.p>
          
          <motion.p variants={itemVariants} className="text-gray-600 leading-relaxed">
            Focus on your craft, connect with your customers, and build your brand. We'll take care of the complex stuff behind the scenes.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            {!session ? (
              <motion.button 
                onClick={handleGoogleSignIn}
                whileHover={{ scale: 1.03, boxShadow: "0px 10px 25px -5px rgba(220, 38, 38, 0.3)" }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-red-600 text-white font-semibold px-8 py-3 transition-shadow duration-300"
              >
                Start Your Journey
              </motion.button>
            ) : (
              <motion.button 
                onClick={() => { window.location.href = "/dashboards"; }}
                whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-gray-300 text-gray-800 font-semibold px-8 py-3 transition-colors duration-300"
              >
                Go to Dashboard
              </motion.button>
            )}
            <motion.button 
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
              whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-gray-300 text-gray-800 font-semibold px-8 py-3 transition-colors duration-300"
            >
              Explore Features
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Content - Visuals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
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
            {/* Glowing Border Container */}
            <div className="relative w-full p-[3px] rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 shadow-2xl shadow-indigo-500/10">
              <div className="w-full h-full bg-white rounded-[13px] overflow-hidden">
                <img
                  src={body.src || "https://placehold.co/500x500/E2E8F0/475569?text=Your+Image"}
                  alt="A successful entrepreneur using SalesmanPro"
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>
            </div>

            {/* Floating Stat Cards */}
            <StatCard
              icon={<UsersIcon />}
              value={10000}
              label="🎉 Businesses Empowered"
              className="absolute -bottom-6 -left-6 md:-left-10"
              mouseX={mouseX}
              mouseY={mouseY}
            />
            <StatCard
              icon={<GlobeAltIcon />}
              value={24}
              label="🚀 Global Support"
              className="absolute -top-6 -right-6 md:-right-10"
              isTime
              mouseX={mouseX}
              mouseY={mouseY}
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}