"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  PlusIcon, 
  MinusIcon, 
  LifebuoyIcon, 
  ArrowRightIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/outline'; // Consistency with Heroicons

const FAQItem = ({ faq, primaryColor, activeId, setActiveId }: any) => {
  const isOpen = activeId === faq.id;

  return (
    <motion.div
      layout
      className={`relative border-b border-gray-100 transition-all duration-300 ${
        isOpen ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <button
        onClick={() => setActiveId(isOpen ? null : faq.id)}
        className="w-full py-10 px-6 text-left flex items-start justify-between group"
      >
        <div className="flex gap-6">
          <span className="text-[10px] font-black text-gray-300 mt-1.5 tracking-tighter">
            {faq.id.padStart(2, '0')}
          </span>
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
            isOpen ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
          }`}>
            {faq.question}
          </span>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          {isOpen ? (
            <MinusIcon className="w-5 h-5 text-gray-900" />
          ) : (
            <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
          >
            <div className="pl-16 pr-12 pb-10">
              <p className="text-gray-500 leading-relaxed text-base max-w-2xl border-l-2 pl-8" style={{ borderColor: primaryColor }}>
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ProfessionalFAQ({ storeFormData }: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';

  const faqs = storeFormData?.faqs?.length > 0 ? storeFormData.faqs : [
    { id: "1", question: "Institutional Enrollment Protocols", answer: "Our admission process is streamlined through a secure digital portal. Candidates are vetted based on prerequisite alignment and professional background." },
    { id: "2", question: "Prerequisite Technical Requirements", answer: "Standard tracks require a foundational baseline in relevant disciplines. Advanced fellowships may require prior certification or a portfolio review." },
    { id: "3", question: "Fiscal Payment Frameworks", answer: "We support corporate billing, institutional grants, and all major global credit facilities through encrypted gateways." },
    { id: "4", question: "Career Advancement Trajectory", answer: "Programs include strategic career counseling, industry networking, and direct access to our institutional partner ecosystem." }
  ];

  return (
    <section className="py-32 bg-white relative">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: The Help Desk Monolith */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Institutional Knowledge</span>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter leading-none mb-10">
                Strategic <br />
                <span className="text-gray-300 font-light italic">clarity.</span>
              </h2>

              <p className="text-gray-500 text-lg leading-relaxed max-w-sm mb-12 font-medium">
                Our support protocols ensure a seamless transition into the academic environment. Access our full library of documentation for deep technical inquiries.
              </p>
              
              <div className="bg-gray-900 p-10 shadow-2xl relative overflow-hidden group">
                {/* Technical grid overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Direct Inquiry</p>
                <p className="text-xl font-bold text-white mb-8">Liaison Support Office</p>
                
                <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white group">
                  <span className="border-b border-white/20 pb-1 group-hover:border-white transition-all">Submit Support Ticket</span>
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white group-hover:text-gray-900">
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Ledger Accordion */}
          <div className="lg:col-span-7 border-t border-gray-100">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              {faqs.map((faq: any) => (
                <FAQItem 
                  key={faq.id} 
                  faq={faq} 
                  primaryColor={primaryColor} 
                  activeId={activeId}
                  setActiveId={setActiveId}
                />
              ))}
            </motion.div>
            
            <div className="mt-12 flex items-center gap-4 text-gray-400">
              <div className="h-[1px] flex-grow bg-gray-100" />
              <span className="text-[9px] font-black uppercase tracking-widest">End of Record</span>
              <div className="h-[1px] flex-grow bg-gray-100" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}