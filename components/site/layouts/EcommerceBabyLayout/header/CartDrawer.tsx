'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  
  const user = session?.user as { role?: string; name?: string } | undefined;
  const router = useRouter();

  // Extract custom theme branding parameters dynamically
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6'; // Classic soft baby pink fallback
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  // Compute actual operational subtotal allocations
  const subtotal = useMemo(() => {
    return cart.reduce((acc: number, item: any) => acc + (item.finalPrice * item.quantity), 0);
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
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Surface Shell Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header Block Component */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Your Basket</h2>
                <p 
                  style={{ color: primary }}
                  className="text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  {storeFormData?.name || "Baby Duka"} Boutique Collection
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* List Loop Container */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Standard multi-variant signature key definition setup
                  const uniqueItemKey = item.selectedOptions 
                    ? `${item.id}-${Object.entries(item.selectedOptions).map(([k, v]) => `${k}:${v}`).join('-')}`
                    : `${item.id}-${idx}`;

                  return (
                    <motion.div 
                      layout
                      key={uniqueItemKey} 
                      className="flex gap-4 items-center border-b border-slate-50 pb-6 last:border-0"
                    >
                      {/* Product Thumbnail Box Frame */}
                      <div className="relative h-20 w-20 rounded-[1.25rem] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Text details content section area */}
                      <div className="flex-grow">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{item.name}</h4>
                        
                        {/* Selected configuration tags lookup map */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1.5">
                            {Object.entries(item.selectedOptions).map(([cat, val]: [string, any]) => (
                              <span 
                                key={cat}
                                className="inline-block text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold"
                              >
                                {cat}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="font-black text-xs text-slate-900 mt-1">
                          KSh {item.finalPrice?.toLocaleString()}
                        </p>
                        
                        {/* Quantity Counter Control Mechanics Group */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-slate-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(item.id, item.selectedOptions)} 
                              className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 text-slate-500 hover:text-blue-500 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id, item.selectedOptions)} 
                            className="text-slate-300 hover:text-red-500 transition-colors"
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
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">🧸</div>
                  <p className="text-slate-400 text-xs font-medium italic px-6">Your basket is empty. Add cute outfits and accessories for your little ones!</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    style={{ color: primary, borderColor: primary }}
                    className="text-xs font-black uppercase tracking-widest border-b pb-0.5"
                  >
                    Start Exploring
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Summary Footer Area Panel */}
            <div className="relative p-8 space-y-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center text-xs font-bold tracking-tight">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold tracking-tight">
                <span className="text-slate-500">Boutique Delivery</span>
                <span 
                  style={{ color: secondary }}
                  className="font-black text-[10px] tracking-widest uppercase"
                >
                  Calculated Next
                </span>
              </div>
              
              <hr className="border-slate-100 my-1" />

              <div className="pt-1 flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Total Amount</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">KSh {subtotal.toLocaleString()}</p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/babyecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ 
                  backgroundColor: cart.length === 0 ? undefined : primary,
                  boxShadow: cart.length === 0 ? undefined : `0 12px 24px -8px ${primary}66`
                }}
                className="block w-full py-5 bg-slate-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-slate-400 italic">
                Every package is assembled safely and wrapped with complete care.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}