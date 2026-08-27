"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  ShieldCheckIcon,
  CheckIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://127.0.0.1:3000/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err: any) {
          console.error('Contact Submission Error:', err);
          setStatus('error');
          setErrorMessage(err?.message || 'Inquiry delivery failed.');
        }
      };

  return (
    <section className="relative py-20 sm:py-28 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden border-t border-b border-neutral-200/60 dark:border-neutral-900/40">
      
      {/* Structural Background Adaptive Skew Accent */}
      <div 
        className="absolute top-0 right-0 w-full sm:w-1/3 h-full opacity-5 pointer-events-none skew-x-12 translate-x-32" 
        style={{ 
          background: `linear-gradient(90deg, transparent, ${primaryColor})` 
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Section Copy */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-3"
            >
              <span className="relative flex h-2 w-2">
                <span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }} />
              </span>
              <span className="font-black tracking-[0.35em] uppercase text-[10px]" style={{ color: primaryColor }}>
                Secure Transmission
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.9]"
            >
              Initiate <br /> 
              <span className="text-neutral-300 dark:text-neutral-900 transition-colors">Direct Contact</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-md mx-auto lg:mx-0 text-neutral-500 dark:text-neutral-400 font-medium text-xs sm:text-sm leading-relaxed uppercase tracking-wide"
            >
              Have custom architecture requirements, platform configurations, or strategic routing questions? Deploy a direct line to our systems deployment operators.
            </motion.p>
          </div>

          {/* RIGHT COLUMN: Stateful Contact Center */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group w-full lg:col-span-7"
          >
            {/* Dynamic Card Container Platform */}
            <div className="relative z-10 bg-white/95 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md transition-colors">
              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.form 
                    key="form-active"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 w-full"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name Input */}
                      <div className="relative flex items-center px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200/80 dark:border-neutral-800/80 focus-within:ring-1 transition-all" style={{ ['--tw-ring-color' as any]: primaryColor }}>
                        <UserIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500 mr-3" />
                        <input 
                          type="text" 
                          name="name"
                          required
                          placeholder="FULL NAME"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 dark:text-white font-bold tracking-wider text-xs uppercase w-full placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                        />
                      </div>

                      {/* Email Input */}
                      <div className="relative flex items-center px-4 py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200/80 dark:border-neutral-800/80 focus-within:ring-1 transition-all" style={{ ['--tw-ring-color' as any]: primaryColor }}>
                        <EnvelopeIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500 mr-3" />
                        <input 
                          type="email" 
                          name="email"
                          required
                          placeholder="EMAIL ADDRESS"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 dark:text-white font-bold tracking-wider text-xs uppercase w-full placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                        />
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="relative flex items-start p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200/80 dark:border-neutral-800/80 focus-within:ring-1 transition-all" style={{ ['--tw-ring-color' as any]: primaryColor }}>
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500 mr-3 mt-1" />
                      <textarea 
                        name="message"
                        required
                        rows={4}
                        placeholder="PROVIDE YOUR INQUIRY OR OPERATIONAL SUMS..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 dark:text-white font-bold tracking-wider text-xs uppercase w-full placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none min-h-[90px]"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={status === "loading"}
                      className="text-white font-black uppercase tracking-[0.15em] text-[11px] px-8 py-4 sm:py-4.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:opacity-90 w-full active:scale-[0.99]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing Dispatch
                        </span>
                      ) : (
                        <>
                          Transmit Secure intake <ArrowRightIcon className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4"
                  >
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="p-2 rounded-xl text-white shrink-0 shadow-sm" style={{ backgroundColor: primaryColor }}>
                        <CheckIcon className="h-5 w-5" strokeWidth={3} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase text-neutral-900 dark:text-white tracking-wider">Transmission Logged</h4>
                        <p className="text-[11px] font-bold uppercase text-neutral-400 dark:text-neutral-500 mt-0.5">Secure queue successfully generated.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStatus("idle")}
                      className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0"
                    >
                      Reset Intake
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Meta Badges */}
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-2 opacity-60 dark:opacity-40 transition-opacity px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-neutral-900 dark:text-white" />
                <span className="text-[9px] font-black text-neutral-900 dark:text-white uppercase tracking-[0.15em]">Encrypted Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-neutral-900 dark:bg-white" />
                <span className="text-[9px] font-black text-neutral-900 dark:text-white uppercase tracking-[0.15em]">SLA Responsive Frame</span>
              </div>
            </div>

            {/* Absolute Ambient Background Shadow Contour */}
            <div 
              className="absolute -inset-1.5 border opacity-10 dark:opacity-20 rounded-[22px] -z-10 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-500" 
              style={{ borderColor: primaryColor }}
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}