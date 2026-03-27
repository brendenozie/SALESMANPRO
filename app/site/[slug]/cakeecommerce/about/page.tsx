"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  BeakerIcon, 
  SparklesIcon, 
  HeartIcon, 
  GlobeAltIcon 
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function CakeFlavorProfilePage() {
  return (
    <main className="bg-[#fffcf9] min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. THE SENSORY HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">The Alchemy of Cake</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.9] mb-8">
              Flavor is our <br />
              <span className="font-sans font-black text-slate-900 not-italic">Obsession.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md italic">
              "We don't just bake; we compose. From the first note of Madagascar vanilla to the lingering finish of Kenyan sea salt."
            </p>
          </motion.div>

          <div className="relative">
            {/* Main Visual: The Texture Shot */}
            <motion.div 
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80" 
                alt="Cake Texture" fill className="object-cover" loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
              />
            </motion.div>
            
            {/* Floating Ingredient Tag */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-amber-50"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Origin Grade</p>
              <p className="text-lg font-serif italic text-slate-900">70% Dark Cacao</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE FLAVOR PILLARS (The "Anatomy" Section) */}
      <section className="bg-white py-32 border-y border-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <Pillar 
              Icon={GlobeAltIcon} 
              title="Global Sourcing" 
              desc="We source our butter from small Kenyan dairies and our chocolate from ethical fair-trade growers." 
            />
            <Pillar 
              Icon={BeakerIcon} 
              title="Precision Science" 
              desc="Every recipe is balanced down to the gram for perfect moisture retention and crumb structure." 
            />
            <Pillar 
              Icon={SparklesIcon} 
              title="Artisanal Finish" 
              desc="No mass-production. Every petal, swirl, and gold leaf flake is applied by hand in our Nairobi studio." 
            />
            <Pillar 
              Icon={HeartIcon} 
              title="Zero Compromise" 
              desc="Real cream, real fruit, real eggs. We never use preservatives or artificial flavor enhancers." 
            />
          </div>
        </div>
      </section>

      {/* 3. THE "TASTING NOTES" (Bento Style) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-serif italic mb-4">Our Signature Profiles</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">The Foundation of our Duka</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FlavorBox 
            title="The Velvet" 
            notes="Cocoa, Buttermilk, Cream Cheese" 
            img="https://images.unsplash.com/photo-1616692341456-d33347467171?auto=format&fit=crop&w=600&q=80"
          />
          <FlavorBox 
            title="The Solstice" 
            notes="Lemon Zest, Lavender, Honey" 
            img="https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=600&q=80"
          />
          <FlavorBox 
            title="The Midnight" 
            notes="Espresso, Salted Caramel, Ganache" 
            img="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
          />
        </div>
      </section>
    </main>
  );
}

function Pillar({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="group">
      <div className="w-12 h-12 rounded-full border border-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function FlavorBox({ title, notes, img }: { title: string, notes: string, img: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="relative h-96 rounded-[2.5rem] overflow-hidden group shadow-sm"
    >
      <Image src={img} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-90" />
      <div className="absolute bottom-0 p-10 text-white">
        <h4 className="text-2xl font-serif italic mb-1">{title}</h4>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">{notes}</p>
      </div>
    </motion.div>
  );
}