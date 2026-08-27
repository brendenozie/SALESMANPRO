'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  MapPinIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const { storeFormData } = useStoreContext() || {};
  const { name, themeSettings } = storeFormData || { name: 'GLOBAL INSIGHTS', themeSettings: null };
  
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Asynchronous dispatch pipeline log placeholder
    console.log('Ingesting outbound communications transmission packet:', form);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setForm({ name: '', email: '', message: '' });
    }, 800);
  };

  if (!storeFormData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <p className="text-xs font-mono tracking-widest text-slate-600 uppercase animate-pulse">
          Initializing instance store data context...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-400 min-h-screen py-24 px-4 sm:px-6 lg:px-8 font-sans border-b border-slate-900 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* ===== STRUCTURAL ASYMMETRIC CONTENT MATRIX ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Instance Routing Info Metadata (5/12 Span) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  Communications Node
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase mb-4">
                Contact Us
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with the {name} team. Submit your integration queries, editorial feedback, or pipeline service requests directly to our gateway node.
              </p>
            </div>

            {/* Static System Indicators */}
            <div className="space-y-4 pt-6 border-t border-slate-900 text-xs font-mono">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">HQ Coordinate Context</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Nairobi, Kenya — Central Regional Office</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClockIcon className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-300 font-semibold uppercase tracking-wider text-[10px]">Operational Availability</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">MON - FRI // 08:00 - 17:00 (EAT)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Ingestion Transmission Form Panel (7/12 Span) */}
          <div className="lg:col-span-7 w-full">
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onSubmit={handleSubmit}
              className="bg-slate-950 border border-slate-900 rounded-lg p-6 sm:p-8 space-y-5 relative overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Input Frame */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                    Identity/Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full h-11 bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded px-3 placeholder-slate-700 focus:outline-none focus:border-slate-700 transition-colors"
                  />
                </div>

                {/* Email Input Frame */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                    Secure Email Token
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    className="w-full h-11 bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded px-3 placeholder-slate-700 focus:outline-none focus:border-slate-700 transition-colors"
                  />
                </div>
              </div>

              {/* Message Textarea Frame */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                  Message Payload Body
                </label>
                <textarea
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Type your communication transmission payload..."
                  className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded p-3 placeholder-slate-700 focus:outline-none focus:border-slate-700 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Action Button Pipeline Trigger */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded text-xs font-semibold text-slate-950 uppercase tracking-wider flex items-center justify-center gap-2 select-none active:scale-[0.99] transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? (
                    <span className="font-mono lowercase tracking-normal">Transmitting payload...</span>
                  ) : (
                    <>
                      <span>Dispatch Packet</span>
                      <PaperAirplaneIcon className="h-3.5 w-3.5 text-slate-950 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </motion.form>
          </div>

        </div>
      </div>
    </div>
  );
}