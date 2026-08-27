"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  MapIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/solid";
import { Expert } from "@/types/typings";

// --- Types ---
// interface Expert {
//   id: string;
//   name: string;
//   specialty: string;
//   image: string;
//   bio: string;
//   experienceYears: number;
//   tripsPlanned: number;
//   email: string;
//   topDestinations: string[];
// }

// --- Sample Data ---
const sampleAgents: Expert[] = [
  {
    id: "agent1",
    userId: "u1",
    user: { id: "u1", name: "Sophia Chen", email: "sophia.c@example.com" } as any,
    companyId: "c1",
    specialty: "Adventure Travel",
    experienceYears: 8,
    travelsCompleted: 120,
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format",
    bio: "Expert in thrilling expeditions and off-the-beaten-path destinations.",
    contactEmail: "sophia.c@example.com",
    contactPhone: undefined,
    status: "ACTIVE" as any,
    expertise: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "agent2",
    userId: "u2",
    user: { id: "u2", name: "David Miller", email: "david.m@example.com" } as any,
    companyId: "c2",
    specialty: "Luxury & Relaxation",
    experienceYears: 12,
    travelsCompleted: 95,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=600&auto=format",
    bio: "Crafting bespoke, high-end travel experiences for discerning clients.",
    contactEmail: "david.m@example.com",
    contactPhone: undefined,
    status: "ACTIVE" as any,
    expertise: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


// --- Components ---

const StatBadge = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center justify-center p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm flex-1">
    <Icon className="h-4 w-4 text-indigo-600 mb-1" />
    <span className="font-bold text-gray-900 text-sm">{value}</span>
    <span className="text-[10px] text-gray-600 uppercase tracking-wide">{label}</span>
  </div>
);

function ExpertCard({ expert }: { expert: any }) {
  return (
    <motion.div
      className="group relative w-full h-[500px] rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg cursor-pointer"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={expert.image || expert.photoUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format"}// 
          alt={"Travel Expert"}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, 33vw"

        />
        {/* Gradient Overlay - Darker at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 transition-opacity duration-500" />
      </div>

      {/* Floating Content Card */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        
        {/* Top Label (Always Visible) */}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-bold text-white tracking-wider uppercase">
            {expert.specialty}
          </span>
        </div>

        {/* Text Content */}
        <div className="relative z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-3xl font-serif font-bold text-white mb-2">
            {expert.user?.name || "Travel Expert"}
          </h3>

          {/* Separator Line */}
          <div className="w-12 h-1 bg-indigo-500 mb-4 rounded-full transition-all duration-500 group-hover:w-full" />

          {/* Bio (Collapsible) */}
          <p className="text-gray-200 text-sm line-clamp-2 mb-4 opacity-90 group-hover:opacity-100">
            {expert.bio}
          </p>

          {/* Hidden Content (Reveals on Hover) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
            <div className="overflow-hidden">
              <div className="pt-2 flex flex-col gap-4">
                
                {/* Stats Row */}
                <div className="flex gap-2">
                  <StatBadge icon={TrophyIcon} label="Years" value={`${expert.experienceYears}+`} />
                  <StatBadge icon={MapIcon} label="Trips" value={expert.tripsPlanned || "0"} />
                </div>

                {/* Action Button */}
                <Link href={`/experts/${expert.id}`} className="w-full">
                  <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg">
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    Plan My Trip with {expert?.user?.name?.split(" ")[0] || "Expert"}
                  </button>
                </Link>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                   <span>Top regions:</span>
                   <span className="text-white font-medium">{expert.topDestinations?.join(" • ") || ""}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Section ---
export default function MeetExperts({ experts }: { experts?: Expert[] }) {
  const displayExperts = experts && experts.length > 0 ? experts : sampleAgents;

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-2 block"
            >
              The Architects of Adventure
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight"
            >
              Meet Our Travel Designers
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <Link href="#" className="group flex items-center gap-2 text-gray-900 font-semibold hover:text-indigo-600 transition-colors">
              More Than 45+ Experts
              <ArrowLongRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {displayExperts.map((expert) => (
            <motion.div
              key={expert.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } },
              }}
            >
              <ExpertCard expert={expert} />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom Trust Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center"
        >
            <h4 className="text-lg font-bold text-gray-900 mb-2">Why book with an expert?</h4>
            <p className="text-gray-600 max-w-2xl mx-auto">
                Our designers travel 3 months a year to vet hotels, guides, and experiences personally. 
                You aren't booking an algorithm; you're booking first-hand knowledge.
            </p>
        </motion.div>

      </div>
    </section>
  );
}