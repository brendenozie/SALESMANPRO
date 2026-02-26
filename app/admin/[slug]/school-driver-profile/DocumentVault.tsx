'use client';

import React, { useState } from 'react';
import { 
  DocumentIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  IdentificationIcon,
  MagnifyingGlassPlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUMENTS = [
  { id: 'REG', title: 'Vehicle Registration', icon: TruckIcon, sub: 'Exp: Dec 2026', img: '/docs/reg-sample.jpg' },
  { id: 'INS', title: 'Insurance Policy', icon: ShieldCheckIcon, sub: 'Policy #99281-AS', img: '/docs/ins-sample.jpg' },
  { id: 'LIC', title: 'Commercial License', icon: IdentificationIcon, sub: 'Class B CDL', img: '/docs/lic-sample.jpg' },
  { id: 'DOT', title: 'DOT Inspection', icon: DocumentIcon, sub: 'Passed: Jan 2026', img: '/docs/dot-sample.jpg' },
];

export default function DocumentVault() {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* HEADER */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Secure</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Document Vault</h1>
        <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Official Electronic Records</p>
      </header>

      {/* DOCUMENT GRID */}
      <div className="grid grid-cols-1 gap-4">
        {DOCUMENTS.map((doc) => (
          <button 
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-5">
              <div className="bg-blue-600/10 p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                <doc.icon className="h-7 w-7 text-blue-500 group-hover:text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black italic uppercase tracking-tight">{doc.title}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{doc.sub}</p>
              </div>
            </div>
            <MagnifyingGlassPlusIcon className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>

      {/* QUICK VERIFY QR (Optional) */}
      <div className="mt-8 p-8 bg-white/5 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center">
          <QrCodeIcon className="h-16 w-16 text-slate-500 mb-4" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
            Scan to verify driver credentials<br/>(External Inspector Use)
          </p>
      </div>

      {/* FULLSCREEN VIEWER OVERLAY */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black italic uppercase">{selectedDoc.title}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedDoc.sub}</p>
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-4 bg-white/10 rounded-full"
                >
                    <XMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-2xl w-full max-w-md aspect-[1/1.414] overflow-hidden"
                >
                    {/* Placeholder for real scan */}
                    <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center p-8 text-black">
                        <selectedDoc.icon className="h-20 w-20 opacity-20 mb-6" />
                        <div className="w-full h-4 bg-black/10 rounded mb-4" />
                        <div className="w-3/4 h-4 bg-black/10 rounded mb-4" />
                        <div className="w-full h-40 bg-black/5 rounded mb-8 border-2 border-dashed border-black/10" />
                        <p className="font-black text-2xl italic uppercase opacity-20">Official Document</p>
                    </div>
                </motion.div>
            </div>

            <div className="p-8 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs">
                    <ArrowDownTrayIcon className="h-5 w-5" /> Download
                </button>
                <button className="flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">
                    <DocumentIcon className="h-5 w-5" /> Full Resolution
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}