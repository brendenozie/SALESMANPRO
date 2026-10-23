"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowsRightLeftIcon, PlusIcon, ArrowPathIcon, CheckCircleIcon,
  XMarkIcon, MagnifyingGlassIcon, TruckIcon, ArchiveBoxIcon,
  MapPinIcon, ClipboardDocumentCheckIcon, DocumentTextIcon,
  ExclamationTriangleIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";

interface Location { id: string; name: string; address?: string; }

interface TransferItem {
  productId?: string;
  description: string;
  sku?: string;
  quantityRequested: number;
  quantityDispatched?: number;
  quantityReceived?: number;
  unitCost?: number;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  status: string;
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
  items: (TransferItem & { id: string })[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:       { label: "Draft",       color: "text-slate-400",  bg: "bg-slate-500/20" },
  REQUESTED:   { label: "Requested",   color: "text-blue-400",   bg: "bg-blue-500/20" },
  APPROVED:    { label: "Approved",    color: "text-violet-400", bg: "bg-violet-500/20" },
  IN_TRANSIT:  { label: "In Transit",  color: "text-yellow-400", bg: "bg-yellow-500/20" },
  RECEIVED:    { label: "Received",    color: "text-emerald-400",bg: "bg-emerald-500/20" },
  REJECTED:    { label: "Rejected",    color: "text-red-400",    bg: "bg-red-500/20" },
  CANCELLED:   { label: "Cancelled",   color: "text-slate-500",  bg: "bg-slate-700/20" },
};

const NEXT_ACTIONS: Record<string, string[]> = {
  REQUESTED: ["APPROVE", "REJECT"],
  APPROVED:  ["DISPATCH"],
  IN_TRANSIT:["RECEIVE"],
};

export default function StockTransferClient({ companyId, slug }: { companyId: string; slug: string }) {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockTransfer | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // New transfer form
  const [form, setForm] = useState({
    fromLocationId: "",
    toLocationId: "",
    notes: "",
    items: [{ description: "", sku: "", quantityRequested: 1, unitCost: 0 }] as TransferItem[],
  });

  // Receive form
  const [receiveItems, setReceiveItems] = useState<Record<string, number>>({});

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/stock-transfer?companyId=${companyId}`);
      const data = await r.json();
      setTransfers(data.transfers ?? []);
      setLocations(data.locations ?? []);
    } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = transfers.filter(t =>
    (filter === "ALL" || t.status === filter) &&
    t.transferNumber.toLowerCase().includes(search.toLowerCase())
  );

  const createTransfer = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/stock-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          fromLocationId: form.fromLocationId || undefined,
          toLocationId: form.toLocationId || undefined,
          notes: form.notes,
          items: form.items.filter(i => i.description),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      showToast(`Transfer ${data.transfer.transferNumber} created ✓`);
      setShowNew(false);
      setForm({ fromLocationId: "", toLocationId: "", notes: "", items: [{ description: "", sku: "", quantityRequested: 1, unitCost: 0 }] });
      load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setSaving(false); }
  };

  const doAction = async (id: string, action: string) => {
    setSaving(true);
    try {
      const ri = action === "RECEIVE" && selected
        ? selected.items.map(it => ({
            itemId: it.id,
            quantityReceived: receiveItems[it.id] ?? it.quantityRequested,
            productId: (it as any).productId,
          }))
        : undefined;

      const r = await fetch("/api/stock-transfer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, companyId, action, receivedItems: ri }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      showToast(`${action} applied ✓`);
      setSelected(data.transfer);
      load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setSaving(false); }
  };

  const locName = (id?: string) => locations.find(l => l.id === id)?.name ?? "All Locations";

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: "", sku: "", quantityRequested: 1, unitCost: 0 }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-semibold ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircleIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-teal-600/30"><ArrowsRightLeftIcon className="h-7 w-7 text-teal-300" /></div>
            <h1 className="text-3xl font-black text-white">Stock Transfers</h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">Inter-branch stock movement — request, approve, dispatch, receive</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-all">
          <PlusIcon className="h-4 w-4" /> New Transfer
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {["ALL", "REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === s ? "bg-teal-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
            {s === "ALL" ? "All Transfers" : STATUS_CONFIG[s]?.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ST-..."
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-teal-500 w-40" />
        </div>
        <button onClick={load} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Transfer List */}
      {loading ? (
        <div className="flex justify-center py-16"><ArrowPathIcon className="h-8 w-8 animate-spin text-teal-400" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const sc = STATUS_CONFIG[t.status];
            const totalQty = t.items.reduce((s, i) => s + i.quantityRequested, 0);
            return (
              <button key={t.id} onClick={() => setSelected(t)}
                className="w-full bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 text-left transition-all flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-600/20"><ArrowsRightLeftIcon className="h-5 w-5 text-teal-400" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-sm">{t.transferNumber}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {locName(t.fromLocationId)}</span>
                    <ChevronRightIcon className="h-3 w-3" />
                    <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {locName(t.toLocationId)}</span>
                    <span className="ml-auto">{totalQty} items · {new Date(t.createdAt).toLocaleDateString("en-KE")}</span>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-500" />
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-16">
              <ArrowsRightLeftIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No transfers found</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-white/10 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{selected.transferNumber}</h2>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUS_CONFIG[selected.status]?.bg} ${STATUS_CONFIG[selected.status]?.color}`}>
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-sm text-slate-400">
                <span>{locName(selected.fromLocationId)}</span>
                <ChevronRightIcon className="h-4 w-4" />
                <span>{locName(selected.toLocationId)}</span>
              </div>

              {/* Items */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-5">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-white font-bold text-sm">Items</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {selected.items.map(it => (
                    <div key={it.id} className="px-4 py-3">
                      <div className="flex justify-between items-start text-sm">
                        <div>
                          <p className="text-white font-semibold">{it.description}</p>
                          {it.sku && <p className="text-slate-400 text-xs">{it.sku}</p>}
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-slate-300">Req: {it.quantityRequested}</p>
                          {it.quantityDispatched != null && <p className="text-yellow-400">Dispatched: {it.quantityDispatched}</p>}
                          {it.quantityReceived != null && <p className="text-emerald-400">Received: {it.quantityReceived}</p>}
                        </div>
                      </div>
                      {selected.status === "IN_TRANSIT" && (
                        <div className="mt-2">
                          <input type="number" min={0} max={it.quantityRequested}
                            placeholder="Qty received"
                            value={receiveItems[it.id] ?? ""}
                            onChange={e => setReceiveItems(r => ({ ...r, [it.id]: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5 text-sm text-slate-300">
                  <span className="text-slate-500 font-semibold">Notes: </span>{selected.notes}
                </div>
              )}

              {/* Action Buttons */}
              {(NEXT_ACTIONS[selected.status] ?? []).length > 0 && (
                <div className="flex gap-2">
                  {(NEXT_ACTIONS[selected.status] ?? []).map(action => (
                    <button key={action} onClick={() => doAction(selected.id, action)} disabled={saving}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2
                        ${action === "REJECT" || action === "CANCEL"
                          ? "bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30"
                          : "bg-teal-600 hover:bg-teal-500 text-white"}`}>
                      {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : null}
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Transfer Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-bold text-xl">New Stock Transfer</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1">From Location</label>
                  <select value={form.fromLocationId} onChange={e => setForm(f => ({ ...f, fromLocationId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500">
                    <option value="">All / Warehouse</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1">To Location</label>
                  <select value={form.toLocationId} onChange={e => setForm(f => ({ ...f, toLocationId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500">
                    <option value="">Select destination</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Items</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-semibold transition-all">
                    <PlusIcon className="h-3 w-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-white/5 border border-white/10 rounded-xl p-3">
                      <input placeholder="Description *" value={item.description}
                        onChange={e => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, description: e.target.value } : it) }))}
                        className="col-span-5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500" />
                      <input placeholder="SKU" value={item.sku ?? ""}
                        onChange={e => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, sku: e.target.value } : it) }))}
                        className="col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500" />
                      <input type="number" min={1} placeholder="Qty" value={item.quantityRequested}
                        onChange={e => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, quantityRequested: parseInt(e.target.value) || 1 } : it) }))}
                        className="col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500" />
                      <button onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-300 flex items-center justify-center pt-2">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-slate-400 hover:text-white">Cancel</button>
                <button onClick={createTransfer} disabled={saving || !form.items.some(i => i.description)}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                  Submit Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
