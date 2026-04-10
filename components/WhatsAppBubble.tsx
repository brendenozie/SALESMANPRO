'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const WHATSAPP_NUMBER = "254700000000"; // Your Business Number

const WhatsAppBubbleIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.657.42 3.215 1.15 4.593L2 22l5.414-1.422A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-.002 18c-1.66 0-3.29-.434-4.693-1.25l-.335-.198-3.214.844.858-3.132-.217-.344A7.963 7.963 0 014.002 20h-.004zm3.707-4a1 1 0 00-1.414-1L9.586 15a1 1 0 000 2l1.707.707a1 1 0 001.414-1z" />
    </svg>
  );
};

export default function WhatsAppBubble(store: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { storeFormData } = useStoreContext();

  // Auto-show a little "How can I help?" prompt after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Hi! I'm browsing the store and have an enquiry i'd like to make.`);
    window.open(`https://wa.me/${ storeFormData?.contactPhone || WHATSAPP_NUMBER }?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed bottom-14 right-8 z-[9999] flex flex-col items-end gap-4">
      
      {/* Mini Preview Prompt */}
      <AnimatePresence>
        {showPrompt && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 max-w-[240px] relative"
          >
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute -top-2 -left-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full text-zinc-500 hover:text-zinc-900"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
            <p className="text-[11px] font-bold text-zinc-900 dark:text-white leading-snug">
              👋 Habari! Looking for something specific or want additional help ?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openWhatsApp}
        className="relative w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(37,211,102,0.3)] group overflow-hidden"
      >
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
        
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        
        {/* "1" Notification Badge */}
        <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 border-2 border-white dark:border-zinc-900 rounded-full flex items-center justify-center">
          <span className="text-[8px] font-black text-white uppercase">1</span>
        </span>
      </motion.button>
    </div>
  );
}