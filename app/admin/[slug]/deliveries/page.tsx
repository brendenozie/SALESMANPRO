"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { 
  PlusCircleIcon, 
  MagnifyingGlassIcon, 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon, 
  ClipboardDocumentCheckIcon, 
  ArchiveBoxIcon, 
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';

// --- Types & Constants ---
type DeliveryStatus = 'Pending' | 'InProgress' | 'Delivered' | 'Cancelled';

interface Order {
  id: string;
  productName: string;
  totalFinalPrice: number;
  lat?: number;
  lng?: number;
  deliveryAddress: string;
  pickupAddress: string;
  customerName: string;
  weight?: number;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  riderId?: string;
  riderName?: string;
  deliveryFee: number;
  orderIds: string[];
  pickupAddress: string;
  deliveryAddress: string;
  weightKg: number;
  packageValue: number;
  packageDescription: string;
  scheduledFor?: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

// --- Helpers ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildAggregateFromOrders = (selectedIds: string[], allOrders: Order[]) => {
  const selected = allOrders.filter(o => selectedIds.includes(o.id));
  return {
    packageDescription: selected.map(o => o.productName).join(', '),
    weightKgHint: selected.reduce((sum, o) => sum + (o.weight || 0.5), 0),
    packageValueHint: selected.reduce((sum, o) => sum + (o.totalFinalPrice || 0), 0),
    pickupAddress: selected[0]?.pickupAddress || '',
    deliveryAddress: selected.length > 1 ? `${selected.length} Drop-off Points` : selected[0]?.deliveryAddress || '',
  };
};

// --- Sub-Components ---

const DeliverySummaryCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className={`${colorClass} p-6 rounded-3xl shadow-2xl text-white transform hover:-translate-y-1 transition duration-300 relative overflow-hidden group`}>
    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-32 w-32" />
    </div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em]">{title}</p>
        <h3 className="text-4xl font-black mt-1 tracking-tight">{value}</h3>
      </div>
      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);


const AddEditDeliveryModal = ({ isOpen, onClose, delivery, riders, orders, onSave, isSubmitting, companyId }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [nearbyOrderIds, setNearbyOrderIds] = useState<string[]>([]);

  const updateNearbySuggestions = (selectedIds: string[]) => {
    if (selectedIds.length === 0) { setNearbyOrderIds([]); return; }
    const primary = orders.find((o: Order) => o.id === selectedIds[0]);
    if (!primary?.lat || !primary?.lng) return;

    const nearby = orders
      .filter((o: Order) => !selectedIds.includes(o.id) && o.lat && 
        calculateDistance(primary.lat!, primary.lng!, o.lat, o.lng!) < 5)
      .map((o: Order) => o.id);
    setNearbyOrderIds(nearby);
  };

  useEffect(() => {
    if (delivery) {
      setFormData(delivery);
    } else {
      // Initialize with schema defaults
      setFormData({
        status: 'PENDING',
        orderIds: [],
        deliveryFee: 150,
        trackingNumber: `VH-${Math.random().toString(36).toUpperCase().substring(2, 9)}`,
        companyId: companyId
      });
    }
  }, [delivery, isOpen, companyId]);

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.target.selectedOptions).map(opt => opt.value);
    
    // Update proximity suggestions
    updateNearbySuggestions(ids);
    
    // Calculate aggregates from your existing helper
    const agg = buildAggregateFromOrders(ids, orders);
    
    setFormData((prev: any) => ({ 
        ...prev, 
        orderIds: ids, 
        packageDescription: agg.packageDescription,
        weightKg: agg.weightKgHint,
        packageValue: agg.packageValueHint,
        pickupAddress: agg.pickupAddress,
        deliveryAddress: agg.deliveryAddress,
        // customerName: agg.customerName // New schema field
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] w-full max-w-6xl overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tighter italic">
                {delivery ? 'Refine Manifest' : 'Create Dispatch'}
            </h2>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mt-1">VelocityHub Smart Logistics</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all group">
            <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-h-[80vh] overflow-y-auto scrollbar-hide">
          
          {/* Column 1: Order Selection (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                <QueueListIcon className="h-4 w-4 mr-2" /> 1. Bundle Orders
            </label>
            <div className="relative">
                <select multiple size={15} value={formData.orderIds} onChange={handleOrderChange}
                className="w-full rounded-[2rem] border-2 border-gray-50 focus:border-indigo-500 focus:ring-0 text-xs shadow-inner p-4 transition-all bg-gray-50/50">
                {orders.map((o: any) => (
                    <option key={o.id} value={o.id} className="p-3 rounded-xl mb-1 cursor-pointer checked:bg-indigo-600 checked:text-white border border-transparent">
                    {nearbyOrderIds.includes(o.id) ? '📍 ' : ''} {o.name || 'Untitled Order'} — {o.totalFinalPrice}
                    </option>
                ))}
                </select>
            </div>
          </div>

          {/* Column 2: Logistics Info (Middle) */}
          <div className="lg:col-span-4 space-y-6">
            <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" /> 2. Route Details
            </label>
            
            <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Pickup Point</label>
                    <textarea value={formData.pickupAddress || ''} 
                        onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" rows={2} />
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Delivery Destination</label>
                    <textarea value={formData.deliveryAddress || ''} 
                        onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" rows={2} />
                </div>

                <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Package Description</label>
                    <input type="text" value={formData.packageDescription || ''} 
                        onChange={(e) => setFormData({...formData, packageDescription: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" />
                </div>
            </div>
          </div>

          {/* Column 3: Summary & Dispatch (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black uppercase opacity-50">Tracking</span>
                    <span className="text-xs font-mono font-bold">{formData.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black uppercase opacity-50">Total Value</span>
                    <span className="text-xl font-black">Ksh {formData.packageValue?.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black uppercase opacity-50">Weight</p>
                        <p className="text-lg font-bold">{formData.weightKg || 0}kg</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black uppercase opacity-50">Fee</p>
                        <p className="text-lg font-bold text-green-400">Ksh {formData.deliveryFee}</p>
                    </div>
                </div>

                <div className="pt-4">
                    <label className="text-[10px] font-black text-indigo-300 uppercase">Assigned Rider</label>
                    <select value={formData.riderId || ''} 
                        onChange={(e) => setFormData({...formData, riderId: e.target.value})}
                        className="w-full mt-2 p-4 rounded-2xl bg-white/10 border-none focus:ring-2 focus:ring-white text-sm font-bold text-white">
                        <option value="" className="text-gray-900">Awaiting Rider...</option>
                        {riders.map((r: any) => <option key={r.id} value={r.id} className="text-gray-900">{r.name}</option>)}
                    </select>
                </div>
            </div>

            <button type="submit" disabled={isSubmitting || !formData.orderIds?.length} 
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center uppercase tracking-widest text-sm disabled:opacity-50 disabled:translate-y-0">
                {isSubmitting ? 'Syncing Fleet...' : 'Confirm Dispatch'}
                <ChevronRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddEditDeliveryModalv1 = ({ isOpen, onClose, delivery, riders, orders, onSave, isSubmitting }: any) => {
  const [formData, setFormData] = useState<Partial<Delivery>>({});
  const [nearbyOrderIds, setNearbyOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (delivery) setFormData(delivery);
    else setFormData({ status: 'Pending', orderIds: [], deliveryFee: 150 });
  }, [delivery, isOpen]);

  const updateNearbySuggestions = (selectedIds: string[]) => {
    if (selectedIds.length === 0) { setNearbyOrderIds([]); return; }
    const primary = orders.find((o: Order) => o.id === selectedIds[0]);
    if (!primary?.lat || !primary?.lng) return;

    const nearby = orders
      .filter((o: Order) => !selectedIds.includes(o.id) && o.lat && 
        calculateDistance(primary.lat!, primary.lng!, o.lat, o.lng!) < 5)
      .map((o: Order) => o.id);
    setNearbyOrderIds(nearby);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ids = Array.from(e.target.selectedOptions).map(opt => opt.value);
    updateNearbySuggestions(ids);
    const agg = buildAggregateFromOrders(ids, orders);
    setFormData(prev => ({ 
        ...prev, 
        orderIds: ids, 
        packageDescription: agg.packageDescription,
        weightKg: agg.weightKgHint,
        packageValue: agg.packageValueHint,
        pickupAddress: agg.pickupAddress,
        deliveryAddress: agg.deliveryAddress
    }));
  };

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] w-full max-w-5xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tighter italic">
                {delivery ? 'Refine Manifest' : 'Create Dispatch'}
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Smart Logistics Bundle</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all group">
            <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-h-[75vh] overflow-y-auto">
          {/* Order Selection (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <label className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center">
                <QueueListIcon className="h-4 w-4 mr-2" /> 1. Select Orders to Bundle
            </label>
            <div className="relative group">
                <select multiple size={10} value={formData.orderIds} onChange={handleOrderChange}
                className="w-full rounded-3xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 text-sm shadow-inner p-4 transition-all scrollbar-hide">
                {orders.map((o: Order) => (
                    <option key={o.id} value={o.id} className="p-4 rounded-xl mb-2 cursor-pointer checked:bg-indigo-600 checked:text-white border border-transparent hover:border-indigo-200">
                    {nearbyOrderIds.includes(o.id) ? '📍 [NEARBY] ' : ''} {o.productName} — {o.customerName}
                    </option>
                ))}
                </select>
                <div className="absolute right-4 bottom-4 pointer-events-none opacity-40">
                    <span className="text-[10px] font-black uppercase">Cmd+Click for Multi</span>
                </div>
            </div>
          </div>

          {/* Right Summary Column (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <SparklesIcon className="h-24 w-24" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="font-black text-indigo-200 text-[10px] uppercase tracking-[0.3em]">Manifest Summary</h3>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-sm opacity-70">Order Count</span>
                        <span className="text-4xl font-black">{formData.orderIds?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <span className="text-sm opacity-70">Total Value</span>
                        <span className="text-xl font-bold">Ksh {formData.packageValue?.toLocaleString() || 0}</span>
                    </div>
                    {nearbyOrderIds.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 animate-pulse flex items-center">
                            <SparklesIcon className="h-5 w-5 mr-3 text-yellow-400" />
                            <p className="text-xs font-black uppercase tracking-tight">
                                {nearbyOrderIds.length} Proximity matches found!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Logistics Detail Inputs */}
            <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Weight (KG)</label>
                        <input type="number" step="0.1" value={formData.weightKg || ''} 
                            onChange={(e) => setFormData({...formData, weightKg: Number(e.target.value)})}
                            className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Fee (Ksh)</label>
                        <input type="number" value={formData.deliveryFee || ''} 
                            onChange={(e) => setFormData({...formData, deliveryFee: Number(e.target.value)})}
                            className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-green-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Assigned Rider</label>
                    <select value={formData.riderId || ''} 
                        onChange={(e) => setFormData({...formData, riderId: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold">
                        <option value="">Awaiting Assignment...</option>
                        {riders.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>
          </div>

          <div className="lg:col-span-12 flex justify-end gap-6 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-8 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors uppercase text-sm tracking-widest">Cancel</button>
            <button type="submit" disabled={isSubmitting} 
                className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-indigo-400/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center uppercase tracking-widest text-sm">
                {isSubmitting ? 'Syncing...' : 'Dispatch Hub'}
                <ChevronRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function DeliveriesPage() {
  const { slug: companyId } = useParams();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const safeId = Array.isArray(companyId) ? companyId[0] : (companyId ?? '');
      const params = new URLSearchParams({ companyId: safeId, status: filterStatus === 'All' ? 'PENDING' : filterStatus }).toString();

      const [dRes, rRes, oRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/deliveries?${params}`,{credentials:'include'}),
        fetch(`${apiBaseUrl}/admin/transport/store-drivers?companyId=${safeId}`,{credentials:'include'}),
        fetch(`${apiBaseUrl}/admin/deliveries1?${params}`,{credentials:'include'})
      ]);

      const dData = await dRes.json();
      const rData = await rRes.json();
      const oData = await oRes.json();

      console.log("[DeliveryPage] Fetched deliveries →", dData);
      console.log("[DeliveryPage] Fetched riders →", rData);
      console.log("[DeliveryPage] Fetched orders →", oData);

      setDeliveries(dData.data || []);
      setRiders(rData.data || []);
      
      // Flattened items logic from our API discussion
      const mappedOrders = (oData.data?.items || []).map((item: any) => ({
        id: item.id,
        productName: item.marketplaceListing?.name || 'Item',
        totalFinalPrice: item.price * (item.quantity || 1),
        lat: item.deliveryLat,
        lng: item.deliveryLng,
        deliveryAddress: item.deliveryAddress,
        pickupAddress: item.marketplaceListing?.locationName || 'Main Hub',
        customerName: item.customerName,
      }));
      setOrders(mappedOrders);
    } catch (err) {
      toast.error("Cloud sync failed. Check connection.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: deliveries.length,
    active: deliveries.filter(d => d.status === 'InProgress').length,
    pending: deliveries.filter(d => d.status === 'Pending').length,
    completed: deliveries.filter(d => d.status === 'Delivered').length
  }), [deliveries]);

  // Inside DeliveriesPage.tsx

const handleSaveDelivery = async (formData: Partial<Delivery>) => {
  setIsSubmitting(true);
  try {
    const method = editingDelivery ? 'PATCH' : 'POST';
    const url = editingDelivery 
      ? `${apiBaseUrl}/admin/deliveries/${editingDelivery.id}`
      : `${apiBaseUrl}/admin/deliveries`;

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companyId }),
      });

      if (res.ok) {
        toast.success(editingDelivery ? "Manifest Synced" : "Dispatch Confirmed!");
        setShowAddEditModal(false);
        fetchData(); // Refresh the list
      }
    } catch (err) {
      toast.error("Network error during dispatch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Dismantle this manifest? Orders will return to the queue.")) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/admin/deliveries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Manifest Deleted");
        fetchData();
      }
    } catch (err) {
      toast.error("Could not delete manifest");
    }
  };

  return (
    <div className="p-6 lg:p-12 space-y-12 bg-[#F8FAFC] min-h-screen">
      <Toaster position="bottom-center" />

      {/* Hero Section */}
      <div className="flex flex-col lg:row justify-between items-start lg:items-end gap-6 border-b-2 border-indigo-100 pb-10">
        <div className="space-y-1">
          <h1 className="text-5xl lg:text-7xl font-black text-indigo-950 tracking-tighter italic uppercase">
            Velocity<span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-xs">Real-Time Logistics Operations</p>
        </div>
        <button onClick={() => { setEditingDelivery(null); setShowAddEditModal(true); }}
            className="group relative px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <PlusCircleIcon className="mr-3 h-6 w-6 relative z-10" />
          <span className="relative z-10">Deploy New Manifest</span>
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DeliverySummaryCard title="Total Manifests" value={stats.total} icon={ArchiveBoxIcon} colorClass="bg-indigo-900" />
        <DeliverySummaryCard title="Active In Field" value={stats.active} icon={ClipboardDocumentListIcon} colorClass="bg-blue-600" />
        <DeliverySummaryCard title="Awaiting Rider" value={stats.pending} icon={ClockIcon} colorClass="bg-violet-600" />
        <DeliverySummaryCard title="Successful Drops" value={stats.completed} icon={ClipboardDocumentCheckIcon} colorClass="bg-emerald-600" />
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                <input type="text" placeholder="Trace ID, Rider, or Destination..." 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-transparent focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-300 font-bold text-sm shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-4">
                {['All', 'Pending', 'InProgress', 'Delivered'].map(status => (
                    <button key={status} onClick={() => setFilterStatus(status)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${filterStatus === status ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:text-indigo-600'}`}>
                        {status}
                    </button>
                ))}
            </div>
        </div>

        {isLoading ? (
            <div className="p-32 flex flex-col items-center">
                <ArrowPathIcon className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="mt-4 font-black text-indigo-900/40 uppercase tracking-widest text-xs">Syncing Satellite Data...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tracing</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logistics Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Destinations</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bundle</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rider & Revenue</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {deliveries.map((delivery) => (
                            <tr key={delivery.id} className="group hover:bg-indigo-50/30 transition-all">
                                <td className="px-8 py-6">
                                    <span className="font-black text-indigo-950 text-lg tracking-tighter">#{delivery.trackingNumber}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter border-2
                                        ${delivery.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                          delivery.status === 'InProgress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {delivery.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-[11px] font-bold text-gray-400 italic">
                                            <MapPinIcon className="h-3 w-3 mr-2" /> {delivery.pickupAddress}
                                        </div>
                                        <div className="flex items-center text-sm font-black text-indigo-950">
                                            <TruckIcon className="h-4 w-4 mr-2 text-indigo-600" /> {delivery.deliveryAddress}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="h-9 w-9 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                    {i === 2 ? `+${delivery.orderIds?.length || 0}` : '📦'}
                                                </div>
                                            ))}
                                        </div>
                                        {delivery.orderIds?.length > 1 && (
                                            <span className="ml-4 text-[9px] font-black text-indigo-400 uppercase bg-indigo-50 px-2 py-1 rounded">Bundle</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-black text-indigo-950">{delivery.riderName || 'RIDER UNSET'}</div>
                                    <div className="text-[10px] font-bold text-emerald-600 tracking-widest">KSH {delivery.deliveryFee.toLocaleString()}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => { setEditingDelivery(delivery); setShowAddEditModal(true); }}
                                            className="p-3 text-indigo-600 hover:bg-white rounded-2xl shadow-sm transition-all"><PencilSquareIcon className="h-5 w-5" /></button>
                                        <button className="p-3 text-red-500 hover:bg-white rounded-2xl shadow-sm transition-all"><TrashIcon className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <AddEditDeliveryModal 
        isOpen={showAddEditModal} 
        onClose={() => setShowAddEditModal(false)} 
        delivery={editingDelivery} 
        riders={riders} 
        orders={orders} 
        onSave={handleSaveDelivery} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}