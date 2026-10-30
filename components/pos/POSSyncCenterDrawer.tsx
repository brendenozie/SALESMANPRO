'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  CubeIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  ClockIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  getOfflineSyncOverview,
  retryOfflinePrintJob,
  enqueueOfflineExpense,
  enqueueOfflineInventoryMovement,
  exportSyncDiagnosticsBundle,
  type OfflineSyncOverview,
} from '@/lib/pos/offlineStore';

interface POSSyncCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  storeId?: string;
  companyName?: string;
  isOnline: boolean;
  isSyncing: boolean;
  onTriggerSync: () => Promise<void> | void;
  currencySymbol?: string;
}

export default function POSSyncCenterDrawer({
  isOpen,
  onClose,
  companyId,
  storeId,
  companyName,
  isOnline,
  isSyncing,
  onTriggerSync,
  currencySymbol = 'KES',
}: POSSyncCenterDrawerProps) {
  const [overview, setOverview] = useState<OfflineSyncOverview | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OUTBOX' | 'PRINT_QUEUE' | 'QUICK_ACTIONS'>('OVERVIEW');
  const [loading, setLoading] = useState(false);
  const [reprintingJobId, setReprintingJobId] = useState<string | null>(null);

  // Quick Offline Expense Form State
  const [expCategory, setExpCategory] = useState('Operations');
  const [expDesc, setExpDesc] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  // Quick Offline Stock Movement Form State
  const [movListingId, setMovListingId] = useState('');
  const [movProductName, setMovProductName] = useState('');
  const [movDelta, setMovDelta] = useState('');
  const [movType, setMovType] = useState<'RESTOCK' | 'DAMAGE_WRITE_OFF' | 'STOCK_ADJUSTMENT'>('DAMAGE_WRITE_OFF');
  const [movReason, setMovReason] = useState('');
  const [savingMovement, setSavingMovement] = useState(false);

  const refreshOverview = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await getOfflineSyncOverview(companyId, storeId);
      setOverview(data);
    } catch (e) {
      console.warn('[SyncCenter] Failed to load overview:', e);
    } finally {
      setLoading(false);
    }
  }, [companyId, storeId]);

  useEffect(() => {
    if (isOpen) {
      refreshOverview();
    }
  }, [isOpen, refreshOverview, isSyncing, isOnline]);

  if (!isOpen) return null;

  const handleRetrySync = async () => {
    await onTriggerSync();
    await refreshOverview();
  };

  const handleReprintJob = async (jobId: string) => {
    setReprintingJobId(jobId);
    try {
      const res = await retryOfflinePrintJob(jobId);
      if (res.success) {
        toast.success('Receipt sent to printer (marked as REPRINT)');
      } else {
        toast.error(res.error || 'Printer could not complete job');
      }
      await refreshOverview();
    } finally {
      setReprintingJobId(null);
    }
  };

  const handleExportDiagnostics = async () => {
    try {
      const jsonStr = await exportSyncDiagnosticsBundle(companyId, storeId);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salesmanpro-sync-diagnostics-${overview?.deviceId || 'pos'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Diagnostic bundle exported');
    } catch {
      toast.error('Failed to export diagnostic bundle');
    }
  };

  const handleRecordOfflineExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!expDesc.trim() || Number.isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid expense description and amount');
      return;
    }
    setSavingExpense(true);
    try {
      await enqueueOfflineExpense({
        companyId,
        storeId,
        category: expCategory,
        description: expDesc.trim(),
        vendor: expVendor.trim() || 'Walk-in Vendor',
        amount: amt,
        paymentMethod: 'CASH',
      });
      toast.success('Expense saved locally & queued for cloud sync');
      setExpDesc('');
      setExpVendor('');
      setExpAmount('');
      await refreshOverview();
      if (isOnline) {
        await onTriggerSync();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record offline expense');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleRecordStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(movDelta, 10);
    if (!movListingId.trim() || Number.isNaN(qty) || qty === 0) {
      toast.error('Enter product ID and non-zero quantity');
      return;
    }
    setSavingMovement(true);
    try {
      const signedDelta =
        movType === 'DAMAGE_WRITE_OFF' ? -Math.abs(qty) : movType === 'RESTOCK' ? Math.abs(qty) : qty;
      await enqueueOfflineInventoryMovement({
        companyId,
        storeId,
        marketplaceListingId: movListingId.trim(),
        productName: movProductName.trim() || movListingId.trim(),
        delta: signedDelta,
        movementType: movType,
        reason: movReason.trim() || `POS ${movType}`,
      });
      toast.success('Inventory movement recorded in local ledger');
      setMovListingId('');
      setMovProductName('');
      setMovDelta('');
      setMovReason('');
      await refreshOverview();
      if (isOnline) {
        await onTriggerSync();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record stock movement');
    } finally {
      setSavingMovement(false);
    }
  };

  const totalPending =
    (overview?.pendingTransactionsCount || 0) +
    (overview?.pendingInventoryMovementsCount || 0) +
    (overview?.pendingExpensesCount || 0);
  const totalAttention =
    (overview?.failedOperationsCount || 0) + (overview?.conflictOperationsCount || 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-slate-900 text-slate-100 h-full flex flex-col border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                totalAttention > 0
                  ? 'bg-rose-500 animate-pulse'
                  : !isOnline
                  ? 'bg-amber-400 animate-pulse'
                  : isSyncing
                  ? 'bg-sky-400 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>SalesmanPro Sync &amp; Print Center</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {overview?.deviceId || 'TERMINAL'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {totalAttention > 0
                  ? `Attention required · ${totalAttention} operation(s) need review`
                  : !isOnline
                  ? `Offline · ${totalPending} operation(s) durably saved on this device`
                  : isSyncing
                  ? 'Syncing local operations with SalesmanPro Cloud...'
                  : totalPending > 0
                  ? `Online · ${totalPending} operation(s) queued to upload`
                  : 'Online · All local business records synchronized'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-4 gap-2 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Status Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OUTBOX')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'OUTBOX'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Outbox Queue</span>
            {totalPending > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {totalPending}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PRINT_QUEUE')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'PRINT_QUEUE'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Print Queue</span>
            {(overview?.failedPrintJobsCount || 0) > 0 && (
              <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {overview?.failedPrintJobsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QUICK_ACTIONS')}
            className={`px-3 py-2 rounded-t-lg border-b-2 transition ${
              activeTab === 'QUICK_ACTIONS'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Offline Expense &amp; Stock
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'OVERVIEW' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <ComputerDesktopIcon className="w-4 h-4 text-indigo-400" />
                    <span>Connection Status</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {isOnline ? '🟢 Online' : '🟠 Offline Mode'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Last sync:{' '}
                    {overview?.lastSyncAt
                      ? new Date(overview.lastSyncAt).toLocaleTimeString()
                      : 'Provisioned on session start'}
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Database &amp; Stock Policy</span>
                  </div>
                  <div className="text-base font-bold text-emerald-400">
                    {overview?.localDbHealth || 'HEALTHY'} · {overview?.offlineStockPolicy || 'CONTROLLED'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Sequence Cursor: #{overview?.cursor || 0}
                  </div>
                </div>
              </div>

              {/* Counts Table */}
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl divide-y divide-slate-800">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-300">Pending Sales Transactions</span>
                  <span className="font-mono font-bold text-amber-300">
                    {overview?.pendingTransactionsCount || 0}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-300">Pending Inventory Movements</span>
                  <span className="font-mono font-bold text-indigo-300">
                    {overview?.pendingInventoryMovementsCount || 0}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-300">Pending Business Expenses</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {overview?.pendingExpensesCount || 0}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-slate-300">Failed / Conflict Operations</span>
                  <span
                    className={`font-mono font-bold ${
                      totalAttention > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {totalAttention}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 text-slate-300 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Zero-Loss Transactional Outbox Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  All cash sales, customer registrations, stock movements, and expenses are durably
                  committed to this device before acknowledgement. They are never discarded and
                  automatically synchronize with idempotency protection when internet connectivity is available.
                </p>
              </div>
            </>
          )}

          {activeTab === 'OUTBOX' && (
            <div className="space-y-2.5">
              {(!overview?.pendingOrders || overview.pendingOrders.length === 0) &&
              (!overview?.journalOperations || overview.journalOperations.length === 0) ? (
                <div className="text-center py-10 text-slate-400">
                  <CloudArrowUpIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-300">No Pending Outbox Operations</p>
                  <p className="text-[11px]">All local transactions have been synchronized with the cloud.</p>
                </div>
              ) : (
                <>
                  {overview?.pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{ord.localTrackingNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Customer: {ord.payload?.name || 'Walk-in'} · Total: {currencySymbol}{' '}
                          {Number(ord.payload?.totalFinalPrice || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Saved at {new Date(ord.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'PRINT_QUEUE' && (
            <div className="space-y-2.5">
              {!overview?.printJobs || overview.printJobs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <PrinterIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-slate-300">Local Print Queue is Empty</p>
                  <p className="text-[11px]">
                    Receipts and kitchen tickets printed on this device will appear here for easy reprinting.
                  </p>
                </div>
              ) : (
                overview.printJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{job.payload?.document?.number || job.id}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            job.printed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {job.printed ? 'PRINTED' : job.status || 'QUEUED'}
                        </span>
                        {(job.reprintCount || 0) > 0 && (
                          <span className="text-[10px] text-slate-400">
                            (Reprints: {job.reprintCount})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {job.payload?.documentType || 'RECEIPT'} · Total:{' '}
                        {job.payload?.document?.totals?.currency || currencySymbol}{' '}
                        {Number(job.payload?.document?.totals?.total || 0).toLocaleString()}
                      </div>
                      {job.error && (
                        <div className="text-[10px] text-rose-400 mt-0.5">Error: {job.error}</div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReprintJob(job.id)}
                      disabled={reprintingJobId === job.id}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                    >
                      <PrinterIcon className="w-3.5 h-3.5" />
                      <span>{reprintingJobId === job.id ? 'Printing...' : 'Reprint'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'QUICK_ACTIONS' && (
            <div className="space-y-5">
              {/* Record Offline Business Expense */}
              <form
                onSubmit={handleRecordOfflineExpense}
                className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <BanknotesIcon className="w-4 h-4 text-emerald-400" />
                  <span>Record Business Expense (Offline-Capable)</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Transport">Transport / Delivery</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Amount ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Expense description..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    required
                  />
                  <input
                    type="text"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    placeholder="Payee / Vendor (optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  {savingExpense ? 'Saving Expense...' : 'Save Expense to Local Outbox'}
                </button>
              </form>

              {/* Record Offline Stock Movement */}
              <form
                onSubmit={handleRecordStockMovement}
                className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CubeIcon className="w-4 h-4 text-indigo-400" />
                  <span>Record Auditable Stock Movement (Offline Ledger)</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Movement Type</label>
                    <select
                      value={movType}
                      onChange={(e) => setMovType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="DAMAGE_WRITE_OFF">Damaged Stock (-)</option>
                      <option value="RESTOCK">Supplier Delivery / Restock (+)</option>
                      <option value="STOCK_ADJUSTMENT">Stock Correction (+/-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Quantity Units</label>
                    <input
                      type="number"
                      value={movDelta}
                      onChange={(e) => setMovDelta(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={movListingId}
                    onChange={(e) => setMovListingId(e.target.value)}
                    placeholder="Product / Listing ID"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    required
                  />
                  <input
                    type="text"
                    value={movReason}
                    onChange={(e) => setMovReason(e.target.value)}
                    placeholder="Reason / Reference note"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingMovement}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                >
                  {savingMovement ? 'Recording Movement...' : 'Record Stock Movement in Ledger'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleExportDiagnostics}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export Diagnostics</span>
          </button>

          <button
            type="button"
            onClick={handleRetrySync}
            disabled={!isOnline || isSyncing}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Now with Cloud'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

