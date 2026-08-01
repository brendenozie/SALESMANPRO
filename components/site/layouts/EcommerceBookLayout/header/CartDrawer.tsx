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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col min-h-screen"
          > 
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Your Basket</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: primaryColor }}>
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

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="bg-zinc-50 border-b border-zinc-100 p-4 px-6">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-zinc-700">
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      🎉 Complimentary Shipping Unlocked!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-zinc-900">KES {amountToFreeShipping.toLocaleString()}</strong> more for free delivery
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ width: `${freeShippingProgress}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white">
              {cart.length > 0 ? (
                cart.map((item: any) => {
                  const sortedOptionsString = Object.keys(item.selectedOptions || {})
                    .sort()
                    .reduce((acc, key) => `${acc}-${key}:${item.selectedOptions[key]}`, '');
                  
                  const uniqueVariantKey = item.uid || `${item.id}${sortedOptionsString}`;
                  const unitPrice = item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0;

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
                          unoptimized
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-serif italic text-zinc-900 text-base leading-tight mb-0.5">{item.name}</h3>
                        
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
                          KES {unitPrice.toLocaleString()}
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
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Options Panel */}
            {cart.length > 0 && (
              <div className="relative p-6 space-y-4 bg-white/90 backdrop-blur-xl border-t border-zinc-100 shadow-lg">
                
                {/* Fulfillment Selection */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShippingMethod('standard')}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col items-center justify-center text-center ${
                      shippingMethod === 'standard' 
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <TruckIcon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Standard</span>
                    <span className="text-[9px] opacity-80">
                      {isFreeShipping ? 'Free' : `KES ${standardRate.toLocaleString()}`}
                    </span>
                  </button>

                  <button
                    onClick={() => setShippingMethod('express')}
                    className={`p-2 rounded-lg border text-left transition-all flex flex-col items-center justify-center text-center ${
                      shippingMethod === 'express' 
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' 
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <BoltIcon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Express</span>
                    <span className="text-[9px] opacity-80">
                      {isFreeShipping ? 'Free' : `KES ${expressRate.toLocaleString()}`}
                    </span>
                  </button>

                  {shippingSettings?.enablePickup !== false && (
                    <button
                      onClick={() => setShippingMethod('pickup')}
                      className={`p-2 rounded-lg border text-left transition-all flex flex-col items-center justify-center text-center ${
                        shippingMethod === 'pickup' 
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm' 
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Pickup</span>
                      <span className="text-[9px] opacity-80">Free</span>
                    </button>
                  )}
                </div>

                {/* Subtotal & Estimated Total */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="text-zinc-900 font-bold">KES {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">Shipping Fee</span>
                    <span className="text-zinc-900 font-bold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                      ) : (
                        `KES ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-zinc-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                      <p className="text-2xl font-black text-zinc-900">KES {estimatedTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => { user ? router.push(`/bookecommerce/checkout`) : handleGoogleSignIn() }}
                    className="w-full py-4 text-white text-center font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-[0.98] rounded-none flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Secure Checkout</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
                
                <p className="text-[9px] text-center text-zinc-400 italic pt-1">
                  Each parcel is carefully packed to safeguard covers, dust jackets, and binding elements.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}