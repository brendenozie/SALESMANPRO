'use client';

import React, { useState } from 'react';
import { CloudArrowDownIcon, CloudArrowUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DatabaseManagement() {
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/db/backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full-db-backup-${new Date().toLocaleDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to download backup");
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !confirm("WARNING: This will overwrite ALL current data. Proceed?")) return;

    setIsRestoring(true);
    setStatus(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const res = await fetch('/api/admin/db/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: jsonData }),
      });

      const result = await res.json();
      if (result.success) {
        setStatus({ type: 'success', msg: "Database restored successfully!" });
      } else {
        setStatus({ type: 'error', msg: result.message });
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
        <p className="text-gray-500">Backup your entire MongoDB collection or restore from a previous state.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <CloudArrowDownIcon className="h-10 w-10 text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold">Download Backup</h2>
          <p className="text-sm text-gray-500 mb-6">Generates a JSON file containing all records from all models.</p>
          <button 
            onClick={handleBackup}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download JSON
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <CloudArrowUpIcon className="h-10 w-10 text-amber-600 mb-4" />
          <h2 className="text-lg font-semibold">Restore Data</h2>
          <p className="text-sm text-gray-500 mb-6">Upload a previously downloaded JSON backup file to overwrite the current DB.</p>
          
          <label className="relative cursor-pointer">
            <span className={`flex items-center justify-center w-full py-2 border-2 border-dashed rounded-lg transition-colors ${isRestoring ? 'bg-gray-100' : 'hover:border-amber-400'}`}>
              {isRestoring ? (
                <><ArrowPathIcon className="h-5 w-5 animate-spin mr-2" /> Restoring...</>
              ) : (
                "Select Backup File"
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