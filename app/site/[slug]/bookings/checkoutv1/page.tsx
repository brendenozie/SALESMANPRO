'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Confetti from 'react-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';

const STEPS = ['Billing', 'Schedule', 'Payment', 'Review'] as const;
type StepIndex = 0 | 1 | 2 | 3;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

type BookingParams = {
  listingId: string;
  name: string;
  price: number;
  productType?: string;
  enrollmentDate?: string;
  timeSlot?: string;
};

export default function ServiceCheckoutPage(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract params from URL
  const listingId = (searchParams.get('listingId') || '').trim();
  const productName = (searchParams.get('name') || '').trim();
  const priceParam = searchParams.get('price') || '';
  const productType = (searchParams.get('productType') || '').trim() || 'service';
  const enrollmentDateParam = searchParams.get('enrollmentDate') || '';
  const timeSlotParam = searchParams.get('timeSlot') || '';

  if (!listingId || !productName || !priceParam) {
    return <p className="p-6 text-red-600">Missing booking details.</p>;
  }

  const price = Number(priceParam) || 0;

  // --- Step state
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

  // Appointment
  const [appointment, setAppointment] = useState({
    date: enrollmentDateParam || '', // ISO date string yyyy-mm-dd
    timeSlot: timeSlotParam || '', // e.g., "10:00 - 11:00"
    provider: '', // optional provider id/name
    locationType: 'online', // 'online' | 'inperson'
  });

  // Payment
  const [payment, setPayment] = useState({
    method: 'mpesa', // mpesa | card | paystack | cash
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
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  // Derived totals
  const subtotal = price;
  const discountAmount = useMemo(() => subtotal * discountRate, [subtotal, discountRate]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  // Promo debounce
  useEffect(() => {
    if (!promoCode) {
      setPromoMessage('');
      setDiscountRate(0);
      return;
    }
    const t = setTimeout(() => {
      const normalized = promoCode.trim().toUpperCase();
      if (normalized === 'SERVICE10') {
        setDiscountRate(0.1);
        setPromoMessage('🎉 10% discount applied!');
      } else {
        setDiscountRate(0);
        setPromoMessage('❌ Invalid promo code. Try SERVICE10!');
      }
    }, 350);
    return () => clearTimeout(t);
  }, [promoCode]);

  // Helper updates
  const updateBilling = useCallback((patch: Partial<typeof billing>) => setBilling((s) => ({ ...s, ...patch })), []);
  const updateAppointment = useCallback((patch: Partial<typeof appointment>) => setAppointment((s) => ({ ...s, ...patch })), []);
  const updatePayment = useCallback((patch: Partial<typeof payment>) => setPayment((s) => ({ ...s, ...patch })), []);

  // Validation
  const validateStep = useCallback(
    (step = currentStep) => {
      const errs: Record<string, string> = {};
      if (step === 0) {
        if (!billing.name?.trim()) errs.name = 'Full name is required';
        if (!billing.email?.trim() || !/^\S+@\S+\.\S+$/.test(billing.email)) errs.email = 'Valid email required';
        if (!billing.phone?.trim() || billing.phone.replace(/\D/g, '').length < 9) errs.phone = 'Valid phone required';
      }
      if (step === 1) {
        // For ebooks allow skipping date/time
        if (productType !== 'ebook') {
          if (!appointment.date) errs.date = 'Please pick an appointment date';
          if (!appointment.timeSlot) errs.timeSlot = 'Please pick a time slot';
        }
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
    [billing, appointment, payment, currentStep, productType]
  );

  // Navigation
  const next = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => (Math.min(s + 1, STEPS.length - 1) as StepIndex));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep]);

  const prev = useCallback(() => {
    setCurrentStep((s) => (Math.max(s - 1, 0) as StepIndex));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Input handler
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') return updatePayment({ cardNumber: formatCreditCardNumber(value) });
    if (name === 'cardExpiry') return updatePayment({ cardExpiry: formatExpirationDate(value) });
    if (name === 'cvv') return updatePayment({ cvv: formatCVC(value) });
    if (name === 'mpesaPhone') return updatePayment({ mpesaPhone: value.replace(/\D/g, '') });
    if (name === 'name' || name === 'email' || name === 'phone') return updateBilling({ [name]: value } as any);
    if (name === 'promoCode') return setPromoCode(value);
    if (name === 'locationType') return updateAppointment({ locationType: value });
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
      // Build payload
      const payload = {
        listingId,
        serviceName: productName,
        productType,
        price: subtotal,
        billing,
        appointment,
        promoCode,
        paymentOption: payment.method,
        totalPrice: parseFloat(total.toFixed(2)),
        // optional: include session user id if available
        consumerId: session?.user?.id,
      };

      const res = await fetch(`${apiBaseUrl}/shop/serviceOrders`, {
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
        throw new Error(message || 'Booking submission failed');
      }

      const { data: orderResponse } = await res.json();

      // Payment flows
      switch (payment.method) {
        case 'paystack':
          if (orderResponse?.authorizationUrl) {
            router.push(orderResponse.authorizationUrl);
            return;
          }
          throw new Error('Paystack authorization URL missing');
        case 'mpesa':
          // backend may have initiated STK push — wait for tracking number or show pending
          break;
        case 'card':
          // handled server-side
          break;
        case 'cash':
          break;
        default:
          break;
      }

      if (!orderResponse?.trackingNumber) {
        // still success but without tracking number
        setTrackingNumber(orderResponse?.id || 'N/A');
      } else {
        setTrackingNumber(orderResponse.trackingNumber);
      }

      setIsOrderPlaced(true);
    } catch (err: any) {
      console.error('Submit error', err);
      setSubmitError(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order placed, show confetti screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }} className="bg-white rounded-3xl p-10 shadow-2xl max-w-lg w-full border border-gray-100 text-center">
          <div className="mx-auto bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Booking Confirmed!</h2>
          <p className="mt-2 text-gray-600">Thanks — your booking is confirmed.</p>
          <p className="mt-2 text-indigo-600 font-medium">Reference: <span className="font-semibold">{trackingNumber}</span></p>
          <div className="mt-6 grid gap-3">
            <button onClick={() => router.push(`/service/booking/${trackingNumber}`)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              View Booking
            </button>
            <button onClick={() => router.push('/')} className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <ArrowLeftIcon className="w-5 h-5" /> Continue Browsing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-6 md:p-12">
      <Section title={`📅 Book — ${productName}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <ProgressHeader currentStep={currentStep} />
            <div className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Form */}
            <div className="lg:col-span-8 space-y-6">
              <motion.form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-6" onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => { if (e.key === 'Enter') e.preventDefault(); }}>
                <div className="relative min-h-[360px]">
                  <StepWrapper active={currentStep === 0}>
                    <BillingStep billing={billing} onChange={updateBilling} errors={errors} />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 1}>
                    <ScheduleStep
                      appointment={appointment}
                      onChange={updateAppointment}
                      price={price}
                      productType={productType}
                      preselectedDate={enrollmentDateParam}
                      preselectedTime={timeSlotParam}
                      errors={errors}
                    />
                  </StepWrapper>

                  <StepWrapper active={currentStep === 2}>
                    <PaymentStep payment={payment} onChange={updatePayment} errors={errors} onInputChange={onInputChange} />
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-yellow-600" />
                        <div className="flex-1">
                          <label htmlFor="promoCode" className="sr-only">Promo code</label>
                          <div className="flex gap-3">
                            <input id="promoCode" name="promoCode" value={promoCode} onChange={onInputChange} placeholder="Enter promo (eg. SERVICE10)" className="w-full p-3 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                            <button type="button" onClick={() => {}} className="px-4 py-2 rounded-xl bg-yellow-600 text-white font-semibold">Apply</button>
                          </div>
                          {promoMessage && <p className={`mt-2 text-sm ${promoMessage.startsWith('❌') ? 'text-red-600' : 'text-green-700'}`}>{promoMessage}</p>}
                        </div>
                      </div>
                    </div>
                  </StepWrapper>

                  <StepWrapper active={currentStep === 3}>
                    <ReviewStep
                      billing={billing}
                      appointment={appointment}
                      payment={payment}
                      total={total}
                      subtotal={subtotal}
                      discountAmount={discountAmount}
                      productName={productName}
                      price={price}
                    />
                  </StepWrapper>
                </div>

                {/* Navigation */}
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
                        {isSubmitting ? 'Processing…' : `Confirm & Pay KES ${total.toFixed(2)}`}
                      </button>
                    )}
                  </div>
                </div>

                {submitError && <div className="text-red-600 rounded-md bg-red-50 p-3 text-center">{submitError}</div>}
              </motion.form>

              <NewsletterSection />
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4">
              <MemoizedOrderSummary
                productName={productName}
                price={price}
                subtotal={subtotal}
                discountAmount={discountAmount}
                total={total}
                appointment={appointment}
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
      <h3 className="text-2xl font-extrabold text-gray-900">Contact Information</h3>
      <p className="text-sm text-gray-600">Enter your contact details for booking updates and receipts.</p>

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
   Schedule Step (Calendar + Time slots)
   ------------------------------ */

type Slot = { id: string; label: string; capacity?: number; remaining?: number };

function ScheduleStep({ appointment, onChange, price, productType, preselectedDate, preselectedTime, errors }: any) {
  // Simple sample available slots — in production, fetch from API per-date/provider
  const defaultSlots: Slot[] = [
    { id: 's1', label: '09:00 - 10:00', capacity: 5, remaining: 5 },
    { id: 's2', label: '10:00 - 11:00', capacity: 5, remaining: 5 },
    { id: 's3', label: '11:00 - 12:00', capacity: 2, remaining: 2 },
    { id: 's4', label: '14:00 - 15:00', capacity: 3, remaining: 3 },
    { id: 's5', label: '16:00 - 17:00', capacity: 3, remaining: 3 },
  ];

  const [availableSlots, setAvailableSlots] = useState<Slot[]>(defaultSlots);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // If preselected via URL, set them
  useEffect(() => {
    if (preselectedDate) onChange({ date: preselectedDate });
    if (preselectedTime) onChange({ timeSlot: preselectedTime });
  }, [preselectedDate, preselectedTime, onChange]);

  // Mock: disable weekends and past days. Replace unavailableDays with server-provided dates if available.
  const isDateDisabled = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return true;
    // disable Sundays (0) and Saturdays (6) as sample
    const day = d.getDay();
    if (day === 0 || day === 6) return true;
    // optionally disable other dates by custom logic
    return false;
  };

  const onSelectDate = (d: Date | null) => {
    if (!d) {
      onChange({ date: '' });
      return;
    }
    const iso = d.toISOString().slice(0, 10);
    onChange({ date: iso, timeSlot: '' });
    // in real app: fetch available slots for `iso` from server -> setAvailableSlots(...)
    // we simulate slight variation in remaining capacity for fun
    setAvailableSlots((s) => s.map((slot, i) => ({ ...slot, remaining: Math.max(0, (slot.capacity || 1) - (Math.abs(d.getDate() - i) % 3)) })));
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Schedule Appointment</h3>
          <p className="text-sm text-gray-600">Pick a date & time for your session. Price: <strong>KES {price.toFixed(2)}</strong></p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Type: <span className="font-semibold">{productType}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <MultiMonthCalendar
            monthOffset={currentMonthOffset}
            onMonthChange={setCurrentMonthOffset}
            selectedDate={appointment.date}
            onSelectDate={onSelectDate}
            isDateDisabled={isDateDisabled}
          />
        </div>

        <div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Selected</div>
              <div className="text-xs text-gray-400">Local time</div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-600">Date</div>
              <div className="mt-1 font-semibold">{appointment.date || '—'}</div>
              {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-600">Time slot</div>
              <div className="mt-2 space-y-2">
                {appointment.date ? (
                  availableSlots.map((s) => {
                    const remaining = s.remaining ?? 0;
                    return (
                      <label key={s.id} className={`flex items-center justify-between p-2 rounded-lg border ${remaining === 0 ? 'opacity-50 cursor-not-allowed' : appointment.timeSlot === s.label ? 'bg-indigo-50 border-indigo-300' : 'border-gray-100 hover:border-indigo-200'} cursor-pointer`}>
                        <div className="text-sm font-medium">{s.label}</div>
                        <div className="text-xs text-gray-500">{remaining} left</div>
                        <input
                          className="sr-only"
                          type="radio"
                          name="timeSlot"
                          value={s.label}
                          checked={appointment.timeSlot === s.label}
                          onChange={() => { if (remaining > 0) onChange({ timeSlot: s.label }); }}
                          disabled={remaining === 0}
                        />
                      </label>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-400">Pick a date to see available slots.</div>
                )}
                {errors.timeSlot && <p className="text-xs text-red-600">{errors.timeSlot}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Location</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className={`p-2 rounded-xl text-center border ${appointment.locationType === 'online' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                  <input className="sr-only" type="radio" name="locationType" value="online" checked={appointment.locationType === 'online'} onChange={(e) => onChange({ locationType: e.target.value })} />
                  Online
                </label>
                <label className={`p-2 rounded-xl text-center border ${appointment.locationType === 'inperson' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                  <input className="sr-only" type="radio" name="locationType" value="inperson" checked={appointment.locationType === 'inperson'} onChange={(e) => onChange({ locationType: e.target.value })} />
                  In person
                </label>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Note: weekends are unavailable. For other restrictions, the provider will contact you after booking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   MultiMonthCalendar component
   - shows two months side-by-side
   - disables past dates & isDateDisabled
   ------------------------------ */
function MultiMonthCalendar({
  monthOffset,
  onMonthChange,
  selectedDate,
  onSelectDate,
  isDateDisabled,
}: {
  monthOffset: number;
  onMonthChange: (n: number) => void;
  selectedDate?: string;
  onSelectDate: (d: Date | null) => void;
  isDateDisabled?: (d: Date) => boolean;
}) {
  const today = new Date();
  const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  const buildMonth = (offset = 0) => {
    const dt = new Date(today.getFullYear(), today.getMonth() + monthOffset + offset, 1);
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: (Date | null)[] = [];
    // create grid starting from Sunday (0)
    let cells: (Date | null)[] = Array(firstDayIndex).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    // split to weeks
    for (let i = 0; i < cells.length; i += 7) weeks.push(...cells.slice(i, i + 7));
    return { dt, weeks: chunkArray(cells, 7) as (Date | null)[][] };
  };

  const left = buildMonth(0);
  const right = buildMonth(1);

  return (
    <div className="bg-white p-3 rounded-xl border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onMonthChange(monthOffset - 1)} className="px-2 py-1 rounded-lg hover:bg-gray-100">Prev</button>
          <div className="text-sm font-semibold">{formatMonthYear(left.dt)}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{formatMonthYear(right.dt)}</div>
          <button onClick={() => onMonthChange(monthOffset + 1)} className="px-2 py-1 rounded-lg hover:bg-gray-100">Next</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[left, right].map((m, mi) => (
          <div key={mi}>
            <div className="grid grid-cols-7 text-xs text-gray-500 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (<div key={d} className="text-center">{d}</div>))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {m.weeks.flat().map((cell, idx) => {
                if (!cell) return <div key={idx} className="h-10" />;
                const disabled = isDateDisabled ? isDateDisabled(cell) : false;
                const isSelected = !!selected && isSameDay(cell, selected);
                return (
                  <button
                    key={idx}
                    onClick={() => !disabled && onSelectDate(cell)}
                    className={`h-10 rounded-lg flex items-center justify-center text-sm ${disabled ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50'} `}
                    disabled={disabled}
                    aria-pressed={isSelected}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------
   Payment Step
   ------------------------------ */
function PaymentStep({ payment, onChange, errors, onInputChange }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Payment</h3>
      <p className="text-sm text-gray-600">Choose how you'd like to pay for the booking.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { value: 'mpesa', label: 'M-Pesa', Icon: TagIcon },
          { value: 'card', label: 'Card', Icon: CreditCardIcon },
          { value: 'paystack', label: 'Paystack', Icon: BanknotesIcon },
          { value: 'cash', label: 'Cash', Icon: MapPinIcon },
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

      <div className="mt-4">
        {payment.method === 'card' && (
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Card number</label>
                <input name="cardNumber" value={payment.cardNumber} onChange={(e) => onInputChange(e as any)} maxLength={19} className={`w-full p-3 rounded-xl border ${errors.cardNumber ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cardNumber && <p className="text-xs text-red-600">{errors.cardNumber}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
                <input name="cardExpiry" value={payment.cardExpiry} onChange={(e) => onInputChange(e as any)} maxLength={5} className={`w-full p-3 rounded-xl border ${errors.cardExpiry ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cardExpiry && <p className="text-xs text-red-600">{errors.cardExpiry}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">CVC</label>
                <input name="cvv" value={payment.cvv} onChange={(e) => onInputChange(e as any)} maxLength={4} className={`w-full p-3 rounded-xl border ${errors.cvv ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.cvv && <p className="text-xs text-red-600">{errors.cvv}</p>}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Card payments are securely processed by your payment provider.</p>
          </div>
        )}

        {payment.method === 'mpesa' && (
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <label className="text-sm font-medium text-gray-700">M-Pesa Number</label>
            <input name="mpesaPhone" value={payment.mpesaPhone} onChange={(e) => onInputChange(e as any)} placeholder="2547XXXXXXXX" className={`w-full p-3 rounded-xl border ${errors.mpesaPhone ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.mpesaPhone && <p className="text-xs text-red-600">{errors.mpesaPhone}</p>}
            <p className="mt-2 text-xs text-gray-500">You will receive a payment prompt on this number after placing the booking.</p>
          </div>
        )}

        {payment.method === 'paystack' && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="font-medium text-yellow-700">Pay via Paystack</div>
            <p className="text-sm text-gray-600 mt-1">You'll be securely redirected to complete payment (card, bank, USSD).</p>
          </div>
        )}

        {payment.method === 'cash' && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="font-medium text-blue-700">Pay in person</div>
            <p className="text-sm text-gray-600 mt-1">Pay the provider in person for in-person sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------
   Review Step
   ------------------------------ */
function ReviewStep({ billing, appointment, payment, total, subtotal, discountAmount, productName, price }: any) {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <h3 className="text-2xl font-extrabold text-gray-900">Review & Confirm</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h4 className="font-semibold text-indigo-600 flex items-center gap-2"><UserCircleIcon className="w-5 h-5" /> Contact</h4>
          <p className="mt-2 text-gray-700"><strong>Name:</strong> {billing.name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {billing.email}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {billing.phone}</p>
        </div>

        <div>
          <h4 className="font-semibold text-indigo-600 flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Appointment</h4>
          <p className="mt-2 text-gray-700"><strong>Service:</strong> {productName}</p>
          <p className="text-gray-700"><strong>Date:</strong> {appointment.date || '—'}</p>
          <p className="text-gray-700"><strong>Time:</strong> {appointment.timeSlot || '—'}</p>
          <p className="text-gray-700"><strong>Mode:</strong> {appointment.locationType}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <div className="flex justify-between font-extrabold text-2xl"><span>Final Total</span><span>KES {total.toFixed(2)}</span></div>
        <div className="mt-3 text-sm text-indigo-700">By confirming, you agree to our booking terms & provider policies.</div>
      </div>
    </div>
  );
}

/* ------------------------------
   Memoized OrderSummary
   ------------------------------ */
const OrderSummary = ({ productName, price, subtotal, discountAmount, total, appointment }: any) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 sticky top-20">
      <h4 className="text-lg font-extrabold mb-4">Booking Summary</h4>

      <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-50">
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{productName}</div>
          <div className="text-sm text-gray-500 mt-1">KES {price.toFixed(2)}</div>
          {appointment.date && <div className="text-sm text-gray-500 mt-1">On {appointment.date} • {appointment.timeSlot}</div>}
        </div>

        <div className="font-extrabold">KES {total.toFixed(2)}</div>
      </div>

      <div className="mt-4 border-t pt-4 space-y-2 text-gray-600">
        <div className="flex justify-between"><span>Subtotal</span><span>KES {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-green-600 font-semibold"><span>Discount</span><span>- KES {discountAmount.toFixed(2)}</span></div>
        <div className="flex justify-between font-extrabold text-xl mt-3"><span>Total</span><span>KES {total.toFixed(2)}</span></div>
      </div>

      <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-indigo-600" />
        <div className="text-sm">Bring any required materials to your session.</div>
      </div>
    </div>
  );
};

const MemoizedOrderSummary = React.memo(OrderSummary);

/* ------------------------------
   Utilities
   ------------------------------ */

function formatMonthYear(d: Date) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}
function chunkArray<T>(arr: T[], n: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* Small format helpers for card inputs */
function formatCreditCardNumber(val: string) {
  return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}
function formatExpirationDate(val: string) {
  const cleaned = val.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  if (cleaned.length >= 1) return cleaned;
  return '';
}
function formatCVC(val: string) {
  return val.replace(/\D/g, '').slice(0, 4);
}
