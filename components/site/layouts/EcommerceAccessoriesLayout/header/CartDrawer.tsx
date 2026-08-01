'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ChevronRightIcon,
  TruckIcon,
  BoltIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon
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

  // Dynamic Store Settings & Fallbacks
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#f59e0b';
  const whatsappNumber = storeFormData?.contactPhone || storeFormData?.phone || '254700000000';

  // Helper to construct item keys for variant combinations
  const getItemUniqueKey = (item: any): string => {
    if (item.cartItemId) return item.cartItemId;
    if (item.id && item.selectedOptions) {
      const optionsStr = Object.entries(item.selectedOptions)
        .map(([k, v]) => `${k}:${v}`)
        .sort()
        .join('-');
      return `${item.id}-${optionsStr}`;
    }
    return item.id || item._id;
  };

  // Safely normalize shipping configuration
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

  // Cart Management Action Handlers
  const handleRemoveFromCart = (item: any, key: string) => {
    if (removeFromCart) {
      removeFromCart(key || item);
    }
  };

  const handleDecreaseQuantity = (item: any, key: string) => {
    if (decreaseQuantity) {
      decreaseQuantity(key || item);
    }
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // WhatsApp Order Dispatch Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const storeName = storeFormData?.name || storeFormData?.storeName || 'Commercial Store';
    
    const itemLines = cart.map((item: any, idx: number) => {
      const optionsText = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
        ? ` (${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      const price = (item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString();
      return `${idx + 1}. *${item.name}*${optionsText}\n   Qty: ${item.quantity} | Unit: KES ${price}`;
    }).join('\n\n');

    const fulfillmentLabel = shippingMethod === 'pickup' 
      ? 'Store Pickup' 
      : `${shippingMethod.toUpperCase()} Delivery`;

    const message = 
`📦 *ORDER MANIFEST - ${storeName.toUpperCase()}*

*Selected Items:*
${itemLines}

----------------------------------
*Subtotal:* KES ${totalAmount.toLocaleString()}
*Fulfillment:* ${fulfillmentLabel}
*Freight/Shipping:* ${shippingCost === 0 ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`}
*Total Amount:* *KES ${estimatedTotal.toLocaleString()}*
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
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
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: primaryColor }}>
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

            {/* Free Shipping Progress Bar */}
            {cart.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-500 font-extrabold flex items-center gap-1">
                        <TruckIcon className="w-3.5 h-3.5 inline" /> Complimentary Freight Unlocked!
                      </span>
                    ) : (
                      `Add KES ${amountToFreeShipping.toLocaleString()} for Free Freight`
                    )}
                  </span>
                  <span>{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: isFreeShipping ? '#10b981' : primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const itemKey = getItemUniqueKey(item);
                  const unitPrice = item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0;

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
                      {/* Image Thumbnail */}
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                        <Image 
                          src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189'} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-2"
                          sizes="80px"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Line Item Details */}
                      <div className="flex-grow flex flex-col min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight truncate uppercase">
                          {item.name}
                        </h3>
                        
                        {/* Option Manifest Tags */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedOptions).map(([key, val]: [string, any]) => (
                              <span 
                                key={key}
                                className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-tight rounded"
                              >
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="font-black text-sm mt-1.5" style={{ color: primaryColor }}>
                          KES {unitPrice.toLocaleString()}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-2 py-0.5">
                            <button 
                              type="button"
                              onClick={() => handleDecreaseQuantity(item, itemKey)} 
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
                            onClick={() => handleRemoveFromCart(item, itemKey)} 
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
                    style={{ borderColor: primaryColor, color: primaryColor }}
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
            {cart.length > 0 && (
              <div className="p-6 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800/80 sticky bottom-0">
                {/* Fulfillment Selection Tabs */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Logistics Option</span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('standard')}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        shippingMethod === 'standard' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      <TruckIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Standard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod('express')}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        shippingMethod === 'express' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      <BoltIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Express</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod('pickup')}
                      disabled={shippingSettings?.enablePickup === false}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                        shippingMethod === 'pickup' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600'
                      } ${shippingSettings?.enablePickup === false ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <BuildingStorefrontIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Pickup</span>
                    </button>
                  </div>
                </div>

                {/* Subtotal & Logistics Charges Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 dark:text-white font-black">
                      KES {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <span>Freight Logistics</span>
                    <span className={shippingCost === 0 ? 'text-emerald-500 font-black text-[10px] tracking-widest' : 'text-zinc-900 dark:text-white font-black'}>
                      {shippingCost === 0 ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                {/* Total Payload Price */}
                <div className="pt-2 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Total Payload Weight</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums mt-0.5">
                      KES {estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Checkout CTA Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { user ? router.push(`/hardwareecommerce/checkout`) : handleGoogleSignIn() }}
                    className="block w-full py-4 bg-zinc-900 text-white dark:bg-white dark:text-black text-center font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-black transition-all shadow-xl active:scale-[0.98] rounded-xl flex items-center justify-center gap-2"
                  >
                    <span>Secure Checkout</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
                
                <p className="text-[9px] text-center text-zinc-400 font-medium uppercase tracking-wider">
                  🔒 Secure encrypted enterprise procurement pipeline
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}