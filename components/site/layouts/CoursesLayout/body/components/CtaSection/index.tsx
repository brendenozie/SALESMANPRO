"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  CheckBadgeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const INQUIRY_TRACKS = [
  { id: 'dev', label: 'Software Engineering' },
  { id: 'robotics', label: 'Robotics & AI' },
  { id: 'general', label: 'General Inquiry' }
];

export default function ContactFormSection() {
  const { storeFormData } = useStoreContext() || {};

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeTrack, setActiveTrack] = useState('dev');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
         const handleSubmit = async (e: React.FormEvent) => {
                e.preventDefault();
                setIsSubmitting(true);
                const formattedContent = `NEW INQUIRY\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
        
                try {
                    const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ companyId: storeFormData?.id, content: formattedContent }),
                    });
                    if (!res.ok) throw new Error("API Error");
                    setSubmitStatus('success');
                    setFormData({ name: '', email: '', message: '' });
                } catch (error) {
                    setSubmitStatus('error');
                } finally {
                    setIsSubmitting(false);
                }
            };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setActiveTrack('dev');
    setStatus('idle');
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* 1. Background Layer: Subtle Mesh & Depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" style={{ backgroundColor: `${primaryColor}15` }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" style={{ backgroundColor: `${accentColor}15` }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900">
          
          {/* 2. Content Container */}
          <div className="relative z-20 grid lg:grid-cols-2 min-h-[650px]">
            
            {/* Left Side: The "Atmosphere" */}
            <div className="relative h-full min-h-[350px] lg:min-h-0 overflow-hidden">
              <Image decoding="async"
                src={storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671"}
                alt="Academy Life"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Direct Route Dispatch</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white leading-tight">
                    {storeFormData?.name || "EduLearn"} <br />
                    <span className="text-white/60 font-light italic">Global Community.</span>
                  </h3>
                </motion.div>
              </div>
            </div>

            {/* Right Side: The "Action Contact Terminal" */}
            <div className="bg-gray-900 p-10 lg:p-16 flex flex-col justify-center relative min-h-[500px]">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div
                    key="contact-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                      <SparklesIcon className="w-4 h-4" style={{ color: accentColor }} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Secure Communication Hub</span>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-[1.1]">
                      Ready to <span style={{ color: primaryColor }}>Transform</span> Your Career?
                    </h2>

                    <p className="text-gray-400 text-sm mb-8 font-light leading-relaxed">
                      Transmit your details below to sync with academic planners, schedule a workspace demo, or lock in curriculum tracks.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Name & Email Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          <input 
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Operator Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 transition-all"
                            style={{ ['--tw-ring-color' as any]: primaryColor }}
                          />
                        </div>

                        <div className="relative">
                          <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                          <input 
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Node Address"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 transition-all"
                            style={{ ['--tw-ring-color' as any]: primaryColor }}
                          />
                        </div>
                      </div>

                      {/* Course / Program Focus Selector */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 ml-1">
                          <AcademicCapIcon className="h-3.5 w-3.5" style={{ color: accentColor }} />
                          Select Track Program
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {INQUIRY_TRACKS.map((track) => {
                            const isSelected = activeTrack === track.id;
                            return (
                              <button
                                key={track.id}
                                type="button"
                                onClick={() => setActiveTrack(track.id)}
                                className="py-2.5 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all text-center relative overflow-hidden"
                                style={{
                                  borderColor: isSelected ? primaryColor : 'rgba(255,255,255,0.1)',
                                  backgroundColor: isSelected ? `${primaryColor}15` : 'transparent',
                                  color: isSelected ? '#ffffff' : '#9ca3af'
                                }}
                              >
                                {track.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message Box */}
                      <div className="relative">
                        <ChatBubbleLeftRightIcon className="absolute left-4 top-4 h-4 w-4 text-gray-500 pointer-events-none" />
                        <textarea 
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="What would you like to achieve?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 transition-all resize-none"
                          style={{ ['--tw-ring-color' as any]: primaryColor }}
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Transmit Uplink
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                      
                      <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
                        High-value communication. Zero spam vectors.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                      <CheckBadgeIcon className="w-10 h-10 text-emerald-400 animate-pulse" />
                    </div>
                    
                    <div className="space-y-3 max-w-sm">
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Transmission Verified</h3>
                      <p className="text-sm text-gray-400 leading-relaxed font-light">
                        Telemetry routed. Our team will establish an interface track with you at <span className="text-white font-semibold underline underline-offset-4">{formData.email}</span> within 12 hours.
                      </p>
                    </div>

                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left font-mono text-[10px] text-gray-400 space-y-1 max-w-xs">
                      <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Route Metadata</p>
                      <p><span className="text-white/60">OPERATOR:</span> {formData.name.toUpperCase()}</p>
                      <p><span className="text-white/60">PROGRAM_TRACK:</span> {activeTrack.toUpperCase()}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-mono uppercase tracking-widest transition-colors hover:underline underline-offset-4"
                      style={{ color: primaryColor }}
                    >
                      Establish New Connection
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}