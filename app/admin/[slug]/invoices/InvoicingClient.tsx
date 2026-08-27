"use client";

import React, { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

interface Invoice {
  id: string;
  clientName: string;
  dateIssued: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  amount: number;
  status: InvoiceStatus;
  serviceDescription: string;
}

const initialInvoices: Invoice[] = [
  { id: 'I001', clientName: 'Sarah Connor', dateIssued: '2025-10-01', dueDate: '2025-10-31', amount: 3500, status: 'Paid', serviceDescription: 'Q4 Consulting Retainer' },
  { id: 'I002', clientName: 'John Doe', dateIssued: '2025-09-15', dueDate: '2025-10-15', amount: 1200, status: 'Overdue', serviceDescription: 'Initial Strategy Workshop' },
  { id: 'I003', clientName: 'Alice Smith', dateIssued: '2025-10-20', dueDate: '2025-11-20', amount: 2500, status: 'Pending', serviceDescription: 'Monthly Coaching Fee' },
  { id: 'I004', clientName: 'Robert Green', dateIssued: '2025-11-01', dueDate: '2025-12-01', amount: 800, status: 'Draft', serviceDescription: 'Project Kick-off Deposit' },
  { id: 'I005', clientName: 'Jane Foster', dateIssued: '2025-10-10', dueDate: '2025-11-10', amount: 4500, status: 'Pending', serviceDescription: 'Six-Month Program Fee' },
];

const statusMap: Record<InvoiceStatus, { color: string; icon: React.ElementType }> = {
  Paid: { color: 'bg-green-100 text-green-700 border-green-500', icon: CheckCircleIcon },
  Pending: { color: 'bg-amber-100 text-amber-700 border-amber-500', icon: ClockIcon },
  Overdue: { color: 'bg-red-100 text-red-700 border-red-500', icon: ExclamationCircleIcon },
  Draft: { color: 'bg-gray-100 text-gray-700 border-gray-500', icon: ClipboardDocumentListIcon },
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

const InvoiceRow: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const { color, icon: StatusIcon } = statusMap[invoice.status];
  const formattedAmount = `$${invoice.amount.toLocaleString()}`;

  // Check if overdue
  const isOverdue = invoice.status === 'Overdue';

  return (
    <div className={`grid grid-cols-6 items-center py-4 px-6 rounded-xl transition duration-200 border-2 ${isOverdue ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-white border-gray-100 hover:shadow-md'}`}>
      
      {/* Client & ID */}
      <div className="col-span-2 flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
        <span className="text-sm font-semibold text-gray-500 hidden sm:inline">{invoice.id}</span>
        <span className="text-base font-bold text-indigo-600 truncate">{invoice.clientName}</span>
      </div>

      {/* Amount */}
      <div className="text-right sm:text-left">
        <span className="text-lg font-extrabold text-gray-900">{formattedAmount}</span>
      </div>

      {/* Dates (Mobile Stacked) */}
      <div className="col-span-2 text-sm text-gray-600 flex flex-col">
        <span><span className="font-semibold text-gray-800">Due:</span> {invoice.dueDate}</span>
        <span className="text-xs text-gray-500"><span className="font-semibold">Issued:</span> {invoice.dateIssued}</span>
      </div>
      
      {/* Status & Actions */}
      <div className="col-span-1 flex flex-col items-end sm:items-center">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
          <StatusIcon className="w-3 h-3 inline mr-1" />{invoice.status}
        </span>
        <button className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            View Details
        </button>
      </div>

    </div>
  );
};

// --- MAIN COMPONENT ---
export default function InvoicingClient() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activeFilter, setActiveFilter] = useState<'All' | InvoiceStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const allStatuses: ('All' | InvoiceStatus)[] = ['All', 'Pending', 'Overdue', 'Paid', 'Draft'];

  // --- Filtering and Metrics Logic ---
  const filteredInvoices = useMemo(() => {
    let currentInvoices = invoices;

    // 1. Filter by Status
    if (activeFilter !== 'All') {
      currentInvoices = currentInvoices.filter(inv => inv.status === activeFilter);
    }

    // 2. Filter by Search Term (Client Name or ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentInvoices = currentInvoices.filter(
        inv =>
          inv.clientName.toLowerCase().includes(searchLower) ||
          inv.id.toLowerCase().includes(searchLower)
      );
    }

    // Sort by Due Date (Pending/Overdue first)
    return currentInvoices.sort((a, b) => {
        if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
        if (b.status === 'Overdue' && a.status !== 'Overdue') return 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [invoices, activeFilter, searchTerm]);


  const metrics = useMemo(() => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'Pending')
      .reduce((sum, inv) => sum + inv.amount, 0);

    const overdueCount = invoices
      .filter(inv => inv.status === 'Overdue')
      .length;
      
    return {
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      pendingAmount: `$${pendingAmount.toLocaleString()}`,
      overdueCount,
    };
  }, [invoices]);


  // --- Render Logic ---

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Title --- */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    Invoicing & <span className="text-amber-600">Billing</span>
                    <ReceiptPercentIcon className="w-10 h-10 text-indigo-500" />
                </h1>
                <p className="text-xl text-gray-600 font-light mt-2">
                    Track cash flow, manage invoice statuses, and keep books organized.
                </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition">
                <PlusIcon className="w-5 h-5" /> Create New Invoice
            </button>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard
            title="Total Revenue (YTD)"
            value={metrics.totalRevenue}
            icon={CurrencyDollarIcon}
            accent="text-green-600"
          />
          <MetricCard
            title="Pending Payments"
            value={metrics.pendingAmount}
            icon={ClockIcon}
            accent="text-amber-600"
          />
          <MetricCard
            title="Overdue Invoices"
            value={metrics.overdueCount.toString()}
            icon={ExclamationCircleIcon}
            accent="text-red-600"
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
                        placeholder="Search by client name or ID..."
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
                            onClick={() => setActiveFilter(status as 'All' | InvoiceStatus)}
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

            {/* Invoice List Header (Desktop Only) */}
            <div className="hidden sm:grid grid-cols-6 items-center py-3 px-6 text-xs font-bold uppercase text-gray-500 border-b border-gray-200 mb-2">
                <span className="col-span-2">Client / Invoice ID</span>
                <span className="text-left">Amount</span>
                <span className="col-span-2">Due Date / Issued Date</span>
                <span className="text-center">Status / Actions</span>
            </div>

            {/* Invoice List */}
            <div className="space-y-3">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(invoice => (
                        <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))
                ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
                        <ArrowPathIcon className="w-10 h-10 mx-auto mb-3" />
                        <p>No **{activeFilter}** invoices found matching your criteria.</p>
                    </div>
                )}
            </div>

        </div>
        
        {/* --- Footer Note --- */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>Financial data is for tracking purposes only. Please refer to your primary accounting software for official records.</p>
        </footer>

      </div>
    </div>
  );
}
