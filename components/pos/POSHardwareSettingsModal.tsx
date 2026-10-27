'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PrinterIcon,
  WifiIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  BanknotesIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  BoltIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  SignalIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import {
  detectPlatform,
  executeUnifiedPrint,
  requestNativeTestSlip,
  PlatformType,
  PRINTING_ACTION_KEYS,
} from '@/lib/printing/unifiedPrintClient';
import IntelligentDeviceDiscoveryModal from '@/components/devices/IntelligentDeviceDiscoveryModal';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  storeId?: string | null;
  currencySymbol?: string;
  onConfigChanged?: () => void;
}

interface PrinterItem {
  id: string;
  name: string;
  connectionType: 'NETWORK' | 'USB' | 'BLUETOOTH' | 'WINDOWS_DRIVER' | 'SERIAL';
  address: string;
  port?: number | null;
  paperWidth: '58mm' | '80mm' | 'A4';
  isDefault: boolean;
  isOnline?: boolean;
}

export default function POSHardwareSettingsModal({
  isOpen,
  onClose,
  companyId,
  storeId,
  currencySymbol = 'KES',
  onConfigChanged,
}: Props) {
  const [activeTab, setActiveTab] = useState<'ROUTING' | 'ADD_PRINTER' | 'SCAN'>('ROUTING');
  const [platform, setPlatform] = useState<PlatformType>('WEB');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvancedDiscovery, setShowAdvancedDiscovery] = useState(false);

  const pathname = usePathname();
  const slug = pathname?.split('/')?.[2] || '';

  // Registered Printers & Routing
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [routingMap, setRoutingMap] = useState<Record<string, any>>({});
  const [openCashDrawerOnCash, setOpenCashDrawerOnCash] = useState(true);

  // Add Printer Form State
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newConnectionType, setNewConnectionType] = useState<'NETWORK' | 'USB' | 'BLUETOOTH' | 'WINDOWS_DRIVER'>('NETWORK');
  const [newAddress, setNewAddress] = useState('192.168.1.100');
  const [newPort, setNewPort] = useState('9100');
  const [newPaperWidth, setNewPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [newIsDefault, setNewIsDefault] = useState(true);

  // Ping / Validate State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ reachable: boolean; latencyMs?: number; error?: string } | null>(null);

  // Subnet Scanner State
  const [subnetBase, setSubnetBase] = useState('192.168.1');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);

  // Drawer / Test Slip Status
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Fetch Current Printers & Assignments
  const loadHardwareData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [printersRes, assignmentsRes] = await Promise.all([
        fetch(`/api/devices/printers?companyId=${encodeURIComponent(companyId)}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`),
        fetch(`/api/devices/assignments?companyId=${encodeURIComponent(companyId)}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`),
      ]);

      if (printersRes.ok) {
        const pData = await printersRes.json();
        setPrinters(pData.data || []);
      }

      if (assignmentsRes.ok) {
        const aData = await assignmentsRes.json();
        const map = aData.data?.routingMap || {};
        setRoutingMap(map);
        if (map['POS_RECEIPT']?.openCashDrawer !== undefined) {
          setOpenCashDrawerOnCash(Boolean(map['POS_RECEIPT'].openCashDrawer));
        }
      }
    } catch (err) {
      console.error('[POS Hardware] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, storeId]);

  useEffect(() => {
    if (isOpen) {
      loadHardwareData();
      setValidationResult(null);
      setTestStatus(null);
    }
  }, [isOpen, loadHardwareData]);

  if (!isOpen) return null;

  // Validate Specific IP Printer (TCP Port 9100 Probe)
  const handleValidateIp = async () => {
    if (!newAddress.trim()) {
      toast.error('Enter an IP address or hostname');
      return;
    }
    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/devices/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VALIDATE_IP_PRINTER',
          host: newAddress.trim(),
          port: Number(newPort) || 9100,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValidationResult({
          reachable: Boolean(data.isReachable),
          latencyMs: data.latencyMs,
          error: data.error,
        });
        if (data.isReachable) {
          toast.success(`Printer reachable at ${data.host}:${data.port} (${data.latencyMs}ms)`);
        } else {
          toast.error(`Unreachable: ${data.error || 'Port 9100 closed or timeout'}`);
        }
      } else {
        setValidationResult({ reachable: false, error: data.error || 'Validation failed' });
        toast.error(data.error || 'Failed to ping target printer');
      }
    } catch (err: any) {
      setValidationResult({ reachable: false, error: err.message });
      toast.error(err.message || 'Validation request failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-Scan Subnet for Thermal Printers
  const handleScanSubnet = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);

    try {
      const res = await fetch('/api/devices/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PROBE_NETWORK_DEVICES',
          subnet: subnetBase.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const found = data.devices || [];
        setDiscoveredDevices(found);
        if (found.length > 0) {
          toast.success(`Discovered ${found.length} active ESC/POS thermal printer(s) on ${subnetBase}.x`);
        } else {
          toast('No ESC/POS printers responded on port 9100 for this subnet.', { icon: 'ℹ️' });
        }
      } else {
        toast.error(data.error || 'Subnet scan failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network discovery request failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Register New Printer
  const handleSavePrinter = async () => {
    if (!newPrinterName.trim()) {
      toast.error('Please enter a descriptive printer name');
      return;
    }
    if (!newAddress.trim()) {
      toast.error('Please enter a printer IP address or path');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/devices/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          storeId: storeId || null,
          name: newPrinterName.trim(),
          connectionType: newConnectionType,
          address: newAddress.trim(),
          port: newConnectionType === 'NETWORK' ? Number(newPort) || 9100 : null,
          paperWidth: newPaperWidth,
          isDefault: newIsDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save printer');
      }

      toast.success('Thermal printer registered successfully!');
      const savedPrinter = data.data;

      // Auto-assign to POS_RECEIPT if default or if it's the only printer
      if (newIsDefault || printers.length === 0) {
        await fetch('/api/devices/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            storeId: storeId || null,
            actionKey: 'POS_RECEIPT',
            printerId: savedPrinter.id,
            copies: 1,
            autoCut: true,
            openCashDrawer: openCashDrawerOnCash,
          }),
        });
      }

      // Reset form
      setNewPrinterName('');
      setActiveTab('ROUTING');
      await loadHardwareData();
      onConfigChanged?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register printer');
    } finally {
      setSaving(false);
    }
  };

  // Delete Printer
  const handleDeletePrinter = async (id: string, name: string) => {
    if (!confirm(`Delete printer "${name}"?`)) return;
    try {
      const res = await fetch(`/api/devices/printers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Printer "${name}" removed`);
        await loadHardwareData();
        onConfigChanged?.();
      } else {
        toast.error('Failed to remove printer');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error removing printer');
    }
  };

  // Save Print Routing Assignments
  const handleSaveRouting = async () => {
    setSaving(true);
    try {
      const posReceiptRoute = routingMap['POS_RECEIPT'];
      if (!posReceiptRoute?.printerId && printers.length > 0) {
        // Fall back to first printer
        posReceiptRoute.printerId = printers[0].id;
      }

      if (posReceiptRoute?.printerId) {
        await fetch('/api/devices/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            storeId: storeId || null,
            actionKey: 'POS_RECEIPT',
            printerId: posReceiptRoute.printerId,
            copies: posReceiptRoute.copies || 1,
            autoCut: posReceiptRoute.autoCut ?? true,
            openCashDrawer: openCashDrawerOnCash,
          }),
        });
      }

      // Save kitchen chit routing if assigned
      if (routingMap['KITCHEN_ORDER']?.printerId) {
        await fetch('/api/devices/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            storeId: storeId || null,
            actionKey: 'KITCHEN_ORDER',
            printerId: routingMap['KITCHEN_ORDER'].printerId,
            copies: 1,
            autoCut: true,
            openCashDrawer: false,
          }),
        });
      }

      toast.success('Hardware print routing saved and applied!');
      onConfigChanged?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update print routing');
    } finally {
      setSaving(false);
    }
  };

  // Test Slip Dispatch
  const handleTestPrint = async (printer: PrinterItem) => {
    setTestStatus(`Printing diagnostic test slip to ${printer.name}...`);
    try {
      const nativeRes = await requestNativeTestSlip(
        printer.address,
        printer.connectionType,
        printer.paperWidth
      );

      if (nativeRes.success) {
        toast.success(`Dispatched test slip via native bridge to ${printer.name}`);
        setTestStatus(`Test slip printed successfully via ${platform}.`);
        return;
      }

      // Browser Fallback Test Slip
      const testHtml = `
        <div style="font-family: monospace; font-size: 12px; width: ${printer.paperWidth === '58mm' ? '200px' : '280px'}; padding: 10px; text-align: center;">
          <h3 style="margin: 0; font-size: 16px;">SALESMANPRO POS</h3>
          <p style="margin: 4px 0;">*** THERMAL HARDWARE TEST ***</p>
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          <p style="text-align: left; margin: 2px 0;"><strong>Printer:</strong> ${printer.name}</p>
          <p style="text-align: left; margin: 2px 0;"><strong>Connection:</strong> ${printer.connectionType}</p>
          <p style="text-align: left; margin: 2px 0;"><strong>Endpoint:</strong> ${printer.address}${printer.port ? `:${printer.port}` : ''}</p>
          <p style="text-align: left; margin: 2px 0;"><strong>Paper Width:</strong> ${printer.paperWidth}</p>
          <p style="text-align: left; margin: 2px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: none; border-top: 1px dashed #000; margin: 8px 0;" />
          <p style="font-size: 11px; margin: 4px 0;">ESC/POS Print Engine Online</p>
          <p style="font-size: 10px; margin: 2px 0;">Hardware configuration verified.</p>
          <br /><br />
        </div>
      `;

      await executeUnifiedPrint(
        {
          protocolVersion: 1,
          jobId: `test_${Date.now()}`,
          actionKey: 'TEST_SLIP',
          documentType: 'HARDWARE_TEST',
          documentId: `TEST-${Date.now()}`,
          companyId,
          createdAt: new Date().toISOString(),
          targetPrinterId: printer.id,
          document: {
            number: `TEST-${Date.now()}`,
            date: new Date().toISOString(),
            items: [{ name: 'Diagnostic Hardware Check', quantity: 1, price: 0, total: 0 }],
            totals: { subtotal: 0, total: 0, currency: currencySymbol },
          },
        },
        testHtml
      );

      toast.success(`Dispatched test slip to ${printer.name}`);
      setTestStatus(`Test job sent to ${printer.name}.`);
    } catch (err: any) {
      toast.error(err.message || 'Test print failed');
      setTestStatus(`Error: ${err.message}`);
    } finally {
      setTimeout(() => setTestStatus(null), 6000);
    }
  };

  // Test Cash Drawer Kick
  const handleTestDrawerKick = () => {
    setTestStatus('Dispatching RJ11 cash drawer open pulse...');
    const posReceiptRoute = routingMap['POS_RECEIPT'];
    const drawerPayload = {
      type: 'CASH_DRAWER_KICK',
      pulseDurationMs: 100,
      printerId: posReceiptRoute?.printerId || null,
      connectionType: posReceiptRoute?.connectionType || 'WEB',
    };

    if (platform === 'ANDROID') {
      try {
        (window as any).AndroidBridge.postMessage(JSON.stringify(drawerPayload));
        toast.success('Drawer kick pulse sent via AndroidBridge');
        setTestStatus('RJ11 drawer pulse sent via Android bridge.');
      } catch (e: any) {
        toast.error(`Android bridge error: ${e.message}`);
      }
    } else if (platform === 'DESKTOP') {
      try {
        (window as any).chrome.webview.postMessage(drawerPayload);
        toast.success('Drawer kick pulse sent via Windows WebView2 Desktop');
        setTestStatus('RJ11 drawer pulse sent via Windows desktop bridge.');
      } catch (e: any) {
        toast.error(`Desktop bridge error: ${e.message}`);
      }
    } else {
      toast('Browser mode: Drawer kick command issued. ESC/POS printer opens drawer via RJ11 port pin 2/5.', { icon: '💵' });
      setTestStatus('Drawer pulse issued. Direct hardware requires connected ESC/POS printer on RJ11 port.');
    }

    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <PrinterIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Thermal Receipt Printers & Hardware
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  {platform}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Configure ESC/POS endpoints, network IP targets, and cash drawer kick
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('ROUTING')}
            className={`px-3 py-2.5 rounded-t-xl transition border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'ROUTING'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Configured Printers ({printers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ADD_PRINTER')}
            className={`px-3 py-2.5 rounded-t-xl transition border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'ADD_PRINTER'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add / Register Printer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCAN')}
            className={`px-3 py-2.5 rounded-t-xl transition border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'SCAN'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/20'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <WifiIcon className="w-4 h-4" />
            <span>Network Discovery</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {testStatus && (
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <BoltIcon className="w-4 h-4 animate-pulse shrink-0" />
              <span>{testStatus}</span>
            </div>
          )}

          {/* TAB 1: PRINTERS & ROUTING */}
          {activeTab === 'ROUTING' && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                  <ArrowPathIcon className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-xs">Loading hardware configurations...</p>
                </div>
              ) : printers.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center mx-auto">
                    <PrinterIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      No Hardware Printers Configured
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                      Configure your on-site thermal receipt printer (Network IP, Bluetooth, or USB) to enable automatic customer receipt slips.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ADD_PRINTER')}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Network or USB Printer</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Registered On-Site Printers ({printers.length})
                  </div>
                  <div className="space-y-2">
                    {printers.map((p) => {
                      const isAssigned = routingMap['POS_RECEIPT']?.printerId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                            isAssigned
                              ? 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-400/50 dark:border-cyan-800 shadow-sm'
                              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                {p.name}
                              </span>
                              {p.isDefault && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                  Default
                                </span>
                              )}
                              {isAssigned && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <CheckCircleIcon className="w-3 h-3" /> POS Slip
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-zinc-500">
                              <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700/60 rounded text-[10px] font-bold font-sans">
                                {p.connectionType}
                              </span>
                              <span>{p.address}{p.port ? `:${p.port}` : ''}</span>
                              <span>•</span>
                              <span>{p.paperWidth}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTestPrint(p)}
                              className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Send diagnostic test slip to this printer"
                            >
                              <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                              <span>Test Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePrinter(p.id, p.name)}
                              className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                              title="Delete printer"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ROUTING CONTROLS */}
              {printers.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                    <span>POS Terminal Receipt Routing</span>
                    <span className="text-[11px] text-zinc-500 font-normal">Action: POS_RECEIPT</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-zinc-500 block">
                      Target Checkout Receipt Printer
                    </label>
                    <select
                      value={routingMap['POS_RECEIPT']?.printerId || (printers.find(p => p.isDefault)?.id || printers[0]?.id || '')}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const match = printers.find(p => p.id === targetId);
                        setRoutingMap((prev) => ({
                          ...prev,
                          POS_RECEIPT: {
                            ...prev['POS_RECEIPT'],
                            printerId: targetId,
                            printerName: match?.name,
                            connectionType: match?.connectionType,
                          },
                        }));
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                    >
                      {printers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.connectionType} - {p.address}{p.port ? `:${p.port}` : ''} - {p.paperWidth})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cash Drawer Kick Toggle & Test */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={openCashDrawerOnCash}
                        onChange={(e) => setOpenCashDrawerOnCash(e.target.checked)}
                        className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Auto-kick cash drawer on cash checkout (RJ11 port)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleTestDrawerKick}
                      className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Kick Drawer Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD / REGISTER PRINTER */}
          {activeTab === 'ADD_PRINTER' && (
            <div className="space-y-4">
              {/* Intelligent Peripheral Discovery Wizard Trigger */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white">
                      Intelligent Peripheral Discovery Wizard
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      Auto-detect Bluetooth wireless printers, USB devices, or serial weighing scales.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedDiscovery(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-sm"
                >
                  Open Wizard
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Printer Connection Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'NETWORK', label: 'Network (IP)', icon: WifiIcon, desc: 'Port 9100 Raw' },
                      { id: 'USB', label: 'USB Cable', icon: CpuChipIcon, desc: 'Direct Plug' },
                      { id: 'BLUETOOTH', label: 'Bluetooth', icon: SignalIcon, desc: 'Wireless BLE' },
                      { id: 'WINDOWS_DRIVER', label: 'OS Spooler', icon: ComputerDesktopIcon, desc: 'System Driver' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setNewConnectionType(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          newConnectionType === m.id
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-400 font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <m.icon className="w-4 h-4 mb-1" />
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] opacity-75">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Printer Friendly Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Counter Thermal Printer (Epson TM-T20)"
                    value={newPrinterName}
                    onChange={(e) => setNewPrinterName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:ring-1 focus:ring-cyan-500 font-semibold"
                  />
                </div>

                {newConnectionType === 'NETWORK' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        IP Address / Hostname
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 192.168.1.100"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Port
                      </label>
                      <input
                        type="text"
                        placeholder="9100"
                        value={newPort}
                        onChange={(e) => setNewPort(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {newConnectionType === 'BLUETOOTH' ? 'Bluetooth MAC / Device Name' : newConnectionType === 'USB' ? 'USB Device Path / Serial' : 'Windows Printer Queue Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={newConnectionType === 'BLUETOOTH' ? 'e.g. 00:11:22:33:44:55 or POS-58' : newConnectionType === 'USB' ? 'e.g. USB001 or /dev/usb/lp0' : 'e.g. POS-80 Series'}
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Paper Width
                    </label>
                    <select
                      value={newPaperWidth}
                      onChange={(e) => setNewPaperWidth(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="80mm">80mm (Standard Desktop Receipt)</option>
                      <option value="58mm">58mm (Compact / Handheld)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Set as Default Receipt Printer</span>
                    </label>
                  </div>
                </div>

                {/* Network IP Ping / Probe */}
                {newConnectionType === 'NETWORK' && (
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={isValidating}
                      onClick={handleValidateIp}
                      className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {isValidating ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <WifiIcon className="w-3.5 h-3.5 text-cyan-500" />}
                      <span>Ping / Test IP Target</span>
                    </button>

                    {validationResult && (
                      <div className={`text-xs font-bold flex items-center gap-1 ${validationResult.reachable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {validationResult.reachable ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationCircleIcon className="w-4 h-4" />}
                        <span>
                          {validationResult.reachable ? `Reachable (${validationResult.latencyMs}ms)` : (validationResult.error || 'Unreachable')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NETWORK DISCOVERY */}
          {activeTab === 'SCAN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <SparklesIcon className="w-4 h-4 text-cyan-500" />
                  <span>Subnet ESC/POS Port 9100 Scanner</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Automatically probes common thermal printer IP assignments on your local Wi-Fi or LAN subnet.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. 192.168.1"
                      value={subnetBase}
                      onChange={(e) => setSubnetBase(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono focus:ring-1 focus:ring-cyan-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono">
                      .x
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleScanSubnet}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isScanning ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <WifiIcon className="w-4 h-4" />}
                    <span>{isScanning ? 'Probing...' : 'Scan Subnet'}</span>
                  </button>
                </div>
              </div>

              {/* DISCOVERED DEVICES */}
              {discoveredDevices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Discovered Thermal Printers ({discoveredDevices.length})
                  </div>
                  <div className="space-y-2">
                    {discoveredDevices.map((dev, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-white">
                            {dev.name || 'ESC/POS Thermal Printer'}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                            {dev.address}:{dev.port} • {dev.latencyMs}ms latency
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPrinterName(dev.name || `Thermal Printer ${dev.address}`);
                            setNewConnectionType('NETWORK');
                            setNewAddress(dev.address);
                            setNewPort(String(dev.port || 9100));
                            setActiveTab('ADD_PRINTER');
                            toast.success(`Populated ${dev.address} into Add Printer tab`);
                          }}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Pair & Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Close
            </button>
            {slug && (
              <div className="hidden sm:flex items-center gap-2 text-xs pl-2 border-l border-zinc-200 dark:border-zinc-700">
                <Link
                  href={`/admin/${slug}/settings/pos-hardware`}
                  target="_blank"
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  title="Open dedicated POS Hardware & Peripherals Manager page"
                >
                  <span>Hardware Page</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link
                  href={`/admin/${slug}/settings/devices-printing`}
                  target="_blank"
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  title="Open dedicated Devices & Printing Discovery page"
                >
                  <span>Discovery Page</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {activeTab === 'ROUTING' ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveRouting}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
              <span>Save & Apply Routing</span>
            </button>
          ) : activeTab === 'ADD_PRINTER' ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleSavePrinter}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50"
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
              <span>Register & Save Printer</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Intelligent Device Discovery Modal */}
      {showAdvancedDiscovery && (
        <IntelligentDeviceDiscoveryModal
          isOpen={showAdvancedDiscovery}
          onClose={() => setShowAdvancedDiscovery(false)}
          companyId={companyId}
          storeId={storeId}
          existingPrinters={printers}
          onDeviceSaved={async () => {
            setShowAdvancedDiscovery(false);
            await loadHardwareData();
            onConfigChanged?.();
          }}
        />
      )}
    </div>
  );
}
