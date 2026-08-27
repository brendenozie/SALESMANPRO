"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ScaleIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "account", title: "2. Account Responsibilities" },
  { id: "payments", title: "3. Fees and Payments" },
  { id: "content", title: "4. Intellectual Property" },
  { id: "termination", title: "5. Termination" },
  { id: "liability", title: "6. Limitation of Liability" },
];

const TOSPage = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

  return (
    
    <MainLayout>
          <div className="flex flex-col overflow-x-hidden"> 
            <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pt-32 pb-20 px-6">
              <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <header className="mb-16 border-b border-slate-200 dark:border-slate-800 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 text-orange-600 mb-4">
                      <ScaleIcon className="w-6 h-6" />
                      <span className="font-black uppercase tracking-widest text-sm">Legal Framework</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
                      Terms of <span className="text-slate-400">Service.</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                      Last Updated: March 15, 2026. Please read these terms carefully before using the SalesmanPro platform.
                    </p>
                  </motion.div>
                </header>

                <div className="grid lg:grid-cols-12 gap-12">
                  
                  {/* Left Sidebar: Navigation */}
                  <aside className="lg:col-span-4 hidden lg:block">
                    <div className="sticky top-32 space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Contents</p>
                      {SECTIONS.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            setActiveSection(section.id);
                          }}
                          className={classNames(
                            "w-full text-left px-4 py-3 rounded-xl font-bold transition-all",
                            activeSection === section.id 
                              ? "bg-white dark:bg-slate-900 text-orange-600 shadow-sm border border-slate-200 dark:border-slate-800" 
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                          )}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  </aside>

                  {/* Right Content: The Text */}
                  <main className="lg:col-span-8 space-y-20">
                    
                    {/* Section 1 */}
                    <section id="acceptance" className="scroll-mt-32">
                      <div className="p-6 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl mb-8">
                        <h4 className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold mb-2 text-sm">
                          <ShieldCheckIcon className="w-4 h-4" />
                          The Simple Version
                        </h4>
                        <p className="text-orange-900/70 dark:text-orange-300/70 text-sm leading-relaxed">
                          By using SalesmanPro, you're agreeing to our rules. If you don't agree, please don't use our tools. We update these terms occasionally, and your continued use means you accept the changes.
                        </p>
                      </div>
                      <h2 className="text-3xl font-black mb-6 dark:text-white">1. Acceptance of Terms</h2>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-loose">
                        <p>
                          By accessing or using the SalesmanPro platform ("Service"), provided by SalesmanPro Inc. ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service. This includes any additional terms and conditions and policies referenced herein and/or available by hyperlink.
                        </p>
                        <p>
                          Our Service is intended for business use. If you are entering into this agreement on behalf of a company, you represent that you have the authority to bind such entity to these terms.
                        </p>
                      </div>
                    </section>

                    {/* Section 2 */}
                    <section id="account" className="scroll-mt-32">
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl mb-8">
                        <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-2 text-sm">
                          <DocumentTextIcon className="w-4 h-4" />
                          The Simple Version
                        </h4>
                        <p className="text-blue-900/70 dark:text-blue-300/70 text-sm leading-relaxed">
                          Keep your password safe. You are responsible for everything that happens on your account. No illegal stuff, no hacking, and no impersonating others.
                        </p>
                      </div>
                      <h2 className="text-3xl font-black mb-6 dark:text-white">2. Account Responsibilities</h2>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-loose">
                        <p>
                          To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.
                        </p>
                        <ul>
                          <li>You are responsible for safeguarding your password.</li>
                          <li>You must notify us immediately of any unauthorized use of your account.</li>
                          <li>We reserve the right to refuse service or terminate accounts at our sole discretion.</li>
                        </ul>
                      </div>
                    </section>

                    {/* Section 6 - Warning Variation */}
                    <section id="liability" className="scroll-mt-32">
                      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl mb-8">
                        <h4 className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-2 text-sm">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          The Simple Version
                        </h4>
                        <p className="text-red-900/70 dark:text-red-300/70 text-sm leading-relaxed">
                          We try our best, but we aren't liable if your business loses money or if the service goes down briefly. Use SalesmanPro "as is."
                        </p>
                      </div>
                      <h2 className="text-3xl font-black mb-6 dark:text-white">6. Limitation of Liability</h2>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-loose">
                        <p>
                          IN NO EVENT SHALL SALESMANPRO, ITS DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, OR DATA.
                        </p>
                      </div>
                    </section>

                  </main>
                </div>

                {/* Bottom CTA */}
                <footer className="mt-32 p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center">
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">Still have questions?</h3>
                  <p className="text-slate-500 mb-8">Our legal team is happy to clarify any of these points.</p>
                  <button className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-transform">
                    Contact Support
                  </button>
                </footer>

              </div>
            </div>
          </div>
    </MainLayout>

  );
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default TOSPage;