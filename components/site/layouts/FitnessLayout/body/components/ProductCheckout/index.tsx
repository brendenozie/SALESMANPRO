/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface ProductCheckoutProps {
  product: MarketListingForm;
  selectedSlotIndex: number | null;
  selectedTierIndex: number;
  onBackToProduct: () => void;
  onOrderCompleted?: (orderData: any) => void;
  // userId?: string; // Optional context identifier passed from authentication layout
}

export default function ProductCheckout({
  product,
  selectedSlotIndex,
  selectedTierIndex,
  onBackToProduct,
  onOrderCompleted,
  // userId
}: ProductCheckoutProps) {

  const { data: session } = useSession();
  // --- FORM STATE ENGINE ---
  const [formData, setFormData] = useState({    
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    fullName:session?.user?.name || '',
    notes: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CARD' | 'SHOP'>('MPESA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // --- BRAND THEME CONFIGURATION ---
  const brandPrimary = "#6366F1"; // Indigo Accent

  // --- DATA HYDRATION & FALLBACKS ---
  const selectedSlot = selectedSlotIndex !== null && product.bookingSlots 
    ? product.bookingSlots[selectedSlotIndex] 
    : null;
    
  const activeTier = product.pricingTiers && product.pricingTiers[selectedTierIndex]
    ? product.pricingTiers[selectedTierIndex]
    : null;

  // Derive explicit price hierarchy matching your database configuration
  const basePrice = activeTier?.price ?? product.finalPrice ?? product.sellingPrice ?? 1000;
  const formattedPrice = basePrice.toLocaleString();

  const currentImages = (product.images as { url: string }[])?.length 
    ? (product.images as { url: string }[]) 
    : [{ url: 'https://dozi4r4ug9739.cloudfront.net/images/1779884960821-pexels-ketut-subiyanto-4720807.jpg' }];
  const currentImage = currentImages[0]?.url;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      // Map local payment UI states to lower-case schema configurations expected by backend router
      const gatewayOptionMap = {
        MPESA: 'mpesa',
        CARD: 'paystack', // Falls back to paystack ecosystem processing node
        SHOP: 'pickupatshop'
      };

      const targetPaymentOption = gatewayOptionMap[paymentMethod];

      // Build precise structural object payload corresponding to the global endpoint schema
      const checkoutPayload = {
        billing: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        mpesaPhone: paymentMethod === 'MPESA' ? formData.phone : undefined,
        consumerId: session?.user?.id,
        paymentOption: targetPaymentOption,
        companyId: product.companyId || null,
        listingId: product.id,
        price: basePrice,
        totalPrice: basePrice,
        serviceName: product.name,
        appointment: selectedSlot ? {
          date: selectedSlot.date,
          timeSlot: selectedSlot.time,
          locationType: product.paymentOption || "AT_SHOP",
          provider: product.contactName || "Staff Pro"
        } : null,
        promoCode: null,
        notes: formData.notes || null,
      };

      const response = await fetch('/api/shop/serviceFitnessOrders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Flatten Zod field errors safely into an accessible dashboard presentation string
        const errorMsg = result.error?.fieldErrors 
          ? Object.entries(result.error.fieldErrors).map(([f, msg]) => `${f}: ${msg}`).join(', ')
          : result.error || "Order placement verification failed.";
        throw new Error(errorMsg);
      }

      // Check for structural redirection paths (e.g. Paystack / Card windows)
      if (result.data?.authorizationUrl) {
        window.location.href = result.data.authorizationUrl;
        return; 
      }

      // Offline fallback processing execution (e.g. Counter Payment / COD)
      setIsSuccess(true);
      if (onOrderCompleted) {
        onOrderCompleted(result.data);
      }

    } catch (error: any) {
      console.error("Marketplace checkout execution failed:", error);
      setCheckoutError(error?.message || "An unexpected error disrupted your reservation loop.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ORDER SUCCESS VIEW ---
  if (isSuccess) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-full text-emerald-500 mb-6"
        >
          <CheckCircleIcon className="h-16 w-16" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reservation Confirmed!</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mt-2 text-sm">
          Your reservation for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{product.name}</span> is securely locked in.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 mt-8 max-w-sm w-full space-y-3 text-left text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Client:</span> 
            <span className="font-bold text-slate-800 dark:text-slate-200">{formData.fullName}</span>
          </div>
          {selectedSlot && (
            <div className="flex justify-between">
              <span className="text-slate-400">Schedule Window:</span> 
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {new Date(selectedSlot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {selectedSlot.time} Hrs
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Gateway Route:</span> 
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{paymentMethod}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300">Total Commitment:</span> 
            <span className="font-black text-slate-900 dark:text-white">KES {formattedPrice}</span>
          </div>
        </div>

        <button 
          onClick={onBackToProduct}
          className="mt-8 px-6 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-colors shadow-sm"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  // --- FORM ENGINE VIEW ---
  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Head>
        <title>Secure Checkout | {product.name}</title>
      </Head>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-20">
        
        <button 
          onClick={onBackToProduct}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Offer Profile
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: SPECIFICATION FORM LAYOUT */}
          <form onSubmit={handleSubmitCheckout} className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">1. Attendee Identification</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Input clean coordination contact vectors for this pass.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name</label>
                  <input 
                    required
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Brenden Odhiambo"
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contact Phone</label>
                  <input 
                    required
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0700345678"
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Target Vector</label>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Special Target Requirements (Optional)</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Specify coordination goals or operational considerations..."
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100 resize-none" 
                />
              </div>
            </div>

            {/* GATEWAY SYSTEM BLOCK */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">2. Secure Gateway Routing</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Select your automated billing execution path.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MPESA')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                    paymentMethod === 'MPESA' 
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs tracking-wider uppercase text-emerald-700 dark:text-emerald-400">M-Pesa Stk</span>
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'MPESA' ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'MPESA' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Automated Push Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                    paymentMethod === 'CARD' 
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-600' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs tracking-wider uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <CreditCardIcon className="h-4 w-4 text-indigo-500" /> Card Engine
                    </span>
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'CARD' ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {paymentMethod === 'CARD' && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Global Processing Node</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SHOP')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                    paymentMethod === 'SHOP' 
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-500' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs tracking-wider uppercase text-amber-700 dark:text-amber-400">At Shop</span>
                    <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${paymentMethod === 'SHOP' ? 'border-amber-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'SHOP' && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Fulfill: {product.paymentOption || "OFFLINE"}</span>
                </button>
              </div>

              {paymentMethod === 'MPESA' && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400"
                >
                  An STK PIN verification loop will be broadcasted to <span className="font-bold text-slate-800 dark:text-white">{formData.phone || "[Missing Contact Parameter above]"}</span>.
                </motion.div>
              )}
            </div>

            {/* SCHEMA VALIDATION ERROR BANNER */}
            {checkoutError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 rounded-xl text-xs flex gap-2.5 items-start"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Authorization Blocked</span>
                  {checkoutError}
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: brandPrimary, opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Finalize Reservation Authorization
                </>
              )}
            </motion.button>
          </form>

          {/* RIGHT SIDE: INTERACTIVE VALUE MATRIX STACK */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xl space-y-5">
              <h3 className="text-md font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Session Specification Summary</h3>
              
              <div className="flex gap-4 items-center">
                <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                  <Image 
                    src={currentImage} 
                    alt={product.name} 
                    loader={loader} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    {product.subCategoryName || product.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate mt-1">{product.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Base Hub: {product.locationName || "Nairobi, KE"}</p>
                </div>
              </div>

              {selectedSlot ? (
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <CalendarDaysIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Execution Reference Target</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <ClockIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSlot.time} Hours</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned Launch Hour Window</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-amber-500" />
                  Warning: No structural timetable slot matched.
                </div>
              )}

              <div className="pt-2 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Matrix Rate:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">KES {formattedPrice}</span>
                </div>
                {activeTier && (
                  <div className="flex justify-between text-slate-500">
                    <span>Selected Workspace Tier:</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 capitalize">{activeTier.name || `Level ${selectedTierIndex}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Infrastructure Fee:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">0.00</span>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Obligation:</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">KES {formattedPrice}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 justify-center text-[11px] text-slate-400 dark:text-slate-500">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" /> Secure Marketplace Protocol Active
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}