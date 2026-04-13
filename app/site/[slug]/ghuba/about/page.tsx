"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const customLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function GhubaAboutPage() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-20 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      
      {/* --- 1. HERO SECTION: THE VISION --- */}
      <section className="max-w-7xl mx-auto px-6 mb-20 lg:mb-40 relative">
        {/* Dynamic Background Blurs */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-[100px] -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-7"
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
              <SparklesIcon className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">The Future of African Commerce</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
              Elevating the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">Market Experience.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-xl mb-10">
              Ghuba is more than a marketplace. We are a curated ecosystem connecting Kenyan craft, global standards, and seamless technology to bring the world to your doorstep.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6">
              <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2 group">
                Explore Marketplace
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200">
                       <Image src={`https://i.pravatar.cc/150?u=${i+20}`} alt="User" width={40} height={40} loader={customLoader} />
                     </div>
                   ))}
                 </div>
                 <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">Join 50k+ <br /> Active Users</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="lg:col-span-5 relative"
            style={{ scale }}
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl group">
              <Image 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80" 
                alt="Shopping Experience" fill className="object-cover transition-transform duration-700 group-hover:scale-110" loader={customLoader}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                 <p className="text-white text-2xl font-bold italic">"Quality redefined."</p>
              </div>
            </div>
            
            {/* Floating Glass Card */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl shadow-2xl border border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500 rounded-2xl">
                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black">24h</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Express Delivery</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. VALUES: THE BENTO GRID --- */}
      <section className="bg-slate-50 dark:bg-[#0f0f0f] py-24 lg:py-32 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Ghuba Standards</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">We're rebuilding trust in digital commerce through three core pillars.</p>
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-8 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard 
              Icon={ShieldCheckIcon} 
              title="Verified Quality" 
              desc="Every vendor on Ghuba passes a 12-point quality check to ensure you only get the best."
              index={0}
            />
            <ValueCard 
              Icon={GlobeAltIcon} 
              title="Pan-African Reach" 
              desc="Connecting local artisans and brands to a global audience with localized logistics."
              index={1}
            />
            <ValueCard 
              Icon={HeartIcon} 
              title="Customer First" 
              desc="Our 24/7 support and buyer protection program mean you never shop alone."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* --- 3. THE MANIFESTO --- */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h3 className="text-4xl md:text-7xl font-bold tracking-tighter mb-12">
              Empowering dreams, <br /> 
              <span className="text-slate-400">one parcel at a time.</span>
            </h3>
            <div className="flex justify-center items-center gap-8">
              <div className="text-left">
                <p className="text-4xl font-bold">120+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cities Reached</p>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
              <div className="text-left">
                <p className="text-4xl font-bold">1M+</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Items Delivered</p>
              </div>
            </div>
          </motion.div>
          
          {/* Decorative Ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square border border-slate-100 dark:border-slate-900 rounded-full -z-0" />
        </div>
      </section>
    </main>
  );
}

function ValueCard({ Icon, title, desc, index }: { Icon: any, title: string, desc: string, index: number }) {
  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8">
        <Icon className="w-7 h-7 text-indigo-500" />
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{desc}</p>
    </motion.div>
  );
}