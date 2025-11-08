"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Make sure to import Image from next/image
import {
   // Assuming you have a LinkedIn icon or can add one
  // If you need more social icons, add them here
  EnvelopeIcon // For email
} from '@heroicons/react/24/solid'; // Or from another icon library if preferred
import { Expert } from '@/types/typings';

// Framer Motion variants (reusing from previous sections for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly faster stagger for team members
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Members animate from slightly below
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7, // Smooth entrance duration
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F"; // From services section
const cardBackground = "#1B2A41"; // From services section
const accentColor = "#66B2FF"; // A bright blue for highlights
const textColorLight = "#E0E7FF"; // Lighter blue for text on dark background
const textColorMuted = "#A7B8D6"; // Muted blue for secondary text

// Define an interface for your expert data for better type safety
// interface Expert {
//   id: string | number;
//   name: string;
//   role: string;
//   img: string; // URL to the expert's image
//   bio: string;
//   linkedin?: string; // Optional LinkedIn profile URL
//   email?: string; // Optional email address
// }

// Sample data for experts (replace with your actual team members)
const sampleExperts: any[] = [
  {
    id: 'exp1',
    name: 'Dr. Evelyn Reed',
    role: 'Chief Legal Officer',
    img: '/images/expert-evelyn.webp', // Placeholder
    bio: 'A visionary leader with over 25 years in corporate law and strategic litigation. Evelyn is renowned for her innovative solutions in complex legal landscapes.',
    linkedin: 'https://linkedin.com/in/evelynreed',
    email: 'evelyn.reed@example.com'
  },
  {
    id: 'exp2',
    name: 'Mr. Benjamin Carter',
    role: 'Lead Financial Strategist',
    img: '/images/expert-benjamin.webp', // Placeholder
    bio: 'Benjamin brings unparalleled expertise in wealth management, investment banking, and financial planning, helping clients achieve long-term prosperity.',
    linkedin: 'https://linkedin.com/in/benjamincarter',
    email: 'benjamin.carter@example.com'
  },
  {
    id: 'exp3',
    name: 'Ms. Olivia Hayes',
    role: 'Senior Tax Advisor',
    img: '/images/expert-olivia.webp', // Placeholder
    bio: 'Specializing in intricate tax codes and compliance, Olivia ensures optimal financial efficiency and robust tax strategies for our diverse clientele.',
    linkedin: 'https://linkedin.com/in/oliviahayes',
    email: 'olivia.hayes@example.com'
  },
  {
    id: 'exp4',
    name: 'Mr. Alex Thorne',
    role: 'Real Estate Counsel',
    img: '/images/expert-alex.webp', // Placeholder
    bio: 'Alex offers comprehensive legal support for property acquisitions, development projects, and dispute resolution, safeguarding client investments.',
    linkedin: 'https://linkedin.com/in/alexthorne',
    email: 'alex.thorne@example.com'
  },
];

interface MeetOurExpertsProps {
  experts?: any[]; // Allow experts to be passed as a prop
}

export default function MeetOurExperts({ experts }: MeetOurExpertsProps) {
  // Use provided experts or fall back to sample data
  const expertsToDisplay = experts && experts.length > 0 ? experts : sampleExperts;

  return (
    <section
      id="our-experts" // Consistent ID naming
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: `linear-gradient(to right, ${darkBackground}, ${cardBackground})` }} // Subtle gradient background
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/cubes-pattern-light.svg" // Subtle geometric pattern
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Meet Our Visionary Experts
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Our team comprises seasoned professionals dedicated to delivering unparalleled legal and financial guidance.
          </p>
        </motion.div>

        {/* Experts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger animation when less of the section is visible
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Added xl: for larger screens
        >
          {expertsToDisplay.map((member: any, i: number) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="relative bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-xl p-8 text-center border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] group"
            >
              {/* Member Image */}
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-lg group-hover:border-blue-400/50 transition-colors duration-300">
                <Image
                  src={member.user.image || "https://placehold.co/128"} // Fallback to img if user.image is not available
                  alt={member.user.name || 'Expert Image'}
                  width={128} // Matched w-32 (128px)
                  height={128} // Matched h-32 (128px)
                  className="object-cover w-full h-full"
                  loader={({ src, width, quality }) =>
                    `${src}?w=${width}&q=${quality || 75}`
                  }
                />
              </div>

              {/* Member Info */}
              <h3 className="text-2xl font-bold text-white mb-1 leading-tight group-hover:text-blue-200 transition-colors duration-300">
                {member.name}
              </h3>
              <p className="text-blue-400 font-semibold mb-4 text-base">
                {member.role || 'Expert'} {/* Fallback role if not provided */}
              </p>
              <p className="text-blue-100/80 text-sm leading-relaxed mb-6">
                {member.bio}
              </p>

              {/* Social Links (hidden by default, appears on hover or always visible for subtle engagement) */}
              <div className="flex justify-center space-x-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-white transition-colors duration-200"
                    aria-label={`LinkedIn profile of ${member.name}`}
                  >
                    {/* Assuming you have a custom LinkedInIcon or can use a generic icon */}
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-blue-300 hover:text-white transition-colors duration-200"
                    aria-label={`Email ${member.name}`}
                  >
                    <EnvelopeIcon className="h-6 w-6" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}