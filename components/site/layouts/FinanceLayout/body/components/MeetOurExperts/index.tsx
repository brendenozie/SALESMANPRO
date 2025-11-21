"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Expert } from '@/types/typings';

// --- ICONS ---
const EnvelopeIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1.5 8.67v8.586a1.5 1.5 0 00.56 1.18l8.28 6.21a1.5 1.5 0 001.815 0l8.28-6.21a1.5 1.5 0 00.56-1.18V8.67L12 14.25 1.5 8.67z" />
    <path d="M22.5 6.908V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v1.658l9.404 5.437a1.5 1.5 0 001.401 0l9.404-5.437z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// --- UTILITIES ---
// Generates a consistent, beautiful gradient based on the expert's name
const getGradient = (name: string) => {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Deep Purple
    "linear-gradient(135deg, #2AF598 0%, #009EFD 100%)", // Fresh Green/Blue
    "linear-gradient(135deg, #b721ff 0%, #21d4fd 100%)", // Electric Violet
    "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)", // Emerald
  ];
  const index = name.length % gradients.length;
  return gradients[index];
};

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

// --- TYPES & MOCK DATA ---
const sampleExperts = [
  {
    id: 'exp1',
    name: 'Dr. Evelyn Reed',
    role: 'Chief Legal Officer',
    initials: 'ER',
    bio: '25+ years navigating complex litigation and corporate law with visionary leadership.',
    linkedin: '#',
    email: 'email@example.com'
  },
  {
    id: 'exp2',
    name: 'Benjamin Carter',
    role: 'Lead Financial Strategist',
    initials: 'BC',
    bio: 'Unparalleled expertise in wealth management, M&A, and long-term fiscal planning.',
    linkedin: '#',
    email: 'email@example.com'
  },
  {
    id: 'exp3',
    name: 'Olivia Hayes',
    role: 'Senior Tax Advisor',
    initials: 'OH',
    bio: 'Specializing in intricate tax compliance to ensure optimal efficiency for global clients.',
    linkedin: '#',
    email: 'email@example.com'
  },
  {
    id: 'exp4',
    name: 'Alex Thorne',
    role: 'Real Estate Counsel',
    initials: 'AT',
    bio: 'Comprehensive support for acquisitions, development projects, and dispute resolution.',
    linkedin: '#',
    email: 'email@example.com'
  },
] as unknown as Expert[];

interface MeetOurExpertsProps {
  experts?: any[] | undefined;
}

export default function MeetOurExperts({ experts }: MeetOurExpertsProps) {
  const expertsToDisplay = experts && experts.length > 0 ? experts : sampleExperts;

  return (
    <section
      id="our-experts"
      className="py-24 sm:py-32 relative overflow-hidden font-sans bg-slate-50"
    >
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full blur-[128px] opacity-50 mix-blend-multiply" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-[128px] opacity-50 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1 rounded-full mb-4 inline-block shadow-sm">
            The Team
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Visionaries</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Seasoned professionals dedicated to delivering precision, clarity, and results.
          </p>
        </motion.div>

        {/* --- GRID --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {expertsToDisplay.map((expert: any) => {
            const bannerGradient = getGradient(expert.name);

            return (
              <motion.div
                key={expert.id}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden border border-slate-100"
              >
                {/* --- DECORATIVE BANNER --- */}
                <div 
                  className="h-24 w-full relative overflow-hidden"
                  style={{ background: bannerGradient }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                {/* --- AVATAR (FLOATING) --- */}
                <div className="px-6 relative -mt-12 mb-4 flex justify-center">
                   <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg">
                      <div 
                        className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner"
                        style={{ background: bannerGradient }}
                      >
                        {expert.initials}
                      </div>
                   </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="px-6 pb-8 text-center flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {expert.name}
                  </h3>
                  <p className="text-sm font-medium text-blue-500 mb-4 tracking-wide uppercase">
                    {expert.role}
                  </p>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {expert.bio}
                  </p>

                  {/* --- SOCIAL PILLS --- */}
                  <div className="mt-auto flex items-center justify-center gap-3 pt-6 border-t border-slate-100">
                     {expert.linkedin && (
                        <a 
                          href={expert.linkedin} 
                          className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-[#0077b5] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110"
                          aria-label="LinkedIn"
                        >
                          <LinkedInIcon className="h-5 w-5" />
                        </a>
                     )}
                     {expert.email && (
                        <a 
                          href={`mailto:${expert.email}`} 
                          className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110"
                          aria-label="Email"
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </a>
                     )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}