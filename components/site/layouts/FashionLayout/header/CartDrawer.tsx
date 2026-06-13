'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  primaryColor?: string;
}

export default function CartDrawer({ isCartOpen, setIsCartOpen, primaryColor = '#18181b' }: CartDrawerProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const router = useRouter();

  // Dynamically calculate cumulative basket weight 
  const totalCartAmount = useMemo(() => {
    return cart.reduce((acc: number, item: any) => {
      const activePrice = item.finalPrice ?? item.sellingPrice ?? 0;
      return acc + activePrice * item.quantity;
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
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[100]"
          />

          {/* Luxury Architectural Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0c0c0c] border-l border-zinc-100 dark:border-zinc-900 shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] z-[101] flex flex-col"
          >
            {/* Header Area */}
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-[#0c0c0c]">
              <div>
                <h2 className="text-xl font-black tracking-wide text-zinc-900 dark:text-white uppercase">Your Wardrobe</h2>
                <p className="text-[9px] font-black tracking-[0.25em] text-zinc-400 uppercase mt-0.5">Curated Selection</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/80 transition-all active:scale-95"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Scrolling Cart Items Track */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, index: number) => {
                  // Compile dynamic specifications signature safely
                  const optionsLabel = item.selectedOptions
                    ? Object.entries(item.selectedOptions)
                        .map(([_, val]) => `${val}`)
                        .join(' / ')
                    : null;

                  return (
                    <motion.div 
                      layout
                      key={item.id ? `${item.id}-${index}` : index} 
                      className="flex gap-4 items-center border-b border-zinc-100 dark:border-zinc-900/60 pb-6 last:border-0 last:pb-0"
                    >
                      {/* Product Thumbnail Frame */}
                      <div className="relative h-24 w-18 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 flex-shrink-0 shadow-sm">
                        <Image 
                          src={item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/150x200'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          sizes="96px"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Metadata Details Column */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs tracking-wide uppercase truncate mb-0.5">
                          {item.name}
                        </h3>
                        
                        {/* Selected Variants Tracker badge */}
                        {optionsLabel && (
                          <span className="inline-block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            {optionsLabel}
                          </span>
                        )}

                        <p className="text-zinc-900 dark:text-zinc-200 font-black text-xs tracking-tight">
                          KES {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Action Steps Wrapper */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-0.5">
                            <button 
                              onClick={() => decreaseQuantity(item)} 
                              className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <MinusIcon className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2.5 min-w-[24px] text-center text-[10px] font-black text-zinc-800 dark:text-zinc-200">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <PlusIcon className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeFromCart(item)} 
                            className="p-1.5 text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                /* Sophisticated Clean Empty State Placeholder */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wide">Your wardrobe is empty</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[11px] max-w-[200px] mx-auto leading-relaxed">
                      Discover new arrivals and curate your personalized collection.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-all hover:opacity-70"
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Order Pricing Summary Footer */}
            <div className="p-6 md:p-8 space-y-4 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-bold tracking-tight">
                  KES {totalCartAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Priority Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-black uppercase text-[9px] tracking-widest">Complimentary</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.25em]">Estimated Total</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    KES {totalCartAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ backgroundColor: cart.length > 0 ? primaryColor : undefined }}
                className={`block w-full py-4 text-white text-center font-black uppercase tracking-[0.2em] text-[10px] shadow-lg rounded-xl transition-all active:scale-[0.99] ${
                  cart.length === 0 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none' : 'hover:brightness-95'
                }`}
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-500 tracking-wide">
                Insured express logistics and seamless premium returns.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}