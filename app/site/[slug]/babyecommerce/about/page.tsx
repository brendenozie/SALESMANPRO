"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  HeartIcon, 
  SunIcon, 
  ShieldCheckIcon, 
  HandRaisedIcon 
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const customLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function BabyAboutPage() {
  return (
    <main className="bg-[#fffdfb] min-h-screen pt-32 pb-24 text-slate-800 overflow-hidden">
      
      {/* 1. THE "DREAMY" HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative">
        {/* Floating Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/50 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/50 rounded-full blur-[100px] -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-500 mb-6">
              <HeartIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Made with Love</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-slate-900">
              Big Joys for <br />
              <span className="text-rose-400 italic">Little People.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md mb-8">
              Baby Duka was born in Nairobi from a simple realization: every milestone, from the first wiggle to the first step, deserves the gentlest touch.
            </p>

            <div className="flex items-center gap-6">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-100">
                     <Image src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Parent" width={48} height={48} loader={customLoader} />
                   </div>
                 ))}
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Trusted by 5,000+ <br /> Kenyan Parents</p>
            </div>
          </motion.div>

          <div className="relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2 }}
              className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white"
            >
              <Image 
                src="https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80" 
                alt="Happy Baby" fill className="object-cover" loader={customLoader}
              />
            </motion.div>
            
            {/* Floating "Cloud" Stat */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[3rem] shadow-xl text-center"
            >
              <p className="text-4xl font-black text-blue-400">100%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cotton Soft</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. OUR PROMISE: THE ROUNDED BENTO */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4">The Baby Duka Promise</h2>
            <div className="w-16 h-1.5 bg-rose-200 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PromiseCard 
              Icon={ShieldCheckIcon} 
              title="Safety Certified" 
              desc="Every toy and garment undergoes rigorous safety testing. If it’s not safe for our kids, it’s not for yours."
              color="bg-blue-50 text-blue-500"
            />
            <PromiseCard 
              Icon={SunIcon} 
              title="Organic Growth" 
              desc="We prioritize organic fibers and eco-friendly dyes to keep baby's skin healthy and the planet happy."
              color="bg-amber-50 text-amber-500"
            />
            <PromiseCard 
              Icon={HandRaisedIcon} 
              title="Nurturing Care" 
              desc="Our team is made of parents. We provide advice and products that we use in our own nurseries."
              color="bg-rose-50 text-rose-500"
            />
          </div>
        </div>
      </section>

      {/* 3. THE "NURSERY" MANIFESTO */}
      <section className="max-w-5xl mx-auto px-6 py-32 text-center relative">
        <div className="relative z-10">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-serif italic text-slate-800 leading-snug"
          >
            "In the end, it’s the small things that leave the biggest footprints on our hearts."
          </motion.h3>
          <div className="mt-12 flex justify-center gap-4">
             <div className="w-3 h-3 rounded-full bg-rose-200" />
             <div className="w-3 h-3 rounded-full bg-blue-200" />
             <div className="w-3 h-3 rounded-full bg-amber-200" />
          </div>
        </div>
        
        {/* Playful background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[40px] border-slate-50 rounded-full -z-0" />
      </section>
    </main>
  );
}

function PromiseCard({ Icon, title, desc, color }: { Icon: any, title: string, desc: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="p-10 rounded-[4rem] bg-[#fffdfb] border-2 border-slate-50 flex flex-col items-center text-center group transition-all hover:shadow-xl"
    >
      <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center mb-8 shadow-inner`}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}