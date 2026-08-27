'use client';

import { 
  ArrowDownCircleIcon, ArrowUpIcon, CalendarDateRangeIcon, 
  CheckCircleIcon, ClockIcon, CurrencyDollarIcon, 
  MagnifyingGlassCircleIcon 
} from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function SubscriptionPaymentsClient({ paymentsData }: { paymentsData: any[] }) {
  const [subscriptions, setSubscriptions] = useState(paymentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Combined Filtering Logic
  const filteredData = useMemo(() => {
    return subscriptions.filter(sub => {
      const date = new Date(sub.createdAt).toISOString().split('T')[0];
      const searchStr = searchTerm.toLowerCase();
      
      const matchesSearch = 
        sub.company?.name?.toLowerCase().includes(searchStr) ||
        sub.user?.email?.toLowerCase().includes(searchStr) ||
        sub.payments?.[0]?.gatewayRef?.toLowerCase().includes(searchStr);

      const matchesDate = (!startDate || date >= startDate) && (!endDate || date <= endDate);
      
      return matchesSearch && matchesDate;
    });
  }, [subscriptions, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const active = filteredData.filter(s => s.status === 'ACTIVE');
    return {
      revenue: active.reduce((sum, s) => sum + s.amountPaid, 0),
      count: active.length,
      pending: filteredData.filter(s => s.status === 'AWAITING_CONFIRMATION').length,
      currency: "KES"
    };
  }, [filteredData]);

  const handleApprove = async (subId: string) => {
    const toastId = toast.loading("Activating subscription...");
    try {
      const res = await fetch(`/api/admin/subscriptions-payments/${subId}/approve`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to approve");

      setSubscriptions(prev => prev.map(s => 
        s.id === subId ? { ...s, status: "ACTIVE" } : s
      ));
      toast.success("Subscription Active!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // 1. Add this function alongside handleApprove
const handleReject = async (subId: string) => {
  const reason = prompt("Enter reason for rejection (optional):");
  if (reason === null) return; // User cancelled prompt

  const toastId = toast.loading("Rejecting transaction...");
  try {
    const res = await fetch(`/api/admin/subscriptions-payments/${subId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to reject");

    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, status: "CANCELLED" } : s
    ));
    toast.success("Transaction Rejected", { id: toastId });
  } catch (err: any) {
    toast.error(err.message, { id: toastId });
  }
};



  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <Toaster position="top-center" />

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Collections</p>
          <h2 className="text-4xl font-black text-slate-800">
            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(stats.revenue)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <h2 className="text-4xl font-black text-slate-800">{stats.count}</h2>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200">
          <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">Pending Verification</p>
          <h2 className="text-4xl font-black text-white">{stats.pending}</h2>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Company, Email, or M-Pesa Ref..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
          <CalendarDateRangeIcon className="h-5 w-5 text-slate-400" />
          <input type="date" className="bg-transparent text-sm font-semibold outline-none" onChange={e => setStartDate(e.target.value)} />
          <span className="text-slate-300">→</span>
          <input type="date" className="bg-transparent text-sm font-semibold outline-none" onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
              <th className="px-8 py-5">Company & Plan</th>
              <th className="px-8 py-5">Payment Info</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map(sub => (
              <tr key={sub.id} className="group hover:bg-indigo-50/30 transition-all">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      {sub.company?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{sub.company?.name}</p>
                      <p className="text-xs text-slate-400 uppercase font-bold">{sub.plan?.name} • {sub.billingCycle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-mono font-black text-slate-700">{sub.amountPaid} KES</p>
                  <p className="text-xs text-indigo-500 font-bold">Ref: {sub.payments?.[0]?.gatewayRef || 'N/A'}</p>
                  <p className="text-[10px] text-slate-400">Phone: {sub.meta?.phone}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {sub.status === 'AWAITING_CONFIRMATION' ? 'Pending M-Pesa' : sub.status}
                  </span>
                </td>
                {/* // 2. Update the Action Column in your Table */}
                <td className="px-8 py-6 text-right">
                  {sub.status === "AWAITING_CONFIRMATION" ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(sub.id)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition shadow-lg"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(sub.id)}
                        className="px-4 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-50 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-6 ${
                      sub.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-300'
                    }`}>
                      {sub.status === 'ACTIVE' ? 'Verified' : 'Processed'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}