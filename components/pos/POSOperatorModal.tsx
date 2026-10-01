'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LockClosedIcon,
  BackspaceIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession } from '@/types/pos';

export type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession };

interface POSOperatorModalProps {
  isOpen: boolean;
  companyId: string;
  terminalId?: string;
  storeName?: string;
  onSuccess: (data: { operator: POSOperatorInfo; posSession: POSSessionInfo }) => void;
}

export default function POSOperatorModal({
  isOpen,
  companyId,
  terminalId = 'T01',
  storeName = 'SalesmanPro POS',
  onSuccess,
}: POSOperatorModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDigit = useCallback((digit: string) => {
    if (code.length < 8) {
      setCode((prev) => prev + digit);
      setError(null);
    }
  }, [code]);

  const handleBackspace = useCallback(() => {
    setCode((prev) => prev.slice(0, -1));
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setCode('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!code || code.length < 3) {
      setError('Please enter a valid staff or sales agent login code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pos/auth/login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          loginCode: code,
          terminalId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      setCode('');
      onSuccess(data.data);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setCode('');
    } finally {
      setLoading(false);
    }
  }, [code, companyId, terminalId, onSuccess]);

  // Physical keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleBackspace, handleClear, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
        {/* Terminal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
            <LockClosedIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {storeName}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Terminal: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{terminalId}</span>
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-4 text-center">
          Enter your staff or sales agent login code to start or resume your POS session
        </p>

        {/* PIN Display */}
        <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-2xl py-4 px-6 mb-4 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 min-h-[64px]">
          <div className="flex items-center gap-3">
            {code.length === 0 ? (
              <span className="text-slate-400 font-mono text-sm">Enter PIN / Code</span>
            ) : (
              code.split('').map((_, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm animate-scaleIn"
                />
              ))
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-medium">
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold uppercase transition-all active:scale-95 shadow-sm"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <BackspaceIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || code.length === 0}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span>Verifying...</span>
          ) : (
            <>
              <span>Authenticate & Start Session</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
