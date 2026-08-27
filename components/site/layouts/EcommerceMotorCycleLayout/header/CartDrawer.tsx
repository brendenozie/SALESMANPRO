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

  // Dynamic Theme & Store Integration
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#c5a059';
  const whatsappNumber = storeFormData?.contactPhone || storeFormData?.phone || '254700000000';

  // Normalize shipping settings safely
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

  // Subtotal Accumulator calculation
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
      return `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`;
    }
    return item.id;
  };

  // WhatsApp Instant Dispatch Handler
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const storeName = storeFormData?.name || storeFormData?.storeName || 'Showroom';
    
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
`🏍️ *SHOWROOM ORDER MANIFEST - ${storeName.toUpperCase()}*

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0A0A0A] shadow-2xl z-[101] flex flex-col border-l border-stone-100 dark:border-stone-900 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-stone-900 flex items-center justify-between bg-white dark:bg-[#0f0f0f] sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-serif italic text-stone-900 dark:text-stone-100">Your Selection</h2>
                <p className="text-[9px] text-[#c5a059] font-black tracking-[0.25em] uppercase mt-0.5">
                  Showroom Order Manifest ({cart.length})
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-none transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-black">
                        <TruckIcon className="w-4 h-4 inline" /> Complimentary Delivery Unlocked
                      </span>
                    ) : (
                      <span className="text-stone-500 dark:text-stone-400">
                        Add <strong className="text-stone-900 dark:text-stone-100">Kes {amountToFreeShipping.toLocaleString()}</strong> for free delivery
                      </span>
                    )}
                  </span>
                  <span className="text-stone-400 font-mono text-[9px]">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-800 h-1 rounded-none overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-[#c5a059]"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                <>
                  {cart.map((item: any, idx: number) => {
                    const variantSignature = getItemSignatureId(item);
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
                        {/* Thumbnail */}
                        <div className="relative h-20 w-20 rounded-none overflow-hidden bg-stone-50 dark:bg-stone-900 flex-shrink-0 border border-stone-100 dark:border-stone-800">
                          <Image 
                            src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                            alt={item.name || 'Product'} 
                            fill 
                            className="object-cover"
                            loader={({ src }) => src}
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-grow">
                          <h3 className="font-medium text-stone-900 dark:text-stone-100 text-sm tracking-tight leading-tight mb-1">
                            {item.name}
                          </h3>
                          
                          {/* Selected Specifications Display */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.entries(item.selectedOptions).map(([key, val]: [string, any]) => (
                                <span key={key} className="text-[9px] font-bold bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-stone-950 dark:text-stone-200 font-light text-xs tracking-wide">
                            Kes {itemTotalPrice.toLocaleString()}
                          </p>
                          
                          {/* Quantity & Actions */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-none px-1 py-0.5">
                              <button 
                                onClick={() => decreaseQuantity(variantSignature, item.selectedOptions)} 
                                className="p-1 text-stone-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <MinusIcon className="w-3 h-3 stroke-[2.5]" />
                              </button>
                              <span className="px-3 text-xs font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => addToCart({
                                  ...item,
                                  cartItemId: variantSignature
                                })} 
                                className="p-1 text-stone-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                              >
                                <PlusIcon className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => removeFromCart(variantSignature, item.selectedOptions)} 
                              className="text-stone-300 dark:text-stone-700 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Fulfillment Options Grid */}
                  <div className="pt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-3">
                      Select Fulfillment Strategy
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-3 rounded-none border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'standard' 
                            ? 'border-[#c5a059] bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Standard</p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${standardRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-3 rounded-none border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'express' 
                            ? 'border-[#c5a059] bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider">Express</p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${expressRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-3 rounded-none border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'pickup' 
                            ? 'border-[#c5a059] bg-stone-900 text-white' 
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400'
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
                  <div className="w-20 h-20 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center text-3xl">
                    <ShoppingBagIcon className="w-8 h-8 text-stone-300 dark:text-stone-700" />
                  </div>
                  <p className="text-stone-400 dark:text-stone-500 font-light text-sm italic max-w-xs">
                    Your order manifest is currently empty. Explore our premium showroom builds...
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[10px] font-black uppercase tracking-[0.25em] text-[#c5a059] border-b border-[#c5a059] pb-0.5 cursor-pointer"
                  >
                    View Showroom Inventory
                  </button>
                </div>
              )}
            </div>

            {/* Luxury Summary Footer Panel */}
            {cart.length > 0 && (
              <div className="relative p-6 space-y-4 bg-stone-50 dark:bg-[#0f0f0f] border-t border-stone-100 dark:border-stone-900">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-light">Subtotal</span>
                    <span className="text-stone-900 dark:text-stone-100 font-medium tracking-wide">
                      Kes {totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-light">Fulfillment</span>
                    <span className={shippingCost === 0 ? "text-emerald-500 font-bold" : "text-stone-900 dark:text-stone-100 font-medium"}>
                      {shippingCost === 0 ? 'Complimentary' : `Kes ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-500 font-light">Showroom Inspection</span>
                    <span className="text-[#c5a059] font-black uppercase text-[9px] tracking-[0.15em]">Inclusive</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                    <p className="text-2xl font-light text-stone-950 dark:text-white tracking-tight">
                      Kes {estimatedTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { user ? router.push(`/motorcycleecommerce/checkout`) : handleGoogleSignIn(); }}
                    className="block w-full py-4 bg-stone-950 dark:bg-stone-900 hover:bg-[#c5a059] dark:hover:bg-[#c5a059] text-white text-center font-black uppercase tracking-[0.25em] text-[10px] rounded-none transition-all shadow-xl active:scale-[0.98] cursor-pointer"
                  >
                    Proceed to Secure Checkout
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 border border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded-none uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Dispatch Manifest via WhatsApp
                  </button>
                </div>

                <p className="text-[9px] text-center text-stone-400 dark:text-stone-500 italic">
                  All premium models are verified by certified mechanics before global delivery hand-off.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}