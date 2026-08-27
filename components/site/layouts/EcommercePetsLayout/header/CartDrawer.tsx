'use client';

import React, { useMemo } from 'react';
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

  const [shippingMethod, setShippingMethod] = React.useState<'standard' | 'express' | 'pickup'>('standard');

  // Dynamic Theme & Store Integration
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';
  const whatsappNumber = storeFormData?.contactPhone || '254700000000'; // Default fallback

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

  // Subtotal Matrix Accumulator
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
    
    // Construct Order Lines
    const itemLines = cart.map((item: any, idx: number) => {
      const optionsText = item.selectedOptions && Object.keys(item.selectedOptions).length > 0
        ? ` (${Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : '';
      const price = (item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString();
      return `${idx + 1}. *${item.name}*${optionsText}\n   Qty: ${item.quantity} | Unit: Kes ${price}`;
    }).join('\n\n');

    // Fulfillment Label
    const fulfillmentLabel = shippingMethod === 'pickup' 
      ? 'Store Pickup' 
      : `${shippingMethod.toUpperCase()} Delivery`;

    // Compose Order Message
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

    // Clean Phone Number & Open WhatsApp
    const cleanedPhone = whatsappNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-gray-950/50 backdrop-blur-md z-[100] transition-opacity"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.15)] z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
              <div className="flex flex-col text-left">
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
                  Bag<span style={{ color: primary }}>.</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mt-0.5">
                  {cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)} Items Selected
                </span>
              </div>
              
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Free Shipping Tracker */}
            {cart.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-left">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-gray-600">
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        🎉 Free shipping unlocked!
                      </span>
                    ) : (
                      <>Add <span className="font-extrabold text-gray-900">Kes {amountToFreeShipping.toLocaleString()}</span> for Free Shipping</>
                    )}
                  </span>
                  <span className="text-[10px] font-black text-gray-400">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: isFreeShipping ? '#10B981' : primary }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items Scroll Region */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const targetSignatureId = getItemSignatureId(item);

                  return (
                    <motion.div 
                      layout
                      key={targetSignatureId} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex gap-4 text-left items-start pb-5 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Image Container */}
                      <div className="relative h-24 w-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        <Image 
                          src={item.images?.[0] || '/placeholder.png'} 
                          alt={item.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-grow flex flex-col justify-between self-stretch">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 text-sm tracking-tight leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(targetSignatureId)} 
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>

                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 my-1">
                              {Object.entries(item.selectedOptions).map(([category, value]) => (
                                <span key={category} className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                                  {category}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="font-black text-base" style={{ color: primary }}>
                            Kes {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-full px-1.5 py-0.5 border border-gray-200">
                            <button 
                              onClick={() => decreaseQuantity(targetSignatureId)} 
                              className="p-1 hover:bg-white rounded-full transition-all text-gray-500 hover:text-gray-900 shadow-sm"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-black text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 hover:bg-white rounded-full transition-all text-gray-500 hover:text-gray-900 shadow-sm"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-gray-400">
                            Subtotal: Kes {((item.finalPrice ?? item.sellingPrice ?? 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 border border-gray-100">
                    <ShoppingBagIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Your bag is empty</h3>
                  <p className="text-gray-400 text-xs mt-1.5 max-w-[220px]">
                    Looks like you haven't added any products to your cart yet.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all shadow-md hover:shadow-lg"
                    style={{ backgroundColor: primary }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout Actions */}
            {cart.length > 0 && (
              <div className="p-6 bg-gray-50/80 border-t border-gray-100 space-y-4 text-left backdrop-blur-sm">
                
                {/* Delivery Options Selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Fulfillment Method
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setShippingMethod('standard')}
                      className={`p-2 rounded-xl text-left border text-xs flex flex-col transition-all ${
                        shippingMethod === 'standard'
                          ? 'border-gray-900 bg-white font-bold shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'
                      }`}
                    >
                      <TruckIcon className="w-4 h-4 mb-1" />
                      <span>Standard</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {isFreeShipping ? 'Free' : `Kes ${standardRate}`}
                      </span>
                    </button>

                    <button
                      onClick={() => setShippingMethod('express')}
                      className={`p-2 rounded-xl text-left border text-xs flex flex-col transition-all ${
                        shippingMethod === 'express'
                          ? 'border-gray-900 bg-white font-bold shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'
                      }`}
                    >
                      <BoltIcon className="w-4 h-4 mb-1 text-amber-500" />
                      <span>Express</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {isFreeShipping ? 'Free' : `Kes ${expressRate}`}
                      </span>
                    </button>

                    {shippingSettings?.enablePickup && (
                      <button
                        onClick={() => setShippingMethod('pickup')}
                        className={`p-2 rounded-xl text-left border text-xs flex flex-col transition-all ${
                          shippingMethod === 'pickup'
                            ? 'border-gray-900 bg-white font-bold shadow-sm'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-white'
                        }`}
                      >
                        <BuildingStorefrontIcon className="w-4 h-4 mb-1" />
                        <span>Pickup</span>
                        <span className="text-[10px] text-emerald-600 font-bold mt-0.5">Free</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-2 border-t border-gray-200/60 text-xs font-medium">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">Kes {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Shipping</span>
                    <span className="font-bold text-gray-900">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 uppercase text-[10px] tracking-wider font-black">Free</span>
                      ) : (
                        `Kes ${shippingCost.toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter italic">
                      Kes {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA Buttons */}
                <div className="space-y-2 pt-1">
                  {/* WhatsApp Direct Order Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-[0.15em] text-xs transition-all shadow-lg hover:bg-emerald-500 flex items-center justify-center gap-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" />
                    Order via WhatsApp
                  </motion.button>

                  {/* Direct Website Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn() }}
                    className="w-full py-3.5 rounded-2xl text-white font-black uppercase tracking-[0.15em] text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: primary }}
                  >
                    Standard Checkout
                    <ChevronRightIcon className="w-4 h-4 stroke-[3]" />
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-gray-400">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    256-Bit Encrypted Checkout
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