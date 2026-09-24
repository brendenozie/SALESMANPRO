'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TagIcon,
  BanknotesIcon,
  GlobeAltIcon,
  WalletIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  UserCircleIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

type Step = 0 | 1 | 2 | 3;
const STEPS = ['Your Details', 'Choose Tickets', 'Payment Method', 'Review & Pay'] as const;

interface Event {
  id: string;
  title: string;
  description?: string;
  startDateTime: string;
  location?: string;
  isPaid: boolean;
}

interface EventTicket {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
}

interface PublicPaymentMethod {
  id: string;
  label: string;
  isEnabled: boolean;
  meta: Record<string, any>;
}

interface EventCheckoutClientProps {
  slug?: string;
  event: Event;
  tickets: EventTicket[];
  paymentMethods: PublicPaymentMethod[];
}

interface Attendee {
  fullName: string;
  email: string;
  phone: string;
}

interface TicketSelection {
  ticketId: string;
  name: string;
  price: number;
  quantity: number;
  attendees: Attendee[];
}

const METHOD_CONFIG: Record<string, { label: string; Icon: any; colorClass: string }> = {
  ghuba: { label: 'Ghuba Pay', Icon: WalletIcon, colorClass: 'text-purple-600 bg-purple-50/50 border-purple-200' },
  stripe: { label: 'Credit Card', Icon: CreditCardIcon, colorClass: 'text-blue-600 bg-blue-50/50 border-blue-200' },
  paypal: { label: 'PayPal', Icon: GlobeAltIcon, colorClass: 'text-indigo-600 bg-indigo-50/50 border-indigo-200' },
  mpesa: { label: 'M-Pesa', Icon: TagIcon, colorClass: 'text-green-600 bg-green-50/50 border-green-200' },
  paystack: { label: 'Paystack', Icon: BanknotesIcon, colorClass: 'text-yellow-600 bg-yellow-50/50 border-yellow-200' },
  cod: { label: 'Cash on Arrival', Icon: TruckIcon, colorClass: 'text-gray-600 bg-gray-50/50 border-gray-200' },
};

export default function EventCheckoutClient({
  slug,
  event,
  tickets: availableTickets,
  paymentMethods,
}: EventCheckoutClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [buyer, setBuyer] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
  });

  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);

  const [payment, setPayment] = useState({
    method: paymentMethods[0]?.id || '',
    mpesaPhone: session?.user?.phone || '',
  });

  // Sync session details when loaded
  useEffect(() => {
    if (session?.user) {
      setBuyer({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
      });
      if (session.user.phone) {
        setPayment((prev) => ({ ...prev, mpesaPhone: session.user?.phone || '' }));
      }
    }
  }, [session]);

  const totalAmount = useMemo(
    () => selectedTickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0),
    [selectedTickets]
  );

  // Updates ticket quantities and initializes or removes attendee fields dynamically
  const handleQuantityChange = (ticket: EventTicket, newQty: number) => {
    if (newQty < 0) return;

    setSelectedTickets((prev) => {
      const existingIndex = prev.findIndex((t) => t.ticketId === ticket.id);

      if (newQty === 0) {
        return prev.filter((t) => t.ticketId !== ticket.id);
      }

      if (existingIndex > -1) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;

          const updatedAttendees = [...item.attendees];
          if (newQty > item.quantity) {
            while (updatedAttendees.length < newQty) {
              updatedAttendees.push({ fullName: '', email: '', phone: '' });
            }
          } else {
            updatedAttendees.splice(newQty);
          }

          return { ...item, quantity: newQty, attendees: updatedAttendees };
        });
      } else {
        return [
          ...prev,
          {
            ticketId: ticket.id,
            name: ticket.name,
            price: ticket.price,
            quantity: newQty,
            attendees: Array.from({ length: newQty }, () => ({ fullName: '', email: '', phone: '' })),
          },
        ];
      }
    });
  };

  // Safe mutations for granular attendee fields inside the ticket rows
  const handleAttendeeChange = (
    ticketId: string,
    index: number,
    field: keyof Attendee,
    value: string
  ) => {
    setSelectedTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;

        const updatedAttendees = ticket.attendees.map((attendee, idx) =>
          idx === index ? { ...attendee, [field]: value } : attendee
        );

        return { ...ticket, attendees: updatedAttendees };
      })
    );
  };

  const validateStep = useCallback((currentStep: Step) => {
    const errs: Record<string, string> = {};
    
    if (currentStep === 0) {
      if (!buyer.name.trim()) errs.name = 'Full name is required';
      if (!buyer.email.trim() || !/^\S+@\S+\.\S+$/.test(buyer.email)) errs.email = 'Valid email is required';
    }
    
    if (currentStep === 1) {
      if (selectedTickets.length === 0) {
        errs.tickets = 'Please select at least one ticket to continue';
      } else {
        // Validate that attendee profiles aren't empty fields
        selectedTickets.forEach((ticket) => {
          ticket.attendees.forEach((att, index) => {
            if (!att.fullName.trim()) {
              errs[`${ticket.ticketId}_${index}_name`] = `Attendee #${index + 1}'s full name is required`;
            }
          });
        });
      }
    }
    
    if (currentStep === 2 && event.isPaid) {
      if (!payment.method) errs.paymentMethod = 'Please choose a payment option';
      if (payment.method === 'mpesa') {
        const phoneClean = payment.mpesaPhone.replace(/\D/g, '');
        if (!phoneClean || phoneClean.length < 9) errs.mpesaPhone = 'Provide a valid dynamic M-Pesa phone number';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [buyer, selectedTickets, payment, event.isPaid]);

  const next = () => {
    if (!validateStep(step)) return;
    setError(null);
    setStep((s) => Math.min(s + 1, 3) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setError(null);
    setErrors({});
    setStep((s) => Math.max(s - 1, 0) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitCheckout = async () => {
    if (!validateStep(3)) return;
    try {
      setLoading(true);
      setError(null);

      const payload = {
        eventId: event.id,
        buyer: {
          id: session?.user?.id,
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
        },
        tickets: selectedTickets.map((t) => ({
          ticketId: t.ticketId,
          quantity: t.quantity,
          attendees: t.attendees,
        })),
        totalAmount,
        paymentMethod: payment.method,
        paymentData: {
          mpesaPhone: payment.mpesaPhone,
        },
      };

      const res = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout process failed');

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      const purchaseId = data.purchases?.[0]?.id || data.data?.purchases?.[0]?.id || '';
      const targetSlug = slug || 'event-ticketing';
      router.push(`/site/${targetSlug}/events/profile?success=1${purchaseId ? `&orderId=${purchaseId}` : ''}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Event Billboard Header */}
        <header className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              Event Registration
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">{event.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                {new Date(event.startDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 w-full md:w-auto text-left md:text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Balance</p>
            <p className="text-2xl font-black text-indigo-600">KES {totalAmount.toLocaleString()}</p>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-rose-500" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Main Grid Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Action Panel */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-100/80 space-y-8">
            <ProgressHeader currentStep={step} />

            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <StepWrapper key="details">
                    <BuyerDetailsStep buyer={buyer} onChange={setBuyer} errors={errors} />
                  </StepWrapper>
                )}

                {step === 1 && (
                  <StepWrapper key="tickets">
                    <TicketSelectionStep
                      tickets={availableTickets}
                      selected={selectedTickets}
                      onQuantityChange={handleQuantityChange}
                      onAttendeeChange={handleAttendeeChange}
                      errors={errors}
                    />
                  </StepWrapper>
                )}

                {step === 2 && (
                  <StepWrapper key="payment">
                    <PaymentStep
                      payment={payment}
                      onChange={setPayment}
                      paymentMethods={paymentMethods}
                      isPaid={event.isPaid}
                      errors={errors}
                    />
                  </StepWrapper>
                )}

                {step === 3 && (
                  <StepWrapper key="review">
                    <ReviewStep buyer={buyer} tickets={selectedTickets} />
                  </StepWrapper>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Control Actions */}
            <footer className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={prev}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition text-sm ${
                  step > 0 
                    ? 'text-slate-600 hover:bg-slate-50 bg-white border border-slate-200' 
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm hover:bg-indigo-700 transition"
                >
                  Continue <ChevronRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitCheckout}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-sm hover:bg-emerald-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing Transaction...' : 'Confirm Registration & Pay'}
                </button>
              )}
            </footer>
          </div>

          {/* Dynamic Floating Sidebar Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Order Summary
              </h3>
              
              {selectedTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <TagIcon className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-sm">No tickets added to reservation yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-1">
                  {selectedTickets.map((t) => (
                    <div key={t.ticketId} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-slate-200">{t.name}</p>
                        <p className="text-xs text-slate-400">Qty: {t.quantity} × KES {t.price.toLocaleString()}</p>
                      </div>
                      <span className="font-semibold text-slate-100">KES {(t.price * t.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>KES {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Fees / VAT</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 text-white">
                  <span className="font-bold text-base">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-400">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Subcomponents                               */
/* -------------------------------------------------------------------------- */

function ProgressHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex justify-between items-center w-full">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
      <div 
        className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500 -z-10" 
        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((label, i) => {
        const isActive = currentStep === i;
        const isDone = currentStep > i;
        return (
          <div key={label} className="flex flex-col items-center group">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition shadow-sm ${
                isDone
                  ? 'bg-emerald-600 text-white'
                  : isActive
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                  : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}
            >
              {isDone ? <CheckCircleIcon className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`mt-2 text-xs font-semibold hidden sm:block ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.24, ease: 'easeInOut' }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

function BuyerDetailsStep({ buyer, onChange, errors }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
        <p className="text-sm text-slate-500">Provide accurate contact information for order confirmation logs.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <UserCircleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white transition focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                errors.name ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-indigo-500'
              }`}
              placeholder="e.g. Jane Doe"
              value={buyer.name}
              onChange={(e) => onChange({ ...buyer, name: e.target.value })}
            />
          </div>
          {errors.name && <p className="text-xs font-medium text-rose-600">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white transition focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
              errors.email ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-indigo-500'
            }`}
            placeholder="you@domain.com"
            value={buyer.email}
            onChange={(e) => onChange({ ...buyer, email: e.target.value })}
          />
          {errors.email && <p className="text-xs font-medium text-rose-600">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
          <input
            type="tel"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white transition focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            placeholder="e.g. +254 700 000000"
            value={buyer.phone}
            onChange={(e) => onChange({ ...buyer, phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

interface TicketSelectionStepProps {
  tickets: EventTicket[];
  selected: TicketSelection[];
  onQuantityChange: (ticket: EventTicket, qty: number) => void;
  onAttendeeChange: (ticketId: string, index: number, field: keyof Attendee, value: string) => void;
  errors: Record<string, string>;
}

function TicketSelectionStep({ tickets, selected, onQuantityChange, onAttendeeChange, errors }: TicketSelectionStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Select Admission Tickets</h3>
        <p className="text-sm text-slate-500">Pick passing passes suitable for your attendance requirements.</p>
      </div>

      {errors.tickets && (
        <p className="text-sm font-semibold text-rose-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
          {errors.tickets}
        </p>
      )}

      <div className="space-y-6">
        {tickets.map((ticket) => {
          const selectedItem = selected.find((t) => t.ticketId === ticket.id);
          const currentQty = selectedItem?.quantity || 0;
          const available = ticket.quantityTotal - ticket.quantitySold;

          return (
            <div
              key={ticket.id}
              className={`border rounded-2xl p-5 transition space-y-4 ${
                currentQty > 0 ? 'border-indigo-500 bg-indigo-50/5' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900">{ticket.name}</h4>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                      {available} left
                    </span>
                  </div>
                  {ticket.description && <p className="text-xs text-slate-500 leading-relaxed max-w-md">{ticket.description}</p>}
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                  <span className="font-extrabold text-lg text-slate-900 shrink-0">
                    KES {ticket.price.toLocaleString()}
                  </span>
                  
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(ticket, currentQty - 1)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition shadow-none hover:shadow-sm"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-800">{currentQty}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(ticket, currentQty + 1)}
                      disabled={currentQty >= available}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition shadow-none hover:shadow-sm disabled:opacity-40"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Attendee Input Lists per Quantified Seat Option */}
              {currentQty > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-slate-100 space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendee Profile Information</p>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedItem?.attendees.map((attendee, index) => (
                      <div key={index} className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                        <label className="text-xs font-semibold text-slate-600">Attendee #{index + 1} Name</label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                            errors[`${ticket.id}_${index}_name`] ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-indigo-500 bg-white'
                          }`}
                          placeholder="Full Name"
                          value={attendee.fullName}
                          onChange={(e) => onAttendeeChange(ticket.id, index, 'fullName', e.target.value)}
                        />
                        {errors[`${ticket.id}_${index}_name`] && (
                          <p className="text-xs text-rose-600 font-medium">{errors[`${ticket.id}_${index}_name`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentStep({ payment, onChange, paymentMethods, isPaid, errors }: any) {
  if (!isPaid) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center space-y-2">
        <CheckCircleIcon className="w-10 h-10 text-emerald-600 mx-auto" />
        <h4 className="font-bold text-emerald-900">Complimentary Free Event Ticket</h4>
        <p className="text-sm text-emerald-700 max-w-sm mx-auto">This community gathering requires no payment transactions. Proceed safely to review step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Payment Authorization</h3>
        <p className="text-sm text-slate-500">Select a preferred routing system gateway to make secure deposits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((method: any) => {
          const cfg = METHOD_CONFIG[method.id] || { label: method.label, Icon: CreditCardIcon, colorClass: 'text-slate-600' };
          const Icon = cfg.Icon;
          const isSelected = payment.method === method.id;

          return (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition select-none ${
                isSelected 
                  ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-100' 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => onChange({ ...payment, method: method.id })}
                className="sr-only"
              />
              <div className={`p-2.5 rounded-xl border shrink-0 ${isSelected ? 'bg-white border-indigo-200' : 'bg-slate-50'}`}>
                <Icon className={`w-5 h-5 ${cfg.colorClass}`} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-slate-900">{cfg.label}</p>
                <p className="text-xs text-slate-400 font-medium">Secure Payment</p>
              </div>
            </label>
          );
        })}
      </div>

      {payment.method === 'mpesa' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">M-Pesa Express Phone Number</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">254</span>
            <input
              type="tel"
              className={`w-full pl-14 pr-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white transition focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                errors.mpesaPhone ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-indigo-500'
              }`}
              placeholder="7XXXXXXXX"
              value={payment.mpesaPhone.startsWith('254') ? payment.mpesaPhone.slice(3) : payment.mpesaPhone}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                onChange({ ...payment, mpesaPhone: clean ? '254' + clean : '' });
              }}
            />
          </div>
          {errors.mpesaPhone ? (
            <p className="text-xs font-medium text-rose-600">{errors.mpesaPhone}</p>
          ) : (
            <p className="text-xs text-slate-400 font-medium">An STK push PIN prompt will instantly pop up on your smartphone layout screen.</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

function ReviewStep({ buyer, tickets }: { buyer: any; tickets: TicketSelection[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Verify Final Statements</h3>
        <p className="text-sm text-slate-500">Confirm details before authenticating seat reservations.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Ticket Owner</h4>
          <p className="font-bold text-slate-800 text-base">{buyer.name}</p>
          <p className="text-sm text-slate-600 font-medium">{buyer.email}</p>
          {buyer.phone && <p className="text-sm text-slate-500">{buyer.phone}</p>}
        </div>

        <div className="pt-4 border-t border-slate-200/60">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Booked Slots</h4>
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.ticketId} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-800 font-bold">
                    {t.name} <span className="text-xs text-slate-400 font-bold ml-1">×{t.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900">KES {(t.price * t.quantity).toLocaleString()}</span>
                </div>
                {/* Embedded Attendee Names Verification Preview */}
                <div className="pl-3 border-l-2 border-slate-200 text-xs text-slate-500 space-y-0.5">
                  {t.attendees.map((att, index) => (
                    <p key={index}>Attendee {index + 1}: {att.fullName || 'Not Specfied'}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}