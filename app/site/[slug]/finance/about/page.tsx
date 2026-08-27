"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  KeyIcon, 
  FingerPrintIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  CpuChipIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function SecureVaultAbout() {
  return (
    <main className="bg-stone-50 dark:bg-[#0A0A0B] min-h-screen pt-32 pb-24 text-stone-900 dark:text-stone-100 selection:bg-amber-600 selection:text-white">
      
      {/* 1. HERO: THE DIGITAL CITADEL */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-[1px] bg-amber-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">AES-256 Military Grade</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-serif tracking-tighter leading-[0.85] mb-12">
              Your Data. <br />
              <span className="italic text-stone-400 dark:text-stone-600">Our Honor.</span>
            </h1>
            
            <p className="text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-lg mb-12">
              The Secure Document Vault is more than storage. It is a legally-binding digital sanctuary designed for the absolute protection of Kenyan corporate assets and private legal instruments.
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-stone-200 dark:border-white/10 pt-12">
               <div className="flex items-center gap-4">
                  <FingerPrintIcon className="w-8 h-8 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Biometric <br/> Access Only</span>
               </div>
               <div className="flex items-center gap-4">
                  <CpuChipIcon className="w-8 h-8 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Zero-Knowledge <br/> Encryption</span>
               </div>
            </div>
          </motion.div>

          <div className="relative">
             {/* The Vault Door Visual */}
             <div className="relative aspect-square rounded-full border-[32px] border-stone-200 dark:border-stone-900 shadow-2xl flex items-center justify-center bg-stone-100 dark:bg-stone-900 overflow-hidden group">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <LockClosedIcon className="w-48 h-48 text-stone-300 dark:text-stone-700 transition-all duration-700 group-hover:text-amber-600 group-hover:scale-110" />
                
                {/* Floating Security Particles */}
                <div className="absolute inset-0 pointer-events-none">
                   {[...Array(6)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 3 + i, repeat: Infinity, delay: i }}
                        className="absolute w-1 h-1 bg-amber-500 rounded-full"
                        style={{ left: `${20 * i}%`, top: '80%' }}
                     />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE SECURITY LAYERS */}
      <section className="max-w-7xl mx-auto px-6 py-48 border-y border-stone-200 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
           <LayerCard 
             icon={<CloudArrowUpIcon />} 
             title="Immutable Backup" 
             desc="Files are sharded across three geographic regions in Kenya, ensuring 99.99% durability against local outages."
           />
           <LayerCard 
             icon={<KeyIcon />} 
             title="Quantum-Ready" 
             desc="Our encryption standards are built to withstand the next generation of cryptographic challenges."
             active
           />
           <LayerCard 
             icon={<DocumentDuplicateIcon />} 
             title="Legal Admissibility" 
             desc="Every document timestamped within the vault carries a certified digital signature recognized by the High Court."
           />
        </div>
      </section>
    </main>
  );
}

function LayerCard({ icon, title, desc, active }: any) {
  return (
    <div className="group">
      <div className={`w-14 h-14 rounded-xl mb-8 flex items-center justify-center transition-all ${active ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' : 'bg-stone-200 dark:bg-stone-800 text-stone-400 group-hover:bg-amber-500 group-hover:text-white'}`}>
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-2xl font-serif mb-4 italic">{title}</h3>
      <p className="text-stone-500 dark:text-stone-400 text-sm leading-loose tracking-wide">{desc}</p>
    </div>
  );
}