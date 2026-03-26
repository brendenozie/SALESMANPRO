'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  SparklesIcon, 
  HeartIcon, 
  GlobeAmericasIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

const ValueCard = ({ icon: Icon, title, desc, colorClass }: any) => (
  <motion.div 
    variants={itemVariants}
    className="group p-8 rounded-[2rem] bg-white/70 dark:bg-gray-900/50 backdrop-blur-md border border-slate-200/50 dark:border-gray-800 transition-all hover:shadow-2xl hover:-translate-y-2"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h4>
    <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-sm font-medium">{desc}</p>
  </motion.div>
);

export default function AboutDesign() {
  return (
    <section className="relative bg-[#fafaf9] dark:bg-black py-32 overflow-hidden transition-colors duration-300">
      
      {/* Background Cinematic Orbs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200 dark:bg-indigo-900/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-200 dark:bg-rose-900/40 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* --- HERO SECTION: OUR STORY --- */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-gray-800 shadow-sm">
              <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Established 2024</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
              Crafting <span className="italic font-serif font-light text-indigo-600 dark:text-indigo-400">Stories</span> <br /> 
              Behind Every Item.
            </h2>
            
            <div className="space-y-6 text-lg text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
              <p className="border-l-4 border-indigo-500 pl-6">
                Welcome! We started this store with a simple idea: to create a place where you can find unique, high-quality products that bring joy to your everyday life.
              </p>
              <p>
                Every item in our collection is hand-picked with care. We connect you with artisans and brands that share our values of craftsmanship, sustainability, and authenticity.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group"
          >
            <Image 
              src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=80"
              alt="Artisans at work"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <p className="text-sm font-black uppercase tracking-[0.3em] mb-2">The Studio</p>
              <h4 className="text-3xl font-bold">Where Magic Happens</h4>
            </div>
          </motion.div>
        </div>

        {/* --- VALUES SECTION --- */}
        <div className="mb-32">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Built on Core Values</h3>
            <p className="text-slate-500 dark:text-gray-400 font-medium">We prioritize the planet and the people who make our products.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <ValueCard 
              icon={GlobeAmericasIcon}
              title="Conscious"
              desc="We source from brands that prioritize ethical and sustainable practices."
              colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <ValueCard 
              icon={ShieldCheckIcon}
              title="Quality First"
              desc="Durable materials and timeless designs built to last for generations."
              colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            />
            <ValueCard 
              icon={HeartIcon}
              title="Exceptional"
              desc="Your satisfaction is our top priority. We're here for you every step."
              colorClass="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            />
            <ValueCard 
              icon={UserGroupIcon}
              title="Community"
              desc="Grateful for every customer who supports our small business vision."
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
          </motion.div>
        </div>

        {/* --- TEAM SECTION: BENTO STYLE --- */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Meet the <br /> <span className="text-indigo-600 dark:text-indigo-400 italic font-serif">Visionaries</span>.
              </h2>
              <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-sm font-medium">
                Our small but mighty team works tirelessly to bring you the best collections.
              </p>
              <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95">
                Join our Journey <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { name: "Alex Rivera", role: "Founder", img: "https://images.unsplash.com/photo-1507003211169-0a7dd7803e20?fit=crop&w=300&q=80" },
                { name: "Sarah Chen", role: "Curator", img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b80?fit=crop&w=300&q=80" },
              ].map((member, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-6 bg-[#fafaf9] dark:bg-black rounded-3xl border border-slate-100 dark:border-gray-800 text-center"
                >
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden ring-4 ring-indigo-500/20">
                    <Image src={member.img} alt={member.name} fill className="object-cover" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{member.name}</h4>
                  <p className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Decorative Team BG */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <UserGroupIcon className="w-64 h-64 text-slate-900 dark:text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}