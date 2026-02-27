'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  CheckBadgeIcon, 
  GiftIcon, 
  BellAlertIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const perks = [
    { icon: GiftIcon, text: "Early access to weekly drops" },
    { icon: CheckBadgeIcon, text: "Exclusive member-only pricing" },
    { icon: BellAlertIcon, text: "Instant flash-sale notifications" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      // Add your API logic here
    }
  };

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative grid grid-cols-1 lg:grid-cols-2 bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl"
        >
          {/* Left Side: Perks & Context */}
          <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6"
                style={{ backgroundColor: primary, color: '#fff' }}
              >
                <EnvelopeIcon className="w-6 h-6" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Don’t miss the <br />
                <span className="italic font-light text-gray-400">next big drop.</span>
              </h2>
              <p className="text-gray-500 font-medium max-w-sm">
                Join 10k+ subscribers who get our curated selection of deals and news every Tuesday.
              </p>
            </div>

            <ul className="space-y-4">
              {perks.map((perk, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-3 text-sm font-bold text-gray-700"
                >
                  <perk.icon className="w-5 h-5" style={{ color: primary }} />
                  {perk.text}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Side: Interactive Input Field */}
          <div className="relative bg-gray-900 p-12 md:p-16 lg:p-20 flex flex-col justify-center overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: primary }} />
            </div>

            <div className="relative z-10 space-y-8">
              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-gray-500 outline-none focus:border-white/30 transition-all text-lg font-medium"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="mt-4 w-full md:absolute md:mt-0 md:top-2 md:right-2 md:w-auto px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                      style={{ backgroundColor: primary, color: '#fff' }}
                    >
                      Subscribe
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    No spam. Just quality. Unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center"
                >
                  <h3 className="text-2xl font-black text-white mb-2">Welcome to the inner circle! 🥂</h3>
                  <p className="text-gray-400">Check your inbox for your 15% discount code.</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}