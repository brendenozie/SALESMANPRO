"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon, 
  EyeIcon, 
  ShareIcon,
  TrashIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const FingerprintIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>  
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-2.567a9.041 9.041 0 011.712 6.479M5.636 8.567a9.041 9.041 0 00-1.712 6.479m11.356-2.567c-.806 1.023-1.384 2.162-1.384 3.567m0 0a9.041 9.041 0 01-7.5 0m1.384-3.567c0-1.405-.578-2.544-1.384-3.567" />
  </svg>
);

const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = useState("collection");

  const dataPoints = [
    { title: "Personal Data", desc: "Name, email, and billing address used for account identity.", icon: <FingerprintIcon className="w-6 h-6" /> },
    { title: "Usage Data", desc: "IP addresses, browser types, and store interaction logs.", icon: <EyeIcon className="w-6 h-6" /> },
    { title: "Device Info", desc: "Operating systems and unique device identifiers for security.", icon: <LockClosedIcon className="w-6 h-6" /> },
  ];

  return (
    
        <MainLayout>
              <div className="flex flex-col overflow-x-hidden"> 
                <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20 px-6">
                  <div className="max-w-7xl mx-auto">
                    
                    {/* Hero Section */}
                    <header className="mb-20 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                          <LockClosedIcon className="w-4 h-4" />
                          <span>Your Data is Encrypted</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
                          Privacy <span className="text-emerald-600">First.</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                          At SalesmanPro, we believe your data belongs to you. This policy outlines exactly how we handle your information with total transparency.
                        </p>
                      </motion.div>
                    </header>

                    {/* Data Breakdown Bento */}
                    <section className="grid md:grid-cols-3 gap-6 mb-24">
                      {dataPoints.map((point, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center"
                        >
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-6">
                            {point.icon}
                          </div>
                          <h3 className="text-xl font-bold mb-3 dark:text-white">{point.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{point.desc}</p>
                        </motion.div>
                      ))}
                    </section>

                    {/* Detailed Content with Sticky Nav */}
                    <div className="grid lg:grid-cols-12 gap-16 border-t border-slate-100 dark:border-slate-900 pt-20">
                      <aside className="lg:col-span-4">
                        <div className="sticky top-32">
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Principles</h3>
                          <ul className="space-y-6">
                            {[
                              { id: "collection", title: "Data Collection", icon: <EyeIcon className="w-5 h-5" /> },
                              { id: "sharing", title: "Third-Party Sharing", icon: <ShareIcon className="w-5 h-5" /> },
                              { id: "security", title: "Security Protocols", icon: <LockClosedIcon className="w-5 h-5" /> },
                              { id: "rights", title: "Your Rights & Deletion", icon: <TrashIcon className="w-5 h-5" /> },
                            ].map((item) => (
                              <li 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-4 cursor-pointer font-bold transition-all ${
                                  activeTab === item.id ? "text-emerald-600 translate-x-2" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                                }`}
                              >
                                {item.icon}
                                {item.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </aside>

                      <main className="lg:col-span-8 prose prose-slate dark:prose-invert max-w-none">
                        <div className="space-y-16 text-slate-600 dark:text-slate-400">
                          <section id="collection">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">How We Collect Data</h2>
                            <p>
                              We collect information you provide directly to us when you create an account, create a store, or contact support. This includes basic contact information and business details necessary for the SalesmanPro platform to function.
                            </p>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-4">
                              <ArrowsRightLeftIcon className="w-6 h-6 text-emerald-600 shrink-0" />
                              <p className="m-0 text-sm text-emerald-800 dark:text-emerald-300">
                                <strong>Note:</strong> We never sell your personal data to advertisers or third-party data brokers. Period.
                              </p>
                            </div>
                          </section>

                          <section id="sharing">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Third-Party Sharing</h2>
                            <p>
                              We only share your data with essential service providers who help us run our platform, such as:
                            </p>
                            <ul>
                              <li><strong>Payment Processors:</strong> To handle secure billing (e.g., Stripe).</li>
                              <li><strong>Cloud Infrastructure:</strong> To host your data securely (e.g., AWS/Vercel).</li>
                              <li><strong>Email Services:</strong> To send you system updates and alerts.</li>
                            </ul>
                          </section>

                          <section id="rights">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Your Rights & Deletion</h2>
                            <p>
                              You have the right to access, export, or delete your personal data at any time. If you choose to close your account, we will purge all associated data from our active databases within 30 days.
                            </p>
                            <button className="not-prose mt-4 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all">
                              Request Data Export
                            </button>
                          </section>
                        </div>
                      </main>
                    </div>

                    {/* Legal Footer Section */}
                    <footer className="mt-32 p-12 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
                      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                        <div>
                          <h3 className="text-3xl font-bold mb-4">GDPR & CCPA Compliant</h3>
                          <p className="text-slate-400">We adhere to the highest global standards for data protection and privacy rights.</p>
                        </div>
                        <div className="flex md:justify-end gap-4">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xs">GDPR</div>
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xs">CCPA</div>
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xs">SSL</div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px]" />
                    </footer>

                  </div>
                </div>
              </div>
        </MainLayout>
  );
};

export default PrivacyPolicy;