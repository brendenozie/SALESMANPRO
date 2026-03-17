"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  MapPinIcon,
  GlobeAltIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Add your logic here
  };

  return (    
    <MainLayout>
      <div className="flex flex-col overflow-x-hidden"> 
        <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-16">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="text-orange-600 font-black uppercase tracking-[0.2em] text-xs">Reach Out</span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mt-4 mb-6">
                      Let’s build <br /> <span className="text-slate-400">together.</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                      Have a technical question, a partnership idea, or just want to say hello? We’re listening.
                    </p>
                  </motion.div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left Side: Contact Form Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden"
                  >
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                            <input 
                              required
                              type="text" 
                              placeholder="Jane Doe" 
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 focus:border-orange-500 transition-all dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Work Email</label>
                            <input 
                              required
                              type="email" 
                              placeholder="jane@company.com" 
                              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 focus:border-orange-500 transition-all dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Inquiry Type</label>
                          <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 transition-all dark:text-white appearance-none">
                            <option>General Inquiry</option>
                            <option>Technical Support</option>
                            <option>Partnership & Sales</option>
                            <option>Billing Question</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Message</label>
                          <textarea 
                            required
                            rows={5} 
                            placeholder="Tell us about your project..." 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 ring-orange-500/50 focus:border-orange-500 transition-all dark:text-white resize-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="group w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          Send Message
                          <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                      </form>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-20 text-center flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                          <CheckCircleIcon className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 dark:text-white">Message Received!</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                          We've tagged your inquiry for priority review. Expect a response within 24 hours.
                        </p>
                        <button 
                          onClick={() => setSubmitted(false)}
                          className="text-orange-600 font-bold hover:underline"
                        >
                          Send another message
                        </button>
                      </motion.div>
                    )}

                    {/* Decorative Background Blob */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                  </motion.div>

                  {/* Right Side: Contact Info Bento */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Live Chat Tile */}
                    <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white flex items-center gap-6 group cursor-pointer transition-transform hover:scale-[1.02]">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <ChatBubbleLeftRightIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">Instant Support</h4>
                        <p className="text-indigo-100 text-sm">Average response: 2 mins</p>
                      </div>
                    </div>

                    {/* Grid of smaller tiles */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col justify-between h-48 transition-all hover:border-orange-500">
                        <EnvelopeIcon className="w-8 h-8 text-orange-600" />
                        <div>
                          <h4 className="font-bold dark:text-white">Email</h4>
                          <p className="text-sm text-slate-500">hello@salesmanpro.site</p>
                        </div>
                      </div>

                      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col justify-between h-48 transition-all hover:border-orange-500">
                        <GlobeAltIcon className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-bold dark:text-white">Social</h4>
                          <p className="text-sm text-slate-500">@salesmanpro_hq</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Tile */}
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col justify-between h-64 relative overflow-hidden group">
                      <MapPinIcon className="w-10 h-10 text-slate-500 mb-4" />
                      <div>
                          <h4 className="text-2xl font-bold">Global Presence</h4>
                          <p className="text-slate-400">Headquartered in Nairobi, Kenya.<br />Remote-first since 2024.</p>
                      </div>
                      {/* Minimalist Map UI Decor */}
                      <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 border-[10px] border-white/5 rounded-full" />
                    </div>

                  </div>
                </div>
              </div>
            </div>
        </div>
    </MainLayout>
  );
};

export default ContactUs;