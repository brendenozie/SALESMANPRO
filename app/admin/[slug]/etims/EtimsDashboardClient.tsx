'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PrinterIcon,
  ReceiptRefundIcon,
  XMarkIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  ScaleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { receiptRenderer } from '@/lib/receipts/receiptRenderer';
import { UnifiedReceiptData } from '@/lib/receipts/types';

interface EtimsDashboardClientProps {
  companyId: string;
  companyName: string;
  slug: string;
  userName: string;
}

export default function EtimsDashboardClient({
  companyId,
  companyName,
  slug,
  userName,
}: EtimsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'reconciliation' | 'device'>('invoices');

  // Invoices Log State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalInvoices: 0, confirmed: 0, confirmedAmount: 0, pending: 0, failed: 0 });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Config & Device State
  const [config, setConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Reconciliation State
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [reconLoading, setReconLoading] = useState(false);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [creditNoteTarget, setCreditNoteTarget] = useState<any>(null);
  const [creditNoteReason, setCreditNoteReason] = useState('Customer returned goods');
  const [submittingCreditNote, setSubmittingCreditNote] = useState(false);

  // Retry action state
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        page: page.toString(),
        limit: '12',
        status: statusFilter,
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      const res = await fetch(`/api/admin/etims/invoices?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setInvoices(json.data?.invoices || []);
        setSummary(json.data?.summary || {});
        setTotalPages(json.data?.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch invoices:', e);
    } finally {
      setLoading(false);
    }
  }, [companyId, page, statusFilter, searchTerm]);

  // Fetch Configuration
  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch(`/api/admin/etims/config?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setConfig(json.data?.config);
      }
    } catch (e) {
      console.error('Failed to fetch config:', e);
    } finally {
      setConfigLoading(false);
    }
  }, [companyId]);

  // Fetch Reconciliation
  const fetchReconciliation = useCallback(async () => {
    setReconLoading(true);
    try {
      const res = await fetch(`/api/admin/etims/reconciliation?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setReconciliation(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch reconciliation:', e);
    } finally {
      setReconLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchInvoices();
    fetchConfig();
  }, [fetchInvoices, fetchConfig]);

  useEffect(() => {
    if (activeTab === 'reconciliation' && !reconciliation) {
      fetchReconciliation();
    }
  }, [activeTab, reconciliation, fetchReconciliation]);

  // Retry Submission
  const handleRetry = async (invoiceId: string) => {
    setRetryingId(invoiceId);
    try {
      const res = await fetch(`/api/admin/etims/invoices/${invoiceId}/retry`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok) {
        alert('Invoice successfully confirmed by KRA eTIMS!');
        fetchInvoices();
      } else {
        alert(`Retry failed: ${json.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  // Issue Credit Note
  const handleIssueCreditNote = async () => {
    if (!creditNoteTarget) return;
    setSubmittingCreditNote(true);
    try {
      const res = await fetch(`/api/admin/etims/credit-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          originalInvoiceId: creditNoteTarget.id,
          reason: creditNoteReason,
          cashierName: userName,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        alert('eTIMS Fiscal Credit Note issued successfully!');
        setShowCreditNoteModal(false);
        setCreditNoteTarget(null);
        fetchInvoices();
      } else {
        alert(`Credit note failed: ${json.message || 'Could not issue credit note'}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    } finally {
      setSubmittingCreditNote(false);
    }
  };

  // Open Receipt Viewer Modal
  const openReceiptViewer = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowReceiptModal(true);
  };

  // Convert Invoice to UnifiedReceiptData for Printing
  const buildReceiptData = (invoice: any, isReprint = false): UnifiedReceiptData => {
    const rawItems = Array.isArray(invoice.items) ? invoice.items : [];
    const dateObj = invoice.receiptDate ? new Date(invoice.receiptDate) : new Date(invoice.createdAt);

    return {
      storeName: config?.businessName || companyName,
      storeAddress: config?.branchName || 'Nairobi, Kenya',
      trackingNumber: invoice.orderTrackingNumber || invoice.invoiceNumber,
      date: dateObj.toISOString().slice(0, 10),
      time: dateObj.toTimeString().slice(0, 8),
      cashierName: userName,
      customerName: invoice.customerName || 'Walk-in Customer',
      customerPin: invoice.customerPin || undefined,
      currency: 'KES',
      subtotal: invoice.taxableAmount || invoice.totalAmount,
      totalDiscount: 0,
      totalTax: invoice.taxAmount || 0,
      finalTotal: invoice.totalAmount,
      paymentMethod: invoice.paymentMethod || 'CASH',
      items: rawItems.map((item: any, idx: number) => ({
        id: item.itemId || `item-${idx}`,
        name: item.name || `Item ${idx + 1}`,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        subtotal: item.totalAmount || (item.unitPrice || 0) * (item.quantity || 1),
        taxTypeCode: item.taxTypeCode || 'A',
      })),
      isFiscal: true,
      kraPin: invoice.kraPin,
      branchId: invoice.branchId || config?.branchId,
      branchName: config?.branchName,
      deviceId: invoice.deviceId || config?.deviceId,
      invoiceNumber: invoice.invoiceNumber,
      originalInvoiceNumber: invoice.originalInvoiceNumber || undefined,
      invoiceType: invoice.invoiceType,
      controlCode: invoice.controlCode || undefined,
      scuId: invoice.scuId || undefined,
      internalData: invoice.internalData || undefined,
      qrCodeUrl: invoice.qrCodeUrl || undefined,
      taxBreakdown: invoice.taxBreakdown,
      isReprint,
      reprintedAt: isReprint ? new Date().toLocaleString() : undefined,
    };
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">KRA eTIMS Command Center</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {companyName} • Kenya Revenue Authority Fiscal Control Console
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/${slug}/storepos`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              Open POS Register
            </Link>
            <Link
              href={`/admin/${slug}/settings?tab=kra`}
              className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Configure eTIMS Settings
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Fiscal Invoices</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">{summary.totalInvoices}</div>
            <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
              <span>Lifetime generated fiscal records</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Confirmed by KRA</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.confirmed}</div>
            <div className="text-xs text-zinc-500 mt-2">
              KES {summary.confirmedAmount?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'} verified sales
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Pending Sync</div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{summary.pending}</div>
            <div className="text-xs text-zinc-500 mt-2">Queued for transmission</div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">Failed Submissions</div>
            <div className="text-3xl font-black text-red-600 dark:text-red-400">{summary.failed}</div>
            <div className="text-xs text-zinc-500 mt-2">Requires review or retry</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <DocumentCheckIcon className="w-4 h-4" />
            Fiscal Invoices Log
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-3 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'reconciliation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ScaleIcon className="w-4 h-4" />
            Sales Reconciliation
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`pb-3 font-bold text-sm transition flex items-center gap-2 border-b-2 ${
              activeTab === 'device'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CpuChipIcon className="w-4 h-4" />
            Device & SCU Health
          </button>
        </div>

        {/* TAB 1: FISCAL INVOICES LOG */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by invoice #, order tracking #, customer name or PIN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="p-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="QUEUED">Queued</option>
                  <option value="FAILED">Failed</option>
                </select>

                <button
                  onClick={fetchInvoices}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="Refresh Log"
                >
                  <ArrowPathIcon className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3.5">Invoice / Receipt</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Customer & PIN</th>
                      <th className="p-3.5 text-right">Taxable</th>
                      <th className="p-3.5 text-right">VAT</th>
                      <th className="p-3.5 text-right">Total (KES)</th>
                      <th className="p-3.5">Control Code</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-zinc-400 font-medium">
                          {loading ? 'Fetching fiscal invoices...' : 'No eTIMS fiscal invoices found matching criteria.'}
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-zinc-900 dark:text-white font-mono">{inv.invoiceNumber}</div>
                            <div className="text-[11px] text-zinc-500">Order: {inv.orderTrackingNumber}</div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.invoiceType === 'CREDIT_NOTE'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              {inv.invoiceType || 'ORIGINAL'}
                            </span>
                          </td>
                          <td className="p-3.5 text-zinc-600 dark:text-zinc-300">
                            {new Date(inv.receiptDate || inv.createdAt).toLocaleString('en-KE', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{inv.customerName || 'Walk-in'}</div>
                            {inv.customerPin && (
                              <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                PIN: {inv.customerPin}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-mono">{(inv.taxableAmount || 0).toFixed(2)}</td>
                          <td className="p-3.5 text-right font-mono">{(inv.taxAmount || 0).toFixed(2)}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                            {(inv.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                            {inv.controlCode || '—'}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                inv.submissionStatus === 'CONFIRMED'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : inv.submissionStatus === 'FAILED'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                              }`}
                            >
                              {inv.submissionStatus === 'CONFIRMED' && <CheckCircleIcon className="w-3 h-3" />}
                              {inv.submissionStatus === 'FAILED' && <ExclamationCircleIcon className="w-3 h-3" />}
                              {inv.submissionStatus === 'PENDING' && <ClockIcon className="w-3 h-3" />}
                              {inv.submissionStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openReceiptViewer(inv)}
                                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
                                title="View & Print Fiscal Receipt"
                              >
                                <PrinterIcon className="w-4 h-4" />
                              </button>

                              {inv.submissionStatus === 'FAILED' && (
                                <button
                                  disabled={retryingId === inv.id}
                                  onClick={() => handleRetry(inv.id)}
                                  className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-100 transition"
                                  title="Retry KRA Transmission"
                                >
                                  <ArrowPathIcon className={`w-4 h-4 ${retryingId === inv.id ? 'animate-spin' : ''}`} />
                                </button>
                              )}

                              {inv.submissionStatus === 'CONFIRMED' && inv.invoiceType !== 'CREDIT_NOTE' && (
                                <button
                                  onClick={() => {
                                    setCreditNoteTarget(inv);
                                    setShowCreditNoteModal(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 transition"
                                  title="Issue Credit Note / Refund"
                                >
                                  <ReceiptRefundIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RECONCILIATION */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Store Sales vs eTIMS Reconciliation</h3>
                  <p className="text-xs text-zinc-500">Authoritative audit comparing completed commerce orders with confirmed KRA fiscal tax invoices.</p>
                </div>
                <button
                  onClick={fetchReconciliation}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${reconLoading ? 'animate-spin' : ''}`} />
                  Re-audit Sales
                </button>
              </div>

              {reconciliation ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="text-xs font-bold text-zinc-400 uppercase">Total Completed Orders</div>
                      <div className="text-2xl font-black mt-1">{reconciliation.totalOrdersCount}</div>
                      <div className="text-xs text-zinc-500 mt-1">KES {reconciliation.totalOrdersValue?.toFixed(2)}</div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Confirmed eTIMS Invoices</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{reconciliation.etimsConfirmedCount}</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">KES {reconciliation.etimsConfirmedValue?.toFixed(2)}</div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <div className="text-xs font-bold text-zinc-400 uppercase">Reconciliation Status</div>
                      <div className={`text-xl font-black mt-1 ${reconciliation.varianceAmount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {reconciliation.varianceAmount === 0 ? '100% Fully Balanced' : `Variance: KES ${reconciliation.varianceAmount?.toFixed(2)}`}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {reconciliation.varianceAmount === 0 ? 'All qualifying sales fiscalized' : 'Legitimate non-eTIMS sales or pending sync'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <strong>Audit Guarantee:</strong> SalesmanPro never performs non-compliant omissions. Discrepancies between total orders and eTIMS records occur strictly when transactions occurred prior to eTIMS registration, during approved offline buffering, or for exempted non-VAT items.
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-400 font-medium">Running reconciliation audit...</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEVICE & SCU HEALTH */}
        {activeTab === 'device' && (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Active Device & SCU Profile</h3>
              <p className="text-xs text-zinc-500">Technical details of your assigned KRA Sales Control Unit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">Taxpayer PIN</span>
                  <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">{config?.kraPin || 'Not configured'}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">Registered Name</span>
                  <span className="text-sm font-semibold">{config?.taxpayerName || companyName}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">Branch</span>
                  <span className="text-sm font-semibold">{config?.branchId || '00'} — {config?.branchName || 'Head Office'}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">SCU / Device Serial</span>
                  <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">{config?.deviceId || 'Not assigned'}</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">Integration Mode</span>
                  <span className="text-sm font-semibold">{config?.integrationMode || 'OSCU'} ({config?.environment || 'sandbox'})</span>
                </div>
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-bold block">Security Status</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {config?.hasCmcKey ? '✓ CMC Key Valid (AES-256 Encrypted)' : '⚠ Key Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: FISCAL RECEIPT VIEWER */}
      {showReceiptModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  KRA eTIMS Fiscal Receipt Preview
                </h3>
                <p className="text-xs text-zinc-500">Invoice #{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Receipt Body */}
            <div className="flex-1 overflow-y-auto my-4 p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl flex justify-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: receiptRenderer.renderHtml(buildReceiptData(selectedInvoice, false), 'ETIMS'),
                }}
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const reprintData = buildReceiptData(selectedInvoice, true);
                  const reprintHtml = receiptRenderer.renderHtml(reprintData, 'ETIMS');
                  const reprintEscPos = receiptRenderer.renderEscPos(reprintData, 'ETIMS');
                  receiptRenderer.printReceipt(reprintHtml, reprintEscPos);
                }}
                className="flex-1 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-4 h-4" />
                Reprint Fiscal Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-3 px-5 border border-zinc-300 dark:border-zinc-700 rounded-xl font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE CREDIT NOTE */}
      {showCreditNoteModal && creditNoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <ReceiptRefundIcon className="w-5 h-5 text-rose-600" />
                Issue eTIMS Credit Note
              </h3>
              <button
                onClick={() => setShowCreditNoteModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
              <div>
                <span className="text-zinc-400">Original Invoice:</span>{' '}
                <strong className="font-mono">{creditNoteTarget.invoiceNumber}</strong>
              </div>
              <div>
                <span className="text-zinc-400">Original Total:</span>{' '}
                <strong>KES {creditNoteTarget.totalAmount?.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-zinc-400">Customer:</span>{' '}
                <strong>{creditNoteTarget.customerName || 'Walk-in'}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Statutory Reason for Credit Note
              </label>
              <select
                value={creditNoteReason}
                onChange={(e) => setCreditNoteReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold"
              >
                <option value="Customer returned goods">Customer returned goods (Full Return)</option>
                <option value="Defective merchandise">Defective or damaged merchandise</option>
                <option value="Invoice error / Price adjustment">Invoice error / Price adjustment</option>
                <option value="Order cancelled by buyer">Order cancelled by buyer</option>
              </select>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreditNoteModal(false)}
                className="flex-1 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingCreditNote}
                onClick={handleIssueCreditNote}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {submittingCreditNote ? 'Issuing to KRA...' : 'Transmit Credit Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
