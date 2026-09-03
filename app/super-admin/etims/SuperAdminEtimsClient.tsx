'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SuperAdminEtimsClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bulkRetrying, setBulkRetrying] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/etims');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to load super admin eTIMS telemetry:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleBulkRetry = async () => {
    setBulkRetrying(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/super-admin/etims', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setActionMessage(json.message || 'Bulk retry complete.');
        fetchMetrics();
      } else {
        setActionMessage(json.error || 'Bulk retry encountered issues.');
      }
    } catch (e: any) {
      setActionMessage(`Network error: ${e.message}`);
    } finally {
      setBulkRetrying(false);
    }
  };

  const metrics = data?.metrics || {};
  const failedQueue = data?.failedQueue || [];
  const systemStatus = data?.systemStatus || 'HEALTHY';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight">eTIMS Platform Control Center</h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    systemStatus === 'HEALTHY'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  }`}
                >
                  ● System {systemStatus}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Platform-wide KRA eTIMS fiscal compliance monitoring, store distribution & dead-letter queue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              title="Refresh Telemetry"
            >
              <ArrowPathIcon className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              disabled={bulkRetrying || failedQueue.length === 0}
              onClick={handleBulkRetry}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${bulkRetrying ? 'animate-spin' : ''}`} />
              {bulkRetrying ? 'Processing Retry Queue...' : 'Retry All Failed Invoices'}
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-indigo-500 hover:text-indigo-700">
              ✕
            </button>
          </div>
        )}

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Configured Stores</div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {metrics.configuredStores || 0}{' '}
              <span className="text-sm font-normal text-zinc-400">/ {metrics.totalStores || 0} total</span>
            </div>
            <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <BuildingStorefrontIcon className="w-4 h-4 text-zinc-400" />
              <span>{metrics.activeStores || 0} active in production</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              24h Invoices Confirmed
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.invoicesConfirmed24h || 0}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              {metrics.invoicesConfirmed30d || 0} invoices past 30 days
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              SDC Adapter Types
            </div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {metrics.oscuCount || 0}{' '}
              <span className="text-sm font-normal text-zinc-400">OSCU / {metrics.vscuCount || 0} VSCU</span>
            </div>
            <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
              <CpuChipIcon className="w-4 h-4 text-zinc-400" />
              <span>Hardware & Cloud SDC</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
              Failed Queue Backlog
            </div>
            <div className="text-3xl font-black text-red-600 dark:text-red-400">{failedQueue.length}</div>
            <div className="text-xs text-zinc-500 mt-2">
              {metrics.pendingSyncEvents || 0} offline sync events pending
            </div>
          </div>
        </div>

        {/* Failed Submissions Queue Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                Dead-Letter Transmission Queue
              </h3>
              <p className="text-xs text-zinc-500">
                Invoices that encountered network timeout or schema rejection from KRA eTIMS.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300">
              {failedQueue.length} items requiring review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3.5">Store / Merchant</th>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Order Tracking</th>
                  <th className="p-3.5 text-right">Amount (KES)</th>
                  <th className="p-3.5">Error Details</th>
                  <th className="p-3.5 text-center">Retries</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {failedQueue.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-400 font-medium">
                      ✓ No failed submissions in queue. All fiscal pipelines healthy.
                    </td>
                  </tr>
                ) : (
                  failedQueue.map((item: any) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                      <td className="p-3.5 font-bold text-zinc-800 dark:text-zinc-200">
                        {item.company?.name || 'Unknown Store'}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-600 dark:text-zinc-300">{item.invoiceNumber}</td>
                      <td className="p-3.5 font-mono text-zinc-500">{item.orderTrackingNumber}</td>
                      <td className="p-3.5 text-right font-bold font-mono text-zinc-900 dark:text-white">
                        {(item.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-red-600 dark:text-red-400" title={item.errorMessage}>
                        <span className="font-mono font-bold">[{item.errorCode || 'ERR'}]</span>{' '}
                        {item.errorMessage || 'Unknown failure'}
                      </td>
                      <td className="p-3.5 text-center font-bold">{item.retryCount || 0}</td>
                      <td className="p-3.5 text-zinc-500">
                        {new Date(item.createdAt).toLocaleString('en-KE', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/admin/${item.company?.slug}/etims`}
                          className="text-xs text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Inspect <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
