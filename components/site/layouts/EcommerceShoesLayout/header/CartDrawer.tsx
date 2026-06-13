'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop with sophisticated blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100]"
          />

          {/* Drawer: Premium Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0c0c0c] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] dark:shadow-[-20px_0_80px_rgba(0,0,0,0.6)] border-l border-zinc-100 dark:border-zinc-900 z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
                  Bag<span style={{ color: primary }} className="font-black">.</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mt-1">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} selected
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-3 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
              >
                <XMarkIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => (
                  <motion.div 
                    layout
                    key={item.id + (item.selectedOptions ? JSON.stringify(item.selectedOptions) : '')} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-6 group relative pb-6 border-b border-zinc-100/60 dark:border-zinc-900/60 last:border-none"
                  >
                    {/* Image Container */}
                    <div className="relative h-28 w-24 bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-zinc-800/50">
                      <Image 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} 
                        alt={item.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        loader={({ src }) => src}
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-tight leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                              {item.name}
                            </h3>
                            
                            {/* Render Variant Options Summary */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {Object.entries(item.selectedOptions).map(([category, value]: any) => (
                                  <span 
                                    key={category} 
                                    className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400"
                                  >
                                    {category}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors flex-shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-xl px-2 py-1 border border-zinc-100 dark:border-zinc-800/80">
                          <button 
                            onClick={() => decreaseQuantity(item.id)} 
                            className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-none hover:shadow-sm"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3.5 text-xs font-black text-zinc-900 dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)} 
                            className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white shadow-none hover:shadow-sm"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="font-black text-base text-zinc-900 dark:text-white tracking-tight">
                          KES {(item.finalPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <ShoppingBagIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Your bag is empty</h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2 max-w-[220px] font-medium leading-relaxed">
                    Looks like you haven't added any essentials to your collection yet.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 text-xs font-black uppercase tracking-[0.2em] underline underline-offset-8 decoration-2 hover:opacity-80 transition-opacity"
                    style={{ textDecorationColor: primary }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-8 bg-zinc-50/80 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 space-y-6 backdrop-blur-md">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-white">KES {(totalPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  <span>Shipping</span>
                  <span className="font-black tracking-widest" style={{ color: primary }}>Complimentary</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between items-end border-t border-zinc-200/40 dark:border-zinc-800/40">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Total Amount</span>
                  <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none italic mt-1">
                    KES {(totalPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, filter: "brightness(1.05)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                style={{ backgroundColor: primary }}
              >
                Checkout Now
                <ChevronRightIcon className="w-4 h-4 stroke-[3]" />
              </motion.button>
              
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">
                  Secure encrypted checkout
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}