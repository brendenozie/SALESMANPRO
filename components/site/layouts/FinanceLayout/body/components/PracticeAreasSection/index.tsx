"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import {
  BriefcaseIcon, // General professional icon
  BanknotesIcon, // For financial services
  ScaleIcon, // For legal services
  DocumentTextIcon, // For documentation/contracts
  ChartBarIcon, // For financial analysis/planning
  BuildingOffice2Icon, // For corporate/real estate
  ArrowRightIcon, // For "Learn More" links
} from '@heroicons/react/24/solid';

// Framer Motion variants for staggered animations (matching hero)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly faster stagger for multiple cards
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Cards animate from slightly below
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7, // Smooth entrance duration
      ease: "easeOut",
    },
  },
};

// Colors matching the hero section or complementary to it
const primaryBlue = "#004085"; // From hero
const secondaryBlue = "#1F77B4"; // From hero
const darkBackground = "#0A192F"; // A dark navy for section background, providing contrast
const cardBackground = "#1B2A41"; // Slightly lighter than darkBackground, for card base
const accentColor = "#66B2FF"; // A bright blue for icons/highlights

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType; // Allows dynamic icon rendering
  slug: string;
}

interface PracticeAreasSectionProps {
  services?: Service[]; // Make services prop optional to use sample data easily
}

export default function PracticeAreasSection({ services }: PracticeAreasSectionProps) {
  // Sample Data for services (use if no services prop is provided)
  const defaultServices: Service[] = [
    {
      id: "1",
      name: "Corporate & Business Law",
      description: "Navigate business formation, M&A, and regulatory compliance with expert legal counsel.",
      icon: BriefcaseIcon,
      slug: "/services/corporate-business-law",
    },
    {
      id: "2",
      name: "Strategic Financial Advisory",
      description: "Develop robust financial plans, investment strategies, and wealth management solutions.",
      icon: BanknotesIcon,
      slug: "/services/financial-advisory",
    },
    {
      id: "3",
      name: "Real Estate & Property",
      description: "Secure your property interests with comprehensive support for transactions and disputes.",
      icon: BuildingOffice2Icon,
      slug: "/services/real-estate-law",
    },
    {
      id: "4",
      name: "Tax Planning & Compliance",
      description: "Optimize tax liabilities and ensure compliance for individuals and corporate entities.",
      icon: ChartBarIcon,
      slug: "/services/tax-planning",
    },
    {
      id: "5",
      name: "Litigation & Dispute Resolution",
      description: "Achieve favorable outcomes with our skilled representation in complex legal disputes.",
      icon: ScaleIcon,
      slug: "/services/litigation",
    },
    {
      id: "6",
      name: "Estate Planning & Wills",
      description: "Protect your legacy and assets through thoughtful wills, trusts, and estate strategies.",
      icon: DocumentTextIcon,
      slug: "/services/estate-planning",
    },
  ];

  // Use provided services or fall back to default
  const servicesToDisplay = services && services.length > 0 ? services : defaultServices;

  return (
    <section
      id="services"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: darkBackground }} // Deep blue background for contrast
    >
      {/* Optional subtle background pattern for depth */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/abstract-pattern-dark.svg" // Ensure this SVG exists in your public folder
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Our Core Expertise
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Discover how our specialized services can provide clarity and strategic advantage in your financial and legal endeavors.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          // Animate when the section comes into view
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Animation plays once when 30% of section is visible
          className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {servicesToDisplay.map((s) => (
            <motion.a
              key={s.id}
              href={s.slug} // Make the entire card a clickable link
              variants={itemVariants}
              className="group relative p-8 bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-xl border border-transparent hover:border-blue-500/50 transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer flex flex-col"
            >
              {/* Subtle background "sparkle" or pattern for card depth */}
              <div className="absolute inset-0 z-0 opacity-10">
                <Image
                  src="/images/card-pattern-subtle.svg" // Ensure this SVG exists in your public folder
                  alt="card pattern"
                  fill
                  className="object-cover"
                  style={{ mixBlendMode: "overlay" }}
                  loader={({ src, width, quality }) =>
                    `${src}?w=${width}&q=${quality || 75}`
                  }
                />
              </div>

              <div className="relative z-10 flex-grow"> {/* Ensure content is above pattern and takes available space */}
                <div className="flex items-center justify-center p-4 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-colors duration-300 mb-6 w-fit">
                  {React.createElement(s.icon, { className: "h-10 w-10" })} {/* Render icon dynamically */}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">
                  {s.name}
                </h3>
                <p className="text-blue-100/80 text-base leading-relaxed mb-6">
                  {s.description}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center text-blue-300 font-medium group-hover:text-white transition-colors duration-300">
                Learn More
                <ArrowRightIcon className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}