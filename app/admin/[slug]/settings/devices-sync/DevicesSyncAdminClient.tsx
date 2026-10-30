'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface RegisteredDeviceItem {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  terminalId?: string | null;
  appVersion?: string | null;
  protocolVersion: number;
  status: string;
  lastHeartbeatAt?: string | null;
  lastSyncAt?: string | null;
  lastPulledSequence: number;
  sequenceLag: number;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
  revokedAt?: string | null;
  revokedReason?: string | null;
  grantExpiresAt?: string | null;
}

interface SyncConflictItem {
  id: string;
  deviceId?: string | null;
  operationId: string;
  entityType: string;
  entityId?: string | null;
  conflictType: string;
  status: string;
  localSummary?: any;
  serverSummary?: any;
  discrepancyQty?: number | null;
  resolutionAction?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

interface DevicesSyncAdminClientProps {
  companyId: string;
  companyName: string;
  slug: string;
}

export default function DevicesSyncAdminClient({
  companyId,
  companyName,
}: DevicesSyncAdminClientProps) {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<RegisteredDeviceItem[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflictItem[]>([]);
  const [latestSequence, setLatestSequence] = useState(0);
  const [summary, setSummary] = useState({
    totalDevices: 0,
    activeDevices: 0,
    revokedDevices: 0,
    totalPending: 0,
    totalFailed: 0,
    openConflicts: 0,
    totalOperationsProcessed: 0,
  });

  // Policy State
  const [offlineInventoryPolicy, setOfflineInventoryPolicy] = useState<'STRICT' | 'CONTROLLED' | 'FLEXIBLE'>('CONTROLLED');
  const [offlineGrantTtlHours, setOfflineGrantTtlHours] = useState<number>(72);
  const [offlineAllowanceBuffer, setOfflineAllowanceBuffer] = useState<number>(5);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Conflict Resolution Modal State
  const [selectedConflict, setSelectedConflict] = useState<SyncConflictItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'ACCEPT_DELTA' | 'ADJUST_STOCK' | 'DISMISS'>('ACCEPT_DELTA');
  const [adjustedStockQuantity, setAdjustedStockQuantity] = useState<string>('0');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolvingConflict, setResolvingConflict] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, conflictsRes] = await Promise.all([
        fetch(`/api/sync/status?companyId=${encodeURIComponent(companyId)}`),
        fetch(`/api/sync/conflicts?companyId=${encodeURIComponent(companyId)}&status=OPEN`),
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDevices(statusData.devices || []);
        setLatestSequence(statusData.latestSequence || 0);
        if (statusData.summary) setSummary(statusData.summary);
        if (statusData.settings) {
          setOfflineInventoryPolicy(statusData.settings.offlineInventoryPolicy || 'CONTROLLED');
          setOfflineGrantTtlHours(statusData.settings.offlineGrantTtlHours || 72);
          setOfflineAllowanceBuffer(statusData.settings.offlineAllowanceBuffer ?? 5);
        }
      }

      if (conflictsRes.ok) {
        const conflictData = await conflictsRes.json();
        setConflicts(conflictData.conflicts || []);
      }
    } catch (err) {
      console.error('[DevicesSyncAdmin] Failed to load sync status:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      const res = await fetch('/api/sync/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          action: 'UPDATE_POLICY',
          offlineInventoryPolicy,
          offlineGrantTtlHours,
          offlineAllowanceBuffer,
        }),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update offline synchronization policy');
      }
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleToggleDeviceRevocation = async (device: RegisteredDeviceItem) => {
    const isRevoked = device.status === 'REVOKED';
    const reason = isRevoked
      ? undefined
      : window.prompt(`Enter reason for revoking offline sync access for "${device.deviceName}" (${device.deviceId}):`, 'Lost or decommissioned terminal');

    if (!isRevoked && reason === null) return;

    try {
      const res = await fetch('/api/sync/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          action: isRevoked ? 'RESTORE_DEVICE' : 'REVOKE_DEVICE',
          deviceId: device.deviceId,
          reason,
        }),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update device authorization');
      }
    } catch (err) {
      console.error('Device revocation toggle failed:', err);
    }
  };

  const handleResolveConflict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;
    if (!resolutionNotes.trim()) {
      alert('Please enter an audit note explaining how this discrepancy was verified.');
      return;
    }

    setResolvingConflict(true);
    try {
      const res = await fetch('/api/sync/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          conflictId: selectedConflict.id,
          resolutionAction,
          adjustedStockQuantity:
            resolutionAction === 'ADJUST_STOCK' ? Number(adjustedStockQuantity) : undefined,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });
      if (res.ok) {
        setSelectedConflict(null);
        setResolutionNotes('');
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to resolve conflict');
      }
    } finally {
      setResolvingConflict(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ComputerDesktopIcon className="w-7 h-7 text-indigo-400" />
            <span>Offline Devices &amp; Synchronization Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor registered Android &amp; Desktop POS terminals, offline outbox health, inventory policies, and reconciliation records for <span className="text-slate-200 font-semibold">{companyName}</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Active Terminals</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.activeDevices}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.revokedDevices} revoked</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Store Change Cursor</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">#{latestSequence}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Monotonic sequence</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Pending Outbox Ops</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.totalPending}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all devices</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Failed Outbox Ops</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{summary.totalFailed}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Retained for audit</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Open Discrepancies</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{summary.openConflicts}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Needs manager review</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400">Total Synced Ops</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalOperationsProcessed}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Idempotent receipts</div>
        </div>
      </div>

      {/* Store Offline Policy & Security Configuration */}
      <form
        onSubmit={handleSavePolicy}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Store Offline Inventory &amp; Authorization Policy</h2>
          </div>
          <button
            type="submit"
            disabled={savingPolicy}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
          >
            {savingPolicy ? 'Saving...' : 'Save Policy'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Offline Stock Enforcement Policy
            </label>
            <select
              value={offlineInventoryPolicy}
              onChange={(e) => setOfflineInventoryPolicy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            >
              <option value="CONTROLLED">CONTROLLED (Recommended — Allow with discrepancy audit)</option>
              <option value="STRICT">STRICT (Block offline sales exceeding local stock)</option>
              <option value="FLEXIBLE">FLEXIBLE (Allow all offline sales &amp; reconcile later)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Completed offline cash sales are never silently discarded; oversells create an auditable conflict record.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Offline Authorization Grant TTL (Hours)
            </label>
            <input
              type="number"
              min={4}
              max={720}
              value={offlineGrantTtlHours}
              onChange={(e) => setOfflineGrantTtlHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Maximum duration a terminal can operate offline before requiring online re-authentication.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Controlled Offline Stock Buffer (Units)
            </label>
            <input
              type="number"
              min={0}
              max={1000}
              value={offlineAllowanceBuffer}
              onChange={(e) => setOfflineAllowanceBuffer(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Permitted buffer for unrecorded restocks when operating in CONTROLLED mode.
            </p>
          </div>
        </div>
      </form>

      {/* Registered Devices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Registered POS Terminals &amp; Devices</h2>
            <p className="text-xs text-slate-400">
              Non-destructive administration: revoking a device blocks future cloud pushes while preserving its local SQLite/IndexedDB ledger for forensic export.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-3 px-4">Device / Terminal</th>
                <th className="py-3 px-4">Platform &amp; Version</th>
                <th className="py-3 px-4">Auth Status</th>
                <th className="py-3 px-4">Last Sync / Heartbeat</th>
                <th className="py-3 px-4">Cursor Lag</th>
                <th className="py-3 px-4">Pending / Failed / Conflicts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No POS devices have registered with the sync service for this store yet.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => {
                  const isRevoked = dev.status === 'REVOKED';
                  return (
                    <tr key={dev.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {dev.platform === 'ANDROID' ? (
                            <DevicePhoneMobileIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <ComputerDesktopIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-white">{dev.deviceName}</div>
                            <div className="text-[11px] font-mono text-slate-400">
                              ID: {dev.deviceId} {dev.terminalId ? `• Terminal: ${dev.terminalId}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-semibold">
                          {dev.platform}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">
                          App {dev.appVersion || '1.0.0'} • Proto v{dev.protocolVersion}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isRevoked ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                              <NoSymbolIcon className="w-3 h-3" /> REVOKED
                            </span>
                            {dev.revokedReason && (
                              <div className="text-[10px] text-rose-400 mt-1 max-w-[180px] truncate">
                                {dev.revokedReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                              <CheckCircleIcon className="w-3 h-3" /> AUTHORIZED
                            </span>
                            {dev.grantExpiresAt && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                Grant until {new Date(dev.grantExpiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>
                          Sync: {dev.lastSyncAt ? new Date(dev.lastSyncAt).toLocaleString() : 'Never'}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ClockIcon className="w-3 h-3" />
                          Seen: {dev.lastHeartbeatAt ? new Date(dev.lastHeartbeatAt).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-200">#{dev.lastPulledSequence}</span>
                        {dev.sequenceLag > 0 ? (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                            -{dev.sequenceLag} behind
                          </span>
                        ) : (
                          <span className="ml-1.5 text-emerald-400 text-[10px]">Up to date</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                            {dev.pendingCount} pending
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300">
                            {dev.failedCount} failed
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                            {dev.conflictCount} conflicts
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceRevocation(dev)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            isRevoked
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                              : 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
                          }`}
                        >
                          {isRevoked ? 'Restore Access' : 'Revoke Device'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Synchronization & Inventory Discrepancy Conflicts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Open Synchronization &amp; Stock Discrepancies</h2>
              <p className="text-xs text-slate-400">
                When concurrent offline sales exceed available cloud stock, the cash sale is preserved and a discrepancy is logged here for manager reconciliation.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {conflicts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No unresolved synchronization conflicts or stock discrepancies.
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {conflict.conflictType}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {conflict.localSummary?.title || `${conflict.entityType} (${conflict.entityId || 'N/A'})`}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Op: {conflict.operationId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Device: <span className="font-mono">{conflict.deviceId || 'Unknown'}</span> • Discrepancy Qty:{' '}
                      <span className="font-bold text-rose-400">{conflict.discrepancyQty ?? 'N/A'}</span> • Created:{' '}
                      {new Date(conflict.createdAt).toLocaleString()}
                    </div>
                    {conflict.serverSummary && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Server Stock Snapshot: Before={conflict.serverSummary.previousQty ?? 'N/A'}, Theoretical={conflict.serverSummary.theoreticalNewQty ?? 'N/A'}, Applied={conflict.serverSummary.appliedNewQty ?? 'N/A'}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConflict(conflict);
                      setResolutionAction('ACCEPT_DELTA');
                      setAdjustedStockQuantity('0');
                      setResolutionNotes('');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition"
                  >
                    Reconcile Discrepancy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleResolveConflict}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
                <span>Reconcile Discrepancy ({selectedConflict.conflictType})</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedConflict(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <strong>Item / Entity:</strong>{' '}
                {selectedConflict.localSummary?.title || selectedConflict.entityId}
              </div>
              <div>
                <strong>Discrepancy Units:</strong> {selectedConflict.discrepancyQty ?? 0}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resolution Action
              </label>
              <select
                value={resolutionAction}
                onChange={(e) => setResolutionAction(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              >
                <option value="ACCEPT_DELTA">
                  Accept Clamped Stock (Keep current stock at 0 &amp; close discrepancy)
                </option>
                <option value="ADJUST_STOCK">
                  Set Verified Physical Count (Record stocktake adjustment)
                </option>
                <option value="DISMISS">Dismiss with Audit Note</option>
              </select>
            </div>

            {resolutionAction === 'ADJUST_STOCK' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Physical Shelf Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={adjustedStockQuantity}
                  onChange={(e) => setAdjustedStockQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Manager Audit Note (Required)
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g., Unrecorded supplier delivery of 12 units was already on shelf during outage"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedConflict(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolvingConflict}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {resolvingConflict ? 'Recording Resolution...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

