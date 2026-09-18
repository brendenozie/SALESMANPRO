"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DocumentPlusIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  TruckIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArchiveBoxArrowDownIcon,
  BuildingOffice2Icon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

interface PurchaseOrderItem {
  id?: string;
  title: string;
  sku?: string;
  quantity: number;
  unitCost: number;
  taxAmount?: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  taxAmount: number;
  subtotal: number;
  currency: string;
  notes?: string;
  createdAt: string;
  expectedDeliveryDate?: string;
  receivedAt?: string;
  supplier: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  items: PurchaseOrderItem[];
}

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  currency?: string;
}

interface PurchaseOrdersClientProps {
  companyId: string;
  slug: string;
}

export default function PurchaseOrdersClient({ companyId, slug }: PurchaseOrdersClientProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    supplierId: "",
    orderNumber: `PO-${Date.now().toString().slice(-6)}`,
    currency: "USD",
    notes: "",
    items: [
      { title: "", sku: "", quantity: 1, unitCost: 0, taxAmount: 0, total: 0 }
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [poRes, supRes] = await Promise.all([
        fetch(`/api/admin/procurement/purchase-orders?companyId=${companyId}`),
        fetch(`/api/admin/procurement/suppliers?companyId=${companyId}`)
      ]);

      if (poRes.ok) {
        const poData = await poRes.json();
        setOrders(poData.data || []);
      }
      if (supRes.ok) {
        const supData = await supRes.json();
        setSuppliers(supData.data || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load procurement data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  // Handle PO actions (Approve, Receive, Cancel)
  const handleAction = async (poId: string, action: "APPROVE" | "RECEIVE_GOODS" | "CANCEL") => {
    setActionLoadingId(poId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/procurement/purchase-orders/${poId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      if (action === "RECEIVE_GOODS") {
        setSuccessMsg(`Goods received! Inventory quantities updated & AP bill created.`);
      } else if (action === "APPROVE") {
        setSuccessMsg("Purchase order approved successfully.");
      } else {
        setSuccessMsg("Purchase order cancelled.");
      }

      await fetchData();
      if (viewingPO?.id === poId) {
        setViewingPO(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Line item helpers
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    
    // recalculate line total
    const qty = Number(updated[index].quantity) || 0;
    const cost = Number(updated[index].unitCost) || 0;
    updated[index].total = Math.round(qty * cost * 100) / 100;
    
    setFormData({ ...formData, items: updated });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: "", sku: "", quantity: 1, unitCost: 0, taxAmount: 0, total: 0 }]
    });
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const computedSubtotal = formData.items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (formData.items.some(it => !it.title || it.quantity <= 0)) {
      setError("Every item must have a name and quantity > 0");
      return;
    }

    setError(null);
    setActionLoadingId("create");
    try {
      const res = await fetch("/api/admin/procurement/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          supplierId: formData.supplierId,
          orderNumber: formData.orderNumber,
          currency: formData.currency,
          notes: formData.notes,
          items: formData.items
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create purchase order");

      setSuccessMsg(`Purchase Order ${data.data.orderNumber} created successfully!`);
      setShowCreateModal(false);
      setFormData({
        supplierId: "",
        orderNumber: `PO-${Date.now().toString().slice(-6)}`,
        currency: "USD",
        notes: "",
        items: [{ title: "", sku: "", quantity: 1, unitCost: 0, taxAmount: 0, total: 0 }]
      });
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(po => {
    const matchesTab = 
      activeTab === "ALL" ? true :
      po.status === activeTab;
    
    const matchesSearch = 
      po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">Received & Stocked</span>;
      case "APPROVED":
        return <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">Approved / In Transit</span>;
      case "PENDING_APPROVAL":
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">Pending Approval</span>;
      case "DRAFT":
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">Draft</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black tracking-widest uppercase">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-black tracking-widest uppercase">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.25em]">Procurement & Supply Chain</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500">Orders.</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create and authorize purchase orders, track incoming supplier shipments, and auto-increment inventory upon receipt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href={`/admin/${slug}/inventory-suppliers`}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold text-xs transition-all"
            >
              <BuildingOffice2Icon className="h-4 w-4 text-emerald-400" />
              Vendors Directory
            </Link>
            <Link 
              href={`/admin/${slug}/finance`}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold text-xs transition-all"
            >
              <CurrencyDollarIcon className="h-4 w-4 text-cyan-400" />
              Accounts Payable
            </Link>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-950/50"
            >
              <DocumentPlusIcon className="h-4 w-4 stroke-[2.5px]" /> 
              Generate New PO
            </button>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-300">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex justify-between items-center">
            <span className="font-semibold">{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-300">✕</button>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { label: "All Orders", key: "ALL" },
              { label: "Pending Approval", key: "PENDING_APPROVAL" },
              { label: "Approved / Transit", key: "APPROVED" },
              { label: "Received", key: "RECEIVED" },
              { label: "Cancelled", key: "CANCELLED" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 text-[11px] font-bold tracking-wide transition-all rounded-xl whitespace-nowrap ${
                  activeTab === tab.key 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search PO # or Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-xs font-semibold">Loading purchase orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-3xl p-8">
            <DocumentTextIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Create purchase orders to order products and materials from suppliers.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg"
            >
              Create First Purchase Order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((po) => (
              <div 
                key={po.id} 
                className="group bg-slate-900/30 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 hover:bg-slate-900/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* ID & Vendor */}
                  <div className="flex items-center gap-4 lg:w-1/3">
                    <div className="h-11 w-11 bg-slate-800/80 border border-slate-700/50 rounded-xl flex items-center justify-center text-emerald-400">
                      <TruckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{po.orderNumber}</span>
                        {getStatusBadge(po.status)}
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{po.supplier?.name || "Unknown Supplier"}</p>
                    </div>
                  </div>

                  {/* Summary Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-grow">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Value</p>
                      <p className="text-sm font-black text-emerald-400">
                        {po.currency} {po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Date Created</p>
                      <p className="text-xs font-semibold text-slate-300">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Items</p>
                      <p className="text-xs font-semibold text-slate-400">
                        {po.items?.length || 0} line items
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewingPO(po)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <EyeIcon className="h-4 w-4" /> View
                    </button>

                    {po.status === "PENDING_APPROVAL" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "APPROVE")}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                      >
                        {actionLoadingId === po.id ? "Approving..." : "Authorize"}
                      </button>
                    )}

                    {po.status === "APPROVED" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "RECEIVE_GOODS")}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                        {actionLoadingId === po.id ? "Receiving..." : "Receive Goods"}
                      </button>
                    )}

                    {po.status === "PENDING_APPROVAL" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "CANCEL")}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Cancel Order"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supply Chain Info Card */}
        <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <TruckIcon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Automated Inventory & AP Synchronization</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              When you click <strong className="text-emerald-300">Receive Goods</strong> on an authorized purchase order, SalesmanPro automatically increases stock quantities in your active catalog and posts the corresponding supplier balance directly into <strong className="text-cyan-300">Accounts Payable</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 my-8 text-left shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Generate Purchase Order</h3>
                <p className="text-xs text-slate-400">Order inventory and supplies from an approved vendor</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Supplier / Vendor *</label>
                  <select 
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Vendor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">PO Number *</label>
                  <input 
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Currency</label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="KES">KES (KSh)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="ZAR">ZAR (R)</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400">Order Items / SKUs *</label>
                  <button 
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex-grow">
                        <input 
                          type="text"
                          placeholder="Item Name / Description"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                          required
                          className="w-full bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="text"
                          placeholder="SKU (opt)"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="w-20">
                        <input 
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none text-right"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Cost"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(idx, "unitCost", e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none text-right"
                        />
                      </div>
                      <div className="w-24 text-right text-xs font-black text-emerald-400">
                        {(item.total || 0).toFixed(2)}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={formData.items.length <= 1}
                        className="p-1 text-slate-600 hover:text-rose-400 disabled:opacity-30"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400">Estimated Total Order Value</span>
                <span className="text-sm font-black text-emerald-400">
                  {formData.currency} {computedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Special Instructions / Notes</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Standard 30-day payment terms upon delivery. Ship to Main Distribution Center."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoadingId === "create"}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wider transition-all disabled:opacity-50"
                >
                  {actionLoadingId === "create" ? "Generating..." : "Generate Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-left shadow-2xl space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{viewingPO.orderNumber}</h3>
                  {getStatusBadge(viewingPO.status)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Vendor: <span className="text-white font-bold">{viewingPO.supplier?.name}</span></p>
              </div>
              <button onClick={() => setViewingPO(null)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Issued On:</span>
                  <p className="font-semibold text-slate-200">{new Date(viewingPO.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Amount:</span>
                  <p className="font-black text-emerald-400">{viewingPO.currency} {viewingPO.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {viewingPO.notes && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Notes:</span>
                  {viewingPO.notes}
                </div>
              )}

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2">Ordered Items</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Unit Cost</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {viewingPO.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40">
                          <td className="p-2.5 font-medium text-white">{it.title}</td>
                          <td className="p-2.5 text-right text-slate-300">{it.quantity}</td>
                          <td className="p-2.5 text-right text-slate-300">{it.unitCost?.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-black text-emerald-400">{it.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                Procurement Audit Logged
              </span>
              <div className="flex gap-2">
                {viewingPO.status === "APPROVED" && (
                  <button 
                    onClick={() => handleAction(viewingPO.id, "RECEIVE_GOODS")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wider transition-all"
                  >
                    Receive Goods
                  </button>
                )}
                <button 
                  onClick={() => setViewingPO(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}