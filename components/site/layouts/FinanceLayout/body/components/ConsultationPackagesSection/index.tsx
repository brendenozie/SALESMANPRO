"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- INLINE ICONS ---

const CheckCircleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const SparklesIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 011.06 0l1.97 1.97 1.97-1.97a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 010-1.06z" clipRule="evenodd" />
    <path d="M16.5 4.5a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V7.5a3 3 0 013-3H16.5z" />
  </svg>
);

const ArrowRightIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- CONFIG & DATA ---

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

// Colors
const theme = {
  bg: "#F8FAFC", // Slate-50
  textMain: "#0F172A", // Slate-900
  textMuted: "#64748B", // Slate-500
  primary: "#3B82F6", // Blue-500
  primaryDark: "#1D4ED8", // Blue-700
  accent: "#8B5CF6", // Violet-500 (for gradient effects)
};

interface ConsultationPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  frequency: string;
  features: string[];
  featured?: boolean;
  buttonText: string;
}

const samplePackages: ConsultationPlan[] = [
  {
    id: 'starter',
    title: 'Discovery',
    description: 'Perfect for specific questions or an initial strategic assessment.',
    price: '$299',
    frequency: 'Single Session',
    features: [
      '60-min deep-dive consultation',
      'Actionable strategy roadmap',
      'Review of current documents',
      'Email summary & recording',
    ],
    buttonText: 'Book Session',
  },
  {
    id: 'growth',
    title: 'Strategic Growth',
    description: 'Ongoing partnership for sustained results and complex problem solving.',
    price: '$999',
    frequency: 'Per Month',
    features: [
      'Unlimited priority support',
      'Dedicated senior advisor',
      'Custom financial modeling',
      'Bi-weekly progress calls',
      'Direct Slack/WhatsApp access',
      'Quarterly strategy pivots',
    ],
    featured: true,
    buttonText: 'Start Partnership',
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Full-scale integration for large organizations and institutions.',
    price: 'Custom',
    frequency: 'Tailored Pricing',
    features: [
      'Full team access',
      'On-site workshops',
      'Compliance & risk auditing',
      'White-label capabilities',
      '24/7 crisis management',
    ],
    buttonText: 'Contact Sales',
  },
];

interface ConsultationPackagesProps {
  packages?: ConsultationPlan[];
}

export default function ConsultationPackagesSection({ packages }: ConsultationPackagesProps) {
  const packagesToDisplay = packages && packages.length > 0 ? packages : samplePackages;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden font-sans" style={{ backgroundColor: theme.bg }}>
      
      {/* --- Background Decor --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase mb-4 border border-blue-100">
            Transparent Pricing
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight">
            Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Future Success</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Whether you need a quick course correction or a long-term navigator, we have a plan aligned with your goals.
          </p>
        </motion.div>

        {/* --- Grid --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4 items-center" // lg:gap-4 to bring them closer for visual cohesion
        >
          {packagesToDisplay.map((plan) => {
            const isFeatured = plan.featured;
            
            return (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredId(plan.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
                  isFeatured 
                    ? 'bg-white shadow-2xl scale-100 lg:scale-110 z-10 border-2 border-blue-500' 
                    : 'bg-white/60 backdrop-blur-md border border-slate-200 hover:bg-white hover:shadow-xl z-0'
                }`}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <SparklesIcon className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                {/* Content */}
                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${isFeatured ? 'text-blue-600' : 'text-slate-800'}`}>
                    {plan.title}
                  </h3>
                  <p className="text-sm text-slate-500 min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-slate-100">
                  <div className="flex items-baseline">
                    <span className={`text-5xl font-extrabold tracking-tight ${isFeatured ? 'text-slate-900' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                       <span className="text-slate-400 ml-2 font-medium text-sm">/{plan.frequency}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isFeatured ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    isFeatured
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {plan.buttonText}
                  <ArrowRightIcon className={`w-4 h-4 transition-transform duration-300 ${hoveredId === plan.id ? 'translate-x-1' : ''}`} />
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* --- Footer Note --- */}
        <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16 text-sm text-slate-400"
        >
            All plans include a standard NDA. Need a custom quote? <a href="#" className="text-blue-600 font-bold hover:underline">Let's talk.</a>
        </motion.p>
      </div>
    </section>
  );
}