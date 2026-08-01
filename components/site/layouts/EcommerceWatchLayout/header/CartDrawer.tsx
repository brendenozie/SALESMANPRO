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
  const whatsappNumber = storeFormData?.contactPhone || '254700000000';

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

    const storeName = storeFormData?.name || 'Store';
    
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="text-left">
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Your Basket</h2>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: primaryColor }}>
                  {storeFormData?.name || 'Selection'}
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cart.length > 0 && (
              <div className="bg-stone-50 p-4 border-b border-stone-200/60 text-left">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-stone-700">
                  <span>
                    {isFreeShipping 
                      ? '🎉 You unlocked FREE Delivery!' 
                      : `Add Kes ${amountToFreeShipping.toLocaleString()} for Free Delivery`}
                  </span>
                  <span className="text-[10px] text-stone-500">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {cart.map((item: any) => {
                      const targetSignatureId = getItemSignatureId(item);

                      return (
                        <motion.div 
                          layout
                          key={targetSignatureId} 
                          className="flex gap-4 items-center border-b border-gray-100 pb-6 text-left"
                        >
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                            <Image 
                              src={item.images?.[0] || '/placeholder.png'} 
                              alt={item.name || 'Product'} 
                              fill 
                              className="object-cover"
                              loader={({ src }) => src} 
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                            
                            {/* Selected Options */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="flex flex-wrap gap-1 my-1.5">
                                {Object.entries(item.selectedOptions).map(([category, value]) => (
                                  <span key={category} className="inline-block bg-stone-100 text-stone-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                    {category}: {String(value)}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="font-black text-xs" style={{ color: primaryColor }}>
                              Kes {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                                <button 
                                  onClick={() => decreaseQuantity(targetSignatureId)} 
                                  className="p-1 hover:text-amber-600 transition-colors"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                <button 
                                  onClick={() => addToCart(item)} 
                                  className="p-1 hover:text-amber-600 transition-colors"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(targetSignatureId)} 
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Fulfillment Method Selector */}
                  <div className="pt-4 border-t border-stone-200/60 text-left space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">Select Fulfillment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          shippingMethod === 'standard' 
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <TruckIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide">Standard</p>
                          <p className="text-[10px] opacity-80">{isFreeShipping ? 'Free' : `Kes ${standardRate}`}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          shippingMethod === 'express' 
                            ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <BoltIcon className="w-4 h-4 mb-1" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide">Express</p>
                          <p className="text-[10px] opacity-80">{isFreeShipping ? 'Free' : `Kes ${expressRate}`}</p>
                        </div>
                      </button>

                      {shippingSettings?.enablePickup !== false && (
                        <button
                          onClick={() => setShippingMethod('pickup')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            shippingMethod === 'pickup' 
                              ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide">Pickup</p>
                            <p className="text-[10px] opacity-80">Free</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🛍️</div>
                  <p className="text-gray-400 font-medium italic">Your basket is currently empty...</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-black uppercase tracking-widest border-b pb-0.5"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Footer Summary */}
            {cart.length > 0 && (
              <div className="relative p-6 space-y-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 text-left">
                <div className="space-y-1.5 border-b border-gray-100 pb-3 text-sm">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Fulfillment</span>
                    <span className="text-gray-900 font-bold">
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                      ) : (
                        `Kes ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total Amount</p>
                    <p className="text-2xl font-black text-gray-900 mt-0.5">Kes {estimatedTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center text-[10px] text-emerald-600 font-semibold gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Encrypted Checkout
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                    className="w-full py-4 bg-gray-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl active:scale-[0.98] rounded-none flex items-center justify-center gap-2"
                  >
                    <span>Secure Checkout</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 bg-emerald-600 text-white text-center font-bold uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] rounded-none flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
                
                <p className="text-[9px] text-center text-gray-400 italic pt-1">
                  All items are inspected and securely packaged prior to dispatch.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}