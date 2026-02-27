'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  useEffect(() => {
    // 1. Check if the user has already dismissed this recently
    const hasSeenPopup = localStorage.getItem('hideBotanicalNewsletter');
    if (hasSeenPopup) return;

    // --- Logic A: The 30-Second Timer ---
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    // --- Logic B: The 50% Scroll Trigger ---
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;

      if (scrollProgress > 50) {
        setIsOpen(true);
        // Remove listener once triggered to save performance
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    // Don't show again for 7 days (or until they clear cache)
    localStorage.setItem('hideBotanicalNewsletter', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-4xl bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={handleDismiss}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-all border border-slate-100"
            >
              <XMarkIcon className="w-5 h-5 text-slate-900" />
            </button>

            {/* Content & Form (Condensed for space) */}
            <div className="relative w-full md:w-5/12 h-64 md:h-auto overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000" 
                alt="Botanical Art"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <SparklesIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Private List</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight">
                    Botanical <span className="text-slate-400 text-3xl md:text-4xl block md:inline">Briefings</span>
                  </h2>
                  <p className="text-slate-500 font-serif italic text-lg leading-relaxed">
                    Seasonal lookbooks and rare bloom alerts, delivered with care.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleDismiss(); }}>
                  <input 
                    type="email" 
                    required
                    placeholder="Your email address"
                    className="w-full bg-transparent border-b border-slate-200 py-4 text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                  <button 
                    type="submit"
                    style={{ backgroundColor: primary }}
                    className="w-full py-5 rounded-full text-white font-bold uppercase tracking-[0.2em] text-[11px] mt-4 shadow-lg active:scale-95 transition-all"
                  >
                    Join the Anthology
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
// 'use client';

// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { XMarkIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
// import { useStoreContext } from '@/contexts/StoreContext';

// export default function NewsletterPopup() {
//   const [isOpen, setIsOpen] = useState(true); // Usually triggered by useEffect with a delay
//   const { storeFormData } = useStoreContext();
//   const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
//           {/* Backdrop */}
//           <motion.div 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setIsOpen(false)}
//             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
//           />

//           {/* Popup Container */}
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.9, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             className="relative w-full max-w-4xl bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.25)] flex flex-col md:flex-row"
//           >
//             {/* Close Button */}
//             <button 
//               onClick={() => setIsOpen(false)}
//               className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/50 backdrop-blur-md hover:bg-white transition-colors"
//             >
//               <XMarkIcon className="w-5 h-5 text-slate-900" />
//             </button>

//             {/* Left Side: Imagery */}
//             <div className="relative w-full md:w-5/12 h-48 md:h-auto overflow-hidden">
//               <img 
//                 src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000&auto=format&fit=crop" 
//                 alt="Botanical Art"
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
//             </div>

//             {/* Right Side: Content */}
//             <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center relative">
//               {/* Decorative Element */}
//               <div className="absolute top-10 right-10 opacity-[0.05] pointer-events-none">
//                 <EnvelopeIcon className="w-32 h-32 rotate-12" />
//               </div>

//               <div className="relative z-10 space-y-6">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2 text-rose-400">
//                     <SparklesIcon className="w-4 h-4" />
//                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Private List</span>
//                   </div>
//                   <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight">
//                     Botanical <br />
//                     <span className="text-slate-400">Briefings</span>
//                   </h2>
//                   <p className="text-slate-500 font-serif italic text-lg">
//                     Receive seasonal lookbooks, rare bloom alerts, and atelier stories directly to your inbox.
//                   </p>
//                 </div>

//                 <form className="space-y-4 pt-4">
//                   <div className="relative">
//                     <input 
//                       type="email" 
//                       placeholder="Your email address"
//                       className="w-full bg-white border-b-2 border-slate-100 py-4 px-0 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 transition-colors bg-transparent"
//                     />
//                   </div>
                  
//                   <div className="pt-4">
//                     <button 
//                       type="submit"
//                       style={{ backgroundColor: primary }}
//                       className="w-full py-5 rounded-full text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg hover:brightness-95 transition-all transform hover:-translate-y-1"
//                     >
//                       Join the Anthology
//                     </button>
//                   </div>
                  
//                   <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest pt-4">
//                     No clutter. Only beauty. Unsubscribe anytime.
//                   </p>
//                 </form>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// }