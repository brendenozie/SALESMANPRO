'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  CheckCircleIcon, 
  CpuChipIcon,
  CommandLineIcon,
  BoltIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';

const SIGNAL_TYPES = [
  { id: 'general', label: 'General Inquiry' },
  { id: 'integration', label: 'API / Systems Integration' },
  { id: 'hardware', label: 'Hardware Specs' },
  { id: 'incident', label: 'Security Emergency' }
];

export default function NetworkIntegrationSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Dynamic primary theme color
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [isHovering, setIsHovering] = useState(false);
  const [activeSignal, setActiveSignal] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 250 };
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
      if (!formData.name || !formData.email || !formData.message) return;
  
      setStatus('loading');
      setErrorMessage('');
  
      try {
        const response = await fetch('/api/conversations/send-to-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeId: storeFormData?._id || storeFormData?.id,
            ...formData,
          }),
        });
  
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || 'Failed to dispatch message. Please try again.');
        }
  
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } catch (err: any) {
        console.error('Contact Submission Error:', err);
        setStatus('error');
        setErrorMessage(err?.message || 'Inquiry delivery failed.');
      }
    };

  const resetTerminal = () => {
    setFormData({ name: '', email: '', message: '' });
    setActiveSignal('general');
    setStatus('idle');
  };

  return (
    <section 
      className="relative py-40 px-6 overflow-hidden bg-white dark:bg-[#050505] cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* --- TACTICAL HUD CURSOR --- */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ translateX: cursorX, translateY: cursorY, left: -32, top: -32 }}
            className="pointer-events-none absolute z-50 flex items-center justify-center"
          >
            <div 
              className="relative w-16 h-16 border rounded-full flex items-center justify-center transition-colors"
              style={{ borderColor: `${primary}80` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2" style={{ backgroundColor: primary }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2" style={{ backgroundColor: primary }} />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px" style={{ backgroundColor: primary }} />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px" style={{ backgroundColor: primary }} />
              <CommandLineIcon className="w-4 h-4 animate-pulse" style={{ color: primary }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative bg-zinc-900 dark:bg-black border-4 border-zinc-800 p-8 md:p-16 lg:p-24 overflow-hidden"
        >
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            
            {/* Left Content: The Mission (5/12 Columns) */}
            <div className="lg:col-span-5 space-y-10">
              <div className="flex items-center gap-4">
                <div className="h-px w-12" style={{ backgroundColor: primary }} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: primary }}>
                  Network Integration v2.6
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                Sync with the <br />
                <span className="text-transparent" style={{ WebkitTextStroke: `1px ${primary}` }}>Core System</span>
              </h2>
              
              <p className="text-lg text-zinc-400 font-bold max-w-xl leading-snug uppercase tracking-tighter">
                Direct route to central dispatch. Submit parameters to request custom architecture keys or initiate project clearance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Direct API Keys', 'Hardware Schematics', 'Regional Scaling', 'Security Patch Logs'].map((item) => (
                  <div key={item} className="flex items-center gap-4 group">
                    <CheckCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform flex-shrink-0" style={{ color: primary }} />
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content: Terminal-Style Interactive Contact Form (7/12 Columns) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.div 
                    key="terminal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 bg-black border-2 border-zinc-800 relative"
                    style={{ boxShadow: `20px 20px 0px 0px ${primary}` }}
                  >
                    {/* Top Window Headers */}
                    <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 tracking-wider">
                        SECURE_CHANNEL://PORT-8080
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Step 1: Selector Ribbon */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          1. Choose Signal Classification
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {SIGNAL_TYPES.map((type) => {
                            const isSelected = activeSignal === type.id;
                            return (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setActiveSignal(type.id)}
                                className="px-3 py-3 border text-[10px] font-mono font-bold tracking-tight uppercase text-left transition-all relative overflow-hidden"
                                style={{ 
                                  borderColor: isSelected ? primary : '#27272a',
                                  color: isSelected ? '#000000' : '#a1a1aa',
                                  backgroundColor: isSelected ? primary : 'transparent'
                                }}
                              >
                                {type.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: Metadata Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <UserIcon className="w-3 h-3" style={{ color: primary }} />
                            Operator Signature
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="OPERATOR NAME"
                            className="w-full bg-zinc-950 border border-zinc-800 py-4 px-5 text-white font-mono text-xs outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700"
                            style={{ caretColor: primary }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <EnvelopeIcon className="w-3 h-3" style={{ color: primary }} />
                            Transmission Comms IP / Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="ADMIN@SALESMANPRO.NET"
                            className="w-full bg-zinc-950 border border-zinc-800 py-4 px-5 text-white font-mono text-xs outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700"
                            style={{ caretColor: primary }}
                          />
                        </div>
                      </div>

                      {/* Step 3: Payload Textarea */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <ChatBubbleBottomCenterTextIcon className="w-3 h-3" style={{ color: primary }} />
                          Log Transmission Payload (Message)
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="ENTER SYSTEM PAYLOAD SPECIFICATIONS..."
                          className="w-full bg-zinc-950 border border-zinc-800 py-4 px-5 text-white font-mono text-xs outline-none transition-all focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700 resize-none"
                          style={{ caretColor: primary }}
                        />
                      </div>

                      {/* Step 4: Submission Action */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-5 text-black font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primary }}
                      >
                        {status === 'loading' ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <BoltIcon className="w-5 h-5" />
                            Launch System Sync
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-16 text-black text-center space-y-6"
                    style={{ backgroundColor: primary }}
                  >
                    <CpuChipIcon className="w-20 h-20 mx-auto mb-6 animate-pulse" />
                    
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter">Sync Succeeded</h3>
                      <p className="font-bold uppercase text-xs tracking-widest text-black/80">
                        Signal link established. Package routed to engineering hub.
                      </p>
                    </div>

                    <div className="bg-black/10 border border-black/10 rounded px-6 py-4 text-left font-mono text-xs max-w-sm mx-auto space-y-1">
                      <p className="text-[9px] font-black opacity-50 uppercase">Network Routing Ticket</p>
                      <p className="truncate">Identity: {formData.name}</p>
                      <p className="truncate">Classification: {activeSignal.toUpperCase()}</p>
                      <p className="truncate">Source: {formData.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={resetTerminal}
                      className="text-[10px] font-black uppercase tracking-widest text-black hover:underline underline-offset-4"
                    >
                      Establish New Sync Vector
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