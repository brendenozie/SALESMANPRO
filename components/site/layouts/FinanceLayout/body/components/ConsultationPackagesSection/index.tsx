import React from 'react';
import { motion } from 'framer-motion';

// --- INLINE SVG ICONS (Replacing Heroicons for self-containment) ---

// 1. CheckIcon
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M19.916 4.626l.488.176.49-.176a.75.75 0 000-1.488l-.49-.176-.488-.176a.75.75 0 00-.608 0l-.488.176-.49.176a.75.75 0 000 1.488zM9 12a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5H9.75A.75.75 0 019 12zm0 3a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H9.75A.75.75 0 019 15zm0 3a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5H9.75A.75.75 0 019 18z" clipRule="evenodd" />
  </svg>
);
// 2. ArrowRightIcon
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3.75 12a.75.75 0 01.75-.75h14.5A.75.75 0 0119.5 12a.75.75 0 01-.75.75H4.5A.75.75 0 013.75 12z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M15.53 17.78a.75.75 0 010-1.06l1.22-1.22H4.5a.75.75 0 010-1.5h12.25l-1.22-1.22a.75.75 0 011.06-1.06l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 01-1.06 0z" clipRule="evenodd" />
  </svg>
);

// --- CONFIG & DATA ---

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Colors for Light Mode
const lightBackground = "#F9FAFB"; // Very light gray background
const cardBackground = "#FFFFFF"; // Pure white cards
const accentColor = "#007AFF"; // Bright professional blue
const primaryTextColor = "#1F2937"; // Dark text
const secondaryTextColor = "#6B7280"; // Muted gray text
const highlightYellow = "#FFD700"; // Gold/Yellow for 'Featured' tag

// Interface for consultation plans
interface ConsultationPlan {
  id: string | number;
  title: string;
  description: string;
  price: string;
  frequency: string;
  features: string[];
  featured?: boolean;
  buttonText: string;
}

// Sample data for consultation packages (using original data)
const samplePackages: ConsultationPlan[] = [
  {
    id: 'basic',
    title: 'Foundational Insight',
    description: 'Ideal for initial guidance and understanding your legal or financial landscape.',
    price: '$299',
    frequency: 'One-time consultation',
    features: [
      '60-minute in-depth session',
      'Initial situation assessment',
      'High-level strategy overview',
      'Q&A with a specialist',
      'Post-consultation summary email',
    ],
    buttonText: 'Book Now',
  },
  {
    id: 'premium',
    title: 'Strategic Partnership',
    description: 'Comprehensive planning and advisory for complex legal or financial challenges.',
    price: '$999',
    frequency: 'Monthly Retainer (3-month minimum)',
    features: [
      'Unlimited consultations',
      'Dedicated lead advisor',
      'Customized action plan',
      'Ongoing tactical support',
      'Priority response time',
      'Quarterly performance review',
    ],
    featured: true,
    buttonText: 'Get Started',
  },
  {
    id: 'enterprise',
    title: 'Tailored Enterprise Solutions',
    description: 'Bespoke solutions crafted for complex corporate and institutional requirements.',
    price: 'Contact Us',
    frequency: 'Customized Pricing',
    features: [
      'Dedicated enterprise team',
      'On-site consultations available',
      'Integrated legal & financial services',
      'Risk management & compliance',
      'Proprietary data insights',
      '24/7 priority support',
    ],
    buttonText: 'Request Quote',
  },
];

interface ConsultationPackagesProps {
  packages?: ConsultationPlan[];
}

// --- MAIN COMPONENT ---

export default function ConsultationPackagesSection({ packages }: ConsultationPackagesProps) {
  const packagesToDisplay = packages && packages.length > 0 ? packages : samplePackages;

  return (
    <section
      id="consultation-packages"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden font-inter"
      style={{ backgroundColor: lightBackground }}
    >
      {/* Visual background element for interest (Subtle top gradient) */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), transparent 300px)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-sm"
              style={{ color: primaryTextColor }}
          >
            Flexible Plans for <span style={{ color: accentColor }}>Optimal Growth</span>
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
             style={{ color: secondaryTextColor }}
          >
            Choose the perfect level of support to achieve your legal and financial objectives.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
        >
          {packagesToDisplay.map((plan: ConsultationPlan, i: number) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ 
                y: plan.featured ? -12 : -8, // Featured card moves more
                scale: plan.featured ? 1.05 : 1.03, 
                boxShadow: plan.featured 
                  ? `0 20px 40px -10px rgba(0, 122, 255, 0.4)` // Stronger shadow for featured
                  : `0 10px 20px -5px rgba(0, 0, 0, 0.1)`, // Soft shadow for others
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative rounded-2xl p-8 shadow-xl transition-all duration-300 transform group flex flex-col justify-between`}
              style={{ backgroundColor: cardBackground, 
                       border: plan.featured ? `3px solid ${accentColor}` : '1px solid #E5E7EB' }}
            >
              {/* Featured Label */}
              {plan.featured && (
                <div className="absolute -top-4 right-6 text-sm font-bold px-4 py-1 rounded-full shadow-md rotate-3"
                     style={{ backgroundColor: highlightYellow, color: primaryTextColor }}>
                  Most Popular
                </div>
              )}
              
              <div className="flex flex-col">
                <h3 className="text-3xl font-extrabold mb-2 leading-tight"
                    style={{ color: primaryTextColor }}>
                  {plan.title}
                </h3>
                <p className="mb-6 text-sm"
                   style={{ color: secondaryTextColor }}>
                  {plan.description}
                </p>

                {/* Price Block */}
                <div className="mb-8 p-3 -mx-3 rounded-xl"
                     style={{ 
                        backgroundColor: plan.featured ? accentColor + '10' : lightBackground, 
                        border: plan.featured ? `1px solid ${accentColor}40` : 'none' 
                     }}>
                    <p className={`text-6xl font-black leading-none`}
                        style={{ color: plan.featured ? accentColor : primaryTextColor }}>
                        {plan.price}
                    </p>
                    <p className={`mt-1 text-base font-medium`}
                        style={{ color: secondaryTextColor }}>
                        {plan.frequency}
                    </p>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8 text-base">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className={`h-6 w-6 flex-shrink-0 mr-3 mt-0.5`}
                                 style={{ color: plan.featured ? accentColor : secondaryTextColor }}/>
                      <span style={{ color: primaryTextColor }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center`}
                style={{
                  backgroundColor: plan.featured ? accentColor : secondaryTextColor,
                  color: cardBackground,
                  boxShadow: plan.featured ? `0 5px 15px -5px ${accentColor}80` : `0 5px 15px -5px ${secondaryTextColor}80`
                }}
              >
                {plan.buttonText}
                <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}