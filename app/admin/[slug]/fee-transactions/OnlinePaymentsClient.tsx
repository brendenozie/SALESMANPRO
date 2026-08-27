"use client";

import React, { useState } from "react";
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  BanknotesIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ArrowRightIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";

const OnlinePaymentsClient = () => {
  const [paymentStep, setPaymentStep] = useState("selection"); // selection, checkout, success

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout Portal</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Payments.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800">
             <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
             <span className="text-[10px] font-black uppercase text-slate-400">PCI-DSS Level 1 Encrypted</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Invoice Selection / Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
              <h3 className="text-sm font-black uppercase text-white tracking-widest mb-6">Outstanding Invoices</h3>
              
              <div className="space-y-4">
                 {[
                   { id: 'INV-9901', desc: 'Tuition Fee - Q1', amount: 3200, due: 'Jan 30' },
                   { id: 'INV-9905', desc: 'Science Lab Material', amount: 450, due: 'Feb 05' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-black/40 border border-slate-800 rounded-2xl group hover:border-indigo-500/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="h-5 w-5 rounded border-2 border-slate-700 group-hover:border-indigo-500 flex items-center justify-center">
                            <div className="h-2 w-2 bg-indigo-500 rounded-sm opacity-0 group-hover:opacity-100" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{item.desc}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{item.id} • Due {item.due}</p>
                         </div>
                      </div>
                      <p className="text-lg font-black text-white">${item.amount}</p>
                   </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center">
                 <p className="text-xs font-bold text-slate-400">Total Selected Amount</p>
                 <p className="text-3xl font-black text-white tracking-tight">$3,650.00</p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-4 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem]">
               <LockClosedIcon className="h-8 w-8 text-indigo-400" />
               <p className="text-xs text-slate-400 leading-relaxed">
                 Your payment information is handled directly by our secure banking partner. 
                 <span className="text-white font-bold"> The school never stores your credit card details.</span>
               </p>
            </div>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 h-fit sticky top-8">
             <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8 text-center">Checkout Method</h3>
             
             <div className="space-y-3 mb-8">
                <button className="w-full flex items-center justify-between p-4 bg-white text-black rounded-2xl font-bold transition-transform active:scale-95">
                   <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-5 w-5" />
                      <span className="text-xs">Credit / Debit Card</span>
                   </div>
                   <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                   <div className="flex items-center gap-3">
                      <GlobeAltIcon className="h-5 w-5" />
                      <span className="text-xs">Net Banking</span>
                   </div>
                   <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                   <div className="flex items-center gap-3">
                      <BanknotesIcon className="h-5 w-5" />
                      <span className="text-xs">Wallet / UPI</span>
                   </div>
                   <ArrowRightIcon className="h-4 w-4" />
                </button>
             </div>

             <div className="bg-black/60 rounded-2xl p-6 border border-slate-800 mb-8">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                   <span>Convenience Fee</span>
                   <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                   <span>Tax (GST/VAT)</span>
                   <span className="text-white">Included</span>
                </div>
             </div>

             <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 transition-all text-xs">
                Complete Payment
             </button>

             <div className="mt-6 flex justify-center items-center gap-2">
                <DocumentCheckIcon className="h-4 w-4 text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600 uppercase italic">Instant Receipt on Completion</span>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default OnlinePaymentsClient;