'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon, 
  ChevronRightIcon,
  TruckIcon,
  BoltIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export type ShippingSettings = {
  id: string;
  carrierName: string | null;
  trackingUrl: string | null;
  regions: string[] | Record<string, any> | null;
  enablePickup: boolean | null;
  pickupInstructions: string | null;
  standardRate: number | null;
  expressRate: number | null;
  freeShippingThreshold?: number | null;
};

const DEFAULT_FREE_SHIPPING_THRESHOLD = 15000;

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export default function CartDrawer({ isCartOpen, setIsCartOpen }: CartDrawerProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');

  // Dynamic Theme & Store Integration
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#DC2626'; // Red accent default
  const whatsappNumber = storeFormData?.contactPhone || storeFormData?.phone || '254700000000';

  // Normalize shipping settings
  const shippingSettings: ShippingSettings | undefined = useMemo(() => {
    const raw = storeFormData?.shippingSettings;
    if (!raw) return undefined;

    let regions: string[] | Record<string, any> | null = null;
    try {
      if (Array.isArray(raw.regions)) {
        regions = raw.regions;
      } else if (raw.regions && typeof raw.regions === 'object') {
        regions = raw.regions as Record<string, any>;
      } else if (typeof raw.regions === 'string') {
        regions = JSON.parse(raw.regions || '{}');
      }
    } catch (e) {
      regions = null;
    }

    return { ...raw, regions } as ShippingSettings;
  }, [storeFormData?.shippingSettings]);

  // Subtotal Accumulator
  const totalAmount = useMemo(() => {
    return cart.reduce((accum: number, currentItem: any) => {
      const unitPrice = currentItem.finalPrice ?? currentItem.sellingPrice ?? 0;
      return accum + (unitPrice * (currentItem.quantity || 1));
    }, 0);
  }, [cart]);

  const freeShippingThreshold = useMemo(() => {
    if (typeof shippingSettings?.freeShippingThreshold === 'number') {
      return shippingSettings.freeShippingThreshold;
    }
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }, [shippingSettings]);

  const isFreeShipping = totalAmount >= freeShippingThreshold && totalAmount > 0;
  const standardRate = shippingSettings?.standardRate ?? 0;
  const expressRate = shippingSettings?.expressRate ?? 0;

  const shippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (shippingMethod === 'pickup') return 0;
    if (isFreeShipping) return 0;
    return shippingMethod === 'express' ? expressRate : standardRate;
  }, [isFreeShipping, shippingMethod, expressRate, standardRate, cart.length]);

  const estimatedTotal = totalAmount + shippingCost;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - totalAmount);
  const freeShippingProgress = Math.min(100, (totalAmount / freeShippingThreshold) * 100);

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const getItemSignatureId = (item: any) => {
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.id}-${JSON.stringify(item.selectedOptions)}`;
    }
    return item.id;
  };

  // WhatsApp Checkout Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const storeName = storeFormData?.name || storeFormData?.storeName || 'Store';
    
    const itemLines = cart.map((item: any, idx: number) => {
      const optionsText = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
        ? ` (${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      const price = (item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString();
      return `${idx + 1}. *${item.name}*${optionsText}\n   Qty: ${item.quantity} | Unit: Kes ${price}`;
    }).join('\n\n');

    const fulfillmentLabel = shippingMethod === 'pickup' 
      ? 'Store Pickup' 
      : `${shippingMethod.toUpperCase()} Delivery`;

    const message = 
`🛒 *NEW ORDER REQUEST - ${storeName.toUpperCase()}*

*Order Items:*
${itemLines}

----------------------------------
*Subtotal:* Kes ${totalAmount.toLocaleString()}
*Fulfillment:* ${fulfillmentLabel}
*Shipping Fee:* Kes ${shippingCost.toLocaleString()}
*Total Amount:* *Kes ${estimatedTotal.toLocaleString()}*
----------------------------------

*Customer Info:*
Name: ${user?.name || 'Guest Customer'}

Please confirm item availability and payment details. Thank you!`;

    const cleanedPhone = whatsappNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

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
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }} 
            />

            {/* Header: System Comms */}
            <div className="relative p-6 border-b border-white/10 bg-black flex items-center justify-between z-10">
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

            {/* Free Shipping HUD Bar */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-zinc-900/80 border-b border-white/5 relative z-10 font-mono">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <TruckIcon className="w-3.5 h-3.5 inline" /> Logistics_Threshold_Reached
                      </span>
                    ) : (
                      <span className="text-zinc-400">
                        Add <strong className="text-white">Kes {amountToFreeShipping.toLocaleString()}</strong> for free delivery
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-500">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List: Inventory Slots */}
            <div className="relative flex-grow overflow-y-auto p-6 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-10">
              {cart.length > 0 ? (
                <>
                  {cart.map((item: any, idx: number) => {
                    const targetSigId = getItemSignatureId(item);
                    const itemUnitPrice = item.finalPrice ?? item.sellingPrice ?? 0;
                    const itemTotalPrice = itemUnitPrice * (item.quantity || 1);

                    return (
                      <motion.div 
                        layout
                        key={targetSigId} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group flex gap-4 p-4 bg-zinc-900/40 border border-white/5 hover:border-red-600/30 transition-all overflow-hidden"
                      >
                        {/* Item ID HUD */}
                        <div className="absolute top-0 right-0 p-1 font-mono text-[8px] text-zinc-700 uppercase">
                          #SPEC_{item.id ? String(item.id).slice(-4) : '0000'}
                        </div>

                        <div className="relative h-20 w-20 bg-black border border-white/10 overflow-hidden flex-shrink-0">
                          <Image 
                            src={item.images?.[0] || '/placeholder.png'} 
                            alt={item.name || "Item Spec Image"} 
                            fill 
                            className="object-contain p-1 grayscale group-hover:grayscale-0 transition-all duration-500"
                            loader={({ src }) => src}
                          />
                          <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay" />
                        </div>
                        
                        <div className="flex-grow flex flex-col justify-between text-left">
                          <div>
                            <h3 className="font-black text-white text-xs uppercase tracking-widest leading-tight group-hover:text-red-500 transition-colors max-w-[180px] truncate">
                              {item.name}
                            </h3>

                            {/* Options Specifications */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] font-mono tracking-tight text-zinc-500">
                                {Object.entries(item.selectedOptions).map(([specKey, specVal]: [string, any]) => (
                                  <span key={specKey} className="inline-block bg-zinc-950 border border-white/5 px-1 py-0.5 uppercase">
                                    {specKey}:{String(specVal)}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-red-500 font-mono text-xs font-bold mt-1">
                              Kes {itemTotalPrice.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-white/10 bg-black overflow-hidden">
                              <button 
                                onClick={() => decreaseQuantity(targetSigId)} 
                                className="px-2 py-1 hover:bg-red-600/20 text-zinc-400 transition-colors cursor-pointer"
                              >
                                <MinusIcon className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-[10px] font-mono font-bold text-white border-x border-white/10">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="px-2 py-1 hover:bg-red-600/20 text-zinc-400 transition-colors cursor-pointer"
                              >
                                <PlusIcon className="w-3 h-3" />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(targetSigId)} 
                              className="text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Fulfillment Selector */}
                  <div className="pt-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 block mb-2">
                      Fulfillment_Protocol
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-2 border text-left flex flex-col justify-between transition-all cursor-pointer font-mono ${
                          shippingMethod === 'standard' 
                            ? 'border-red-600 bg-red-950/20 text-white' 
                            : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1 text-red-500" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Standard</p>
                          <p className="text-[8px] opacity-70 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${standardRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-2 border text-left flex flex-col justify-between transition-all cursor-pointer font-mono ${
                          shippingMethod === 'express' 
                            ? 'border-red-600 bg-red-950/20 text-white' 
                            : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1 text-red-500" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Express</p>
                          <p className="text-[8px] opacity-70 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${expressRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-2 border text-left flex flex-col justify-between transition-all cursor-pointer font-mono ${
                          shippingMethod === 'pickup' 
                            ? 'border-red-600 bg-red-950/20 text-white' 
                            : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <BuildingStorefrontIcon className="w-4 h-4 mb-1 text-red-500" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Pickup</p>
                          <p className="text-[8px] opacity-70 mt-0.5">Free</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBagIcon className="w-12 h-12 text-zinc-800 mb-4 animate-pulse" />
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                    Awaiting Command... <br/> No Gear Detected in Loadout.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2 border border-red-600 text-red-600 font-black text-[10px] uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                  >
                    Initiate Procurement
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary: Mission Logistics */}
            {cart.length > 0 && (
              <div className="relative p-6 space-y-4 bg-black border-t border-white/10 z-10">
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between items-center text-[10px] uppercase">
                    <span className="text-zinc-500">Subtotal_Value</span>
                    <span className="text-white">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase">
                    <span className="text-zinc-500">Logistics_Fee</span>
                    <span className={shippingCost === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                      {shippingCost === 0 ? 'COMPLIMENTARY' : `Kes ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                <div className="py-3 border-y border-white/10 flex justify-between items-end text-left">
                  <div>
                    <p className="text-[9px] text-red-500 font-black font-mono uppercase tracking-[0.3em]">Total_Liability</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none mt-1">
                      Kes {estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                    disabled={cart.length === 0}
                    className="group relative w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] overflow-hidden transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 92% 100%, 0 100%)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Confirm_Deployment
                      <ChevronRightIcon className="w-4 h-4" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/30 text-white font-bold font-mono uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Order via WhatsApp
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest text-center">
                    Secure Tactical Link Active // Encrypted_v4.2
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}