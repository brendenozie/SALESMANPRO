"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormWrapperProps {
  listingId: string;
  date: string;
  timeSlot: string;
  amount: number;
}

export default function CheckoutFormWrapper(props: CheckoutFormWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // 1) Create PaymentIntent + pass booking metadata
  useEffect(() => {
    fetch(`${apiBaserUrl}/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(props.amount * 100),
        metadata: {
          listingId: props.listingId,
          date: props.date,
          timeSlot: props.timeSlot,
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => setClientSecret(d.clientSecret));
  }, [props]);

  if (!clientSecret) return <p>Initializing payment…</p>;

  return (
    <>
    
    </>
    // <Elements stripe={stripePromise} options={{ clientSecret }}>
    //   <_CheckoutForm {...props} />
    // </Elements>
  );
}

function _CheckoutForm({
  listingId,
  date,
  timeSlot,
  amount,
}: CheckoutFormWrapperProps) {
  // const stripe = useStripe();
  // const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    // 2) Confirm payment with Stripe
    // const { error: stripeError, paymentIntent } =
    //   await stripe.confirmPayment({
    //     elements,
    //     confirmParams: {
    //       return_url: `${window.location.origin}/payment-success`,
    //     },
    //   });

    // if (stripeError) {
    //   setError(stripeError.message || "Payment failed");
    //   setLoading(false);
    //   return;
    // }

    // 3) On success, create your order record
    //    (you can also do this via a Stripe webhook on payment_intent.succeeded)
    await fetch(`${apiBaserUrl}/customer-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        date,
        timeSlot,
        quantity: 1,
        paymentIntentId: "paymentIntent?.id",
        totalPrice: amount,
      }),
    });

    // 4) Redirect to success page
    router.push("/payment-success");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}
      {/* <PaymentElement /> */}
      <button
        type="submit"
        // disabled={!stripe || loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        {loading ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}
