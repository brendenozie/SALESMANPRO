"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiShieldCheck,
  HiBolt,
  HiCheckBadge,
  HiCheckCircle,
  HiArrowPath,
  HiBuildingStorefront,
  HiCreditCard,
  HiTruck,
  HiDevicePhoneMobile,
  HiLockClosed,
  HiSparkles,
  HiExclamationTriangle,
  HiShare,
} from "react-icons/hi2";
import { resolveProductMedia } from "@/lib/product-media-resolver";
import { DirectPayLinkResolution } from "@/lib/pay-links/service";

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

interface DirectPayCheckoutClientProps {
  initialData: DirectPayLinkResolution;
  linkCode: string;
}

export const DirectPayCheckoutClient: React.FC<DirectPayCheckoutClientProps> = ({
  initialData,
  linkCode,
}) => {
  const { link, product, store, availablePaymentMethods = [] } = initialData;

  const [quantity, setQuantity] = useState<number>(link?.defaultQuantity || 1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(
    link?.variantConfig || {},
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("mpesa");

  // Customer form fields
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
  const [copied, setCopied] = useState<boolean>(false);

  // Group product variants from option JSON
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

  // Dynamic Pricing Calculation
  const dynamicPricing = useMemo(() => {
    const basePrice = Number(product?.price || 0);
    let surcharge = 0;

    Object.entries(selectedVariants).forEach(([category, name]) => {
      const match = groupedVariants[category]?.find((v) => v.name === name);
      if (match?.extraPrice) surcharge += Number(match.extraPrice);
    });

    const unitPrice = basePrice + surcharge;
    const itemsSubtotal = unitPrice * quantity;
    const deliveryFee =
      deliveryType === "PICKUP"
        ? 0
        : selectedLocation === "Upcountry / Courier"
          ? 350
          : 200;
    const grandTotal = itemsSubtotal + deliveryFee;

    return {
      unitPrice,
      itemsSubtotal,
      deliveryFee,
      grandTotal,
    };
  }, [product, selectedVariants, groupedVariants, quantity, deliveryType, selectedLocation]);

  // Initialize details on mount
  useEffect(() => {
    // Generate fresh idempotency key
    const freshKey = `DPL-${linkCode}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setIdempotencyKey(freshKey);

    // Track checkout_start telemetry
    fetch(`/api/pay-links/${linkCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout_start" }),
    }).catch(() => null);

    // Pre-fill variant options if not provided
    if (Object.keys(selectedVariants).length === 0 && Object.keys(groupedVariants).length > 0) {
      const defaults: Record<string, string> = {};
      Object.entries(groupedVariants).forEach(([cat, items]) => {
        if (items.length > 0) defaults[cat] = items[0].name;
      });
      setSelectedVariants(defaults);
    }

    // Set default payment method
    if (availablePaymentMethods.length > 0) {
      const defaultMethod =
        availablePaymentMethods.find((m) => m.isDefault)?.id ||
        availablePaymentMethods[0]?.id ||
        "mpesa";
      setSelectedPaymentMethod(defaultMethod);
    }

    // Pre-fill stored customer details from previous orders
    try {
      const savedPhone =
        localStorage.getItem("sp_checkout_phone") ||
        localStorage.getItem("ghuba_checkout_phone");
      const savedName =
        localStorage.getItem("sp_checkout_name") ||
        localStorage.getItem("ghuba_checkout_name");
      const savedEmail = localStorage.getItem("sp_checkout_email");
      if (savedPhone) setMpesaPhone(savedPhone);
      if (savedName) setCustomerName(savedName);
      if (savedEmail) setCustomerEmail(savedEmail);
    } catch {}
  }, [linkCode, groupedVariants, availablePaymentMethods]);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentPending && countdown > 0 && !paymentConfirmed) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentPending, countdown, paymentConfirmed]);

  // Real-time Payment Status Polling
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
              toast.success("Payment confirmed! Your order is placed.", {
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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Checkout link copied!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Order Product",
          text: `Order ${product?.name} directly via SalesmanPro:`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
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
      toast.error("Please enter your full name");
      return;
    }

    setIsSubmitting(true);

    try {
      try {
        localStorage.setItem("sp_checkout_phone", mpesaPhone);
        localStorage.setItem("sp_checkout_name", customerName);
        if (customerEmail) localStorage.setItem("sp_checkout_email", customerEmail);
      } catch {}

      const selectedOptionsArray = Object.entries(selectedVariants).map(
        ([category, name]) => ({
          category,
          name,
        }),
      );

      const shippingAddressText =
        deliveryType === "PICKUP"
          ? "Store Pickup / Click & Collect"
          : `${selectedLocation}${deliveryNotes ? ` - ${deliveryNotes}` : ""}`;

      const orderPayload = {
        companyId: product.companyId || store?.id,
        orderType: "PRODUCT",
        source: "WEBSITE",
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
          checkoutSource: "DIRECT_PAY_LINK",
          directPayLinkId: link?.id,
          linkCode,
          channel: "DIRECT_PAY_LINK",
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

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order creation failed. Please check your details.");
      }

      setCreatedOrderId(data.order.id);
      setCreatedTrackingNumber(data.trackingNumber || data.order.trackingNumber);

      if (selectedPaymentMethod === "mpesa") {
        setPaymentPending(true);
        setCountdown(60);
        toast.success("M-Pesa prompt sent! Check your phone to complete PIN entry.", {
          icon: "📱",
          duration: 5000,
        });
      } else if (
        (selectedPaymentMethod === "paystack" || selectedPaymentMethod === "card") &&
        data.payment?.authorizationUrl
      ) {
        window.location.href = data.payment.authorizationUrl;
      } else {
        setPaymentConfirmed(true);
        toast.success("Order recorded successfully!");
      }
    } catch (err: any) {
      console.error("[DirectPay Error]", err);
      toast.error(err.message || "Failed to complete checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productMedia = resolveProductMedia(product as any);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header / Store Branding */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <HiBuildingStorefront className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  {store?.name || "Official Store"}
                </span>
                <HiCheckBadge className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">
                Direct Pay Checkout • Verified & Secure
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNativeShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            >
              <HiShare className="w-4 h-4 text-emerald-400" />
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Payment Confirmed State */}
        {paymentConfirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/5">
              <HiCheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">
              Order Confirmed & Paid!
            </h2>
            <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm">
              Thank you, <strong className="text-white">{customerName}</strong>. Your payment has been confirmed and the store has received your order.
            </p>

            <div className="inline-flex items-center space-x-3 bg-slate-950 border border-slate-800 px-6 py-3.5 rounded-2xl mb-8">
              <span className="text-xs font-medium text-slate-400">Tracking Code:</span>
              <span className="text-base font-mono font-bold text-emerald-400 select-all">
                {createdTrackingNumber || createdOrderId}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/trackorder?trackingNumber=${createdTrackingNumber || createdOrderId}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Track Live Order
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
              >
                Order Another Item
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Product Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4">
                  {productMedia.primaryUrl ? (
                    <Image
                      src={productMedia.primaryUrl}
                      alt={product?.name || "Product"}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      No Image Available
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-slate-800">
                    Direct Pay Link
                  </div>
                </div>

                <h1 className="text-xl font-extrabold text-white leading-snug mb-2">
                  {product?.name}
                </h1>

                {product?.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {product.description}
                  </p>
                )}

                {/* Pre-Selected Variant Badge */}
                {Object.keys(selectedVariants).length > 0 && (
                  <div className="space-y-2 mb-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/70">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        {link?.allowVariantChange ? "Select Option:" : "Selected Configuration:"}
                      </span>
                      {!link?.allowVariantChange && (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                          <HiLockClosed className="w-3 h-3" />
                          <span>Pre-set by merchant</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(selectedVariants).map(([cat, val]) => (
                        <span
                          key={cat}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                        >
                          <span className="text-slate-400">{cat}:</span> {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Variant Selection if Allowed */}
                {link?.allowVariantChange && Object.keys(groupedVariants).length > 0 && (
                  <div className="space-y-3 mb-4">
                    {Object.entries(groupedVariants).map(([category, items]) => (
                      <div key={category}>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                          Choose {category}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {items.map((opt: any) => {
                            const isSelected = selectedVariants[category] === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [category]: opt.name,
                                  }))
                                }
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                  isSelected
                                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
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

                {/* Quantity Control */}
                <div className="flex items-center justify-between py-3 border-t border-slate-800/80">
                  <span className="text-xs font-medium text-slate-400">Quantity</span>
                  {link?.allowQuantityChange ? (
                    <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white min-w-[20px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) =>
                            Math.min(product?.quantity || 99, q + 1),
                          )
                        }
                        disabled={quantity >= (product?.quantity || 99)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-200 bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
                      {quantity} {quantity === 1 ? "unit" : "units"} (Fixed)
                    </span>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-slate-200">
                      KES {dynamicPricing.itemsSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery ({deliveryType === "PICKUP" ? "Pickup" : selectedLocation})</span>
                    <span className="text-slate-200">
                      {dynamicPricing.deliveryFee === 0
                        ? "FREE"
                        : `KES ${dynamicPricing.deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-slate-800">
                    <span>Total Due</span>
                    <span>KES {dynamicPricing.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-center space-x-6 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <HiShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Escrow & Direct Pay</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HiBolt className="w-4 h-4 text-amber-400" />
                  <span>Instant Confirmation</span>
                </span>
              </div>
            </div>

            {/* Right Column: Fast Checkout Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmitOrder}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-7 backdrop-blur-sm space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    Customer & Fulfilment Details
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter your delivery location and payment phone to proceed.
                  </p>
                </div>

                {/* Fulfilment Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("DELIVERY")}
                    className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition ${
                      deliveryType === "DELIVERY"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <HiTruck className="w-4 h-4" />
                    <span>Courier Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("PICKUP")}
                    className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition ${
                      deliveryType === "PICKUP"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <HiBuildingStorefront className="w-4 h-4" />
                    <span>Shop Pickup</span>
                  </button>
                </div>

                {/* Delivery Location / Pickup Info */}
                {deliveryType === "DELIVERY" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Delivery Area / Region
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        {DEFAULT_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc} ({loc === "Upcountry / Courier" ? "KES 350" : "KES 200"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Building / Street / Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Next to Total Station, 3rd Floor Apt 4B"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 flex items-start space-x-3">
                    <HiBuildingStorefront className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Pickup At Store</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Free collection. You will receive an SMS confirmation when your package is ready at the counter.
                      </p>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      M-Pesa / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    {availablePaymentMethods.map((method) => {
                      const isSelected = selectedPaymentMethod === method.id;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? "bg-slate-950 border-emerald-500/80 ring-1 ring-emerald-500/40"
                              : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={isSelected}
                              onChange={() => setSelectedPaymentMethod(method.id)}
                              className="text-emerald-500 focus:ring-emerald-400 h-4 w-4 bg-slate-900 border-slate-700"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-white">
                                  {method.name}
                                </span>
                                {method.badge && (
                                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {method.description}
                              </p>
                            </div>
                          </div>

                          {method.iconType === "mpesa" ? (
                            <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">
                              M-PESA
                            </span>
                          ) : (
                            <HiCreditCard className="w-5 h-5 text-slate-400" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* STK Push Countdown / Pending Box */}
                {paymentPending && (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2 animate-pulse">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                      <HiArrowPath className="w-5 h-5 animate-spin" />
                      <span>Waiting for M-Pesa PIN...</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      An STK prompt was sent to <strong className="text-white">{mpesaPhone}</strong>. Enter your PIN on your phone to confirm.
                    </p>
                    <div className="text-xs font-mono text-emerald-400">
                      Expiring in: {countdown}s
                    </div>
                  </div>
                )}

                {/* 1-Tap Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || paymentPending}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <HiArrowPath className="w-5 h-5 animate-spin" />
                      <span>Securing Order & Payment...</span>
                    </>
                  ) : paymentPending ? (
                    <>
                      <HiArrowPath className="w-5 h-5 animate-spin" />
                      <span>Checking Payment Status ({countdown}s)...</span>
                    </>
                  ) : (
                    <>
                      <HiBolt className="w-5 h-5" />
                      <span>
                        Pay KES {dynamicPricing.grandTotal.toLocaleString()} Now
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
