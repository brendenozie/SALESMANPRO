'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  // Dynamic High-Performance Theme Settings
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF6B00';

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Dynamic Cart Summation Matrix
  const cartSubtotal = useMemo(() => {
    return cart.reduce((accum: number, currentItem: any) => {
      const unitPrice = currentItem.finalPrice ?? currentItem.sellingPrice ?? 0;
      return accum + (unitPrice * (currentItem.quantity || 1));
    }, 0);
  }, [cart]);

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FAF9F6] shadow-2xl z-[101] flex flex-col"
          >
            {/* Tactical Header Frame */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">Your Build</h2>
                <p style={{ color: primary }} className="text-[10px] font-bold tracking-[0.2em] uppercase">
                  Selected Configurations
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Cart Items List Wrapper */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Unique compound variant isolation key
                  const uniqueItemKey = item.selectedOptions
                    ? `${item.id}-${Object.entries(item.selectedOptions).map(([cat, val]) => `${cat}:${val}`).join('-')}`
                    : `${item.id}-${idx}`;

                  return (
                    <motion.div 
                      layout
                      key={uniqueItemKey} 
                      className="flex gap-4 items-center border-b border-gray-100 pb-6"
                    >
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-black italic uppercase tracking-tight text-gray-900 text-sm leading-tight mb-0.5">
                          {item.name}
                        </h3>
                        
                        {/* Selected Variant Metadata Chips */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Object.entries(item.selectedOptions).map(([category, value]) => (
                              <span 
                                key={category} 
                                className="inline-block bg-gray-900 text-gray-100 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-tight"
                              >
                                {category}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <p style={{ color: primary }} className="font-black italic text-xs">
                          Kes {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Quantity Adjusters */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(item.id, item.selectedOptions)} 
                              style={{ '--hover-color': primary } as React.CSSProperties}
                              className="p-1 text-gray-500 hover:text-[var(--hover-color)] transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black text-gray-800">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              style={{ '--hover-color': primary } as React.CSSProperties}
                              className="p-1 text-gray-500 hover:text-[var(--hover-color)] transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id, item.selectedOptions)} 
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
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🚴‍♂️</div>
                  <p className="text-gray-400 font-medium italic text-sm">Your garage build path is empty...</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    style={{ color: primary, borderColor: primary }}
                    className="text-xs font-black uppercase tracking-widest border-b"
                  >
                    Browse Series
                  </button>
                </div>
              )}
            </div>

            {/* Tactical Checkout Sticky Summary Panel Footer */}
            <div className="relative p-8 space-y-4 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
                <span>Subtotal Spec</span>
                <span className="text-gray-900 font-black">Kes {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-gray-500 uppercase">
                <span>Track Tuning</span>
                <span className="text-emerald-600 font-black tracking-widest">Complimentary</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Total Valuation</p>
                  <p className="text-3xl font-black italic tracking-tighter text-gray-900">
                    Kes {cartSubtotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/bikeecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ '--hover-bg': primary } as React.CSSProperties}
                className="block w-full py-5 bg-gray-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--hover-bg)]"
              >
                Secure Dispatch Setup
              </button>
              
              <p className="text-[9px] font-mono text-center text-gray-400 uppercase tracking-tight">
                All components are technical grade and race verified.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}