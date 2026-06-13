'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useStateContext();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // Prevent scroll leaks on operational base canvas layout when HUD is deployed
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Drawer: The Loadout Bay */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl z-[101] flex flex-col overflow-hidden text-white"
          >
            {/* Background HUD Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

            {/* Header: System Comms */}
            <div className="relative p-6 border-b border-white/10 bg-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-red-600 shadow-[0_0_10px_rgba(255,0,60,0.5)]" />
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">Your_Loadout</h2>
                  <p className="text-[9px] text-zinc-500 font-mono tracking-[0.3em] uppercase mt-1">
                    Status: {cart.length > 0 ? 'Gear_Locked' : 'Gear_Pending'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="group p-2 border border-white/10 hover:border-red-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-600" />
              </button>
            </div>

            {/* Cart Items List: Inventory Slots */}
            <div className="relative flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Resolve options string parameters to create absolute unique mapping slots
                  const optionSummary = item.selectedOptions ? Object.values(item.selectedOptions).join('-') : '';
                  const compositeKey = `${item.id}-${optionSummary || idx}`;

                  return (
                    <motion.div 
                      layout
                      key={compositeKey} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group flex gap-4 p-4 bg-zinc-900/40 border border-white/5 hover:border-red-600/30 transition-all overflow-hidden"
                    >
                      {/* Item ID HUD */}
                      <div className="absolute top-0 right-0 p-1 font-mono text-[8px] text-zinc-700">
                        #SPEC_{item.id.slice(-4).toUpperCase()}
                      </div>

                      <div className="relative h-20 w-20 bg-black border border-white/10 overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-1 grayscale group-hover:grayscale-0 transition-all duration-500"
                          loader={({ src }) => src}
                        />
                        <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-black text-white text-xs uppercase tracking-widest leading-tight group-hover:text-red-500 transition-colors max-w-[200px] truncate">
                            {item.name}
                          </h3>

                          {/* Dynamic Specification Options Display Block */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] font-mono tracking-tight text-zinc-500">
                              {Object.entries(item.selectedOptions).map(([specKey, specVal]: [string, any]) => (
                                <span key={specKey} className="inline-block bg-zinc-950 border border-white/5 px-1 py-0.5">
                                  {specKey.toUpperCase()}:{specVal.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-red-600 font-mono text-xs font-bold mt-1">
                            Kes {(item.finalPrice ?? 0).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-white/10 bg-black overflow-hidden">
                            <button 
                              onClick={() => decreaseQuantity(compositeKey)} 
                              className="px-2 py-1 hover:bg-red-600/20 text-zinc-400 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-[10px] font-mono font-bold text-white border-x border-white/10">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="px-2 py-1 hover:bg-red-600/20 text-zinc-400 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(compositeKey)} 
                            className="text-zinc-600 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingCartIcon className="w-12 h-12 text-zinc-800 mb-4 animate-pulse" />
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                    Awaiting Command... <br/> No Gear Detected in Loadout.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2 border border-red-600 text-red-600 font-black text-[10px] uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all"
                  >
                    Initiate Procurement
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary: Mission Logistics */}
            <div className="relative p-8 space-y-4 bg-black border-t border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                  <span className="text-zinc-500">Subtotal_Value</span>
                  <span className="text-white">Kes {(totalPrice ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                  <span className="text-zinc-500">Logistics_Fee</span>
                  <span className="text-green-500 font-black">UNLOCKED_FREE</span>
                </div>
              </div>
              
              <div className="py-4 border-y border-white/5 flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.3em]">Total_Liability</p>
                  <p className="text-4xl font-black text-white italic tracking-tighter leading-none mt-1">
                    Kes {(totalPrice ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                disabled={cart.length === 0}
                className="group relative w-full py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 90% 100%, 0 100%)' }}
              >
                <span className="relative z-10">Confirm_Deployment</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </button>
              
              <div className="flex items-center justify-center gap-2">
                 <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                 <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest text-center">
                    Secure Tactical Link Active // Encrypted_v4.2
                 </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}