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
  MapPinIcon
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

// Default threshold fallback if not defined in store settings
const DEFAULT_FREE_SHIPPING_THRESHOLD = 15000;

export default function CartDrawer({ 
  isCartOpen, 
  setIsCartOpen 
}: { 
  isCartOpen: boolean; 
  setIsCartOpen: (open: boolean) => void 
}) {
  const { cart, addToCart, decreaseQuantity, removeFromCart, totalPrice } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  // Shipping Selection State ('standard' | 'express' | 'pickup')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');

  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const whatsAppContact = storeFormData?.contactPhone || '';
  const storeName = storeFormData?.name || 'Shoe Store';

  // Normalize shippingSettings to match the new JSON schema
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

    return {
      ...raw,
      regions,
    } as ShippingSettings;
  }, [storeFormData?.shippingSettings]);

  // Dynamic Free Shipping Threshold calculation
  const freeShippingThreshold = useMemo(() => {
    if (typeof shippingSettings?.freeShippingThreshold === 'number') {
      return shippingSettings.freeShippingThreshold;
    }
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }, [shippingSettings]);

  const isFreeShipping = (totalPrice || 0) >= freeShippingThreshold;

  // Rates calculation based on store settings
  const standardRate = shippingSettings?.standardRate ?? 0;
  const expressRate = shippingSettings?.expressRate ?? 0;

  // Calculate selected shipping cost
  const shippingCost = useMemo(() => {
    if (shippingMethod === 'pickup') return 0;
    // if (isFreeShipping) return 0;
    return shippingMethod === 'express' ? expressRate : standardRate;
  }, [isFreeShipping, shippingMethod, expressRate, standardRate]);

  // Combined Grand Total
  const grandTotal = useMemo(() => {
    return (totalPrice || 0) + shippingCost;
  }, [totalPrice, shippingCost]);

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}/ecommerce/checkout`);
    window.location.href = authUrl.toString();
  };

  // Generate formatted WhatsApp message with selected delivery option & exact grand total
  const handleWhatsAppCheckout = () => {
    if (!cart || cart.length === 0) return;

    const cleanPhone = whatsAppContact.replace(/[^0-9]/g, '');
    
    // Format shipping label for WhatsApp
    let shippingLabel = '';
    if (shippingMethod === 'pickup') {
      shippingLabel = 'Local Pickup (FREE)';
    } 
    // else if (isFreeShipping) {
    //   shippingLabel = 'FREE Delivery (Threshold Unlocked)';
    // } 
    else {
      const carrier = shippingSettings?.carrierName ? `${shippingSettings.carrierName} ` : '';
      shippingLabel = `${carrier}${shippingMethod === 'express' ? 'Express' : 'Standard'} Delivery (KES ${shippingCost.toLocaleString()})`;
    }

    let message = `👟 *NEW ORDER - ${storeName.toUpperCase()}*\n`;
    message += `─────────────────────────\n\n`;
    message += `*Selected Items:*\n\n`;

    cart.forEach((item: any, idx: number) => {
      const options = item.selectedOptions || {};
      const sizeStr = options.Size || options.size || item.size || '';
      const colorStr = options.Color || options.color || item.color || '';

      message += `${idx + 1}. *${item.name}*\n`;
      if (sizeStr) message += `   • Size: *${sizeStr}*\n`;
      if (colorStr) message += `   • Color: ${colorStr}\n`;
      message += `   • Qty: ${item.quantity} × KES ${(item.finalPrice || 0).toLocaleString()}\n`;
      message += `   • Item Total: KES ${((item.finalPrice || 0) * item.quantity).toLocaleString()}\n\n`;
    });

    message += `─────────────────────────\n`;
    message += `*Items Subtotal:* KES ${(totalPrice || 0).toLocaleString()}\n`;
    message += `*Shipping Method:* ${shippingLabel}\n`;
    message += `*GRAND TOTAL:* KES ${grandTotal.toLocaleString()}\n\n`;
    message += `Hi! I would like to complete my order for these items. Please confirm availability and delivery steps.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
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
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[100]"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0c0c0c] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] dark:shadow-[-20px_0_80px_rgba(0,0,0,0.6)] border-l border-zinc-100 dark:border-zinc-900 z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
                  Bag<span style={{ color: primary }} className="font-black">.</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {cart.length} {cart.length === 1 ? 'Pair Selected' : 'Pairs Selected'}
                </span>
              </div>

              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                aria-label="Close cart"
              >
                <XMarkIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const options = item.selectedOptions || {};
                  const sizeKey = Object.keys(options).find(k => k.toLowerCase() === 'size') || '';
                  const shoeSize = sizeKey ? options[sizeKey] : item.size;

                  const itemKey = item.cartItemId || (item.id + (item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''));

                  return (
                    <motion.div 
                      layout
                      key={itemKey} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      className="flex gap-4 group relative pb-6 border-b border-zinc-100/80 dark:border-zinc-900/80 last:border-none"
                    >
                      {/* Shoe Thumbnail */}
                      <div className="relative h-28 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-200/50 dark:border-zinc-800/80">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} 
                          alt={item.name} 
                          fill 
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Shoe Details */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-tight leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                {item.name}
                              </h3>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {shoeSize && (
                                  <span className="inline-flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                                    Size: {shoeSize}
                                  </span>
                                )}

                                {options && Object.entries(options).map(([category, value]: any) => {
                                  if (category.toLowerCase() === 'size') return null;
                                  return (
                                    <span 
                                      key={category} 
                                      className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400"
                                    >
                                      {category}: {value}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <button 
                              onClick={() => removeFromCart(item.cartItemId || item.id)} 
                              className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors flex-shrink-0"
                              aria-label="Remove item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Quantity Controls & Price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/90 rounded-xl px-1.5 py-1 border border-zinc-200/60 dark:border-zinc-800">
                            <button 
                              onClick={() => decreaseQuantity(item.cartItemId || item.id)} 
                              className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-none hover:shadow-sm"
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-black text-zinc-900 dark:text-white">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-none hover:shadow-sm"
                              aria-label="Increase quantity"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">
                            KES {((item.finalPrice || 0) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
                    <ShoppingBagIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Your bag is empty</h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 max-w-[200px] font-medium leading-relaxed">
                    Explore our shoe collection and find your perfect fit.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-xs font-black uppercase tracking-[0.2em] underline underline-offset-8 decoration-2 hover:opacity-80 transition-opacity"
                    style={{ textDecorationColor: primary }}
                  >
                    Start Browsing
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary & Delivery Selection */}
            {cart.length > 0 && (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200/80 dark:border-zinc-800 space-y-4 backdrop-blur-md">
                
                {/* Shipping Selection Segment */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                    Delivery Speed
                  </span>
                  
                  {/* Dynamic grid depending on pickup availability */}
                  <div className={`grid gap-2 ${shippingSettings?.enablePickup ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    
                    {/* Standard Shipping Option */}
                    <button
                      type="button"
                      onClick={() => setShippingMethod('standard')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        shippingMethod === 'standard'
                          ? 'border-zinc-900 bg-white dark:bg-zinc-900 dark:border-white shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-950/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <TruckIcon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                          {/* {isFreeShipping ? 'FREE' : standardRate > 0 ? `KES ${standardRate.toLocaleString()}` : 'Free'} */}
                          {standardRate > 0 ? `KES ${standardRate.toLocaleString()}` : 'Free'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-white block leading-none truncate">
                          {shippingSettings?.carrierName || 'Standard'}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium">3-5 Days</span>
                      </div>
                    </button>

                    {/* Express Shipping Option */}
                    <button
                      type="button"
                      onClick={() => setShippingMethod('express')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        shippingMethod === 'express'
                          ? 'border-amber-500 bg-white dark:bg-zinc-900 dark:border-amber-400 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-950/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <BoltIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-tight text-amber-600 dark:text-amber-400">
                          {/* {isFreeShipping ? 'FREE' : expressRate > 0 ? `KES ${expressRate.toLocaleString()}` : 'Free'} */}
                          {expressRate > 0 ? `KES ${expressRate.toLocaleString()}` : 'Free'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[11px] font-black text-zinc-900 dark:text-white block leading-none truncate">
                           Express
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium">1-2 Days</span>
                      </div>
                    </button>

                    {/* Local Pickup Option (Conditional) */}
                    {shippingSettings?.enablePickup && (
                      <button
                        type="button"
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          shippingMethod === 'pickup'
                            ? 'border-emerald-500 bg-white dark:bg-zinc-900 dark:border-emerald-400 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-950/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <MapPinIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">
                            FREE
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[11px] font-black text-zinc-900 dark:text-white block leading-none truncate">
                            Pickup
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium truncate" title={shippingSettings.pickupInstructions || 'Local Pickup'}>
                            {shippingSettings.pickupInstructions || 'In-store'}
                          </span>
                        </div>
                      </button>
                    )}

                  </div>
                </div>

                {/* Subtotal Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 dark:text-white">KES {(totalPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    <span>Shipping ({shippingMethod})</span>
                    <span className="font-black tracking-widest" 
                    // style={{ color: isFreeShipping || shippingCost === 0 ? '#10b981' : primary }}
                    style={{ color: shippingCost === 0 ? '#10b981' : primary }}
                    >
                      {/* {isFreeShipping || shippingCost === 0 ? 'FREE' : `KES ${shippingCost.toLocaleString()}`} */}
                      {shippingCost === 0 ? 'FREE' : `KES ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                {/* Grand Total Display */}
                <div className="pt-2 flex justify-between items-end border-t border-zinc-200/60 dark:border-zinc-800/80">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Grand Total</span>
                    <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none italic mt-1">
                      KES {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {/* Standard Web Checkout */}
                  <motion.button
                    whileHover={{ scale: 1.01, filter: "brightness(1.05)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { 
                      setIsCartOpen(false); 
                      user ? router.push(`/ecommerce/checkout?shipping=${shippingMethod}`) : handleGoogleSignIn(); 
                    }}
                    className="w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    style={{ backgroundColor: primary }}
                  >
                    Standard Checkout
                    <ChevronRightIcon className="w-4 h-4 stroke-[3]" />
                  </motion.button>

                  {/* WhatsApp Direct Order */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.18em] text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-500/30 active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Order via WhatsApp
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">
                    Fast & Direct Checkout
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}