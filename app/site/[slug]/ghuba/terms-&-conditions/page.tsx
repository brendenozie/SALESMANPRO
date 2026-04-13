"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ScaleIcon, 
  ExclamationTriangleIcon,
  CreditCardIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: DocumentTextIcon,
    content: "By accessing or using the Ghuba Marketplace, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using our services. These terms apply to all visitors, users, and vendors.",
    summary: "Using Ghuba means you agree to our rules. Read them carefully."
  },
  {
    id: "accounts",
    title: "2. User Accounts",
    icon: ShieldCheckIcon,
    content: "When you create an account, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account and for keeping your password secure. We reserve the right to suspend accounts that provide false information.",
    summary: "Keep your info accurate and your password safe. Your account is your responsibility."
  },
  {
    id: "payments",
    title: "3. Payments & Fees",
    icon: CreditCardIcon,
    content: "All prices are listed in Kenyan Shillings (KES) unless otherwise stated. Ghuba uses secure third-party payment processors. By purchasing, you authorize us to charge your selected payment method for the total amount of your order, including VAT and shipping fees.",
    summary: "Prices are in KES. We use secure payments. Shipping and taxes are calculated at checkout."
  },
  {
    id: "shipping",
    title: "4. Shipping & Returns",
    icon: TruckIcon,
    content: "Delivery timelines are estimates. Ghuba is not liable for delays caused by third-party couriers. Returns are accepted within 7 days of delivery for eligible items in original condition. Perishable goods and intimate apparel are non-returnable.",
    summary: "We ship fast, but delays happen. You have 7 days to return eligible items."
  },
  {
    id: "liability",
    title: "5. Limitation of Liability",
    icon: ScaleIcon,
    content: "Ghuba provides a platform for buyers and sellers. We are not responsible for the quality, safety, or legality of items advertised by third-party vendors. To the maximum extent permitted by law, Ghuba shall not be liable for any indirect or consequential damages.",
    summary: "We facilitate the market but aren't liable for third-party vendor errors."
  }
];

export default function GhubaTermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER --- */}
        <header className="mb-16 border-b border-slate-100 dark:border-slate-800 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Legal <span className="text-indigo-500">Terms.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Last Updated: April 13, 2026 • Effective Immediately
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* --- SIDEBAR NAVIGATION --- */}
          <aside className="lg:col-span-4 sticky top-32 h-fit space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Sections</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full text-left px-6 py-4 rounded-2xl transition-all flex items-center gap-4 ${
                  activeSection === section.id 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500"
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="text-sm">{section.title}</span>
              </button>
            ))}
            
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-bold text-sm">Need Help?</span>
              </div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/60 leading-relaxed">
                If you have questions regarding our legal policies, please contact <a href="mailto:legal@ghuba.com" className="underline font-bold">legal@ghuba.com</a>.
              </p>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <section className="lg:col-span-8 space-y-24">
            {sections.map((section) => (
              <motion.div 
                key={section.id} 
                id={section.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-20% 0px -20% 0px" }}
                onViewportEnter={() => setActiveSection(section.id)}
                className="scroll-mt-32"
              >
                <div className="inline-block p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
                  <section.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-bold mb-6">{section.title}</h2>
                
                {/* TL;DR Summary Box */}
                <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-l-4 border-indigo-500">
                  <p className="text-sm italic text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-indigo-500 uppercase text-[10px] tracking-widest mr-2">Summary:</span>
                    {section.summary}
                  </p>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                  <p>{section.content}</p>
                </div>
              </motion.div>
            ))}
            
            {/* --- FINAL NOTICE --- */}
            <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-400 italic">
                Thank you for choosing Ghuba. We value your trust and are committed to protecting your rights as a user.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}