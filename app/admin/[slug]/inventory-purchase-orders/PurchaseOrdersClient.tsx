"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  DocumentPlusIcon, 
  ClockIcon, 
  TruckIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArchiveBoxArrowDownIcon,
  BuildingOffice2Icon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ChevronRightIcon
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

  // Metrics computation
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === "PENDING_APPROVAL").length;
    const inTransit = orders.filter(o => o.status === "APPROVED").length;
    const totalValue = orders
      .filter(o => o.status !== "CANCELLED")
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    return { total, pending, inTransit, totalValue };
  }, [orders]);

  // Tab count lookup
  const tabCounts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING_APPROVAL: orders.filter(o => o.status === "PENDING_APPROVAL").length,
      APPROVED: orders.filter(o => o.status === "APPROVED").length,
      RECEIVED: orders.filter(o => o.status === "RECEIVED").length,
      CANCELLED: orders.filter(o => o.status === "CANCELLED").length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(po => {
      const matchesTab = activeTab === "ALL" ? true : po.status === activeTab;
      const matchesSearch = 
        po.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Received & Stocked
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Approved / In Transit
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Approval
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-xs">
            Draft
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                Procurement & Supply Chain
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">Orders</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Create, authorize, and track supplier purchase orders with automatic inventory restocking and Accounts Payable syncing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href={`/admin/${slug}/inventory-suppliers`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <BuildingOffice2Icon className="h-4 w-4 text-emerald-500" />
              Vendors Directory
            </Link>
            <Link 
              href={`/admin/${slug}/finance`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <CurrencyDollarIcon className="h-4 w-4 text-cyan-500" />
              Accounts Payable
            </Link>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20 active:scale-95"
            >
              <DocumentPlusIcon className="h-4 w-4 stroke-[2.5]" /> 
              Generate New PO
            </button>
          </div>
        </header>

        {/* Executive Stats Summary */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total POs</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <DocumentTextIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{metrics.total}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">All time purchase orders</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{metrics.pending}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Awaiting approval</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Transit</span>
              <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
                <TruckIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">{metrics.inTransit}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Authorized & active shipments</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Commitments</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CurrencyDollarIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cumulative active value</p>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl text-xs flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-colors">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-colors">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-0.5">
            {[
              { label: "All Orders", key: "ALL" },
              { label: "Pending", key: "PENDING_APPROVAL" },
              { label: "In Transit", key: "APPROVED" },
              { label: "Received", key: "RECEIVED" },
              { label: "Cancelled", key: "CANCELLED" }
            ].map((tab) => {
              const count = tabCounts[tab.key as keyof typeof tabCounts] || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[11px] font-extrabold tracking-wider transition-all rounded-xl whitespace-nowrap ${
                    isActive 
                      ? "bg-slate-900 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30 shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive 
                      ? "bg-slate-700 text-slate-200 dark:bg-emerald-500/30 dark:text-emerald-200" 
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search PO # or Vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ArrowPathIcon className="h-9 w-9 animate-spin text-emerald-500 mb-3" />
            <p className="text-xs font-bold tracking-wide">Syncing procurement registry...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs">
            <ShoppingBagIcon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              No results match your current tab or search query. Generate a new PO to start procuring inventory.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
            >
              Generate New PO
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((po) => (
              <div 
                key={po.id} 
                className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* ID & Vendor */}
                  <div className="flex items-center gap-4 lg:w-1/3">
                    <div className="h-11 w-11 shrink-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
                      <TruckIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{po.orderNumber}</span>
                        {getStatusBadge(po.status)}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {po.supplier?.name || "Unknown Supplier"}
                      </p>
                    </div>
                  </div>

                  {/* Summary Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-grow">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Value</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {po.currency} {po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Issued Date</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(po.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Items</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {po.items?.length || 0} line item{po.items?.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800/50 lg:border-t-0">
                    <button 
                      onClick={() => setViewingPO(po)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <EyeIcon className="h-4 w-4" /> View
                    </button>

                    {po.status === "PENDING_APPROVAL" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "APPROVE")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-xs"
                      >
                        {actionLoadingId === po.id ? "Approving..." : "Authorize"}
                      </button>
                    )}

                    {po.status === "APPROVED" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "RECEIVE_GOODS")}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                      >
                        <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                        {actionLoadingId === po.id ? "Receiving..." : "Receive Goods"}
                      </button>
                    )}

                    {po.status === "PENDING_APPROVAL" && (
                      <button 
                        disabled={actionLoadingId === po.id}
                        onClick={() => handleAction(po.id, "CANCEL")}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
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

        {/* Footer Sync Info Banner */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <TruckIcon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automated Stock & Financial Reconciliation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              When receiving goods on an authorized purchase order, stock levels auto-increment across your product database while an AP Bill is recorded automatically into accounts payable.
            </p>
          </div>
        </div>

      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 my-8 text-left shadow-2xl space-y-6">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Generate Purchase Order</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Requisition items and supplies from an approved vendor</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Supplier / Vendor *
                  </label>
                  <select 
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select Vendor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    PO Number *
                  </label>
                  <input 
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Currency
                  </label>
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Order Items / SKUs *</label>
                  <button 
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex-grow">
                        <input 
                          type="text"
                          placeholder="Item Name / Description"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                          required
                          className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="text"
                          placeholder="SKU (opt)"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-300 focus:outline-none"
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
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-300 focus:outline-none text-right"
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
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-300 focus:outline-none text-right"
                        />
                      </div>
                      <div className="w-24 text-right text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {(item.total || 0).toFixed(2)}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={formData.items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary Bar */}
              <div className="flex justify-between items-center p-3.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Order Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formData.currency} {computedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Notes & Instructions</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Deliver to Warehouse Bay 3. Standard Net 30 payment terms."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoadingId === "create"}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded-xl text-xs font-black tracking-wider transition-all disabled:opacity-50 shadow-md active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-left shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{viewingPO.orderNumber}</h3>
                  {getStatusBadge(viewingPO.status)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Vendor: <span className="text-slate-900 dark:text-white font-bold">{viewingPO.supplier?.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setViewingPO(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Issued On:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {new Date(viewingPO.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Total Amount:</span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm">
                    {viewingPO.currency} {viewingPO.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {viewingPO.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Instructions / Notes:</span>
                  {viewingPO.notes}
                </div>
              )}

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Ordered Line Items</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Unit Cost</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {viewingPO.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="p-2.5 font-medium text-slate-900 dark:text-white">{it.title}</td>
                          <td className="p-2.5 text-right text-slate-600 dark:text-slate-300">{it.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600 dark:text-slate-300">{it.unitCost?.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">{it.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                Procurement Audit Logged
              </span>
              <div className="flex gap-2">
                {viewingPO.status === "APPROVED" && (
                  <button 
                    onClick={() => handleAction(viewingPO.id, "RECEIVE_GOODS")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-wider transition-all active:scale-95 shadow-xs"
                  >
                    Receive Goods
                  </button>
                )}
                <button 
                  onClick={() => setViewingPO(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
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