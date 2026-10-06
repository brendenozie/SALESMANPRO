"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart = [], addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  // Premium Hospital Theme Primary Color (Teal matching the light mode hero)
  const primaryColor = '#0d9488'; 

  // Calculate true programmatic total safely 
  const calculatedTotal = cart.reduce((acc: number, item: any) => acc + (item.finalPrice * item.quantity), 0);

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[101] flex flex-col selection:bg-teal-50"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Your Selection</h2>
                <p className="text-[10px] text-teal-600 font-bold tracking-wider uppercase mt-0.5">Medical & Consultative Care</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length > 0 ? (
                cart.map((item: any) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                  >
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                      <Image decoding="async" 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1576091160550-fd419dba48e0?q=80&w=120&auto=format&fit=crop'} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-0.5">{item.name}</h3>
                      <p className="font-bold text-xs" style={{ color: primaryColor }}>${item.finalPrice?.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
                          <button 
                            onClick={() => decreaseQuantity(item.id)} 
                            className="p-1 text-slate-500 hover:text-teal-600 transition-colors"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)} 
                            className="p-1 text-slate-500 hover:text-teal-600 transition-colors"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm text-teal-600">🩺</div>
                  <div>
                    <p className="text-slate-800 font-semibold text-sm">Your care bag is empty</p>
                    <p className="text-slate-400 text-xs mt-1">Select diagnostic packages or secure booking sessions to get started.</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-bold uppercase tracking-wider text-teal-600 border-b-2 border-teal-600/30 pb-0.5 hover:border-teal-600 transition-all"
                  >
                    Return to Specialties
                  </button>
                </div>
              )}
            </div>

            {/* Premium Clinical Footer Summary */}
            <div className="relative p-6 space-y-4 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(148,163,184,0.05)]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Subtotal Fees</span>
                <span className="text-slate-900 font-bold">${calculatedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Medical Processing</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-wide bg-emerald-50 px-2 py-0.5 rounded">Complimentary</span>
              </div>
              
              <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Est. Balance</p>
                  <p className="text-2xl font-black text-slate-900">${calculatedTotal.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                className="block w-full py-4 rounded-xl text-white text-center font-bold text-sm transition-all shadow-md active:scale-[0.99] hover:brightness-105"
                style={{ backgroundColor: primaryColor }}
              >
                Proceed to Secure Checkout
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-medium">
                🔒 HIPAA Compliant & Encrypted Health Networks
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}