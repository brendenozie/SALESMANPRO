'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const PRIMAL_CUTS = [
  { id: 'ribeye', label: 'Prime Ribeye' },
  { id: 'tomahawk', label: 'Tomahawk' },
  { id: 'tbone', label: 'Dry-Aged T-Bone' },
  { id: 'custom', label: 'Custom Spec' }
];

function ButcheryCTA() {
  const [selectedCut, setSelectedCut] = useState('ribeye');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'transmitting' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;

    setStatus('transmitting');

    try {
      // Package submission payload
      const payload = {
        ...formData,
        cutType: selectedCut,
      };

      // Simulate secure order transmission to your back-end / messaging routes
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
    } catch (error) {
      console.error('Order dispatch failed:', error);
      setStatus('idle');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', contact: '', notes: '' });
    setSelectedCut('ribeye');
    setStatus('idle');
  };

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-stone-950 rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)]">
          
          {/* Subtle Industrial Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="industrialGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#industrialGrid)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* --- LEFT: The Hook (5/12 Columns) --- */}
            <div className="p-12 md:p-20 lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 mb-10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Limited Prime Stock</span>
              </motion.div>

              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-10">
                Secure Your <br /> 
                <span className="italic font-serif font-light text-red-600">Next Cut</span> <br /> 
                Today.
              </h2>

              <p className="text-stone-400 text-base mb-10 max-w-sm leading-relaxed font-medium">
                Whether you're stocking your home freezer or sourcing for a five-star kitchen, our master butchers are ready to prep your order to custom weight and aging guidelines.
              </p>
            </div>

            {/* --- RIGHT: Functional Form Area (7/12 Columns) --- */}
            <div className="p-12 md:p-20 lg:col-span-7 bg-stone-900/30 border-t lg:border-t-0 lg:border-l border-white/5 relative min-h-[500px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {status !== 'success' ? (
                  <motion.form
                    key="butchery-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Interactive Selection: Primal Cuts */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                        1. Select Primal Blueprint
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRIMAL_CUTS.map((cut) => {
                          const active = selectedCut === cut.id;
                          return (
                            <button
                              key={cut.id}
                              type="button"
                              onClick={() => setSelectedCut(cut.id)}
                              className={`px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all border ${
                                active 
                                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10' 
                                  : 'bg-stone-950/60 text-stone-400 border-stone-800/80 hover:border-stone-700 hover:text-stone-200'
                              }`}
                            >
                              {cut.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs Block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Brenden"
                          className="w-full bg-stone-950/80 border border-stone-800/80 rounded-xl px-5 py-4 text-white placeholder:text-stone-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 text-sm tracking-wide transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                          Contact (Phone or Email)
                        </label>
                        <input
                          type="text"
                          name="contact"
                          required
                          value={formData.contact}
                          onChange={handleChange}
                          placeholder="e.g. +254 700..."
                          className="w-full bg-stone-950/80 border border-stone-800/80 rounded-xl px-5 py-4 text-white placeholder:text-stone-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 text-sm tracking-wide transition-all"
                        />
                      </div>
                    </div>

                    {/* Special Instructions (Age, Weight, Trim) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                        Preparation Notes (Weight, Thickness, Aging Preference)
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="e.g. 2.5kg thickness, dry-aged preferred. Vacuum-sealed..."
                        className="w-full bg-stone-950/80 border border-stone-800/80 rounded-xl px-5 py-4 text-white placeholder:text-stone-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/30 text-sm tracking-wide transition-all resize-none"
                      />
                    </div>

                    {/* Industrial Styled Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={status === 'transmitting'}
                        className="w-full flex items-center justify-center gap-4 bg-white text-stone-950 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBagIcon className="w-5 h-5" />
                        {status === 'transmitting' ? 'Transmitting Request...' : 'Send Pre-Order Request'}
                        <ArrowRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-receipt"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-8"
                  >
                    <div className="inline-flex p-6 bg-red-600/10 rounded-full border border-red-600/20">
                      <CheckCircleIcon className="w-12 h-12 text-red-500 stroke-[1.5]" />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-white tracking-tight">Request Transmitted</h3>
                      <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                        Your custom profile for <span className="text-red-500 font-bold">{PRIMAL_CUTS.find(c => c.id === selectedCut)?.label}</span> has been secure-routed directly to the chopping block.
                      </p>
                    </div>

                    <div className="bg-stone-950 border border-white/5 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-2">
                      <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Routing Ticket</p>
                      <p className="text-xs text-white font-medium">Recipient: <span className="text-stone-300">{formData.name}</span></p>
                      <p className="text-xs text-white font-medium">Channel: <span className="text-stone-300">{formData.contact}</span></p>
                    </div>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[10px] font-bold text-red-500 hover:text-white uppercase tracking-widest transition-colors underline underline-offset-8"
                    >
                      Establish New Cut Blueprint
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* --- Footer Details --- */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-12 px-6">
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 text-stone-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all duration-500">
              <MapPinIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Our Butchery Hub</p>
              <p className="font-bold text-stone-900 dark:text-white">Industrial Area, Block G-12</p>
            </div>
          </div>

          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 text-stone-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all duration-500">
              <CalendarDaysIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Pre-Order Schedule</p>
              <p className="font-bold text-stone-900 dark:text-white">Catalog Updated Every 6 AM</p>
            </div>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-stone-300 dark:text-stone-700 font-serif italic text-2xl tracking-tighter leading-tight">
              Crafting the standard <br /> for Kenyan kitchens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ButcheryCTA;