'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  // Premium Architectural Theme Parameters
  const primary = '#18181b'; // Deep Onyx Slate

  // Dynamically calculate running cart configuration parameters
  const totalPrice = useMemo(() => {
    return cart.reduce((total: number, item: any) => {
      const price = item.finalPrice ?? item.sellingPrice ?? 0;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[150]"
          />

          {/* Luxury Gallery Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#fafafa] dark:bg-[#0c0c0c] shadow-[-30px_0_80px_rgba(0,0,0,0.1)] z-[151] flex flex-col border-l border-zinc-100 dark:border-zinc-900"
          >
            {/* Structural Header */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-[#080808]">
              <div>
                <h2 className="text-xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white">Selected Pieces</h2>
                <p className="text-[8px] text-zinc-400 font-black tracking-[0.3em] uppercase mt-1">Architecture Bag Inventory</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full border border-zinc-200/50 dark:border-zinc-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Main Commission Manifest Block */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const itemConfigLabel = Object.entries(item.selectedOptions || {})
                    .map(([_, val]) => `${val}`)
                    .join(' / ');

                  return (
                    <motion.div 
                      layout
                      key={`${item.id}-${idx}`} 
                      className="flex gap-5 items-start border-b border-zinc-100 dark:border-zinc-900/60 pb-6"
                    >
                      {/* Image Thumbnail Frame */}
                      <div className="relative h-20 w-16 rounded-xl overflow-hidden bg-[#EFEFEF] dark:bg-zinc-900 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src} 
                        />
                      </div>
                      
                      {/* Line Specs Mapping Area */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-xs tracking-tight truncate leading-tight mb-0.5">{item.name}</h3>
                        
                        {itemConfigLabel && (
                          <p className="text-[9px] font-medium text-zinc-400 truncate tracking-tight mb-2">
                            {itemConfigLabel}
                          </p>
                        )}
                        
                        <p className="text-zinc-900 dark:text-zinc-200 font-black text-xs tracking-tight">
                          KES {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Micro Adjustment Actions Panel */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-xl px-1.5 py-1 border border-zinc-200/40 dark:border-zinc-800">
                            <button 
                              onClick={() => decreaseQuantity(item.id)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-[10px] font-black min-w-[18px] text-center dark:text-zinc-100">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 mb-4 border border-zinc-100 dark:border-zinc-800/50">
                    <CubeIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-light tracking-wide max-w-[200px] leading-relaxed italic">
                    Your collection architecture is currently empty.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-900 dark:text-white border-b border-zinc-900 dark:border-white pb-1"
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Checkout Subtotal Matrix Panel */}
            <div className="p-8 space-y-5 bg-white dark:bg-[#080808] border-t border-zinc-100 dark:border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center text-xs tracking-tight">
                <span className="text-zinc-400 font-medium">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">KES {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs tracking-tight">
                <span className="text-zinc-400 font-medium">Studio Logistics</span>
                <span className="text-emerald-500 font-black text-[9px] uppercase tracking-widest">Insured / Free</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.3em]">Total Valuation</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mt-1">
                    KES {totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/furnitureecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ backgroundColor: cart.length > 0 ? primary : undefined }}
                className="w-full py-4.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl shadow-xl hover:opacity-90 disabled:opacity-20 transition-all active:scale-[0.99]"
              >
                Secure Checkout Configuration
              </button>
              
              <p className="text-[8px] text-center text-zinc-400 tracking-tight leading-normal max-w-[90%] mx-auto">
                Each commissioned specimen includes structured technical inspection reports and a certificate of craftsmanship authenticity.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}