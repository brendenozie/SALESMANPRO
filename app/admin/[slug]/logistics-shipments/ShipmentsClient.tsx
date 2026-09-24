'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArchiveBoxIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  GlobeAmericasIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { Shipment } from './page';

export default function ShipmentsClient({ params }: { params: { companyId: string, shipmentsData: Shipment[] } }) {
  const [shipments, setShipments] = useState<Shipment[]>(params.shipmentsData || []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Modal form state
  const [newShipment, setNewShipment] = useState({
    customerName: '',
    customerContact: '',
    pickupAddress: '',
    deliveryAddress: '',
    packageDescription: '',
    weightKg: '5',
    packageValue: '100',
    shippingMode: 'Land Transport',
  });

  // Dynamic status counts
  const counts = useMemo(() => {
    let inWarehouse = 0;
    let inTransit = 0;
    let delivered = 0;
    let onHold = 0;

    for (const s of shipments) {
      if (s.status === 'In Warehouse') inWarehouse++;
      else if (s.status === 'In Transit') inTransit++;
      else if (s.status === 'Delivered') delivered++;
      else if (s.status === 'On Hold' || s.status === 'Cancelled') onHold++;
    }
    return { inWarehouse, inTransit, delivered, onHold };
  }, [shipments]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch =
        s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        s.customer?.toLowerCase().includes(search.toLowerCase()) ||
        s.content?.toLowerCase().includes(search.toLowerCase()) ||
        s.lastLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [shipments, search, statusFilter]);

  // Handle Export CSV
  const handleExportManifest = () => {
    if (shipments.length === 0) {
      toast.error('No shipment records to export');
      return;
    }
    const headers = ['Tracking Number', 'Customer', 'Content', 'Weight', 'Status', 'Last Location', 'Value'];
    const rows = shipments.map((s) => [
      `"${s.trackingNumber}"`,
      `"${s.customer}"`,
      `"${s.content}"`,
      `"${s.weight}"`,
      `"${s.status}"`,
      `"${s.lastLocation}"`,
      `"${s.value}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shipment_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Manifest exported successfully');
  };

  // Handle Create Shipment
  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipment.pickupAddress || !newShipment.deliveryAddress) {
      toast.error('Both pickup and delivery destination addresses are required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: params.companyId,
          ...newShipment,
          weightKg: Number(newShipment.weightKg) || 1,
          packageValue: Number(newShipment.packageValue) || 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create shipment');
      }

      if (json.data) {
        setShipments([json.data, ...shipments]);
      }

      toast.success('New shipment created and manifested');
      setIsModalOpen(false);
      setNewShipment({
        customerName: '',
        customerContact: '',
        pickupAddress: '',
        deliveryAddress: '',
        packageDescription: '',
        weightKg: '5',
        packageValue: '100',
        shippingMode: 'Land Transport',
      });
    } catch (err: any) {
      toast.error(err.message || 'Error creating shipment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Inventory & Shipments</h1>
          <p className="text-slate-500 font-medium tracking-tight">Real-time parcel auditing and freight manifest management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportManifest}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-slate-500" /> Export Manifest
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all"
          >
            <PlusIcon className="h-5 w-5" /> New Shipment
          </button>
        </div>
      </div>

      {/* Pipeline Summary (Calculated from Real DB Records) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard label="In Warehouse" count={counts.inWarehouse} icon={ArchiveBoxIcon} color="text-amber-600" bg="bg-amber-50" />
        <StatusCard label="In Transit" count={counts.inTransit} icon={TruckIcon} color="text-blue-600" bg="bg-blue-50" />
        <StatusCard label="Delivered" count={counts.delivered} icon={CheckCircleIcon} color="text-emerald-600" bg="bg-emerald-50" />
        <StatusCard label="Pending / On Hold" count={counts.onHold} icon={ClockIcon} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tracking #, Customer, or Content..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl bg-white outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Warehouse">In Warehouse</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Shipment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Hub</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value/Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No shipments match your criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white transition-colors">
                        <GlobeAmericasIcon className="h-5 w-5" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-mono text-xs font-black text-indigo-600 mb-0.5">{s.trackingNumber}</p>
                      <p className="text-sm font-bold text-slate-800">{s.customer}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{s.content}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-slate-700">{s.lastLocation}</p>
                      <p className="text-[10px] text-slate-400">{s.shippingMode}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-black text-slate-800">{s.value}</p>
                      <p className="text-[10px] font-bold text-slate-400">{s.weight}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Shipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase">Create New Shipment</h3>
                <p className="text-xs text-slate-500">Generate a delivery manifest and consignment record</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newShipment.customerName}
                    onChange={(e) => setNewShipment({ ...newShipment, customerName: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Acme Logistics"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newShipment.customerContact}
                    onChange={(e) => setNewShipment({ ...newShipment, customerContact: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1 555 0192"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Origin / Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={newShipment.pickupAddress}
                  onChange={(e) => setNewShipment({ ...newShipment, pickupAddress: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Warehouse Alpha, Pier 9"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Destination Hub *</label>
                <input
                  type="text"
                  required
                  value={newShipment.deliveryAddress}
                  onChange={(e) => setNewShipment({ ...newShipment, deliveryAddress: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Distribution Center 4"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Cargo Description</label>
                <input
                  type="text"
                  value={newShipment.packageDescription}
                  onChange={(e) => setNewShipment({ ...newShipment, packageDescription: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Automotive Components / 10 Crates"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newShipment.weightKg}
                    onChange={(e) => setNewShipment({ ...newShipment, weightKg: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={newShipment.packageValue}
                    onChange={(e) => setNewShipment({ ...newShipment, packageValue: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mode</label>
                  <select
                    value={newShipment.shippingMode}
                    onChange={(e) => setNewShipment({ ...newShipment, shippingMode: e.target.value })}
                    className="w-full border rounded-xl px-2 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="Land Transport">Land</option>
                    <option value="Air Freight">Air</option>
                    <option value="Sea Freight">Sea</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-2/3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  {creating ? 'Registering Manifest...' : 'Manifest Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusCard({ label, count, icon: Icon, color, bg }: any) {
  return (
    <div className={`p-5 rounded-2xl ${bg} border border-white flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{count}</p>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'In Transit': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'In Warehouse': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'On Hold': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
}