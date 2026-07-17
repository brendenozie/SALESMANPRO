'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  CheckCircleIcon, 
  FireIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CheckBadgeIcon,
  BellAlertIcon,
  UserIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  CpuChipIcon
} from '@heroicons/react/24/solid';

const DISPATCH_CLASSIFICATIONS = [
  { id: 'tuning', code: '01', label: 'Dyno Tuning' },
  { id: 'parts', code: '02', label: 'OEM Sourcing' },
  { id: 'build', code: '03', label: 'Custom Build' },
  { id: 'general', code: '04', label: 'Pit Support' }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

export default function AutomotiveDispatchSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red
  
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  const [activeClassification, setActiveClassification] = useState('tuning');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

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

  const resetTerminal = () => {
    setFormData({ name: '', email: '', message: '' });
    setActiveClassification('tuning');
    setStatus('idle');
    setSubmitStatus('idle');
  };

  return (
    <section 
      className="relative py-32 md:py-40 px-6 overflow-hidden bg-zinc-50 dark:bg-[#09090b] cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- AUTOMOTIVE TELEMETRY CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ translateX: cursorX, translateY: cursorY, left: -24, top: -24 }}
            className="pointer-events-none absolute z-50 flex items-center justify-center mix-blend-difference dark:mix-blend-normal"
          >
            {/* RPM Dial Cursor Design */}
            <div className="relative w-12 h-12 rounded-full border-2 border-white/50 dark:border-zinc-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ borderColor: primaryColor }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-transparent"
                style={{ borderTopColor: primaryColor }}
              />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="relative bg-white dark:bg-[#0c0c0e] rounded-[2rem] md:rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 md:p-16 lg:p-24 overflow-hidden"
        >
          {/* Background Carbon & Speed Textures */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]" />
          
          {/* Ambient Redline Glow */}
          <div 
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
            
            {/* Left Content: The Pitch (6/12 Columns) */}
            <div className="lg:col-span-6 space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-white">
                <BellAlertIcon className="w-4 h-4 animate-bounce" style={{ color: primaryColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">
                  Pit Crew Dispatch
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">
                Join The <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                  Starting Grid
                </span>
              </h2>
              
              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed uppercase tracking-widest">
                Initiate a custom build request, coordinate parts logistics, or sync directly with our performance calibrators.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                {[
                  { title: 'Early OEM Sourcing', desc: 'Secure hardware access' },
                  { title: 'Performance Calibrations', desc: 'Symmetric dyno-mapping' },
                  { title: 'Priority Pit Crew Support', desc: 'Under 24 hour SLA dispatch' },
                  { title: 'Telemetry Logs', desc: 'Direct secure system transmission' }
                ].map((item) => (
                  <div key={item.title} className="space-y-1 group">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-850 group-hover:scale-110 transition-transform">
                        <CheckCircleIcon className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{item.title}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono ml-8 uppercase tracking-widest">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content: The Ignition Form Terminal (6/12 Columns) */}
            <div className="lg:col-span-6 relative w-full">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-[2.5rem] opacity-50 blur-xl -z-10" />
              
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="p-8 md:p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl relative overflow-hidden group"
                  >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor }} />

                    <div className="flex justify-between items-center mb-8">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-750" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-750" />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-widest">
                        SECURE_DISPATCH://PORT-9000
                      </span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Name & Email Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                            <UserIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                            Driver Signature
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="OPERATOR SIGNATURE"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-250 dark:border-zinc-800 rounded-xl py-4 px-5 text-zinc-900 dark:text-white font-mono text-xs outline-none transition-all focus:border-transparent focus:ring-2"
                            style={{ 
                              '--tw-ring-color': primaryColor, 
                              caretColor: primaryColor 
                            } as React.CSSProperties}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                            <EnvelopeIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                            Comms Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="DRIVER@GARAGE.COM"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-250 dark:border-zinc-800 rounded-xl py-4 px-5 text-zinc-900 dark:text-white font-mono text-xs outline-none transition-all focus:border-transparent focus:ring-2"
                            style={{ 
                              '--tw-ring-color': primaryColor, 
                              caretColor: primaryColor 
                            } as React.CSSProperties}
                          />
                        </div>
                      </div>

                      {/* Performance Classification Grid Selector */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                          <WrenchScrewdriverIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                          Performance Classification
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {DISPATCH_CLASSIFICATIONS.map((opt) => {
                            const isSelected = activeClassification === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setActiveClassification(opt.id)}
                                className="p-3 border-2 rounded-xl text-left font-mono transition-all relative overflow-hidden group/btn"
                                style={{
                                  borderColor: isSelected ? primaryColor : '#e4e4e7', // Tailwind zinc-200
                                  backgroundColor: isSelected ? `${primaryColor}10` : 'transparent'
                                }}
                              >
                                <span 
                                  className="text-[9px] font-black block transition-colors"
                                  style={{ color: isSelected ? primaryColor : '#71717a' }}
                                >
                                  {opt.code} // {opt.label.toUpperCase()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Engine Payload Textarea */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">
                          <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                          Engine Payload Specs (Message)
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="ENTER TRANSMISSION SPECIFICS OR SYSTEM PARAMETERS..."
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-250 dark:border-zinc-800 rounded-xl py-4 px-5 text-zinc-900 dark:text-white font-mono text-xs outline-none transition-all focus:border-transparent focus:ring-2 resize-none"
                          style={{ 
                            '--tw-ring-color': primaryColor, 
                            caretColor: primaryColor 
                          } as React.CSSProperties}
                        />
                      </div>

                      {/* Submit Motion Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-5 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: primaryColor,
                          boxShadow: `0 4px 20px -2px ${primaryColor}40`
                        }}
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <FireIcon className="w-5 h-5" />
                            Ignite Engine
                          </>
                        )}
                      </motion.button>
                      
                      <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                        Zero spam. End-to-end encrypted telemetry dispatch.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 md:p-16 rounded-3xl text-center relative overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_11px)]" />
                    
                    <div className="relative z-10 flex flex-col items-center text-white">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                        <CheckBadgeIcon className="w-12 h-12" style={{ color: primaryColor }} />
                      </div>
                      
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-3 drop-shadow-md">
                        Clear to Race
                      </h3>
                      <p className="font-bold uppercase text-xs tracking-widest text-white/90 mb-8 max-w-xs leading-relaxed">
                        Driver logged. Signal packet successfully routed to tuning headquarters.
                      </p>

                      <div className="w-full bg-black/10 border border-black/15 rounded-xl p-5 text-left font-mono text-[10px] space-y-1.5 max-w-sm mb-8 backdrop-blur-sm">
                        <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">Telemetry Routing Ticket</p>
                        <p className="truncate"><span className="opacity-60">OPERATOR:</span> {formData.name.toUpperCase()}</p>
                        <p className="truncate"><span className="opacity-60">CLASSIFICATION:</span> {activeClassification.toUpperCase()}</p>
                        <p className="truncate"><span className="opacity-60">IP/EMAIL:</span> {formData.email.toUpperCase()}</p>
                      </div>

                      <button
                        type="button"
                        onClick={resetTerminal}
                        className="text-[10px] font-black uppercase tracking-widest text-white hover:underline underline-offset-4"
                      >
                        Launch New Telemetry Track
                      </button>
                    </div>
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