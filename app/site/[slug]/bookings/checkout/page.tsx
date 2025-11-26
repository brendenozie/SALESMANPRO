'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/site/Section/Section';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import Confetti from 'react-confetti';
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  CreditCardIcon,
  TruckIcon,
  BanknotesIcon,
  UserCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from '@/data/cardFormatter';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
const STEPS = ['Billing', 'Appointment', 'Payment', 'Review'] as const;
type StepIndex = 0 | 1 | 2 | 3;

export default function ServiceCheckout(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract params (same semantics as your previous implementation)
  const listingId = searchParams.get('listingId') || '';
  const name = searchParams.get('name') || '';
  const price = searchParams.get('price') || '';
  const productType = searchParams.get('productType') || '';
  const enrollmentDateParam = searchParams.get('enrollmentDate') || ''; // optional preselected
  const timeSlotParam = searchParams.get('timeSlot') || '';

  if (!listingId || !name || !price) {
    return <p className="p-6 text-red-600">Missing booking details.</p>;
  }

  // Service-specific constraints (ebooks may not need date/time)
  if (productType !== 'ebook' && (!enrollmentDateParam && !timeSlotParam)) {
    // We'll allow the user to pick date/time in the UI, so don't hard block here.
  }

  // Window sizing for confetti
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

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
    date: enrollmentDateParam || '', // ISO date string
    timeSlot: timeSlotParam || '', // e.g., "10:00 - 11:00"
    provider: '', // optional provider name/ID if available
    locationType: 'online', // 'online' | 'inperson'
  });

  // Payment
  const [payment, setPayment] = useState({
    method: 'paystack', // 'paystack' | 'mpesa' | 'card'
    cardNumber: '',
    cardExpiry: '',
    cvv: '',
    mpesaPhone: session?.user?.phone || '',
  });

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [discountRate, setDiscountRate] = useState(0);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived totals
  const amount = Number(price || 0);
  const discountAmount = useMemo(() => amount * discountRate, [amount, discountRate]);
  const total = useMemo(() => Math.max(0, amount - discountAmount), [amount, discountAmount]);

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
    }, 300);
    return () => clearTimeout(t);
  }, [promoCode]);

  // Helpers to update slices
  const updateBilling = useCallback((patch: Partial<typeof billing>) => setBilling((s) => ({ ...s, ...patch })), []);
  const updateAppointment = useCallback((patch: Partial<typeof appointment>) => setAppointment((s) => ({ ...s, ...patch })), []);
  const updatePayment = useCallback((patch: Partial<typeof payment>) => setPayment((s) => ({ ...s, ...patch })), []);

  // Validation per-step
  const validateStep = useCallback(
    (step = currentStep) => {
      const errs: Record<string, string> = {};
      if (step === 0) {
        if (!billing.name?.trim()) errs.name = 'Full name is required';
        if (!billing.email?.trim() || !/^\S+@\S+\.\S+$/.test(billing.email)) errs.email = 'Valid email required';
        if (!billing.phone?.trim() || billing.phone.replace(/\D/g, '').length < 9) errs.phone = 'Valid phone required';
      }
      if (step === 1) {
        if (productType !== 'ebook') {
          if (!appointment.date) errs.date = 'Select an appointment date';
          if (!appointment.timeSlot) errs.timeSlot = 'Choose a time slot';
        }
      }
      if (step === 2) {
        if (payment.method === 'card') {
          const num = (payment.cardNumber || '').replace(/\s/g, '');
          if (!num || num.length < 13) errs.cardNumber = 'Invalid card number';
          if (!payment.cardExpiry || payment.cardExpiry.length !== 5) errs.cardExpiry = 'MM/YY';
          if (!payment.cvv || payment.cvv.length < 3) errs.cvv = 'Invalid CVC';
        }
        if (payment.method === 'mpesa') {
          const p = payment.mpesaPhone?.replace(/\D/g, '');
          if (!p || p.length < 12) errs.mpesaPhone = 'Use format 2547XXXXXXXX';
        }
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [billing, appointment, payment, productType, currentStep]
  );

  // Navigation
  const next = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1) as StepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, validateStep]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0) as StepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Input handler (with formatters)
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') return updatePayment({ cardNumber: formatCreditCardNumber(value) });
    if (name === 'cardExpiry') return updatePayment({ cardExpiry: formatExpirationDate(value) });
    if (name === 'cvv') return updatePayment({ cvv: formatCVC(value) });
    if (name === 'mpesaPhone') return updatePayment({ mpesaPhone: value.replace(/\D/g, '') });
    if (name === 'name' || name === 'email' || name === 'phone') return updateBilling({ [name]: value } as any);
    if (name === 'promoCode') return setPromoCode(value);
    if (name === 'date' || name === 'timeSlot' || name === 'provider' || name === 'locationType') {
      return updateAppointment({ [name]: value } as any);
    }
    if (name === 'paymentMethod') return updatePayment({ method: value });
  };

  // Submit (create order + initiate payment flows)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all steps
    for (let s = 0; s < STEPS.length; s++) {
      if (!validateStep(s as StepIndex)) {
        setCurrentStep(s as StepIndex);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload: any = {
        consumerId: session?.user?.id,
        name: billing.name,
        email: billing.email,
        phone: billing.phone,
        promoCode,
        paymentOption: payment.method,
        delivery: false,
        totalPrice: parseFloat(total.toFixed(2)),
        paymentData: {
          cardNumber: (payment.cardNumber || '').replace(/\s/g, ''),
          cardExpiry: payment.cardExpiry,
          cvv: payment.cvv,
          mpesaPhone: payment.mpesaPhone,
        },
        items: [
          {
            marketplaceListingId: listingId,
            date: appointment.date || new Date().toISOString(),
            timeSlot: appointment.timeSlot || '',
            quantity: 1,
            price: amount,
            meta: {
              productType,
              provider: appointment.provider,
              locationType: appointment.locationType,
            },
          },
        ],
        shippingAddress: undefined,
        shippingMethod: 'AT SHOP',
      };

      const res = await fetch(`${API_BASE}/shop/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.message || body?.data || (await res.text()) || res.statusText;
        throw new Error(message || 'Order submission failed');
      }

      const body = await res.json();

      // Expecting similar shape to ecommerce endpoint
      const orderResponse = body.data || body.order || body;
      const authorizationUrl = orderResponse?.authorizationUrl || orderResponse?.paymentResponse?.authorizationUrl;

      // Handle Paystack redirect
      if (payment.method === 'paystack') {
        if (authorizationUrl) {
          router.push(authorizationUrl);
          return;
        }
        // else continue (maybe backend charged)
      }

      // For mpesa/card the backend may have returned a tracking number or pending state
      const tracking = orderResponse?.trackingNumber || orderResponse?.order?.trackingNumber || orderResponse?.id;
      if (!tracking) {
        // Not fatal — still show success but indicate pending
        setTrackingNumber('');
        setIsOrderPlaced(true);
      } else {
        setTrackingNumber(tracking);
        setIsOrderPlaced(true);
      }
    } catch (err: any) {
      console.error('Submit error', err);
      setSubmitError(err.message || 'Order failed. Please try again.');
      setErrors((e) => ({ ...e, submit: err.message || 'Order failed' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-10 shadow-2xl max-w-lg w-full border border-gray-100 text-center">
          <div className="mx-auto bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Booking Confirmed!</h2>
          <p className="mt-2 text-gray-600">We’ve booked your appointment.</p>
          {trackingNumber ? (
            <p className="mt-2 text-indigo-600 font-medium">Reference: <span className="font-semibold">{trackingNumber}</span></p>
          ) : (
            <p className="mt-2 text-gray-600">You will receive confirmation via email / SMS shortly.</p>
          )}
          <div className="mt-6 grid gap-3">
            <button onClick={() => router.push(`/shop/orderTracking?trackingnumber=${trackingNumber}`)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
              Track Booking
            </button>
            <button onClick={() => router.push('/')} className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
              Continue Browsing
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Small presentational components in-file (keeps single-file)
  function StepHeader({ current }: { current: number }) {
    return (
      <div className="flex items-center gap-6">
        {STEPS.map((label, i) => {
          const isActive = current === i;
          const isDone = current > i;
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

  // Modern calendar card UI for appointment selection
  function AppointmentCard() {
    // Example time slots — in a real app you might fetch these from the listing API
    const sampleSlots = [
      '09:00 - 09:30',
      '10:00 - 10:30',
      '11:00 - 11:30',
      '14:00 - 14:30',
      '15:00 - 15:30',
    ];

    return (
      <div className="space-y-4 p-4 md:p-6">
        <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3"><CalendarIcon className="w-6 h-6 text-indigo-600" /> Appointment Details</h3>
        <p className="text-sm text-gray-600">Choose a date and an available time slot for your booking.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <div className="mt-2">
              <input name="date" type="date" value={appointment.date} onChange={onInputChange} className={`w-full p-3 rounded-xl border ${errors.date ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.date && <p className="text-xs text-red-600 mt-2">{errors.date}</p>}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <label className="text-sm font-medium text-gray-700">Time slot</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {sampleSlots.map((s) => (
                <button type="button" key={s} onClick={() => updateAppointment({ timeSlot: s })} className={`text-left p-2 rounded-lg border ${appointment.timeSlot === s ? 'bg-indigo-50 border-indigo-400' : 'bg-white border-gray-200 hover:border-indigo-200'}`}>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-indigo-600" />
                    <div className="text-sm font-medium">{s}</div>
                  </div>
                </button>
              ))}
            </div>
            {errors.timeSlot && <p className="text-xs text-red-600 mt-2">{errors.timeSlot}</p>}
          </div>
        </div>

        <div className="mt-2 p-4 rounded-xl border border-gray-100 bg-white">
          <label className="text-sm font-medium text-gray-700">Location</label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`p-3 rounded-xl border ${appointment.locationType === 'online' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'} cursor-pointer`}>
              <input className="sr-only" type="radio" name="locationType" value="online" checked={appointment.locationType === 'online'} onChange={(e) => onInputChange({ ...({} as any), target: { name: 'locationType', value: e.target.value } } as any)} />
              <div className="font-semibold">Online</div>
              <div className="text-sm text-gray-500">Remote session (link will be sent)</div>
            </label>

            <label className={`p-3 rounded-xl border ${appointment.locationType === 'inperson' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'} cursor-pointer`}>
              <input className="sr-only" type="radio" name="locationType" value="inperson" checked={appointment.locationType === 'inperson'} onChange={(e) => onInputChange({ ...({} as any), target: { name: 'locationType', value: e.target.value } } as any)} />
              <div className="font-semibold">In-person</div>
              <div className="text-sm text-gray-500">Visit the provider's location</div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Payment step component
  function PaymentStepUI() {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <h3 className="text-2xl font-extrabold text-gray-900">Payment</h3>
        <p className="text-sm text-gray-600">Choose how you want to pay for this booking.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { value: 'paystack', label: 'Paystack', Icon: BanknotesIcon },
            { value: 'mpesa', label: 'M-Pesa', Icon: BanknotesIcon },
            { value: 'card', label: 'Card', Icon: CreditCardIcon },
          ].map(({ value, label, Icon }) => (
            <label key={value} className={`p-3 rounded-xl border cursor-pointer text-center ${payment.method === value ? 'border-indigo-600 bg-indigo-50 shadow' : 'border-gray-200 hover:border-indigo-300'}`}>
              <input className="sr-only" type="radio" name="paymentMethod" value={value} checked={payment.method === value} onChange={(e) => onInputChange({ ...({} as any), target: { name: 'paymentMethod', value: e.target.value } } as any)} />
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
                  <input name="cardNumber" value={payment.cardNumber} onChange={(e) => onInputChange(e)} maxLength={19} className={`w-full p-3 rounded-xl border ${errors.cardNumber ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.cardNumber && <p className="text-xs text-red-600">{errors.cardNumber}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
                  <input name="cardExpiry" value={payment.cardExpiry} onChange={(e) => onInputChange(e)} maxLength={5} className={`w-full p-3 rounded-xl border ${errors.cardExpiry ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.cardExpiry && <p className="text-xs text-red-600">{errors.cardExpiry}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">CVC</label>
                  <input name="cvv" value={payment.cvv} onChange={(e) => onInputChange(e)} maxLength={4} className={`w-full p-3 rounded-xl border ${errors.cvv ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.cvv && <p className="text-xs text-red-600">{errors.cvv}</p>}
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">Card payments are securely processed by your payment provider.</p>
            </div>
          )}

          {payment.method === 'mpesa' && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <label className="text-sm font-medium text-gray-700">M-Pesa Number</label>
              <input name="mpesaPhone" value={payment.mpesaPhone} onChange={(e) => onInputChange(e)} placeholder="2547XXXXXXXX" className={`w-full p-3 rounded-xl border ${errors.mpesaPhone ? 'border-red-400' : 'border-gray-200'}`} />
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
        </div>

        {/* Promo */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <TagIcon className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <label htmlFor="promoCode" className="sr-only">Promo code</label>
              <div className="flex gap-3">
                <input id="promoCode" name="promoCode" value={promoCode} onChange={(e) => onInputChange(e)} placeholder="Enter promo (eg. SAVE10)" className="w-full p-3 rounded-xl border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200" />
                <button type="button" onClick={() => {}} className="px-4 py-2 rounded-xl bg-yellow-600 text-white font-semibold">Apply</button>
              </div>
              {promoMessage && <p className={`mt-2 text-sm ${promoMessage.startsWith('❌') ? 'text-red-600' : 'text-green-700'}`}>{promoMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review step UI
  function ReviewStepUI() {
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
            <h4 className="font-semibold text-indigo-600 flex items-center gap-2"><CalendarIcon className="w-5 h-5" /> Appointment</h4>
            <p className="mt-2 text-gray-700"><strong>Service:</strong> {name}</p>
            <p className="text-gray-700"><strong>Date:</strong> {appointment.date ? new Date(appointment.date).toDateString() : 'TBD'}</p>
            <p className="text-gray-700"><strong>Time:</strong> {appointment.timeSlot || 'TBD'}</p>
            <p className="text-gray-700"><strong>Location:</strong> {appointment.locationType === 'online' ? 'Online' : 'In-person'}</p>
            <p className="text-gray-700"><strong>Payment:</strong> {payment.method.toUpperCase()}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <div className="flex justify-between font-extrabold text-2xl"><span>Final Total</span><span>KES {total.toFixed(2)}</span></div>
          {discountAmount > 0 && <div className="text-sm text-green-700 mt-1">You saved KES {discountAmount.toFixed(2)}</div>}
          <p className="text-sm text-indigo-700 mt-2">By placing the booking you agree to our terms & conditions.</p>
        </div>
      </div>
    );
  }

  // Booking Summary (sticky)
  function BookingSummary() {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100 sticky top-20">
        <h4 className="text-lg font-extrabold mb-4">Booking Summary</h4>
        <div className="space-y-3">
          <div>
            <div className="font-semibold text-gray-800">{name}</div>
            <div className="text-sm text-gray-500">Service fee • KES {amount.toFixed(2)}</div>
          </div>

          <div className="mt-2 border-t pt-3 space-y-1 text-gray-600">
            <div className="flex justify-between"><span>Date</span><span>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'TBD'}</span></div>
            <div className="flex justify-between"><span>Time</span><span>{appointment.timeSlot || 'TBD'}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- KES {discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-extrabold text-xl mt-3"><span>Total</span><span>KES {total.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-indigo-600" />
            <div className="text-sm">Estimated: <span className="font-semibold">Appointment slot reserved</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-6 md:p-12">
      <Section title="🗓️ Booking Checkout">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <StepHeader current={currentStep} />
            <div className="text-sm text-gray-500">Step {currentStep + 1} of {STEPS.length}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <motion.form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-6" onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => { if (e.key === 'Enter') e.stopPropagation(); }}>
                {/* Step content */}
                <div className="relative min-h-[360px]">
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                        <div className="space-y-4 p-4 md:p-6">
                          <h3 className="text-2xl font-extrabold text-gray-900">Billing Information</h3>
                          <p className="text-sm text-gray-600">Enter your contact details for booking confirmation.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">Full name</label>
                              <input name="name" value={billing.name} onChange={onInputChange} className={`w-full p-3 rounded-xl border ${errors.name ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
                              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">Email</label>
                              <input name="email" value={billing.email} onChange={onInputChange} className={`w-full p-3 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
                              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-1">
                              <label className="text-sm font-medium text-gray-700">Phone</label>
                              <input name="phone" value={billing.phone} onChange={onInputChange} className={`w-full p-3 rounded-xl border ${errors.phone ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-100`} />
                              {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 1 && (
                      <motion.div key="appointment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                        <AppointmentCard />
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div key="payment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                        <PaymentStepUI />
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                        <ReviewStepUI />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                      <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting} className={`px-6 py-3 rounded-full font-bold shadow ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {isSubmitting ? 'Processing…' : 'Place Booking'}
                      </button>
                    )}
                  </div>
                </div>

                {submitError && <div className="text-red-600 rounded-md bg-red-50 p-3 text-center">{submitError}</div>}
              </motion.form>

              <NewsletterSection />
            </div>

            <div className="lg:col-span-4">
              <BookingSummary />
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
}
