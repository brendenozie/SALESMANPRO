'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  SparklesIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Logic for API call would go here
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[3.5rem] overflow-hidden bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
          
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-32 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Visual Side */}
            <div className="relative h-64 lg:h-auto min-h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=1200"
                alt="Happy pet community"
                loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Floating Social Proof Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                        alt="user" 
                        width={32} 
                        height={32} 
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">
                  Join 5,000+ Pet Parents
                </p>
              </motion.div>
            </div>

            {/* Form Side */}
            <div className="p-10 lg:p-20 flex flex-col justify-center relative z-10">
              {!isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <SparklesIcon className="w-6 h-6" style={{ color: primary }} />
                    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Paw-some Updates</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6">
                    Get <span style={{ color: primary }}>15% Off</span> Your <br /> First Order.
                  </h2>
                  
                  <p className="text-slate-400 text-lg mb-10 max-w-md">
                    Join our newsletter and receive exclusive discounts, pet care tips, and early access to new arrivals.
                  </p>

                  <form onSubmit={handleSubmit} className="relative max-w-md group">
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-white transition-colors" />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-5 pl-12 pr-32 text-white placeholder-slate-500 outline-none focus:border-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 px-6 rounded-xl text-white font-black text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                      style={{ backgroundColor: primary }}
                    >
                      Join
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </form>
                  
                  <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    No spam. Just pure pet joy. Unsubscribe anytime.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">You're on the list!</h3>
                  <p className="text-slate-400">Check your inbox for your 15% discount code.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}