// app/[slug]/products/[productId]/checkout/CourseCheckoutView.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { checkoutAndEnrollStudent } from "@/lib/orders/enrollement";
import { useSession } from "next-auth/react";

const loader = ({ src }: { src: string }) => src;

type PaymentMethod =
  | "mpesa"
  | "paystack"
  | "stripe"
  | "paypal"
  | "cod";

interface CheckoutProps {
  course: any;
  companyId: string;
  slug: string;
}

export default function CourseCheckoutView({ course, companyId, slug }: CheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const session = useSession();
  const student = session?.data?.user ? { user: session.data.user } : null;

  const price = course?.price || 0;
  const serviceFee = Math.round(price * 0.015); // 1.5% processing fee sample
  const totalAmount = price + serviceFee;

  const [paymentMethod, setPaymentMethod] =  useState<PaymentMethod>("mpesa");

const [phone, setPhone] = useState(  student?.user?.phone || "");

const [mpesaPhone, setMpesaPhone] =  useState(student?.user?.phone || "");

const handleEnrollmentSubmit = async (
        e: React.FormEvent
      ) => {
        e.preventDefault();

        setIsProcessing(true);
        setError(null);

        try {
          // -----------------------------------
          // AUTH VALIDATION
          // -----------------------------------
          if (!student || !student.user) {
            setError(
              "You must be logged in to complete enrollment."
            );

            setIsProcessing(false);
            return;
          }

          // -----------------------------------
          // SERVER ACTION
          // -----------------------------------
          const result =
            await checkoutAndEnrollStudent({
              courseId: course.id,
              studentId: student.user.id,
              companyId,

              paymentOption: paymentMethod,

              email: student.user.email || "",
              phone,

              mpesaPhone:
                paymentMethod === "mpesa"
                  ? mpesaPhone
                  : undefined,
            });

          // -----------------------------------
          // FAILURE
          // -----------------------------------
          if (!result.success) {
            setError(
              result.error || "Checkout failed."
            );

            setIsProcessing(false);
            return;
          }

          // -----------------------------------
          // REDIRECT GATEWAYS
          // -----------------------------------
          if (result.authorizationUrl) {
            window.location.href =
              result.authorizationUrl;

            return;
          }

          // -----------------------------------
          // MPESA STK
          // -----------------------------------
          if (paymentMethod === "mpesa") {
            setIsSuccess(true);

            setIsProcessing(false);

            return;
          }

          // -----------------------------------
          // COD / FREE
          // -----------------------------------
          setIsSuccess(true);

        } catch (err: any) {
          console.error(err);

          setError(
            err?.message ||
            "Unexpected enrollment error."
          );
        } finally {
          setIsProcessing(false);
        }
      };


  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white flex flex-col justify-between pt-36">
      {/* HEADER */}
      <header className="border-b border-zinc-100 dark:border-zinc-900 px-6 lg:px-16 py-6 flex items-center justify-between">
        <button 
          onClick={() => window.history.back()} 
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          Back to Course
        </button>
        <span className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
          Secure Checkout System
        </span>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-16 py-12 lg:py-20 grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <>
              {/* LEFT: ORDER SUMMARY */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <p className="uppercase text-xs tracking-[0.3em] text-orange-500 font-black mb-3">Review Order</p>
                  <h1 className="text-4xl font-black uppercase italic tracking-tight leading-none">Course Enrollment</h1>
                </div>

                <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 flex gap-5 items-center">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={course?.imageUrl || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600"}
                      alt={course?.title}
                      fill
                      loader={loader}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500">
                      {course?.code}
                    </span>
                    <h3 className="font-black text-xl uppercase italic mt-1.5 leading-tight">{course?.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{course?.duration || "Self-Paced Learning"}</p>
                  </div>
                </div>

                {/* PRICING STRUCTURE */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Course Subtotal</span>
                    <span className="font-bold">KSh {price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Processing Fee</span>
                    <span className="font-bold">KSh {serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                    <span className="uppercase text-xs font-black tracking-widest text-zinc-400">Total Due Amount</span>
                    <span className="text-3xl font-black">KSh {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: BILLING / ENROLLMENT CONFIRMATION FORM */}
              <div className="lg:col-span-7 p-8 lg:p-12 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Account Allocation</h2>
                    <p className="text-sm text-zinc-500">This account will immediately receive system permissions and logging parameters upon access confirmation.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Student Name</label>
                      <input 
                        type="text" 
                        disabled 
                        value={student?.user?.name || "Authenticated Student"}
                        className="w-full h-14 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-transparent font-medium text-sm text-zinc-500 opacity-80 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Contact Email Address</label>
                      <input 
                        type="text" 
                        disabled 
                        value={student?.user?.email || "student@academy.io"}
                        className="w-full h-14 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-transparent font-medium text-sm text-zinc-500 opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* SIMULATED PAYMENT INTELLIGENCE ANCHOR */}
                  <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider mb-2">
                          Payment Method
                        </h3>

                        <p className="text-xs text-zinc-500">
                          Select your preferred payment route.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* MPESA */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("mpesa")}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            paymentMethod === "mpesa"
                              ? "border-emerald-500 bg-emerald-500/5"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider">
                              M-Pesa
                            </span>

                            <div
                              className={`w-3 h-3 rounded-full ${
                                paymentMethod === "mpesa"
                                  ? "bg-emerald-500"
                                  : "bg-zinc-300"
                              }`}
                            />
                          </div>

                          <p className="text-[11px] text-zinc-500 mt-2">
                            STK Push Payment
                          </p>
                        </button>

                        {/* PAYSTACK */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paystack")}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            paymentMethod === "paystack"
                              ? "border-orange-500 bg-orange-500/5"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider">
                              Card
                            </span>

                            <div
                              className={`w-3 h-3 rounded-full ${
                                paymentMethod === "paystack"
                                  ? "bg-orange-500"
                                  : "bg-zinc-300"
                              }`}
                            />
                          </div>

                          <p className="text-[11px] text-zinc-500 mt-2">
                            Card / Bank / Wallet
                          </p>
                        </button>

                        {/* STRIPE */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("stripe")}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            paymentMethod === "stripe"
                              ? "border-indigo-500 bg-indigo-500/5"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider">
                              Stripe
                            </span>

                            <div
                              className={`w-3 h-3 rounded-full ${
                                paymentMethod === "stripe"
                                  ? "bg-indigo-500"
                                  : "bg-zinc-300"
                              }`}
                            />
                          </div>

                          <p className="text-[11px] text-zinc-500 mt-2">
                            International Cards
                          </p>
                        </button>

                        {/* PAYPAL */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paypal")}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            paymentMethod === "paypal"
                              ? "border-sky-500 bg-sky-500/5"
                              : "border-zinc-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider">
                              PayPal
                            </span>

                            <div
                              className={`w-3 h-3 rounded-full ${
                                paymentMethod === "paypal"
                                  ? "bg-sky-500"
                                  : "bg-zinc-300"
                              }`}
                            />
                          </div>

                          <p className="text-[11px] text-zinc-500 mt-2">
                            PayPal Checkout
                          </p>
                        </button>
                      </div>

                      {/* MPESA PHONE */}
                      {paymentMethod === "mpesa" && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            M-Pesa Phone Number
                          </label>

                          <input
                            type="tel"
                            value={mpesaPhone}
                            onChange={(e) =>
                              setMpesaPhone(e.target.value)
                            }
                            placeholder="2547XXXXXXXX"
                            className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm"
                          />

                          <p className="text-[11px] text-zinc-500">
                            STK push will be sent to this number.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-wider">Direct Checkout Processing</span>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10">Instant Deployment</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      By submitting this transaction, you authorize automatic secure access verification provisions on your student dashboard.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black uppercase text-xs tracking-[0.3em] font-black hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Securing Ledger...
                      </>
                    ) : (
                      `Complete Checkout • KSh ${totalAmount.toLocaleString()}`
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                    256-bit Encrypted Transaction Pipeline
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* ANIMATED SUCCESS HUB STATE */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-12 max-w-xl mx-auto text-center py-16 space-y-6 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4">
                <CheckCircleIcon className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center justify-center gap-2">
                  <SparklesIcon className="w-4 h-4" /> {paymentMethod === "mpesa"
                                                          ? "STK Push Sent"
                                                          : "Enrollment Initiated"}
                  {/* Enrollment Verified */}
                </span>
                <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tight">Welcome Aboard</h2>
              </div>

              <p className="text-zinc-500 leading-relaxed">
                {paymentMethod === "mpesa"
  ? "Complete the payment on your phone to activate access."
  : "Your enrollment checkout has been initiated successfully."}
                {/* Your transaction processed smoothly. The enrollment has been successfully verified. You have instant lifetime access to all components within <span className="text-black dark:text-white font-bold">"{course?.title}"</span>. */}
              </p>

              <button
                onClick={() => window.location.href = `/fitness/course-dashboard`}
                // /courses/${course.id}
                className="h-16 px-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all mt-6 shadow-xl"
              >
                Enter Student Space
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}