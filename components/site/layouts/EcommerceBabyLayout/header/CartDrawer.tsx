'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
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

  // Extract custom theme branding parameters dynamically
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6'; // Classic soft baby pink fallback
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

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

  // Compute actual operational subtotal allocations
  const totalAmount = useMemo(() => {
    return cart.reduce((acc: number, item: any) => acc + (item.finalPrice * item.quantity), 0);
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

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleWhatsAppCheckout = () => {
    const storePhone = storeFormData?.storePhone || storeFormData?.contactPhone || '254700000000';
    const storeName = storeFormData?.name || "Baby Duka";
    
    let message = `*Order Request - ${storeName}* 🧸\n\n`;
    
    cart.forEach((item: any) => {
      const optionsLabel = item.selectedOptions
        ? Object.entries(item.selectedOptions).map(([_, val]) => `${val}`).join(', ')
        : '';
      const price = item.finalPrice ?? item.sellingPrice ?? 0;
      
      message += `▪ ${item.name} ${optionsLabel ? `[${optionsLabel}]` : ''} x${item.quantity} - KSh ${(price * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n*Subtotal:* KSh ${totalAmount.toLocaleString()}`;
    
    if (shippingMethod === 'pickup') {
      message += `\n*Fulfillment:* Boutique Pickup (Free)`;
    } else {
      const shippingLabel = isFreeShipping ? 'Free Delivery' : `KSh ${shippingCost.toLocaleString()}`;
      const methodLabel = shippingMethod === 'express' ? 'Express Delivery' : 'Standard Delivery';
      message += `\n*Fulfillment:* ${methodLabel} (${shippingLabel})`;
    }
    
    message += `\n*Total Amount:* KSh ${estimatedTotal.toLocaleString()}\n`;
    message += `\nPlease confirm availability and provide payment details to proceed.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${storePhone.replace(/\+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Surface Shell Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FDFCF9] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header Block Component */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Your Basket</h2>
                <p 
                  style={{ color: primary }}
                  className="text-[10px] font-black tracking-[0.2em] uppercase"
                >
                  {storeFormData?.name || "Baby Duka"} Boutique Collection
                </p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* List Loop Container */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cart.length > 0 ? (
                cart.map((item: any, idx: number) => {
                  // Standard multi-variant signature key definition setup
                  const uniqueItemKey = item.selectedOptions 
                    ? `${item.id}-${Object.entries(item.selectedOptions).map(([k, v]) => `${k}:${v}`).join('-')}`
                    : `${item.id}-${idx}`;

                  return (
                    <motion.div 
                      layout
                      key={uniqueItemKey} 
                      className="flex gap-4 items-center border-b border-slate-50 pb-6 last:border-0"
                    >
                      {/* Product Thumbnail Box Frame */}
                      <div className="relative h-20 w-20 rounded-[1.25rem] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                        <Image 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f'} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          loader={({ src }) => src}
                        />
                      </div>
                      
                      {/* Text details content section area */}
                      <div className="flex-grow">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{item.name}</h4>
                        
                        {/* Selected configuration tags lookup map */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1.5">
                            {Object.entries(item.selectedOptions).map(([cat, val]: [string, any]) => (
                              <span 
                                key={cat}
                                className="inline-block text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold"
                              >
                                {cat}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="font-black text-xs text-slate-900 mt-1">
                          KSh {item.finalPrice?.toLocaleString()}
                        </p>
                        
                        {/* Quantity Counter Control Mechanics Group */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center bg-slate-100 rounded-full px-2 py-1">
                            <button 
                              onClick={() => decreaseQuantity(item.id, item.selectedOptions)} 
                              className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)} 
                              className="p-1 text-slate-500 hover:text-blue-500 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id, item.selectedOptions)} 
                            className="text-slate-300 hover:text-red-500 transition-colors"
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
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">🧸</div>
                  <p className="text-slate-400 text-xs font-medium italic px-6">Your basket is empty. Add cute outfits and accessories for your little ones!</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    style={{ color: primary, borderColor: primary }}
                    className="text-xs font-black uppercase tracking-widest border-b pb-0.5 hover:opacity-80 transition-opacity"
                  >
                    Start Exploring
                  </button>
                </div>
              )}
            </div>

            {/* Glassmorphism Summary Footer Area Panel */}
            <div className="relative p-8 space-y-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center text-xs font-bold tracking-tight">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-mono">KSh {totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold tracking-tight">
                <span className="text-slate-500">Boutique Delivery</span>
                {cart.length === 0 ? (
                  <span className="text-slate-400 font-mono">KSh 0</span>
                ) : shippingMethod === 'pickup' ? (
                  <span className="text-slate-900 font-mono">Store Pickup</span>
                ) : isFreeShipping ? (
                  <span 
                    style={{ color: secondary }}
                    className="font-black text-[10px] tracking-widest uppercase"
                  >
                    Free Delivery
                  </span>
                ) : (
                  <span className="text-slate-900 font-mono">
                    KSh {(shippingMethod === 'express' ? expressRate : standardRate).toLocaleString()}
                  </span>
                )}
              </div>
              
              <hr className="border-slate-100 my-1" />

              <div className="pt-1 flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Total Amount</p>
                  <p className="text-3xl font-black font-mono text-slate-900 tracking-tight">KSh {estimatedTotal.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  disabled={cart.length === 0}
                  onClick={() => { user ? router.push(`/babyecommerce/checkout`) : handleGoogleSignIn(); }}
                  style={{ 
                    backgroundColor: cart.length === 0 ? undefined : primary,
                    boxShadow: cart.length === 0 ? undefined : `0 12px 24px -8px ${primary}66`
                  }}
                  className="block w-full py-4 bg-slate-900 text-white text-center font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
                >
                  Secure Checkout
                </button>

                <button
                  disabled={cart.length === 0}
                  onClick={handleWhatsAppCheckout}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 border-2 text-center font-bold uppercase tracking-[0.15em] text-[10px] rounded-2xl transition-all active:scale-[0.98] ${
                    cart.length === 0 
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Order via WhatsApp
                </button>
              </div>
              
              <p className="text-[9px] text-center text-slate-400 italic mt-2">
                Every package is assembled safely and wrapped with complete care.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}