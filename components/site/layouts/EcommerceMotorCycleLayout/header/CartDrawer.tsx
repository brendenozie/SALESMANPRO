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
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  // Compute subtotal dynamically based on your product listing item matrices
  const subtotal = cart.reduce((acc: number, item: any) => acc + ((item.finalPrice || item.sellingPrice || 0) * item.quantity), 0);

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
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
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0A0A] shadow-2xl z-[101] flex flex-col border-l border-stone-100 dark:border-stone-900"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-900 flex items-center justify-between bg-white dark:bg-[#0f0f0f]">
              <div>
                <h2 className="text-2xl font-serif italic text-stone-900 dark:text-stone-100">Your Selection</h2>
                <p className="text-[9px] text-[#c5a059] font-black tracking-[0.25em] uppercase">Showroom Order Manifest</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-none transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                cart.map((item: any) => {
                  // MATCHES PRODUCT CARD EXACT GENERATION STRUCTURE FOR STABLE CONTEXT HOOKS
                  const variantSignature = item.cartItemId || (item.selectedOptions && Object.keys(item.selectedOptions).length > 0
                    ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
                    : item.id);

                  return (
                    <motion.div 
                      layout
                      key={variantSignature} 
                      className="flex gap-4 items-center border-b border-stone-100 dark:border-stone-900/50 pb-6"
                    >
                      <div className="relative h-20 w-20 rounded-none overflow-hidden bg-stone-50 dark:bg-stone-900 flex-shrink-0 border border-stone-100 dark:border-stone-800">
                        <Image 
                          src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium text-stone-900 dark:text-stone-100 text-sm tracking-tight leading-tight mb-1">{item.name}</h3>
                        
                        {/* Custom Specifications Display Labels */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Object.entries(item.selectedOptions).map(([key, val]: [string, any]) => (
                              <span key={key} className="text-[9px] font-bold bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-stone-950 dark:text-stone-200 font-light text-xs tracking-wide">
                          Kes {(item.finalPrice || item.sellingPrice || 0).toLocaleString()}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-none px-1 py-0.5">
                            <button 
                              onClick={() => decreaseQuantity(variantSignature, item.selectedOptions)} 
                              className="p-1 text-stone-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                              <MinusIcon className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <span className="px-3 text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => addToCart({
                                ...item,
                                cartItemId: variantSignature
                              })} 
                              className="p-1 text-stone-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                              <PlusIcon className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(variantSignature, item.selectedOptions)} 
                            className="text-stone-300 dark:text-stone-700 hover:text-red-500 transition-colors p-1"
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
                  <div className="w-20 h-20 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center text-3xl">🏍️</div>
                  <p className="text-stone-400 dark:text-stone-500 font-light text-sm italic max-w-xs">
                    Your order manifest is currently empty. Explore our premium showroom builds...
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a059] border-b border-[#c5a059] pb-0.5"
                  >
                    View Showroom Inventory
                  </button>
                </div>
              )}
            </div>

            {/* Luxury Summary Footer Panel */}
            <div className="relative p-6 space-y-4 bg-stone-50 dark:bg-[#0f0f0f] border-t border-stone-100 dark:border-stone-900">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-light">Subtotal</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium tracking-wide">
                  Kes {subtotal.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-light">Pre-Delivery Showroom Inspection</span>
                <span className="text-[#c5a059] font-black uppercase text-[9px] tracking-[0.15em]">Inclusive</span>
              </div>
              
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-2xl font-light text-stone-950 dark:text-white tracking-tight">
                    Kes {subtotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/motorcycleecommerce/checkout`) : handleGoogleSignIn(); }}
                className="block w-full py-5 bg-stone-950 dark:bg-stone-900 hover:bg-[#c5a059] dark:hover:bg-[#c5a059] text-white text-center font-black uppercase tracking-[0.25em] text-[10px] rounded-none transition-all shadow-xl active:scale-[0.98]"
              >
                Proceed to Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-stone-400 dark:text-stone-500 italic">
                All premium models are verified by certified mechanics before global delivery hand-off.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}