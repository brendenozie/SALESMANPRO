"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  EyeIcon, 
  SparklesIcon, 
  UserIcon, 
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const FALLBACK_GLASSES = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80";

const customLoader = ({ src }: { src: string }) => {
  return src.startsWith("http") ? src : FALLBACK_GLASSES;
};

export default function GlassesAboutPage() {
  const [activeFace, setActiveFace] = useState("Oval");

  const faceShapes = [
    { name: "Oval", rec: "Aviators & Geometric", desc: "The most versatile shape. Balanced proportions allow for almost any frame style.", icon: "loop" },
    { name: "Round", rec: "Rectangular & Square", desc: "Strong angles help add definition and elongate the face silhouette.", icon: "◯" },
    { name: "Square", rec: "Round & Oval", desc: "Softer, curved frames balance out a strong jawline and broad forehead.", icon: "□" },
    { name: "Heart", rec: "Cat-Eye & Wayfarers", desc: "Frames that are wider at the top help balance a narrower chin.", icon: "♡" },
  ];

  return (
    <main className="bg-white text-slate-900 min-h-screen pt-32 pb-24 overflow-hidden">
      
      {/* 1. THE VISIONARY ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-8">
              <EyeIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Crafted in Nairobi</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.85] mb-10 uppercase">
              See the <br />
              <span className="italic font-serif text-blue-500">Unseen.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
              Glasses Duka was founded on a single principle: vision is a right, not a luxury. We combine Italian acetate with Japanese titanium to create frames that feel weightless.
            </p>

            <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-10">
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Lenses</h4>
                  <p className="text-lg font-bold">Ultra-Thin 1.67 Index</p>
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Coating</h4>
                  <p className="text-lg font-bold">7-Layer Anti-Reflex</p>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5 }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[1px] border-slate-100"
            >
              <Image 
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80" 
                alt="High Fashion Frames" fill className="object-cover transition-transform duration-[4s] group-hover:scale-105"
                loader={customLoader}
              />
            </motion.div>
            {/* The "Lens" Floating UI */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* 2. THE FACE SHAPE GUIDE (Interactive Tool) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-950 rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <div className="relative z-10 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-light uppercase tracking-tighter mb-8">Find Your <span className="italic font-serif text-blue-400">Perfect Frame.</span></h2>
              <p className="text-slate-400 mb-12 max-w-md text-lg leading-relaxed">Selecting a frame is an art of geometry. Match your face shape to our curated recommendations.</p>
              
              <div className="flex flex-wrap gap-4">
                {faceShapes.map((face) => (
                  <button 
                    key={face.name}
                    onClick={() => setActiveFace(face.name)}
                    className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeFace === face.name ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20 scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    {face.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[450px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeFace}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] h-full"
                >
                  <div className="text-6xl mb-8 opacity-20">{faceShapes.find(f => f.name === activeFace)?.icon}</div>
                  <h3 className="text-3xl font-light mb-2 uppercase tracking-tight">{activeFace} Shape</h3>
                  <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-6">Recommended: {faceShapes.find(f => f.name === activeFace)?.rec}</div>
                  <p className="text-slate-400 leading-relaxed font-medium mb-10">
                    {faceShapes.find(f => f.name === activeFace)?.desc}
                  </p>
                  
                  <button className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white hover:text-blue-400 transition-colors">
                    Shop {activeFace} Styles <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE OPTICAL STANDARDS */}
      <section className="py-40 max-w-7xl mx-auto px-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <StandardCard 
               Icon={CheckBadgeIcon}
               title="Certified Optics"
               desc="Every lens is verified by our in-house optometrists for axis accuracy and PD alignment."
            />
            <StandardCard 
               Icon={SparklesIcon}
               title="Acetate Mastery"
               desc="We use bio-degradable acetate that is tumbled for 72 hours for a mirror-like finish."
            />
            <StandardCard 
               Icon={MagnifyingGlassIcon}
               title="Precision Fit"
               desc="Complimentary frame adjustments for life at our Nairobi studio for the perfect grip."
            />
         </div>
      </section>
    </main>
  );
}

function StandardCard({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="group">
       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 mb-8 transition-all group-hover:bg-blue-500 group-hover:text-white group-hover:rotate-6">
          <Icon className="w-6 h-6" />
       </div>
       <h4 className="text-xl font-bold mb-4 uppercase tracking-tight">{title}</h4>
       <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}