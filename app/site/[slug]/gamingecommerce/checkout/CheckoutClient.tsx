'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Confetti from 'react-confetti';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  BanknotesIcon,
  GlobeAltIcon,
  WalletIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  UserCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ShippingAddress from '@/components/shippingAddress';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from '@/data/cardFormatter';
import { useStoreContext } from '@/contexts/StoreContext';

// --- CONFIGURATION MAPPING ---
const METHOD_CONFIG: Record<string, { label: string; Icon: any; colorClass: string }> = {
  ghuba: { label: 'Ghuba Pay', Icon: WalletIcon, colorClass: 'text-purple-600 bg-purple-50 border-purple-200' },
  stripe: { label: 'Credit Card (Stripe)', Icon: CreditCardIcon, colorClass: 'text-blue-600 bg-blue-50 border-blue-200' },
  paypal: { label: 'PayPal', Icon: GlobeAltIcon, colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  mpesa: { label: 'M-Pesa', Icon: TagIcon, colorClass: 'text-green-600 bg-green-50 border-green-200' },
  paystack: { label: 'Paystack', Icon: BanknotesIcon, colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  cod: { label: 'Cash on Delivery', Icon: TruckIcon, colorClass: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const STEPS = ['Billing', 'Shipping', 'Payment', 'Review'] as const;
type StepIndex = 0 | 1 | 2 | 3;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- Types ---
interface PublicPaymentMethod {
  id: string;
  label: string;
  isEnabled: boolean;
  meta: Record<string, any>;
}

interface CheckoutClientProps {
  paymentMethods: PublicPaymentMethod[];
  shippingSettings?: Record<string, any>;
}

export default function CheckoutClient({ paymentMethods = [], shippingSettings = {} }: CheckoutClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { cart = [], clearCart, updateCartQuantity, removeFromCart } = useStateContext() as any;
  const { storeFormData } = useStoreContext();

  // --- State ---
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
    method: 'AT SHOP',
  });

  // Payment - Default to first available method
  const [payment, setPayment] = useState({
    method: paymentMethods[0]?.id || '',
    cardNumber: session?.user?.cardNumber || '',
    cardExpiry: session?.user?.cardExpiry || '',
    cvv: '',
    mpesaPhone: session?.user?.phone || '',
  });

  // Update payment method default if props load later
  useEffect(() => {
    if (paymentMethods.length > 0 && !payment.method) {
        setPayment(prev => ({ ...prev, method: paymentMethods[0].id }));
    }
  }, [paymentMethods, payment.method]);

  // Promo / discounts
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', update);
        update();
        return () => window.removeEventListener('resize', update);
    }
  }, []);

  // Totals
  const subtotal = useMemo(() => cart.reduce((s: number, i: any) => s + (i.finalPrice || 0) * (i.quantity || 0), 0), [cart]);
  const shippingCost = useMemo(() => (shipping.method === 'Express' ? shippingSettings.expressRate ?? 0 : shipping.method === 'Standard' ? shippingSettings.standardRate ?? 0 : 0), [shipping.method, shippingSettings]);
  const discountAmount = useMemo(() => subtotal * discountRate, [subtotal, discountRate]);
  const total = useMemo(() => subtotal + shippingCost - discountAmount, [subtotal, shippingCost, discountAmount]);

  // Promo debounce
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

  const updateBilling = useCallback((patch: Partial<typeof billing>) => setBilling((s) => ({ ...s, ...patch })), []);
  const updateShipping = useCallback((patch: Partial<typeof shipping>) => setShipping((s) => ({ ...s, ...patch })), []);
  const updatePayment = useCallback((patch: Partial<typeof payment>) => setPayment((s) => ({ ...s, ...patch })), []);

  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
    updateShipping({ display_name: address, lat: coords.lat, lng: coords.lng });
    setErrors((e) => ({ ...e, shippingAddress: '' }));
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find((i: any) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) removeFromCart?.(itemId);
    else updateCartQuantity?.(itemId, newQty);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') return updatePayment({ cardNumber: formatCreditCardNumber(value) });
    if (name === 'cardExpiry') return updatePayment({ cardExpiry: formatExpirationDate(value) });
    if (name === 'cvv') return updatePayment({ cvv: formatCVC(value) });
    if (name === 'mpesaPhone') return updatePayment({ mpesaPhone: value.replace(/\D/g, '') });
    if (name === 'name' || name === 'email' || name === 'phone') return updateBilling({ [name]: value } as any);
    if (name === 'promoCode') return setPromoCode(value);
    if (name === 'shippingMethod') return updateShipping({ method: value });
    if (name === 'paymentMethod') return updatePayment({ method: value as any });
  };

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
        if (payment.method === 'mpesa') {
          const p = payment.mpesaPhone?.replace(/\D/g, '');
          if (!p || p.length < 12) errs.mpesaPhone = 'Use format 2547XXXXXXXX';
        }
        if (!payment.method) errs.paymentMethod = 'Please select a payment method';
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [billing, payment, shipping, currentStep]
  );

  const next = useCallback(() => {
    if (!validateStep(currentStep)) return;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        companyId: storeFormData?.id,
        name: billing.name,
        email: billing.email,
        phone: billing.phone,
        promoCode,
        items: cart.map((i: any) => ({ marketplaceListingId: i.id, quantity: i.quantity, price: i.finalPrice, totalPrice: i.finalPrice * i.quantity, selectedOptions: i.selectedOptions || [] })),
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
        throw new Error(body?.message || body?.data || res.statusText);
      }

      const { data: orderResponse } = await res.json();

      if (payment.method === 'paystack' && orderResponse?.authorizationUrl) {
        router.push(orderResponse.authorizationUrl);
        return;
      }
      if (payment.method === 'ghuba' && orderResponse?.authorizationUrl) {
          // router.push(orderResponse.checkoutUrl);
          router.push(orderResponse.authorizationUrl);
          return;
      }
      if (payment.method === 'paypal' && orderResponse?.approveLink) {
          router.push(orderResponse.approveLink);
          return;
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
            <div className="lg:col-span-8 space-y-6">
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-6" onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}>
                <div className="relative min-h-[360px]">
                  <StepWrapper active={currentStep === 0}>
                    <BillingStep billing={billing} onChange={updateBilling} errors={errors} />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 1}>
                    <ShippingStep shipping={shipping} onChange={updateShipping} onSelect={handleAddressSelect} errors={errors} shippingSettings={shippingSettings} />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 2}>
                    <PaymentStep 
                        payment={payment} 
                        onChange={updatePayment} 
                        errors={errors} 
                        availableMethods={paymentMethods} 
                    />
                     <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <label htmlFor="promoCode" className="sr-only">Promo code</label>
                          <div className="flex gap-3">
                            <input id="promoCode" name="promoCode" value={promoCode} onChange={onInputChange} placeholder="Enter promo (eg. SAVE10)" className="w-full p-3 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                            <button type="button" onClick={() => {}} className="px-4 py-2 rounded-xl bg-yellow-600 text-white font-semibold">Apply</button>
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    {currentStep > 0 ? (
                      <button type="button" onClick={prev} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                        <ArrowLeftIcon className="w-4 h-4" /> Back
                      </button>
                    ) : <div />}
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
              </form>
              <NewsletterSection />
            </div>

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

// --- SUBCOMPONENTS (StepWrapper, PaymentStep, etc.) ---
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

function BillingStep({ billing, onChange, errors }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Billing Information</h3>
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

function ShippingStep({ shipping, onChange, onSelect, errors, shippingSettings }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Delivery</h3>
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Search or pick a saved address</label>
        <div className="mt-2">
          <ShippingAddress onAddressSelect={(addr: string, coords: any) => onSelect(addr, coords)} />
          {errors.shippingAddress && <p className="mt-2 text-xs text-red-600">{errors.shippingAddress}</p>}
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">Shipping method</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {[
            { id: 'AT SHOP', title: 'Pickup (At shop)', subtitle: 'No delivery' },
            { id: 'Standard', title: 'Standard', subtitle: `5 days • KES ${shippingSettings.standardRate ?? 500}` },
            { id: 'Express', title: 'Express', subtitle: `2 days • KES ${shippingSettings.expressRate ?? 1000}` },
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

function PaymentStep({ payment, onChange, errors, availableMethods = [] }: any) {
  if (availableMethods.length === 0) {
      return <div className="p-6 text-center text-red-500">No payment methods available for this store.</div>;
  }
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Payment</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {availableMethods.map((m: PublicPaymentMethod) => {
          const config = METHOD_CONFIG[m.id] || { label: m.label || m.id, Icon: CurrencyDollarIcon, colorClass: 'border-gray-200' };
          const Icon = config.Icon;
          const isSelected = payment.method === m.id;
          return (
            <label key={m.id} className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${isSelected ? `${config.colorClass} ring-2 ring-offset-1 ring-indigo-500 shadow-md` : 'border-gray-200 hover:border-indigo-300 bg-white'}`}>
              <input className="sr-only" type="radio" name="paymentMethod" value={m.id} checked={isSelected} onChange={(e) => onChange({ method: e.target.value })} />
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-8 h-8 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                <div className="text-sm font-semibold">{m.label || config.label}</div>
              </div>
            </label>
          );
        })}
      </div>
      <div className="mt-6">
        {payment.method === 'stripe' && (
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-3 text-blue-800">
                <CreditCardIcon className="w-5 h-5"/> <span className="font-semibold">Secure Credit Card Payment</span>
             </div>
             <div className="text-sm text-gray-600">You will be redirected to Stripe's secure checkout page.</div>
          </div>
        )}
        {payment.method === 'mpesa' && (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <label className="text-sm font-bold text-green-800 block mb-2">M-Pesa Phone Number</label>
            <input name="mpesaPhone" value={payment.mpesaPhone} onChange={(e) => onChange({ mpesaPhone: e.target.value.replace(/\D/g, '') })} placeholder="2547XXXXXXXX" className={`w-full p-3 pl-4 rounded-xl border ${errors.mpesaPhone ? 'border-red-400' : 'border-green-300'} focus:ring-2 focus:ring-green-500 outline-none`} />
            {errors.mpesaPhone && <p className="text-xs text-red-600 mt-1">{errors.mpesaPhone}</p>}
            <p className="mt-3 text-xs text-green-700 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> You will receive an STK push prompt.</p>
          </div>
        )}
        {payment.method === 'ghuba' && (
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
             <h4 className="font-semibold text-purple-900">Ghuba Pay</h4>
             <p className="text-sm text-purple-700 mt-1">Fast and secure local payments via Ghuba gateway.</p>
          </div>
        )}
        {payment.method === 'paypal' && (
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-indigo-900">
             <h4 className="font-semibold">Pay with PayPal</h4>
             <p className="text-sm mt-1">You will be redirected to PayPal.</p>
          </div>
        )}
        {payment.method === 'paystack' && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800">
            <div className="font-bold">Pay via Paystack</div>
            <p className="text-sm mt-1">Secure payment via Card, Bank Transfer, or USSD.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewStep({ billing, shipping, payment, total }: any) {
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
        </div>
      </div>
      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex justify-between font-extrabold text-2xl"><span>Final Total</span><span>{total.toFixed(2)}</span></div>
        <p className="text-sm text-indigo-700 mt-2">By placing the order you agree to our terms & conditions.</p>
      </div>
    </div>
  );
}

const MemoizedOrderSummary = React.memo(({ cart, subtotal, shippingCost, discountAmount, total, estimatedDelivery, onInc, onDec, onRemove }: any) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 sticky top-20">
      <h4 className="text-lg font-extrabold mb-4">Your Cart</h4>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {cart.length === 0 ? <div className="text-gray-500 italic py-8 text-center">Cart is empty</div> : cart.map((item: any) => (
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
          ))}
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
});

function estimateDeliveryText(method: string) {
  if (method === 'Express') return new Date(Date.now() + 2 * 24 * 3600 * 1000).toDateString();
  if (method === 'Standard') return new Date(Date.now() + 5 * 24 * 3600 * 1000).toDateString();
  return 'Pickup';
}