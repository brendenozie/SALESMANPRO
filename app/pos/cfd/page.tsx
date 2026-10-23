'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCartIcon,
  CheckCircleIcon,
  TagIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { CFDPayload } from '@/lib/pos/useCustomerFacingDisplay';

export default function CustomerFacingDisplayPage() {
  const [data, setData] = useState<CFDPayload | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [slideIndex, setSlideIndex] = useState(0);

  // Promotional Slides when cart is empty / idle
  const promoSlides = [
    {
      title: 'Welcome to our store!',
      subtitle: 'Experience fast, friendly & contactless checkout.',
      bg: 'from-indigo-900 via-indigo-950 to-zinc-950',
      badge: 'Welcome',
    },
    {
      title: 'Pay with M-Pesa or Card',
      subtitle: 'Instant STK push prompt directly to your Safaricom mobile phone.',
      bg: 'from-emerald-950 via-teal-950 to-zinc-950',
      badge: 'Payment Options',
    },
    {
      title: 'Ask About Special Member Offers',
      subtitle: 'Earn reward points on every qualifying purchase today.',
      bg: 'from-amber-950 via-zinc-900 to-black',
      badge: 'Store Perks',
    },
  ];

  // Rotate promo slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % promoSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [promoSlides.length]);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // BroadcastChannel Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('salesmanpro_pos_cfd_channel');
    channel.onmessage = (event: MessageEvent<CFDPayload>) => {
      if (event.data) {
        setData(event.data);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const hasItems = data && data.items && data.items.length > 0;
  const isPaymentPending = data?.type === 'PAYMENT_PENDING';
  const isPaymentSuccess = data?.type === 'PAYMENT_SUCCESS';

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col select-none overflow-hidden">
      {/* TOP HEADER */}
      <header className="h-20 bg-zinc-900/90 border-b border-zinc-800 px-8 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <BuildingStorefrontIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {data?.storeName || 'SalesmanPro POS'}
            </h1>
            <p className="text-xs font-semibold text-zinc-400">
              Terminal: <span className="text-indigo-400">{data?.terminalId || 'T01'}</span> | Cashier:{' '}
              <span className="text-zinc-200">{data?.cashierName || 'Staff'}</span>
            </p>
          </div>
        </div>

        {/* Digital Clock & Status */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">Local Time</span>
            <span className="text-2xl font-mono font-bold text-zinc-200">{currentTime}</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
        </div>
      </header>

      {/* MAIN SCREEN BODY */}
      <main className="flex-1 flex overflow-hidden">
        {/* PAYMENT SUCCESS CELEBRATION */}
        {isPaymentSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-b from-emerald-950/40 via-zinc-950 to-zinc-950 text-center animate-in zoom-in-95 duration-200">
            <div className="w-28 h-28 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 animate-bounce">
              <CheckCircleIcon className="w-16 h-16 text-emerald-400" />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight mb-3">
              Payment Confirmed!
            </h2>
            <p className="text-xl text-zinc-300 max-w-md mb-8">
              Thank you for shopping with us! Your receipt is printing below.
            </p>
            <div className="p-6 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-left min-w-[360px] shadow-xl">
              <div className="flex justify-between py-1 text-sm text-zinc-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-white">
                  {data?.currencySymbol} {data?.total?.toFixed(2)}
                </span>
              </div>
              {data?.changeDue && data.changeDue > 0 ? (
                <div className="flex justify-between py-2 text-lg font-bold text-emerald-400 border-t border-zinc-800 mt-2">
                  <span>Change Due:</span>
                  <span>
                    {data?.currencySymbol} {data.changeDue.toFixed(2)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : !hasItems ? (
          /* IDLE / PROMOTIONAL SLIDESHOW */
          <div
            className={`flex-1 flex flex-col justify-center items-center p-16 text-center transition-all duration-700 bg-gradient-to-br ${promoSlides[slideIndex].bg}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-white mb-6">
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              {promoSlides[slideIndex].badge}
            </div>
            <h2 className="text-6xl font-black tracking-tight text-white max-w-3xl leading-tight mb-4">
              {promoSlides[slideIndex].title}
            </h2>
            <p className="text-2xl text-zinc-300 max-w-2xl font-normal leading-relaxed mb-12">
              {promoSlides[slideIndex].subtitle}
            </p>

            <div className="flex items-center gap-3">
              {promoSlides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === slideIndex ? 'w-10 bg-indigo-500' : 'w-2.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE CART CHECKOUT DISPLAY */
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* LEFT: LIVE ITEMIZED CART */}
            <div className="col-span-7 border-r border-zinc-800 flex flex-col bg-zinc-950">
              <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-bold tracking-tight text-white">Your Items</h2>
                </div>
                <span className="text-sm font-semibold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                  {data?.items.reduce((s, it) => s + it.quantity, 0)} Units
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {data?.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                      {item.variantText ? (
                        <p className="text-xs text-indigo-400 mt-0.5">{item.variantText}</p>
                      ) : null}
                      <p className="text-xs text-zinc-500 mt-1">
                        {data?.currencySymbol} {item.unitPrice.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="px-3 py-1 rounded-xl bg-zinc-800 text-white font-mono font-bold text-sm">
                        x{item.quantity}
                      </span>
                      <span className="text-xl font-black text-white font-mono min-w-[100px] text-right">
                        {data?.currencySymbol} {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: TOTAL & PAYMENT PROMPT */}
            <div className="col-span-5 flex flex-col bg-zinc-900/30 p-8 justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-lg text-zinc-300">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">
                      {data?.currencySymbol} {data?.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {data && data.discount > 0 && (
                    <div className="flex justify-between text-lg text-emerald-400">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <TagIcon className="w-5 h-5" /> Store Discount
                      </span>
                      <span className="font-mono font-bold">
                        - {data?.currencySymbol} {data?.discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg text-zinc-400">
                    <span>Tax (VAT Included)</span>
                    <span className="font-mono font-bold">
                      {data?.currencySymbol} {data?.tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* GRAND TOTAL */}
                <div className="p-6 rounded-3xl bg-indigo-950/40 border-2 border-indigo-600/50 shadow-2xl shadow-indigo-900/20 mb-8">
                  <span className="text-xs uppercase tracking-widest text-indigo-300 font-extrabold block mb-1">
                    Total Payable
                  </span>
                  <div className="text-5xl font-black tracking-tight text-white font-mono">
                    {data?.currencySymbol} {data?.total.toFixed(2)}
                  </div>
                </div>

                {/* M-PESA CHECKOUT INSTRUCTIONS / QR */}
                {isPaymentPending ? (
                  <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold">
                      <DevicePhoneMobileIcon className="w-6 h-6 animate-pulse" />
                      <span>M-Pesa STK Push Active</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Please unlock your phone and enter your 4-digit M-Pesa PIN when prompted.
                    </p>
                    <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-mono text-zinc-300">
                      <span>Paybill / Till:</span>
                      <span className="font-bold text-white">{data?.mpesaPaybill || '522522'}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* FOOTER */}
              <div className="pt-6 border-t border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 font-medium">
                  Thank you for shopping at {data?.storeName || 'SalesmanPro'}!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
