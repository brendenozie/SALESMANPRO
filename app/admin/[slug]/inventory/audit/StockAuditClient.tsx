'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  QrCodeIcon,
  CameraIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useBarcodeScannerWedge, scanAudio } from '@/lib/pos/useBarcodeScannerWedge';
import POSCameraBarcodeScannerModal from '@/components/pos/POSCameraBarcodeScannerModal';

interface AuditLineItem {
  productId: string;
  sku: string;
  name: string;
  image?: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  lastScannedAt: number;
  scanCount: number;
}

interface StockAuditClientProps {
  companyId: string;
  slug: string;
  initialProducts?: any[];
}

export default function StockAuditClient({ companyId, slug, initialProducts = [] }: StockAuditClientProps) {
  const [auditLines, setAuditLines] = useState<AuditLineItem[]>([]);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [lastScanFeedback, setLastScanFeedback] = useState<{ code: string; status: 'found' | 'notfound' } | null>(null);
  const scanFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load products if not preloaded
  useEffect(() => {
    if (products.length > 0) return;
    fetch(`/api/admin/pos-marketplace-listings?companyId=${companyId}&limit=500`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.results) setProducts(data.data.results);
      })
      .catch(() => {});
  }, [companyId, products.length]);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    const normalized = barcode.trim().toLowerCase();

    const matched = products.find(p =>
      (p.barcode && p.barcode.trim().toLowerCase() === normalized) ||
      (p.sku && p.sku.trim().toLowerCase() === normalized) ||
      p.id === barcode ||
      p.name?.toLowerCase() === normalized
    );

    // Show scan feedback overlay
    if (scanFeedbackTimeout.current) clearTimeout(scanFeedbackTimeout.current);
    setLastScanFeedback({ code: barcode, status: matched ? 'found' : 'notfound' });
    scanFeedbackTimeout.current = setTimeout(() => setLastScanFeedback(null), 2000);

    if (!matched) {
      scanAudio.playError();
      return;
    }

    scanAudio.playSuccess();

    setAuditLines(prev => {
      const existingIdx = prev.findIndex(l => l.productId === matched.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          countedQty: updated[existingIdx].countedQty + 1,
          variance: updated[existingIdx].countedQty + 1 - updated[existingIdx].expectedQty,
          lastScannedAt: Date.now(),
          scanCount: updated[existingIdx].scanCount + 1,
        };
        return updated;
      }
      return [
        {
          productId: matched.id,
          sku: matched.sku || matched.id,
          name: matched.name,
          image: matched.images?.[0],
          expectedQty: matched.quantity || 0,
          countedQty: 1,
          variance: 1 - (matched.quantity || 0),
          lastScannedAt: Date.now(),
          scanCount: 1,
        },
        ...prev,
      ];
    });
  }, [products]);

  // Global barcode wedge listener
  useBarcodeScannerWedge({
    enabled: !showCameraScanner,
    onScan: handleBarcodeScanned,
  });

  const handleManualQtyChange = useCallback((productId: string, delta: number) => {
    setAuditLines(prev => prev.map(l => {
      if (l.productId !== productId) return l;
      const newQty = Math.max(0, l.countedQty + delta);
      return { ...l, countedQty: newQty, variance: newQty - l.expectedQty };
    }));
  }, []);

  const handleRemoveLine = useCallback((productId: string) => {
    setAuditLines(prev => prev.filter(l => l.productId !== productId));
  }, []);

  const handleSubmitAudit = useCallback(async () => {
    if (auditLines.length === 0) return alert('No items scanned yet. Scan items to count them.');
    setIsSubmitting(true);
    try {
      const payload = {
        companyId,
        auditDate: new Date().toISOString(),
        lines: auditLines.map(l => ({
          productId: l.productId,
          sku: l.sku,
          name: l.name,
          expectedQty: l.expectedQty,
          countedQty: l.countedQty,
          variance: l.variance,
        })),
      };
      const res = await fetch('/api/admin/inventory/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit audit.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error submitting audit.');
    } finally {
      setIsSubmitting(false);
    }
  }, [auditLines, companyId]);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['SKU', 'Product', 'Expected Qty', 'Counted Qty', 'Variance'].join(','),
      ...auditLines.map(l => [l.sku, `"${l.name}"`, l.expectedQty, l.countedQty, l.variance].join(',')),
    ];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [auditLines]);

  const filteredLines = auditLines.filter(l =>
    !searchTerm || l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVariance = auditLines.reduce((sum, l) => sum + Math.abs(l.variance), 0);
  const withShrinkage = auditLines.filter(l => l.variance < 0).length;
  const withOverage = auditLines.filter(l => l.variance > 0).length;
  const balanced = auditLines.filter(l => l.variance === 0).length;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-14 h-14 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Audit Submitted!</h2>
          <p className="text-zinc-500 text-base mb-8">
            {auditLines.length} SKUs counted. Variance records saved and adjustment vouchers queued for review.
          </p>
          <button
            onClick={() => { setAuditLines([]); setSubmitted(false); }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-600/20 transition"
          >
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
              Stock Audit & Cycle Count
            </h1>
            <p className="text-xs font-medium text-zinc-500">
              Scan barcodes to count physical shelf stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCameraScanner(true)}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-zinc-600 hover:text-indigo-600 transition"
            title="Camera Scanner"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={auditLines.length === 0}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-zinc-600 hover:text-emerald-600 transition disabled:opacity-40"
            title="Export CSV"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmitAudit}
            disabled={auditLines.length === 0 || isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition disabled:opacity-40 flex items-center gap-2"
          >
            {isSubmitting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
            Submit Audit
          </button>
        </div>
      </header>

      {/* STATS BAR */}
      <div className="bg-white dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3 flex items-center gap-6 overflow-x-auto">
        {[
          { label: 'SKUs Counted', value: auditLines.length, color: 'text-zinc-900 dark:text-white' },
          { label: 'Shrinkage', value: withShrinkage, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Overage', value: withOverage, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Balanced', value: balanced, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Variance Units', value: totalVariance, color: totalVariance > 0 ? 'text-rose-600' : 'text-zinc-400' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center min-w-[80px]">
            <span className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold text-center">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-8 space-y-4">
        {/* SCAN PROMPT — when no items yet */}
        {auditLines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 border-2 border-dashed border-indigo-300 dark:border-indigo-800 flex items-center justify-center mb-6">
              <QrCodeIcon className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Ready to Scan</h3>
            <p className="text-zinc-500 max-w-sm text-sm leading-relaxed">
              Point your USB/Bluetooth barcode gun at a shelf label and scan to start counting.
              Use the camera icon for mobile phone scanning.
            </p>
            <div className="mt-8 flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600/10 border border-indigo-200 dark:border-indigo-800 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <BoltIcon className="w-4 h-4" />
              Hardware wedge scanner active — ready for input
            </div>
          </div>
        )}

        {auditLines.length > 0 && (
          <>
            {/* SEARCH */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter audit lines by name or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* AUDIT LINES */}
            <div className="space-y-2">
              {filteredLines.map((line) => {
                const varianceColor = line.variance === 0 ? 'text-emerald-600' : line.variance > 0 ? 'text-amber-600' : 'text-rose-600';
                const varianceBg = line.variance === 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' : line.variance > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900';

                return (
                  <div
                    key={line.productId}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4 hover:shadow-sm transition"
                  >
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                      {line.image ? (
                        <img src={line.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <QrCodeIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{line.name}</h3>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">SKU: {line.sku}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Expected: <span className="font-bold text-zinc-600 dark:text-zinc-300">{line.expectedQty}</span>{' '}
                        · Scans: <span className="font-bold">{line.scanCount}</span>
                      </p>
                    </div>

                    {/* Variance Badge */}
                    <div className={`px-3 py-1.5 rounded-xl border text-center min-w-[70px] ${varianceBg}`}>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold leading-none mb-0.5">Variance</p>
                      <p className={`text-base font-black font-mono ${varianceColor}`}>
                        {line.variance > 0 ? '+' : ''}{line.variance}
                      </p>
                    </div>

                    {/* Count Adjuster */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManualQtyChange(line.productId, -1)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 transition"
                      >
                        <MinusCircleIcon className="w-6 h-6" />
                      </button>
                      <span className="text-xl font-black font-mono w-12 text-center text-zinc-900 dark:text-white">
                        {line.countedQty}
                      </span>
                      <button
                        onClick={() => handleManualQtyChange(line.productId, 1)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-500 transition"
                      >
                        <PlusCircleIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveLine(line.productId)}
                      className="p-2 text-zinc-300 hover:text-rose-500 transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CAMERA SCANNER */}
      <POSCameraBarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={(barcode) => { setShowCameraScanner(false); handleBarcodeScanned(barcode); }}
      />

      {/* SCAN FEEDBACK TOAST */}
      {lastScanFeedback && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-150 ${
            lastScanFeedback.status === 'found'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          {lastScanFeedback.status === 'found' ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5" />
          )}
          <span className="font-bold text-sm">
            {lastScanFeedback.status === 'found' ? 'Item counted' : 'Barcode not found in catalogue'}
          </span>
          <span className="text-xs opacity-75 font-mono">{lastScanFeedback.code}</span>
        </div>
      )}
    </div>
  );
}
