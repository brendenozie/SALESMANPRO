'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

export default function ContactSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  // Sourcing metadata dynamically from your global context where applicable
  const dynamicPhone = storeFormData?.contactPhone || '+1 (800) OPS-GEAR';
  const dynamicEmail = storeFormData?.contactEmail || 'support@storefront.io';
  const dynamicAddress = storeFormData?.address || 'Sector 7G, Neon District';

  const contactMethods = [
    { label: 'Voice Link', value: dynamicPhone, Icon: PhoneIcon },
    { label: 'Neural Mail', value: dynamicEmail, Icon: ChatBubbleLeftRightIcon },
    { label: 'HQ Base', value: dynamicAddress, Icon: MapPinIcon },
  ];

  // State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      // Simulate pipeline uplink delay. Replace with your custom endpoint if needed.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Uplink Interrupted. Signal connection failed.');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-[#050505] transition-colors duration-300 overflow-hidden border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4">
               <h2 className="text-6xl font-black text-black dark:text-white italic tracking-tighter uppercase leading-[0.85]">
                Direct <br /> <span style={{ color: primary }}>Uplink.</span>
              </h2>
              <p className="text-black/40 dark:text-white/30 text-xs font-bold uppercase tracking-widest">
                Transmission Status: <span className="text-emerald-500 animate-pulse">Online</span>
              </p>
            </div>

            <div className="space-y-6">
              {contactMethods.map((method, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group transition-all hover:bg-white dark:hover:bg-white/5 shadow-sm hover:shadow-md dark:shadow-none"
                >
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 group-hover:scale-110 transition-transform">
                    <method.Icon className="w-6 h-6" style={{ color: primary }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black/20 dark:text-white/20 uppercase tracking-widest">{method.label}</p>
                    <p className="text-black dark:text-white font-mono text-sm">{method.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Technical Support Form / Success View */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-12 rounded-[3rem] bg-zinc-50 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 relative overflow-hidden shadow-2xl dark:shadow-none min-h-[480px] flex flex-col justify-center">
              
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10">
                <CommandLineIcon className="w-24 h-24 text-black dark:text-white" />
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-6 relative z-10 py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">Transmission Secured</h3>
                      <p className="text-black/50 dark:text-white/40 text-xs font-mono max-w-sm mx-auto leading-relaxed">
                        Data packets successfully parsed and indexed. Your transmission has been queued on this frequency. An operator will respond shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      style={{ borderColor: primary, color: primary }}
                      className="px-6 py-3 rounded-2xl border font-mono text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      Establish New Connection
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 relative z-10" 
                    onSubmit={handleSubmit}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest ml-4">Identifier</label>
                        <input 
                          type="text" 
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="NAME" 
                          className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white text-xs font-mono focus:border-black/40 dark:focus:border-white/40 ring-0 transition-all outline-none placeholder:opacity-30" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest ml-4">Frequency</label>
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="EMAIL" 
                          className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white text-xs font-mono focus:border-black/40 dark:focus:border-white/40 ring-0 transition-all outline-none placeholder:opacity-30" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest ml-4">Message Transmission</label>
                      <textarea 
                        name="message"
                        required
                        rows={4} 
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="ENTER DATA..." 
                        className="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 text-black dark:text-white text-xs font-mono focus:border-black/40 dark:focus:border-white/40 ring-0 transition-all outline-none placeholder:opacity-30 resize-none" 
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full group relative flex items-center justify-center gap-4 bg-black dark:bg-white py-6 rounded-2xl overflow-hidden transition-all border border-black dark:border-white active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 text-white dark:text-black group-hover:text-white font-black uppercase tracking-[0.3em] text-xs transition-colors flex items-center gap-2">
                        {status === 'sending' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending Transmission...
                          </>
                        ) : (
                          'Send Transmission'
                        )}
                      </span>
                      {/* Hover Slide Effect */}
                      {status !== 'sending' && (
                        <div 
                          className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500" 
                          style={{ backgroundColor: primary }}
                        />
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}