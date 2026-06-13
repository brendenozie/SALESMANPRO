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

  // Dynamic Theme Integration mapping from context hooks
  const primary = storeFormData?.themeSettings?.primaryColor || '#059669'; 

  // Calculate true cart aggregated financial balances
  const totalAmount = useMemo(() => {
    return cart.reduce((total: number, item: any) => total + (item.finalPrice * item.quantity), 0);
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
          {/* Backdrop Blur Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel Surface Frame */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header Module */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Your Basket</h2>
                <p 
                  style={{ color: primary }}
                  className="text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  {storeFormData?.name || "Agrovet Store"} Marketplace
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Scrollable Cart Tray List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Render a distinct key combining base ID and stringified option variants to prevent collisions
                  const itemKey = item.selectedOptions 
                    ? `${item.id}-${Object.entries(item.selectedOptions).map(([k, v]) => `${k}:${v}`).join('-')}`
                    : `${item.id}-${idx}`;

                  return (
                    <motion.div 
                      layout
                      key={itemKey} 
                      className="flex gap-4 items-center border-b border-gray-100 pb-6 last:border-b-0"
                    >
                      {/* Product Image Frame */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Detailed Meta Stack Description */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                          {item.name}
                        </h3>

                        {/* Inline loop for selected multi-variant parameters */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2 mt-1">
                            {Object.entries(item.selectedOptions).map(([category, value]: [string, any]) => (
                              <span 
                                key={category}
                                className="inline-block text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-md font-bold"
                              >
                                {category}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <p className="font-mono font-bold text-xs text-gray-900">
                          KSh {item.finalPrice?.toLocaleString()}
                        </p>
                        
                        {/* Interactive Quantity Sizers Controls Container */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(item.id, item.selectedOptions)} 
                              className="p-1 hover:text-red-600 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black text-gray-800">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 hover:text-emerald-600 transition-colors"
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
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-2xl">🌱</div>
                  <p className="text-gray-400 text-xs font-medium italic px-4">Your agrovet cart is empty. Explore items to configure and add supplies.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    style={{ color: primary, borderColor: primary }}
                    className="text-xs font-black uppercase tracking-widest border-b pb-0.5"
                  >
                    Browse Catalogue
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Sticky Summary Footer Area */}
            <div className="relative p-8 space-y-4 bg-white/90 backdrop-blur-xl border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-mono font-bold">KSh {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Store Fulfillment</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Calculated Next</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                  <p className="text-3xl font-mono font-black text-gray-900">KSh {totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={() => { user ? router.push(`/agrovetecommerce/checkout`) : handleGoogleSignIn(); }}
                style={{ backgroundColor: cart.length === 0 ? undefined : primary }}
                className="block w-full py-5 bg-gray-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-gray-400 italic">
                Verified genuine products sourced directly from registered distributors.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}