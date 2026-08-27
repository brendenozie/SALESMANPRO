"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';

interface ProfessionalCTAProps {
  storeFormData?: any;
}

const PROGRAM_COHORTS = [
  { id: 'exec', code: 'EXEC-ED', label: 'Executive' },
  { id: 'tech', code: 'TECH-CORE', label: 'Engineering' },
  { id: 'research', code: 'RES-INIT', label: 'Research' }
];

export default function ProfessionalCTA({ storeFormData: propStoreFormData }: ProfessionalCTAProps) {
  const { storeFormData: contextStoreFormData } = useStoreContext() || {};
  const storeData = propStoreFormData || contextStoreFormData;
  
  const primaryColor = storeData?.themeSettings?.primaryColor || '#1e40af';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [activeCohort, setActiveCohort] = useState('exec');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

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
                        body: JSON.stringify({ companyId: storeData?.id, content: formattedContent }),
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
    setActiveCohort('exec');
    setStatus('idle');
  };

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden font-sans">
      {/* Background Structural Detail */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 dark:bg-zinc-900/40 -z-10" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 border border-gray-800 shadow-[40px_40px_0px_rgba(0,0,0,0.05)]"
        >
          <div className="grid lg:grid-cols-12 items-stretch">
            
            {/* Left Side: The Executive Invitation (7 Columns) */}
            <div className="lg:col-span-7 p-10 lg:p-20 relative overflow-hidden flex flex-col justify-between">
              {/* Subtle Texture Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                style={{ 
                  backgroundImage: `radial-gradient(${primaryColor} 1.5px, transparent 1.5px)`, 
                  backgroundSize: '24px 24px' 
                }} 
              />
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 space-y-12"
              >
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">
                    Admissions 2026/27
                  </span>
                </div>
                
                <h2 className="text-5xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tighter">
                  Secure your place in the <br />
                  <span className="text-gray-500 italic font-light">next cohort.</span>
                </h2>

                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div className="flex items-center gap-3 text-gray-400 border-l border-gray-800 pl-6">
                    <ShieldCheckIcon className="w-5 h-5" style={{ color: primaryColor }} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Verified Institution
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Social Proof Cohort Avatars */}
              <div className="mt-16 pt-8 border-t border-gray-800/60 flex items-center gap-5 relative z-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 border-2 border-gray-900 overflow-hidden grayscale contrast-125">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 15}`} 
                        alt="Cohort Candidate" 
                        width={40} 
                        height={40} 
                        loader={({ src }) => src} 
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Joined by 2.4k+ Global Professionals
                </p>
              </div>
            </div>

            {/* Right Side: Interactive Inquiry Terminal (5 Columns) */}
            <div className="lg:col-span-5 p-10 lg:p-16 bg-white/5 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col justify-center relative min-h-[550px]">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div
                    key="inquiry-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Executive Inquiry</h3>
                      <p className="text-gray-500 text-xs leading-relaxed font-medium uppercase tracking-wider">
                        Initiate correspondence with institutional program coordinators.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Name Line Input */}
                      <div className="relative border-b border-gray-700 pb-1 group focus-within:border-white transition-colors">
                        <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your Professional Name" 
                          className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-gray-700 focus:outline-none text-xs uppercase tracking-wider font-mono"
                        />
                      </div>

                      {/* Email Line Input */}
                      <div className="relative border-b border-gray-700 pb-1 group focus-within:border-white transition-colors">
                        <EnvelopeIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Professional Email Address" 
                          className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-gray-700 focus:outline-none text-xs uppercase tracking-wider font-mono"
                        />
                      </div>

                      {/* Cohort Code Selectors */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">
                          Target Curriculum Track
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {PROGRAM_COHORTS.map((cohort) => {
                            const isSelected = activeCohort === cohort.id;
                            return (
                              <button
                                key={cohort.id}
                                type="button"
                                onClick={() => setActiveCohort(cohort.id)}
                                className="py-2.5 px-2 border text-[9px] font-mono uppercase tracking-wider text-center transition-all"
                                style={{
                                  borderColor: isSelected ? primaryColor : '#374151', // gray-700
                                  color: isSelected ? '#ffffff' : '#6b7280', // gray-500
                                  backgroundColor: isSelected ? `${primaryColor}15` : 'transparent'
                                }}
                              >
                                {cohort.code}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message Input Payload */}
                      <div className="relative border-b border-gray-700 pb-1 group focus-within:border-white transition-colors">
                        <ChatBubbleBottomCenterTextIcon className="absolute left-0 top-3 h-4 w-4 text-gray-600" />
                        <textarea 
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Inquiry Specifications / Objectives" 
                          className="w-full bg-transparent py-3 pl-7 text-white placeholder:text-gray-700 focus:outline-none text-xs uppercase tracking-wider font-mono resize-none"
                        />
                      </div>

                      {/* Submit Frame */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {status === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Transmit Uplink
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="text-center flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircleIcon className="h-10 w-10 text-emerald-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">Transmission Verified</h3>
                      <p className="text-xs text-gray-500 leading-relaxed font-mono uppercase">
                        Secure routing synchronized. Our admissions coordinator will reach you at <span className="text-white underline underline-offset-4">{formData.email.toLowerCase()}</span> within 12 business hours.
                      </p>
                    </div>

                    <div className="w-full bg-white/5 border border-gray-800 p-4 text-left font-mono text-[9px] text-gray-400 space-y-1.5">
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Routing Ticket Information</p>
                      <p><span className="text-white/60">CANDIDATE:</span> {formData.name.toUpperCase()}</p>
                      <p><span className="text-white/60">TRACK_ID:</span> {activeCohort.toUpperCase()}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Initialize New Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}