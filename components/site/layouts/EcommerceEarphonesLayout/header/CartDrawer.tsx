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
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#6366F1'; // Cyber Indigo Accent
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
      const unitPrice = currentItem.calculatedPrice ?? currentItem.finalPrice ?? currentItem.sellingPrice ?? 0;
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
    if (item.cartItemId) return item.cartItemId;
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.id}-${JSON.stringify(item.selectedOptions)}`;
    }
    return item.id;
  };

  // WhatsApp Instant Dispatch Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const storeName = storeFormData?.name || storeFormData?.storeName || 'Store';
    
    const itemLines = cart.map((item: any, idx: number) => {
      const optionsText = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
        ? ` (${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      const price = (item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString();
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
*Shipping Fee:* ${shippingCost === 0 ? 'Complimentary' : `Kes ${shippingCost.toLocaleString()}`}
*Total Amount:* *Kes ${estimatedTotal.toLocaleString()}*
----------------------------------

*Customer Info:*
Name: ${user?.name || 'Guest Customer'}

Please confirm availability and dispatch details. Thank you!`;

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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
          />

          {/* Drawer: Tactical Loadout Bay */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#080808] border-l border-white/5 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] z-[101] flex flex-col overflow-hidden"
          >
            {/* Background HUD Grid */}
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none" 
              style={{ 
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
                backgroundSize: '40px 40px' 
              }} 
            />

            {/* Header: System Comms */}
            <div className="relative p-8 border-b border-white/5 bg-black/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ backgroundColor: primaryColor }} />
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">Your_Loadout</h2>
                  <p className="text-[10px] text-white/30 font-mono tracking-[0.4em] uppercase mt-2">Active_Inventory // {cart.length} Units</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="group p-3 rounded-full border border-white/5 hover:border-white/20 transition-all active:scale-90 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>
            </div>

            {/* Free Shipping HUD Bar */}
            {cart.length > 0 && (
              <div className="px-8 py-3 bg-white/[0.02] border-b border-white/5 relative z-10">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-widest mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-black">
                        <TruckIcon className="w-3.5 h-3.5 inline" /> Complimentary Delivery Unlocked
                      </span>
                    ) : (
                      <span className="text-white/40">
                        Add <strong className="text-white font-mono">Kes {amountToFreeShipping.toLocaleString()}</strong> for free delivery
                      </span>
                    )}
                  </span>
                  <span className="text-white/30 font-mono">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="relative flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {cart.length > 0 ? (
                <>
                  {cart.map((item: any, idx: number) => {
                    const targetUniqueId = getItemSignatureId(item);
                    const itemUnitPrice = item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0;
                    const itemTotalPrice = itemUnitPrice * (item.quantity || 1);
                    const hasSelectedSpecs = item.selectedOptions && Object.keys(item.selectedOptions).length > 0;

                    return (
                      <motion.div 
                        layout
                        key={targetUniqueId} 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group flex gap-5 p-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                      >
                        {/* Item HUD ID */}
                        <div className="absolute top-2 right-4 font-mono text-[7px] text-white/10 uppercase tracking-widest">
                          ID_REF: {String(item.id).slice(-6)}
                        </div>

                        <div className="relative h-24 w-24 bg-black border border-white/10 overflow-hidden flex-shrink-0 group-hover:border-white/30 transition-colors">
                          <Image 
                            src={item.images?.[0] || '/placeholder.png'} 
                            alt={item.name || 'Product Image'} 
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

                            {/* Options Breakdown */}
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

                            <p className="font-mono text-xs font-bold mt-2" style={{ color: primaryColor }}>
                              Kes {itemTotalPrice.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-white/5 bg-black/40">
                              <button 
                                onClick={() => decreaseQuantity(targetUniqueId)} 
                                className="px-3 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-4 text-[11px] font-black font-mono text-white border-x border-white/5">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="px-3 py-1.5 hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(targetUniqueId)} 
                              className="p-2 text-white/20 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Fulfillment Selector */}
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-white/30 block mb-3">
                      Logistics_Fulfillment
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-3 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'standard' 
                            ? 'border-white bg-white text-black' 
                            : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider font-mono">Standard</p>
                          <p className="text-[8px] opacity-70 mt-0.5 font-mono">
                            {isFreeShipping ? 'Free' : `Kes ${standardRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-3 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'express' 
                            ? 'border-white bg-white text-black' 
                            : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider font-mono">Express</p>
                          <p className="text-[8px] opacity-70 mt-0.5 font-mono">
                            {isFreeShipping ? 'Free' : `Kes ${expressRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-3 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'pickup' 
                            ? 'border-white bg-white text-black' 
                            : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                        }`}
                      >
                        <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider font-mono">Pickup</p>
                          <p className="text-[8px] opacity-70 mt-0.5 font-mono">Free</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: primaryColor }} />
                    <ShoppingBagIcon className="w-20 h-20 text-white relative z-10" />
                  </div>
                  <p className="text-white font-mono text-[10px] uppercase tracking-[0.5em] leading-relaxed">
                    Zero_Units_Detected <br/> Awaiting_System_Input
                  </p>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="relative p-8 space-y-4 bg-black border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-widest">
                    <span className="text-white/30 italic">Subtotal</span>
                    <span className="text-white/70">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-widest">
                    <span className="text-white/30 italic">Logistics_Fee</span>
                    <span className={shippingCost === 0 ? "text-emerald-400 font-black" : "text-white/70"}>
                      {shippingCost === 0 ? 'Complimentary' : `Kes ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-1 opacity-30 text-white">Liability_Aggregate</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                      Kes {estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                    disabled={cart.length === 0}
                    className="group relative w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-transparent hover:text-white border border-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 92% 100%, 0% 100%)' }}
                  >
                    <span className="relative z-10 mix-blend-difference group-hover:text-white">
                      {user ? 'Initialize_Deployment' : 'Uplink_Identity_To_Deploy'}
                    </span>
                    <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold rounded-none uppercase tracking-wider text-[11px] font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Dispatch_Via_WhatsApp
                  </button>
                </div>
                
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                    <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest">
                      Secure_Uplink: Established
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}