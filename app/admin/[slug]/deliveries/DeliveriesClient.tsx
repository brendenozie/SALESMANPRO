'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  BoltIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import SummaryCard from './SummaryCard';
import DeliveryModal from './DeliveryModal';
import RequestExternalRiderModal from '@/components/admin/deliveries/RequestExternalRiderModal';

type DeliveryStatus = 'PENDING' | 'INPROGRESS' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  productName: string;
  totalFinalPrice: number;
  lat?: number;
  lng?: number;
  deliveryAddress: string;
  pickupAddress: string;
  customerName: string;
  customerPhone?: string;
  weight?: number;
}

interface Rider {
  id: string;
  name: string;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  riderId?: string;
  riderName?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  packageDescription?: string;
  packageValue?: number;
  weightKg?: number;
  deliveryFee?: number;
  orderIds?: string[];
  scheduledFor?: string;
  createdAt?: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

const statusLabel = (status: DeliveryStatus) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'INPROGRESS':
      return 'In Progress';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

const statusColor = (status: DeliveryStatus) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'INPROGRESS':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

interface DeliveriesClientProps {
  companyId: string;
}

export default function DeliveriesClient({ companyId }: DeliveriesClientProps) {
  const navigate = (url: string) => {
    window.location.href = url;
  };

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  const [viewMode, setViewMode] = useState<'FLEET' | 'MARKETPLACE'>('FLEET');
  const [marketplaceRequests, setMarketplaceRequests] = useState<any[]>([]);
  const [showExternalRiderModal, setShowExternalRiderModal] = useState(false);
  const [selectedRequestBids, setSelectedRequestBids] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);

  /* =======================================================
     FETCH DATA
  ======================================================= */
  const fetchData = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);

    try {
      const query = new URLSearchParams({
        companyId,
        ...(filter !== 'ALL' && { status: filter }),
      }).toString();

      const [dRes, rRes, oRes, mRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/deliveries?${query}`, {
          credentials: 'include',
        }),
        fetch(`${apiBaseUrl}/admin/transport/store-drivers?companyId=${companyId}`, {
          credentials: 'include',
        }),
        fetch(`${apiBaseUrl}/admin/deliveries/orders?companyId=${companyId}`, {
          credentials: 'include',
        }),
        fetch(`/api/admin/delivery-requests?companyId=${companyId}`),
      ]);

      const dJson = await dRes.json();
      const rJson = await rRes.json();
      const oJson = await oRes.json();
      const mJson = await mRes.json();

      setDeliveries(dJson.data || []);
      setRiders(rJson.data || []);
      if (mJson.success && mJson.data) {
        setMarketplaceRequests(mJson.data);
      }

      const mappedOrders =
        (oJson.data?.items || []).map((item: any) => ({
          id: item.id,
          productName: item.productName || item.marketplaceListing?.name || 'Order Item',
          totalFinalPrice: item.totalFinalPrice || item.price || 0,
          lat: item.shippingAddress?.lat || item.deliveryLat,
          lng: item.shippingAddress?.lng || item.deliveryLng,
          deliveryAddress: item.shippingAddress?.display_name || item.deliveryAddress || 'Destination',
          pickupAddress: item.pickupAddress || 'Warehouse',
          customerName: item.name || 'Customer',
          customerPhone: item.phone,
        })) || [];

      setOrders(mappedOrders);
    } catch (error) {
      toast.error('Failed to sync deliveries.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================================================
     SAVE
  ======================================================= */
  const saveDelivery = async (payload: any) => {
    setIsSubmitting(true);

    try {
      const method = editing ? 'PATCH' : 'POST';

      const url = editing
        ? `${apiBaseUrl}/admin/deliveries/${editing.id}`
        : `${apiBaseUrl}/admin/deliveries`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...payload,
          companyId,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success(editing ? 'Delivery updated' : 'Dispatch created');

      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error('Could not save dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     MARKETPLACE ACTIONS
  ======================================================= */
  const handleAcceptBid = async (requestId: string, bidId: string) => {
    try {
      toast.loading('Assigning rider...', { id: 'accept-bid' });
      const res = await fetch(`/api/admin/delivery-requests/${requestId}/bids/${bidId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Rider assigned successfully!', { id: 'accept-bid' });
        setSelectedRequestBids(null);
        fetchData();
      } else {
        toast.error(data.message || 'Failed to accept bid', { id: 'accept-bid' });
      }
    } catch {
      toast.error('Network error assigning rider', { id: 'accept-bid' });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Cancel this delivery request?')) return;
    try {
      toast.loading('Cancelling request...', { id: 'cancel-req' });
      const res = await fetch(`/api/admin/delivery-requests/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Store cancelled request' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Delivery request cancelled', { id: 'cancel-req' });
        fetchData();
      } else {
        toast.error(data.message || 'Failed to cancel', { id: 'cancel-req' });
      }
    } catch {
      toast.error('Network error cancelling request', { id: 'cancel-req' });
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */
  const deleteDelivery = async (id: string) => {
    if (!confirm('Delete this delivery?')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/admin/deliveries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error();

      toast.success('Deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  /* =======================================================
     FILTERED & STATS
  ======================================================= */
  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const term = search.toLowerCase();

      return (
        d.trackingNumber?.toLowerCase().includes(term) ||
        d.riderName?.toLowerCase().includes(term) ||
        d.deliveryAddress?.toLowerCase().includes(term)
      );
    });
  }, [deliveries, search]);

  const stats = useMemo(() => {
    return {
      total: deliveries.length,
      active: deliveries.filter((x) => x.status === 'INPROGRESS').length,
      pending: deliveries.filter((x) => x.status === 'PENDING').length,
      done: deliveries.filter((x) => x.status === 'DELIVERED').length,
    };
  }, [deliveries]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-8 font-sans">
      <Toaster position="bottom-center" />

      {/* HERO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
            VelocityHub
          </h1>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mt-2">
            Logistics & Hybrid Delivery Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExternalRiderModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
          >
            <BoltIcon className="h-5 w-5" />
            Request External Rider
          </button>

          <button
            onClick={() => {
              setEditing(null);
              navigate(`/admin/${companyId}/deliveries-dispatch`);
            }}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition"
          >
            <PlusCircleIcon className="h-5 w-5" />
            New Fleet Dispatch
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode('FLEET')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            viewMode === 'FLEET'
              ? 'bg-white text-indigo-950 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TruckIcon className="w-4 h-4" />
          Store Fleet Deliveries ({deliveries.length})
        </button>

        <button
          onClick={() => setViewMode('MARKETPLACE')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${
            viewMode === 'MARKETPLACE'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          External Rider Network ({marketplaceRequests.length})
        </button>
      </div>

      {/* FLEET VIEW */}
      {viewMode === 'FLEET' && (
        <div className="space-y-8">
          {/* STATS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total Fleet"
              value={stats.total}
              icon={ArchiveBoxIcon}
              color="bg-indigo-950"
            />
            <SummaryCard
              title="In Progress"
              value={stats.active}
              icon={TruckIcon}
              color="bg-blue-600"
            />
            <SummaryCard
              title="Pending"
              value={stats.pending}
              icon={ClockIcon}
              color="bg-amber-500"
            />
            <SummaryCard
              title="Delivered"
              value={stats.done}
              icon={ClipboardDocumentCheckIcon}
              color="bg-emerald-600"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
            {/* Top Bar */}
            <div className="p-6 border-b flex flex-col lg:flex-row gap-4 justify-between">
              <div className="relative w-full lg:w-96">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search tracking / rider / destination"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 pl-12 pr-4 py-4 text-xs font-semibold"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {['ALL', 'PENDING', 'INPROGRESS', 'DELIVERED', 'CANCELLED'].map((x) => (
                  <button
                    key={x}
                    onClick={() => setFilter(x)}
                    className={`px-4 py-3 rounded-xl text-xs font-black tracking-widest ${
                      filter === x
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            {isLoading ? (
              <div className="p-20 flex flex-col items-center">
                <ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm font-bold text-slate-400">
                  Loading deliveries...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-6 py-4 text-xs">Tracking</th>
                      <th className="px-6 py-4 text-xs">Status</th>
                      <th className="px-6 py-4 text-xs">Route</th>
                      <th className="px-6 py-4 text-xs">Internal Driver</th>
                      <th className="px-6 py-4 text-xs">Fee</th>
                      <th className="px-6 py-4 text-xs">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-t hover:bg-slate-50">
                        <td className="px-6 py-5 font-black text-indigo-950">
                          #{row.trackingNumber}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-2 rounded-full border text-xs font-black ${statusColor(
                              row.status
                            )}`}
                          >
                            {statusLabel(row.status)}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="text-xs text-slate-400 flex gap-2">
                              <MapPinIcon className="h-4 w-4" />
                              {row.pickupAddress}
                            </div>
                            <div className="font-bold text-sm flex gap-2">
                              <TruckIcon className="h-4 w-4 text-indigo-600" />
                              {row.deliveryAddress}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {row.riderName || 'Unassigned'}
                        </td>

                        <td className="px-6 py-5 font-black text-emerald-600">
                          KES {row.deliveryFee || 0}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditing(row);
                                setShowModal(true);
                              }}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                            >
                              <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                            </button>

                            <button
                              onClick={() => deleteDelivery(row.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                            >
                              <TrashIcon className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filtered.length && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-16 text-slate-400 font-semibold"
                        >
                          No fleet deliveries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MARKETPLACE VIEW */}
      {viewMode === 'MARKETPLACE' && (
        <div className="space-y-8">
          {/* STATS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total Requests"
              value={marketplaceRequests.length}
              icon={ArchiveBoxIcon}
              color="bg-emerald-950"
            />
            <SummaryCard
              title="Searching / Bidding"
              value={
                marketplaceRequests.filter(
                  (x) =>
                    x.status === 'SEARCHING_FOR_RIDER' ||
                    x.status === 'OFFERED' ||
                    x.status === 'BIDDING'
                ).length
              }
              icon={ClockIcon}
              color="bg-amber-500"
            />
            <SummaryCard
              title="Assigned / Transit"
              value={
                marketplaceRequests.filter(
                  (x) =>
                    x.status === 'RIDER_ASSIGNED' ||
                    x.status === 'IN_TRANSIT' ||
                    x.status === 'RIDER_EN_ROUTE_TO_PICKUP'
                ).length
              }
              icon={TruckIcon}
              color="bg-blue-600"
            />
            <SummaryCard
              title="Delivered"
              value={
                marketplaceRequests.filter((x) => x.status === 'DELIVERED').length
              }
              icon={ClipboardDocumentCheckIcon}
              color="bg-emerald-600"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-indigo-950">On-Demand Rider Requests</h3>
                <p className="text-xs text-slate-400">Broadcasted to independent riders in your area</p>
              </div>
              <button
                onClick={() => fetchData()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowPathIcon className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-xs">Request ID</th>
                    <th className="px-6 py-4 text-xs">Status</th>
                    <th className="px-6 py-4 text-xs">Pickup / Destination</th>
                    <th className="px-6 py-4 text-xs">Assigned Rider</th>
                    <th className="px-6 py-4 text-xs">Offered Fee</th>
                    <th className="px-6 py-4 text-xs">Incoming Bids</th>
                    <th className="px-6 py-4 text-xs">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {marketplaceRequests.map((req) => (
                    <tr key={req.id} className="border-t hover:bg-slate-50">
                      <td className="px-6 py-5 font-black text-indigo-950 text-xs">
                        #{req.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-full border text-[11px] font-black uppercase ${
                            req.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : req.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : req.status === 'RIDER_ASSIGNED' || req.status === 'IN_TRANSIT'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {req.status?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-500 truncate max-w-xs">
                            From: {req.pickupAddress}
                          </p>
                          <p className="font-bold text-slate-800 truncate max-w-xs">
                            To: {req.dropoffAddress}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {req.assignment?.rider ? (
                          <div className="text-xs">
                            <p className="font-bold text-slate-900">{req.assignment.rider.fullName}</p>
                            <p className="text-slate-500">{req.assignment.rider.phone}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Searching nearby...</span>
                        )}
                      </td>

                      <td className="px-6 py-5 font-black text-emerald-600 text-xs">
                        KES {req.offeredFee?.toLocaleString()}
                        {req.allowBidding && (
                          <span className="block text-[10px] text-indigo-500 font-semibold">Bidding open</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {req.bids && req.bids.length > 0 ? (
                          <button
                            onClick={() => setSelectedRequestBids(req)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            {req.bids.length} Bid{req.bids.length > 1 ? 's' : ''} Received
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">0 bids</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {req.status === 'SEARCHING_FOR_RIDER' ||
                        req.status === 'OFFERED' ||
                        req.status === 'BIDDING' ? (
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                            title="Cancel Request"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!marketplaceRequests.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-16 text-slate-400 font-semibold"
                      >
                        No external rider requests yet. Click "Request External Rider" to broadcast an order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Review Incoming Bids */}
      {selectedRequestBids && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Rider Bids for Order</h3>
                <p className="text-xs text-slate-500">
                  Offered: KES {selectedRequestBids.offeredFee?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestBids(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="divide-y text-xs max-h-80 overflow-y-auto">
              {selectedRequestBids.bids?.map((bid: any) => (
                <div key={bid.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{bid.rider?.fullName || 'Rider'}</p>
                    <p className="text-slate-500">
                      ETA: {bid.estimatedMinutes || 20} mins • Rating: 5.0
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 text-sm">
                      KES {bid.proposedFee?.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAcceptBid(selectedRequestBids.id, bid.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <DeliveryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        riders={riders}
        orders={orders}
        delivery={editing}
        onSave={saveDelivery}
        isSubmitting={isSubmitting}
      />

      <RequestExternalRiderModal
        isOpen={showExternalRiderModal}
        onClose={() => setShowExternalRiderModal(false)}
        orders={orders}
        companyId={companyId}
        onSuccess={fetchData}
      />
    </div>
  );
}