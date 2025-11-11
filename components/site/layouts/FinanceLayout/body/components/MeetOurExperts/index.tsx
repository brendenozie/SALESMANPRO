import React from 'react';
import { motion } from 'framer-motion';
import { Expert } from '@/types/typings';

// --- INLINE SVG ICONS (Replacing Heroicons/external libraries for self-containment) ---

// 1. EnvelopeIcon (For Email)
const EnvelopeIcon = ({ className }:{ className : string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M1.5 8.67v8.586a1.5 1.5 0 00.56 1.18l8.28 6.21a1.5 1.5 0 001.815 0l8.28-6.21a1.5 1.5 0 00.56-1.18V8.67L12 14.25 1.5 8.67z" /><path d="M22.5 6.908V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v1.658l9.404 5.437a1.5 1.5 0 001.401 0l9.404-5.437z" /></svg>;
// 2. LinkedIn Icon
const LinkedInIcon = ({ className }:{ className : string }) => <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;


// --- DATA & CONFIG ---

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Colors for Light Mode
const lightBackground = "#F9FAFB"; // Very light gray
const cardBackground = "#FFFFFF"; // Pure white cards
const accentColor = "#007AFF"; // iOS-like bright blue
const primaryTextColor = "#1F2937"; // Dark text
const secondaryTextColor = "#4B5563"; // Muted gray text

// Sample data for experts
const sampleExperts = [
  {
    id: 'exp1',
    name: 'Dr. Evelyn Reed',
    role: 'Chief Legal Officer',
    initials: 'ER',
    bio: 'A visionary leader with over 25 years in corporate law and strategic litigation. Evelyn is renowned for her innovative solutions in complex legal landscapes.',
    linkedin: 'https://linkedin.com/in/evelynreed',
    email: 'evelyn.reed@example.com'
  },
  {
    id: 'exp2',
    name: 'Mr. Benjamin Carter',
    role: 'Lead Financial Strategist',
    initials: 'BC',
    bio: 'Benjamin brings unparalleled expertise in wealth management, investment banking, and financial planning, helping clients achieve long-term prosperity.',
    linkedin: 'https://linkedin.com/in/benjamincarter',
    email: 'benjamin.carter@example.com'
  },
  {
    id: 'exp3',
    name: 'Ms. Olivia Hayes',
    role: 'Senior Tax Advisor',
    initials: 'OH',
    bio: 'Specializing in intricate tax codes and compliance, Olivia ensures optimal financial efficiency and robust tax strategies for our diverse clientele.',
    linkedin: 'https://linkedin.com/in/oliviahayes',
    email: 'olivia.hayes@example.com'
  },
  {
    id: 'exp4',
    name: 'Mr. Alex Thorne',
    role: 'Real Estate Counsel',
    initials: 'AT',
    bio: 'Alex offers comprehensive legal support for property acquisitions, development projects, and dispute resolution, safeguarding client investments.',
    linkedin: 'https://linkedin.com/in/alexthorne',
    email: 'alex.thorne@example.com'
  },
] as unknown as Expert[];

interface MeetOurExpertsProps {
  experts?: any[] | undefined;
}

// Function to generate a random placeholder color based on initials/ID (for aesthetic variation)
const generatePlaceholderColor = (id: string | number) => {
    // Simple hash function to get a consistent, bright color
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - color.length) + color;
};

// --- COMPONENTS ---

export default function MeetOurExperts({ experts }: MeetOurExpertsProps) {
  const expertsToDisplay = experts && experts.length > 0 ? experts : sampleExperts;

  return (
    <section
      id="our-experts"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{ backgroundColor: lightBackground }}
    >
      {/* Subtle geometric pattern in the background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: `radial-gradient(circle, #E5E7EB 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-sm text-transparent bg-clip-text"
            // Use a clean, professional dark blue/accent gradient for the light mode title
            style={{ backgroundImage: `linear-gradient(45deg, ${primaryTextColor}, ${accentColor}, #00377A)` }}
          >
            Meet Our Visionary Experts
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our team comprises **seasoned professionals** dedicated to delivering unparalleled legal and financial guidance.
          </p>
        </motion.div>

        {/* Experts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {expertsToDisplay.map((member: any, i: number) => {
            const memberColor = generatePlaceholderColor(member.id);

            return (
              <motion.div
                key={member.id}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  // Soft, elevated shadow on hover
                  boxShadow: `0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 3px ${memberColor}80`, 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative p-6 rounded-xl shadow-lg text-center transition-all duration-300 transform"
                style={{ backgroundColor: cardBackground }}
              >
                {/* Member Image / Placeholder */}
                <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-4 transition-colors duration-300"
                    style={{ borderColor: memberColor, backgroundColor: memberColor + '20' }}
                >
                    {/* Placeholder Circle with Initials */}
                    <div className="flex items-center justify-center w-full h-full text-4xl font-extrabold" 
                         style={{ color: memberColor, textShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
                        {member.initials}
                    </div>
                </div>

                {/* Member Info */}
                <h3 className="text-2xl font-bold mb-1 leading-tight transition-colors duration-300"
                    style={{ color: primaryTextColor }}
                >
                  {member.name}
                </h3>
                <p className="font-semibold mb-4 text-base"
                    style={{ color: accentColor }}
                >
                  {member.role || 'Expert'}
                </p>
                <p className="text-sm leading-relaxed mb-6"
                    style={{ color: secondaryTextColor }}
                >
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex justify-center space-x-5">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-transform duration-200 transform hover:scale-110"
                      aria-label={`LinkedIn profile of ${member.name}`}
                      style={{ color: primaryTextColor }}
                    >
                      <LinkedInIcon className="h-6 w-6 hover:text-blue-600" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="transition-transform duration-200 transform hover:scale-110"
                      aria-label={`Email ${member.name}`}
                      style={{ color: primaryTextColor }}
                    >
                      <EnvelopeIcon className="h-6 w-6 hover:text-blue-600" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}