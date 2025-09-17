"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

// Shared interface (aligned with your Experts data)
export interface Expert {
  id: string | number;
  name: string;
  role: string; // In MeetAgents, displayed as "specialty"
  image: string; // photo
  bio: string; // bioSnippet
  experience?: number;
  travelsCompleted?: number;
  email?: string;
  linkedin?: string;
}

// --- Sample fallback data ---
const sampleAgents: Expert[] = [
  {
    id: "agent1",
    name: "Sophia Chen",
    role: "Adventure Travel",
    experience: 8,
    travelsCompleted: 120,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format",
    bio: "Expert in thrilling expeditions and off-the-beaten-path destinations.",
    email: "sophia.c@example.com",
    linkedin: "https://linkedin.com/in/sophiachen",
  },
  {
    id: "agent2",
    name: "David Miller",
    role: "Luxury & Relaxation",
    experience: 12,
    travelsCompleted: 95,
    image: "https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=600&auto=format",
    bio: "Crafting bespoke, high-end travel experiences for discerning clients.",
    email: "david.m@example.com",
    linkedin: "https://linkedin.com/in/davidmiller",
  },
];

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// AgentCard Component
function AgentCard({ agent }: { agent: Expert }) {
  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: "0px 20px 40px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col items-center text-center p-8 group relative"
    >
      {/* Photo */}
      <div className="relative w-32 h-32 mb-6">
        <Image
          src={agent.image || 'https://linkedin.com/in/evelynreed'}
          alt={agent.name || 'agent'}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
          fill
          className="rounded-full ring-4 ring-indigo-300 ring-offset-4 ring-offset-white group-hover:ring-indigo-500 object-cover"
        />
      </div>

      {/* Info */}
      <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
      <p className="text-indigo-700 font-semibold mb-2">{agent.role}</p>

      {agent.experience && (
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-500" />
          <span>{agent.experience} years experience</span>
        </div>
      )}
      {agent.travelsCompleted && (
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-500" />
          <span>{agent.travelsCompleted}+ trips completed</span>
        </div>
      )}

      {/* Bio snippet */}
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        whileHover={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="text-gray-700 text-sm italic mb-4 overflow-hidden line-clamp-3"
      >
        "{agent.bio}"
      </motion.p>

      {/* Contact + Profile */}
      <div className="mt-auto w-full flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {agent.email && (
          <Link href={`mailto:${agent.email}`} passHref>
            <motion.a
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-3 font-medium flex items-center justify-center gap-2 shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnvelopeIcon className="h-5 w-5" /> Contact {agent.name.split(" ")[0]}
            </motion.a>
          </Link>
        )}
        <Link href={`/experts/${agent.id}`} passHref>
          <motion.a
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-3 font-medium flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Profile <ArrowRightIcon className="h-4 w-4 ml-1" />
          </motion.a>
        </Link>
      </div>
    </motion.div>
  );
}

// --- Main Section ---
export default function MeetAgents({ agents }: { agents?: Expert[] }) {
  const agentsToDisplay = agents && agents.length > 0 ? agents : sampleAgents;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Meet Our Dedicated Travel Experts
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our team of passionate travel advisors is here to turn your dream
          vacation into a reality.
        </motion.p>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
        >
          {agentsToDisplay.map((agent) => (
            <motion.div key={agent.id} variants={itemVariants} className="flex justify-center">
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
