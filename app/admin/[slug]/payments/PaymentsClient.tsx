"use client";

import React, { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

type PaymentGateway = 'Stripe' | 'PayPal' | 'Bank Transfer';
type PaymentStatus = 'Success' | 'Refunded' | 'Failed';

interface Payment {
  id: string;
  clientName: string;
  amount: number;
  date: string; // YYYY-MM-DD HH:MM
  gateway: PaymentGateway;
  status: PaymentStatus;
  invoiceId: string;
}

const initialPayments: Payment[] = [
  { id: 'P1001', clientName: 'Sarah Connor', amount: 1500, date: '2025-10-20 14:30', gateway: 'Stripe', status: 'Success', invoiceId: 'I001' },
  { id: 'P1002', clientName: 'John Doe', amount: 450, date: '2025-10-18 09:15', gateway: 'PayPal', status: 'Refunded', invoiceId: 'I002' },
  { id: 'P1003', clientName: 'Alice Smith', amount: 2500, date: '2025-10-17 11:00', gateway: 'Bank Transfer', status: 'Success', invoiceId: 'I003' },
  { id: 'P1004', clientName: 'Robert Green', amount: 800, date: '2025-10-15 16:45', gateway: 'Stripe', status: 'Failed', invoiceId: 'I004' },
  { id: 'P1005', clientName: 'Jane Foster', amount: 4500, date: '2025-10-12 10:20', gateway: 'Stripe', status: 'Success', invoiceId: 'I005' },
  { id: 'P1006', clientName: 'Sarah Connor', amount: 3500, date: '2025-09-25 08:00', gateway: 'PayPal', status: 'Success', invoiceId: 'I006' },
];

const statusMap: Record<PaymentStatus, { color: string; icon: React.ElementType }> = {
  Success: { color: 'bg-green-100 text-green-700 border-green-500', icon: CheckBadgeIcon },
  Refunded: { color: 'bg-amber-100 text-amber-700 border-amber-500', icon: ExclamationTriangleIcon },
  Failed: { color: 'bg-red-100 text-red-700 border-red-500', icon: ExclamationTriangleIcon },
};

const gatewayIconMap: Record<PaymentGateway, React.ElementType> = {
  Stripe: CreditCardIcon,
  PayPal: BanknotesIcon,
  'Bank Transfer': UserCircleIcon,
};

// --- HELPER COMPONENTS ---

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const PaymentRow: React.FC<{ payment: Payment }> = ({ payment }) => {
  const { color, icon: StatusIcon } = statusMap[payment.status];
  const GatewayIcon = gatewayIconMap[payment.gateway];
  const formattedAmount = `$${payment.amount.toLocaleString()}`;

  const isRefunded = payment.status === 'Refunded';

  return (
    <div className={`grid grid-cols-6 items-center py-4 px-6 rounded-xl transition duration-200 border-2 ${isRefunded ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-gray-100 hover:shadow-md'}`}>
      
      {/* Transaction ID & Client */}
      <div className="col-span-2 flex flex-col items-start">
        <span className="text-sm font-semibold text-gray-500">{payment.id}</span>
        <span className="text-base font-bold text-indigo-600 truncate">{payment.clientName}</span>
      </div>

      {/* Amount */}
      <div className="text-left">
        <span className={`text-lg font-extrabold ${isRefunded ? 'text-red-600' : 'text-gray-900'}`}>{formattedAmount}</span>
      </div>

      {/* Date & Gateway */}
      <div className="col-span-2 text-sm text-gray-600 flex flex-col">
        <span className="flex items-center gap-1">
            <GatewayIcon className="w-4 h-4 text-gray-500"/>
            <span className="font-semibold text-gray-800">{payment.gateway}</span>
        </span>
        <span className="text-xs text-gray-500"><span className="font-semibold">Time:</span> {payment.date}</span>
      </div>
      
      {/* Status & Actions */}
      <div className="col-span-1 flex flex-col items-end sm:items-center">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
          <StatusIcon className="w-3 h-3 inline mr-1" />{payment.status}
        </span>
        <button className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            Receipt
        </button>
      </div>

    </div>
  );
};

// --- MAIN COMPONENT ---
export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [activeFilter, setActiveFilter] = useState<'All' | PaymentStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const allStatuses: ('All' | PaymentStatus)[] = ['All', 'Success', 'Refunded', 'Failed'];

  // --- Filtering and Metrics Logic ---
  const filteredPayments = useMemo(() => {
    let currentPayments = payments;

    // 1. Filter by Status
    if (activeFilter !== 'All') {
      currentPayments = currentPayments.filter(p => p.status === activeFilter);
    }

    // 2. Filter by Search Term (Client Name or ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentPayments = currentPayments.filter(
        p =>
          p.clientName.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower) ||
          p.invoiceId.toLowerCase().includes(searchLower)
      );
    }

    // Sort by Date (most recent first)
    return currentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, activeFilter, searchTerm]);


  const metrics = useMemo(() => {
    const totalProcessed = payments.reduce((sum, p) => sum + p.amount, 0);

    const successfulPayments = payments
      .filter(p => p.status === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .filter(p => p.status === 'Refunded')
      .reduce((sum, p) => sum + p.amount, 0);
      
    return {
      totalProcessed: `$${totalProcessed.toLocaleString()}`,
      successfulPayments: `$${successfulPayments.toLocaleString()}`,
      refundedCount: payments.filter(p => p.status === 'Refunded').length.toString(),
      totalRefunded: `$${totalRefunded.toLocaleString()}`,
    };
  }, [payments]);


  // --- Render Logic ---

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Title --- */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    Payment <span className="text-amber-600">Ledger</span>
                    <CurrencyDollarIcon className="w-10 h-10 text-indigo-500" />
                </h1>
                <p className="text-xl text-gray-600 font-light mt-2">
                    Real-time log of all incoming and processed client transactions.
                </p>
            </div>
            {/* Action button added here for future manual entry/reconciliation */}
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition">
                <PlusIcon className="w-5 h-5" /> Reconcile Payment
            </button>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Total Processed (YTD)"
            value={metrics.totalProcessed}
            icon={CurrencyDollarIcon}
            accent="text-indigo-600"
          />
          <MetricCard
            title="Successful Payments"
            value={metrics.successfulPayments}
            icon={CheckBadgeIcon}
            accent="text-green-600"
          />
          <MetricCard
            title="Total Refunded"
            value={metrics.totalRefunded}
            icon={ExclamationTriangleIcon}
            accent="text-red-600"
          />
          <MetricCard
            title="Refund Transactions"
            value={metrics.refundedCount}
            icon={ArrowPathIcon}
            accent="text-amber-600"
          />
        </section>

        {/* --- List View Container --- */}
        <div className="bg-white p-6 rounded-3xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-1/3">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search client, ID, or invoice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                    {allStatuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status as 'All' | PaymentStatus)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                                activeFilter === status
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment List Header (Desktop Only) */}
            <div className="hidden sm:grid grid-cols-6 items-center py-3 px-6 text-xs font-bold uppercase text-gray-500 border-b border-gray-200 mb-2">
                <span className="col-span-2">Transaction ID / Client</span>
                <span className="text-left">Amount</span>
                <span className="col-span-2">Gateway / Date & Time</span>
                <span className="text-center">Status / Actions</span>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
                {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => (
                        <PaymentRow key={payment.id} payment={payment} />
                    ))
                ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
                        <ArrowPathIcon className="w-10 h-10 mx-auto mb-3" />
                        <p>No **{activeFilter}** payments found matching your criteria.</p>
                    </div>
                )}
            </div>

        </div>
        
        {/* --- Footer Note --- */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>Data reflects transactions processed via linked gateways. Final reconciliation should be performed with your bank statements.</p>
        </footer>

      </div>
    </div>
  );
}
