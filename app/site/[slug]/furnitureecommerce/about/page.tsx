"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  HandRaisedIcon, 
  PaintBrushIcon, 
  HomeModernIcon,
  SparklesIcon 
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const customLoader = ({ src }: { src: string }) => src;

export default function FurnitureAboutPage() {
  return (
    <main className="bg-[#fcfaf8] dark:bg-[#0c0c0c] min-h-screen pt-32 pb-24 text-slate-900 dark:text-white">
      
      {/* 1. THE ARCHITECTURAL HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-amber-700 dark:text-amber-500 block mb-4">
                The Atelier Story
              </span>
              <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] mb-6">
                Space is the <br />
                <span className="italic font-serif text-slate-400">Ultimate Luxury.</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-gray-400 leading-relaxed max-w-md font-light">
                We don’t just build furniture; we curate the backdrop of your life’s most meaningful moments. Based in Nairobi, we blend global modernism with local soul.
              </p>
            </motion.div>
          </div>
          
          <div className="lg:w-1/2 relative">
            {/* Main Image */}
            <motion.div 
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] w-full overflow-hidden rounded-sm shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" 
                alt="Minimalist Interior" fill className="object-cover" loader={customLoader}
              />
            </motion.div>
            
            {/* Secondary Floating Image (The Parallax Effect) */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-12 -left-20 w-64 h-80 hidden xl:block shadow-2xl border-[12px] border-white dark:border-gray-900"
            >
              <Image 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80" 
                alt="Craftsmanship detail" fill className="object-cover" loader={customLoader}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE MATERIAL GRID (BENTO BOX) */}
      <section className="bg-white dark:bg-[#111] py-32 px-6 border-y border-slate-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="sticky top-40">
              <h2 className="text-4xl font-light tracking-tight uppercase mb-6">Built to <span className="italic font-serif">Endure.</span></h2>
              <p className="text-slate-500 dark:text-gray-400 max-w-sm font-light leading-relaxed">
                Our materials are selected for their character, durability, and the way they age gracefully over decades.
              </p>
              
              <div className="mt-12 space-y-6">
                <MaterialItem label="Solid Oak" percent="01" />
                <MaterialItem label="Italian Leather" percent="02" />
                <MaterialItem label="Forged Steel" percent="03" />
                <MaterialItem label="Organic Linen" percent="04" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-slate-100">
                   <Image src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=600&q=80" alt="Wood" fill className="object-cover" loader={customLoader} />
                </div>
                <div className="aspect-square relative rounded-xl overflow-hidden bg-slate-100">
                   <Image src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80" alt="Fabric" fill className="object-cover" loader={customLoader} />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square relative rounded-xl overflow-hidden bg-slate-100">
                   <Image src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=600&q=80" alt="Design" fill className="object-cover" loader={customLoader} />
                </div>
                <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-slate-100">
                   <Image src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80" alt="Modern" fill className="object-cover" loader={customLoader} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VALUES: MINIMAL ICONS */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          <ValueIcon Icon={HandRaisedIcon} title="Handcrafted" />
          <ValueIcon Icon={PaintBrushIcon} title="Custom Finishes" />
          <ValueIcon Icon={HomeModernIcon} title="Modern Shapes" />
          <ValueIcon Icon={SparklesIcon} title="Lifetime Care" />
        </div>
      </section>
    </main>
  );
}

function MaterialItem({ label, percent }: { label: string; percent: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4 group cursor-default">
      <span className="text-xl font-light group-hover:italic group-hover:text-amber-700 transition-all">{label}</span>
      <span className="text-[10px] font-bold text-slate-300">{percent}</span>
    </div>
  );
}

function ValueIcon({ Icon, title }: { Icon: any; title: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border border-slate-200 dark:border-gray-800 flex items-center justify-center text-amber-700 dark:text-amber-500">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </div>
  );
}