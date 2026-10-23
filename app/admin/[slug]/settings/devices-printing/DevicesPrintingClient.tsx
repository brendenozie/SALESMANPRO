"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  PrinterIcon,
  WifiIcon,
  CpuChipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ScaleIcon,
  BanknotesIcon,
  QrCodeIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import {
  detectPlatform,
  requestDiscoveredPrinters,
  requestNativeTestSlip,
  PlatformType,
  DiscoveredNativePrinter,
  PRINTING_ACTION_KEYS,
} from "@/lib/printing/unifiedPrintClient";
import IntelligentDeviceDiscoveryModal from "@/components/devices/IntelligentDeviceDiscoveryModal";

interface Props {
  companyId: string;
  companySlug: string;
  companyName: string;
  initialStoreId?: string;
  initialDeviceId?: string;
}

interface SavedPrinter {
  id: string;
  companyId: string;
  storeId?: string | null;
  deviceId?: string | null;
  name: string;
  connectionType: "BLUETOOTH" | "NETWORK" | "WINDOWS_DRIVER" | "SERIAL" | "USB";
  address: string;
  port?: number | null;
  paperWidth: "58mm" | "80mm" | "A4";
  baudRate?: number | null;
  isDefault: boolean;
  isOnline: boolean;
  capabilities?: {
    autoCut?: boolean;
    openCashDrawer?: boolean;
    barcode?: boolean;
    category?: string;
    manufacturer?: string;
    model?: string;
  };
}

interface ActionRouteConfig {
  assignmentId?: string | null;
  actionKey: string;
  printerId?: string | null;
  printerName?: string;
  printerAddress?: string | null;
  connectionType?: string;
  paperWidth?: string;
  copies: number;
  autoCut: boolean;
  openCashDrawer: boolean;
  templateId?: string | null;
}

const ACTION_METADATA: Record<
  string,
  { label: string; description: string; defaultPaper: "58mm" | "80mm" | "A4"; icon: string; recommendedDevice: string }
> = {
  POS_RECEIPT: {
    label: "POS Sales Receipt",
    description: "Customer checkout receipts printed at checkout counter",
    defaultPaper: "80mm",
    icon: "🧾",
    recommendedDevice: "Counter Thermal (80mm / 58mm)",
  },
  CUSTOMER_INVOICE: {
    label: "Customer Tax Invoice",
    description: "Full statutory billing documents and statements",
    defaultPaper: "A4",
    icon: "📄",
    recommendedDevice: "Office Laser / Inkjet Printer (A4)",
  },
  KITCHEN_ORDER: {
    label: "Kitchen Order Ticket (KOT)",
    description: "Food preparation chits routed to kitchen stations",
    defaultPaper: "80mm",
    icon: "🍳",
    recommendedDevice: "Kitchen Thermal (Network / Bluetooth)",
  },
  BAR_ORDER: {
    label: "Bar Drinks Ticket",
    description: "Drink and beverage preparation slips routed to the bar",
    defaultPaper: "80mm",
    icon: "🍸",
    recommendedDevice: "Bar Thermal (80mm)",
  },
  BARCODE_LABEL: {
    label: "Barcode / Price Labels",
    description: "Product barcode stickers and shelf tag labels",
    defaultPaper: "58mm",
    icon: "🏷️",
    recommendedDevice: "Direct Thermal Label Printer (58mm)",
  },
  STUDENT_REPORT: {
    label: "Academic / Exam Report Card",
    description: "Student progress reports, transcripts, and certificates",
    defaultPaper: "A4",
    icon: "🎓",
    recommendedDevice: "High-Resolution Laser Printer (A4)",
  },
  LOGISTICS_SLIP: {
    label: "Delivery / Dispatch Slip",
    description: "Driver delivery notes and shipping manifest slips",
    defaultPaper: "80mm",
    icon: "🚚",
    recommendedDevice: "Warehouse / Mobile Thermal Slip",
  },
};

export default function DevicesPrintingClient({
  companyId,
  companySlug,
  companyName,
  initialStoreId,
  initialDeviceId,
}: Props) {
  const [platform, setPlatform] = useState<PlatformType>("WEB");
  const [activeTab, setActiveTab] = useState<"ROUTING" | "PRINTERS">("ROUTING");
  const [deviceFilter, setDeviceFilter] = useState<"ALL" | "PRINTERS" | "SCALES" | "SCANNERS" | "DRAWERS">("ALL");
  const [printers, setPrinters] = useState<SavedPrinter[]>([]);
  const [routingMap, setRoutingMap] = useState<Record<string, ActionRouteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Intelligent Device Discovery Modal State
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Detect platform on mount
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Fetch registered printers and routing assignments
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [printersRes, assignmentsRes] = await Promise.all([
        fetch(`/api/devices/printers?companyId=${companyId}${initialStoreId ? `&storeId=${initialStoreId}` : ""}`),
        fetch(`/api/devices/assignments?companyId=${companyId}${initialStoreId ? `&storeId=${initialStoreId}` : ""}`),
      ]);

      const [printersJson, assignmentsJson] = await Promise.all([
        printersRes.json(),
        assignmentsRes.json(),
      ]);

      if (printersJson.success && printersJson.data) {
        setPrinters(printersJson.data);
      }
      if (assignmentsJson.success && assignmentsJson.data?.routingMap) {
        setRoutingMap(assignmentsJson.data.routingMap);
      }
    } catch (err: any) {
      console.error("[DevicesPrintingClient] Load error:", err);
      showToast(err?.message || "Failed to load hardware configurations", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, initialStoreId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // One-Click Native Discovery Trigger
  const handleQuickScan = () => {
    setIsDiscoveryModalOpen(true);
  };

  // Test slip print
  const handleTestPrint = async (printer: SavedPrinter) => {
    try {
      setTestingId(printer.id);
      const res = await requestNativeTestSlip(printer.address, printer.connectionType, printer.paperWidth);
      if (res.success) {
        showToast(`Test slip dispatched to ${printer.name}!`, "success");
      } else {
        showToast(res.error || "Failed to print test slip", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Test print error", "error");
    } finally {
      setTestingId(null);
    }
  };

  // Set default receipt printer
  const handleSetDefault = async (printer: SavedPrinter) => {
    try {
      const res = await fetch("/api/devices/printers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...printer,
          isDefault: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`'${printer.name}' set as default receipt printer!`, "success");
        await loadData();
      } else {
        showToast(json.error || "Failed to set default", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to set default", "error");
    }
  };

  // Delete printer
  const handleDeletePrinter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove '${name}'? Any assigned actions will revert to default.`)) return;

    try {
      const res = await fetch(`/api/devices/printers?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Device removed successfully`, "success");
        await loadData();
      } else {
        showToast(json.error || "Failed to delete printer", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to delete printer", "error");
    }
  };

  // Update routing assignment for an action key
  const handleSaveActionAssignment = async (actionKey: string, printerId: string) => {
    try {
      setSavingAction(actionKey);
      const fallbackConfig: ActionRouteConfig = {
        actionKey,
        printerId: null,
        copies: 1,
        autoCut: true,
        openCashDrawer: actionKey === "POS_RECEIPT",
        templateId: null,
      };
      const current = routingMap[actionKey] || fallbackConfig;

      const res = await fetch("/api/devices/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          storeId: initialStoreId,
          deviceId: initialDeviceId,
          actionKey,
          printerId,
          copies: current.copies || 1,
          autoCut: current.autoCut ?? true,
          openCashDrawer: current.openCashDrawer ?? false,
          templateId: current.templateId || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const meta = ACTION_METADATA[actionKey];
        const assignedPrinter = printers.find((p) => p.id === printerId);
        showToast(
          `Routed ${meta?.label || actionKey} -> ${assignedPrinter?.name || "Printer"}`,
          "success"
        );
        await loadData();
      } else {
        showToast(json.error || "Failed to save routing", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to save routing", "error");
    } finally {
      setSavingAction(null);
    }
  };

  // Update copies / autoCut / cash drawer inline
  const handleUpdateOption = async (actionKey: string, field: "copies" | "autoCut" | "openCashDrawer", val: any) => {
    const current = routingMap[actionKey];
    if (!current?.printerId) {
      showToast("Please select a target printer first", "error");
      return;
    }

    try {
      setSavingAction(actionKey);
      const res = await fetch("/api/devices/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          storeId: initialStoreId,
          deviceId: initialDeviceId,
          actionKey,
          printerId: current.printerId,
          copies: field === "copies" ? Number(val) : current.copies,
          autoCut: field === "autoCut" ? !!val : current.autoCut,
          openCashDrawer: field === "openCashDrawer" ? !!val : current.openCashDrawer,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Updated options for ${ACTION_METADATA[actionKey]?.label || actionKey}`, "success");
        await loadData();
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update option", "error");
    } finally {
      setSavingAction(null);
    }
  };

  // Filtered devices list for the Connected Hardware tab
  const filteredPrinters = useMemo(() => {
    return printers.filter((p) => {
      if (deviceFilter === "ALL") return true;
      const cat = p.capabilities?.category?.toUpperCase() || "PRINTER";
      if (deviceFilter === "PRINTERS") return cat === "PRINTER";
      if (deviceFilter === "SCALES") return cat === "SCALE" || p.connectionType === "SERIAL";
      if (deviceFilter === "SCANNERS") return cat === "SCANNER";
      if (deviceFilter === "DRAWERS") return cat === "CASH_DRAWER";
      return true;
    });
  }, [printers, deviceFilter]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 border ${
            toastMessage.type === "success"
              ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-200 border-rose-500/40"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Intelligent Device Discovery & Configuration Wizard Modal */}
      <IntelligentDeviceDiscoveryModal
        isOpen={isDiscoveryModalOpen}
        onClose={() => setIsDiscoveryModalOpen(false)}
        companyId={companyId}
        storeId={initialStoreId}
        deviceId={initialDeviceId}
        existingPrinters={printers}
        onDeviceSaved={async () => {
          showToast("Device registered and ready for operation!", "success");
          await loadData();
        }}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <PrinterIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">Hardware & Printing Management</h1>
                  {/* Platform Indicator */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      platform === "ANDROID"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : platform === "DESKTOP"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-slate-700 text-slate-300 border border-slate-600"
                    }`}
                  >
                    {platform === "ANDROID" ? (
                      <>
                        <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
                        Android POS Terminal
                      </>
                    ) : platform === "DESKTOP" ? (
                      <>
                        <ComputerDesktopIcon className="w-3.5 h-3.5" />
                        Windows Desktop App
                      </>
                    ) : (
                      <>
                        <GlobeAltIcon className="w-3.5 h-3.5" />
                        Web Browser Mode
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Intelligent auto-discovery, paired Bluetooth, direct USB, and Wi-Fi thermal printers. Seamlessly route operational actions to their designated hardware.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/${companySlug}/document-settings`}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-medium border border-slate-600 transition"
              >
                <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
                Document Designs
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <button
                onClick={handleQuickScan}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <SparklesIcon className="w-4 h-4 text-amber-300" />
                Auto-Discover Hardware
              </button>

              <button
                onClick={() => setIsDiscoveryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Add Device / Printer
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 mt-6 pt-5 border-t border-slate-700/60">
            <button
              onClick={() => setActiveTab("ROUTING")}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition border-b-2 ${
                activeTab === "ROUTING"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Action Routing Matrix ({PRINTING_ACTION_KEYS.length} Actions)
            </button>

            <button
              onClick={() => setActiveTab("PRINTERS")}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition border-b-2 ${
                activeTab === "PRINTERS"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <PrinterIcon className="w-4 h-4" />
              Connected Hardware ({printers.length} Devices)
            </button>
          </div>
        </div>

        {/* TAB 1: ACTION ROUTING MATRIX */}
        {activeTab === "ROUTING" && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-white">Operational Action Routing</h2>
                  <p className="text-xs text-slate-400">
                    Every transaction (POS checkout, kitchen prep, tax invoice, barcode sticker) is routed directly to its designated hardware printer.
                  </p>
                </div>
                <button
                  onClick={() => setIsDiscoveryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Connect New Hardware
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {PRINTING_ACTION_KEYS.map((actionKey) => {
                  const meta = ACTION_METADATA[actionKey] || {
                    label: actionKey,
                    description: "Operational document",
                    defaultPaper: "80mm",
                    icon: "📄",
                    recommendedDevice: "Standard Printer",
                  };
                  const currentRoute = routingMap[actionKey] || {
                    printerId: null,
                    copies: 1,
                    autoCut: true,
                    openCashDrawer: actionKey === "POS_RECEIPT",
                  };
                  const assignedPrinter = printers.find((p) => p.id === currentRoute.printerId);

                  // Paper mismatch warning heuristic:
                  // e.g. A4 action routed to 58mm or 80mm printer
                  const isPaperMismatch =
                    assignedPrinter &&
                    meta.defaultPaper === "A4" &&
                    assignedPrinter.paperWidth !== "A4";

                  return (
                    <div
                      key={actionKey}
                      className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2 bg-slate-800 rounded-lg">{meta.icon}</span>
                            <div>
                              <h3 className="text-sm font-bold text-white">{meta.label}</h3>
                              <p className="text-xs text-slate-400">{meta.description}</p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                            {meta.defaultPaper}
                          </span>
                        </div>

                        {/* Mismatch Warning Alert */}
                        {isPaperMismatch && (
                          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              Thermal receipt printer ({assignedPrinter.paperWidth}) assigned to standard A4 document. We recommend an A4 laser or browser print.
                            </span>
                          </div>
                        )}

                        {/* Printer Selector */}
                        <div className="pt-2">
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Target Hardware Printer
                          </label>
                          <select
                            value={currentRoute.printerId || ""}
                            onChange={(e) => handleSaveActionAssignment(actionKey, e.target.value)}
                            disabled={savingAction === actionKey}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                          >
                            <option value="">-- Browser Default Print Dialog --</option>
                            {printers.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.connectionType} • {p.paperWidth}) {p.isDefault ? "★ Default" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Hardware Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          {/* Copies */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">Copies:</span>
                            <select
                              value={currentRoute.copies || 1}
                              onChange={(e) => handleUpdateOption(actionKey, "copies", e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                            >
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                          </div>

                          {/* Auto Cut */}
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                            <input
                              type="checkbox"
                              checked={currentRoute.autoCut ?? true}
                              onChange={(e) => handleUpdateOption(actionKey, "autoCut", e.target.checked)}
                              className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                            />
                            Auto-Cut
                          </label>

                          {/* Cash Drawer (POS Receipt) */}
                          {actionKey === "POS_RECEIPT" && (
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px]">
                              <input
                                type="checkbox"
                                checked={currentRoute.openCashDrawer ?? false}
                                onChange={(e) => handleUpdateOption(actionKey, "openCashDrawer", e.target.checked)}
                                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                              />
                              Kick Drawer
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Status indicator footer */}
                      <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>
                          {assignedPrinter ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Ready: {assignedPrinter.address}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium">Standard browser dialog</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500">{meta.recommendedDevice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED HARDWARE PRINTERS & PERIPHERALS */}
        {activeTab === "PRINTERS" && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Registered Hardware Devices</h2>
                  <p className="text-xs text-slate-400">
                    Physical printers and peripherals bonded to this store. Perform live test prints, monitor connectivity, or discover new hardware.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDiscoveryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Intelligent Discovery
                  </button>

                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Sub-Category Filters */}
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-700/60 overflow-x-auto text-xs">
                {(
                  [
                    { key: "ALL", label: `All Devices (${printers.length})` },
                    { key: "PRINTERS", label: "Thermal & Laser Printers" },
                    { key: "SCALES", label: "Weighing Scales" },
                    { key: "SCANNERS", label: "Barcode Scanners" },
                    { key: "DRAWERS", label: "Cash Drawers" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDeviceFilter(tab.key)}
                    className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                      deviceFilter === tab.key
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredPrinters.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-700/80 rounded-xl space-y-3">
                  <PrinterIcon className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">No hardware devices found for this filter</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click <strong>Intelligent Discovery</strong> to automatically discover paired Bluetooth printers, USB devices, or scan your Wi-Fi network.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsDiscoveryModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-2"
                    >
                      <SparklesIcon className="w-4 h-4 text-amber-300" />
                      Discover Hardware
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrinters.map((printer) => (
                    <div
                      key={printer.id}
                      className="bg-slate-900 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between hover:border-slate-500 transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                              {printer.capabilities?.category === "SCALE" ? (
                                <ScaleIcon className="w-5 h-5" />
                              ) : printer.capabilities?.category === "SCANNER" ? (
                                <QrCodeIcon className="w-5 h-5" />
                              ) : printer.capabilities?.category === "CASH_DRAWER" ? (
                                <BanknotesIcon className="w-5 h-5" />
                              ) : (
                                <PrinterIcon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                {printer.name}
                                {printer.isDefault && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">
                                    DEFAULT
                                  </span>
                                )}
                              </h3>
                              <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                                {printer.address}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {printer.connectionType}
                          </span>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/50 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                          <div>
                            Format: <span className="text-slate-200 font-medium">{printer.paperWidth}</span>
                          </div>
                          <div>
                            Status: <span className="text-emerald-400 font-medium">Verified Ready</span>
                          </div>
                          {printer.port && (
                            <div>
                              Port: <span className="text-slate-200 font-medium">{printer.port}</span>
                            </div>
                          )}
                          {printer.capabilities?.manufacturer && (
                            <div>
                              Vendor: <span className="text-slate-200 font-medium">{printer.capabilities.manufacturer}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleTestPrint(printer)}
                          disabled={testingId === printer.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition disabled:opacity-50"
                        >
                          <BoltIcon className="w-3.5 h-3.5 text-amber-400" />
                          {testingId === printer.id ? "Testing..." : "Test Slip"}
                        </button>

                        <div className="flex items-center gap-2">
                          {!printer.isDefault && (
                            <button
                              onClick={() => handleSetDefault(printer)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition"
                            >
                              Set Default
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePrinter(printer.id, printer.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                            title="Remove Printer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
