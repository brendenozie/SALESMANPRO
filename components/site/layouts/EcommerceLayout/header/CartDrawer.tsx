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

  // Cart Management Action Handlers
  const handleRemoveFromCart = (item: any) => {
    if (removeFromCart) {
      removeFromCart(item);
    }
  };

  const handleDecreaseQuantity = (item: any) => {
    if (decreaseQuantity) {
      decreaseQuantity(item);
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
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                  Bag<span className="font-light text-gray-400">.</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">
                  {cart.length} {cart.length === 1 ? 'Configuration' : 'Configurations'} selected
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-3 rounded-full hover:bg-gray-50 transition-colors group"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        <TruckIcon className="w-4 h-4 inline" /> Unlocked Complimentary Shipping!
                      </span>
                    ) : (
                      `Add KES ${amountToFreeShipping.toLocaleString()} more for free delivery`
                    )}
                  </span>
                  <span className="text-gray-400">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
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
                  const optionLabel = item.selectedOptions 
                    ? Object.entries(item.selectedOptions)
                        .map(([category, value]) => `${category}: ${value}`)
                        .join(' • ')
                    : null;

                  const unitPrice = item.calculatedPrice ?? item.finalPrice ?? item.sellingPrice ?? 0;

                  return (
                    <motion.div 
                      layout
                      key={item.id + (optionLabel ? `-${optionLabel}` : `-${idx}`)} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-4 group border-b border-gray-50 pb-6 last:border-b-0"
                    >
                      {/* Image Container */}
                      <div className="relative h-24 w-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image 
                          src={item.images?.[0]?.url || item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          sizes="80px"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col">
                              <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-tight leading-tight max-w-[180px] truncate">
                                {item.name}
                              </h3>
                              {optionLabel && (
                                <span className="text-[10px] font-medium text-gray-400 mt-1 bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 w-max max-w-[180px] truncate">
                                  {optionLabel}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleRemoveFromCart(item)} 
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 pt-0.5"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-black text-sm pt-1" style={{ color: primaryColor }}>
                            KES {unitPrice.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                            <button 
                              onClick={() => handleDecreaseQuantity(item)} 
                              className="p-1 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-black text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Your bag is empty</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-[200px]">Looks like you haven't added anything to your collection yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 text-sm font-black uppercase tracking-widest underline underline-offset-8 decoration-2"
                    style={{ textDecorationColor: primaryColor }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                {/* Fulfillment Selection Tabs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fulfillment Options</span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100/70 rounded-xl">
                    <button
                      onClick={() => setShippingMethod('standard')}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                        shippingMethod === 'standard' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <TruckIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Standard</span>
                    </button>
                    <button
                      onClick={() => setShippingMethod('express')}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                        shippingMethod === 'express' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <BoltIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Express</span>
                    </button>
                    <button
                      onClick={() => setShippingMethod('pickup')}
                      disabled={shippingSettings?.enablePickup === false}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                        shippingMethod === 'pickup' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                      } ${shippingSettings?.enablePickup === false ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <BuildingStorefrontIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Pickup</span>
                    </button>
                  </div>
                </div>

                {/* Subtotal Breakdown */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-extrabold">KES {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-600 font-black' : 'text-gray-900 font-extrabold'}>
                      {shippingCost === 0 ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="pt-2 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Amount</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic mt-1">
                      KES {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                    className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Checkout Now</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-[0.15em] text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Secure encrypted checkout
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