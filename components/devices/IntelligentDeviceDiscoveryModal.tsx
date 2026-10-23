"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PrinterIcon,
  WifiIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  SparklesIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SignalIcon,
  CheckIcon,
  ScaleIcon,
  BanknotesIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import {
  deviceDiscoveryService,
  DiscoveredDevice,
  ConnectionType,
  DeviceCategory,
  DeviceStatus,
  DeviceTestResult,
  inferDeviceSpecs,
} from "@/lib/devices/deviceDiscoveryService";
import { detectPlatform, PlatformType, PRINTING_ACTION_KEYS, PrintingAction } from "@/lib/printing/unifiedPrintClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  storeId?: string | null;
  deviceId?: string | null;
  onDeviceSaved: (printer: any) => Promise<void> | void;
  existingPrinters?: any[];
}

const STEP_TITLES = [
  "1. Connection Type",
  "2. Discover Devices",
  "3. Configure & Pair",
  "4. Hardware Test",
  "5. Assign & Save",
];

const CONNECTION_OPTIONS: Array<{
  type: ConnectionType;
  title: string;
  description: string;
  icon: string;
  supportedPlatforms: PlatformType[];
}> = [
  {
    type: "BLUETOOTH",
    title: "Bluetooth Wireless",
    description: "Paired and discoverable Classic RFCOMM & BLE thermal printers / scanners",
    icon: "📡",
    supportedPlatforms: ["ANDROID", "DESKTOP", "WEB"],
  },
  {
    type: "USB",
    title: "Direct USB Connection",
    description: "Plug-and-play USB thermal receipt, barcode label, or scanner peripherals",
    icon: "🔌",
    supportedPlatforms: ["ANDROID", "DESKTOP", "WEB"],
  },
  {
    type: "NETWORK",
    title: "Wi-Fi & LAN Network",
    description: "IP thermal printers on local subnet (Port 9100 / JetDirect / IPP)",
    icon: "🌐",
    supportedPlatforms: ["ANDROID", "DESKTOP", "WEB"],
  },
  {
    type: "WINDOWS_DRIVER",
    title: "Operating System Spooler",
    description: "Printers registered and managed directly in Windows or host OS",
    icon: "🖥️",
    supportedPlatforms: ["DESKTOP", "WEB"],
  },
  {
    type: "SERIAL",
    title: "Serial / RS-232 / COM",
    description: "Weighing scales, COM printers, and hardware peripheral ports",
    icon: "⚡",
    supportedPlatforms: ["DESKTOP", "WEB"],
  },
  {
    type: "MANUAL",
    title: "Manual Configuration",
    description: "Manually specify IP address, TCP port, baud rate, or device path",
    icon: "⚙️",
    supportedPlatforms: ["ANDROID", "DESKTOP", "WEB"],
  },
];

const CATEGORY_OPTIONS: Array<{
  category: DeviceCategory;
  label: string;
  icon: any;
}> = [
  { category: "PRINTER", label: "Receipt & Invoice Printers", icon: PrinterIcon },
  { category: "SCALE", label: "Weighing Scales", icon: ScaleIcon },
  { category: "SCANNER", label: "Barcode Scanners", icon: QrCodeIcon },
  { category: "CASH_DRAWER", label: "Cash Drawers", icon: BanknotesIcon },
];

export default function IntelligentDeviceDiscoveryModal({
  isOpen,
  onClose,
  companyId,
  storeId,
  deviceId,
  onDeviceSaved,
  existingPrinters = [],
}: Props) {
  const [platform, setPlatform] = useState<PlatformType>("WEB");
  const [step, setStep] = useState<number>(1);

  // Configuration selections
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>("PRINTER");
  const [selectedConnection, setSelectedConnection] = useState<ConnectionType>("NETWORK");

  // Discovery state
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);

  // Custom configuration fields
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customPort, setCustomPort] = useState<number>(9100);
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm" | "A4">("80mm");
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [autoCut, setAutoCut] = useState(true);
  const [openCashDrawer, setOpenCashDrawer] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  // Selected Action Assignments (Step 5)
  const [assignedActions, setAssignedActions] = useState<string[]>(["POS_RECEIPT"]);

  // Test state (Step 4)
  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<DeviceTestResult | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detect platform on mount
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Listen to discovery service updates
  useEffect(() => {
    if (!isOpen) return;
    const unsub = deviceDiscoveryService.subscribe((devs) => {
      setDevices(devs);
    });
    return () => unsub();
  }, [isOpen]);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDevice(null);
      setTestResult(null);
      setValidationSuccess(null);
      setErrorMessage(null);
      setSearchFilter("");

      // Choose sensible default based on platform
      const p = detectPlatform();
      setPlatform(p);
      if (p === "ANDROID") setSelectedConnection("BLUETOOTH");
      else if (p === "DESKTOP") setSelectedConnection("WINDOWS_DRIVER");
      else setSelectedConnection("NETWORK");
    } else {
      deviceDiscoveryService.stopDiscovery();
      setIsScanning(false);
    }
  }, [isOpen]);

  // Filtered devices for Step 2
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (d.connectionType !== selectedConnection) return false;
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        return (
          d.name.toLowerCase().includes(query) ||
          d.address.toLowerCase().includes(query) ||
          (d.manufacturer && d.manufacturer.toLowerCase().includes(query)) ||
          (d.model && d.model.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [devices, selectedConnection, searchFilter]);

  // Start Discovery scan
  const handleStartScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setErrorMessage(null);

      // Check permissions
      const perm = await deviceDiscoveryService.checkPermissions(selectedConnection);
      if (!perm.granted && !perm.canRequest) {
        setErrorMessage(perm.reason || "Permission denied or unavailable on this system.");
        setIsScanning(false);
        return;
      }

      await deviceDiscoveryService.discoverDevices(selectedConnection, {
        category: selectedCategory,
        timeoutMs: 6000,
      });
    } catch (err: any) {
      console.warn("[IntelligentDiscovery] Scan error:", err);
      setErrorMessage(err?.message || "Discovery scan encountered an error");
    } finally {
      setIsScanning(false);
    }
  }, [selectedConnection, selectedCategory]);

  // When moving to Step 2, auto-start scan if not manual
  const handleProceedToDiscovery = async () => {
    if (selectedConnection === "MANUAL") {
      // Direct to configuration
      setStep(3);
      setCustomName("");
      setCustomAddress("");
      setCustomPort(9100);
      setPaperWidth("80mm");
      return;
    }
    setStep(2);
    await handleStartScan();
  };

  // Handle Device Selection (Step 2 -> Step 3)
  const handleSelectDevice = (dev: DiscoveredDevice) => {
    setSelectedDevice(dev);
    setCustomName(dev.name);
    setCustomAddress(dev.address);
    setCustomPort(dev.port || 9100);
    setPaperWidth(dev.capabilities?.paperWidth || "80mm");
    setAutoCut(dev.capabilities?.autoCut ?? true);
    setOpenCashDrawer(dev.capabilities?.openCashDrawer ?? false);
    setBaudRate(dev.capabilities?.baudRate || 9600);
    setStep(3);
  };

  // Execute Connection Validation (Step 4)
  const handleValidateConnection = async () => {
    setIsValidating(true);
    setTestResult(null);
    setErrorMessage(null);

    const devToTest: DiscoveredDevice = selectedDevice || {
      id: `DEV_${Date.now()}`,
      name: customName || "Selected Hardware Device",
      category: selectedCategory,
      connectionType: selectedConnection,
      address: customAddress,
      port: customPort,
      status: "CONNECTING",
      isPaired: true,
      capabilities: {
        paperWidth,
        autoCut,
        openCashDrawer,
        baudRate,
      },
      discoveredAt: new Date().toISOString(),
    };

    try {
      const res = await deviceDiscoveryService.connectDevice(devToTest);
      setValidationSuccess(res.success);
      setTestResult(res);
    } catch (err: any) {
      setValidationSuccess(false);
      setTestResult({
        success: false,
        message: err?.message || "Validation failed",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Execute Live Hardware Test (Step 4)
  const handleTestPrint = async () => {
    setIsValidating(true);
    const devToTest: DiscoveredDevice = selectedDevice || {
      id: `DEV_${Date.now()}`,
      name: customName || "Selected Hardware Device",
      category: selectedCategory,
      connectionType: selectedConnection,
      address: customAddress,
      port: customPort,
      status: "CONNECTING",
      isPaired: true,
      capabilities: {
        paperWidth,
        autoCut,
        openCashDrawer,
        baudRate,
      },
      discoveredAt: new Date().toISOString(),
    };

    try {
      const res = await deviceDiscoveryService.testDevice(devToTest);
      setTestResult(res);
      setValidationSuccess(res.success);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Test print execution failed",
      });
      setValidationSuccess(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Save Printer and Route Actions (Step 5)
  const handleSaveAndAssign = async () => {
    if (!customName.trim() || !customAddress.trim()) {
      setErrorMessage("Printer name and connection address are required");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      // 1. Save Printer to Database
      const res = await fetch("/api/devices/printers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          storeId: storeId || null,
          deviceId: deviceId || null,
          name: customName.trim(),
          connectionType: selectedConnection,
          address: customAddress.trim(),
          port: selectedConnection === "NETWORK" ? Number(customPort) : null,
          paperWidth,
          baudRate: selectedConnection === "SERIAL" ? Number(baudRate) : null,
          isDefault,
          capabilities: {
            autoCut,
            openCashDrawer,
            category: selectedCategory,
            manufacturer: selectedDevice?.manufacturer,
            model: selectedDevice?.model,
          },
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || "Failed to save printer configuration");
      }

      const savedPrinter = json.data;

      // 2. Save Selected Action Routing Assignments
      if (assignedActions.length > 0) {
        for (const actionKey of assignedActions) {
          try {
            await fetch("/api/devices/assignments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyId,
                storeId: storeId || null,
                deviceId: deviceId || null,
                actionKey,
                printerId: savedPrinter.id,
                copies: 1,
                autoCut,
                openCashDrawer: actionKey === "POS_RECEIPT" ? openCashDrawer : false,
              }),
            });
          } catch (assignErr) {
            console.warn(`[IntelligentDiscovery] Failed to bind ${actionKey}:`, assignErr);
          }
        }
      }

      await onDeviceSaved(savedPrinter);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to register printer");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md transition-all">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/70 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Intelligent Device Discovery</h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {platform}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatic pairing, capability detection & instant operational action routing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto text-xs">
          {STEP_TITLES.map((t, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={t} className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    isDone
                      ? "bg-emerald-500 text-slate-950"
                      : isActive
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isDone ? <CheckIcon className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                </span>
                <span
                  className={`font-medium ${
                    isActive ? "text-indigo-300 font-bold" : isDone ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {t}
                </span>
                {idx < STEP_TITLES.length - 1 && <span className="text-slate-700 mx-1">›</span>}
              </div>
            );
          })}
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ========================================================================= */}
          {/* STEP 1: SELECT CONNECTION TYPE & PERIPHERAL CATEGORY                      */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Select Peripheral Device Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const Icon = cat.icon;
                    const isSel = selectedCategory === cat.category;
                    return (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setSelectedCategory(cat.category)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                          isSel
                            ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSel ? "text-indigo-400" : "text-slate-400"}`} />
                        <span className="text-xs font-bold block">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  2. Select Connection Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONNECTION_OPTIONS.map((opt) => {
                    const isSupported = opt.supportedPlatforms.includes(platform);
                    const isSel = selectedConnection === opt.type;

                    return (
                      <div
                        key={opt.type}
                        onClick={() => isSupported && setSelectedConnection(opt.type)}
                        className={`p-4 rounded-2xl border transition cursor-pointer relative flex flex-col justify-between ${
                          !isSupported
                            ? "opacity-40 bg-slate-900/50 border-slate-800 cursor-not-allowed"
                            : isSel
                            ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50 text-white shadow-md"
                            : "bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                            {opt.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{opt.title}</h4>
                              {isSel && <CheckCircleIcon className="w-4 h-4 text-indigo-400" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 font-mono">
                            {opt.supportedPlatforms.join(" • ")}
                          </span>
                          {!isSupported && (
                            <span className="text-amber-400 font-semibold">Requires native app</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DISCOVER DEVICES & SELECTION TABLE                                */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Scan Bar and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by device name, IP, MAC address..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                    {isScanning ? "Scanning..." : "Scan Again"}
                  </button>

                  <button
                    onClick={() => {
                      deviceDiscoveryService.stopDiscovery();
                      setIsScanning(false);
                      setStep(3);
                      setSelectedDevice(null);
                      setCustomName("");
                      setCustomAddress("");
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {/* Discovery Status Banner */}
              {isScanning && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-indigo-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                    Searching for nearby {selectedConnection} hardware...
                  </span>
                  <button
                    onClick={() => {
                      deviceDiscoveryService.stopDiscovery();
                      setIsScanning(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Stop Scan
                  </button>
                </div>
              )}

              {/* Devices Table / List */}
              {filteredDevices.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl space-y-3">
                  <PrinterIcon className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No {selectedConnection} devices found yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Ensure your printer is powered ON and in pairing/discoverable mode, or connected to the same Wi-Fi router.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleStartScan}
                      disabled={isScanning}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
                    >
                      Retry Discovery
                    </button>
                    <button
                      onClick={() => {
                        setStep(3);
                        setSelectedDevice(null);
                        setCustomName("");
                        setCustomAddress("");
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                    >
                      Enter Address Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDevices.map((dev) => {
                    const isAlreadySaved = existingPrinters.some(
                      (p) => p.address?.toLowerCase() === dev.address?.toLowerCase()
                    );

                    return (
                      <div
                        key={dev.id}
                        onClick={() => handleSelectDevice(dev)}
                        className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-indigo-500/80 transition flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 border border-slate-700/60 group-hover:border-indigo-500 transition">
                            <PrinterIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                                {dev.name}
                              </h4>
                              {dev.isDefault && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                                  Default
                                </span>
                              )}
                              {isAlreadySaved && (
                                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                                  Already Saved
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                              <span>{dev.address}</span>
                              {dev.manufacturer && <span>• {dev.manufacturer}</span>}
                              {dev.capabilities?.paperWidth && (
                                <span className="text-slate-300 font-sans">
                                  [{dev.capabilities.paperWidth}]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status pill & Select button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              dev.status === "VERIFIED_READY" || dev.status === "CONNECTED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : dev.status === "PAIRED"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-slate-700 text-slate-300 border border-slate-600"
                            }`}
                          >
                            {dev.status}
                          </span>

                          {dev.signalStrength && (
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <SignalIcon className="w-3.5 h-3.5 text-indigo-400" />
                              {dev.signalStrength}dBm
                            </span>
                          )}

                          <button className="px-3 py-1.5 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition">
                            Select
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CONFIGURE HARDWARE & CAPABILITIES                                 */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white">Connection Details</h4>
                    <p className="text-xs text-slate-400">
                      Populated automatically from device discovery or entered manually.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {selectedConnection}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Friendly Printer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Counter Receipt Printer"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      {selectedConnection === "NETWORK"
                        ? "IP Address or Hostname"
                        : selectedConnection === "BLUETOOTH"
                        ? "Bluetooth MAC Address"
                        : selectedConnection === "WINDOWS_DRIVER"
                        ? "Windows Printer Queue Name"
                        : "Device Path / Address"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        selectedConnection === "NETWORK"
                          ? "192.168.1.100"
                          : selectedConnection === "BLUETOOTH"
                          ? "00:11:22:33:44:55"
                          : "EPSON TM-T20III"
                      }
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {selectedConnection === "NETWORK" && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Port (Default 9100)</label>
                      <input
                        type="number"
                        value={customPort}
                        onChange={(e) => setCustomPort(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {selectedConnection === "SERIAL" && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Baud Rate</label>
                      <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="9600">9600 bps</option>
                        <option value="19200">19200 bps</option>
                        <option value="38400">38400 bps</option>
                        <option value="115200">115200 bps</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Paper Specification</label>
                    <select
                      value={paperWidth}
                      onChange={(e: any) => setPaperWidth(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="80mm">80mm (Standard POS Thermal)</option>
                      <option value="58mm">58mm (Compact Mobile POS)</option>
                      <option value="A4">A4 (Office Laser / Inkjet)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={autoCut}
                        onChange={(e) => setAutoCut(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      Hardware Auto-Cutter Supported
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={openCashDrawer}
                        onChange={(e) => setOpenCashDrawer(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      Kick Cash Drawer on Receipt Print (RJ11)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: HARDWARE CONNECTIVITY VALIDATION & TEST PRINT                      */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Validate Hardware Connection</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Send a verification packet and test slip to ensure the device is responsive.
                    </p>
                  </div>

                  {validationSuccess !== null && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        validationSuccess
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {validationSuccess ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Verified Ready
                        </>
                      ) : (
                        <>
                          <ExclamationCircleIcon className="w-4 h-4 text-rose-400" /> Check Connection
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Device summary pill */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                  <div>
                    Device: <span className="text-white font-medium">{customName}</span>
                  </div>
                  <div>
                    Address: <span className="text-white font-mono">{customAddress}</span>
                  </div>
                  <div>
                    Format: <span className="text-white font-medium">{paperWidth}</span>
                  </div>
                </div>

                {/* Live Test Output Log */}
                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      testResult.success
                        ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                        : "bg-rose-950/30 border-rose-500/30 text-rose-200"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2 mb-1">
                      {testResult.success ? "✓ Test Passed" : "✗ Hardware Error"}
                      {testResult.latencyMs && (
                        <span className="text-[10px] font-mono opacity-70">
                          ({testResult.latencyMs}ms response)
                        </span>
                      )}
                    </div>
                    <div>{testResult.message}</div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleValidateConnection}
                    disabled={isValidating}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    {isValidating ? "Probing Socket..." : "Validate Connection"}
                  </button>

                  <button
                    onClick={handleTestPrint}
                    disabled={isValidating}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
                  >
                    <BoltIcon className="w-4 h-4 text-amber-300" />
                    {isValidating ? "Dispatching..." : "Print Test Slip"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: ASSIGN OPERATIONAL ACTIONS & SAVE PRINTER                          */}
          {/* ========================================================================= */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Assign Operational Printing Roles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select which business actions should automatically dispatch to <strong>{customName}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRINTING_ACTION_KEYS.map((actionKey) => {
                    const isAssigned = assignedActions.includes(actionKey);
                    return (
                      <label
                        key={actionKey}
                        onClick={() => {
                          if (isAssigned) {
                            setAssignedActions(assignedActions.filter((a) => a !== actionKey));
                          } else {
                            setAssignedActions([...assignedActions, actionKey]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                          isAssigned
                            ? "bg-indigo-600/20 border-indigo-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-semibold">{actionKey.replace(/_/g, " ")}</span>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    Set <strong>{customName || "this device"}</strong> as default cashier receipt printer for this store
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>

            {step === 1 && (
              <button
                type="button"
                onClick={handleProceedToDiscovery}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                Continue to Discovery
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedDevice}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-40"
              >
                Configure Selected Device
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => {
                  if (!customName.trim() || !customAddress.trim()) {
                    setErrorMessage("Please enter both printer name and address");
                    return;
                  }
                  setErrorMessage(null);
                  setStep(4);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Proceed to Hardware Test
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Next: Assign Actions
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleSaveAndAssign}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                {isSaving ? "Saving..." : "Save Printer & Route"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
