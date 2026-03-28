"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  CheckBadgeIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/solid";
import Image from "next/image";

interface WhatsAppModalProps {
  productName: string;
  productPrice?: number;
  productUrl?: string;
  phoneNumber?: string; // e.g. "254700000000"
}

export default function WhatsAppInquiry({ 
  productName, 
  productPrice, 
  productUrl, 
  phoneNumber = "254712345678" // Default Kenyan Format
}: WhatsAppModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Pre-filled message for the customer
  const message = `Hi! I'm interested in the *${productName}* (KES ${productPrice?.toLocaleString()}). Is it still in stock? \n\nLink: ${window.location.href}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Hide pulse after first interaction
  const toggleModal = () => {
    setIsOpen(!isOpen);
    setShowPulse(false);
  };

  return (
    <>
      {/* 1. FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[60]">
        <motion.button
          onClick={toggleModal}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(37,211,102,0.4)] group"
        >
          {/* Pulse Effect */}
          {showPulse && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
          )}
          
          <ChatBubbleLeftRightIcon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-stone-900 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-black text-white">1</span>
          </div>
        </motion.button>
      </div>

      {/* 2. THE CHAT MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-44 right-6 md:bottom-28 md:right-10 z-[60] w-[350px] overflow-hidden bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.25)] border border-gray-100 dark:border-stone-800"
          >
            {/* Header: The "Concierge" */}
            <div className="bg-[#075E54] p-6 text-white relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                  <Image 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                    alt="Agent" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#075E54] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-sm tracking-tight">Brenden @ SalesmanPro</p>
                    <CheckBadgeIcon className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Typically replies in 5 mins</p>
                </div>
              </div>
            </div>

            {/* Body: The Message Bubble */}
            <div className="p-6 bg-[#E5DDD5] dark:bg-stone-800/50 min-h-[150px] relative">
              {/* Decorative WhatsApp Doodle Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]" />

              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 bg-white dark:bg-stone-900 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]"
              >
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  Hi there! 👋 I'm here to help you with your order for <strong>{productName}</strong>. 
                  <br /><br />
                  Would you like to confirm availability or arrange a delivery to your location?
                </p>
                <span className="text-[9px] text-gray-400 mt-2 block text-right">09:41 AM</span>
              </motion.div>
            </div>

            {/* Footer: The CTA */}
            <div className="p-6 bg-white dark:bg-stone-900 border-t border-gray-100 dark:border-stone-800">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Start Chat on WhatsApp
              </a>
              <p className="text-center text-[9px] text-gray-400 mt-4 uppercase tracking-widest">Secure M-Pesa Payments Supported</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}