'use client';

import { ArrowDownCircleIcon, ArrowUpIcon, CalendarDateRangeIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function SubscriptionPaymentsClient({ paymentsData }: { paymentsData: any[] }) {
  const [payments, setPayments] = useState(paymentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtering Logic
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const paymentDate = new Date(p.createdAt).toISOString().split('T')[0];
      const matchesSearch = 
        p.subscription.plan.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || paymentDate >= startDate) && (!endDate || paymentDate <= endDate);
      return matchesSearch && matchesDate;
    });
  }, [payments, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const successful = filteredPayments.filter(p => p.status === 'SUCCESS');
    return {
      revenue: successful.reduce((sum, p) => sum + p.amount, 0),
      count: successful.length,
      pending: filteredPayments.filter(p => p.status === 'PENDING').length,
      currency: payments[0]?.currency || 'USD'
    };
  }, [filteredPayments]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <Toaster position="top-center" />

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Revenue Intelligence
          </h1>
          <p className="text-slate-500 font-medium">Monitor and manage global subscriptions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition shadow-sm">
            <ArrowDownCircleIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-600 text-6xl"><CurrencyDollarIcon className="w-6 h-6" /></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-800">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: stats.currency }).format(stats.revenue)}
            </h2>
            <span className="text-emerald-500 font-bold text-sm flex items-center"><ArrowUpIcon className="w-4 h-4" /> +12%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.count}</h2>
          <p className="text-xs text-slate-400 mt-2 font-medium italic">Validated transactions in period</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 transition-transform hover:scale-[1.02]">
          <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Needs Review</p>
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-white">{stats.pending}</h2>
            <div className="h-2 flex-1 bg-indigo-400 rounded-full overflow-hidden">
               <div className="h-full bg-white w-1/3 shadow-[0_0_10px_white]"></div>
            </div>
          </div>
          <p className="text-xs text-indigo-100 mt-2 font-medium">Action required for payment activation</p>
        </div>
      </div>

      {/* --- Advanced Toolbar --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[280px]">
          <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search company, plan or user..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <div className="flex items-center px-3 text-slate-500 gap-2"><CalendarDateRangeIcon className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Range</span></div>
          <input type="date" className="bg-transparent text-sm font-semibold outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span className="text-slate-300">→</span>
          <input type="date" className="bg-transparent text-sm font-semibold outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* --- Data List --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Corporate Entity</th>
                <th className="px-8 py-5">Transaction Detail</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-400 text-lg group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white transition-all">
                        {payment.subscription.plan.company?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{payment.subscription.plan.company?.name || 'Unknown Company'}</p>
                        <p className="text-xs text-slate-400 font-medium">{payment.subscription.plan.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xl font-mono font-black text-slate-700">
                        {payment.amount} <span className="text-sm font-normal text-slate-400">{payment.currency}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {payment.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold ring-1 ring-emerald-100">
                        <CheckCircleIcon className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold ring-1 ring-amber-100">
                        <ClockIcon className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {payment.status === "PENDING" ? (
                      <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition shadow-lg shadow-slate-200 hover:shadow-indigo-200">
                        Approve Fund
                      </button>
                    ) : (
                      <button className="px-4 py-2 text-slate-300 text-xs font-bold cursor-not-allowed">
                        Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}