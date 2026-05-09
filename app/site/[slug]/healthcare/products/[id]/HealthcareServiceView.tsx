"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  BeakerIcon, 
  ClockIcon, 
  DocumentCheckIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src }: { src: string }) => src;

export default function HealthcareServiceView({ service, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0ea5e9'; // Medical Blue
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock Healthcare Data
  const stats = [
    { label: 'Success Rate', value: '99.2%', icon: <HandThumbUpIcon className="w-5 h-5" /> },
    { label: 'Specialists', value: '12+', icon: <UserGroupIcon className="w-5 h-5" /> },
    { label: 'Procedures', value: '5k+', icon: <BeakerIcon className="w-5 h-5" /> },
    { label: 'Wait Time', value: '< 15m', icon: <ClockIcon className="w-5 h-5" /> },
  ];

  const process = [
    { step: '01', title: 'Consultation', desc: 'Initial diagnostic review with a lead consultant.' },
    { step: '02', title: 'Screening', desc: 'State-of-the-art laboratory and imaging analysis.' },
    { step: '03', title: 'Treatment', desc: 'Personalized care plan using minimally invasive tech.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] selection:bg-blue-100">
      
      {/* --- CLINICAL HERO SECTION --- */}
      <section className="relative pt-12 lg:pt-20 px-6 lg:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" /> ISO 9001 Certified
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <StarSolid className="w-4 h-4" />
                  <span className="text-xs font-bold dark:text-white">4.9/5 Patient Satisfaction</span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
                {service?.name || "Advanced Diagnostic Radiology"}
              </h1>

              <p className="text-xl text-slate-500 dark:text-zinc-400 font-light leading-relaxed mb-10 max-w-2xl">
                {service?.description || "Utilizing AI-driven imaging technology to provide the most accurate diagnostics in Nairobi. Our department focuses on early detection and precision planning."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  className="px-10 py-5 rounded-2xl text-white font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center gap-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CalendarDaysIcon className="w-5 h-5" /> Book Appointment
                </button>
                <button className="px-10 py-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-bold uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:bg-slate-50 transition-all">
                  <VideoCameraIcon className="w-5 h-5" /> Tele-Consultation
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900"
            >
              <Image
                src={service?.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800'}
                alt="Medical Service"
                fill
                className="object-cover"
                loader={loader}
              />
            </motion.div>
            
            {/* Floating Specialist Card */}
            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-zinc-800 flex items-center gap-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">Expert Led Care</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultants on Call</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CLINICAL DATA STRIP --- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="mb-4 text-blue-500 group-hover:scale-110 transition-transform">{s.icon}</div>
              <h4 className="text-3xl font-black dark:text-white mb-1">{s.value}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- DETAILED INFO & PATIENT JOURNEY --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 pb-32 grid lg:grid-cols-12 gap-20">
        
        {/* Left: Interactive Tabs */}
        <div className="lg:col-span-7">
          <div className="flex gap-8 border-b border-slate-200 dark:border-zinc-800 mb-12">
            {['Overview', 'Preparation', 'Inclusions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                  activeTab === tab ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="prose prose-slate dark:prose-invert max-w-none"
              >
                {activeTab === 'Overview' && (
                  <>
                    <h3 className="text-2xl font-bold">Comprehensive Care Standards</h3>
                    <p className="text-lg font-light text-slate-500">We adhere to the highest international medical protocols. This service is designed to be comprehensive, ensuring that every patient receives a tailored diagnostic path.</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-8">
                      {['Real-time Data Sync', 'Insurance Coverage', 'Digital Health Records', 'Follow-up Portal'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-medium dark:text-zinc-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: The Patient Journey Card */}
        <aside className="lg:col-span-5">
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-10 flex items-center gap-3">
              <DocumentCheckIcon className="w-5 h-5 text-blue-500" /> The Patient Journey
            </h3>
            
            <div className="space-y-12 relative">
              {/* Vertical Connector Line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100 dark:bg-zinc-800" />
              
              {process.map((p, i) => (
                <div key={i} className="relative flex gap-8">
                  <div className="z-10 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {p.step}
                  </div>
                  <div>
                    <h4 className="font-bold dark:text-white mb-1">{p.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 font-light leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50 dark:border-zinc-800">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 mb-8">
                <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">NHIF and major private insurance accepted for this procedure.</p>
              </div>
              <button className="w-full h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-black dark:hover:bg-slate-100 transition-all">
                Download Patient Info PDF
              </button>
            </div>
          </div>
        </aside>
      </main>

      
      <WhatsAppInquiry 
        productName={service.name}
        productPrice={service.finalPrice || service.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />

    </div>
  );
}