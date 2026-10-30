'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  PrinterIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { executeUnifiedPrint } from '@/lib/printing/unifiedPrintClient';
import {
  buildPosReportPrintPayload,
  renderPosReportHtml,
} from '@/lib/printing/posReportRenderer';
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
  const [step, setStep] = useState<'PIN' | 'OVERDUE' | 'FLOAT'>('PIN');
  const [authMode, setAuthMode] = useState<'PIN' | 'ADMIN'>('PIN');
  const [code, setCode] = useState('');
  const [openingFloat, setOpeningFloat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);

  // Overdue Shift Resolution State
  const [overdueSession, setOverdueSession] = useState<any | null>(null);
  const [countedOverdueCash, setCountedOverdueCash] = useState<string>('');
  const [closingOverdue, setClosingOverdue] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Check if terminal already has an active open session and whether it is overdue
  useEffect(() => {
    if (!isOpen || !companyId) {
      prevIsOpenRef.current = false;
      return;
    }

    const wasClosed = !prevIsOpenRef.current;
    prevIsOpenRef.current = true;

    // Only reset step and inputs if modal transitioned from closed to open
    if (wasClosed) {
      setStep('PIN');
      setCode('');
      setOpeningFloat('');
      setError(null);
    }

    let isMounted = true;

    fetch(`/api/pos/session?companyId=${encodeURIComponent(companyId)}&terminalId=${encodeURIComponent(terminalId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const sess = data.data || data.session;
        if (sess && sess.status === 'OPEN') {
          if (sess.isOverdue) {
            setHasActiveSession(false);
            setOverdueSession(sess);
            setCountedOverdueCash((sess.expectedCash || 0).toString());
          } else {
            setHasActiveSession(true);
            setOverdueSession(null);
          }
        } else {
          setHasActiveSession(false);
          setOverdueSession(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasActiveSession(false);
          setOverdueSession(null);
        }
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

  // Close Overdue Shift & Print Z-Report
  const handleCloseOverdueShift = async (cashAmountToClose: number) => {
    if (!overdueSession) return;
    setClosingOverdue(true);
    setError(null);

    try {
      const res = await fetch('/api/pos/session/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: overdueSession.id,
          companyId,
          countedCash: cashAmountToClose,
          closingBalance: cashAmountToClose,
          notes: `Closed overdue shift from ${overdueSession.openedAtFormatted || 'previous day'} on morning login`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to close previous shift');
      }

      // Automatically dispatch official Z-Report to receipt printer if report data returned
      if (data.data?.report) {
        const payload = buildPosReportPrintPayload(data.data.report);
        const html = renderPosReportHtml(data.data.report, '80mm');
        executeUnifiedPrint(payload, html).catch((e) => {
          console.warn('[Z-Report Print Warning]', e);
        });
      }

      toast.success("Yesterday's shift closed & Z-Report generated successfully.");

      // Shift is closed cleanly. Clear overdue state and advance to Starting Float for today's new shift
      setOverdueSession(null);
      setHasActiveSession(false);
      setStep('FLOAT');
    } catch (err: any) {
      setError(err.message || 'Failed to close overdue shift');
    } finally {
      setClosingOverdue(false);
    }
  };

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

          if (data.data?.isOverdue) {
            setOverdueSession(data.data.overdueSession);
            setCountedOverdueCash((data.data.overdueSession?.expectedCash || 0).toString());
            setStep('OVERDUE');
            return;
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

          if (data.data?.isOverdue) {
            setOverdueSession(data.data.overdueSession);
            setCountedOverdueCash((data.data.overdueSession?.expectedCash || 0).toString());
            setStep('OVERDUE');
            return;
          }

          setOpeningFloat('');
          setStep('PIN');
          onSuccess(data.data);
        }
      } catch (err: any) {
        const isOfflineError =
          (typeof navigator !== 'undefined' && !navigator.onLine) ||
          err?.message?.includes('fetch') ||
          err?.name === 'TypeError';

        if (isOfflineError) {
          // Offline Shift Unlock / Start using Provisioned Local Operator Context
          const cachedSessionRaw =
            typeof window !== 'undefined'
              ? window.localStorage.getItem(`pos:activeSession:${companyId}`)
              : null;
          let fallbackOperator: POSOperatorInfo = {
            id: currentUserId || `off_op_${companyId.slice(-6)}`,
            name: currentUserName || 'Offline POS Operator',
            role: mode === 'ADMIN' ? 'ADMIN' : 'CASHIER',
            jobTitle: mode === 'ADMIN' ? 'Store Manager' : 'POS Cashier',
            permissions: ['POS_ACCESS'],
          };
          if (cachedSessionRaw) {
            try {
              const parsed = JSON.parse(cachedSessionRaw);
              if (parsed?.operator) fallbackOperator = parsed.operator;
            } catch {}
          }

          const offlinePosSession: POSSessionInfo = {
            id: `off_sess_${terminalId}_${Date.now()}`,
            terminalId,
            status: 'OPEN',
            openedAt: new Date().toISOString(),
          };

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              `pos:activeSession:${companyId}`,
              JSON.stringify({ operator: fallbackOperator, posSession: offlinePosSession })
            );
          }

          toast.success('Offline POS Shift opened on this device');
          setCode('');
          setOpeningFloat('');
          setStep('PIN');
          onSuccess({ operator: fallbackOperator, posSession: offlinePosSession });
          return;
        }

        setError(err.message || 'Authentication error');
        if (mode === 'PIN') {
          setCode('');
        }
      } finally {
        setLoading(false);
      }
    },
    [code, companyId, terminalId, onSuccess]
  );

  // Handle PIN Submission
  const handleSubmitPin = useCallback(async () => {
    if (!code || code.length < 3) {
      setError('Please enter a valid staff or sales agent login code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If overdue session exists, verify PIN and present Overdue Shift Closeout
      if (overdueSession) {
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
          throw new Error(data.message || data.error || 'Invalid login code');
        }

        setAuthMode('PIN');
        if (data.data?.overdueSession) {
          setOverdueSession(data.data.overdueSession);
          setCountedOverdueCash((data.data.overdueSession.expectedCash || 0).toString());
        }
        setStep('OVERDUE');
        setLoading(false);
        return;
      }

      // If active session exists on current day -> unlock register directly
      if (hasActiveSession) {
        await executeAuth('PIN', 0);
        return;
      }

      // New shift: prompt for opening cash float
      setAuthMode('PIN');
      setStep('FLOAT');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  }, [code, hasActiveSession, overdueSession, companyId, terminalId, executeAuth]);

  // Handle Admin Quick Start
  const handleStartAdminSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (overdueSession) {
        setAuthMode('ADMIN');
        setCountedOverdueCash((overdueSession.expectedCash || 0).toString());
        setStep('OVERDUE');
        setLoading(false);
        return;
      }

      if (hasActiveSession) {
        await executeAuth('ADMIN', 0);
        return;
      }

      setAuthMode('ADMIN');
      setStep('FLOAT');
    } catch (err: any) {
      setError(err.message || 'Admin authentication error');
    } finally {
      setLoading(false);
    }
  }, [hasActiveSession, overdueSession, executeAuth]);

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

  const expectedOverdueCash = overdueSession ? (Number(overdueSession.expectedCash) || 0) : 0;
  const enteredOverdueCash = parseFloat(countedOverdueCash) || 0;
  const overdueVariance = enteredOverdueCash - expectedOverdueCash;

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

        {/* STEP A: OVERDUE SHIFT FROM YESTERDAY DETECTED */}
        {step === 'OVERDUE' && overdueSession ? (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                <ExclamationTriangleIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Overdue Shift Detected
                </h2>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Terminal: {terminalId} • Shift from Previous Day
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-3 text-center">
              A register shift from yesterday was left open. Close it now to reconcile the drawer and generate yesterday&apos;s fiscal Z-Report before opening today&apos;s shift.
            </p>

            {/* Overdue Shift Summary Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 mb-3 border border-slate-200 dark:border-slate-700/60 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Shift Opened:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {overdueSession.openedAtFormatted || 'Yesterday'} ({overdueSession.hoursOpen || 20}h ago)
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Opened By:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {overdueSession.operatorName || 'Previous Operator'}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Starting Float:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {currencySymbol} {(Number(overdueSession.openingBalance) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Cash Sales Collected:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{currencySymbol} {(Number(overdueSession.cashSales) || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 font-black text-sm">
                <span className="text-slate-900 dark:text-white">Expected Cash in Drawer:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">
                  {currencySymbol} {expectedOverdueCash.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Counted Cash Input */}
            <div className="w-full mb-3">
              <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Closing Cash Count ({currencySymbol})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-slate-400 text-base">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={countedOverdueCash}
                  onChange={(e) => {
                    setCountedOverdueCash(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                  className="w-full pl-16 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition shadow-inner"
                />
              </div>

              {/* Variance Indicator */}
              <div className="mt-1.5 flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">Drawer Discrepancy:</span>
                <span className={overdueVariance === 0 ? 'text-emerald-500' : overdueVariance > 0 ? 'text-blue-500' : 'text-rose-500'}>
                  {overdueVariance === 0
                    ? '✓ Exact Match (0.00 variance)'
                    : `${overdueVariance > 0 ? '+' : ''}${currencySymbol} ${overdueVariance.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="w-full mb-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-medium">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleCloseOverdueShift(enteredOverdueCash)}
                disabled={closingOverdue}
                className="w-full py-3.5 px-6 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                {closingOverdue ? (
                  <span>Closing Shift &amp; Generating Z-Report...</span>
                ) : (
                  <>
                    <PrinterIcon className="w-5 h-5" />
                    <span>Close Yesterday&apos;s Shift &amp; Print Z-Report</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCloseOverdueShift(expectedOverdueCash)}
                disabled={closingOverdue}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <CheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Auto-Close with Expected Cash ({currencySymbol} {expectedOverdueCash.toLocaleString()})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('PIN');
                  setError(null);
                }}
                disabled={closingOverdue}
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-xs transition text-center"
              >
                Cancel / Back to PIN
              </button>
            </div>
          </div>
        ) : step === 'FLOAT' ? (
          /* STEP B: DECLARE STARTING CASH FLOAT (TODAY'S FRESH SHIFT) */
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
              Declare initial seed cash &amp; petty change placed in the drawer for today&apos;s shift.
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeAuth(authMode, parseFloat(openingFloat) || 0);
                    }
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
          /* STEP C: PIN AUTHENTICATION */
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
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      overdueSession
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {overdueSession ? 'Overdue Shift' : 'Shift in Progress'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-4 text-center">
              {overdueSession
                ? 'Enter your PIN to resolve and close yesterday\'s overdue shift'
                : hasActiveSession
                ? 'Enter your PIN to unlock this register terminal'
                : 'Enter your staff or sales agent login code to start a new shift'}
            </p>

            {/* Overdue Warning Alert on PIN Screen */}
            {overdueSession && (
              <div className="w-full mb-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-medium">
                <ClockIcon className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Notice: Shift opened on {overdueSession.openedAtFormatted || 'yesterday'} was not closed. Log in to close it and balance the register.
                </span>
              </div>
            )}

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
                  <span>
                    {overdueSession
                      ? 'Review Overdue Shift'
                      : hasActiveSession
                      ? 'Unlock Register'
                      : 'Authenticate & Next'}
                  </span>
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
                <span>
                  {overdueSession
                    ? `Resolve as ${currentUserName || 'Store Admin'}`
                    : `Continue as ${currentUserName || 'Store Admin'}`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
