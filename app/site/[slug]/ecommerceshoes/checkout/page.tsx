'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStore } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ShippingAddress from '@/components/shippingAddress';
import { formatCreditCardNumber, formatExpirationDate, formatCVC } from '@/data/cardFormatter';

const steps = ['Billing', 'Shipping', 'Payment & Promo', 'Review'];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

export default function CheckoutPage() {
  const store = useStore();
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart } = useStateContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<any>({});

  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    cardNumber: session?.user?.cardNumber || '',
    cardExpiry: session?.user?.cardExpiry || '',
    shippingAddress:{
      display_name: "",
      lat: 0.0,
      lng: 0.0,
    },
    cvv: '',
    promoCode: '',
    paymentMethod: 'card',
    shippingMethod: 'Standard',
  });
  // const [selectedAddress, setSelectedAddress] = useState<any>(session?.user?.address || {});
  const [promoMessage, setPromoMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
    console.log("Selected address:", address, coords);
    // console.log("Selected address:", address, coords);
    // Use address/coords (e.g. update form state or submit)
    setFormData(f => ({ ...f, shippingAddress:{
          display_name: address,
          lat: coords.lat,
          lng: coords.lng,
      }
    }));   
  };

  // Compute totals
  const subtotal = useMemo(() => cart.reduce((sum: number, item: { finalPrice: number; quantity: number; }) => sum + item.finalPrice * item.quantity, 0), [cart]);
  const shippingCost = useMemo(() => formData.shippingMethod === 'Express' ? 15 : 5, [formData.shippingMethod]);
  const total = useMemo(() => (subtotal + shippingCost) * (1 - discount), [subtotal, shippingCost, discount]);

  // Promo code debounce
  useEffect(() => {
    const id = setTimeout(() => {
      if (!formData.promoCode) return setPromoMessage('');
      if (formData.promoCode === 'SAVE10') {
        setDiscount(0.1);
        setPromoMessage('10% discount applied');
      } else {
        setDiscount(0);
        setPromoMessage('Invalid promo code');
      }
    }, 500);
    return () => clearTimeout(id);
  }, [formData.promoCode]);

  // Estimate delivery
  useEffect(() => {
    const days = formData.shippingMethod === 'Express' ? 2 : 5;
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setEstimatedDelivery(date.toDateString());
  }, [formData.shippingMethod]);

  // Confetti size
  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  const validateStep = useCallback(() => {
    const errs: any = {};
    if (currentStep === 0) {
      ['name', 'email', 'phone'].forEach(f => { if (!formData[f as keyof typeof formData]) errs[f] = 'Required'; });
    }
    if (currentStep === 2 && formData.paymentMethod === 'card') {
      ['cardNumber', 'expiry', 'cvv'].forEach(f => { if (!formData[f as keyof typeof formData]) errs[f] = 'Required'; });
    }
    setError(errs);
    return Object.keys(errs).length === 0;
  }, [currentStep, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = formatCreditCardNumber(value);
    if (name === 'expiry') v = formatExpirationDate(value);
    if (name === 'cvv') v = formatCVC(value);
    setFormData(fd => ({ ...fd, [name]: v }));
    setError((err: any) => ({ ...err, [name]: '' }));
  };

  const next = () => {
    if (validateStep()) setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };
  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
  
    setIsSubmitting(true);
    setError({}); // reset errors
  
    try {
      const payload = {
        consumerId: session?.user?.id,
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: session?.user?.phone || '',
        cardNumber: session?.user?.cardNumber || '',
        cardExpiry: session?.user?.cardExpiry || '',
        cvv: '',
        promoCode: '',
        items: cart.map((i: any) => ({
          marketplaceListingId: i.id,
          quantity: i.quantity,
          price: i.finalPrice,
        })),
        shippingAddress: formData.shippingAddress,
        shippingMethod: formData.shippingMethod,
        paymentOption: formData.paymentMethod,
        delivery: false,
        totalPrice: parseFloat(total.toFixed(2)),
      };
  
      const res = await fetch(`${apiBaseUrl}/shop/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY!,
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const errorText = await res.text(); // for logging
        console.error("Server responded with error:", res.status, errorText);
        throw new Error("Order submission failed");
      }
  
      let order;
      try {
        order = await res.json();
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        throw new Error("Invalid server response");
      }
  
      if (!order?.trackingNumber) {
        throw new Error("No tracking number in response");
      }
  
      clearCart();
      setTrackingNumber(order.trackingNumber);
      setIsOrderPlaced(true);
  
    } catch (err: any) {
      console.error("Submit error:", err);
      setError({ submit: err.message || 'Order failed. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (isOrderPlaced) {
    return <OrderStatus success trackingnumber={trackingNumber}/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-12">
      <Section title="Checkout">
        <ProgressIndicator currentStep={currentStep} />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="hidden md:block">
            <OrderSummary cart={cart} estimatedDelivery={estimatedDelivery} total={total} />
          </div>
          <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Billing Info</h2>
                {['name', 'email', 'phone'].map(fld => (
                  <div key={fld}>
                    <input
                      name={fld}
                      value={formData[fld as keyof typeof formData] as string}
                      onChange={handleChange}
                      placeholder={fld.charAt(0).toUpperCase() + fld.slice(1)}
                      className={`w-full p-3 border rounded-lg ${error[fld] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {error[fld] && <p className="text-red-600 text-sm mt-1">{fld} is required</p>}
                  </div>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Shipping Address</h2>
                <ShippingAddress onAddressSelect={handleAddressSelect} />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Payment & Promo</h2>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <input
                      type="radio" name="paymentMethod"
                      value="card" checked={formData.paymentMethod==='card'}
                      onChange={handleChange}
                    />
                    <CreditCardIcon className="w-6 h-6 text-indigo-600"/>
                    Credit/Debit Card
                  </label>
                  <label className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <input
                      type="radio" name="paymentMethod"
                      value="cod" checked={formData.paymentMethod==='cod'}
                      onChange={handleChange}
                    />
                    <TruckIcon className="w-6 h-6 text-indigo-600"/>
                    Cash on Delivery
                  </label>
                  <label htmlFor={`pay-${'pickupatshop'}`} key={'pickupatshop'} className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg cursor-pointer">
                    <input type="radio" id={`pay-${'pickupatshop'}`} name="pickupatshop" 
                    value="pick up at shop" checked={formData.paymentMethod==='pickupatshop'} onChange={handleChange}/>
                    <BuildingLibraryIcon className="w-6 h-6 text-indigo-600"/>
                    <span>{'Pick up at Shop'}</span>
                  </label>                                 
                  
                  <label htmlFor={`pay-${'mpesa'}`} key={'mpesa'} className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg cursor-pointer">
                    <input type="radio" id={`pay-${'mpesa'}`} name="mpesa" value="Mpesa" checked={formData.paymentMethod==='mpesa'} onChange={handleChange}/>
                    <BuildingLibraryIcon className="w-6 h-6 text-indigo-600"/>
                    <span >{'Mpesa'}</span>
                  </label>

                </div>
                {formData.paymentMethod === 'card' && (
                  <>
                    <input
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="Card Number"
                      className="w-full p-3 border rounded-lg"
                    />
                    <div className="flex gap-3">
                      <input
                        name="expiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-1/2 p-3 border rounded-lg"
                      />
                      <input
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="CVV"
                        className="w-1/2 p-3 border rounded-lg"
                      />
                    </div>
                  </>
                )}
                <div>
                  <input
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleChange}
                    placeholder="Promo Code"
                    className="w-full p-2 border rounded-lg"
                  />
                  {promoMessage && <p className="text-sm text-green-600 mt-1">{promoMessage}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Review & Confirm</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Shipping:</strong> {formData?.shippingAddress?.display_name || ""}</p>
                  <p><strong>Payment:</strong> {formData.paymentMethod.toUpperCase()}</p>
                  <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <button type="button" onClick={prev} className="px-6 py-2 bg-gray-200 rounded-lg">Previous</button>
              ) : <div />}
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={next} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Next</button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                  {isSubmitting ? 'Processing…' : 'Place Order'}
                </button>
              )}
            </div>
            {error.submit && <p className="text-red-600 text-center mt-4">{error.submit}</p>}
          </form>
        </div>
      </Section>
      <NewsletterSection />
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex mb-6">
      {steps.map((label, i) => (
        <div key={i} className="flex-1 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${currentStep > i ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 text-gray-500'}`}>
            {i + 1}
          </motion.div>
          <p className="text-xs mt-1">{label}</p>
          {i < steps.length - 1 && (
            <div className={`absolute top-3 right-0 w-full h-0.5 ${currentStep > i ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderSummary({ cart, estimatedDelivery, total }: any) {
  return (
    <motion.div initial={{ opacity:0, x:-50 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }} className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      {cart.map((item: any) => (
        <div key={item.id} className="flex justify-between items-center mb-3">
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
          </div>
          <p className="font-semibold">${(item.finalPrice * item.quantity).toFixed(2)}</p>
        </div>
      ))}
      <div className="border-t pt-3 mt-3">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600"/>
          <span className="text-sm">Est. Delivery: {estimatedDelivery}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function OrderStatus({ success , trackingnumber }: { success: boolean, trackingnumber: String }) {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({ width:0, height:0 });
  useEffect(() => {
    const update = () => setWindowSize({ width:window.innerWidth, height:window.innerHeight });
    window.addEventListener('resize', update); update(); return () => window.removeEventListener('resize', update);
  },[]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      {success && <Confetti width={windowSize.width} height={windowSize.height}/>}      
      <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }} className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        {success ? (
          <> 
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Placed!</h2>
            <p className="mt-2 text-gray-600">Your order is on its way.</p>
          </>
        ) : (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Order Failed</h2>
            <p className="mt-2 text-gray-600">Something went wrong.</p>
          </>
        )}
        <div className="mt-6 space-y-4">
          {success && <button onClick={() => router.push(`/shop/orderTracking?trackingnumber=${trackingnumber}`)} className="w-full bg-indigo-600 text-white py-3 rounded-lg">Track Order</button>}
          <button onClick={() => router.push('/')} className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg flex items-center justify-center gap-2">
            <ArrowLeftIcon className="w-5 h-5"/> Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
}
