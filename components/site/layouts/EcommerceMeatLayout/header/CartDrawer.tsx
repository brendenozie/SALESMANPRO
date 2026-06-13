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

  // UNIQUE SIGNATURE ALPHABETICAL KEY SORT SCHEME FOR CART IDENTITIES
  const generateSignature = (item: any) => {
    if (item.cartItemId) return item.cartItemId;
    
    const hasOptions = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;
    if (!hasOptions) return item.id;

    const sortedOptionsString = Object.entries(item.selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `${key}:${val}`)
      .join('-');
    return `${item.id}-${sortedOptionsString}`;
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-stone-50 dark:bg-[#0A0A0A] shadow-2xl z-[101] flex flex-col border-l border-stone-100 dark:border-stone-900"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-900 flex items-center justify-between bg-white dark:bg-[#0f0f0f]">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-stone-900 dark:text-stone-100 uppercase">Your Coldroom Bag</h2>
                <p className="text-[10px] text-red-600 font-black tracking-[0.2em] uppercase">Prime Cuts Selected</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                cart.map((item: any) => {
                  const variantSignature = generateSignature(item);

                  return (
                    <motion.div 
                      layout
                      key={variantSignature} 
                      className="flex gap-4 items-center border-b border-stone-100 dark:border-stone-900/50 pb-6"
                    >
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 flex-shrink-0 border border-stone-200 dark:border-stone-800">
                        <Image 
                          src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm uppercase leading-tight mb-0.5">{item.name}</h3>
                        
                        {/* Dynamic Custom Cuts Config Descriptor labels */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Object.entries(item.selectedOptions).map(([key, val]: [string, any]) => (
                              <span key={key} className="text-[9px] font-bold bg-stone-200/60 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded-md uppercase">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-red-600 dark:text-red-500 font-black text-xs">
                          KES {(item.finalPrice || item.sellingPrice || 0).toLocaleString()}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-1.5 py-0.5">
                            <button 
                              onClick={() => decreaseQuantity(variantSignature, item.selectedOptions || {})} 
                              className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3 stroke-[3]" />
                            </button>
                            <span className="px-3 text-xs font-black text-stone-900 dark:text-stone-100 tabular-nums">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => addToCart({
                                ...item,
                                cartItemId: variantSignature,
                                selectedOptions: item.selectedOptions || {}
                              })} 
                              className="p-1 text-stone-500 hover:text-red-600 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(variantSignature, item.selectedOptions || {})} 
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
                  <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center text-3xl">🥩</div>
                  <p className="text-stone-400 dark:text-stone-500 font-medium text-sm italic max-w-xs">
                    Your coldroom basket is empty. Select from our master artisan cuts...
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-red-600 border-b border-red-600 pb-0.5"
                  >
                    Browse Cleaver Cuts
                  </button>
                </div>
              )}
            </div>

            {/* Premium Summary Footer */}
            <div className="relative p-6 space-y-4 bg-white dark:bg-[#0f0f0f] border-t border-stone-100 dark:border-stone-900">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-medium">Subtotal</span>
                <span className="text-stone-900 dark:text-stone-100 font-black">
                  KES {subtotal.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500 font-medium">Vacuum Packing & Logistics</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Complimentary</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-3xl font-black text-stone-950 dark:text-white tracking-tighter">
                    KES {subtotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/meatecommerce/checkout`) : handleGoogleSignIn(); }}
                className="block w-full py-5 bg-stone-950 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white text-center font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98]"
              >
                Proceed to Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-stone-400 dark:text-stone-500 italic">
                Cuts are freshly partitioned, vacuum-sealed and shipped under cold chain dispatch.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}