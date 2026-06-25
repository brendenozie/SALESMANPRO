'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BookOpenIcon, 
  GlobeAltIcon, 
  HandRaisedIcon, 
  UsersIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION ---
const mockData = {
  name: 'Global Change Collective',
  tagline: 'Empowering Communities, Transforming Lives',
  description: "Since our founding, we've been dedicated to improving lives through targeted support and compassionate care. Our mission is to empower communities and provide a brighter future for those most in need. We believe that lasting change starts with grassroots efforts, integrity, and unwavering commitment to those we serve. Join us in our endeavor to uplift lives and create a monumental, lasting impact across the globe.",
  aboutImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200', 
  stats: [
    { id: 'stat-1', label: "Children Helped", value: "1,200+", order: 1, Icon: UsersIcon },
    { id: 'stat-2', label: "Schools Supported", value: "15", order: 2, Icon: BookOpenIcon },
    { id: 'stat-3', label: "Volunteers Engaged", value: "500+", order: 3, Icon: HandRaisedIcon },
    { id: 'stat-4', label: "Communities Served", value: "20+", order: 4, Icon: GlobeAltIcon },
  ],
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
};

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } 
  },
};

// --- STAT CARD COMPONENT ---
const StatCard = ({ stat }: { stat: any }) => {
  const IconComponent = stat.Icon;
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between items-start"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
        <IconComponent className="w-5 h-5" strokeWidth={2} />
      </div>
      <div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight block leading-none">
          {stat.value}
        </span>
        <span className="text-xs font-semibold text-slate-500 block mt-1.5 whitespace-nowrap">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---
export default function AboutUsSpotlightSection({storeFormData}: {storeFormData: any}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const statsToRender = [...mockData.stats].sort((a, b) => a.order - b.order);

  return (
    <section id="about" className="py-24 md:py-32 bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Layout Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-20">
          
          {/* LEFT: Frame Content Area */}
          <div className="lg:col-span-7 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
              { storeFormData.tagline || mockData.tagline }
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-8">
              {storeFormData?.description || mockData.description}
            </p>

            <div className="flex flex-wrap gap-3.5">
              <button
                className="px-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-98"
                onClick={() => mockRouterPush('/donate')}
              >
                Start Your Impact Today
              </button>
              
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-98"
                onClick={() => mockRouterPush('/about')}
              >
                <span>Our History</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-400" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* RIGHT: High-Fidelity Image Container */}
          <div className="lg:col-span-5 w-full">
            <div className="aspect-[4/3] lg:aspect-[1/1] w-full bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <img
                src={mockData.aboutImageUrl}
                alt="Collective operational environment context photo"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200"; }}
              />
            </div>
          </div>
          
        </div>

        {/* Bottom Integrated Grid Metrics Wrapper */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200"
        >
          {statsToRender.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}