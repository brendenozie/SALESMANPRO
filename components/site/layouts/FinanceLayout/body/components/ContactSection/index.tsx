"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- SYSTEM LIGHTWEIGHT VECTOR ICONS ---
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.622k0-1.314.08-.235.154-.345a11.054 11.054 0 005.13 5.13c.11.074.23.147.345.154.108.007.235-.062.314-.08l2.62-2.623a1.125 1.125 0 011.606 0l3.6 3.6a1.125 1.125 0 010 1.606l-1.546 1.546c-.438.438-1.109.5-1.664.155a13.566 13.566 0 01-5.202-5.202c-.345-.555-.283-1.226.155-1.664l1.546-1.546z" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- ANIMATION CONFIGURATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ContactSection() {
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message secure transfer initiated. (Mock Action)");
  };

  return (
    <section id="contact" className="py-24 lg:py-36 bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-600/10">
      
      {/* Premium Ambient Architecture background items */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-blue-400/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-400/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- DYNAMIC ASYMMETRICAL WRAPPER GRID --- */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* LEFT COLUMN: META & INFORMATION FRAME */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-12"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200/60 text-xs font-semibold tracking-wide text-blue-700 uppercase mb-4">
                Secure Intake
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
                Let’s Connect & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">Collaborate.</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed max-w-md font-normal">
                Reach out directly to establish strategic advisory routing. Our legal and financial team executes intake assessments within one standard operational business frame.
              </p>
            </div>

            {/* Structured Contact Matrix Blocks */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Direct Line</h4>
                  <a href="tel:+1234567890" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Secure Encryption Mail</h4>
                  <a href="mailto:info@yourcompany.com" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                    info@yourcompany.com
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <MapPinIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Corporate Headquarters</h4>
                  <p className="text-sm font-bold text-slate-800 leading-normal">
                    123 Lumina Tower, Suite 500<br />
                    Strategic Avenue, Nairobi, Kenya
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Operational Window</h4>
                  <p className="text-sm font-bold text-slate-800">
                    Mon–Fri: 9:00 AM – 5:00 PM EAT
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: REFINED SUBMISSION FORM LAYER */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col justify-between"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Full Corporate Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Email Address Address</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Inquiry Routing Subject</label>
                <input
                  type="text"
                  placeholder="Strategic Asset Consultation"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-sm font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Operational Summary Brief</label>
                <textarea
                  placeholder="Provide context regarding parameters..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all duration-200 text-sm font-medium resize-none"
                  required
                />
              </div>

              {/* Form Submission Anchor Action */}
              <button
                type="submit"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-blue-600 shadow-md shadow-slate-900/10 hover:shadow-blue-600/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Transmit Secure Intake</span>
                <ArrowRightIcon className={`h-3.5 w-3.5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`} />
              </button>
            </form>

            {/* Map Canvas Frame Area Component Replacement */}
            <div className="w-full h-44 sm:h-52 mt-8 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1994.1234567890123!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10a4b8c5b6b7%3A0xabcdef1234567890!2sLumina%20Tower%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1616161616161!5m2!1sen!2sus"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-none absolute inset-0"
                title="Our Corporate Office Spatial Coordinate Reference"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}