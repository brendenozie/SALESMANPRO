"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MapPinIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

interface TrackingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  image?: string | null;
  selectedOptions?: any;
}

interface TrackingStep {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  date?: string | null;
}

interface TrackingData {
  orderId: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  paymentOption?: string;
  paymentMethod?: string;
  deliveryStatus: string;
  shippingMethod: string;
  shippingAddress?: any;
  createdAt: string;
  estimatedDelivery?: string | null;
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  items: TrackingItem[];
  store: {
    name: string;
    slug?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  steps: TrackingStep[];
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get('trackingNumber') ||
    searchParams.get('trackingnumber') ||
    searchParams.get('orderTracking') ||
    '';

  const [trackingNumber, setTrackingNumber] = useState<string>(initialQuery);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchTracking = useCallback(async (num: string, background = false) => {
    const trimmed = num.trim();
    if (!trimmed) return;

    if (!background) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await fetch(`/api/shop/orders/track?trackingNumber=${encodeURIComponent(trimmed)}`, {
        cache: 'no-store',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Tracking number not found.');
      }

      setTrackingData(json.data);
    } catch (err: any) {
      if (!background) {
        setError(err.message || 'Unable to find tracking details. Please verify your tracking number.');
        setTrackingData(null);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-fetch if tracking query param is present on mount
  useEffect(() => {
    if (initialQuery) {
      setTrackingNumber(initialQuery);
      fetchTracking(initialQuery);
    }
  }, [initialQuery, fetchTracking]);

  // Polling for live status updates if payment is pending/initiated
  useEffect(() => {
    if (
      trackingData &&
      (trackingData.paymentStatus === 'INITIATED' || trackingData.paymentStatus === 'PENDING') &&
      trackingData.trackingNumber
    ) {
      const interval = setInterval(() => {
        fetchTracking(trackingData.trackingNumber, true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trackingData, fetchTracking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number.');
      return;
    }
    fetchTracking(trackingNumber);
  };

  const isPaid =
    trackingData?.paymentStatus === 'COMPLETED' ||
    trackingData?.status === 'PAID' ||
    trackingData?.paymentOption === 'cash' ||
    trackingData?.paymentOption === 'cod';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header & Search */}
        <header className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-3">
              <TruckIcon className="w-4 h-4" /> Live Order Tracking
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Track Your Package
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Follow your package from order placement through delivery in real time.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto flex gap-2">
            <input
              type="text"
              placeholder="e.g. TRK-20260903-ABCD"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Tracking...
                </>
              ) : (
                'Track'
              )}
            </button>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs sm:text-sm text-rose-600 font-medium">
              {error}
            </motion.p>
          )}
        </header>

        {/* Live Tracking Result */}
        <AnimatePresence mode="wait">
          {trackingData && (
            <motion.div
              key={trackingData.trackingNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Meta Banner */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Order #{trackingData.trackingNumber}
                    </h2>
                    {isRefreshing && (
                      <span className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 gap-1 animate-pulse font-medium">
                        <ArrowPathIcon className="w-3 h-3 animate-spin" /> Updating...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                    Store: <span className="font-semibold text-slate-700 dark:text-slate-300">{trackingData.store.name}</span>
                    {trackingData.estimatedDelivery && (
                      <>
                        <span>•</span>
                        <span>Est. Delivery: {trackingData.estimatedDelivery}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {isPaid ? 'Payment Confirmed' : 'Payment Awaiting'}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {trackingData.deliveryStatus}
                  </span>
                </div>
              </div>

              {/* Real-Time Progress Stepper */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Delivery Journey</h3>
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                    {trackingData.steps.map((step, idx) => (
                      <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            step.completed
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : step.current
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : step.current ? (
                            <ClockIcon className="w-5 h-5 animate-spin" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step.completed || step.current ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Items & Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <ShoppingBagIcon className="w-4 h-4" /> Ordered Items ({trackingData.items.length})
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {trackingData.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <ShoppingBagIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity} × KES {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          KES {item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Pricing Breakdown */}
                <div className="space-y-6">
                  {/* Delivery Details */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" /> Delivery Info
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {trackingData.shippingAddress?.display_name || 'Store Pickup / Direct Delivery'}
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                      Method: {trackingData.shippingMethod}
                    </p>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4" /> Payment Summary
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>KES {trackingData.pricing.subtotal.toLocaleString()}</span>
                      </div>
                      {trackingData.pricing.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Discount</span>
                          <span>-KES {trackingData.pricing.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>KES {trackingData.pricing.shipping.toLocaleString()}</span>
                      </div>
                      {trackingData.pricing.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>KES {trackingData.pricing.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                        <span>Total</span>
                        <span>KES {trackingData.pricing.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
