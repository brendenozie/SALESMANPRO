'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon, CubeIcon } from '@heroicons/react/24/outline';
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

  // Premium Architectural Theme Parameters
  const primary = '#18181b'; // Deep Onyx Slate

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

  // Dynamically calculate running cart configuration parameters
  const totalPrice = useMemo(() => {
    return cart.reduce((total: number, item: any) => {
      const price = item.finalPrice ?? item.sellingPrice ?? 0;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const freeShippingThreshold = useMemo(() => {
    if (typeof shippingSettings?.freeShippingThreshold === 'number') {
      return shippingSettings.freeShippingThreshold;
    }
    return DEFAULT_FREE_SHIPPING_THRESHOLD;
  }, [shippingSettings]);

  const isFreeShipping = totalPrice >= freeShippingThreshold && totalPrice > 0;
  const standardRate = shippingSettings?.standardRate ?? 0;
  const expressRate = shippingSettings?.expressRate ?? 0;

  const shippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (shippingMethod === 'pickup') return 0;
    if (isFreeShipping) return 0; 
    return shippingMethod === 'express' ? expressRate : standardRate;
  }, [isFreeShipping, shippingMethod, expressRate, standardRate, cart.length]);

  const estimatedTotal = totalPrice + shippingCost;

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleWhatsAppCheckout = () => {
    const storePhone = storeFormData?.storePhone || storeFormData?.contactPhone || '254700000000';
    
    let message = `*Commission Request* 🏛️\n\n`;
    
    cart.forEach((item: any) => {
      const optionsLabel = item.selectedOptions
        ? Object.entries(item.selectedOptions).map(([_, val]) => `${val}`).join(', ')
        : '';
      const price = item.finalPrice ?? item.sellingPrice ?? 0;
      
      message += `▪ ${item.name} ${optionsLabel ? `[${optionsLabel}]` : ''} x${item.quantity} - KES ${(price * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n*Subtotal Valuation:* KES ${totalPrice.toLocaleString()}`;
    
    if (shippingMethod === 'pickup') {
      message += `\n*Studio Logistics:* Direct Studio Pickup (Free)`;
    } else {
      const shippingLabel = isFreeShipping ? 'Insured / Free' : `KES ${shippingCost.toLocaleString()}`;
      const methodLabel = shippingMethod === 'express' ? 'Priority Logistics' : 'Standard Logistics';
      message += `\n*Studio Logistics:* ${methodLabel} (${shippingLabel})`;
    }
    
    message += `\n*Total Valuation:* KES ${estimatedTotal.toLocaleString()}\n`;
    message += `\nPlease provide the final authorization and payment instructions to proceed.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${storePhone.replace(/\+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[150]"
          />

          {/* Luxury Gallery Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#fafafa] dark:bg-[#0c0c0c] shadow-[-30px_0_80px_rgba(0,0,0,0.1)] z-[151] flex flex-col border-l border-zinc-100 dark:border-zinc-900"
          >
            {/* Structural Header */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-white dark:bg-[#080808]">
              <div>
                <h2 className="text-xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white">Selected Pieces</h2>
                <p className="text-[8px] text-zinc-400 font-black tracking-[0.3em] uppercase mt-1">Architecture Bag Inventory</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full border border-zinc-200/50 dark:border-zinc-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {/* Main Commission Manifest Block */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  const itemConfigLabel = Object.entries(item.selectedOptions || {})
                    .map(([_, val]) => `${val}`)
                    .join(' / ');

                  return (
                    <motion.div 
                      layout
                      key={`${item.id}-${idx}`} 
                      className="flex gap-5 items-start border-b border-zinc-100 dark:border-zinc-900/60 pb-6"
                    >
                      {/* Image Thumbnail Frame */}
                      <div className="relative h-20 w-16 rounded-xl overflow-hidden bg-[#EFEFEF] dark:bg-zinc-900 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src} 
                        />
                      </div>
                      
                      {/* Line Specs Mapping Area */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-xs tracking-tight truncate leading-tight mb-0.5">{item.name}</h3>
                        
                        {itemConfigLabel && (
                          <p className="text-[9px] font-medium text-zinc-400 truncate tracking-tight mb-2">
                            {itemConfigLabel}
                          </p>
                        )}
                        
                        <p className="text-zinc-900 dark:text-zinc-200 font-black text-xs tracking-tight">
                          KES {(item.finalPrice ?? item.sellingPrice ?? 0).toLocaleString()}
                        </p>
                        
                        {/* Micro Adjustment Actions Panel */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 rounded-xl px-1.5 py-1 border border-zinc-200/40 dark:border-zinc-800">
                            <button 
                              onClick={() => decreaseQuantity(item.id)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-[10px] font-black min-w-[18px] text-center dark:text-zinc-100">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 mb-4 border border-zinc-100 dark:border-zinc-800/50">
                    <CubeIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs font-light tracking-wide max-w-[200px] leading-relaxed italic">
                    Your collection architecture is currently empty.
                  </p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-900 dark:text-white border-b border-zinc-900 dark:border-white pb-1 transition-opacity hover:opacity-70"
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Checkout Subtotal Matrix Panel */}
            <div className="p-8 space-y-5 bg-white dark:bg-[#080808] border-t border-zinc-100 dark:border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center text-xs tracking-tight">
                <span className="text-zinc-400 font-medium">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">KES {totalPrice.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs tracking-tight">
                <span className="text-zinc-400 font-medium">Studio Logistics</span>
                {cart.length === 0 ? (
                  <span className="text-zinc-400 font-bold">KES 0</span>
                ) : shippingMethod === 'pickup' ? (
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">Studio Pickup</span>
                ) : isFreeShipping ? (
                  <span className="text-emerald-500 font-black text-[9px] uppercase tracking-widest">Insured / Free</span>
                ) : (
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                    KES {(shippingMethod === 'express' ? expressRate : standardRate).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-end border-t border-zinc-100 dark:border-zinc-900/50">
                <div>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.3em] mt-2">Total Valuation</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter mt-1">
                    KES {estimatedTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  disabled={cart.length === 0}
                  onClick={() => { user ? router.push(`/furnitureecommerce/checkout`) : handleGoogleSignIn(); }}
                  style={{ backgroundColor: cart.length > 0 ? primary : undefined }}
                  className={`w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-center font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl shadow-xl transition-all active:scale-[0.99] ${
                    cart.length === 0 ? 'opacity-20 cursor-not-allowed shadow-none' : 'hover:opacity-90'
                  }`}
                >
                  Secure Checkout Configuration
                </button>

                <button
                  disabled={cart.length === 0}
                  onClick={handleWhatsAppCheckout}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 border-2 text-center font-bold uppercase tracking-[0.15em] text-[10px] rounded-2xl transition-all active:scale-[0.99] ${
                    cart.length === 0 
                      ? 'border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed' 
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Direct Commission via WhatsApp
                </button>
              </div>
              
              <p className="text-[8px] text-center text-zinc-400 tracking-tight leading-normal max-w-[90%] mx-auto">
                Each commissioned specimen includes structured technical inspection reports and a certificate of craftsmanship authenticity.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}