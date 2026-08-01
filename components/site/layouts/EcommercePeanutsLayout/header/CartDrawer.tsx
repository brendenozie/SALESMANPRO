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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.1)] z-[101] flex flex-col overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                  Bag<span style={{ color: primaryColor }}>.</span>
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
              <div className="bg-stone-50/80 p-4 border-b border-stone-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-stone-700">
                  <span>
                    {isFreeShipping 
                      ? '🎉 You unlocked FREE Delivery!' 
                      : `Add Kes ${amountToFreeShipping.toLocaleString()} for Free Delivery`}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {cart.map((item: any, idx: number) => {
                      const targetSigId = getItemSignatureId(item);
                      const unitPrice = item.finalPrice ?? item.sellingPrice ?? 0;
                      const itemTotal = unitPrice * item.quantity;
                      
                      return (
                        <motion.div 
                          layout
                          key={targetSigId} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex gap-4 group items-center border-b border-gray-50 pb-5"
                        >
                          {/* Image Container */}
                          <div className="relative h-24 w-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                            <Image 
                              src={item.images?.[0] || '/placeholder.png'} 
                              alt={item.name || 'Product'} 
                              fill 
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              loader={({ src }) => src}
                            />
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-grow flex flex-col justify-between py-1">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-tight leading-tight max-w-[180px]">
                                  {item.name}
                                </h3>
                                <button 
                                  onClick={() => removeFromCart(targetSigId)} 
                                  className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer flex-shrink-0"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Custom Variants Display */}
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => {
                                    if (key === 'message') return null;
                                    return (
                                      <span key={key} className="inline-block bg-stone-50 border border-stone-100 text-stone-500 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {key}: {String(value)}
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

                              <p className="font-black text-base pt-1" style={{ color: primaryColor }}>
                                Kes {itemTotal.toLocaleString()}
                              </p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
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
                  </div>

                  {/* Fulfillment Selection */}
                  <div className="pt-2 text-left space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Fulfillment Options</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
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
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
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
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
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
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter italic">Your bag is empty</h3>
                  <p className="text-gray-400 text-xs mt-2 max-w-[220px]">Explore our store and pick your favorite items to add here.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-xs font-black uppercase tracking-widest border-b pb-0.5 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: primaryColor, borderColor: primaryColor }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Controls */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-5">
                <div className="space-y-2 border-b border-gray-200/60 pb-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-black">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Shipping Fee</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">Free</span>
                      ) : (
                        <span className="text-gray-900 font-black">Kes {shippingCost.toLocaleString()}</span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Amount</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic mt-1">
                      Kes {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-[10px] text-emerald-600 font-bold gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Encrypted
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                    className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Secure Checkout</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                    Safe & Instant Fulfillment
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