'use client';

import React, { useState } from 'react';
import {
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function DatabaseManagement() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [restoreId,setRestoreId] = useState(
    `restore-${Date.now()}-${Math.random()}`,
  );
  const [status, setStatus] = useState<
    { type: 'success' | 'error'; msg: string } | null
  >(null);

  // const interval = setInterval(async () => {
  //   const res = await fetch(
  //     `/api/admin/restore/progress?id=${restoreId}`,
  //     {
  //       headers: {
  //         'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
  //         credentials: 'include',
  //       },
  //     }
  //   );
  //   const progress = (await res.json()).progress;

  //   setProgress(progress);

  //   if (progress.done) {
  //     clearInterval(interval);
  //   }
  // }, 2000);

  // ===============================
  // BACKUP
  // ===============================
  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      setStatus(null);

      const response = await fetch('/api/admin/db/backup',{
        headers: {
          'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
          credentials: 'include',
        },
      });

      if (!response.ok) {
        throw new Error('Backup failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `full-db-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setStatus({
        type: 'success',
        msg: 'Backup downloaded successfully.',
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.message || 'Failed to download backup',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // ===============================
  // RESTORE
  // ===============================
  const handleRestore = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently overwrite ALL database data. Continue?'
    );

    if (!confirmed) return;

    setIsRestoring(true);
    setStatus(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch('/api/admin/db/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-backup-secret': process.env.NEXT_PUBLIC_BACKUP_SECRET || '',
          credentials: 'include',
        },
        body: JSON.stringify(parsed), // ✅ Send raw object
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Restore failed');
      }

      setStatus({
        type: 'success',
        msg: 'Database restored successfully!',
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.message || 'Restore failed',
      });
    } finally {
      setIsRestoring(false);
      e.target.value = ''; // reset input
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Database Management
        </h1>
        <p className="text-gray-500">
          Backup your entire MongoDB database or restore from a
          previous snapshot.
        </p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BACKUP CARD */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <CloudArrowDownIcon className="h-10 w-10 text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold">
            Download Backup
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Streams a JSON snapshot of all database models.
          </p>

          <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          > 
            {isBackingUp ? (
              <span className="flex items-center justify-center">
                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                Generating Backup...
              </span>
            ) : (
              'Download JSON'
            )}
          </button>
        </div>

        {/* RESTORE CARD */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <CloudArrowUpIcon className="h-10 w-10 text-amber-600 mb-4" />
          <h2 className="text-lg font-semibold">
            Restore Database
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload a backup file to completely replace current
            database content.
          </p>

          <label className="relative cursor-pointer">
            <span
              className={`flex items-center justify-center w-full py-2 border-2 border-dashed rounded-lg transition-colors ${
                isRestoring
                  ? 'bg-gray-100'
                  : 'hover:border-amber-400'
              }`}
            >
              {isRestoring ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Restoring...
                </>
              ) : (
                'Select Backup File'
              )}
            </span>

            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestore}
              disabled={isRestoring}
            />
          </label>
        </div>
      </div>
    </div>
  );
}