'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

interface GeoLocation {
  lat: number;
  lng: number;
}

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

interface StoreFormData {
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: GeoLocation;
  themeSettings?: ThemeSettings;
  name?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

export default function ContactSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData } || {};
  const {
    contactEmail,
    contactPhone,
    address,
    geoLocation,
    themeSettings = {},
    name,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#000000';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ fullName: '', email: '', message: '' });
  };

  const sanitizedPhone = contactPhone ? contactPhone.replace(/\D/g, '') : '';
  const whatsappHref = sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : '';

  let mapSrc = "";
  if (geoLocation && typeof geoLocation.lat === 'number' && typeof geoLocation.lng === 'number') {
    mapSrc = `https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15955.123456789012!2d${geoLocation.lng}!3d${geoLocation.lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${geoLocation.lat}N${geoLocation.lng}E!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske`;
  } else if (address) {
    const encodedAddress = encodeURIComponent(address);
    mapSrc = `https://www.google.com/maps/embed?q=${encodedAddress}&output=embed`;
  } else {
    mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8164801198533!2d36.817223!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf1f25b2447990!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske";
  }

  return (
    <AnimatePresence>
      <section
        id="contact"
        className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
      >
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Tagline Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Communications Hub
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
              variants={itemVariants}
            >
              Let's Connect & <span style={{ color: primaryColor }}>Build Frameworks</span>
            </motion.h2>

            <motion.p
              className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
              variants={itemVariants}
            >
              Have an operation query, pipeline challenge, or structural request? Reach out to {name || 'us'} below.
            </motion.p>
          </motion.div>

          {/* Matrix Content Grid Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Communications Formulation Matrix Form */}
            <motion.div
              className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Inquiry Vector Submission</h3>
              
              <form className="space-y-5" onSubmit={handleSubmit}>
                <motion.div variants={itemVariants}>
                  <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Full Name Identity</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Digital Routing Email</label>
                  <input
                    type="authorEmail"
                    id="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Inquiry Context Payload</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Provide details regarding your operational objectives..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:border-slate-900 transition-colors resize-y"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </motion.div>

                <motion.button
                  type="submit"
                  className="w-full inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-6 py-4 rounded-xl text-white bg-slate-900 border border-slate-900 transition-all duration-200 hover:bg-slate-800 active:scale-95 shadow-sm"
                  variants={itemVariants}
                >
                  Transmit Message Payload
                </motion.button>
              </form>
            </motion.div>

            {/* Right Column: Direct Nodes & Framework Frame */}
            <div className="lg:col-span-6 w-full flex flex-col gap-6 lg:gap-8">
              
              {/* Direct Address Mapping Framework */}
              <motion.div
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                {contactEmail && (
                  <motion.div variants={itemVariants}>
                    <Link href={`mailto:${contactEmail}`} className="flex items-start gap-3.5 group">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex-shrink-0">
                        <EnvelopeIcon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Router</span>
                        <span className="block text-sm font-bold text-slate-900 truncate mt-0.5 group-hover:underline">{contactEmail}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {contactPhone && (
                  <motion.div variants={itemVariants}>
                    <Link href={`tel:${contactPhone}`} className="flex items-start gap-3.5 group">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex-shrink-0">
                        <PhoneIcon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Voice Line</span>
                        <span className="block text-sm font-bold text-slate-900 truncate mt-0.5 group-hover:underline">{contactPhone}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {whatsappHref && (
                  <motion.div variants={itemVariants}>
                    <Link href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3.5 group">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex-shrink-0">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Instant Messaging</span>
                        <span className="block text-sm font-bold text-slate-900 truncate mt-0.5 group-hover:underline">Start Chat Session</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {address && (
                  <motion.div variants={itemVariants}>
                    <Link href={mapSrc} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3.5 group">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex-shrink-0">
                        <MapPinIcon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Physical Node</span>
                        <span className="block text-sm font-bold text-slate-900 truncate mt-0.5 group-hover:underline">{address}</span>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Geographic Frame Vector */}
              <motion.div
                className="rounded-2xl overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-50 p-1.5 w-full"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden grayscale contrast-[1.1] border border-slate-150">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location Matrix Node"
                  ></iframe>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>
    </AnimatePresence>
  );
}