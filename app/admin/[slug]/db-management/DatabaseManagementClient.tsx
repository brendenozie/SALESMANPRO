'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface DatabaseManagementClientProps {
  companyId: string;
}

interface BackupItem {
  id: string;
  backupType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  sizeBytes: number;
  checksum?: string;
  storageKey?: string;
  verificationStatus?: string;
  restoreTestStatus?: string;
  durationMs?: number;
  recordCount?: number;
  collectionCount?: number;
}

interface RestoreJobItem {
  id: string;
  backupId: string;
  mode: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  progressPercent?: number;
  currentCollection?: string;
  collectionsTotal?: number;
  collectionsDone?: number;
  recordsProcessed?: number;
  recordsTotal?: number;
  recordsRestored?: number;
  recordsFailed?: number;
  preRestoreBackupId?: string;
  errorMessage?: string;
}

interface HealthSummary {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastSuccessfulBackup: {
    id: string;
    type: string;
    createdAt: string;
    sizeBytes: number;
    ageMinutes: number;
  } | null;
  lastVerifiedBackup: {
    id: string;
    type: string;
    verifiedAt: string;
    checksum: string;
    ageMinutes: number;
  } | null;
  lastRestoreTest: {
    backupId: string;
    testedAt: string;
    status: string;
  } | null;
  nextScheduledBackup: {
    type: string;
    scheduledTime: string;
  } | null;
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
  recentFailuresCount: number;
  totalBackupsCount: number;
  totalStorageBytes: number;
  message: string;
}

interface ConfigSettings {
  hourlyEnabled: boolean;
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  monthlyEnabled: boolean;
  retentionHourly: number;
  retentionDaily: number;
  retentionWeekly: number;
  retentionMonthly: number;
  dailyCron: string;
  weeklyCron: string;
  monthlyCron: string;
  alertEmail?: string;
  alertsEnabled: boolean;
}

export default function DatabaseManagementClient({ companyId }: DatabaseManagementClientProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'restore' | 'settings' | 'danger'>('overview');

  // Loading States
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);
  const [isTestingId, setIsTestingId] = useState<string | null>(null);

  // Data States
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJobItem[]>([]);
  const [config, setConfig] = useState<ConfigSettings | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  // Restore Modal States
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupItem | null>(null);
  const [restoreMode, setRestoreMode] = useState<'RESTORE_TO_PRODUCTION' | 'VALIDATE_ONLY' | 'PREVIEW'>('RESTORE_TO_PRODUCTION');
  const [restoreConfirmationInput, setRestoreConfirmationInput] = useState('');
  const [activeRestoreJobId, setActiveRestoreJobId] = useState<string | null>(null);

  // Wipe Confirmation State
  const [wipeConfirmationInput, setWipeConfirmationInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===============================
  // INITIAL FETCH
  // ===============================
  useEffect(() => {
    fetchHealth();
    fetchBackups();
    fetchRestoreJobs();
    fetchConfig();
  }, []);

  // Poll active restore job progress
  useEffect(() => {
    if (!activeRestoreJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/db/restores/${activeRestoreJobId}`);
        const data = await res.json();
        if (data?.data?.job) {
          const job: RestoreJobItem = data.data.job;
          setRestoreJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)]);

          if (job.status === 'COMPLETED') {
            clearInterval(interval);
            setActiveRestoreJobId(null);
            setIsRestoring(false);
            setStatus({ type: 'success', msg: 'Database restoration completed successfully!' });
            fetchHealth();
          } else if (job.status === 'FAILED') {
            clearInterval(interval);
            setActiveRestoreJobId(null);
            setIsRestoring(false);
            setStatus({ type: 'error', msg: `Restoration failed: ${job.errorMessage || 'Unknown error'}` });
          }
        }
      } catch (err) {
        console.error('Error polling restore progress:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRestoreJobId]);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/admin/db/health');
      const json = await res.json();
      if (json?.data) setHealth(json.data);
    } catch (err) {
      console.error('Failed to load health summary', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/admin/db/backups?limit=50');
      const json = await res.json();
      if (json?.data?.backups) setBackups(json.data.backups);
    } catch (err) {
      console.error('Failed to load backups', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  const fetchRestoreJobs = async () => {
    try {
      const res = await fetch('/api/admin/db/restores');
      const json = await res.json();
      if (json?.data?.jobs) setRestoreJobs(json.data.jobs);
    } catch (err) {
      console.error('Failed to load restore jobs', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/db/config');
      const json = await res.json();
      if (json?.data?.config) setConfig(json.data.config);
    } catch (err) {
      console.error('Failed to load backup config', err);
    }
  };

  // ===============================
  // ACTIONS
  // ===============================
  const handleTriggerBackup = async (type: 'MANUAL' | 'PRE_DEPLOYMENT' = 'MANUAL') => {
    try {
      setIsBackingUp(true);
      setStatus(null);
      const res = await fetch('/api/admin/db/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Backup trigger failed');

      setStatus({
        type: 'success',
        msg: `Backup job (${type}) enqueued to dedicated worker. Processing in background...`,
      });
      setTimeout(() => {
        fetchBackups();
        fetchHealth();
      }, 1500);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleVerifyBackup = async (backupId: string) => {
    try {
      setIsVerifyingId(backupId);
      setStatus(null);
      const res = await fetch(`/api/admin/db/backups/${backupId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      setStatus({ type: 'success', msg: `Backup ${backupId} successfully verified!` });
      fetchBackups();
      fetchHealth();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsVerifyingId(null);
    }
  };

  const handleTestRestore = async (backupId: string) => {
    try {
      setIsTestingId(backupId);
      setStatus(null);
      const res = await fetch(`/api/admin/db/backups/${backupId}/test-restore`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Restore test failed');

      setStatus({ type: 'success', msg: `Automated restore test PASSED for backup ${backupId}!` });
      fetchBackups();
      fetchHealth();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsTestingId(null);
    }
  };

  const handleDownload = async (backupId: string) => {
    try {
      const res = await fetch(`/api/admin/db/backups/${backupId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Download URL generation failed');

      if (data?.data?.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
      } else {
        window.location.href = `/api/admin/db/backups/${backupId}/download?format=json`;
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this backup artifact?')) return;
    try {
      const res = await fetch(`/api/admin/db/backups/${backupId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      setStatus({ type: 'info', msg: `Backup ${backupId} deleted.` });
      fetchBackups();
      fetchHealth();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  const handleStartRestore = async () => {
    if (!selectedBackupForRestore) return;
    if (restoreMode === 'RESTORE_TO_PRODUCTION' && restoreConfirmationInput !== 'RESTORE PRODUCTION DATABASE') {
      alert("Please type 'RESTORE PRODUCTION DATABASE' to confirm production overwrite.");
      return;
    }

    try {
      setIsRestoring(true);
      const res = await fetch('/api/admin/db/restores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: selectedBackupForRestore.id,
          mode: restoreMode,
          confirmation: restoreConfirmationInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Restore creation failed');

      const jobId = data?.data?.restoreJob?.id;
      setActiveRestoreJobId(jobId);
      setShowRestoreModal(false);
      setRestoreConfirmationInput('');
      setStatus({
        type: 'info',
        msg: `Restore job ${jobId} enqueued. Pre-restore backup running before data sync...`,
      });
      fetchRestoreJobs();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
      setIsRestoring(false);
    }
  };

  const handleWipeDatabase = async () => {
    if (wipeConfirmationInput !== 'DELETE PRODUCTION DATABASE') {
      alert("Please type 'DELETE PRODUCTION DATABASE' exactly to proceed.");
      return;
    }

    if (!window.confirm('CRITICAL WARNING: This will erase all business and tenant collections! Proceed?')) {
      return;
    }

    try {
      setIsClearing(true);
      const res = await fetch('/api/admin/db/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: wipeConfirmationInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Wipe failed');

      setStatus({
        type: 'success',
        msg: `Database cleared. Emergency pre-wipe backup was created (${data?.data?.preWipeBackupId}).`,
      });
      setWipeConfirmationInput('');
      fetchBackups();
      fetchHealth();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsClearing(false);
    }
  };

  const handleSaveConfig = async (newConfig: Partial<ConfigSettings>) => {
    try {
      const res = await fetch('/api/admin/db/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Config update failed');
      setConfig(data?.data?.config);
      setStatus({ type: 'success', msg: 'Backup configuration & schedules updated successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CircleStackIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-extrabold tracking-tight">Database Reliability & Recovery Hub</h1>
            </div>
            <p className="text-slate-500 font-medium">
              Automated multi-server backups, encrypted cloud archives, integrity verification, and disaster recovery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTriggerBackup('MANUAL')}
              disabled={isBackingUp}
              className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isBackingUp ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
              )}
              Run Backup Now
            </button>
            <button
              onClick={() => {
                fetchHealth();
                fetchBackups();
                fetchRestoreJobs();
              }}
              className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
              title="Refresh status"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {status && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : status.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <p className="font-medium text-sm flex items-center gap-2">
              {status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️'}
              {status.msg}
            </p>
            <button onClick={() => setStatus(null)} className="text-xs opacity-60 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview & SLA
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-3 transition-colors ${
              activeTab === 'backups'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Backup Registry ({backups.length})
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`pb-3 transition-colors ${
              activeTab === 'restore'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Restore Center
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 transition-colors ${
              activeTab === 'settings'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Schedules & Retention
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`pb-3 transition-colors ${
              activeTab === 'danger'
                ? 'border-b-2 border-rose-600 text-rose-600'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Danger Zone
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SLA */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Health Banner */}
            <div
              className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                health?.status === 'HEALTHY'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : health?.status === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    health?.status === 'HEALTHY'
                      ? 'bg-emerald-600 text-white'
                      : health?.status === 'WARNING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  <ShieldCheckIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold uppercase tracking-wider">{health?.status || 'HEALTHY'}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/70 font-semibold">
                      Target RPO ≤ {health?.rpoTargetMinutes || 60}m | Target RTO ≤ {health?.rtoTargetMinutes || 120}m
                    </span>
                  </div>
                  <p className="text-sm mt-0.5 opacity-90">{health?.message}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-500">Storage Usage</span>
                <p className="text-2xl font-black">{formatBytes(health?.totalStorageBytes)}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Verified Backup</span>
                <p className="text-xl font-bold text-slate-900">
                  {health?.lastVerifiedBackup ? `${health.lastVerifiedBackup.ageMinutes}m ago` : 'None yet'}
                </p>
                <p className="text-xs text-slate-500">Type: {health?.lastVerifiedBackup?.type || 'N/A'}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Scheduled Run</span>
                <p className="text-xl font-bold text-slate-900">Hourly Protection</p>
                <p className="text-xs text-slate-500">BullMQ Distributed Scheduler</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restore Testing</span>
                <p className="text-xl font-bold text-slate-900">
                  {health?.lastRestoreTest?.status === 'PASSED' ? (
                    <span className="text-emerald-600">PASSED ✅</span>
                  ) : (
                    'UNTESTED'
                  )}
                </p>
                <p className="text-xs text-slate-500">Isolated DB Sandbox</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Failures</span>
                <p className="text-xl font-bold text-slate-900">{health?.recentFailuresCount || 0}</p>
                <p className="text-xs text-slate-500">Last 24 Hours</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Disaster Recovery Readiness Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleTriggerBackup('PRE_DEPLOYMENT')}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-left group"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600">Pre-Deployment Snapshot</h3>
                    <p className="text-xs text-slate-500">Take a verified safety backup before schema migrations</p>
                  </div>
                  <ServerIcon className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                </button>

                <button
                  onClick={() => {
                    if (backups[0]) handleTestRestore(backups[0].id);
                  }}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-left group"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-600">Run Automated Restore Test</h3>
                    <p className="text-xs text-slate-500">Validates latest backup in non-destructive sandbox</p>
                  </div>
                  <ShieldCheckIcon className="h-6 w-6 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => setActiveTab('restore')}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/40 transition-all text-left group"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-amber-600">Open Restore Center</h3>
                    <p className="text-xs text-slate-500">Select verified backup for controlled restoration</p>
                  </div>
                  <ArrowPathIcon className="h-6 w-6 text-slate-400 group-hover:text-amber-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BACKUP REGISTRY */}
        {activeTab === 'backups' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Authoritative Backup Registry</h2>
                <p className="text-xs text-slate-500">Every snapshot is tracked with immutable checksums and encryption verification.</p>
              </div>
              <button
                onClick={fetchBackups}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <ArrowPathIcon className="h-4 w-4" /> Refresh Registry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Backup ID & Type</th>
                    <th className="p-4">Date / Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Size & Duration</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Checksum (SHA-256)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 font-mono text-xs">{b.id.substring(0, 8)}...</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700">
                          {b.backupType}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 text-xs">
                        {new Date(b.startedAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            b.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'RUNNING' || b.status === 'QUEUED'
                              ? 'bg-blue-50 text-blue-700 animate-pulse'
                              : b.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{formatBytes(b.sizeBytes)}</div>
                        <div>{b.durationMs ? `${(b.durationMs / 1000).toFixed(1)}s` : '-'}</div>
                      </td>

                      <td className="p-4 text-xs">
                        <div className="flex items-center gap-1 font-medium">
                          {b.verificationStatus === 'VERIFIED' ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircleIcon className="h-4 w-4" /> Verified
                            </span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </div>
                        {b.restoreTestStatus === 'PASSED' && (
                          <span className="text-[10px] text-indigo-600 font-semibold">Restore Tested ✅</span>
                        )}
                      </td>

                      <td className="p-4 text-xs font-mono text-slate-400" title={b.checksum || ''}>
                        {b.checksum ? `${b.checksum.substring(0, 12)}...` : '-'}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifyBackup(b.id)}
                          disabled={isVerifyingId === b.id}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
                          title="Verify Checksum"
                        >
                          {isVerifyingId === b.id ? 'Checking...' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleDownload(b.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                          title="Download Decrypted JSON or Cloud Link"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackupForRestore(b);
                            setShowRestoreModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(b.id)}
                          className="px-2 py-1 text-xs text-rose-500 hover:text-rose-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {backups.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400">
                        No backups in registry yet. Click "Run Backup Now" to create the first automated snapshot.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESTORE CENTER */}
        {activeTab === 'restore' && (
          <div className="space-y-6">
            {/* Active Restore Progress Banner */}
            {activeRestoreJobId && (
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-indigo-950 flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-indigo-600" />
                    Durable Disaster Recovery Restoration in Progress
                  </h3>
                  <span className="text-xs font-bold text-indigo-700 font-mono">Job: {activeRestoreJobId}</span>
                </div>

                <div className="w-full bg-indigo-200/80 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        restoreJobs.find((j) => j.id === activeRestoreJobId)?.progressPercent || 15
                      }%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs font-semibold text-indigo-800">
                  <span>
                    Syncing collection:{' '}
                    <b>{restoreJobs.find((j) => j.id === activeRestoreJobId)?.currentCollection || 'Initializing'}</b>
                  </span>
                  <span>
                    Records restored:{' '}
                    <b>
                      {restoreJobs.find((j) => j.id === activeRestoreJobId)?.recordsRestored || 0} /{' '}
                      {restoreJobs.find((j) => j.id === activeRestoreJobId)?.recordsTotal || 0}
                    </b>
                  </span>
                </div>
              </div>
            )}

            {/* Restore Action Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Select Snapshot for Controlled Disaster Recovery</h2>
              <p className="text-xs text-slate-500">
                Production restoration automatically triggers an emergency pre-restore safety snapshot before writing changes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {backups
                  .filter((b) => b.status === 'VERIFIED')
                  .slice(0, 4)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-5 border border-slate-200 rounded-2xl flex items-center justify-between hover:border-amber-400 hover:bg-amber-50/20 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{b.backupType}</span>
                          <span className="text-xs text-slate-500">{new Date(b.startedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Size: {formatBytes(b.sizeBytes)} | Models: {b.collectionCount || 0} | Records: {b.recordCount || 0}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedBackupForRestore(b);
                          setShowRestoreModal(true);
                        }}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all"
                      >
                        Restore This Snapshot
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Restore History Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold">Historical Restore Operations</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4">Job ID</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Records Restored</th>
                    <th className="p-4">Pre-Restore Backup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {restoreJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50 text-xs">
                      <td className="p-4 font-mono font-bold text-slate-900">{j.id.substring(0, 8)}...</td>
                      <td className="p-4 font-semibold">{j.mode}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            j.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : j.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {j.startedAt ? new Date(j.startedAt).toLocaleString() : '-'}
                      </td>
                      <td className="p-4 font-medium">
                        {j.recordsRestored || 0} / {j.recordsTotal || 0}
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        {j.preRestoreBackupId ? `${j.preRestoreBackupId.substring(0, 8)}...` : '-'}
                      </td>
                    </tr>
                  ))}
                  {restoreJobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400">
                        No restore jobs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULES & RETENTION */}
        {activeTab === 'settings' && config && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Backup Schedules & Lifecycle Retention</h2>
              <p className="text-xs text-slate-500">Configure multi-tier backup frequency and cloud lifecycle pruning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Toggles */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Automated Schedules</h3>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 block">Hourly Protection</span>
                    <span className="text-xs text-slate-500">Every 1 hour (Keeps last {config.retentionHourly} snapshots)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.hourlyEnabled}
                    onChange={(e) => handleSaveConfig({ hourlyEnabled: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 block">Daily Protection</span>
                    <span className="text-xs text-slate-500">Daily at 02:00 (Keeps last {config.retentionDaily} daily snapshots)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.dailyEnabled}
                    onChange={(e) => handleSaveConfig({ dailyEnabled: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 block">Weekly Protection</span>
                    <span className="text-xs text-slate-500">Sundays at 03:00 (Keeps last {config.retentionWeekly} weekly snapshots)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.weeklyEnabled}
                    onChange={(e) => handleSaveConfig({ weeklyEnabled: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 block">Monthly Protection</span>
                    <span className="text-xs text-slate-500">1st of Month (Keeps last {config.retentionMonthly} monthly snapshots)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.monthlyEnabled}
                    onChange={(e) => handleSaveConfig({ monthlyEnabled: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Retention Limits */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Retention Counts</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Hourly Retention Max</label>
                    <input
                      type="number"
                      value={config.retentionHourly}
                      onChange={(e) => handleSaveConfig({ retentionHourly: parseInt(e.target.value, 10) || 48 })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Daily Retention Max</label>
                    <input
                      type="number"
                      value={config.retentionDaily}
                      onChange={(e) => handleSaveConfig({ retentionDaily: parseInt(e.target.value, 10) || 30 })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Weekly Retention Max</label>
                    <input
                      type="number"
                      value={config.retentionWeekly}
                      onChange={(e) => handleSaveConfig({ retentionWeekly: parseInt(e.target.value, 10) || 12 })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Alert Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@salesmanpro.com"
                      value={config.alertEmail || ''}
                      onChange={(e) => handleSaveConfig({ alertEmail: e.target.value })}
                      className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DANGER ZONE & MANUAL EXPORT */}
        {activeTab === 'danger' && (
          <div className="space-y-8">
            {/* Local Export / Import */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Offline Portability & Local JSON Export</h2>
              <p className="text-xs text-slate-500">Download unencrypted raw JSON export for off-site disaster backups.</p>

              <div className="flex items-center gap-4">
                <a
                  href="/api/admin/db/backup"
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Download Raw JSON Stream
                </a>
              </div>
            </div>

            {/* Wipe Database Card */}
            <div className="bg-rose-50/50 p-8 rounded-3xl border border-rose-200 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-600 text-white rounded-2xl">
                  <ExclamationTriangleIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-900">Destructive Database Wipe</h2>
                  <p className="text-sm text-rose-700 mt-1">
                    This will delete all collections across the entire MongoDB cluster. An emergency pre-wipe backup is
                    automatically created and verified before the wipe can proceed.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-w-md">
                <label className="text-xs font-bold text-rose-900 block">
                  To confirm, type <span className="font-mono bg-rose-200/80 px-1 py-0.5 rounded">DELETE PRODUCTION DATABASE</span>:
                </label>
                <input
                  type="text"
                  placeholder="DELETE PRODUCTION DATABASE"
                  value={wipeConfirmationInput}
                  onChange={(e) => setWipeConfirmationInput(e.target.value)}
                  className="w-full p-3 bg-white border border-rose-300 rounded-xl text-sm font-mono text-rose-950 outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={handleWipeDatabase}
                  disabled={isClearing || wipeConfirmationInput !== 'DELETE PRODUCTION DATABASE'}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  {isClearing ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <TrashIcon className="h-5 w-5" />}
                  Execute Protected Database Wipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESTORE CONFIRMATION MODAL */}
        {showRestoreModal && selectedBackupForRestore && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                  <ExclamationTriangleIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Confirm Disaster Recovery Restore</h3>
                  <p className="text-xs text-slate-500">Backup ID: {selectedBackupForRestore.id}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                <p><b>Type:</b> {selectedBackupForRestore.backupType}</p>
                <p><b>Date:</b> {new Date(selectedBackupForRestore.startedAt).toLocaleString()}</p>
                <p><b>Size:</b> {formatBytes(selectedBackupForRestore.sizeBytes)}</p>
                <p><b>Checksum:</b> <span className="font-mono">{selectedBackupForRestore.checksum}</span></p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Restore Mode</label>
                <select
                  value={restoreMode}
                  onChange={(e) => setRestoreMode(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                >
                  <option value="RESTORE_TO_PRODUCTION">RESTORE TO PRODUCTION (Overwrites current database)</option>
                  <option value="VALIDATE_ONLY">VALIDATE ONLY (Simulate & Verify without writing)</option>
                  <option value="PREVIEW">PREVIEW (Inspect Collections & Records)</option>
                </select>
              </div>

              {restoreMode === 'RESTORE_TO_PRODUCTION' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                  <p className="font-bold">⚠️ Mandatory Safety Rule:</p>
                  <p>An emergency pre-restore snapshot will be automatically created and verified before data restoration begins.</p>
                  <label className="font-bold block mt-2">
                    Type <span className="font-mono bg-amber-200 px-1 py-0.5 rounded">RESTORE PRODUCTION DATABASE</span>:
                  </label>
                  <input
                    type="text"
                    placeholder="RESTORE PRODUCTION DATABASE"
                    value={restoreConfirmationInput}
                    onChange={(e) => setRestoreConfirmationInput(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-sm font-mono text-amber-950 outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRestoreModal(false);
                    setRestoreConfirmationInput('');
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartRestore}
                  disabled={
                    restoreMode === 'RESTORE_TO_PRODUCTION' &&
                    restoreConfirmationInput !== 'RESTORE PRODUCTION DATABASE'
                  }
                  className="px-6 py-2.5 text-sm font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all disabled:opacity-40"
                >
                  Confirm & Enqueue Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}