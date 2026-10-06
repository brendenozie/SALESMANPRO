'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingBagIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/contexts/StoreContext';

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

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  primaryColor?: string;
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 15000;

export default function CartDrawer({ isCartOpen, setIsCartOpen, primaryColor = '#18181b' }: CartDrawerProps) {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');

  const themeColor = primaryColor !== '#18181b' ? primaryColor : (storeFormData?.themeSettings?.primaryColor || '#18181b');
  
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

  const totalCartAmount = useMemo(() => {
    return cart.reduce((acc: number, item: any) => {
      const activePrice = item.finalPrice ?? item.sellingPrice ?? 0;
      return acc + activePrice * item.quantity;
    }, 0);
  }, [cart]);

  const freeShippingThreshold = useMemo(() => {
    if (typeof shippingSettings?.freeShippingThreshold === 'number') {
      return shippingSettings.freeShippingThreshold;
    }
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }, [shippingSettings]);

  const isFreeShipping = totalCartAmount >= freeShippingThreshold && totalCartAmount > 0;
  const standardRate = shippingSettings?.standardRate ?? 0;
  const expressRate = shippingSettings?.expressRate ?? 0;

  const shippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (shippingMethod === 'pickup') return 0;
    if (isFreeShipping) return 0; 
    return shippingMethod === 'express' ? expressRate : standardRate;
  }, [isFreeShipping, shippingMethod, expressRate, standardRate, cart.length]);

  const estimatedTotal = totalCartAmount + shippingCost;

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleWhatsAppCheckout = () => {
    // Attempt to pull tenant contact info, fallback if missing
    const storePhone = storeFormData?.contactPhone || '254700000000';
    
    let message = `*New Order Inquiry* 🛍️\n\n`;
    
    cart.forEach((item: any) => {
      const optionsLabel = item.selectedOptions
        ? Object.entries(item.selectedOptions).map(([_, val]) => `${val}`).join(', ')
        : '';
      const price = item.finalPrice ?? item.sellingPrice ?? 0;
      
      message += `▪ ${item.name} ${optionsLabel ? `(${optionsLabel})` : ''} x${item.quantity} - KES ${(price * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n*Subtotal:* KES ${totalCartAmount.toLocaleString()}`;
    
    if (shippingMethod === 'pickup') {
      message += `\n*Fulfillment:* Store Pickup (Free)`;
    } else {
      const shippingLabel = isFreeShipping ? 'Complimentary' : `KES ${shippingCost.toLocaleString()}`;
      const methodLabel = shippingMethod === 'express' ? 'Express Logistics' : 'Standard Logistics';
      message += `\n*Shipping:* ${methodLabel} (${shippingLabel})`;
    }
    
    message += `\n*Total:* KES ${estimatedTotal.toLocaleString()}\n`;
    message += `\nPlease let me know how to proceed with payment!`;

    const encodedMessage = encodeURIComponent(message);
    
    // Using deep link URL format for maximum cross-device compatibility
    const whatsappUrl = `https://wa.me/${storePhone.replace(/\+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0c0c0c] border-l border-zinc-100 dark:border-zinc-900 shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] z-[101] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-[#0c0c0c]">
              <div>
                <h2 className="text-xl font-black tracking-wide text-zinc-900 dark:text-white uppercase">Your Wardrobe</h2>
                <p className="text-[9px] font-black tracking-[0.25em] text-zinc-400 uppercase mt-0.5">Curated Selection</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/80 transition-all active:scale-95"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, index: number) => {
                  const optionsLabel = item.selectedOptions
                    ? Object.entries(item.selectedOptions).map(([_, val]) => `${val}`).join(' / ')
                    : null;

                  return (
                    <motion.div layout key={item.id ? `${item.id}-${index}` : index} className="flex gap-4 items-center border-b border-zinc-100 dark:border-zinc-900/60 pb-6 last:border-0 last:pb-0">
                      <div className="relative h-24 w-18 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 flex-shrink-0 shadow-sm">
                        <Image decoding="async" 
                          src={item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/150x200'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs tracking-wide uppercase truncate mb-0.5">
                          {item.name}
                        </h3>
                        
                        {optionsLabel && (
                          <span className="inline-block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                            {optionsLabel}
                          </span>
                        )}

                        <p className="text-zinc-900 dark:text-zinc-200 font-black text-xs tracking-tight">
                          KES {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-0.5">
                            <button onClick={() => decreaseQuantity(item)} className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                              <MinusIcon className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2.5 min-w-[24px] text-center text-[10px] font-black text-zinc-800 dark:text-zinc-200">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                              <PlusIcon className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item)} className="p-1.5 text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-300 text-xs font-bold uppercase tracking-wide">Your wardrobe is empty</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[11px] max-w-[200px] mx-auto leading-relaxed">
                      Discover new arrivals and curate your personalized collection.
                    </p>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white transition-all hover:opacity-70">
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 space-y-4 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-bold tracking-tight">
                  KES {totalCartAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">
                  {shippingMethod === 'express' ? 'Express Logistics' : shippingMethod === 'pickup' ? 'Store Pickup' : 'Standard Logistics'}
                </span>
                
                {cart.length === 0 ? (
                  <span className="text-zinc-400 dark:text-zinc-600 font-bold tracking-tight">KES 0</span>
                ) : shippingMethod === 'pickup' ? (
                  <span className="text-zinc-900 dark:text-zinc-200 font-bold tracking-tight">Free</span>
                ) : isFreeShipping ? (
                  <span className="text-emerald-600 dark:text-emerald-500 font-black uppercase text-[9px] tracking-widest">
                    Complimentary
                  </span>
                ) : (
                  <span className="text-zinc-900 dark:text-zinc-200 font-bold tracking-tight">
                    KES {(shippingMethod === 'express' ? expressRate : standardRate).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-end border-t border-zinc-200/50 dark:border-zinc-800/50">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.25em]">Estimated Total</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    KES {estimatedTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                {/* Primary Secure Checkout */}
                <button
                  disabled={cart.length === 0}
                  onClick={() => { user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn(); }}
                  style={{ backgroundColor: cart.length > 0 ? themeColor : undefined }}
                  className={`block w-full py-3.5 text-white text-center font-black uppercase tracking-[0.2em] text-[10px] shadow-lg rounded-xl transition-all active:scale-[0.99] ${
                    cart.length === 0 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none' : 'hover:brightness-95'
                  }`}
                >
                  Secure Checkout
                </button>
                
                {/* Secondary WhatsApp Checkout */}
                <button
                  disabled={cart.length === 0}
                  onClick={handleWhatsAppCheckout}
                  className={`block w-full flex items-center justify-center gap-2 py-3 text-center font-bold uppercase tracking-[0.15em] text-[10px] rounded-xl transition-all active:scale-[0.99] border-2 ${
                    cart.length === 0 
                      ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed' 
                      : 'border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-500/60'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Order via WhatsApp
                </button>
              </div>
              
              <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-500 tracking-wide mt-2">
                Insured express logistics and seamless premium returns.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}