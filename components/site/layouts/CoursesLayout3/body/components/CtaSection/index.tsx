"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  ArrowRightIcon, 
  UserIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function ContactFormSection() {
  const { storeFormData } = useStoreContext() || {};

  // Dynamic colors from storeFormData with standard brand fallbacks
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // Dynamic content
  const ctaImageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1546410531-bb45ce9b6867?q=80&w=2670&auto=format&fit=crop"; 
  const contactSubtitle = storeFormData?.description || "Have some questions? Drop us a line and our expert instructors or administrative team will get back to you shortly.";

  // Form State Management
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setFormStatus('submitting');

    // Simulate database post/payload dispatch latency
    try {
      console.log("Transmitting payload to core system:", formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormStatus('success');
    } catch (error) {
      console.error("Transmission error:", error);
      setFormStatus('idle');
    }
  };

  const handleResetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setFormStatus('idle');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <motion.section
      className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-gray-100 dark:border-gray-800">
        
        {/* --- Background: Diagonal Split --- */}
        <div 
          className="absolute inset-0 z-0 hidden lg:block"
          style={{ 
            clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)',
            backgroundColor: primaryColor,
          }}
        />

        {/* Fallback color for mobile viewport / right-side columns */}
        <div className="absolute inset-0 z-0 bg-white dark:bg-zinc-900 lg:hidden" />
        <div 
          className="absolute inset-0 z-0 hidden lg:block"
          style={{ 
            clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)',
            backgroundColor: '#18181b', // matching dark gray-900/zinc-900 fallback natively
          }}
        />

        {/* --- Content Grid: Split Column Layout --- */}
        <div className="relative z-10 grid lg:grid-cols-12">

          {/* 1. Left Section - Image, Identity & Branding (Col Span 7) */}
          <motion.div
            className="relative col-span-12 lg:col-span-7 h-80 lg:min-h-[600px] flex items-center justify-center p-10"
            variants={itemVariants}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <Image
                src={ctaImageUrl}
                alt="Connect with us"
                fill
                className="object-cover object-center"
                loader={loader}
                sizes="(max-width: 1024px) 100vw, 60vw"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gray-900/80 transition-colors duration-500" />
            </div>

            {/* Brand Emblem Framing */}
            <motion.div 
              className="relative text-center p-6 border-4 border-white/50 rounded-xl max-w-md backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate="visible"
              variants={{ visible: { opacity: 1, scale: 1, transition: { delay: 0.4, type: 'spring', stiffness: 100 }}}}
            >
              <h3 className="text-4xl font-extrabold text-white tracking-tight">
                {storeFormData?.name || "EduLearn Academy"}
              </h3>
              <p className="text-xl text-gray-300 mt-2 font-medium">
                {storeFormData?.tagline || "Your Future, Our Expertise"}
              </p>
            </motion.div>
          </motion.div>

          {/* 2. Right Section - Interactive Contact Form Console (Col Span 5) */}
          <div className="col-span-12 lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-zinc-900 min-h-[550px]">
            <AnimatePresence mode="wait">
              {formStatus !== 'success' ? (
                <motion.div
                  key="form-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full"
                >
                  <motion.h2
                    className="text-3xl sm:text-4xl font-black mb-3 leading-tight text-gray-900 dark:text-white flex items-center gap-2"
                    variants={itemVariants}
                  >
                    Get in <span style={{ color: primaryColor }}>Touch</span>
                  </motion.h2>

                  <motion.p
                    className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg"
                    variants={itemVariants}
                  >
                    {contactSubtitle}
                  </motion.p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Candidate Name Input */}
                    <div className="relative border-b border-gray-300 dark:border-zinc-700 pb-1 focus-within:border-gray-900 dark:focus-within:border-white transition-colors">
                      <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name" 
                        className="w-full bg-transparent py-3 pl-7 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none text-sm font-medium"
                      />
                    </div>

                    {/* Contact Email Input */}
                    <div className="relative border-b border-gray-300 dark:border-zinc-700 pb-1 focus-within:border-gray-900 dark:focus-within:border-white transition-colors">
                      <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com" 
                        className="w-full bg-transparent py-3 pl-7 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none text-sm font-medium"
                      />
                    </div>

                    {/* Inquiry Specifications */}
                    <div className="relative border-b border-gray-300 dark:border-zinc-700 pb-1 focus-within:border-gray-900 dark:focus-within:border-white transition-colors">
                      <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3 h-4 w-4 text-gray-400" />
                      <textarea 
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Inquiry Specifications / Objectives" 
                        className="w-full bg-transparent py-3 pl-7 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none text-sm font-medium resize-none"
                      />
                    </div>

                    {/* Action Dispatch Frame */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className={clsx(
                        "w-full py-4 text-sm font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-75"
                      )}
                      style={{ backgroundColor: primaryColor }}
                    >
                      {formStatus === 'submitting' ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <ArrowRightIcon className="w-4 h-4 text-white" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center flex flex-col items-center justify-center space-y-6"
                >
                  <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Message Dispatched!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                      Thank you for reaching out. We have successfully recorded your details and will coordinate our team response quickly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs font-semibold uppercase tracking-widest hover:underline transition-colors"
                    style={{ color: accentColor }}
                  >
                    Submit Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.section>
  );
}