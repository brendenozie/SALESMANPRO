'use client';

import React from 'react';
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

  // Dynamic book duka brand palette color configuration falling back to teal
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  // Dynamic absolute subtotal accumulator mapping current variant array state
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col min-h-screen "
          > 
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Your Basket</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: primary }}>
                  Literary Selections
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white ">
              {cart.length > 0 ? (
                cart.map((item: any) => {
                  // Generate a safe, sorted signature to map layout keys perfectly to the ProductCard configuration keys
                  const sortedOptionsString = Object.keys(item.selectedOptions || {})
                    .sort()
                    .reduce((acc, key) => `${acc}-${key}:${item.selectedOptions[key]}`, '');
                  
                  // Primary lookup uses item.uid configured from selection, falling back to composite string matching
                  const uniqueVariantKey = item.uid || `${item.id}${sortedOptionsString}`;

                  return (
                    <motion.div 
                      layout
                      key={uniqueVariantKey} 
                      className="flex gap-4 items-center border-b border-zinc-100 pb-6"
                    >
                      <div className="relative h-24 w-18 aspect-[3/4] overflow-hidden bg-zinc-50 shadow-sm flex-shrink-0 border-l-2 border-black/10">
                        <Image 
                          src={item.images?.[0]?.url || item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-serif italic text-zinc-900 text-base leading-tight mb-0.5">{item.name}</h3>
                        
                        {/* Dynamic Metadata Variant Rendering labels */}
                        {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {Object.entries(item.selectedOptions).map(([key, val]: any) => (
                              <span key={key} className="text-[9px] bg-zinc-100 text-zinc-600 px-2 py-0.5 uppercase tracking-tight font-medium rounded-sm">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="font-black text-sm text-zinc-900">
                          Kes {(item.finalPrice || item.sellingPrice || 0).toLocaleString()}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-zinc-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(uniqueVariantKey)} 
                              className="p-1 text-zinc-500 hover:text-zinc-900"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-zinc-900 tabular-nums">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 text-zinc-500 hover:text-zinc-900"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(uniqueVariantKey)} 
                            className="text-zinc-300 hover:text-red-500 transition-colors"
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
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-3xl">📚</div>
                  <p className="text-zinc-400 font-medium italic">Your library basket is currently empty...</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest border-b pb-0.5"
                    style={{ color: primary, borderColor: primary }}
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Footer Summary Panel */}
            <div className="relative p-8 space-y-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">Subtotal</span>
                <span className="text-zinc-900 font-bold">Kes {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium">Shipping & Handling</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Calculated at Checkout</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-3xl font-black text-zinc-900">Kes {subtotal.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/bookecommerce/checkout`) : handleGoogleSignIn() }}
                className="block w-full py-5 text-white text-center font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98]"
                style={{ backgroundColor: primary }}
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-zinc-400 italic">
                Each parcel is carefully packed to safeguard covers, dust jackets, and binding elements.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}