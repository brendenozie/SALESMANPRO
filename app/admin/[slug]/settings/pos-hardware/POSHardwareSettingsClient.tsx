'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PrinterIcon,
  ScaleIcon,
  ComputerDesktopIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import {
  detectPlatform,
  PRINTING_ACTION_KEYS,
  executeUnifiedPrint,
} from '@/lib/printing/unifiedPrintClient';
import { testSerialScaleConnection, SerialScaleOptions } from '@/lib/pos/scaleReader';
import { openCustomerFacingDisplay } from '@/lib/pos/useCustomerFacingDisplay';

interface Props {
  companyId: string;
  companySlug: string;
  companyName: string;
}

export default function POSHardwareSettingsClient({ companyId, companySlug, companyName }: Props) {
  const [activeTab, setActiveTab] = useState<'printers' | 'scale' | 'drawer' | 'cfd'>('printers');
  const [platform, setPlatform] = useState<'WEB' | 'ANDROID' | 'DESKTOP'>('WEB');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Printers state
  const [routingMap, setRoutingMap] = useState<Record<string, any>>({});
  const [printers, setPrinters] = useState<any[]>([]);

  // Scale state
  const [scaleConfig, setScaleConfig] = useState<SerialScaleOptions>({
    protocol: 'NCI',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    unit: 'kg',
    autoTare: true,
  });
  const [scaleTestStatus, setScaleTestStatus] = useState<string | null>(null);
  const [testingScale, setTestingScale] = useState(false);

  // Cash Drawer state
  const [drawerConfig, setDrawerConfig] = useState({
    autoKickOnCash: true,
    pulseDurationMs: 100,
    printerSlot: 'POS_RECEIPT',
  });
  const [drawerTestStatus, setDrawerTestStatus] = useState<string | null>(null);

  // CFD state
  const [cfdConfig, setCfdConfig] = useState({
    welcomeTitle: `Welcome to ${companyName}`,
    welcomeSubtitle: 'Experience fast, friendly & contactless checkout.',
    promoIntervalSeconds: 7,
    showMpesaTill: true,
    promoSlides: [
      {
        title: `Welcome to ${companyName}!`,
        subtitle: 'Experience fast, friendly & contactless checkout.',
        badge: 'Welcome',
      },
      {
        title: 'Pay with M-Pesa or Card',
        subtitle: 'Instant STK push prompt directly to your Safaricom mobile phone.',
        badge: 'Payment Options',
      },
      {
        title: 'Ask About Special Member Offers',
        subtitle: 'Earn reward points on every qualifying purchase today.',
        badge: 'Store Perks',
      },
    ],
  });

  // Detect platform on mount
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Fetch current assignments & settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Printer assignments
      const res = await fetch(`/api/devices/assignments?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.routingMap) setRoutingMap(data.data.routingMap);
        if (data?.data?.printers) setPrinters(data.data.printers);
      }

      // 2. Fetch Hardware settings
      const hwRes = await fetch(`/api/devices/hardware-settings?companyId=${companyId}`);
      if (hwRes.ok) {
        const hwData = await hwRes.json();
        if (hwData?.settings?.scale) setScaleConfig(hwData.settings.scale);
        if (hwData?.settings?.cashDrawer) setDrawerConfig(hwData.settings.cashDrawer);
        if (hwData?.settings?.cfd) setCfdConfig(hwData.settings.cfd);
      }
    } catch (e) {
      console.error('Failed to load hardware settings:', e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save changes
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save Hardware Settings
      await fetch('/api/devices/hardware-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          settings: {
            scale: scaleConfig,
            cashDrawer: drawerConfig,
            cfd: cfdConfig,
          },
        }),
      });

      // Save Printer routing
      const routesArray = Object.values(routingMap);
      await fetch('/api/devices/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          assignments: routesArray,
        }),
      });

      // Also persist scale config locally for instant POS pickup
      if (typeof window !== 'undefined') {
        localStorage.setItem(`salesmanpro_scale_config_${companyId}`, JSON.stringify(scaleConfig));
        localStorage.setItem(`salesmanpro_drawer_config_${companyId}`, JSON.stringify(drawerConfig));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save hardware settings:', e);
      alert('Error saving hardware settings');
    } finally {
      setSaving(false);
    }
  };

  // Test Scale Connection
  const handleTestScale = async () => {
    setTestingScale(true);
    setScaleTestStatus(null);
    try {
      const res = await testSerialScaleConnection(scaleConfig);
      if (res.connected) {
        setScaleTestStatus(`Scale Connected! Live Weight: ${res.weight?.toFixed(3)} ${res.unit} (Status: ${res.status || 'OK'})`);
      } else {
        setScaleTestStatus(`Connection Failed: ${res.error || 'Port closed or not supported in this browser'}`);
      }
    } catch (err: any) {
      setScaleTestStatus(`Error: ${err.message}`);
    } finally {
      setTestingScale(false);
    }
  };

  // Test Drawer Kick
  const handleTestDrawerKick = () => {
    setDrawerTestStatus('Dispatched cash drawer open pulse...');
    const drawerPayload = {
      type: 'CASH_DRAWER_KICK',
      pulseDurationMs: drawerConfig.pulseDurationMs,
      printerId: routingMap['POS_RECEIPT']?.printerId || null,
      connectionType: routingMap['POS_RECEIPT']?.connectionType || 'WEB',
    };

    if (platform === 'ANDROID') {
      try {
        (window as any).AndroidBridge.postMessage(JSON.stringify(drawerPayload));
        setDrawerTestStatus('Dispatched via AndroidBridge to thermal printer drawer RJ11 port.');
      } catch (e: any) {
        setDrawerTestStatus(`Android Bridge Error: ${e.message}`);
      }
    } else if (platform === 'DESKTOP') {
      try {
        (window as any).chrome.webview.postMessage(drawerPayload);
        setDrawerTestStatus('Dispatched via Windows WebView2 Desktop bridge.');
      } catch (e: any) {
        setDrawerTestStatus(`Desktop Bridge Error: ${e.message}`);
      }
    } else {
      setDrawerTestStatus('Browser mode: Drawer kick command issued. Requires connected ESC/POS printer or native companion.');
    }

    setTimeout(() => setDrawerTestStatus(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              POS Hardware & Peripherals Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {platform} Environment
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Configure thermal receipt printers, electronic scales, cash drawers, and secondary customer displays for <strong className="text-zinc-800 dark:text-zinc-200">{companyName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/${companySlug}/storepos`}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Open Store POS
          </Link>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          <span>Hardware settings saved and synced across all registers.</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('printers')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'printers'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <PrinterIcon className="w-4 h-4" />
          <span>Thermal Printers & Routing</span>
        </button>

        <button
          onClick={() => setActiveTab('scale')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'scale'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <ScaleIcon className="w-4 h-4" />
          <span>Weighing Scale (Serial)</span>
        </button>

        <button
          onClick={() => setActiveTab('drawer')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'drawer'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <BanknotesIcon className="w-4 h-4" />
          <span>Cash Drawer (Auto-Kick)</span>
        </button>

        <button
          onClick={() => setActiveTab('cfd')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'cfd'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          <ComputerDesktopIcon className="w-4 h-4" />
          <span>Customer-Facing Display</span>
        </button>
      </div>

      {/* TAB 1: PRINTERS & TICKET ROUTING */}
      {activeTab === 'printers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-zinc-900 dark:text-zinc-200">Autonomous Printer Splitting:</strong> When cashiers finalize a sale, counter items are printed on the <strong>POS Receipt</strong> printer, food chits automatically route to the <strong>Kitchen</strong>, and beverage lines route to the <strong>Bar</strong> printer based on categories.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRINTING_ACTION_KEYS.map((key) => {
              const current = routingMap[key] || {
                actionKey: key,
                copies: 1,
                autoCut: true,
                openCashDrawer: key === 'POS_RECEIPT',
              };

              return (
                <div
                  key={key}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {key === 'POS_RECEIPT'
                          ? 'Checkout Counter Receipt'
                          : key === 'KITCHEN_ORDER'
                          ? 'Kitchen Order Chit (KOT)'
                          : key === 'BAR_ORDER'
                          ? 'Bar & Beverage Slip'
                          : key === 'BARCODE_LABEL'
                          ? 'Barcode & Shelf Label'
                          : key === 'CUSTOMER_INVOICE'
                          ? 'A4 Full Tax Invoice'
                          : key}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">{key}</p>
                    </div>
                    <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      <PrinterIcon className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 block mb-1">Target Printer</label>
                      <select
                        value={current.printerId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = printers.find((p) => p.id === val);
                          setRoutingMap((prev) => ({
                            ...prev,
                            [key]: {
                              ...current,
                              printerId: val || null,
                              printerName: selected?.name || 'Default Web Spooler',
                              connectionType: selected?.connectionType || 'WEB',
                            },
                          }));
                        }}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Browser Print Dialog / System Default</option>
                        {printers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.connectionType} - {p.paperWidth})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 block mb-1">Copies</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={current.copies || 1}
                          onChange={(e) => {
                            const copies = parseInt(e.target.value) || 1;
                            setRoutingMap((prev) => ({
                              ...prev,
                              [key]: { ...current, copies },
                            }));
                          }}
                          className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300 pb-2">
                          <input
                            type="checkbox"
                            checked={current.autoCut ?? true}
                            onChange={(e) => {
                              setRoutingMap((prev) => ({
                                ...prev,
                                [key]: { ...current, autoCut: e.target.checked },
                              }));
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Auto-Cut</span>
                        </label>
                      </div>
                    </div>

                    {key === 'POS_RECEIPT' && (
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={current.openCashDrawer ?? true}
                            onChange={(e) => {
                              setRoutingMap((prev) => ({
                                ...prev,
                                [key]: { ...current, openCashDrawer: e.target.checked },
                              }));
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Kick Cash Drawer on Sale</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WEIGHING SCALE (WEB SERIAL) */}
      {activeTab === 'scale' && (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <ScaleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Serial Weighing Scale Setup
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Connects directly to USB and RS-232 COM retail scales using the Web Serial API.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestScale}
                disabled={testingScale}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                <BoltIcon className={`w-4 h-4 ${testingScale ? 'animate-spin' : ''}`} />
                <span>{testingScale ? 'Testing Port...' : 'Test Connection'}</span>
              </button>
            </div>

            {scaleTestStatus && (
              <div className={`p-4 rounded-2xl text-xs font-mono font-semibold ${scaleTestStatus.includes('Connected') ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
                {scaleTestStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Protocol Standard
                </label>
                <select
                  value={scaleConfig.protocol}
                  onChange={(e) => setScaleConfig((prev) => ({ ...prev, protocol: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NCI">NCI / Fairbanks / Datalogic Standard</option>
                  <option value="TOLEDO">Mettler-Toledo Continuous</option>
                  <option value="CAS">CAS Corp (PD-II / AP-1)</option>
                  <option value="AVERY">Avery Weigh-Tronix</option>
                </select>
                <p className="text-[11px] text-zinc-400 mt-1">Recommended: NCI format for 90% of retail checkout scales.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Baud Rate (bps)
                </label>
                <select
                  value={scaleConfig.baudRate}
                  onChange={(e) => setScaleConfig((prev) => ({ ...prev, baudRate: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={2400}>2400 baud</option>
                  <option value={4800}>4800 baud</option>
                  <option value={9600}>9600 baud (Default)</option>
                  <option value={19200}>19200 baud</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Parity
                </label>
                <select
                  value={scaleConfig.parity}
                  onChange={(e) => setScaleConfig((prev) => ({ ...prev, parity: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="none">None (Standard)</option>
                  <option value="even">Even</option>
                  <option value="odd">Odd</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Weight Unit
                </label>
                <select
                  value={scaleConfig.unit}
                  onChange={(e) => setScaleConfig((prev) => ({ ...prev, unit: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={scaleConfig.autoTare ?? true}
                  onChange={(e) => setScaleConfig((prev) => ({ ...prev, autoTare: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable automatic tare deduction for weighed container packaging</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASH DRAWER */}
      {activeTab === 'drawer' && (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Cash Drawer Pulse & Auto-Kick
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Controls automatic 24V/12V solenoid kick signals sent through the RJ11 port of receipt printers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestDrawerKick}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <BoltIcon className="w-4 h-4" />
                <span>Test Kick Drawer</span>
              </button>
            </div>

            {drawerTestStatus && (
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-semibold">
                {drawerTestStatus}
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={drawerConfig.autoKickOnCash}
                  onChange={(e) => setDrawerConfig((prev) => ({ ...prev, autoKickOnCash: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                    Auto-Kick Drawer on Cash Settlement
                  </span>
                  <span className="text-xs text-zinc-500">
                    Automatically fires ESC/POS drawer pulse whenever a cash sale or cash split tender is finalized.
                  </span>
                </div>
              </label>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                  Solenoid Pulse Duration (milliseconds)
                </label>
                <input
                  type="number"
                  min={50}
                  max={300}
                  step={10}
                  value={drawerConfig.pulseDurationMs}
                  onChange={(e) => setDrawerConfig((prev) => ({ ...prev, pulseDurationMs: parseInt(e.target.value) || 100 }))}
                  className="w-48 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono font-semibold"
                />
                <p className="text-xs text-zinc-400 mt-1">Recommended: 100ms for standard Epson / Star / POS-80 cash drawers.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER-FACING DISPLAY (CFD) */}
      {activeTab === 'cfd' && (
        <div className="space-y-6 max-w-4xl animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
                  <ComputerDesktopIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Customer-Facing Display (CFD) Screen
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Customizes the secondary monitor shown to shoppers at checkout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openCustomerFacingDisplay()}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-95"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                <span>Launch CFD Window</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                    Store Welcome Greeting
                  </label>
                  <input
                    type="text"
                    value={cfdConfig.welcomeTitle}
                    onChange={(e) => setCfdConfig((prev) => ({ ...prev, welcomeTitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                    Welcome Subtitle
                  </label>
                  <input
                    type="text"
                    value={cfdConfig.welcomeSubtitle}
                    onChange={(e) => setCfdConfig((prev) => ({ ...prev, welcomeSubtitle: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Promotional Slide Cards */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Idle Promotional Carousel Slides
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCfdConfig((prev) => ({
                        ...prev,
                        promoSlides: [
                          ...prev.promoSlides,
                          { title: 'New Promotion Title', subtitle: 'Special offer description', badge: 'Promotion' },
                        ],
                      }));
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cfdConfig.promoSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-start gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Badge (e.g. Special Offer)"
                            value={slide.badge}
                            onChange={(e) => {
                              const updated = [...cfdConfig.promoSlides];
                              updated[idx].badge = e.target.value;
                              setCfdConfig((prev) => ({ ...prev, promoSlides: updated }));
                            }}
                            className="w-40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Heading"
                            value={slide.title}
                            onChange={(e) => {
                              const updated = [...cfdConfig.promoSlides];
                              updated[idx].title = e.target.value;
                              setCfdConfig((prev) => ({ ...prev, promoSlides: updated }));
                            }}
                            className="flex-1 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Subtitle description"
                          value={slide.subtitle}
                          onChange={(e) => {
                            const updated = [...cfdConfig.promoSlides];
                            updated[idx].subtitle = e.target.value;
                            setCfdConfig((prev) => ({ ...prev, promoSlides: updated }));
                          }}
                          className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                        />
                      </div>

                      {cfdConfig.promoSlides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = cfdConfig.promoSlides.filter((_, i) => i !== idx);
                            setCfdConfig((prev) => ({ ...prev, promoSlides: updated }));
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
