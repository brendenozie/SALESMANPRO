"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  RocketLaunchIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const CATEGORIES = [
  { title: "Getting Started", icon: <RocketLaunchIcon />, count: "12 articles", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Account & Access", icon: <UserCircleIcon />, count: "8 articles", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Billing & Plans", icon: <CreditCardIcon />, count: "15 articles", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { title: "Security & Privacy", icon: <ShieldCheckIcon />, count: "10 articles", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { title: "Advanced API", icon: <AcademicCapIcon />, count: "24 articles", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  { title: "Store Setup", icon: <ChatBubbleLeftRightIcon />, count: "18 articles", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
];

const HelpCenter = () => {
  return (
    
    <MainLayout>
          <div className="flex flex-col overflow-x-hidden"> 
            <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pt-32 pb-20 px-6">
              <div className="max-w-6xl mx-auto">
                
                {/* Hero Search Section */}
                <section className="text-center mb-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
                      How can we <span className="text-orange-600">help?</span>
                    </h1>
                    
                    <div className="relative max-w-2xl mx-auto group">
                      <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search for articles, guides, and tutorials..."
                        className="w-full pl-16 pr-6 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl outline-none focus:ring-4 ring-orange-500/10 transition-all text-lg"
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
                      <span>Popular:</span>
                      <button className="text-orange-600 hover:underline">Setting up CNAME</button>
                      <button className="text-orange-600 hover:underline">Resetting Secret Key</button>
                      <button className="text-orange-600 hover:underline">Migration Guide</button>
                    </div>
                  </motion.div>
                </section>

                {/* Category Bento Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                  {CATEGORIES.map((cat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-orange-500/30 transition-all cursor-pointer group"
                    >
                      <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                        {React.cloneElement(cat.icon as React.ReactElement, { className: "w-8 h-8" })}
                      </div>
                      <h3 className="text-xl font-bold dark:text-white mb-2">{cat.title}</h3>
                      <p className="text-slate-500 text-sm mb-6">{cat.count}</p>
                      <div className="flex items-center text-orange-600 font-bold text-sm">
                        Explore Topics
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Support Options Bento */}
                <section className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div className="relative z-10">
                      <h3 className="text-3xl font-bold mb-4">Still stuck? Chat with us.</h3>
                      <p className="text-slate-400 max-w-md">
                        Our support team is online and ready to help you with technical issues or account questions.
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                      <button className="px-8 py-4 bg-orange-600 rounded-2xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-900/20">
                        Start Live Chat
                      </button>
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                        Wait time: ~2 mins
                      </div>
                    </div>
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px]" />
                  </div>

                  <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10">
                    <h3 className="text-xl font-bold dark:text-white mb-6">System Status</h3>
                    <div className="space-y-4">
                      {[
                        { name: "API Gateway", status: "Operational" },
                        { name: "Admin Console", status: "Operational" },
                        { name: "Store Hosting", status: "Operational" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <span className="text-sm font-medium dark:text-slate-300">{s.name}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black uppercase text-emerald-600">{s.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-3 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
                      Full Status Page
                    </button>
                  </div>
                </section>

              </div>
            </div>
          </div>
    </MainLayout>
  );
};

export default HelpCenter;