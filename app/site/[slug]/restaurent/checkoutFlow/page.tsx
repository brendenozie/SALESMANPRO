"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDaysIcon, 
  TruckIcon, 
  CreditCardIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  MapPinIcon
} from "@heroicons/react/24/solid";

export default function RestaurantCheckoutFlow() {
  const [checkoutType, setCheckoutType] = useState<"delivery" | "reservation">("delivery");
  const [step, setStep] = useState(1);

  const cartItems = [
    { name: "Swahili Fusion Platter", price: 2450, qty: 1 },
    { name: "Saffron Infused Pilau", price: 1200, qty: 2 },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-stone-100 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* LEFT COLUMN: THE FLOW */}
        <div className="lg:col-span-8">
          <header className="mb-16">
            <h1 className="text-6xl font-black italic tracking-tighter mb-4 uppercase">Complete Your <br /> <span className="text-orange-500">Experience.</span></h1>
            <div className="flex gap-4 p-2 bg-stone-900/50 rounded-2xl w-fit border border-white/5">
              <button 
                onClick={() => setCheckoutType("delivery")}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${checkoutType === "delivery" ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/20' : 'text-stone-500 hover:text-white'}`}
              >
                <TruckIcon className="w-4 h-4" /> Delivery
              </button>
              <button 
                onClick={() => setCheckoutType("reservation")}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${checkoutType === "reservation" ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/20' : 'text-stone-500 hover:text-white'}`}
              >
                <CalendarDaysIcon className="w-4 h-4" /> Reservation
              </button>
            </div>
          </header>

          <div className="space-y-6">
            {/* STEP 1: LOGISTICS */}
            <CheckoutStep 
              num="01" 
              title={checkoutType === "delivery" ? "Delivery Details" : "Table Details"} 
              isActive={step === 1}
              isDone={step > 1}
              onEdit={() => setStep(1)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {checkoutType === "delivery" ? (
                  <>
                    <InputGroup label="Drop-off Address" placeholder="Street, Apartment, Nairobi" icon={<MapPinIcon className="w-4 h-4" />} />
                    <InputGroup label="Phone Number" placeholder="+254 7XX XXX XXX" />
                  </>
                ) : (
                  <>
                    <InputGroup label="Date & Time" placeholder="Friday, 27 March @ 19:30" icon={<CalendarDaysIcon className="w-4 h-4" />} />
                    <InputGroup label="Guests" placeholder="4 People" icon={<UserGroupIcon className="w-4 h-4" />} />
                  </>
                )}
                <button 
                  onClick={() => setStep(2)}
                  className="md:col-span-2 py-6 bg-white text-stone-950 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-500 hover:text-white transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            </CheckoutStep>

            {/* STEP 2: PAYMENT */}
            <CheckoutStep 
              num="02" 
              title="Secure Payment" 
              isActive={step === 2}
              isDone={step > 2}
              onEdit={() => setStep(2)}
            >
              <div className="pt-8 space-y-4">
                <div className="p-6 rounded-2xl border-2 border-orange-500/50 bg-orange-500/5 flex items-center justify-between group cursor-pointer">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                         <span className="text-stone-950 font-black text-xs tracking-tighter">M-PESA</span>
                      </div>
                      <p className="font-bold">Lipa Na M-Pesa</p>
                   </div>
                   <CheckCircleIcon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                   <div className="flex items-center gap-4 opacity-50">
                      <CreditCardIcon className="w-12 h-12 p-2" />
                      <p className="font-bold">Credit / Debit Card</p>
                   </div>
                   <ChevronRightIcon className="w-4 h-4 text-stone-600" />
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-6 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-stone-950 transition-all shadow-2xl shadow-orange-900/40"
                >
                  {checkoutType === "delivery" ? "Place Order" : "Confirm Reservation"}
                </button>
              </div>
            </CheckoutStep>
          </div>
        </div>

        {/* RIGHT COLUMN: THE TICKET */}
        <div className="lg:col-span-4 sticky top-32">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative"
          >
             <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />
             <div className="flex items-center gap-3 mb-10">
                <ShoppingBagIcon className="w-6 h-6 text-stone-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Your Selection</span>
             </div>

             <div className="space-y-8 mb-12">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                     <div>
                        <p className="font-bold tracking-tight italic text-lg">{item.name}</p>
                        <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Qty: {item.qty}</p>
                     </div>
                     <p className="font-mono text-sm">{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
             </div>

             <div className="space-y-4 pt-8 border-t border-white/5 font-bold">
                <div className="flex justify-between text-stone-500 text-xs uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span className="font-mono">{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-xs uppercase tracking-widest">
                   <span>Service & Tax</span>
                   <span className="font-mono">350</span>
                </div>
                <div className="flex justify-between text-2xl tracking-tighter mt-6">
                   <span className="italic font-serif">Total</span>
                   <span className="text-orange-500">KES {(subtotal + 350).toLocaleString()}</span>
                </div>
             </div>

             <div className="mt-12 bg-white/5 p-6 rounded-2xl flex items-center gap-4 italic text-xs text-stone-400">
                <SparklesIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                "Your meal is being prioritized by our head chef."
             </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

/* --- HELPERS --- */

function CheckoutStep({ num, title, children, isActive, isDone, onEdit }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${isActive ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-40'}`}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <span className={`text-xs font-mono font-black ${isDone ? 'text-orange-500' : 'text-stone-700'}`}>{num}</span>
            <h3 className={`text-2xl font-bold tracking-tight ${isDone ? 'line-through text-stone-600' : ''}`}>{title}</h3>
         </div>
         {isDone && (
           <button onClick={onEdit} className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-white">Edit</button>
         )}
      </div>
      <AnimatePresence>
        {isActive && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
             {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, placeholder, icon }: any) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-500">{icon}</div>}
        <input 
          type="text" 
          placeholder={placeholder}
          className={`w-full bg-stone-900 border border-white/5 rounded-2xl py-6 ${icon ? 'pl-14' : 'px-8'} text-white focus:border-orange-500 focus:ring-0 transition-all placeholder:text-stone-700 font-bold`}
        />
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12 2l2.4 7.6H22l-6.2 4.8L18.2 22 12 17.2 5.8 22l2.4-7.6L2 9.6h7.6L12 2z" /></svg>
  );
}