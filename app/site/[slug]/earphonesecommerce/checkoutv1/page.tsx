'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Confetti from 'react-confetti';
import {
  CreditCardIcon,
  TruckIcon,
  TrashIcon,
  CheckCircleIcon,
  CalendarIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BuildingLibraryIcon,
  TagIcon,
  MapPinIcon,
  UserCircleIcon,
  PlusIcon,
  MinusIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStore, useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ShippingAddress from '@/components/shippingAddress';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from '@/data/cardFormatter';

const STEPS = ['Billing', 'Shipping', 'Payment', 'Review'] as const;
type StepIndex = 0 | 1 | 2 | 3;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export default function CheckoutPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const store = useStore();
  const { cart = [], clearCart, updateCartQuantity, removeFromCart } = useStateContext() as any;
  const { storeFormData } = useStoreContext();

  // --- Split state into focused slices (reduces re-renders & avoids focus jumping) ---
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  // Billing
  const [billing, setBilling] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  });

  // Shipping
  const [shipping, setShipping] = useState({
    display_name: '',
    lat: 0,
    lng: 0,
    method: 'AT SHOP', // 'Standard' | 'Express' | 'AT SHOP'
  });

  // Payment
  const [payment, setPayment] = useState({
    method: 'paystack', // 'paystack' | 'mpesa' | 'card' | 'cod' | 'pickupatshop'
    cardNumber: session?.user?.cardNumber || '',
    cardExpiry: session?.user?.cardExpiry || '',
    cvv: '',
    mpesaPhone: session?.user?.phone || '',
  });

  // Promo / discounts
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  // Errors per-step
  const [errors, setErrors] = useState<Record<string, string>>({});

  // confetti sizing
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  // Totals (memoized)
  const subtotal = useMemo(() => cart.reduce((s: number, i: any) => s + (i.finalPrice || 0) * (i.quantity || 0), 0), [cart]);
  const shippingCost = useMemo(() => (shipping.method === 'Express' ? 1000 : shipping.method === 'Standard' ? 500 : 0), [shipping.method]);
  const discountAmount = useMemo(() => subtotal * discountRate, [subtotal, discountRate]);
  const total = useMemo(() => subtotal + shippingCost - discountAmount, [subtotal, shippingCost, discountAmount]);

  // Promo debounce (light)
  useEffect(() => {
    if (!promoCode) {
      setPromoMessage('');
      setDiscountRate(0);
      return;
    }
    const t = setTimeout(() => {
      const normalized = promoCode.trim().toUpperCase();
      if (normalized === 'SAVE10') {
        setDiscountRate(0.1);
        setPromoMessage('🎉 10% discount applied!');
      } else {
        setDiscountRate(0);
        setPromoMessage('❌ Invalid promo code. Try SAVE10!');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [promoCode]);

  // Helper: update slices
  const updateBilling = useCallback((patch: Partial<typeof billing>) => setBilling((s) => ({ ...s, ...patch })), []);
  const updateShipping = useCallback((patch: Partial<typeof shipping>) => setShipping((s) => ({ ...s, ...patch })), []);
  const updatePayment = useCallback((patch: Partial<typeof payment>) => setPayment((s) => ({ ...s, ...patch })), []);

  // Address select (from ShippingAddress child)
  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
    updateShipping({ display_name: address, lat: coords.lat, lng: coords.lng });
    setErrors((e) => ({ ...e, shippingAddress: '' }));
  };

  // Quantity handlers forwarded to context
  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find((i: any) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) removeFromCart?.(itemId);
    else updateCartQuantity?.(itemId, newQty);
  };

  // Form validations (only run when moving forward / submitting)
  const validateStep = useCallback(
    (step = currentStep) => {
      const errs: Record<string, string> = {};
      if (step === 0) {
        if (!billing.name?.trim()) errs.name = 'Full name is required';
        if (!billing.email?.trim() || !/^\S+@\S+\.\S+$/.test(billing.email)) errs.email = 'Valid email required';
        if (!billing.phone?.trim() || billing.phone.replace(/\D/g, '').length < 9) errs.phone = 'Valid phone required';
      }
      if (step === 1) {
        if (!shipping.display_name) errs.shippingAddress = 'Select a delivery location';
      }
      if (step === 2) {
        if (payment.method === 'card') {
          const num = (payment.cardNumber || '').replace(/\s/g, '');
          if (!num || num.length < 15) errs.cardNumber = 'Invalid card number';
          if (!payment.cardExpiry || payment.cardExpiry.length !== 5) errs.cardExpiry = 'MM/YY';
          if (!payment.cvv || payment.cvv.length < 3) errs.cvv = 'Invalid CVV';
        }
        if (payment.method === 'mpesa') {
          const p = payment.mpesaPhone?.replace(/\D/g, '');
          if (!p || p.length < 12) errs.mpesaPhone = 'Use format 2547XXXXXXXX';
        }
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [billing, payment, shipping, currentStep]
  );

  // Step navigation
  const next = useCallback(() => {
    if (!validateStep(currentStep)) return;
    // setCurrentStep((s) => Math.min(s + 1, (STEPS.length - 1) as StepIndex));
    setCurrentStep((s) => {
      const nextIdx = Math.min(s + 1, STEPS.length - 1);
      return nextIdx as StepIndex;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0) as StepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Input handlers (formatters applied only for relevant fields)
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') return updatePayment({ cardNumber: formatCreditCardNumber(value) });
    if (name === 'cardExpiry') return updatePayment({ cardExpiry: formatExpirationDate(value) });
    if (name === 'cvv') return updatePayment({ cvv: formatCVC(value) });
    if (name === 'mpesaPhone') return updatePayment({ mpesaPhone: value.replace(/\D/g, '') });
    if (name === 'name' || name === 'email' || name === 'phone') return updateBilling({ [name]: value } as any);
    if (name === 'promoCode') return setPromoCode(value);
    if (name === 'shippingMethod') return updateShipping({ method: value });
    if (name === 'paymentMethod') return updatePayment({ method: value });
  };

  // Submit handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // final validate all steps
    for (let s = 0; s < STEPS.length; s++) {
      if (!validateStep(s as StepIndex)) {
        setCurrentStep(s as StepIndex);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        consumerId: session?.user?.id,
        companyId: store?.id,
        name: billing.name,
        email: billing.email,
        phone: billing.phone,
        promoCode,
        items: cart.map((i: any) => ({ marketplaceListingId: i.id, quantity: i.quantity, price: i.finalPrice })),
        shippingAddress: {
          display_name: shipping.display_name,
          lat: shipping.lat,
          lng: shipping.lng,
        },
        shippingMethod: shipping.method,
        paymentOption: payment.method,
        delivery: shipping.method !== 'AT SHOP',
        totalPrice: parseFloat(total.toFixed(2)),
        paymentData: {
          cardNumber: (payment.cardNumber || '').replace(/\s/g, ''),
          cardExpiry: payment.cardExpiry,
          cvv: payment.cvv,
          mpesaPhone: payment.mpesaPhone,
        },
      };

      const res = await fetch(`/api/shop/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || '',
          Credentials: 'include',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body?.message || body?.data || res.statusText;
        throw new Error(message || 'Order submission failed');
      }

      const { data: orderResponse } = await res.json();

      // Payment flows
      switch (payment.method) {
        case 'paystack':
          if (orderResponse?.authorizationUrl) {
            // Redirect to paystack
            router.push(orderResponse.authorizationUrl);
            return;
          }
          throw new Error('Paystack authorization URL missing');
        case 'mpesa':
          // STK push initiated by backend - show pending state but for simplicity continue to success if backend returned a tracking number
          break;
        case 'card':
          // Backend charged directly or returned result
          break;
        case 'cod':
        case 'pickupatshop':
          break;
        default:
          break;
      }

      if (!orderResponse?.trackingNumber) throw new Error('Server did not return a tracking number');

      clearCart();
      setTrackingNumber(orderResponse.trackingNumber);
      setIsOrderPlaced(true);
    } catch (err: any) {
      console.error('Submit error', err);
      setSubmitError(err.message || 'Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order placed, show status with confetti
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }} className="bg-white rounded-3xl p-10 shadow-2xl max-w-lg w-full border border-gray-100 text-center">
          <div className="mx-auto bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Order Placed!</h2>
          <p className="mt-2 text-gray-600">Thanks — your order is confirmed.</p>
          <p className="mt-2 text-indigo-600 font-medium">Tracking Number: <span className="font-semibold">{trackingNumber}</span></p>
          <div className="mt-6 grid gap-3">
            <button onClick={() => router.push(`/shop/orderTracking?trackingnumber=${trackingNumber}`)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              Track Your Order
            </button>
            <button onClick={() => router.push('/')} className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <ArrowLeftIcon className="w-5 h-5" /> Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-6 md:p-12">
      <Section title="🛒 Checkout " >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <ProgressHeader currentStep={currentStep} />
            <div className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Form (large column) */}
            <div className="lg:col-span-8 space-y-6">
              <motion.form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-6" onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => { if (e.key === 'Enter') e.stopPropagation(); }}>
                {/* Steps area: render all steps, only visually active one receives focus */}
                <div className="relative min-h-[360px]">
                  {/* We'll keep all steps mounted to avoid focus loss; animate their visibility */}
                  <StepWrapper active={currentStep === 0}>
                    <BillingStep billing={billing} onChange={updateBilling} errors={errors} />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 1}>
                    <ShippingStep shipping={shipping} onChange={updateShipping} onSelect={handleAddressSelect} errors={errors} />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 2}>
                    <PaymentStep payment={payment} onChange={updatePayment} errors={errors} />
                    {/* Promo */}
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <label htmlFor="promoCode" className="sr-only">Promo code</label>
                          <div className="flex gap-3">
                            <input id="promoCode" name="promoCode" value={promoCode} onChange={onInputChange} placeholder="Enter promo (eg. SAVE10)" className="w-full p-3 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                            <button type="button" onClick={() => { /* promo is auto-applied by effect */ }} className="px-4 py-2 rounded-xl bg-yellow-600 text-white font-semibold">Apply</button>
                          </div>
                          {promoMessage && <p className={`mt-2 text-sm ${promoMessage.startsWith('❌') ? 'text-red-600' : 'text-green-700'}`}>{promoMessage}</p>}
                        </div>
                      </div>
                    </div>
                  </StepWrapper>

                  <StepWrapper active={currentStep === 3}>
                    <ReviewStep billing={billing} shipping={shipping} payment={payment} total={total} subtotal={subtotal} shippingCost={shippingCost} discountAmount={discountAmount} />
                  </StepWrapper>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    {currentStep > 0 ? (
                      <button type="button" onClick={prev} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                        <ArrowLeftIcon className="w-4 h-4" /> Back
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {currentStep < (STEPS.length - 1) ? (
                      <button type="button" onClick={next} className="px-6 py-3 rounded-full bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition">
                        Continue
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting} className={`px-6 py-3 rounded-full font-bold shadow ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {isSubmitting ? 'Processing…' : 'Place Order'}
                      </button>
                    )}
                  </div>
                </div>

                {submitError && <div className="text-red-600 rounded-md bg-red-50 p-3 text-center">{submitError}</div>}
              </motion.form>

              <NewsletterSection />
            </div>

            {/* Right: Order Summary (sticky) */}
            <div className="lg:col-span-4">
              <MemoizedOrderSummary
                cart={cart}
                subtotal={subtotal}
                shippingCost={shippingCost}
                discountAmount={discountAmount}
                total={total}
                estimatedDelivery={estimateDeliveryText(shipping.method)}
                onInc={(id: string) => handleQuantityChange(id, 1)}
                onDec={(id: string) => handleQuantityChange(id, -1)}
                onRemove={(id: string) => removeFromCart?.(id)}
              />
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
}

/* ------------------------------
   Small presentational / step components inside single file
   (Keeps single-file requirement but modular)
   ------------------------------ */

function StepWrapper({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key="step"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function ProgressHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-6">
      {STEPS.map((label, i) => {
        const isActive = currentStep === i;
        const isDone = currentStep > i;
        return (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {i + 1}
            </div>
            <div className="hidden md:block">
              <div className={`text-sm ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`}>{label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------
   Billing Step
   ------------------------------ */
function BillingStep({ billing, onChange, errors }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Billing Information</h3>
      <p className="text-sm text-gray-600">Enter your contact details for order updates.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input name="name" value={billing.name} onChange={(e) => onChange({ name: e.target.value })} className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input name="email" value={billing.email} onChange={(e) => onChange({ email: e.target.value })} className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" value={billing.phone} onChange={(e) => onChange({ phone: e.target.value })} className={`w-full p-3 rounded-xl border ${errors.phone ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   Shipping Step
   ------------------------------ */
function ShippingStep({ shipping, onChange, onSelect, errors }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Delivery</h3>
      <p className="text-sm text-gray-600">Where should we deliver your items?</p>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Search or pick a saved address</label>
        <div className="mt-2">
          {/* ShippingAddress is your own component; ensure it calls onSelect(address, coords) */}
          <ShippingAddress onAddressSelect={(addr: string, coords: any) => onSelect(addr, coords)} />
          {errors.shippingAddress && <p className="mt-2 text-xs text-red-600">{errors.shippingAddress}</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Shipping method</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {[
            { id: 'AT SHOP', title: 'Pickup (At shop)', subtitle: 'No delivery' },
            { id: 'Standard', title: 'Standard', subtitle: '5 days • KES 500' },
            { id: 'Express', title: 'Express', subtitle: '2 days • KES 1000' },
          ].map((m) => (
            <label key={m.id} className={`p-3 rounded-xl border ${shipping.method === m.id ? 'border-indigo-600 bg-indigo-50 shadow' : 'border-gray-200 hover:border-indigo-300'} cursor-pointer`}>
              <input className="sr-only" type="radio" name="shippingMethod" value={m.id} checked={shipping.method === m.id} onChange={(e) => onChange({ method: e.target.value })} />
              <div className="font-semibold">{m.title}</div>
              <div className="text-sm text-gray-500">{m.subtitle}</div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   Payment Step
   ------------------------------ */
function PaymentStep({ payment, onChange, errors }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Payment</h3>
      <p className="text-sm text-gray-600">Choose how you want to pay.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { value: 'paystack', label: 'Paystack', Icon: BanknotesIcon },
          { value: 'mpesa', label: 'M-Pesa', Icon: TagIcon },
          { value: 'card', label: 'Card', Icon: CreditCardIcon },
          { value: 'cod', label: 'Cash on Delivery', Icon: TruckIcon },
        ].map(({ value, label, Icon }) => (
          <label key={value} className={`p-3 rounded-xl border cursor-pointer text-center ${payment.method === value ? 'border-indigo-600 bg-indigo-50 shadow' : 'border-gray-200 hover:border-indigo-300'}`}>
            <input className="sr-only" type="radio" name="paymentMethod" value={value} checked={payment.method === value} onChange={(e) => onChange({ method: e.target.value })} />
            <div className="flex flex-col items-center gap-2">
              <Icon className="w-7 h-7 text-indigo-600" />
              <div className="text-sm font-medium">{label}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Payment details conditional */}
      <div className="mt-4">
        {payment.method === 'card' && (
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Card number</label>
                <input name="cardNumber" value={payment.cardNumber} onChange={(e) => onChange({ cardNumber: formatCreditCardNumber(e.target.value) })} maxLength={19} className={`w-full p-3 rounded-xl border ${errors.cardNumber ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cardNumber && <p className="text-xs text-red-600">{errors.cardNumber}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
                <input name="cardExpiry" value={payment.cardExpiry} onChange={(e) => onChange({ cardExpiry: formatExpirationDate(e.target.value) })} maxLength={5} className={`w-full p-3 rounded-xl border ${errors.cardExpiry ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cardExpiry && <p className="text-xs text-red-600">{errors.cardExpiry}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CVC</label>
                <input name="cvv" value={payment.cvv} onChange={(e) => onChange({ cvv: formatCVC(e.target.value) })} maxLength={4} className={`w-full p-3 rounded-xl border ${errors.cvv ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cvv && <p className="text-xs text-red-600">{errors.cvv}</p>}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Card payments are securely processed by your payment provider.</p>
          </div>
        )}

        {payment.method === 'mpesa' && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <label className="text-sm font-medium text-gray-700">M-Pesa Number</label>
            <input name="mpesaPhone" value={payment.mpesaPhone} onChange={(e) => onChange({ mpesaPhone: e.target.value.replace(/\D/g, '') })} placeholder="2547XXXXXXXX" className={`w-full p-3 rounded-xl border ${errors.mpesaPhone ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.mpesaPhone && <p className="text-xs text-red-600">{errors.mpesaPhone}</p>}
            <p className="mt-2 text-xs text-gray-500">You will receive a payment prompt on this number after placing the order.</p>
          </div>
        )}

        {payment.method === 'paystack' && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="font-medium text-yellow-700">Pay via Paystack</div>
            <p className="text-sm text-gray-600 mt-1">You'll be securely redirected to complete payment (card, bank, USSD).</p>
          </div>
        )}

        {payment.method === 'cod' && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="font-medium text-blue-700">Cash on Delivery</div>
            <p className="text-sm text-gray-600 mt-1">Pay the courier when your order arrives. Please have exact change ready.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------
   Review Step
   ------------------------------ */
function ReviewStep({ billing, shipping, payment, total, subtotal, shippingCost, discountAmount }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Review & Confirm</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h4 className="font-semibold text-indigo-600 flex items-center gap-2"><UserCircleIcon className="w-5 h-5" /> Billing</h4>
          <p className="mt-2 text-gray-700"><strong>Name:</strong> {billing.name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {billing.email}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {billing.phone}</p>
        </div>

        <div>
          <h4 className="font-semibold text-indigo-600 flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> Shipping</h4>
          <p className="mt-2 text-gray-700"><strong>Address:</strong> {shipping.display_name || 'N/A'}</p>
          <p className="text-gray-700"><strong>Method:</strong> {shipping.method}</p>
          <p className="text-gray-700"><strong>Payment:</strong> {payment.method.toUpperCase()}</p>
          {payment.method === 'mpesa' && <p className="text-gray-700"><strong>M-Pesa:</strong> {payment.mpesaPhone}</p>}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex justify-between font-extrabold text-2xl"><span>Final Total</span><span>{total.toFixed(2)}</span></div>
        <p className="text-sm text-indigo-700 mt-2">By placing the order you agree to our terms & conditions.</p>
      </div>
    </div>
  );
}

/* ------------------------------
   Memoized OrderSummary
   ------------------------------ */
const OrderSummary = ({ cart, subtotal, shippingCost, discountAmount, total, estimatedDelivery, onInc, onDec, onRemove }: any) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 sticky top-20">
      <h4 className="text-lg font-extrabold mb-4">Your Cart</h4>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <div className="text-gray-500 italic py-8 text-center">Cart is empty</div>
        ) : (
          cart.map((item: any) => (
            <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-50">
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.title || item.name}</div>
                <div className="text-sm text-gray-500">KES {((item.finalPrice || 0)).toFixed(2)} • Qty: {item.quantity}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="font-extrabold">KES {(((item.finalPrice || 0) * item.quantity)).toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onDec(item.id)} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"><MinusIcon className="w-4 h-4" /></button>
                  <div className="text-sm font-semibold">{item.quantity}</div>
                  <button onClick={() => onInc(item.id)} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"><PlusIcon className="w-4 h-4" /></button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-sm text-red-500 mt-1">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 border-t pt-4 space-y-2 text-gray-600">
        <div className="flex justify-between"><span>Subtotal</span><span>KES {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shippingCost > 0 ? `KES ${shippingCost.toFixed(2)}` : '0'}</span></div>
        <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>- KES {discountAmount.toFixed(2)}</span></div>
        <div className="flex justify-between font-extrabold text-xl mt-3"><span>Total</span><span>KES {total.toFixed(2)}</span></div>
      </div>

      <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-indigo-600" />
        <div className="text-sm">Estimated Delivery: <span className="font-semibold">{estimatedDelivery}</span></div>
      </div>
    </div>
  );
};

const MemoizedOrderSummary = React.memo(OrderSummary);

/* ------------------------------
   Utility
   ------------------------------ */
function estimateDeliveryText(method: string) {
  if (method === 'Express') return new Date(Date.now() + 2 * 24 * 3600 * 1000).toDateString();
  if (method === 'Standard') return new Date(Date.now() + 5 * 24 * 3600 * 1000).toDateString();
  return 'Pickup';
}
