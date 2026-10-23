'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { POSSessionInfo, POSOperatorInfo } from '@/types/pos';
import { executeUnifiedPrint, detectPlatform } from '@/lib/printing/unifiedPrintClient';
import {
  buildPosReportPrintPayload,
  renderPosReportHtml,
} from '@/lib/printing/posReportRenderer';
import type { ShiftReportData } from '@/lib/pos/posReportService';
import toast from 'react-hot-toast';

interface POSShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  posSession: POSSessionInfo | null;
  operator: POSOperatorInfo | null;
  companyId: string;
  currencySymbol?: string;
  onShiftClosed: () => void;
}

export default function POSShiftModal({
  isOpen,
  onClose,
  posSession,
  operator,
  companyId,
  currencySymbol = 'KES',
  onShiftClosed,
}: POSShiftModalProps) {
  const [countedCash, setCountedCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [isPrintingX, setIsPrintingX] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-close Z-Report confirmation state
  const [closedZReport, setClosedZReport] = useState<ShiftReportData | null>(null);

  if (!isOpen || !posSession || !operator) return null;

  const openingFloat = Number(posSession.openingBalance) || 0;
  const cashSales = Number((posSession as any).cashSales) || 0;
  const expectedCash = openingFloat + cashSales;
  const enteredCash = parseFloat(countedCash) || 0;
  const variance = enteredCash - expectedCash;

  /**
   * Print Interim X-Report without ending or altering the current shift
   */
  const handlePrintXReport = async () => {
    setIsPrintingX(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sessionId: posSession.id,
        companyId,
        type: 'X_REPORT',
      });
      if (countedCash !== '') {
        params.set('countedCash', enteredCash.toString());
      }

      const res = await fetch(`/api/pos/session/report?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch X-Report data');
      }

      const reportData: ShiftReportData = json.data;
      const payload = buildPosReportPrintPayload(reportData);
      const html = renderPosReportHtml(reportData, '80mm');

      const printRes = await executeUnifiedPrint(payload, html);
      toast.success(
        `X-Report (${reportData.reportNumber}) dispatched to receipt printer (${printRes.dispatchedTo})`
      );
    } catch (err: any) {
      console.error('[X-Report Error]', err);
      toast.error(`X-Report print failed: ${err.message || err}`);
    } finally {
      setIsPrintingX(false);
    }
  };

  /**
   * Finalize Shift Closure and print Official Z-Report
   */
  const handleEndShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countedCash === '') {
      setError('Please enter the counted cash amount in the cash drawer');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/pos/session/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: posSession.id,
          companyId,
          countedCash: enteredCash,
          closingBalance: enteredCash,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'Failed to close shift');
      }

      const zReport: ShiftReportData = json.data?.report;

      // Automatically dispatch Z-Report to thermal printer
      if (zReport) {
        const payload = buildPosReportPrintPayload(zReport);
        const html = renderPosReportHtml(zReport, '80mm');
        await executeUnifiedPrint(payload, html);
        setClosedZReport(zReport);
        toast.success(`Shift closed! Z-Report (${zReport.reportNumber}) printed.`);
      } else {
        onShiftClosed();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error closing shift');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reprint Z-Report on demand
   */
  const handleReprintZReport = async () => {
    if (!closedZReport) return;
    try {
      const payload = buildPosReportPrintPayload(closedZReport);
      const html = renderPosReportHtml(closedZReport, '80mm');
      await executeUnifiedPrint(payload, html);
      toast.success(`Z-Report (${closedZReport.reportNumber}) reprinted.`);
    } catch (e: any) {
      toast.error(`Reprint error: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <BanknotesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cash Drawer & Shift Settlement
              </h3>
              <p className="text-xs text-slate-500">
                Operator: <span className="font-semibold text-slate-700 dark:text-slate-300">{operator.name}</span> | Terminal: <span className="font-mono">{posSession.terminalId || 'T01'}</span>
              </p>
            </div>
          </div>
          {!closedZReport && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* POST-CLOSURE Z-REPORT CONFIRMATION VIEW */}
        {closedZReport ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Shift Closed & Settled
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Official Z-Report: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{closedZReport.reportNumber}</span>
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-left p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Net Sales</span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {currencySymbol} {closedZReport.financials.netSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Transactions</span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {closedZReport.financials.totalTransactions} tickets
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cash Counted</span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                  {currencySymbol} {(closedZReport.drawerReconciliation.countedCash || 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Variance</span>
                <span className={`font-mono font-black text-sm ${closedZReport.drawerReconciliation.isBalanced ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {(closedZReport.drawerReconciliation.variance || 0) >= 0 ? '+' : ''}
                  {currencySymbol} {(closedZReport.drawerReconciliation.variance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleReprintZReport}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>Reprint Z-Report</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onShiftClosed();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-98"
              >
                Done (Exit POS)
              </button>
            </div>
          </div>
        ) : (
          /* SHIFT SETTLEMENT & X-REPORT FORM */
          <form onSubmit={handleEndShift} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Shift Financial Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Opening Float
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {currencySymbol} {openingFloat.toFixed(2)}
                </span>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Shift Cash Sales
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {currencySymbol} {cashSales.toFixed(2)}
                </span>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block mb-0.5">
                    Expected Cash In Drawer
                  </span>
                  <span className="text-xs text-slate-500">Opening float + Cash sales</span>
                </div>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                  {currencySymbol} {expectedCash.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Counted Cash Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                Physical Cash Counted <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Real-time Variance Badge */}
            {countedCash !== '' && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                  Math.abs(variance) < 0.01
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : variance > 0
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {Math.abs(variance) < 0.01 ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  )}
                  <span>
                    {Math.abs(variance) < 0.01
                      ? 'Drawer is Perfectly Balanced'
                      : variance > 0
                      ? 'Cash Drawer Surplus (Over)'
                      : 'Cash Drawer Shortage (Deficit)'}
                  </span>
                </div>
                <span className="font-mono text-sm font-black">
                  {variance >= 0 ? '+' : ''}
                  {currencySymbol} {variance.toFixed(2)}
                </span>
              </div>
            )}

            {/* Closing Shift Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Closing Shift Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Shift handed over smoothly, petty cash restocked..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Action Buttons with X-Report and Z-Report options */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              {/* Mid-shift X-Report Button */}
              <button
                type="button"
                onClick={handlePrintXReport}
                disabled={isPrintingX}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition flex items-center gap-2"
                title="Print interim shift audit reading without closing session"
              >
                {isPrintingX ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <PrinterIcon className="w-4 h-4 text-indigo-500" />
                )}
                <span>Print X-Report</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>{submitting ? 'Settling Shift...' : 'Close & Print Z-Report'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
