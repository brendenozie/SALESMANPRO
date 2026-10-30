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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 border ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/30"
              : "bg-rose-500/10 dark:bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/30"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
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
        {/* Main Header Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                <PrinterIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Hardware & Printing
                  </h1>
                  {/* Native Platform Indicator Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                      platform === "ANDROID"
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                        : platform === "DESKTOP"
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {platform === "ANDROID" ? (
                      <>
                        <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
                        Android Terminal
                      </>
                    ) : platform === "DESKTOP" ? (
                      <>
                        <ComputerDesktopIcon className="w-3.5 h-3.5" />
                        Windows Desktop
                      </>
                    ) : (
                      <>
                        <GlobeAltIcon className="w-3.5 h-3.5" />
                        Web Browser Mode
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                  Manage paired Bluetooth, direct USB, network thermal printers, scales, and cash drawers. Route actions automatically to hardware.
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <Link
                href={`/admin/${companySlug}/document-settings`}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300/80 dark:border-slate-700 transition"
              >
                <DocumentTextIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Templates</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <button
                onClick={handleQuickScan}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <SparklesIcon className="w-4 h-4 text-amber-100" />
                <span>Auto-Discover</span>
              </button>

              <button
                onClick={() => setIsDiscoveryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Device</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex items-center gap-6 mt-8 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab("ROUTING")}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === "ROUTING"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Action Routing Matrix
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {PRINTING_ACTION_KEYS.length}
              </span>
              {activeTab === "ROUTING" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("PRINTERS")}
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === "PRINTERS"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <PrinterIcon className="w-4 h-4" />
              Connected Hardware
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {printers.length}
              </span>
              {activeTab === "PRINTERS" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: ACTION ROUTING MATRIX */}
        {activeTab === "ROUTING" && (
          <div className="space-y-5">
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Operational Action Matrix
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Map each operational event (Receipt, Kitchen Ticket, Tax Invoice) directly to a target device.
                  </p>
                </div>
                <button
                  onClick={() => setIsDiscoveryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Connect New Hardware
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  const isPaperMismatch =
                    assignedPrinter &&
                    meta.defaultPaper === "A4" &&
                    assignedPrinter.paperWidth !== "A4";

                  return (
                    <div
                      key={actionKey}
                      className="bg-slate-50/70 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-slate-700 transition group shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl p-2.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-xs">
                              {meta.icon}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {meta.label}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {meta.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700 shrink-0 font-medium">
                            {meta.defaultPaper}
                          </span>
                        </div>

                        {/* Paper Mismatch Warning */}
                        {isPaperMismatch && (
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>
                              Thermal printer ({assignedPrinter.paperWidth}) assigned to standard A4 document. Laser/Inkjet recommended.
                            </span>
                          </div>
                        )}

                        {/* Target Printer Selector */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wider">
                            Target Hardware Device
                          </label>
                          <select
                            value={currentRoute.printerId || ""}
                            onChange={(e) => handleSaveActionAssignment(actionKey, e.target.value)}
                            disabled={savingAction === actionKey}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition"
                          >
                            <option value="">-- Standard System Print Dialog --</option>
                            {printers.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.connectionType} • {p.paperWidth}) {p.isDefault ? "★ Default" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Option Switches */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                          {/* Copies Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Copies:</span>
                            <select
                              value={currentRoute.copies || 1}
                              onChange={(e) => handleUpdateOption(actionKey, "copies", e.target.value)}
                              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                            >
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                          </div>

                          {/* Auto Cut */}
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            <input
                              type="checkbox"
                              checked={currentRoute.autoCut ?? true}
                              onChange={(e) => handleUpdateOption(actionKey, "autoCut", e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                            />
                            Auto-Cut
                          </label>

                          {/* Cash Drawer Trigger */}
                          {actionKey === "POS_RECEIPT" && (
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              <input
                                type="checkbox"
                                checked={currentRoute.openCashDrawer ?? false}
                                onChange={(e) => handleUpdateOption(actionKey, "openCashDrawer", e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                              />
                              Kick Cash Drawer
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Status Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] flex items-center justify-between">
                        <div>
                          {assignedPrinter ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Ready: {assignedPrinter.address}
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">System print prompt</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{meta.recommendedDevice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED HARDWARE */}
        {activeTab === "PRINTERS" && (
          <div className="space-y-5">
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Registered Peripherals & Hardware
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Bound physical hardware, live connection statuses, and diagnostic test slips.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDiscoveryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Discover Hardware
                  </button>

                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Sub-Category Filter Badges */}
              <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      deviceFilter === tab.key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredPrinters.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <PrinterIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No hardware found matching this filter
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Use <strong>Auto-Discover Hardware</strong> to pair nearby Bluetooth devices, scan direct USB connections, or locate network thermal printers.
                  </p>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setIsDiscoveryModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
                    >
                      <SparklesIcon className="w-4 h-4 text-amber-200" />
                      Discover Hardware
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPrinters.map((printer) => (
                    <div
                      key={printer.id}
                      className="bg-slate-50/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-xs">
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
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {printer.name}
                                {printer.isDefault && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                                    DEFAULT
                                  </span>
                                )}
                              </h3>
                              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px] mt-0.5">
                                {printer.address}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {printer.connectionType}
                          </span>
                        </div>

                        {/* Detailed Specs Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          <div>
                            Format: <span className="text-slate-900 dark:text-slate-200 font-semibold">{printer.paperWidth}</span>
                          </div>
                          <div>
                            Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
                          </div>
                          {printer.port && (
                            <div>
                              Port: <span className="text-slate-900 dark:text-slate-200 font-semibold">{printer.port}</span>
                            </div>
                          )}
                          {printer.capabilities?.manufacturer && (
                            <div>
                              Vendor: <span className="text-slate-900 dark:text-slate-200 font-semibold">{printer.capabilities.manufacturer}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleTestPrint(printer)}
                          disabled={testingId === printer.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                        >
                          <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                          {testingId === printer.id ? "Testing..." : "Test Slip"}
                        </button>

                        <div className="flex items-center gap-2">
                          {!printer.isDefault && (
                            <button
                              onClick={() => handleSetDefault(printer)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition"
                            >
                              Set Default
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePrinter(printer.id, printer.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                            title="Remove Hardware Device"
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