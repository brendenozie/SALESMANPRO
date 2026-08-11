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
} from '@heroicons/react/24/outline';

interface DatabaseManagementClientProps {
  companyId: string;
}

export default function DatabaseManagementClient({ companyId }: DatabaseManagementClientProps) {
  // Loading States
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLocalBackingUp, setIsLocalBackingUp] = useState(false);

  // Data States
  const [backups, setBackups] = useState<any[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    loadS3Backups();
  }, []);

  const loadS3Backups = async () => {
    try {
      const res = await fetch('/api/admin/backup/list', {
        headers: {
          'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
        },
      });
      const data = await res.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to load S3 backups', err);
    }
  };

  // ===============================
  // PROGRESS POLLING (S3)
  // ===============================
  useEffect(() => {
    if (!restoreId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/admin/restore/progress?id=${restoreId}`);
      const data = await res.json();
      setProgress(data.progress);

      if (data.progress?.done) {
        clearInterval(interval);
        setStatus({ type: 'success', msg: 'S3 Restore completed successfully!' });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [restoreId]);

  // ===============================
  // S3 OPERATIONS (CLOUD)
  // ===============================
  const handleS3Backup = async () => {
    try {
      setIsBackingUp(true);
      setStatus(null);
      const res = await fetch('/api/admin/db/backup', {
        method: 'POST',
        headers: { 'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '' },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setStatus({ type: 'success', msg: 'Backup uploaded to S3 successfully' });
      loadS3Backups();
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'S3 Backup failed' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleS3Restore = async () => {
    if (!selectedBackup) return;
    if (!window.confirm('⚠️ This will overwrite the entire database from S3. Continue?')) return;

    try {
      setIsRestoring(true);
      setStatus(null);
      const res = await fetch('/api/admin/db/restore/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
        },
        body: JSON.stringify({ fileKey: selectedBackup }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setRestoreId(result.restoreId);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'S3 Restore failed' });
      setIsRestoring(false);
    }
  };

  // ===============================
  // LOCAL OPERATIONS (FILE)
  // ===============================
  const handleLocalDownload = async () => {
    try {
      setIsLocalBackingUp(true);
      setStatus(null);
      const response = await fetch('/api/admin/db/backup', {
        headers: { 'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '' },
      });
      if (!response.ok) throw new Error('Local backup generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `db-local-backup-${Date.now()}.json`;
      a.click();
      setStatus({ type: 'success', msg: 'Local backup downloaded successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsLocalBackingUp(false);
    }
  };

  const handleLocalRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.confirm('⚠️ DANGER: Replace ALL data with this file?')) return;

    try {
      setIsRestoring(true);
      setStatus(null);
      const text = await file.text();
      const res = await fetch('/api/admin/db/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
        },
        body: text,
      });
      if (!res.ok) throw new Error('Local restore failed');
      setStatus({ type: 'success', msg: 'Database restored from local file!' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('DANGER: This will wipe the database clean!')) return;
    try {
      setIsClearing(true);
      const res = await fetch('/api/admin/db/clear', {
        method: 'POST',
        headers: { 'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '' },
      });
      if (!res.ok) throw new Error('Clear failed');
      setStatus({ type: 'success', msg: 'Database cleared.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CircleStackIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Database Hub</h1>
            </div>
            <p className="text-gray-500 font-medium">
              Manage snapshots, cloud backups, and data integrity.
            </p>
          </div>
          <button
            onClick={handleClearDatabase}
            disabled={isClearing}
            className="flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
          >
            {isClearing ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <TrashIcon className="h-5 w-5 mr-2" />
            )}
            Wipe Database
          </button>
        </div>

        {/* Status Alerts */}
        {status && (
          <div
            className={`animate-in fade-in slide-in-from-top-4 p-4 rounded-2xl border ${
              status.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <p className="flex items-center font-medium">
              {status.type === 'success' ? '✅' : '❌'}{' '}
              <span className="ml-2">{status.msg}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SECTION 1: S3 CLOUD BACKUPS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CloudArrowUpIcon className="h-6 w-6 text-blue-600" /> Cloud Backups (S3)
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleS3Backup}
                  disabled={isBackingUp}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <CloudArrowDownIcon className="h-10 w-10 text-gray-400 group-hover:text-blue-500 mb-2" />
                  <span className="font-bold text-gray-700 group-hover:text-blue-700">Push to S3</span>
                </button>

                <button
                  onClick={handleS3Restore}
                  disabled={isRestoring || !selectedBackup}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all group disabled:opacity-40"
                >
                  <ArrowPathIcon
                    className={`h-10 w-10 text-gray-400 group-hover:text-amber-500 mb-2 ${
                      isRestoring ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="font-bold text-gray-700 group-hover:text-amber-700">
                    Restore Selected
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                  Available S3 Snapshots
                </label>
                <select
                  value={selectedBackup}
                  onChange={(e) => setSelectedBackup(e.target.value)}
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl p-4 text-gray-700 font-medium outline-none transition-all"
                >
                  <option value="">Choose a file...</option>
                  {backups.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.key.split('/').pop()} ({new Date(b.lastModified).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {progress && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="text-indigo-900 font-bold text-sm mb-2 uppercase">
                    Restore Engine Active
                  </h3>
                  <div className="w-full bg-indigo-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-indigo-700 font-semibold uppercase">
                    Syncing {progress.currentModel}: {progress.completed}/{progress.total} Models
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: LOCAL BACKUPS */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <DocumentArrowUpIcon className="h-6 w-6 text-emerald-600" /> Local Management
              </h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-900">Download Offline Copy</h3>
                  <p className="text-sm text-emerald-700">Save a raw JSON export to your computer.</p>
                </div>
                <button
                  onClick={handleLocalDownload}
                  disabled={isLocalBackingUp}
                  className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isLocalBackingUp ? (
                    <ArrowPathIcon className="h-6 w-6 animate-spin" />
                  ) : (
                    <DocumentArrowDownIcon className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleLocalRestore}
                  className="hidden"
                  id="local-upload"
                  disabled={isRestoring}
                />
                <label
                  htmlFor="local-upload"
                  className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all"
                >
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-300 group-hover:text-indigo-500 mb-4" />
                  <span className="text-lg font-bold text-gray-700">Import Local JSON</span>
                  <span className="text-sm text-gray-400 mt-1">Click to browse or drag and drop</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}