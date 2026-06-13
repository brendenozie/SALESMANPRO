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

  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Helper to generate precise dynamic targeting IDs matching variant layouts
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
          {/* Backdrop with sophisticated blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
          />

          {/* Drawer: Premium Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                  Bag<span className="font-light text-gray-400">.</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} selected
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-3 rounded-full hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const targetSigId = getItemSignatureId(item);
                  
                  return (
                    <motion.div 
                      layout
                      key={targetSigId} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-6 group"
                    >
                      {/* Image Container */}
                      <div className="relative h-28 w-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight leading-tight max-w-[180px]">
                                {item.name}
                              </h3>
                              
                              {/* Display Custom Flat Variants Sub-labels */}
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => {
                                    if (key === 'message') return null; // Skip non-variant text metadata
                                    return (
                                      <span key={key} className="text-[10px] font-medium text-gray-400 lowercase bg-gray-50 px-1.5 py-0.5 rounded">
                                        <span className="text-gray-300 uppercase font-bold text-[9px] mr-0.5">{key}:</span> 
                                        {String(value)}
                                      </span>
                                    );
                                  })}
                                  {item.selectedOptions.message && (
                                    <p className="text-[10px] text-gray-400 mt-1 italic block w-full line-clamp-1">
                                      "{item.selectedOptions.message}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(targetSigId)} 
                              className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-black text-lg mt-1" style={{ color: primary }}>
                            Kes {(item.finalPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                            <button 
                              onClick={() => decreaseQuantity(targetSigId)} 
                              className="p-1.5 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm cursor-pointer"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 text-xs font-black text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1.5 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm cursor-pointer"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Your bag is empty</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-[200px]">Looks like you haven't added anything to your collection yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 text-sm font-black uppercase tracking-widest underline underline-offset-8 decoration-2 cursor-pointer"
                    style={{ textDecorationColor: primary }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-gray-900">Kes {totalPrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-black">Complimentary</span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Amount</span>
                  <span className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic">
                    Kes {totalPrice?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                className="w-full py-6 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                style={{ backgroundColor: primary }}
              >
                Checkout Now
                <ChevronRightIcon className="w-4 h-4" />
              </motion.button>
              
              <div className="flex items-center justify-center gap-2 pb-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
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