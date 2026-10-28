"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowsRightLeftIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  UserIcon,
  PrinterIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { executeUnifiedPrint, NormalizedPrintPayload } from "@/lib/printing/unifiedPrintClient";

interface SisterStore {
  id: string;
  name: string;
  slug: string;
  address?: string;
}

interface SalesAgentOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginCode?: string;
}

interface BranchLocation {
  id: string;
  name: string;
  address?: string;
}

interface InventoryProductOption {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  image?: string | null;
}

interface TransferItem {
  id?: string;
  productId?: string;
  description: string;
  sku?: string;
  quantityRequested: number;
  quantityDispatched?: number;
  quantityReceived?: number;
  unitCost?: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
    images?: any[];
  };
}

interface StockTransferMeta {
  destinationType: "STORE" | "AGENT" | "LOCATION";
  toCompanyId?: string;
  toCompanyName?: string;
  toAgentId?: string;
  toAgentName?: string;
  toLocationId?: string;
  toLocationName?: string;
  userNotes?: string;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  status: string;
  companyId: string;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
  company?: { id: string; name: string; currency?: string };
  meta: StockTransferMeta;
  items: TransferItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "text-slate-400", bg: "bg-slate-500/20" },
  REQUESTED: { label: "Requested", color: "text-blue-400", bg: "bg-blue-500/20" },
  APPROVED: { label: "Approved", color: "text-violet-400", bg: "bg-violet-500/20" },
  IN_TRANSIT: { label: "In Transit", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  RECEIVED: { label: "Received", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-slate-500", bg: "bg-slate-700/20" },
};

const NEXT_ACTIONS: Record<string, string[]> = {
  REQUESTED: ["APPROVE", "REJECT"],
  APPROVED: ["DISPATCH", "CANCEL"],
  IN_TRANSIT: ["RECEIVE", "CANCEL"],
};

export default function StockTransferClient({
  companyId,
  slug,
}: {
  companyId: string;
  slug: string;
}) {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [sisterStores, setSisterStores] = useState<SisterStore[]>([]);
  const [salesAgents, setSalesAgents] = useState<SalesAgentOption[]>([]);
  const [locations, setLocations] = useState<BranchLocation[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<InventoryProductOption[]>([]);
  const [currentCompany, setCurrentCompany] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockTransfer | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showWaybill, setShowWaybill] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // New transfer form state
  const [destinationMode, setDestinationMode] = useState<"STORE" | "AGENT" | "LOCATION">("STORE");
  const [selectedDestinationId, setSelectedDestinationId] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formItems, setFormItems] = useState<
    Array<{
      productId: string;
      description: string;
      sku: string;
      quantityRequested: number;
      unitCost: number;
      availableStock: number;
    }>
  >([]);

  // Receive form state
  const [receiveItems, setReceiveItems] = useState<Record<string, number>>({});

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/stock-transfer?companyId=${companyId}`);
      const data = await r.json();
      setTransfers(data.transfers ?? []);
      setSisterStores(data.destinations?.stores ?? []);
      setSalesAgents(data.destinations?.agents ?? []);
      setLocations(data.destinations?.locations ?? []);
      setCatalogProducts(data.products ?? []);
      setCurrentCompany(data.company ?? null);
    } catch (err: any) {
      showToast(err.message || "Failed to load transfers", false);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  // Set default destination selection when switching destination mode
  useEffect(() => {
    if (destinationMode === "STORE" && sisterStores.length > 0) {
      setSelectedDestinationId(sisterStores[0].id);
    } else if (destinationMode === "AGENT" && salesAgents.length > 0) {
      setSelectedDestinationId(salesAgents[0].id);
    } else if (destinationMode === "LOCATION" && locations.length > 0) {
      setSelectedDestinationId(locations[0].id);
    } else {
      setSelectedDestinationId("");
    }
  }, [destinationMode, sisterStores, salesAgents, locations]);

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const matchFilter = filter === "ALL" || t.status === filter;
      const matchSearch =
        t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
        (t.meta?.toCompanyName && t.meta.toCompanyName.toLowerCase().includes(search.toLowerCase())) ||
        (t.meta?.toAgentName && t.meta.toAgentName.toLowerCase().includes(search.toLowerCase()));
      return matchFilter && matchSearch;
    });
  }, [transfers, filter, search]);

  // Add product to transfer line items
  const handleAddProductLine = (prod: InventoryProductOption) => {
    setFormItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === prod.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantityRequested += 1;
        return next;
      }
      return [
        ...prev,
        {
          productId: prod.id,
          description: prod.name,
          sku: prod.sku,
          quantityRequested: 1,
          unitCost: prod.costPrice || 0,
          availableStock: prod.stock,
        },
      ];
    });
  };

  const handleRemoveProductLine = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItemQuantity = (idx: number, qty: number) => {
    setFormItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, quantityRequested: Math.max(1, qty) } : item
      )
    );
  };

  // Submit New Transfer
  const createTransfer = async () => {
    if (formItems.length === 0) {
      showToast("Please add at least one product to the transfer.", false);
      return;
    }

    if (!selectedDestinationId) {
      showToast("Please select a destination.", false);
      return;
    }

    setSaving(true);
    try {
      let toCompanyName = "";
      let toAgentName = "";
      let toLocationName = "";

      if (destinationMode === "STORE") {
        toCompanyName = sisterStores.find((s) => s.id === selectedDestinationId)?.name || "Sister Store";
      } else if (destinationMode === "AGENT") {
        toAgentName = salesAgents.find((a) => a.id === selectedDestinationId)?.name || "Sales Agent";
      } else {
        toLocationName = locations.find((l) => l.id === selectedDestinationId)?.name || "Branch Location";
      }

      const payload = {
        companyId,
        destinationType: destinationMode,
        toCompanyId: destinationMode === "STORE" ? selectedDestinationId : undefined,
        toCompanyName: destinationMode === "STORE" ? toCompanyName : undefined,
        toAgentId: destinationMode === "AGENT" ? selectedDestinationId : undefined,
        toAgentName: destinationMode === "AGENT" ? toAgentName : undefined,
        toLocationId: destinationMode === "LOCATION" ? selectedDestinationId : undefined,
        toLocationName: destinationMode === "LOCATION" ? toLocationName : undefined,
        notes: formNotes,
        items: formItems.map((item) => ({
          productId: item.productId,
          description: item.description,
          sku: item.sku,
          quantityRequested: item.quantityRequested,
          unitCost: item.unitCost,
        })),
      };

      const res = await fetch("/api/stock-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create transfer");

      showToast(`Transfer ${data.transfer.transferNumber} created successfully!`);
      setShowNew(false);
      setFormItems([]);
      setFormNotes("");
      load();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  // Execute Workflow Action
  const doAction = async (id: string, action: string) => {
    setSaving(true);
    try {
      const ri =
        action === "RECEIVE" && selected
          ? selected.items.map((it) => ({
              itemId: it.id,
              quantityReceived:
                receiveItems[it.id!] !== undefined
                  ? receiveItems[it.id!]
                  : it.quantityDispatched ?? it.quantityRequested,
              productId: it.productId,
            }))
          : undefined;

      const r = await fetch("/api/stock-transfer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, companyId, action, receivedItems: ri }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Action failed");

      showToast(`Transfer marked as ${action} ✓`);
      setSelected(data.transfer);
      load();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setSaving(false);
    }
  };

  // Resolve human-readable destination string
  const formatDestinationLabel = (transfer: StockTransfer) => {
    const meta = transfer.meta;
    if (meta?.destinationType === "STORE") {
      return `🏬 ${meta.toCompanyName || "Sister Store"}`;
    }
    if (meta?.destinationType === "AGENT") {
      return `👤 ${meta.toAgentName || "Sales Agent"}`;
    }
    return `📍 ${meta?.toLocationName || "Branch Location"}`;
  };

  // Generate printable Waybill HTML
  const generateWaybillHtml = useCallback(
    (t: StockTransfer) => {
      const destination = formatDestinationLabel(t);
      const itemsRows = t.items
        .map(
          (it, i) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${i + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${it.description}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${it.sku || "-"}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${it.quantityRequested}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.quantityDispatched ?? it.quantityRequested}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.quantityReceived ?? "-"}</td>
        </tr>
      `
        )
        .join("");

      return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Waybill - ${t.transferNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 0; padding: 10px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
            .logo-title { font-size: 20px; font-weight: 900; color: #0f766e; }
            .sub-title { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; background: #e6fffa; color: #0d9488; font-weight: bold; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
            .card h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
            .card p { margin: 0; font-size: 14px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            th { background: #0f766e; color: white; padding: 8px; text-align: left; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
            .sig-box { border-top: 1px solid #333; padding-top: 8px; font-size: 11px; color: #555; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">${currentCompany?.name || "SALESMANPRO STORE"}</div>
              <div class="sub-title">Inter-Branch Stock Transfer & Waybill</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; font-family: monospace;">${t.transferNumber}</div>
              <div class="badge">${t.status}</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h4>Dispatched From (Origin Store)</h4>
              <p>${currentCompany?.name || "Main Store"}</p>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: ${new Date(t.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="card">
              <h4>Delivered To (Destination)</h4>
              <p>${destination}</p>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Type: ${t.meta?.destinationType || "LOCATION"}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Item Description</th>
                <th>SKU</th>
                <th style="text-align: center;">Qty Req</th>
                <th style="text-align: center;">Qty Disp</th>
                <th style="text-align: center;">Qty Recv</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          ${
            t.notes
              ? `<div style="font-size: 12px; background: #f1f5f9; padding: 10px; border-radius: 6px; margin-bottom: 20px;">
                  <strong>Notes / Instructions:</strong> ${t.meta?.userNotes || t.notes}
                </div>`
              : ""
          }

          <div class="signatures">
            <div class="sig-box">
              <strong>DISPATCHED BY</strong><br>
              Name: __________________________<br>
              Signature & Date: ______________
            </div>
            <div class="sig-box">
              <strong>RECEIVED & VERIFIED BY</strong><br>
              Name: __________________________<br>
              Signature & Date: ______________
            </div>
          </div>
        </body>
      </html>
    `;
    },
    [currentCompany]
  );

  // Dispatch Waybill Print Job
  const handlePrintWaybill = async (t: StockTransfer) => {
    const html = generateWaybillHtml(t);
    const payload: NormalizedPrintPayload = {
      protocolVersion: 1,
      jobId: `WAYBILL-${t.transferNumber}`,
      actionKey: "LOGISTICS_SLIP",
      documentType: "STOCK_TRANSFER_WAYBILL",
      documentId: t.transferNumber,
      companyId,
      createdAt: new Date().toISOString(),
      document: {
        number: t.transferNumber,
        date: new Date().toISOString(),
        cashierName: "Store Manager",
        orderType: "WAYBILL",
        items: t.items.map((it) => ({
          name: it.description,
          sku: it.sku || "",
          quantity: it.quantityDispatched || it.quantityRequested,
          price: it.unitCost || 0,
          total: (it.unitCost || 0) * (it.quantityDispatched || it.quantityRequested),
        })),
        totals: {
          subtotal: 0,
          total: 0,
          currency: currentCompany?.currency || "KES",
        },
        footer: `Official Stock Transfer Waybill • ${t.transferNumber}`,
      },
    };

    try {
      await executeUnifiedPrint(payload, html);
      showToast("Waybill sent to printer ✓");
    } catch {
      // Fallback: browser iframe print
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      document.body.appendChild(printFrame);
      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(printFrame), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-semibold animate-in fade-in ${
            toast.ok ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.ok ? <CheckCircleIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <ArrowsRightLeftIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Stock Transfers & Dispatch
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  {currentCompany?.name || "Current Store"}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Inter-store transfers, staff & agent allocations, and waybill printing
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-900/30 transition-all active:scale-95"
        >
          <PlusIcon className="h-4 w-4" /> New Transfer
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === s
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/40"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {s === "ALL" ? "All Transfers" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ST-..., store, or agent…"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            onClick={load}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            title="Reload transfers"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transfer Cards List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400 font-semibold">No stock transfers found</p>
          <p className="text-xs text-slate-500 mt-1">Create a transfer to move inventory between stores or staff.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => {
            const sc = STATUS_CONFIG[t.status] || STATUS_CONFIG.DRAFT;
            const totalUnits = t.items.reduce((s, i) => s + i.quantityRequested, 0);
            const destinationLabel = formatDestinationLabel(t);

            return (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-teal-500/40 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-sm font-black text-white group-hover:text-teal-400 transition">
                        {t.transferNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString()} • {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500 font-medium w-16">Origin:</span>
                      <span className="font-semibold">{currentCompany?.name || "Main Store"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500 font-medium w-16">Deliver To:</span>
                      <span className="font-bold text-teal-400">{destinationLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
                  <span>
                    <strong>{t.items.length}</strong> items ({totalUnits} units)
                  </span>
                  <div className="flex items-center gap-1 text-teal-400 font-semibold group-hover:translate-x-1 transition">
                    View Details <ChevronRightIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Slide-Over Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              {/* Detail Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur px-6 py-5 border-b border-slate-800 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-white font-black text-xl font-mono">{selected.transferNumber}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        STATUS_CONFIG[selected.status]?.bg
                      } ${STATUS_CONFIG[selected.status]?.color}`}
                    >
                      {STATUS_CONFIG[selected.status]?.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      Created on {new Date(selected.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintWaybill(selected)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl"
                    title="Print Waybill / Transfer Note"
                  >
                    <PrinterIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Detail Body */}
              <div className="p-6 space-y-5">
                {/* Routing Banner */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase">From Store:</span>
                    <span className="font-bold text-white">{currentCompany?.name || "Main Store"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase">To Destination:</span>
                    <span className="font-bold text-teal-400">{formatDestinationLabel(selected)}</span>
                  </div>
                  {selected.dispatchedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold uppercase">Dispatched At:</span>
                      <span className="text-amber-400 font-mono">
                        {new Date(selected.dispatchedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selected.receivedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold uppercase">Received At:</span>
                      <span className="text-emerald-400 font-mono">
                        {new Date(selected.receivedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                      Transfer Line Items ({selected.items.length})
                    </h3>
                    <span className="text-xs text-slate-400">
                      Total: {selected.items.reduce((s, i) => s + i.quantityRequested, 0)} units
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {selected.items.map((it) => (
                      <div key={it.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-white text-xs font-bold leading-tight">{it.description}</p>
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{it.sku || "NO SKU"}</p>
                          </div>

                          <div className="text-right text-xs">
                            <span className="font-bold text-white">Requested: {it.quantityRequested}</span>
                            {it.quantityDispatched != null && (
                              <p className="text-amber-400 text-[11px]">Dispatched: {it.quantityDispatched}</p>
                            )}
                            {it.quantityReceived != null && (
                              <p className="text-emerald-400 text-[11px]">Received: {it.quantityReceived}</p>
                            )}
                          </div>
                        </div>

                        {selected.status === "IN_TRANSIT" && (
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Verify received count:</span>
                            <input
                              type="number"
                              min={0}
                              max={it.quantityDispatched || it.quantityRequested}
                              defaultValue={it.quantityDispatched || it.quantityRequested}
                              onChange={(e) =>
                                setReceiveItems((r) => ({
                                  ...r,
                                  [it.id!]: parseInt(e.target.value, 10) || 0,
                                }))
                              }
                              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500 text-center font-bold"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selected.meta?.userNotes && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                    <span className="text-slate-500 font-bold block mb-1">Notes & Instructions:</span>
                    {selected.meta.userNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Action Bar */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-2">
              {(NEXT_ACTIONS[selected.status] ?? []).map((action) => (
                <button
                  key={action}
                  onClick={() => doAction(selected.id, action)}
                  disabled={saving}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    action === "REJECT" || action === "CANCEL"
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                      : action === "DISPATCH"
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30"
                      : action === "RECEIVE"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                      : "bg-teal-600 hover:bg-teal-500 text-white"
                  }`}
                >
                  {saving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  {action === "DISPATCH"
                    ? "Dispatch (Deducts Stock)"
                    : action === "RECEIVE"
                    ? "Confirm Receipt (Ingests Stock)"
                    : action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Transfer Creator Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="sticky top-0 bg-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between z-10">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-teal-400" /> Create Stock Transfer
                </h2>
                <p className="text-xs text-slate-400">
                  Transfer products from {currentCompany?.name || "Current Store"} to another store or agent
                </p>
              </div>
              <button
                onClick={() => setShowNew(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Destination Mode Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1. Choose Destination Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDestinationMode("STORE")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      destinationMode === "STORE"
                        ? "bg-teal-500/20 border-teal-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <BuildingStorefrontIcon className="h-5 w-5 text-teal-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Another Store</p>
                      <p className="text-[10px] text-slate-500">Sister store / branch</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDestinationMode("AGENT")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      destinationMode === "AGENT"
                        ? "bg-teal-500/20 border-teal-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <UserIcon className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Sales Agent / Staff</p>
                      <p className="text-[10px] text-slate-500">Field staff allocation</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDestinationMode("LOCATION")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                      destinationMode === "LOCATION"
                        ? "bg-teal-500/20 border-teal-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <MapPinIcon className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Branch Location</p>
                      <p className="text-[10px] text-slate-500">Depot / warehouse</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Destination Target Dropdown */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  2. Select Specific Destination
                </label>
                {destinationMode === "STORE" ? (
                  sisterStores.length === 0 ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                      No other stores linked to your account yet. You can transfer to Sales Agents or Branch Locations.
                    </div>
                  ) : (
                    <select
                      value={selectedDestinationId}
                      onChange={(e) => setSelectedDestinationId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      {sisterStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.slug}) {s.address ? `• ${s.address}` : ""}
                        </option>
                      ))}
                    </select>
                  )
                ) : destinationMode === "AGENT" ? (
                  salesAgents.length === 0 ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                      No sales agents or staff registered in this company yet.
                    </div>
                  ) : (
                    <select
                      value={selectedDestinationId}
                      onChange={(e) => setSelectedDestinationId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      {salesAgents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} {a.phone ? `• ${a.phone}` : ""} {a.loginCode ? `• Code: ${a.loginCode}` : ""}
                        </option>
                      ))}
                    </select>
                  )
                ) : locations.length === 0 ? (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                    No physical branch locations configured yet.
                  </div>
                ) : (
                  <select
                    value={selectedDestinationId}
                    onChange={(e) => setSelectedDestinationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.address ? `• ${l.address}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Step 3: Interactive Inventory Product Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    3. Add Inventory Products
                  </label>
                  <span className="text-[11px] text-teal-400 font-semibold">
                    {catalogProducts.length} items in catalog
                  </span>
                </div>

                {/* Autocomplete Product Dropdown */}
                <select
                  onChange={(e) => {
                    const prod = catalogProducts.find((p) => p.id === e.target.value);
                    if (prod) {
                      handleAddProductLine(prod);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 mb-3"
                >
                  <option value="" disabled>
                    + Click here to search & add product from stockroom…
                  </option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) • Stock: {p.stock}
                    </option>
                  ))}
                </select>

                {/* Selected Transfer Items Table */}
                {formItems.length === 0 ? (
                  <div className="text-center py-6 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
                    No products added to this transfer yet. Select an item above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{item.description}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-mono">{item.sku}</span>
                            <span>•</span>
                            <span
                              className={
                                item.availableStock < item.quantityRequested
                                  ? "text-red-400 font-bold"
                                  : "text-emerald-400 font-semibold"
                              }
                            >
                              Available Stock: {item.availableStock}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, item.availableStock)}
                            value={item.quantityRequested}
                            onChange={(e) =>
                              handleUpdateItemQuantity(idx, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-bold focus:outline-none focus:border-teal-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveProductLine(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  4. Notes & Dispatch Instructions
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. For exhibition kiosk, weekly van replenishment, urgent customer delivery…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createTransfer}
                disabled={saving || formItems.length === 0}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                Submit Transfer Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
