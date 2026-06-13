'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useStateContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  const primary = '#D97706'; // Premium Amber Accents

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Maps items based on their structural variant matrices to keep compound matches isolated
  const getItemSignatureId = (item: any) => {
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.id}-${JSON.stringify(item.selectedOptions)}`;
    }
    return item.id;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="text-left">
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Your Basket</h2>
                <p className="text-[10px] text-amber-600 font-bold tracking-[0.2em] uppercase">Horology Selection</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                cart.map((item: any) => {
                  const targetSignatureId = getItemSignatureId(item);

                  return (
                    <motion.div 
                      layout
                      key={targetSignatureId} 
                      className="flex gap-4 items-center border-b border-gray-50 pb-6 text-left"
                    >
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src} 
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                        
                        {/* Selected Configurations Sub-Row */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1.5">
                            {Object.entries(item.selectedOptions).map(([category, value]) => (
                              <span key={category} className="inline-block bg-stone-100 text-stone-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                {category}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-amber-700 font-black text-xs">
                          Kes {item.finalPrice?.toLocaleString()}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(targetSignatureId)} 
                              className="p-1 hover:text-amber-600"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 hover:text-amber-600"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(targetSignatureId)} 
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">⌚</div>
                  <p className="text-gray-400 font-medium italic">Your basket is waiting for a timeless piece...</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-amber-600 border-b border-amber-600"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Footer Summary */}
            <div className="relative p-8 space-y-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">Kes {totalPrice?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Secure Delivery</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-3xl font-black text-gray-900 mt-0.5">Kes {totalPrice?.toLocaleString() || '0'}</p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                className="block w-full py-5 bg-gray-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-600 transition-all shadow-xl active:scale-[0.98]"
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-gray-400 italic">
                Each watch is carefully inspected, validated, and shipped in premium protective packaging.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}