'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
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

  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Lock body scroll when inventory overlay is active
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Tactical Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
          />

          {/* Drawer: The Loadout Bay */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#080808] border-l border-white/5 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] z-[101] flex flex-col overflow-hidden"
          >
            {/* Background HUD Grid Detail */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* Header: System Comms */}
            <div className="relative p-8 border-b border-white/5 bg-black/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: primary }} />
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Your_Loadout</h2>
                  <p className="text-[10px] text-white/30 font-mono tracking-[0.4em] uppercase mt-2">Active_Inventory // {cart.length} Units</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="group p-3 rounded-full border border-white/5 hover:border-white/20 transition-all active:scale-90"
              >
                <XMarkIcon className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="relative flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const targetUniqueId = item.cartItemId || item.id;
                  const itemPrice = item.calculatedPrice ?? item.finalPrice ?? 0;
                  const hasSelectedSpecs = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;

                  return (
                    <motion.div 
                      layout
                      key={targetUniqueId} 
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group flex gap-5 p-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                    >
                      {/* Item HUD ID */}
                      <div className="absolute top-2 right-4 font-mono text-[7px] text-white/10 uppercase tracking-widest">
                        ID_REF: {item.id.slice(-6)}
                      </div>

                      <div className="relative h-24 w-24 bg-black border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-white/30 transition-colors">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                          loader={({ src }) => src}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-black text-white text-[13px] uppercase tracking-tighter leading-tight group-hover:italic transition-all">
                            {item.name}
                          </h3>

                          {/* Structural Variant Configuration Specifications Layout */}
                          {hasSelectedSpecs && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {Object.entries(item.selectedOptions).map(([category, selection]) => (
                                <span 
                                  key={category} 
                                  className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/5 text-white/50 border border-white/5 rounded"
                                >
                                  {category}: <span className="text-white">{String(selection)}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="font-mono text-xs font-bold mt-2" style={{ color: primary }}>
                            Kes {itemPrice.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-white/5 bg-black/40">
                            <button 
                              onClick={() => decreaseQuantity(targetUniqueId)} 
                              className="px-3 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 text-[11px] font-black text-white border-x border-white/5">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="px-3 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(targetUniqueId)} 
                            className="p-2 text-white/10 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: primary }} />
                    <ShoppingBagIcon className="w-20 h-20 text-white relative z-10" />
                  </div>
                  <p className="text-white font-mono text-[10px] uppercase tracking-[0.5em] leading-relaxed">
                    Zero_Units_Detected <br/> Awaiting_System_Input
                  </p>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="relative p-10 space-y-6 bg-black border-t border-white/10">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/20 italic">Value_Assessment</span>
                  <span className="text-white/60">Kes {totalPrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/20 italic">Global_Logistics</span>
                  <span className="text-green-500">FREE_ACC_GRANTED</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-2 opacity-30">Liability_Aggregate</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
                    Kes {totalPrice?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                disabled={cart.length === 0}
                className="group relative w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-transparent hover:text-white border border-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 92% 100%, 0% 100%)' }}
              >
                <span className="relative z-10 mix-blend-difference group-hover:text-white">
                  {user ? 'Initialize_Deployment' : 'Uplink_Identity_To_Deploy'}
                </span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              
              <div className="flex flex-col items-center gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                    <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">
                      Secure_Uplink: Established
                    </span>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}