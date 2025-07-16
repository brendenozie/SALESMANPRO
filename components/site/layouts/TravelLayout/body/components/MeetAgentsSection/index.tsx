"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseIcon, // For experience
  GlobeAltIcon, // For travels completed
  EnvelopeIcon, // For email
  PhoneIcon, // For phone/chat
  ArrowRightIcon, // For view profile
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

// --- Shared Utilities (from previous sections for consistency) ---

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Base64 encoded SVG for a simple blur placeholder
const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// Animation variants for consistent staggered reveals across sections
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Delay between child animations
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring for a gentle bounce
      damping: 15,    // More damping for a smoother stop
    },
  },
};

// --- Dummy Data for Travel Experts ---
const agents = [
  {
    id: "agent1",
    name: "Sophia Chen",
    specialty: "Adventure Travel",
    experience: 8,
    travelsCompleted: 120,
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Expert in thrilling expeditions and off-the-beaten-path destinations.",
    email: "sophia.c@example.com",
    linkedin: "https://linkedin.com/in/sophiachen",
  },
  {
    id: "agent2",
    name: "David Miller",
    specialty: "Luxury & Relaxation",
    experience: 12,
    travelsCompleted: 95,
    photo: "https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Crafting bespoke, high-end travel experiences for discerning clients.",
    email: "david.m@example.com",
    linkedin: "https://linkedin.com/in/davidmiller",
  },
  {
    id: "agent3",
    name: "Maria Rodriguez",
    specialty: "Cultural & Historical Tours",
    experience: 10,
    travelsCompleted: 150,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Passionate about uncovering the rich history and traditions of global destinations.",
    email: "maria.r@example.com",
    linkedin: "https://linkedin.com/in/mariarodriguez",
  },
  {
    id: "agent4",
    name: "Kenji Tanaka",
    specialty: "Family Vacations",
    experience: 7,
    travelsCompleted: 80,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Creating memorable and stress-free family adventures for all ages.",
    email: "kenji.t@example.com",
    linkedin: "https://linkedin.com/in/kenjitanaka",
  },
  {
    id: "agent5",
    name: "Lena Petrova",
    specialty: "Eco-Tourism & Nature",
    experience: 6,
    travelsCompleted: 100,
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Dedicated to sustainable travel and exploring the world's natural wonders.",
    email: "lena.p@example.com",
    linkedin: "https://linkedin.com/in/lenapetrova",
  },
  {
    id: "agent6",
    name: "Omar Hassan",
    specialty: "Middle East & Africa",
    experience: 9,
    travelsCompleted: 110,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bioSnippet: "Deep knowledge of unique experiences across the Middle East and African continent.",
    email: "omar.h@example.com",
    linkedin: "https://linkedin.com/in/omarhassan",
  },
];


// AgentCard.jsx
function AgentCard({ agent }) {
  return (
    <motion.div
      whileHover={{ y: -10, boxShadow: "0px 20px 40px rgba(0,0,0,0.15)" }} // More pronounced lift and shadow
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg flex flex-col items-center text-center p-8 group relative" // Increased padding, more rounded, stronger shadow, added 'group' for hover effects
    >
      {/* Agent Photo with Ring */}
      <div className="relative w-32 h-32 mb-6"> {/* Larger photo */}
        <Image
          src={agent.photo}
          alt={agent.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full ring-4 ring-indigo-300 ring-offset-4 ring-offset-white transition-all duration-300 group-hover:ring-indigo-500" // Rounded, colored ring, hover effect on ring
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />
      </div>

      {/* Agent Info */}
      <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
      <p className="text-indigo-700 font-semibold mb-2">{agent.specialty}</p>
      <div className="flex items-center text-gray-600 text-sm mb-2">
        <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-500" />
        <span>{agent.experience} years experience</span>
      </div>
      <div className="flex items-center text-gray-600 text-sm mb-4">
        <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-500" />
        <span>{agent.travelsCompleted}+ trips completed</span>
      </div>

      {/* Bio Snippet (visible on hover) */}
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 0, height: 0 }} // Hidden by default
        whileHover={{ opacity: 1, height: "auto" }} // Reveals on hover
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-gray-700 text-sm italic mb-4 overflow-hidden line-clamp-3"
      >
        "{agent.bioSnippet}"
      </motion.p>

      {/* Contact Buttons / View Profile */}
      <div className="mt-auto w-full flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"> {/* Hidden by default, reveals on hover */}
        <Link href={`mailto:${agent.email}`} passHref>
          <motion.a
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-3 font-medium transition flex items-center justify-center gap-2 shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <EnvelopeIcon className="h-5 w-5" /> Contact {agent.name.split(' ')[0]}
          </motion.a>
        </Link>
        <Link href={`/experts/${agent.id}`} passHref>
          <motion.a
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-4 py-3 font-medium transition flex items-center justify-center gap-2 shadow-md"
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

// MeetAgents.jsx
export default function MeetAgents() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-50 to-white overflow-hidden"> {/* Gradient background */}
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Meet Our Dedicated Travel Experts
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Our team of passionate travel advisors is here to turn your dream vacation into a reality. Get personalized advice and insider tips.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10 justify-center" // Adjusted grid for better spacing
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {agents.map((agent) => (
            <motion.div key={agent.id} variants={itemVariants} className="flex justify-center"> {/* Centering cards in grid cells */}
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </motion.div>

        {/* Section Call to Action */}
        <div className="text-center mt-16">
          <Link href="/experts" passHref>
            <motion.button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 font-bold text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center mx-auto gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Find Your Perfect Expert <ArrowRightIcon className="h-5 w-5 ml-2" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}