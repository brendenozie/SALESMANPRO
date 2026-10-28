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
  PrinterIcon,
  BoltIcon,
  ShieldCheckIcon,
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
  companyName?: string;
  currency?: string;
  initialProducts?: any[];
}

export default function StockAuditClient({
  companyId,
  slug,
  companyName,
  currency = 'KES',
  initialProducts = []
}: StockAuditClientProps) {
  const [auditLines, setAuditLines] = useState<AuditLineItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`salesmanpro_audit_draft_${companyId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [autoAdjustStock, setAutoAdjustStock] = useState(true);
  const [managerPin, setManagerPin] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastScanFeedback, setLastScanFeedback] = useState<{ code: string; status: 'found' | 'notfound' } | null>(null);
  const scanFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-persist active audit draft to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`salesmanpro_audit_draft_${companyId}`, JSON.stringify(auditLines));
    } catch {}
  }, [auditLines, companyId]);

  // Load physical warehouse products with inventory item levels
  useEffect(() => {
    if (products.length > 0) return;
    fetch(`/api/admin/inventory/label-products?companyId=${companyId}&limit=500`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.results) setProducts(data.data.results);
      })
      .catch(() => {});
  }, [companyId, products.length]);

  const addItemToAudit = useCallback((matched: any, increment: number = 1) => {
    setAuditLines(prev => {
      const existingIdx = prev.findIndex(l => l.productId === matched.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newCount = updated[existingIdx].countedQty + increment;
        updated[existingIdx] = {
          ...updated[existingIdx],
          countedQty: newCount,
          variance: newCount - updated[existingIdx].expectedQty,
          lastScannedAt: Date.now(),
          scanCount: updated[existingIdx].scanCount + 1,
        };
        return updated;
      }
      const expQty = Number(matched.quantity ?? 0);
      return [
        {
          productId: matched.id,
          sku: matched.sku || matched.barcode || matched.id,
          name: matched.name,
          image: matched.images?.[0],
          expectedQty: expQty,
          countedQty: increment,
          variance: increment - expQty,
          lastScannedAt: Date.now(),
          scanCount: 1,
        },
        ...prev,
      ];
    });
  }, []);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    const normalized = barcode.trim().toLowerCase();

    const matched = products.find(p =>
      (p.barcode && p.barcode.trim().toLowerCase() === normalized) ||
      (p.sku && p.sku.trim().toLowerCase() === normalized) ||
      p.id === barcode ||
      p.id?.toLowerCase() === normalized ||
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
    addItemToAudit(matched, 1);
  }, [products, addItemToAudit]);

  // Global barcode wedge listener
  useBarcodeScannerWedge({
    enabled: !showCameraScanner && !showConfirmModal,
    onScan: handleBarcodeScanned,
  });

  const handleManualQtyChange = useCallback((productId: string, delta: number) => {
    setAuditLines(prev => prev.map(l => {
      if (l.productId !== productId) return l;
      const newQty = Math.max(0, l.countedQty + delta);
      return { ...l, countedQty: newQty, variance: newQty - l.expectedQty };
    }));
  }, []);

  const handleSetExactQty = useCallback((productId: string, qty: number) => {
    setAuditLines(prev => prev.map(l => {
      if (l.productId !== productId) return l;
      const newQty = Math.max(0, qty);
      return { ...l, countedQty: newQty, variance: newQty - l.expectedQty };
    }));
  }, []);

  const handleRemoveLine = useCallback((productId: string) => {
    setAuditLines(prev => prev.filter(l => l.productId !== productId));
  }, []);

  const handleResetAudit = useCallback(() => {
    if (auditLines.length === 0) return;
    if (confirm('Are you sure you want to clear current count progress? This will reset the draft.')) {
      setAuditLines([]);
      localStorage.removeItem(`salesmanpro_audit_draft_${companyId}`);
    }
  }, [auditLines.length, companyId]);

  const handleSubmitAudit = useCallback(async () => {
    if (auditLines.length === 0) return alert('No items scanned yet. Scan items to count them.');
    setIsSubmitting(true);
    try {
      const payload = {
        companyId,
        auditDate: new Date().toISOString(),
        autoAdjustStock,
        managerPin: managerPin || undefined,
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
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data);
        setSubmitted(true);
        setShowConfirmModal(false);
        localStorage.removeItem(`salesmanpro_audit_draft_${companyId}`);
      } else {
        alert(data.error || 'Failed to submit audit.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error submitting audit.');
    } finally {
      setIsSubmitting(false);
    }
  }, [auditLines, companyId, autoAdjustStock, managerPin]);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['SKU', 'Product Name', 'System Expected Qty', 'Physical Counted Qty', 'Variance (Diff)', 'Status'].join(','),
      ...auditLines.map(l => {
        const status = l.variance === 0 ? 'BALANCED' : l.variance < 0 ? 'SHORTAGE' : 'OVERAGE';
        return [l.sku, `"${l.name.replace(/"/g, '""')}"`, l.expectedQty, l.countedQty, l.variance, status].join(',');
      }),
    ];
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-audit-${slug}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [auditLines, slug]);

  const handlePrintVoucher = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups to print the audit voucher.');

    const rowsHtml = auditLines.map((l, i) => `
      <tr style="border-bottom: 1px solid #e4e4e7; font-size: 12px;">
        <td style="padding: 8px;">${i + 1}</td>
        <td style="padding: 8px; font-family: monospace;">${l.sku}</td>
        <td style="padding: 8px; font-weight: bold;">${l.name}</td>
        <td style="padding: 8px; text-align: center;">${l.expectedQty}</td>
        <td style="padding: 8px; text-align: center; font-weight: bold;">${l.countedQty}</td>
        <td style="padding: 8px; text-align: center; font-weight: bold; color: ${l.variance === 0 ? '#10b981' : l.variance < 0 ? '#ef4444' : '#f59e0b'};">
          ${l.variance > 0 ? '+' : ''}${l.variance}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Audit & Variance Adjustment Voucher</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #18181b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f4f5; text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #d4d4d8; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18181b; padding-bottom: 16px;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900;">SALESMANPRO INVENTORY AUDIT VOUCHER</h1>
              <p style="margin: 4px 0 0; color: #71717a; font-size: 13px;">Store: <strong>${companyName || slug}</strong> | Currency: <strong>${currency}</strong> | Date: <strong>${new Date().toLocaleString()}</strong></p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 6px 12px; background: #e0e7ff; color: #3730a3; border-radius: 8px; font-weight: bold; font-size: 12px;">VOUCHER #${Date.now().toString().slice(-6)}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; padding: 16px; background: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7;">
            <div><span style="font-size: 11px; color: #71717a; text-transform: uppercase;">Total SKUs</span><div style="font-size: 20px; font-weight: bold;">${auditLines.length}</div></div>
            <div><span style="font-size: 11px; color: #71717a; text-transform: uppercase;">Matched (OK)</span><div style="font-size: 20px; font-weight: bold; color: #10b981;">${auditLines.filter(l => l.variance === 0).length}</div></div>
            <div><span style="font-size: 11px; color: #71717a; text-transform: uppercase;">Shortages</span><div style="font-size: 20px; font-weight: bold; color: #ef4444;">${auditLines.filter(l => l.variance < 0).length}</div></div>
            <div><span style="font-size: 11px; color: #71717a; text-transform: uppercase;">Overages</span><div style="font-size: 20px; font-weight: bold; color: #f59e0b;">${auditLines.filter(l => l.variance > 0).length}</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th style="width: 140px;">SKU / Code</th>
                <th>Item Description</th>
                <th style="width: 100px; text-align: center;">Expected</th>
                <th style="width: 100px; text-align: center;">Counted</th>
                <th style="width: 100px; text-align: center;">Variance</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>

          <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            <div style="border-top: 1px solid #a1a1aa; padding-top: 8px;">
              <p style="font-size: 12px; font-weight: bold; margin: 0;">Stock Auditor Signature:</p>
              <p style="font-size: 11px; color: #71717a; margin-top: 4px;">Name & Date:</p>
            </div>
            <div style="border-top: 1px solid #a1a1aa; padding-top: 8px;">
              <p style="font-size: 12px; font-weight: bold; margin: 0;">Store Manager Approval:</p>
              <p style="font-size: 11px; color: #71717a; margin-top: 4px;">Authorization PIN / Stamp:</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  }, [auditLines, slug, companyName, currency]);

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
        <div className="text-center max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Audit Successfully Submitted!</h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            {submissionResult?.message || `${auditLines.length} SKUs counted and inventory records updated.`}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handlePrintVoucher}
              className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Print Voucher</span>
            </button>
            <button
              onClick={() => { setAuditLines([]); setSubmitted(false); }}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
            >
              Start New Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
              Stock Audit & Cycle Count
            </h1>
            <p className="text-xs text-zinc-500">
              {auditLines.length} items in local draft • Instant auto-save enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {auditLines.length > 0 && (
            <>
              <button
                type="button"
                onClick={handlePrintVoucher}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-1.5 transition"
                title="Print Audit Voucher"
              >
                <PrinterIcon className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Print Voucher</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-1.5 transition"
                title="Export CSV"
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleResetAudit}
                className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
              >
                Clear
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowCameraScanner(true)}
            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
            title="Open Camera Scanner"
          >
            <CameraIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={auditLines.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Finish Audit ({auditLines.length})</span>
          </button>
        </div>
      </header>

      {/* LAST SCAN TOAST */}
      {lastScanFeedback && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${lastScanFeedback.status === 'found' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          <QrCodeIcon className="w-4 h-4" />
          <span>{lastScanFeedback.status === 'found' ? `Counted: ${lastScanFeedback.code}` : `Not found in catalog: ${lastScanFeedback.code}`}</span>
        </div>
      )}

      {/* METRICS BAR */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold text-xs">
            {auditLines.length}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Total Counted</p>
            <p className="text-sm font-black text-zinc-900 dark:text-white">{auditLines.length} SKUs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold text-xs flex items-center justify-center">
            {balanced}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold">Balanced</p>
            <p className="text-sm font-black text-zinc-900 dark:text-white">{balanced} Exact</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold text-xs flex items-center justify-center">
            {withShrinkage}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-rose-600 font-bold">Shortage</p>
            <p className="text-sm font-black text-zinc-900 dark:text-white">{withShrinkage} Items</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold text-xs flex items-center justify-center">
            {withOverage}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-amber-600 font-bold">Overage</p>
            <p className="text-sm font-black text-zinc-900 dark:text-white">{withOverage} Items</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* SCANNER READY & CATALOG SEARCH BAR */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Direct Physical Ledger Sync: Scanning matches true warehouse inventory items and syncs Ghuba online listings.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Quick Catalog Search / Manual Add */}
            <div className="relative flex-1 sm:w-72">
              <PlusCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input
                type="text"
                placeholder="Search catalog to add item..."
                value={catalogSearch}
                onFocus={() => setIsCatalogSearchOpen(true)}
                onChange={(e) => {
                  setCatalogSearch(e.target.value);
                  setIsCatalogSearchOpen(true);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {isCatalogSearchOpen && catalogSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-40 p-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products
                    .filter(p =>
                      p.name?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      p.sku?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      p.barcode?.toLowerCase().includes(catalogSearch.toLowerCase())
                    )
                    .slice(0, 8)
                    .map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          addItemToAudit(p, 1);
                          setCatalogSearch('');
                          setIsCatalogSearchOpen(false);
                          scanAudio.playSuccess();
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition flex items-center justify-between gap-2"
                      >
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">SKU: {p.sku || p.barcode || p.id}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                            Stock: {p.quantity ?? 0}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Filter Counted List */}
            <div className="relative flex-1 sm:w-60">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter counted list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* AUDIT ITEMS LIST */}
        {filteredLines.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <QrCodeIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No items scanned yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Connect your USB/Bluetooth barcode scanner or use the camera icon to start counting warehouse items.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLines.map((line) => {
              const isShortage = line.variance < 0;
              const isOverage = line.variance > 0;

              return (
                <div
                  key={line.productId}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    {line.image ? (
                      <img src={line.image} alt="" className="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                        <QrCodeIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {line.name}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400">SKU: {line.sku}</p>
                    </div>
                  </div>

                  {/* COUNTERS */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Expected</span>
                      <span className="text-sm font-mono font-semibold text-zinc-500">{line.expectedQty}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Counted</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleManualQtyChange(line.productId, -1)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <MinusCircleIcon className="w-5 h-5" />
                        </button>
                        <input
                          type="number"
                          value={line.countedQty}
                          onChange={(e) => handleSetExactQty(line.productId, parseInt(e.target.value) || 0)}
                          className="w-16 p-1 text-center font-mono font-black text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleManualQtyChange(line.productId, 1)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <PlusCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-center min-w-[70px]">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Variance</span>
                      <span
                        className={`text-sm font-mono font-black ${
                          line.variance === 0
                            ? 'text-emerald-500'
                            : isShortage
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {line.variance > 0 ? `+${line.variance}` : line.variance}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.productId)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg transition"
                      title="Remove item"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CONFIRMATION & ADJUSTMENT MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Finalize Stock Audit</h3>
                <p className="text-xs text-zinc-500">Review variances and choose adjustment mode.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Counted Items:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{auditLines.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Items with Shortages:</span>
                <span className="font-bold text-rose-600">{withShrinkage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Items with Overages:</span>
                <span className="font-bold text-amber-600">{withOverage}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdjustStock}
                  onChange={(e) => setAutoAdjustStock(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    Auto-Adjust Physical Ledger & Marketplace Stock
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Directly updates warehouse physical InventoryItem records, base product stock, and synchronizes all active online Ghuba marketplace listings.
                  </span>
                </div>
              </label>

              {autoAdjustStock && (
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Manager Authorization PIN (Optional)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={managerPin}
                    onChange={(e) => setManagerPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                <span>{isSubmitting ? 'Applying...' : 'Confirm & Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA SCANNER MODAL */}
      <POSCameraBarcodeScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onScan={(barcode) => {
          setShowCameraScanner(false);
          handleBarcodeScanned(barcode);
        }}
      />
    </div>
  );
}
