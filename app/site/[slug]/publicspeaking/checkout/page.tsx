'use client';

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Section from "@/components/site/Section/Section";
import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";
import Confetti from "react-confetti";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStoreContext } from '@/contexts/StoreContext';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const steps = ["Billing", "Payment", "Review"];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storeFormData } = useStoreContext();

  // ✅ Extract parameters
  const listingId = searchParams.get("listingId") || "";
  const name = searchParams.get("name") || "";
  const price = searchParams.get("price") || "";
  const productType = searchParams.get("productType") || "";
  const enrollmentDate = searchParams.get("enrollmentDate") || "";
  const timeSlot = searchParams.get("timeSlot") || "";

  if (!listingId || !name || !price) {
    return <p className="p-6 text-red-600">Missing booking details.</p>;
  }

  if (productType !== "ebook" && (!enrollmentDate || !timeSlot)) {
    return (
      <p className="p-6 text-red-600">
        Missing enrollment date or time slot for the selected service.
      </p>
    );
  }

  const amount = Number(price);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  // Billing Info
  const [billing, setBilling] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });

  // Payment Info
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paystack" | "mpesa">("card");
  const [card, setCard] = useState({
    cardNumber: "",
    cardExpiry: "",
    cvv: "",
  });

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((b) => ({ ...b, [e.target.name]: e.target.value }));
    setError((err) => ({ ...err, [e.target.name]: "" }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard((c) => ({ ...c, [e.target.name]: e.target.value }));
    setError((err) => ({ ...err, [e.target.name]: "" }));
  };

  // ✅ Step validation
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      ["name", "email", "phone"].forEach((f) => {
        if (!billing[f as keyof typeof billing]) errs[f] = "Required";
      });
    }
    if (step === 1 && paymentMethod === "card") {
      ["cardNumber", "cardExpiry", "cvv"].forEach((f) => {
        if (!card[f as keyof typeof card]) errs[f] = "Required";
      });
    }
    setError(errs);
    return Object.keys(errs).length === 0;
  }, [step, billing, card, paymentMethod]);

  const total = useMemo(() => amount, [amount]);

  const next = () => {
    if (validate()) setStep((s) => s + 1);
  };
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);
  setError({});

  try {
    const paymentOption = paymentMethod; // rename for API compatibility

    const payload = {
      
        consumerId: session?.user?.id,
        companyId: storeFormData?.id,
      name: billing.name,
      email: billing.email,
      phone: billing.phone,
      promoCode: "", // optional
      paymentOption,
      delivery: false, // no delivery for bookings
      totalPrice: total,
      cardNumber: paymentOption === "card" ? card.cardNumber : undefined,
      cardExpiry: paymentOption === "card" ? card.cardExpiry : undefined,
      cvv: paymentOption === "card" ? card.cvv : undefined,
      mpesaPhone: paymentOption === "mpesa" ? billing.phone : undefined, // reuse billing phone for M-Pesa
      items: [
        {
          marketplaceListingId: listingId,
          date: enrollmentDate || new Date().toISOString(),
          timeSlot,
          quantity: 1,
          price: total,
        },
      ],
      shippingAddress: undefined,
      shippingMethod: "AT SHOP",
    };


    const res = await fetch(`/api/shop/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to create order");
    }

    const { order, paymentResponse } = await res.json();


    setTracking(order.trackingNumber);
    setOrderPlaced(true);
  } catch (err: any) {
    console.error("❌ Checkout error:", err);
    setError({ submit: err.message || "Submission failed." });
  } finally {
    setLoading(false);
  }
};


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validate()) return;
  //   setLoading(true);
  //   try {
  //     // mock payment handler
  //     if (paymentMethod === "paystack") {
  //       console.log("Redirecting to Paystack...");
  //       // TODO: integrate Paystack inline popup or API initialization
  //     } else if (paymentMethod === "mpesa") {
  //       console.log("Triggering M-Pesa STK Push...");
  //       // TODO: trigger M-Pesa API or SDK
  //     }

  //     const res = await fetch(`/shop/orders", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
  //       },
  //       body: JSON.stringify({
  //         date: enrollmentDate || new Date().toISOString(),
  //         timeSlot,
  //         quantity: 1,
  //         
        // consumerId: session?.user?.id,
        // companyId: storeFormData?.id,
  //         name: billing.name,
  //         email: billing.email,
  //         phone: billing.phone,
  //         paymentMethod,
  //         totalPrice: total,
  //         items: [
  //           {
  //             marketplaceListingId: listingId,
  //             quantity: 1,
  //             date: enrollmentDate || new Date().toISOString(),
  //             timeSlot,
  //             price: total,
  //           },
  //         ],
  //       }),
  //     });
  //     if (!res.ok) throw new Error(await res.text());
  //     const { order } = await res.json();
  //     setTracking(order.trackingNumber);
  //     setOrderPlaced(true);
  //   } catch (err: any) {
  //     setError({ submit: err.message || "Submission failed." });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <Confetti />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
        >
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">Booking Confirmed!</h2>
          <p className="mt-2">Your tracking number is:</p>
          <p className="font-mono text-lg mt-1">{tracking}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Continue Browsing
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-12">
      <Section title="Booking Checkout">
        {/* Progress */}
        <div className="flex mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center relative">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                  step > i
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {i + 1}
              </motion.div>
              <p className="text-xs mt-1">{label}</p>
              {i < steps.length - 1 && (
                <div
                  className={`absolute top-3 right-0 w-full h-0.5 ${
                    step > i ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              <p><strong>Service:</strong> {name}</p>
              {enrollmentDate && (
                <p><strong>Date:</strong> {new Date(enrollmentDate).toLocaleDateString()}</p>
              )}
              {timeSlot && <p><strong>Time:</strong> {timeSlot}</p>}
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={step === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()}
            className="md:col-span-2 bg-white rounded-3xl p-8 shadow-2xl space-y-6"
          >
            {/* Billing Step */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Billing Info</h2>
                {(["name", "email", "phone"] as const).map((fld) => (
                  <div key={fld}>
                    <input
                      name={fld}
                      value={billing[fld]}
                      onChange={handleBillingChange}
                      placeholder={fld.charAt(0).toUpperCase() + fld.slice(1)}
                      className={`w-full p-3 border rounded-lg ${
                        error[fld] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error[fld] && <p className="text-red-600 text-sm mt-1">{fld} is required</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Payment Step */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Payment Method</h2>

                <div className="flex gap-4">
                  {["card", "paystack", "mpesa"].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`flex-1 p-3 border rounded-lg font-medium ${
                        paymentMethod === method
                          ? "border-indigo-600 bg-indigo-100"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {method === "card" && "Card"}
                      {method === "paystack" && "Paystack"}
                      {method === "mpesa" && "M-Pesa"}
                    </button>
                  ))}
                </div>

                {/* Conditional Inputs */}
                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    {(["cardNumber", "cardExpiry", "cvv"] as const).map((fld) => (
                      <div key={fld}>
                        <input
                          name={fld}
                          value={card[fld]}
                          onChange={handleCardChange}
                          placeholder={
                            fld === "cardNumber"
                              ? "Card Number"
                              : fld === "cardExpiry"
                              ? "MM/YY"
                              : "CVV"
                          }
                          className={`w-full p-3 border rounded-lg ${
                            error[fld] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {error[fld] && (
                          <p className="text-red-600 text-sm mt-1">{fld} is required</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {paymentMethod === "paystack" && (
                  <p className="text-sm text-gray-600">
                    You’ll be redirected to Paystack to complete your payment securely.
                  </p>
                )}

                {paymentMethod === "mpesa" && (
                  <p className="text-sm text-gray-600">
                    You’ll receive an M-Pesa STK push on your phone after confirming checkout.
                  </p>
                )}
              </div>
            )}

            {/* Review Step */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Review & Confirm</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {billing.name}</p>
                  <p><strong>Email:</strong> {billing.email}</p>
                  <p><strong>Phone:</strong> {billing.phone}</p>
                  <p><strong>Payment:</strong> {paymentMethod.toUpperCase()}</p>
                  <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="px-6 py-2 bg-gray-200 rounded-lg"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  {loading ? "Processing…" : "Place Booking"}
                </button>
              )}
            </div>

            {error.submit && (
              <p className="text-red-600 text-center mt-4">{error.submit}</p>
            )}
          </form>
        </div>
      </Section>
      <NewsletterSection />
    </div>
  );
}



// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Section from '@/components/site/Section/Section';
// import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
// import Confetti from 'react-confetti';
// import {
//   CreditCardIcon,
//   TruckIcon,
//   TrashIcon,
//   CheckCircleIcon,
//   CalendarIcon,
//   XCircleIcon,
//   ArrowLeftIcon,
//   BuildingLibraryIcon,
//   TagIcon,
//   MapPinIcon,
//   UserCircleIcon,
//   PlusIcon,
//   MinusIcon,
//   BanknotesIcon, // New Icon for Paystack/Bank Payments
// } from '@heroicons/react/24/outline';
// import { useStateContext } from '@/contexts/ContextProvider';
// import { useStore } from '@/contexts/StoreContext';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import ShippingAddress from '@/components/shippingAddress';
// import { formatCreditCardNumber, formatExpirationDate, formatCVC } from '@/data/cardFormatter';

// const steps = ['Billing', 'Shipping', 'Payment & Promo', 'Review'];

// const stepIcons = [
//   UserCircleIcon,
//   MapPinIcon,
//   CreditCardIcon,
//   CheckCircleIcon,
// ];

// const stepVariants = {
//   enter: {
//     opacity: 0,
//     y: 20,
//     scale: 0.98,
//   },
//   center: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { type: 'spring', stiffness: 200, damping: 22 },
//   },
//   exit: {
//     opacity: 0,
//     y: -20,
//     scale: 0.98,
//     transition: { duration: 0.25 },
//   },
// };

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// export default function CheckoutPage() {
//   const store = useStore();
//   const router = useRouter();
//   const { data: session } = useSession();
//   const { cart = [], clearCart, updateCartQuantity, removeFromCart } = useStateContext() as any;
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isOrderPlaced, setIsOrderPlaced] = useState(false);
//   const [trackingNumber, setTrackingNumber] = useState("");
//   const [error, setError] = useState<any>({});

//   const [formData, setFormData] = useState<any>({
//     name: session?.user?.name || '',
//     email: session?.user?.email || '',
//     phone: session?.user?.phone || '',
    
//     // Card details (only needed if paymentMethod is 'card')
//     cardNumber: session?.user?.cardNumber || '',
//     cardExpiry: session?.user?.cardExpiry || '',
//     cvv: '',

//     // M-Pesa phone number field
//     mpesaPhone: session?.user?.phone || '', 

//     shippingAddress: {
//       display_name: "",
//       lat: 0.0,
//       lng: 0.0,
//     },
//     promoCode: '',
//     paymentMethod: 'card', // Default to 'card'
//     shippingMethod: 'Standard',
//   });

//   const [promoMessage, setPromoMessage] = useState('');
//   const [discount, setDiscount] = useState(0);
//   const [estimatedDelivery, setEstimatedDelivery] = useState('');
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

//   // Address select handler
//   const handleAddressSelect = (address: string, coords: { lat: number; lng: number }) => {
//     setFormData((f: any) => ({
//       ...f,
//       shippingAddress: {
//         display_name: address,
//         lat: coords.lat,
//         lng: coords.lng,
//       }
//     }));
//     setError((e: any) => ({ ...e, shippingAddress: '' }));
//   };

//   // Totals
//   const subtotal = useMemo(
//     () => cart.reduce((sum: number, item: any) => sum + (item.finalPrice || 0) * (item.quantity || 0), 0),
//     [cart]
//   );
//   const shippingCost = useMemo(() => formData.shippingMethod === 'Express' ? 15 : 5, [formData.shippingMethod]);
//   const discountAmount = useMemo(() => subtotal * discount, [subtotal, discount]);
//   const total = useMemo(() => (subtotal + shippingCost - discountAmount), [subtotal, shippingCost, discountAmount]);

//   // Promo debounce & logic
//   useEffect(() => {
//     const id = setTimeout(() => {
//       if (!formData.promoCode) {
//         setDiscount(0);
//         return setPromoMessage('');
//       }
//       if (formData.promoCode.trim().toUpperCase() === 'SAVE10') {
//         setDiscount(0.1);
//         setPromoMessage('🎉 10% discount applied! Awesome deal!');
//       } else {
//         setDiscount(0);
//         setPromoMessage('❌ Invalid promo code. Try SAVE10!');
//       }
//     }, 500);
//     return () => clearTimeout(id);
//   }, [formData.promoCode]);

//   // Estimate delivery
//   useEffect(() => {
//     const days = formData.shippingMethod === 'Express' ? 2 : 5;
//     const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
//     setEstimatedDelivery(date.toDateString());
//   }, [formData.shippingMethod]);

//   // Window size for confetti
//   useEffect(() => {
//     const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', update);
//     update();
//     return () => window.removeEventListener('resize', update);
//   }, []);

//   const validateStep = useCallback(() => {
//     const errs: any = {};
//     if (currentStep === 0) {
//       ['name', 'email', 'phone'].forEach((f: string) => {
//         if (!formData[f]) errs[f] = 'Required';
//       });
//     }
//     if (currentStep === 1) {
//       if (!formData.shippingAddress?.display_name) {
//         errs.shippingAddress = 'Please select a shipping address.';
//       }
//     }
//     if (currentStep === 2) {
//       // Card Validation
//       if (formData.paymentMethod === 'card') {
//           if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 15) errs.cardNumber = 'Invalid Card Number';
//           if (!formData.cardExpiry || formData.cardExpiry.length !== 5) errs.cardExpiry = 'Invalid Date (MM/YY)';
//           if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4) errs.cvv = 'Invalid CVV (3 or 4 digits)';
//       }
//       // M-Pesa Validation
//       if (formData.paymentMethod === 'mpesa') {
//           // Basic phone number validation (e.g., must be 12 digits for 254...)
//           // This should be robust phone validation in a production app
//           if (!formData.mpesaPhone || formData.mpesaPhone.length < 12) errs.mpesaPhone = 'Invalid M-Pesa number (e.g., 2547XXXXXXXX)';
//       }
//       // Paystack / COD / Pickup require no validation fields here
//     }
//     setError(errs);
//     return Object.keys(errs).length === 0;
//   }, [currentStep, formData]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target as any;
//     let v = value;
//     if (name === 'cardNumber') v = formatCreditCardNumber(value);
//     if (name === 'cardExpiry') v = formatExpirationDate(value);
//     if (name === 'cvv') v = formatCVC(value);
//     setFormData((fd: any) => ({ ...fd, [name]: v }));
//     setError((err: any) => ({ ...err, [name]: '' }));
//   };

//   const next = () => {
//     if (validateStep()) setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
//   };
//   const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateStep() || currentStep !== steps.length - 1) return;

//     setIsSubmitting(true);
//     setError({});

//     try {
//       // 1. Prepare the base payload
//       const payload = {
// //         
//         consumerId: session?.user?.id,
//         companyId: storeFormData?.id,
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         promoCode: formData.promoCode,
//         items: cart.map((i: any) => ({
//           marketplaceListingId: i.id,
//           quantity: i.quantity,
//           price: i.finalPrice,
//         })),
//         shippingAddress: formData.shippingAddress,
//         shippingMethod: formData.shippingMethod,
//         paymentOption: formData.paymentMethod,
//         delivery: formData.shippingMethod !== 'pickupatshop',
//         totalPrice: parseFloat(total.toFixed(2)),
//         // Add payment-specific data to the payload
//         paymentData: {
//           cardNumber: formData.cardNumber.replace(/\s/g, ''), // Send cleaned card number
//           cardExpiry: formData.cardExpiry,
//           cvv: formData.cvv,
//           mpesaPhone: formData.mpesaPhone, 
//         }
//       };

//       console.log("Submitting order with payload:", payload);
      
//       const res = await fetch(`/api/shop/orders`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || '',
//           'Credentials': 'include',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         const errorMessage = errorData.message || errorData.data || res.statusText;
//         console.error("Server responded with error:", res.status, errorMessage);
//         throw new Error(errorMessage || "Order submission failed.");
//       }

//       let orderResponse = (await res.json()).data;

//       // --- Payment Redirection/Handling Logic ---
//       switch (formData.paymentMethod) {
//         case 'paystack':
//           // The backend should return an 'authorizationUrl' for Paystack
//           if (orderResponse.authorizationUrl) {
//             // Redirect the user to Paystack's payment page
//             router.push(orderResponse.authorizationUrl);
//             return; // Exit function to wait for Paystack redirect/webhook confirmation
//           }
//           throw new Error("Paystack authorization URL missing from server response.");
        
//         case 'mpesa':
//           // The backend initiates the STK Push. The order is tentatively placed.
//           // The frontend just confirms the prompt was sent.
//           // Actual order confirmation will happen via a webhook on the backend.
//           // We can show a special status for "Payment Pending" if needed, 
//           // but for now, we continue to the success screen based on the backend's immediate response.
//           console.log("M-Pesa STK Push initiated.");
//           break; 

//         case 'card':
//           // Assuming the backend attempted to charge the card with the provided details.
//           // If the charge was successful, we continue. If it failed, the server returns a 4xx error.
//           console.log("Card charge successful/order initiated.");
//           break;

//         case 'cod':
//         case 'pickupatshop':
//           // Payment is deferred. Order is placed.
//           break;
          
//         default:
//           break;
//       }
//       // --- END Payment Handling Logic ---

//       // Final Order Confirmation (only reached for successful direct payments or deferred payments)
//       if (!orderResponse?.trackingNumber) {
//         throw new Error("No tracking number in response.");
//       }

//       clearCart();
//       setTrackingNumber(orderResponse.trackingNumber);
//       setIsOrderPlaced(true);

//     } catch (err: any) {
//       console.error("Submit error:", err);
//       setError({ submit: err.message || 'Order failed. Please verify all details and try again.' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isOrderPlaced) {
//     return <OrderStatus success trackingnumber={trackingNumber} />;
//   }

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={{
//         hidden: { opacity: 0 },
//         visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
//       }}
//       className="min-h-screen bg-gray-50 p-6 md:p-12"
//     >
//       <style jsx>{`
//         /* subtle input focus lift */
//         .input-focus:focus {
//           transform: scale(1.01);
//           box-shadow: 0 6px 18px rgba(99,102,241,0.08);
//         }
//         /* sparkle animation */
//         @keyframes sparkle {
//           0%, 100% { opacity: 0; transform: scale(0.8); }
//           50% { opacity: 1; transform: scale(1.2); }
//         }
//         .sparkle { position: absolute; width: 6px; height: 6px; background: #34D399; border-radius: 50%; animation: sparkle 1.5s infinite ease-in-out; }
//       `}</style>

//       <Section title="🛒 Secure Checkout">
//         <div className="max-w-6xl mx-auto">
//           <ProgressIndicator currentStep={currentStep} />

//           <p className="text-center text-sm text-gray-500 mb-4">
//             Step {currentStep + 1} of {steps.length} — <span className="font-medium text-indigo-600">{steps[currentStep]}</span>
//           </p>

//           <div className="grid md:grid-cols-5 gap-8">
//             <motion.div
//               initial={{ opacity: 0, x: -30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.45 }}
//               className="md:col-span-2 hidden md:block"
//             >
//               <OrderSummary
//                 cart={cart}
//                 estimatedDelivery={estimatedDelivery}
//                 subtotal={subtotal}
//                 shippingCost={shippingCost}
//                 discountAmount={discountAmount}
//                 total={total}
//                 updateCartQuantity={updateCartQuantity}
//                 removeFromCart={removeFromCart}
//               />
//             </motion.div>

//             <motion.form
//               key="checkout-form"
//               onSubmit={handleSubmit}
//               className="md:col-span-3 bg-white rounded-3xl p-8 shadow-2xl space-y-8 border border-gray-100"
//               initial={{ scale: 0.98, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               transition={{ type: 'spring', stiffness: 160 }}
//             >
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentStep}
//                   variants={stepVariants}
//                   initial="enter"
//                   animate="center"
//                   exit="exit"
//                   className="min-h-[300px]"
//                 >
//                   <StepContent
//                     currentStep={currentStep}
//                     formData={formData}
//                     handleChange={handleChange}
//                     error={error}
//                     handleAddressSelect={handleAddressSelect}
//                     promoMessage={promoMessage}
//                     total={total}
//                     steps={steps}
//                   />
//                 </motion.div>
//               </AnimatePresence>

//               <div className="flex justify-between items-center pt-6 border-t border-gray-100">
//                 {currentStep > 0 ? (
//                   <motion.button
//                     type="button"
//                     onClick={prev}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                     className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors"
//                   >
//                     <ArrowLeftIcon className="w-5 h-5" /> Previous Step
//                   </motion.button>
//                 ) : <div />}

//                 {currentStep < steps.length - 1 ? (
//                   <motion.button
//                     type="button"
//                     onClick={next}
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.98 }}
//                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                     className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-extrabold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform"
//                   >
//                     Next: {steps[currentStep + 1]}
//                   </motion.button>
//                 ) : (
//                   <motion.button
//                     type="submit"
//                     disabled={isSubmitting}
//                     whileHover={isSubmitting ? {} : { scale: 1.02 }}
//                     whileTap={isSubmitting ? {} : { scale: 0.98 }}
//                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                     className={`px-8 py-3 rounded-full font-extrabold shadow-lg transition-all transform
//                       ${isSubmitting
//                         ? 'bg-gray-400 text-white cursor-not-allowed'
//                         : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
//                       }`}
//                   >
//                     {isSubmitting ? 'Processing Payment…' : '🎉 Place Order'}
//                   </motion.button>
//                 )}
//               </div>
//               {error.submit && <p className="text-red-600 text-center mt-4 p-3 bg-red-50 rounded-lg">{error.submit}</p>}
//             </motion.form>

//             {/* Mobile Order Summary */}
//             <div className="md:hidden col-span-5">
//               <OrderSummary
//                 cart={cart}
//                 estimatedDelivery={estimatedDelivery}
//                 subtotal={subtotal}
//                 shippingCost={shippingCost}
//                 discountAmount={discountAmount}
//                 total={total}
//                 updateCartQuantity={updateCartQuantity}
//                 removeFromCart={removeFromCart}
//               />
//             </div>
//           </div>
//         </div>
//       </Section>
//       <NewsletterSection />
//     </motion.div>
//   );
// }

// /* ------------------------------
//    ProgressIndicator Component
//    ------------------------------ */
// function ProgressIndicator({ currentStep }: { currentStep: number }) {
//   return (
//     <div className="flex mb-6 justify-center">
//       {steps.map((label, i) => {
//         const Icon = stepIcons[i];
//         const isCompleted = currentStep > i;
//         const isActive = currentStep === i;

//         return (
//           <div key={i} className="flex-1 text-center relative flex items-center justify-center">
//             <div className="flex flex-col items-center relative z-10">
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: 'spring', stiffness: 500, damping: 20, delay: i * 0.06 }}
//                 className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold transition-all duration-300
//                   ${isCompleted
//                     ? 'border-green-500 bg-green-500 text-white shadow-md'
//                     : isActive
//                       ? 'border-indigo-600 bg-white text-indigo-600'
//                       : 'border-gray-300 bg-white text-gray-500'
//                   }`}
//               >
//                 <Icon className="w-6 h-6" />
//               </motion.div>
//               <p className={`text-sm mt-2 transition-colors duration-300 ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}>
//                 {label}
//               </p>
//             </div>

//             {/* Active Glow (shared layoutId for smooth move) */}
//             {isActive && (
//               <motion.div
//                 layoutId="active-glow"
//                 className="absolute -inset-1 rounded-full pointer-events-none"
//                 initial={false}
//                 animate={{ boxShadow: '0 10px 30px rgba(99,102,241,0.08)' }}
//                 transition={{ type: 'spring', stiffness: 220, damping: 30 }}
//               />
//             )}

//             {/* Separator Line */}
//             {i < steps.length - 1 && (
//               <div className="absolute left-[calc(50%+24px)] w-[calc(100%-48px)] h-1">
//                 <motion.div
//                   className="h-full rounded-full"
//                   initial={{ width: 0 }}
//                   animate={{ width: isCompleted ? '100%' : '0%' }}
//                   transition={{ duration: 0.4 }}
//                   style={{ backgroundColor: isCompleted ? '#34D399' : '#E5E7EB' }}
//                 />
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ------------------------------
//    OrderSummary Component
//    ------------------------------ */
// function OrderSummary({ cart, estimatedDelivery, subtotal, shippingCost, discountAmount, total, updateCartQuantity, removeFromCart }: any) {

//   const handleQuantityChange = (itemId: string, delta: number) => {
//     const item = cart.find((i: any) => i.id === itemId);
//     if (!item) return;
//     const newQuantity = item.quantity + delta;
//     if (newQuantity <= 0) {
//       removeFromCart?.(itemId);
//     } else {
//       updateCartQuantity?.(itemId, newQuantity);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45, delay: 0.08 }}
//       className="bg-white rounded-3xl shadow-2xl p-6 sticky top-20 border border-gray-100"
//     >
//       <h2 className="text-2xl font-extrabold mb-5 text-gray-800">Your Cart ({cart.length} items)</h2>

//       <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
//         <AnimatePresence>
//           {cart.map((item: any) => (
//             <motion.div
//               key={item.id}
//               initial={{ opacity: 0, y: -12 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, x: -50 }}
//               transition={{ duration: 0.28 }}
//               whileHover={{ scale: 1.01 }}
//               className="flex flex-col border-b pb-3 last:border-b-0 last:pb-0 p-2 rounded-lg"
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <p className="font-semibold text-gray-700 leading-snug pr-4">{item.title || item.name}</p>
//                 <p className="font-extrabold text-lg text-gray-900">${((item.finalPrice || 0) * item.quantity).toFixed(2)}</p>
//               </div>

//               <div className="flex justify-between items-center">
//                 <div className="flex items-center space-x-2 text-sm text-gray-500">
//                   <span className="text-sm font-medium">@ ${((item.finalPrice || 0)).toFixed(2)}</span>
//                 </div>

//                 <div className="flex items-center space-x-2">
//                   <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
//                     <button
//                       type="button"
//                       onClick={() => handleQuantityChange(item.id, -1)}
//                       className="p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
//                       disabled={item.quantity <= 1}
//                     >
//                       <MinusIcon className="w-4 h-4 text-gray-600" />
//                     </button>
//                     <span className="px-3 font-semibold text-gray-800 text-sm">{item.quantity}</span>
//                     <button
//                       type="button"
//                       onClick={() => handleQuantityChange(item.id, 1)}
//                       className="p-1.5 hover:bg-gray-100 transition-colors"
//                     >
//                       <PlusIcon className="w-4 h-4 text-gray-600" />
//                     </button>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => removeFromCart?.(item.id)}
//                     title="Remove item"
//                     className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all"
//                   >
//                     <TrashIcon className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>

//         {!cart.length && (
//           <motion.p
//             animate={{ y: [0, -6, 0] }}
//             transition={{ repeat: Infinity, duration: 3 }}
//             className="text-gray-500 italic py-4 text-center"
//           >
//             Your cart is empty. Time to shop!
//           </motion.p>
//         )}
//       </div>

//       <div className="space-y-2 pt-4 border-t mt-4">
//         <div className="flex justify-between text-gray-600">
//           <span>Subtotal</span>
//           <span>${subtotal.toFixed(2)}</span>
//         </div>
//         <div className="flex justify-between text-gray-600">
//           <span>Shipping ({shippingCost > 0 ? 'Cost' : 'Free'})</span>
//           <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'FREE'}</span>
//         </div>
//         <div className="flex justify-between text-green-600 font-semibold border-b pb-3">
//           <span>Discount</span>
//           <span>- ${discountAmount.toFixed(2)}</span>
//         </div>
//       </div>

//       <div className="flex justify-between font-extrabold text-2xl mt-4">
//         <span>Order Total</span>
//         <motion.span
//           key={total}
//           initial={{ scale: 1.12, opacity: 0.6 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 300, damping: 20 }}
//         >
//           ${total.toFixed(2)}
//         </motion.span>
//       </div>

//       <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg mt-4">
//         <CalendarIcon className="w-5 h-5 text-indigo-600" />
//         <span className="text-sm font-medium">Estimated Delivery: <span className="font-semibold">{estimatedDelivery}</span></span>
//       </div>
//     </motion.div>
//   );
// }

// /* ------------------------------
//    OrderStatus Component
//    ------------------------------ */
// function OrderStatus({ success, trackingnumber }: { success: boolean, trackingnumber: String }) {
//   const router = useRouter();
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
//     window.addEventListener('resize', update); update(); return () => window.removeEventListener('resize', update);
//   }, []);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
//       {success && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.7, y: 50 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
//         className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100 text-center max-w-lg w-full border border-gray-100 relative"
//       >
//         {success ? (
//           <>
//             <motion.div
//               initial={{ rotate: -90, scale: 0 }}
//               animate={{ rotate: 0, scale: 1 }}
//               transition={{ type: "spring", stiffness: 300, damping: 15 }}
//               whileHover={{ rotate: 3, scale: 1.05 }}
//               className="mx-auto bg-green-100 rounded-full p-4 w-24 h-24 flex items-center justify-center relative"
//             >
//               <CheckCircleIcon className="w-16 h-16 text-green-600" />
//               {/* sparkles */}
//               <div className="sparkle" style={{ top: -6, left: -6 }} />
//               <div className="sparkle" style={{ top: 6, right: -8, animationDelay: '0.4s' }} />
//               <div className="sparkle" style={{ bottom: -6, right: 8, animationDelay: '0.25s' }} />
//             </motion.div>

//             <h2 className="text-4xl font-extrabold text-gray-800 mt-6">Order Placed! 🚀</h2>
//             <p className="mt-3 text-lg text-gray-600">Your adventure begins now. We've got your back!</p>
//             <p className="mt-2 text-sm text-indigo-600 font-medium">Tracking Number: <span className="font-semibold">{trackingnumber}</span></p>
//           </>
//         ) : (
//           <>
//             <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
//             <h2 className="text-3xl font-bold text-gray-800 mt-4">Order Failed</h2>
//             <p className="mt-2 text-gray-600">Oops! Something went wrong. Please check your payment details or try again.</p>
//           </>
//         )}
//         <div className="mt-8 space-y-4">
//           {success && (
//             <motion.button
//               onClick={() => router.push(`/shop/orderTracking?trackingnumber=${trackingnumber}`)}
//               whileHover={{ scale: 1.01 }}
//               transition={{ type: 'spring', stiffness: 220, damping: 20 }}
//               className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-colors"
//             >
//               Track Your Order Now!
//             </motion.button>
//           )}
//           <button
//             onClick={() => router.push('/')}
//             className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
//           >
//             <ArrowLeftIcon className="w-5 h-5" /> Continue Shopping
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// /* ------------------------------
//    StepContent Component
//    ------------------------------ */
// function StepContent({ currentStep, formData, handleChange, error, handleAddressSelect, promoMessage, total, steps }: any) {
//   const StepIcon = stepIcons[currentStep];

//   const InputField = ({ name, placeholder, type = 'text', maxLength, autoFocus = false, className = '' }: any) => (
//     <div className='space-y-1'>
//       <input
//         name={name}
//         type={type}
//         value={formData[name] || ''}
//         onChange={handleChange}
//         placeholder={placeholder}
//         maxLength={maxLength}
//         autoFocus={autoFocus}
//         className={`w-full p-4 border rounded-xl focus:ring-2 transition-all input-focus ${className} ${error[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
//       />
//       {error[name] && <p className="text-red-600 text-xs mt-1 font-medium">{error[name]}</p>}
//     </div>
//   );

//   // --- Payment Method Renderer ---
//   const renderPaymentMethodForm = (method: string) => {
//     switch (method) {
//       case 'card': // Stripe/General Card Payment
//         return (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.28 }} className="space-y-4 pt-4 border-t border-indigo-100">
//             <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><CreditCardIcon className='w-5 h-5 text-indigo-500'/> Card Details (Secured by Stripe)</h4>
//             <InputField name="cardNumber" placeholder="Card Number (xxxx xxxx xxxx xxxx)" maxLength={19} />
//             <div className="flex gap-4">
//               <InputField name="cardExpiry" placeholder="MM/YY" maxLength={5} />
//               <InputField name="cvv" placeholder="CVC/CVV" maxLength={4} />
//             </div>
//             <p className="text-xs text-gray-500 pt-2 flex items-center gap-1">Your card information is safely processed.</p>
//           </motion.div>
//         );
//       case 'mpesa':
//         return (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.28 }} className="space-y-4 pt-4 border-t border-green-100 bg-green-50 p-4 rounded-xl">
//             <h4 className="text-lg font-semibold text-green-700 flex items-center gap-2"><TagIcon className='w-5 h-5'/> M-Pesa Payment</h4>
//             <p className="text-sm text-gray-600">A payment prompt will be sent to this number upon placing the order:</p>
//             <InputField name="mpesaPhone" placeholder="Enter M-Pesa Phone Number (e.g., 2547XXXXXXXX)" type="tel" maxLength={13} />
//             <ul className="text-xs text-gray-500 list-disc ml-4">
//               <li>Ensure your phone is near and unlocked.</li>
//             </ul>
//           </motion.div>
//         );
//       case 'paystack':
//         return (
//           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.28 }} className="space-y-4 pt-4 border-t border-yellow-100 bg-yellow-50 p-4 rounded-xl">
//             <h4 className="text-lg font-semibold text-yellow-700 flex items-center gap-2"><BanknotesIcon className='w-5 h-5'/> Paystack Payment</h4>
//             <p className="text-sm text-gray-700">You will be **securely redirected to Paystack** to complete your payment (Card, Bank Transfer, USSD) after placing the order.</p>
//             <p className="text-xs text-gray-500 pt-2">No information is required here.</p>
//           </motion.div>
//         );
//       case 'cod':
//         return (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
//             <p className="font-semibold text-blue-700 flex items-center gap-2"><TruckIcon className='w-5 h-5'/> Pay upon delivery. Please have the exact amount ready.</p>
//           </motion.div>
//         );
//       case 'pickupatshop':
//         return (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
//             <p className="font-semibold text-purple-700 flex items-center gap-2"><BuildingLibraryIcon className='w-5 h-5'/> Pay when you collect your order at the shop.</p>
//           </motion.div>
//         );
//       default:
//         return null;
//     }
//   };
//   // --- END Payment Method Renderer ---


//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
//         <StepIcon className="w-8 h-8 text-indigo-600" /> {steps[currentStep]}
//       </h2>
//       <hr className="border-t border-indigo-100" />

//       {/* STEP 0: Billing */}
//       {currentStep === 0 && (
//         <div className="space-y-5">
//           <InputField name="name" placeholder="Full Name" autoFocus={true} />
//           <InputField name="email" placeholder="Email Address" type="email" />
//           <InputField name="phone" placeholder="Phone Number" type="tel" />
//         </div>
//       )}

//       {/* STEP 1: Shipping */}
//       {currentStep === 1 && (
//         <div className="space-y-6">
//           <h3 className="text-xl font-semibold text-gray-700">Select Delivery Location 📍</h3>
//           <ShippingAddress onAddressSelect={handleAddressSelect} />
//           {error.shippingAddress && <p className="text-red-600 text-xs mt-1 font-medium bg-red-50 p-2 rounded-lg">{error.shippingAddress}</p>}

//           <h3 className="text-xl font-semibold text-gray-700 pt-4">Shipping Method 🚚</h3>
//           <div className="grid grid-cols-2 gap-4">
//             {['Standard', 'Express'].map((method: string) => (
//               <label key={method} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.shippingMethod === method ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'}`}>
//                 <input
//                   type="radio" name="shippingMethod"
//                   value={method} checked={formData.shippingMethod === method}
//                   onChange={handleChange} className="hidden"
//                 />
//                 <div className="flex flex-col">
//                   <span className="font-bold text-gray-800">{method}</span>
//                   <span className="text-sm text-gray-500">{method === 'Express' ? '$15.00 (2 Days)' : '$5.00 (5 Days)'}</span>
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* STEP 2: Payment & Promo */}
//       {currentStep === 2 && (
//         <div className="space-y-6">
//           <h3 className="text-xl font-semibold text-gray-700">Choose Payment Method 💳</h3>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             {[
//               { value: 'card', label: 'Credit Card', Icon: CreditCardIcon },
//               { value: 'mpesa', label: 'Mpesa', Icon: TagIcon },
//               { value: 'paystack', label: 'Paystack', Icon: BanknotesIcon },
//               { value: 'cod', label: 'Cash on Delivery', Icon: TruckIcon },
//               { value: 'pickupatshop', label: 'Pickup', Icon: BuildingLibraryIcon },
//             ].map(({ value, label, Icon }) => (
//               <label key={value} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === value ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300'}`}>
//                 <input
//                   type="radio" name="paymentMethod"
//                   value={value} checked={formData.paymentMethod === value}
//                   onChange={handleChange} className="hidden"
//                 />
//                 <Icon className="w-7 h-7 text-indigo-600" />
//                 <span className='text-sm font-medium text-center'>{label}</span>
//               </label>
//             ))}
//           </div>

//           {/* RENDER PAYMENT FORM HERE based on selected method */}
//           {renderPaymentMethodForm(formData.paymentMethod)}

//           {/* Promo Code */}
//           <h3 className="text-xl font-semibold text-gray-700 pt-4">Apply Promo Code 🎁</h3>
//           <div className="relative">
//             <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               name="promoCode"
//               type="text"
//               value={formData.promoCode || ''}
//               onChange={handleChange}
//               placeholder="Enter Promo Code (e.g., SAVE10)"
//               className={`w-full p-4 border rounded-xl pl-10 focus:ring-2 transition-all input-focus ${error.promoCode ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'}`}
//             />
//             <AnimatePresence>
//               {promoMessage && (
//                 <motion.p
//                   key={promoMessage}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.22 }}
//                   className={`text-sm mt-2 font-medium ${promoMessage.startsWith('❌') ? 'text-red-500' : 'text-green-600'}`}
//                 >
//                   {promoMessage}
//                 </motion.p>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>
//       )}

//       {/* STEP 3: Review */}
//       {currentStep === 3 && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
//             <div>
//               <h3 className="text-xl font-bold mb-3 text-indigo-600 flex items-center gap-2"><UserCircleIcon className='w-5 h-5'/> Billing Info</h3>
//               <p className="text-gray-700"><strong>Name:</strong> {formData.name}</p>
//               <p className="text-gray-700"><strong>Email:</strong> {formData.email}</p>
//               <p className="text-gray-700"><strong>Phone:</strong> {formData.phone}</p>
//             </div>
//             <div>
//               <h3 className="text-xl font-bold mb-3 text-indigo-600 flex items-center gap-2"><MapPinIcon className='w-5 h-5'/> Shipping Details</h3>
//               <p className="text-gray-700"><strong>Address:</strong> {formData?.shippingAddress?.display_name || "N/A"}</p>
//               <p className="text-gray-700"><strong>Method:</strong> {formData.shippingMethod}</p>
//               <p className="text-gray-700"><strong>Payment:</strong> {formData.paymentMethod.toUpperCase()}</p>
              
//               {/* Conditional Payment Detail Display */}
//               {formData.paymentMethod === 'mpesa' && (
//                 <p className="text-gray-700"><strong>M-Pesa No:</strong> {formData.mpesaPhone}</p>
//               )}
//             </div>
//           </div>

//           <div className="p-6 bg-indigo-50 rounded-xl">
//             <div className="flex justify-between font-extrabold text-2xl text-gray-900">
//               <span>Final Total</span>
//               <motion.span
//                 key={total}
//                 initial={{ scale: 1.08, opacity: 0.6 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//               >
//                 ${total.toFixed(2)}
//               </motion.span>
//             </div>
//             <p className="text-sm text-indigo-700 mt-2 font-medium">By clicking 'Place Order', you agree to our terms and conditions.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }