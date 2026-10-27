"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiXMark,
  HiShieldCheck,
  HiBolt,
  HiCheckBadge,
  HiCheckCircle,
  HiArrowPath,
  HiBuildingStorefront,
  HiCreditCard,
  HiTruck,
  HiDevicePhoneMobile,
} from "react-icons/hi2";
import { resolveProductMedia } from "@/lib/product-media-resolver";
import { tracker } from "@/lib/analytics/tracker";
import { InteractionEventType, InteractionChannel } from "@/lib/analytics/types";

export interface UniversalQuickBuyProduct {
  id: string;
  name: string;
  price?: number;
  finalPrice?: number | null;
  sellingPrice?: number;
  quantity?: number;
  option?: any;
  images?: string[];
  media?: any;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    contactPhone?: string;
  };
  seller?: {
    id: string;
    name: string;
    contactPhone?: string;
    isVerified?: boolean;
  };
  currency?: string;
}

interface UniversalQuickBuyDrawerProps {
  isOpen: boolean;
  product: UniversalQuickBuyProduct | null;
  onClose: () => void;
  storeId?: string | null;
  isMarketplace?: boolean;
  initialOptions?: Record<string, string>;
  source?: string;
}

interface AvailableMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  badge?: string;
  iconType: string;
  ownership: string;
  isDefault?: boolean;
}

const DEFAULT_LOCATIONS = [
  "Nairobi CBD",
  "Westlands",
  "Kilimani / Kileleshwa",
  "Eastlands",
  "Karen / Langata",
  "Mombasa Road / Syokimau",
  "Thika Road / Kasarani",
  "Upcountry / Courier",
];

export const UniversalQuickBuyDrawer: React.FC<UniversalQuickBuyDrawerProps> = ({
  isOpen,
  product,
  onClose,
  storeId,
  isMarketplace = false,
  initialOptions,
  source = "UNIVERSAL_QUICK_BUY",
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("mpesa");
  const [availableMethods, setAvailableMethods] = useState<AvailableMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);

  // Customer form
  const [customerName, setCustomerName] = useState<string>("");
  const [mpesaPhone, setMpesaPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [selectedLocation, setSelectedLocation] = useState<string>("Nairobi CBD");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");

  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentPending, setPaymentPending] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdTrackingNumber, setCreatedTrackingNumber] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // Determine effective companyId
  const effectiveCompanyId = useMemo(() => {
    return storeId || product?.companyId || product?.company?.id || product?.seller?.id || null;
  }, [storeId, product]);

  // Parse and group product variants
  const groupedVariants = useMemo(() => {
    if (!product?.option) return {};
    let options: any[] = [];
    if (typeof product.option === "string") {
      try {
        options = JSON.parse(product.option);
      } catch {
        options = [];
      }
    } else if (Array.isArray(product.option)) {
      options = product.option;
    }

    return options.reduce((acc: Record<string, any[]>, item: any) => {
      if (!item.category) return acc;
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [product?.option]);

  // Variant Surcharges & Pricing
  const dynamicPricing = useMemo(() => {
    const basePrice = Number(product?.finalPrice ?? product?.price ?? product?.sellingPrice ?? 0);
    let surcharge = 0;

    Object.entries(selectedVariants).forEach(([category, name]) => {
      const match = groupedVariants[category]?.find((v) => v.name === name);
      if (match?.extraPrice) surcharge += Number(match.extraPrice);
    });

    const unitPrice = basePrice + surcharge;
    const itemsSubtotal = unitPrice * quantity;
    const deliveryFee = deliveryType === "PICKUP" ? 0 : selectedLocation === "Upcountry / Courier" ? 350 : 200;
    const grandTotal = itemsSubtotal + deliveryFee;

    return {
      unitPrice,
      itemsSubtotal,
      deliveryFee,
      grandTotal,
    };
  }, [product, selectedVariants, groupedVariants, quantity, deliveryType, selectedLocation]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setIsSubmitting(false);
      setPaymentPending(false);
      setPaymentConfirmed(false);
      setCreatedOrderId(null);
      setCreatedTrackingNumber(null);
      setCountdown(60);

      // Generate a fresh idempotency key for this session
      const freshKey = `QB-${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setIdempotencyKey(freshKey);

      // Pre-select variant attributes
      const initial: Record<string, string> = { ...(initialOptions || {}) };
      Object.entries(groupedVariants).forEach(([cat, items]) => {
        if (!initial[cat] && items.length > 0) {
          initial[cat] = items[0].name;
        }
      });
      setSelectedVariants(initial);

      // Pre-fill customer details from localStorage if available
      try {
        const savedPhone = localStorage.getItem("sp_checkout_phone") || localStorage.getItem("ghuba_checkout_phone");
        const savedName = localStorage.getItem("sp_checkout_name") || localStorage.getItem("ghuba_checkout_name");
        const savedEmail = localStorage.getItem("sp_checkout_email");
        if (savedPhone) setMpesaPhone(savedPhone);
        if (savedName) setCustomerName(savedName);
        if (savedEmail) setCustomerEmail(savedEmail);
      } catch {}

      // Fetch authoritative payment methods
      setLoadingMethods(true);
      const url = `/api/shop/payment-methods?${new URLSearchParams({
        ...(effectiveCompanyId ? { storeId: effectiveCompanyId } : {}),
        isMarketplace: String(isMarketplace),
      }).toString()}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.availableMethods) && data.availableMethods.length > 0) {
            setAvailableMethods(data.availableMethods);
            const defaultMethod = data.defaultPaymentMethod || data.availableMethods[0]?.id || "mpesa";
            setSelectedPaymentMethod(defaultMethod);
          } else {
            // Default safe fallback methods
            setAvailableMethods([
              {
                id: "mpesa",
                provider: "MPESA",
                name: "M-Pesa Express",
                description: "Lipa na M-Pesa prompt sent to your phone.",
                badge: "Popular",
                iconType: "mpesa",
                ownership: "GHUBA_MANAGED",
                isDefault: true,
              },
            ]);
            setSelectedPaymentMethod("mpesa");
          }
        })
        .catch(() => {
          setAvailableMethods([
            {
              id: "mpesa",
              provider: "MPESA",
              name: "M-Pesa Express",
              description: "Lipa na M-Pesa prompt sent to your phone.",
              badge: "Popular",
              iconType: "mpesa",
              ownership: "GHUBA_MANAGED",
              isDefault: true,
            },
          ]);
        })
        .finally(() => setLoadingMethods(false));

      // Track interaction telemetry
      try {
        tracker.track({
          eventType: InteractionEventType.PRODUCT_VIEW,
          channel: isMarketplace ? InteractionChannel.REELS : InteractionChannel.DIRECT,
          metadata: {
            productId: product.id,
            productName: product.name,
            source,
            storeId: effectiveCompanyId,
          },
        });
      } catch {}
    }
  }, [isOpen, product, effectiveCompanyId, isMarketplace, initialOptions, groupedVariants, source]);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentPending && countdown > 0 && !paymentConfirmed) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentPending, countdown, paymentConfirmed]);

  // Real-time Payment Verification Polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (paymentPending && createdOrderId && !paymentConfirmed) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/shop/orders/${createdOrderId}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.order?.isPaid) {
              setPaymentConfirmed(true);
              setPaymentPending(false);
              toast.success("Payment verified! Your order is confirmed.", {
                icon: "🎉",
                duration: 6000,
              });
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate([40, 60, 40, 60, 80]);
                } catch {}
              }
            }
          }
        } catch (pollErr) {
          console.warn("[Polling Error]", pollErr);
        }
      }, 2500);
    }
    return () => clearInterval(pollInterval);
  }, [paymentPending, createdOrderId, paymentConfirmed]);

  const sanitizePhone = (val: string) => {
    let cleaned = val.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    } else if (cleaned.startsWith("+254")) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const formattedPhone = sanitizePhone(mpesaPhone);
    if (!formattedPhone || formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      toast.error("Please enter a valid Safaricom number (e.g. 0712345678 or 0112345678)");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save details for fast re-entry
      try {
        localStorage.setItem("sp_checkout_phone", mpesaPhone);
        localStorage.setItem("sp_checkout_name", customerName);
        if (customerEmail) localStorage.setItem("sp_checkout_email", customerEmail);
      } catch {}

      // Format selected variant options for authoritative server pricing
      const selectedOptionsArray = Object.entries(selectedVariants).map(([category, name]) => ({
        category,
        name,
      }));

      const shippingAddressText =
        deliveryType === "PICKUP"
          ? "Store Pickup / Click & Collect"
          : `${selectedLocation}${deliveryNotes ? ` - ${deliveryNotes}` : ""}`;

      const orderPayload = {
        companyId: effectiveCompanyId,
        orderType: "PRODUCT",
        source: isMarketplace ? "REELS_FEED" : "WEBSITE",
        name: customerName.trim(),
        email: customerEmail.trim() || `${formattedPhone}@salesmanpro.store`,
        phone: formattedPhone,
        mpesaPhone: formattedPhone,
        paymentOption: selectedPaymentMethod,
        shippingAddress: shippingAddressText,
        shippingMethod: deliveryType === "PICKUP" ? "Shop-Pickup" : "EXPRESS_RIDER",
        delivery: deliveryType === "DELIVERY",
        idempotencyKey,
        items: [
          {
            marketplaceListingId: product.id,
            quantity,
            price: dynamicPricing.unitPrice,
            totalPrice: dynamicPricing.itemsSubtotal,
            selectedOptions: selectedOptionsArray,
          },
        ],
        metadata: {
          channel: isMarketplace ? "REELS_QUICK_BUY" : "UNIVERSAL_QUICK_BUY",
          isMarketplace,
          idempotencyKey,
        },
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok && !data.success && !data.order) {
        throw new Error(data.error || data.message || "Failed to process order.");
      }

      const orderData = data.data || data;
      const orderId = orderData.order?.id || orderData.id;
      const tracking = orderData.trackingNumber || orderData.order?.trackingNumber || orderId;

      setCreatedOrderId(orderId);
      setCreatedTrackingNumber(tracking);

      // Handle Provider Authorization Redirect (Card / PayPal)
      const authUrl =
        orderData.authorizationUrl ||
        orderData.approveLink ||
        orderData.payment?.authorizationUrl;

      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      // Handle M-Pesa STK Push
      if (selectedPaymentMethod === "mpesa") {
        setPaymentPending(true);
        setCountdown(60);
        toast.success("M-Pesa STK Prompt sent! Enter your PIN on your phone.", {
          icon: "📱",
          duration: 5000,
        });

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate([30, 50, 30]);
          } catch {}
        }
      } else {
        // Immediate or deferred confirmation (COD / Till / Pickup)
        setPaymentConfirmed(true);
        toast.success("Order placed successfully!", { icon: "✅" });
      }
    } catch (err: any) {
      console.error("[QuickBuy Error]", err);
      toast.error(err.message || "Unable to complete order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const resolvedMedia = resolveProductMedia(product as any);
  const displayImage = resolvedMedia.thumbnailUrl || resolvedMedia.primaryImageUrl || "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300";

  const renderPaymentIcon = (type: string) => {
    switch (type) {
      case "mpesa":
        return <HiDevicePhoneMobile className="h-4 w-4 text-emerald-400" />;
      case "card":
      case "stripe":
        return <HiCreditCard className="h-4 w-4 text-blue-400" />;
      case "pickup":
        return <HiBuildingStorefront className="h-4 w-4 text-amber-400" />;
      default:
        return <HiBolt className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-zinc-950 text-white border-t border-zinc-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Drawer Drag Handle & Header */}
        <div className="relative pt-3 pb-2 px-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-zinc-700" />

          <div className="flex items-center gap-2 mt-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <HiBolt className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">Instant Quick Buy</h3>
              <span className="text-[10px] font-bold text-zinc-400 block -mt-0.5">
                {isMarketplace ? "Ghuba Escrow Protected" : "Direct Store Checkout"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mt-2"
            aria-label="Close Quick Buy"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
          {/* 1. Product Summary Card */}
          <div className="flex gap-3 bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 items-center">
            <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-bold mb-0.5 truncate">
                <span>@{product.seller?.name || product.company?.name || "Verified Merchant"}</span>
                {product.seller?.isVerified && <HiCheckBadge className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{product.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-amber-400">
                  KES {dynamicPricing.unitPrice.toLocaleString()}
                </span>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={paymentPending || quantity <= 1}
                    className="text-xs font-black text-zinc-400 hover:text-white disabled:opacity-30 px-1"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white min-w-[14px] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={paymentPending || quantity >= 10}
                    className="text-xs font-black text-zinc-400 hover:text-white disabled:opacity-30 px-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Product Variant Selection (if available) */}
          {Object.keys(groupedVariants).length > 0 && (
            <div className="space-y-2 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/80">
              {Object.entries(groupedVariants).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    {category}: <span className="text-white font-black">{selectedVariants[category] || "Select"}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((opt: any) => {
                      const isSelected = selectedVariants[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [category]: opt.name }))}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all ${
                            isSelected
                              ? "bg-amber-500 text-black border-amber-400 font-black shadow-sm"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                          }`}
                        >
                          {opt.name}
                          {opt.extraPrice ? ` (+KES ${opt.extraPrice})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Escrow & Security Trust Banner */}
          <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl text-emerald-400">
            <HiShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-emerald-300 block">
                {isMarketplace ? "Ghuba Escrow Protection Active" : "Authoritative Store Transaction"}
              </span>
              <span className="text-emerald-400/80">
                {isMarketplace
                  ? "Funds held safely in escrow until you receive and verify your item."
                  : "Encrypted payment dispatched directly to verified merchant settlement."}
              </span>
            </div>
          </div>

          {/* 4. Payment States (Pending Verification vs Confirmed vs Form) */}
          {paymentConfirmed ? (
            /* State A: Verified & Confirmed */
            <div className="bg-emerald-950/40 border border-emerald-500/50 p-6 rounded-2xl text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <HiCheckCircle className="h-8 w-8" />
              </div>
              <h4 className="text-base font-black text-white">Payment Confirmed & Order Placed</h4>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto">
                Thank you, <strong className="text-white">{customerName}</strong>! Your order #
                <span className="font-mono text-emerald-400">{createdTrackingNumber}</span> has been verified.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href={`/ghuba/orderTracking?orderId=${createdOrderId || createdTrackingNumber}`}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider text-center transition-all"
                >
                  Track Live Order
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          ) : paymentPending ? (
            /* State B: Waiting for Customer PIN */
            <div className="bg-zinc-900 border border-amber-500/40 p-5 rounded-2xl text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <HiArrowPath className="h-7 w-7 text-amber-400 animate-spin" />
              </div>
              <h4 className="text-base font-bold text-white">M-Pesa STK Prompt Sent</h4>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto">
                Check your phone for the prompt of{" "}
                <span className="text-amber-400 font-bold">KES {dynamicPricing.grandTotal.toLocaleString()}</span> and enter your M-Pesa PIN.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                <span>Expires in:</span>
                <span className="text-amber-400">{countdown}s</span>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentPending(false);
                    setCountdown(60);
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Resend or Change Details
                </button>
              </div>
            </div>
          ) : (
            /* State C: Main Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              {/* Payment Methods Selector */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Select Payment Method
                </label>
                {loadingMethods ? (
                  <div className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableMethods.map((m) => {
                      const isSelected = selectedPaymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(m.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 text-white shadow-sm ring-1 ring-amber-500"
                              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <span className="p-1.5 rounded-lg bg-zinc-800 shrink-0">
                            {renderPaymentIcon(m.iconType)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold block truncate text-white">{m.name}</span>
                            {m.badge && (
                              <span className="text-[9px] font-black text-amber-400 block -mt-0.5 truncate">
                                {m.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Mutua"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    M-Pesa Phone (STK Prompt Target)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0712 345 678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Fulfilment Selector (Delivery vs In-Store Pickup) */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Fulfilment Option
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("DELIVERY")}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deliveryType === "DELIVERY"
                        ? "bg-zinc-800 border-amber-500 text-white"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <HiTruck className="h-4 w-4" />
                    <span>Courier Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("PICKUP")}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      deliveryType === "PICKUP"
                        ? "bg-zinc-800 border-amber-500 text-white"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <HiBuildingStorefront className="h-4 w-4" />
                    <span>Store Pickup (Free)</span>
                  </button>
                </div>

                {deliveryType === "DELIVERY" && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {DEFAULT_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setSelectedLocation(loc)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            selectedLocation === loc
                              ? "bg-amber-500 text-black border-amber-400 font-black"
                              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Building, street, or house notes (optional)"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({quantity}x item)</span>
                  <span>KES {dynamicPricing.itemsSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Fulfilment ({deliveryType === "PICKUP" ? "Pickup" : selectedLocation})</span>
                  <span>{dynamicPricing.deliveryFee === 0 ? "Free" : `KES ${dynamicPricing.deliveryFee.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-zinc-800">
                  <span>Total Payable</span>
                  <span className="text-amber-400">KES {dynamicPricing.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <HiBolt className="h-4 w-4" />
                    <span>Pay KES {dynamicPricing.grandTotal.toLocaleString()} via {selectedPaymentMethod.toUpperCase()}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalQuickBuyDrawer;
