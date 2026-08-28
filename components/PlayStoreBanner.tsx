"use client";

import React from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import { 
  DevicePhoneMobileIcon, 
  BoltIcon, 
  SignalIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon
} from "@heroicons/react/24/solid";

interface PlayStoreBannerProps {
  imageSrc?: string | StaticImageData;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

export default function PlayStoreBanner({
  imageSrc,
  playStoreUrl = "https://play.google.com/store/apps/details?id=co.ke.salesmanpro.salesmanapp",
  appStoreUrl = "#",
}: PlayStoreBannerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto rounded-3xl bg-slate-900 text-white overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Background Radial Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
          <div className="absolute w-[550px] h-[550px] bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400 rounded-full blur-[140px] -top-24 -left-24" />
          <div className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-amber-600 to-orange-500 rounded-full blur-[130px] -bottom-24 -right-24" />
        </div>

        {/* Decorative Top Gradient Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 z-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-12 lg:gap-16">
          
          {/* Left Side: Interactive Phone Mockup */}
          <motion.div
            className="w-full lg:w-1/2 flex items-center justify-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-[320px] sm:max-w-[380px]">
              
              {/* Floating Status Badges */}
              <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 z-30 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold">
                <BoltIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Instant M-PESA POS</span>
              </div>

              <div className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 z-30 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold">
                <SignalIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Offline Sync Ready</span>
              </div>

              {/* Phone Frame */}
              <div className="relative rounded-[44px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600/60 shadow-2xl">
                
                {/* Speaker Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 border border-slate-800" />

                <div className="relative rounded-[34px] overflow-hidden bg-slate-950 aspect-[9/18] flex flex-col items-center justify-center text-center p-6 border border-slate-800/80">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt="SalesmanPro Mobile POS App"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  ) : (
                    /* UI Representation Fallback */
                    <div className="space-y-5 w-full pt-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <DevicePhoneMobileIcon className="w-8 h-8 text-slate-950" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <h4 className="text-lg font-black tracking-wide text-white">SalesmanPro POS</h4>
                        <p className="text-xs text-slate-400 font-medium">Counter Checkout & Live Inventory</p>
                      </div>

                      {/* Skeleton UI Interface Elements */}
                      <div className="pt-4 space-y-3">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
                          <div>
                            <div className="h-2 w-16 bg-slate-700 rounded-full mb-1" />
                            <div className="h-2.5 w-24 bg-slate-600 rounded-full" />
                          </div>
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-left">
                          <div>
                            <div className="h-2 w-20 bg-slate-700 rounded-full mb-1" />
                            <div className="h-2.5 w-16 bg-slate-600 rounded-full" />
                          </div>
                          <span className="text-[10px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-md">M-PESA</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="h-9 w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-slate-950 text-xs font-black">
                          New Sale +
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Side: Copy & App Download Actions */}
          <motion.div
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {/* Tag Badge */}
            <motion.span 
              variants={itemVariants}
              className="text-xs font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-4 py-1.5 rounded-full border border-orange-800/60 inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              Download SalesmanPro App
            </motion.span>

            {/* Main Title */}
            <motion.h2
              className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
              variants={itemVariants}
            >
              Run Your Sales & Counter <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                Directly From Your Phone
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium"
              variants={itemVariants}
            >
              Collect M-PESA payments instantly, track remaining stock, and issue receipts right from your counter or field operations. Turn any Android smartphone into an enterprise POS terminal.
            </motion.p>

            {/* Download Badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              variants={itemVariants}
            >
              {/* Google Play Store CTA */}
              <Link
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-extrabold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L18.81,13.97C19.46,13.59 19.46,12.41 18.81,12.03L16.81,10.88L14.81,12.88L16.81,15.12M4.6,1.47L15.39,7.7L13,10.09L4.6,1.47M4.6,22.53L13,13.91L15.39,16.3L4.6,22.53Z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">Get it on</div>
                  <div className="text-base font-black font-sans mt-0.5">Google Play</div>
                </div>
              </Link>

              {/* Apple App Store CTA */}
              <Link
                href={appStoreUrl}
                className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.09,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Coming soon to</div>
                  <div className="text-base font-black font-sans mt-0.5">App Store</div>
                </div>
              </Link>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}