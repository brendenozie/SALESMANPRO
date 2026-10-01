'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { ExtractedDocumentData, DocumentActionDraft } from '@/lib/ai/mascot/documentTypes';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extracted: ExtractedDocumentData;
  suggestedAction: DocumentActionDraft;
  previewUrl?: string;
  companyId: string;
  storeSlug?: string;
  onSuccess: (result: any) => void;
}

const EXPENSE_CATEGORIES = [
  'Operations',
  'Supplies',
  'Utilities',
  'Fuel',
  'Rent',
  'Marketing',
  'Salaries',
  'Maintenance',
  'General',
];

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  isOpen,
  onClose,
  extracted,
  suggestedAction,
  previewUrl,
  companyId,
  storeSlug,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    expenseId: suggestedAction.proposedRecord.expenseId || extracted.documentNumber || '',
    vendor: suggestedAction.proposedRecord.vendor || extracted.supplierOrCustomer || '',
    amount: suggestedAction.proposedRecord.amount || extracted.total || 0,
    taxAmount: suggestedAction.proposedRecord.taxAmount || extracted.taxes || 0,
    category: suggestedAction.proposedRecord.category || extracted.category || 'Operations',
    description: suggestedAction.proposedRecord.description || '',
    date: suggestedAction.proposedRecord.date || extracted.documentDate || '',
    paymentMethod: suggestedAction.proposedRecord.paymentMethod || 'CASH',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Real-time arithmetic check
  const calculatedTotal = Number(form.amount) || 0;
  const calculatedTax = Number(form.taxAmount) || 0;
  const isArithmeticClean = calculatedTotal >= calculatedTax;

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/mascot/documents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: suggestedAction.actionType,
          companyId,
          proposedRecord: {
            ...suggestedAction.proposedRecord,
            ...form,
            amount: Number(form.amount),
            taxAmount: Number(form.taxAmount),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data);
        onClose();
      } else {
        alert(data.error || 'Failed to record document');
      }
    } catch (err: any) {
      alert(err?.message || 'Execution error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Document Intelligence Review
              </h2>
              <p className="text-xs text-slate-500">
                Verify extracted values before booking into your store ledger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Side-by-Side Review */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left: Document Preview */}
          <div className="p-6 flex flex-col items-center justify-center bg-slate-100/60 dark:bg-slate-950/40 overflow-hidden">
            {previewUrl ? (
              <div className="relative max-h-[460px] w-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner">
                {previewUrl.startsWith('data:image') || previewUrl.startsWith('http') ? (
                  <img
                    src={previewUrl}
                    alt="Uploaded Document"
                    className="max-h-[440px] w-auto object-contain rounded-xl p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <DocumentTextIcon className="w-16 h-16 mb-2" />
                    <span className="text-xs">PDF Document Preview</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center">
                <DocumentTextIcon className="w-16 h-16 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                  {extracted.documentType.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Document processed via SalesmanPro OCR Pipeline
                </p>
              </div>
            )}

            {/* Confidence Badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Extraction Confidence:</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {Math.round(extracted.confidence * 100)}% Verified
              </span>
            </div>
          </div>

          {/* Right: Extracted Fields & Controls */}
          <div className="p-6 space-y-4">
            {/* Duplicate Alert Banner */}
            {suggestedAction.duplicateWarning?.isDuplicate && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Possible Duplicate Detected!</div>
                    <div className="mt-0.5 text-amber-800 dark:text-amber-300">
                      {suggestedAction.duplicateWarning.matchReason}
                    </div>
                    {suggestedAction.duplicateWarning.existingRecordUrl && (
                      <a
                        href={suggestedAction.duplicateWarning.existingRecordUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold underline text-amber-900 dark:text-amber-100 mt-1.5"
                      >
                        <span>View existing record</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Arithmetic Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200/80 dark:border-slate-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Arithmetic: KES {(calculatedTotal - calculatedTax).toLocaleString()} Net + KES {calculatedTax.toLocaleString()} Tax = KES {calculatedTotal.toLocaleString()} Total
              </span>
            </div>

            {/* Fields Form */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Voucher / Receipt ID
                </label>
                <input
                  type="text"
                  value={form.expenseId}
                  onChange={(e) => setForm({ ...form, expenseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vendor / Supplier
                </label>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Amount (KES)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tax / VAT (KES)
                </label>
                <input
                  type="number"
                  value={form.taxAmount}
                  onChange={(e) => setForm({ ...form, taxAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Discard
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Approve & Book Expense</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
