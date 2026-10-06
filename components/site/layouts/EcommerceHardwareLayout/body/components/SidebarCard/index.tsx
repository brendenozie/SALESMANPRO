'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

function SidebarCard({ title, subtitle, img, color }: any) {
  // Mouse tracking for subtle 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        backgroundColor: color 
      }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group min-w-[300px] lg:min-w-full flex-1 relative rounded-[3rem] p-10 overflow-hidden snap-center cursor-pointer border border-white/20 dark:border-zinc-800/50 shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none"
    >
      {/* --- AMBIENT BACKGROUND GLOW --- */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-white/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-20 h-full flex flex-col justify-between" style={{ transform: "translateZ(50px)" }}>
        <div className="space-y-2">
          <motion.p 
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-zinc-500 transition-colors"
          >
            {subtitle}
          </motion.p>
          <h3 className="text-2xl font-serif italic text-zinc-900 dark:text-white leading-tight tracking-tighter">
            {title}
          </h3>
        </div>

        {/* --- DISCOVER ACTION --- */}
        <div className="mt-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 shadow-lg group-hover:scale-110 transition-transform">
            <ArrowRightIcon className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 dark:text-white">
            Discover
          </span>
        </div>
      </div>

      {/* --- THE STAR PRODUCT (IMAGE) --- */}
      <motion.div 
        style={{ transform: "translateZ(100px)" }}
        className="absolute -right-6 -bottom-6 w-48 h-48 lg:w-56 lg:h-56 drop-shadow-[0_40px_40px_rgba(0,0,0,0.2)] group-hover:drop-shadow-[0_60px_60px_rgba(0,0,0,0.3)] transition-all duration-700"
      >
        <Image decoding="async" 
          src={img} 
          alt={title} 
          fill 
          className="object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" 
        />
      </motion.div>

      {/* --- FROSTED OVERLAY FOR DARK MODE --- */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-zinc-900/10 pointer-events-none" />
    </motion.div>
  );
}

export default SidebarCard;