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
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#D97706';
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
          {/* Backdrop with sophisticated blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100]"
          />

          {/* Drawer: Premium Sidebar */}
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
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} selected
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-3 rounded-full hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 mb-1.5">
                  <span>
                    {isFreeShipping ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-black">
                        <TruckIcon className="w-4 h-4 inline" /> Free Shipping Unlocked!
                      </span>
                    ) : (
                      <>Add <strong className="text-gray-900">Kes {amountToFreeShipping.toLocaleString()}</strong> more for free shipping</>
                    )}
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
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
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-4 group border-b border-gray-50 pb-6 last:border-0"
                      >
                        {/* Image Container */}
                        <div className="relative h-24 w-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image 
                            src={item.images?.[0] || '/placeholder.png'} 
                            alt={item.name} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loader={({ src }) => src}
                          />
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight leading-tight max-w-[180px]">
                                  {item.name}
                                </h3>
                                
                                {/* Display Custom Variants */}
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                                    {Object.entries(item.selectedOptions).map(([key, value]) => {
                                      if (key === 'message') return null;
                                      return (
                                        <span key={key} className="text-[10px] font-medium text-gray-400 lowercase bg-gray-50 px-1.5 py-0.5 rounded">
                                          <span className="text-gray-400 uppercase font-bold text-[9px] mr-0.5">{key}:</span> 
                                          {String(value)}
                                        </span>
                                      );
                                    })}
                                    {item.selectedOptions.message && (
                                      <p className="text-[10px] text-gray-400 mt-1 italic block w-full line-clamp-1">
                                        "{item.selectedOptions.message}"
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => removeFromCart(targetSigId)} 
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="font-black text-base mt-1" style={{ color: primaryColor }}>
                              Kes {itemTotalPrice.toLocaleString()}
                            </p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100">
                              <button 
                                onClick={() => decreaseQuantity(targetSigId)} 
                                className="p-1 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm cursor-pointer"
                              >
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-black text-gray-900">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="p-1 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm cursor-pointer"
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Fulfillment Options */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">
                      Delivery Option
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'standard' 
                            ? 'border-gray-900 bg-gray-900 text-white' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Standard</p>
                          <p className="text-[9px] opacity-70 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${standardRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'express' 
                            ? 'border-gray-900 bg-gray-900 text-white' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Express</p>
                          <p className="text-[9px] opacity-70 mt-0.5">
                            {isFreeShipping ? 'Free' : `Kes ${expressRate.toLocaleString()}`}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          shippingMethod === 'pickup' 
                            ? 'border-gray-900 bg-gray-900 text-white' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Pickup</p>
                          <p className="text-[9px] opacity-70 mt-0.5">Free</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Your bag is empty</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-[200px]">
                    Looks like you haven't added anything to your collection yet.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 text-sm font-black uppercase tracking-widest underline underline-offset-8 decoration-2 cursor-pointer"
                    style={{ textDecorationColor: primaryColor }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-900">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-emerald-600 font-black" : "text-gray-900"}>
                      {shippingCost === 0 ? 'Complimentary' : `Kes ${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between items-end border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Amount</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic">
                      Kes {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                    className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Checkout Now
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Order via WhatsApp
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
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