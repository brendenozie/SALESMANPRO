"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EyeIcon, 
  LockClosedIcon, 
  UserCircleIcon, 
  ShareIcon,
  FingerPrintIcon,
  BellAlertIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

const policies = [
  {
    id: "collection",
    title: "Data We Collect",
    icon: FingerPrintIcon,
    content: "We collect information you provide directly to us (name, email, shipping address) and data generated automatically through your use of Ghuba (IP address, device type, browsing history). We also collect payment information through our PCI-compliant partners.",
  },
  {
    id: "usage",
    title: "How We Use Data",
    icon: EyeIcon,
    content: "Your data allows us to process orders, personalize your shopping experience, prevent fraudulent transactions, and send you updates about your delivery. We analyze aggregated data to improve our marketplace algorithms.",
  },
  {
    id: "sharing",
    title: "Third-Party Sharing",
    icon: ShareIcon,
    content: "We never sell your personal data. We only share information with essential partners: logistics providers for delivery, payment gateways for transactions, and analytics providers to help us fix bugs.",
  },
  {
    id: "rights",
    title: "Your Privacy Rights",
    icon: UserCircleIcon,
    content: "You have the right to access, correct, or delete your personal data at any time. You can also opt-out of marketing communications through your account settings or by clicking the 'unsubscribe' link in our emails.",
  },
  {
    id: "security",
    title: "Security Measures",
    icon: LockClosedIcon,
    content: "We use industry-standard AES-256 encryption for data at rest and TLS for data in transit. Our security team performs regular audits to ensure your 'digital vault' at Ghuba remains impenetrable.",
  }
];

export default function GhubaPrivacyPage() {
  const [openSection, setOpenSection] = useState<string | null>("collection");

  return (
    <main className="bg-[#fff] dark:bg-[#050505] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <section className="max-w-5xl mx-auto px-6">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-6"
          >
            <LockClosedIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Your Data is Secure</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Privacy is a <br />
            <span className="text-slate-400 italic">Human Right.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-light">
            At Ghuba, we believe in radical transparency. This policy explains exactly what happens to your data when you use our marketplace.
          </p>
        </div>

        {/* --- CORE PRINCIPLES (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <PrincipleCard 
            title="Zero Selling" 
            desc="We never sell your data to third-party advertisers." 
            icon={EyeIcon}
          />
          <PrincipleCard 
            title="Encryption" 
            desc="Military-grade security for every single transaction." 
            icon={FingerPrintIcon}
          />
          <PrincipleCard 
            title="Total Control" 
            desc="You decide what info we keep and what we delete." 
            icon={UserCircleIcon}
          />
        </div>

        {/* --- DETAILED ACCORDION --- */}
        <div className="space-y-4">
          {policies.map((policy) => (
            <div 
              key={policy.id}
              className="group border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/50 transition-all hover:border-slate-200 dark:hover:border-slate-700"
            >
              <button 
                onClick={() => setOpenSection(openSection === policy.id ? null : policy.id)}
                className="w-full flex items-center justify-between p-8 text-left"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl transition-colors ${openSection === policy.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <policy.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{policy.title}</h3>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openSection === policy.id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openSection === policy.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 pt-0 ml-[88px] pr-12">
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light text-lg">
                        {policy.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* --- UPDATES NOTICE --- */}
        <motion.div 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          className="mt-20 p-10 rounded-[3rem] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="p-5 bg-indigo-500 rounded-[2rem] shadow-lg shadow-indigo-500/40">
            <BellAlertIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">Stay Informed</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We update this policy periodically to reflect changes in Kenyan data protection laws (ODPC). We will notify you via your registered email of any significant changes.
            </p>
          </div>
        </motion.div>

      </section>
    </main>
  );
}

function PrincipleCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all text-center">
      <Icon className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}