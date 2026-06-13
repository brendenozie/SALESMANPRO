'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
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

  // Dynamic Theme Integration
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Dynamic Subtotal Matrix Accumulator Engine
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header Frame */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Your Basket</h2>
                <p style={{ color: primary }} className="text-[10px] font-bold tracking-[0.2em] uppercase">
                  Artisan Selection
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Cart Items Multi-Variant Loop Layout */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Unique compound structural key generation
                  const itemVariantKey = item.selectedOptions 
                    ? `${item.id}-${Object.entries(item.selectedOptions).map(([cat, val]) => `${cat}:${val}`).join('-')}`
                    : `${item.id}-${idx}`;

                  return (
                    <motion.div 
                      layout
                      key={itemVariantKey} 
                      className="flex gap-4 items-center border-b border-gray-50 pb-6"
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
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{item.name}</h3>
                        
                        {/* Selected Multi-Variant Attributes Sub-Display */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Object.entries(item.selectedOptions).map(([category, value]) => (
                              <span 
                                key={category} 
                                className="inline-block bg-gray-50 text-gray-500 border border-gray-100 rounded px-1.5 py-0.5 text-[9px] font-medium"
                              >
                                <span className="font-bold text-gray-400">{category}:</span> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <p style={{ color: primary }} className="font-black text-xs">
                          KSh {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Interactive Scope Stepper Control Elements */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(item.id, item.selectedOptions)} 
                              style={{ '--hover-color': primary } as React.CSSProperties}
                              className="p-1 text-gray-500 hover:text-[var(--hover-color)] transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
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
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🥐</div>
                  <p className="text-gray-400 font-medium italic">Your basket is as empty as a morning oven...</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    style={{ color: primary, borderColor: primary }}
                    className="text-xs font-black uppercase tracking-widest border-b"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Summary Panel Footer */}
            <div className="relative p-8 space-y-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">KSh {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Bakery Delivery</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-3xl font-black text-gray-900">KSh {cartSubtotal.toLocaleString()}</p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ '--hover-bg': primary } as React.CSSProperties}
                className="block w-full py-5 bg-gray-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none hover:bg-[var(--hover-bg)]"
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-gray-400 italic">
                Each order is hand-packed with care at our local bakery.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}