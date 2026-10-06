'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  SparklesIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon,
  EyeIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Precision Optics',
    desc: 'Every lens is digitally surfaced for 100% clarity and edge-to-edge sharp vision.',
    icon: EyeIcon,
  },
  {
    title: 'UV-400 Protection',
    desc: 'All our frames come standard with premium anti-glare and 100% UVA/UVB coating.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Express Delivery',
    desc: 'Get your prescription glasses delivered within 48 hours across Nairobi.',
    icon: TruckIcon,
  },
  {
    title: 'Perfect Fit Guarantee',
    desc: 'Not feeling the frame? Swap them within 14 days, no questions asked.',
    icon: ArrowPathIcon,
  },
];

const loader = ({ src }: { src: string }) => {
  return src;
}

export default function EyewearFeatureGrid() {
  const primaryGold = '#F3A852';
  const darkTeal = '#004743'; // The sophisticated signature teal

  return (
    <section className="flex flex-col lg:flex-row min-h-[700px] overflow-hidden">
      {/* Left Image Side: High-Fashion Portrait */}
      <div className="w-full lg:w-5/12 relative bg-[#F4F4F4] min-h-[400px] flex items-center justify-center group">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full"
        >
          <Image decoding="async"
            src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury Eyewear Model"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          {/* Subtle Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#004743]/40 to-transparent pointer-events-none" />
        </motion.div>
        
        {/* Floating Tag */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-12 right-12 bg-white p-6 shadow-2xl rounded-2xl hidden md:block"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">New Season</p>
          <p className="text-zinc-900 font-bold italic">Titanium Series 2026</p>
        </motion.div>
      </div>

      {/* Right Content Side: The "Service" Grid */}
      <div className="w-full lg:w-7/12 p-8 md:p-24 flex flex-col justify-center" style={{ backgroundColor: darkTeal }}>
        <div className="text-left mb-16">
          <h4 className="text-[#F3A852] text-xs font-black uppercase tracking-[0.3em] mb-4">Why Choose Us</h4>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
            Optical Excellence <br /> <span className="text-white/30 italic">Redefined.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-[#F3A852] group-hover:border-[#F3A852] transition-all duration-500">
                <f.icon className="w-6 h-6 text-[#F3A852] group-hover:text-[#004743] transition-colors" />
              </div>
              <h3 className="text-white font-bold text-xl tracking-tight">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 flex flex-col sm:flex-row items-center gap-8">
          <button 
            onClick={() => window.location.href = '/glassesecommerce/products'} 
            className="w-full sm:w-auto px-10 py-5 bg-[#F3A852] text-[#004743] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
          >
            Explore Collection
          </button>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#004743] bg-zinc-800 overflow-hidden">
                   <Image decoding="async" src={`https://i.pravatar.cc/100?u=${i}`} alt="User" width={32} height={32} />
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">5k+ Happy Eyes</p>
          </div>
        </div>
      </div>
    </section>
  );
}