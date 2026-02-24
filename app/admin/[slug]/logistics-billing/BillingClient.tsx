'use client';

import React, { useState } from 'react';
import { 
  BanknotesIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  DocumentTextIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Invoice } from './page';

export default function BillingClient({ params }: { params: { companyId: string, billingData: Invoice[] } }) {
  const [invoices] = useState<Invoice[]>(params.billingData);

  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster />
      
      {/* 1. Financial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">Q1 2026 Fiscal Period • {params.companyId}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
            <CreditCardIcon className="h-5 w-5" /> Run Payouts
          </button>
        </div>
      </div>

      {/* 2. Fiscal Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <FinanceCard 
          label="Gross Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+12.4%" 
          positive={true}
          icon={BanknotesIcon} 
        />
        <FinanceCard 
          label="Pending Receivables" 
          value={`$${pendingAmount.toLocaleString()}`} 
          trend="-2.1%" 
          positive={false}
          icon={DocumentTextIcon} 
        />
        <FinanceCard 
          label="Fuel Surcharge Total" 
          value="$8,420" 
          trend="+5.3%" 
          positive={false}
          icon={ArrowUpIcon} 
        />
      </div>

      {/* 3. Invoicing Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-black text-slate-900 uppercase">Recent Transactions</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search Invoice #" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm" />
            </div>
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Service</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-mono text-xs font-black text-slate-900 mb-1.5">{inv.invoiceNumber}</p>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800">{inv.clientName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{inv.serviceType}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-sm font-black text-slate-900">${inv.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-slate-400">Incl. Taxes</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                      View PDF
                    </button>
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

// --- Helpers ---

function FinanceCard({ label, value, trend, positive, icon: Icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-16 w-16" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg mb-1.5 ${
          positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'Paid': 'bg-emerald-50 text-emerald-600',
    'Pending': 'bg-amber-50 text-amber-600',
    'Overdue': 'bg-rose-50 text-rose-600',
    'Disputed': 'bg-slate-900 text-white',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${styles[status]}`}>
      {status}
    </span>
  );
}