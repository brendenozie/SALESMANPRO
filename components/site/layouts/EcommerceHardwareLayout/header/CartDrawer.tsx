'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ShoppingBagIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const router = useRouter();

  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; 

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // 1. Fully aligned Unique Composite Key builder matching the Product Card architecture
  const getItemUniqueKey = (item: any) => {
    if (item.uid) return item.uid; // Prioritize the robust composite UID string generated upstream
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      const sortedOptions = Object.keys(item.selectedOptions)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: item.selectedOptions[key] }), {});
      return `${item.id}-${JSON.stringify(sortedOptions)}`;
    }
    return item.id;
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
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer: Industrial Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0A0A] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[101] flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#0A0A0A] sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase">Your Manifest</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: primary }}>
                  Commercial Supply Queue
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const itemKey = getItemUniqueKey(item);
                  return (
                    <motion.div 
                      layout
                      key={itemKey} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex gap-4 items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-6"
                    >
                      {/* Technical Image Thumb */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189'} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-2"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Line Item Data Details */}
                      <div className="flex-grow flex flex-col min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight truncate uppercase">
                          {item.name}
                        </h3>
                        
                        {/* Dynamic Option Manifest Custom Tags */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, val]: [string, any]) => (
                              <span 
                                key={key}
                                className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-tight"
                              >
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Explicit price indicator capturing calculated variant base surcharges */}
                        <p className="font-black text-sm mt-1.5" style={{ color: primary }}>
                          Kes {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Quantity Logic Handlers */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-2 py-0.5">
                            <button 
                              type="button"
                              onClick={() => decreaseQuantity(itemKey)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black tabular-nums">{item.quantity}</span>
                            <button 
                              type="button"
                              onClick={() => addToCart(item)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFromCart(itemKey)} 
                            className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors"
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
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <ShoppingBagIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-md font-black uppercase tracking-tight">Manifest Empty</h3>
                  <p className="text-zinc-400 text-xs max-w-[240px]">No active SKUs or technical materials have been added to your provisioning manifest yet.</p>
                  <button 
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest border-b-2 pb-1 transition-colors hover:text-zinc-900 dark:hover:text-white"
                    style={{ borderColor: primary, color: primary }}
                  >
                    Start Sourcing
                  </button>
                </div>
              )}
            </div>

            {/* Industrial Bottom Stripe Detail */}
            <div className="h-1 w-full flex flex-shrink-0">
               <div className="h-full flex-grow bg-amber-500" />
               <div className="h-full flex-grow bg-zinc-900" />
               <div className="h-full flex-grow bg-amber-500" />
               <div className="h-full flex-grow bg-zinc-900" />
            </div>

            {/* Sticky Order Action Summary Box */}
            <div className="p-8 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800/80 sticky bottom-0">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-900 dark:text-white font-black">
                  Kes {(totalPrice ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Freight Logistics</span>
                <span className="text-emerald-600 font-black text-[10px] tracking-widest">FOB Terminal Free</span>
              </div>
              
              <div className="pt-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Total Payload Weight</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums">
                    Kes {(totalPrice ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { user ? router.push(`/hardwareecommerce/checkout`) : handleGoogleSignIn() }}
                className="block w-full py-5 bg-zinc-900 text-white dark:bg-white dark:text-black text-center font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-black transition-all shadow-xl active:scale-[0.98]"
              >
                Secure Checkout
              </button>
              
              <p className="text-[9px] text-center text-zinc-400 font-medium uppercase tracking-wider">
                🔒 Secure encrypted enterprise procurement pipeline
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}