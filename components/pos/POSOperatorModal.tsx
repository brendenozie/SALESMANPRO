'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LockClosedIcon,
  BackspaceIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserIcon,
  XMarkIcon,
  BanknotesIcon,
  CheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

import type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession } from '@/types/pos';

export type { POSOperatorInfo, POSSessionInfo, POSOperator, POSSession };

interface POSOperatorModalProps {
  isOpen: boolean;
  companyId: string;
  terminalId?: string;
  storeName?: string;
  currentUserName?: string;
  currentUserId?: string | null;
  currencySymbol?: string;
  onSuccess: (data: { operator: POSOperatorInfo; posSession: POSSessionInfo }) => void;
  onClose?: () => void;
}

export default function POSOperatorModal({
  isOpen,
  companyId,
  terminalId = 'T01',
  storeName = 'SalesmanPro POS',
  currentUserName,
  currentUserId,
  currencySymbol = 'KES',
  onSuccess,
  onClose,
}: POSOperatorModalProps) {
  const [step, setStep] = useState<'PIN' | 'FLOAT'>('PIN');
  const [authMode, setAuthMode] = useState<'PIN' | 'ADMIN'>('PIN');
  const [code, setCode] = useState('');
  const [openingFloat, setOpeningFloat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);

  // Check if terminal already has an active open session
  useEffect(() => {
    if (!isOpen || !companyId) return;
    let isMounted = true;
    setStep('PIN');
    setCode('');
    setOpeningFloat('');
    setError(null);

    fetch(`/api/pos/session?companyId=${encodeURIComponent(companyId)}&terminalId=${encodeURIComponent(terminalId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const sess = data.data || data.session;
        if (sess && sess.status === 'OPEN') {
          setHasActiveSession(true);
        } else {
          setHasActiveSession(false);
        }
      })
      .catch(() => {
        if (isMounted) setHasActiveSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, companyId, terminalId]);

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

  // Final API execution to open/unlock session
  const executeAuth = useCallback(
    async (mode: 'PIN' | 'ADMIN', floatAmount: number) => {
      setLoading(true);
      setError(null);

      try {
        if (mode === 'PIN') {
          const res = await fetch('/api/pos/auth/login-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId,
              loginCode: code,
              terminalId,
              openingBalance: floatAmount,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || data.error || 'Authentication failed');
          }

          setCode('');
          setOpeningFloat('');
          setStep('PIN');
          onSuccess(data.data);
        } else {
          const res = await fetch('/api/pos/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId,
              terminalId,
              openingBalance: floatAmount,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || data.error || 'Failed to start POS session');
          }

          setOpeningFloat('');
          setStep('PIN');
          onSuccess(data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Authentication error');
        if (mode === 'PIN') {
          setStep('PIN');
          setCode('');
        }
      } finally {
        setLoading(false);
      }
    },
    [code, companyId, terminalId, onSuccess]
  );

  // Handle PIN Submission
  const handleSubmitPin = useCallback(() => {
    if (!code || code.length < 3) {
      setError('Please enter a valid staff or sales agent login code');
      return;
    }

    // If terminal already has an open session, unlock immediately without asking for float
    if (hasActiveSession) {
      executeAuth('PIN', 0);
      return;
    }

    // New shift: prompt for opening cash float
    setAuthMode('PIN');
    setStep('FLOAT');
    setError(null);
  }, [code, hasActiveSession, executeAuth]);

  // Handle Admin Quick Start
  const handleStartAdminSession = useCallback(() => {
    // If terminal already has an open session, unlock immediately without asking for float
    if (hasActiveSession) {
      executeAuth('ADMIN', 0);
      return;
    }

    // New shift: prompt for opening cash float
    setAuthMode('ADMIN');
    setStep('FLOAT');
    setError(null);
  }, [hasActiveSession, executeAuth]);

  // Physical keyboard support on PIN step
  useEffect(() => {
    if (!isOpen || step !== 'PIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        if (onClose) onClose();
        else handleClear();
      } else if (e.key === 'Enter') {
        handleSubmitPin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, handleDigit, handleBackspace, handleClear, handleSubmitPin, onClose]);

  if (!isOpen) return null;

  const isKes = currencySymbol.toUpperCase().includes('KES') || currencySymbol.toUpperCase().includes('KSH');
  const presetChips = isKes ? [0, 500, 1000, 2000, 5000] : [0, 20, 50, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Dismiss / Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}

        {/* STEP 2: DECLARE STARTING CASH FLOAT */}
        {step === 'FLOAT' ? (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
                <BanknotesIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Open Register Shift
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Terminal: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{terminalId}</span> • {storeName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-4 text-center">
              Declare initial seed cash &amp; petty change placed in the drawer.
            </p>

            {/* Float Input */}
            <div className="w-full mb-3">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Starting Cash Amount ({currencySymbol})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-slate-400 text-base">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={openingFloat}
                  onChange={(e) => {
                    setOpeningFloat(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                  className="w-full pl-16 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
                />
              </div>
            </div>

            {/* Quick Preset Float Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full">
              {presetChips.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setOpeningFloat(preset === 0 ? '0' : preset.toString())}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    (openingFloat === preset.toString()) || (preset === 0 && (openingFloat === '0' || openingFloat === '0.00'))
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  {preset === 0 ? '0.00 (Zero Float)' : `+${currencySymbol} ${preset.toLocaleString()}`}
                </button>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="w-full mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-medium">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => executeAuth(authMode, parseFloat(openingFloat) || 0)}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                {loading ? (
                  <span>Opening Register Shift...</span>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Confirm &amp; Open Shift ({currencySymbol} {(parseFloat(openingFloat) || 0).toFixed(2)})</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => executeAuth(authMode, 0)}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition"
                >
                  Start with 0.00 Float
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('PIN');
                    setError(null);
                  }}
                  disabled={loading}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-xl font-bold text-xs transition flex items-center gap-1"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 1: PIN AUTHENTICATION */
          <div className="w-full flex flex-col items-center">
            {/* Terminal Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                <LockClosedIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {hasActiveSession ? 'Unlock Terminal' : storeName}
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Terminal: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{terminalId}</span>
                  {hasActiveSession && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      Shift in Progress
                    </span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 text-center">
              {hasActiveSession
                ? 'Enter your PIN to unlock this register terminal'
                : 'Enter your staff or sales agent login code to start a new shift'}
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
            <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num.toString())}
                  disabled={loading}
                  className="h-13 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="h-13 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase transition-all active:scale-95 shadow-sm"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                disabled={loading}
                className="h-13 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                disabled={loading}
                className="h-13 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <BackspaceIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitPin}
              disabled={loading || code.length === 0}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>{hasActiveSession ? 'Unlock Register' : 'Authenticate & Next'}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Launch for Signed-in Store Admin / Manager */}
            <div className="w-full mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleStartAdminSession}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>Continue as {currentUserName || 'Store Admin'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
