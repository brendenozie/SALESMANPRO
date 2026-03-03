"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Educator } from "@/types/typings";

const loader = ({ src }: { src: string }) => src;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

type Props = {
  educators?: any[]; // Using any for demo flexibility, keep Educator for production
};

export default function EducatorsSection({ educators = [] }: Props) {
  // Demo fallback to ensure the section looks "full" during design
  const data = educators.length > 0 ? educators : [
    { id: '1', name: 'Dominic Vane', specialty: 'Elite Performance', bio: 'Former Olympic conditioning coach specializing in high-threshold metabolic training.', certifications: [1,2,3,4] },
    { id: '2', name: 'Sarah Dracos', specialty: 'Mobility & Flow', bio: 'Expert in functional biomechanics and neurological movement patterns.', certifications: [1,2] },
    { id: '3', name: 'Marcus Thorne', specialty: 'Strength Systems', bio: 'Master of progressive overload and tactical strength periodization.', certifications: [1,2,3] },
  ];

  return (
    <section id="trainers" className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-orange-500 font-black tracking-[0.4em] uppercase text-xs"
            >
              The Faculty
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]"
            >
              Master <br /> <span className="text-white/10">Architects</span>
            </motion.h2>
          </div>
          <p className="max-w-xs text-gray-500 font-medium text-sm leading-relaxed uppercase">
            Learn from the architects of human potential. Our trainers are world-renowned specialists.
          </p>
        </div>

        {/* Educators Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {data.map((edu, index) => (
            <motion.div
              key={edu.id}
              variants={itemVariants}
              className="group relative flex flex-col"
            >
              {/* Image Card */}
              <div className="relative h-[500px] w-full rounded-[2rem] overflow-hidden bg-[#111] mb-8 border border-white/5">
                <Image
                  src={edu.photoUrl || edu.profilePicture || `https://images.unsplash.com/photo-${index === 0 ? '1567013127542-490d757e51fc' : index === 1 ? '1548690312-e3b507d17a4d' : '1534438327276-14e5300c3a48'}?q=80&w=2000&auto=format&fit=crop`}
                  alt={edu.user?.name || edu.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                  loader={loader}
                />
                
                {/* Information Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                {/* Top Badge */}
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                    <StarIcon className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Top Tier</span>
                  </div>
                </div>

                {/* Floating Action (Hover only) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                  <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-orange-500 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>

              {/* Text Content */}
              <div className="px-2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                      {edu.user?.name || edu.name}
                    </h3>
                    <p className="text-orange-500 text-[11px] font-black uppercase tracking-[0.3em]">
                      {edu.specialty}
                    </p>
                  </div>
                  {edu.certifications?.length > 0 && (
                    <div className="flex items-center gap-1 text-white/30">
                      <AcademicCapIcon className="h-5 w-5" />
                      <span className="text-sm font-bold tracking-tighter">x{edu.certifications.length}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2 italic">
                  &ldquo;{edu.bio}&rdquo;
                </p>

                <button className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-[10px] pt-2 group-hover:text-orange-500 transition-colors">
                  Contact Specialist <ArrowRightIcon className="w-4 h-4 text-orange-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Link */}
        <motion.div
          className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.5em]">Join the high performance faculty</p>
          <a
            href="/join-our-team"
            className="group flex items-center gap-6 text-white"
          >
            <span className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">Apply for Residency</span>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-500 transition-all">
              <ArrowRightIcon className="w-5 h-5 group-hover:text-black" />
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}