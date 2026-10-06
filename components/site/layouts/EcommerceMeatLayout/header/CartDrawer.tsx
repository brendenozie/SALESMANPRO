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

  // Dynamic Store Settings & Fallbacks
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#dc2626';
  const whatsappNumber = storeFormData?.contactPhone || storeFormData?.phone || '254700000000';

  // Helper to generate deterministic item keys based on selected options
  const generateSignature = (item: any) => {
    if (item.cartItemId) return item.cartItemId;
    if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
      return `${item.id}-${Object.entries(item.selectedOptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cat, val]) => `${cat}:${val}`)
        .join('-')}`;
    }
    return item.id;
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

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // WhatsApp Order Dispatch Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const storeName = storeFormData?.name || storeFormData?.storeName || 'Coldroom Store';
    
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
`🥩 *ORDER MANIFEST - ${storeName.toUpperCase()}*

*Selected Cuts:*
${itemLines}

----------------------------------
*Subtotal:* KES ${totalAmount.toLocaleString()}
*Fulfillment:* ${fulfillmentLabel}
*Shipping Fee:* ${shippingCost === 0 ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`}
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
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-stone-50 dark:bg-[#0A0A0A] shadow-2xl z-[101] flex flex-col border-l border-stone-100 dark:border-stone-900 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-900 flex items-center justify-between bg-white dark:bg-[#0f0f0f] sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-stone-900 dark:text-stone-100 uppercase">
                  Your Coldroom Bag
                </h2>
                <p className="text-[10px] text-red-600 font-black tracking-[0.2em] uppercase mt-0.5">
                  Prime Cuts Selected ({cart.length})
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-900 rounded-full transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200/60 dark:border-stone-800">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-black">
                        <TruckIcon className="w-4 h-4 inline" /> Complimentary Delivery Unlocked
                      </span>
                    ) : (
                      <span className="text-stone-500 dark:text-stone-400">
                        Add <strong className="text-stone-900 dark:text-stone-100">KES {amountToFreeShipping.toLocaleString()}</strong> for free delivery
                      </span>
                    )}
                  </span>
                  <span className="text-stone-400 font-mono text-[9px]">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-800 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-red-600"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                <>
                  {cart.map((item: any, idx: number) => {
                    const variantSignature = generateSignature(item);
                    const unitPrice = item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0;
                    const itemTotalPrice = unitPrice * (item.quantity || 1);

                    return (
                      <motion.div 
                        layout
                        key={variantSignature} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex gap-4 items-center border-b border-stone-100 dark:border-stone-900/50 pb-6"
                      >
                        {/* Image Thumbnail */}
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 flex-shrink-0 border border-stone-200 dark:border-stone-800">
                          <Image decoding="async" 
                            src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                            alt={item.name || 'Cut'} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-grow">
                          <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm uppercase leading-tight mb-0.5">
                            {item.name}
                          </h3>
                          
                          {/* Selected Specifications */}
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
                            KES {itemTotalPrice.toLocaleString()}
                          </p>
                          
                          {/* Counter & Delete Controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-1.5 py-0.5">
                              <button 
                                onClick={() => decreaseQuantity(variantSignature, item.selectedOptions || {})} 
                                className="p-1 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
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
                                className="p-1 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <PlusIcon className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(variantSignature, item.selectedOptions || {})} 
                              className="text-stone-300 dark:text-stone-700 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Fulfillment Method Selection */}
                  <div className="pt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-3">
                      Select Fulfillment Strategy
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'standard' 
                            ? 'border-red-600 bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Standard</p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {isFreeShipping ? 'Free' : `KES ${standardRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'express' 
                            ? 'border-red-600 bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Express</p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {isFreeShipping ? 'Free' : `KES ${expressRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'pickup' 
                            ? 'border-red-600 bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Pickup</p>
                          <p className="text-[8px] opacity-80 mt-0.5">Free</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center text-3xl">
                    🥩
                  </div>
                  <p className="text-stone-400 dark:text-stone-500 font-medium text-sm italic max-w-xs">
                    Your coldroom basket is empty. Select from our master artisan cuts...
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-red-600 border-b border-red-600 pb-0.5 cursor-pointer"
                  >
                    Browse Cleaver Cuts
                  </button>
                </div>
              )}
            </div>

            {/* Premium Footer Summary */}
            {cart.length > 0 && (
              <div className="relative p-6 space-y-4 bg-white dark:bg-[#0f0f0f] border-t border-stone-100 dark:border-stone-900">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-medium">Subtotal</span>
                    <span className="text-stone-900 dark:text-stone-100 font-black">
                      KES {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-medium">Vacuum Packing & Logistics</span>
                    <span className={shippingCost === 0 ? "text-emerald-600 font-bold uppercase text-[9px] tracking-widest" : "text-stone-900 dark:text-stone-100 font-black"}>
                      {shippingCost === 0 ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                    <p className="text-3xl font-black text-stone-950 dark:text-white tracking-tighter">
                      KES {estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { user ? router.push(`/meatecommerce/checkout`) : handleGoogleSignIn(); }}
                    className="block w-full py-5 bg-stone-950 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white text-center font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98] cursor-pointer"
                  >
                    Proceed to Secure Checkout
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 border border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded-2xl uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Dispatch Manifest via WhatsApp
                  </button>
                </div>

                <p className="text-[9px] text-center text-stone-400 dark:text-stone-500 italic">
                  Cuts are freshly partitioned, vacuum-sealed and shipped under cold chain dispatch.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}