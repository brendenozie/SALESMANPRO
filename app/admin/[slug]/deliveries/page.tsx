'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TagIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Type Definitions ---
type RiderInfo = {
  id: string;
  name: string;
};

export type Order = {
  id: string;
  status?: string;
  consumer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  items?: Array<{
    id?: string;
    price?: number;
    quantity?: number;
    marketplaceListing?: { title?: string } | null;
    title?: string;
  }>;
  totalAmount?: number;
  createdAt?: string;
  // fallback fields (some APIs might return nested shapes)
  orderItems?: any;
};

export type Delivery = {
  id: string;
  trackingNumber: string;
  riderId: string | null;
  riderName: string | 'Unassigned';
  status: 'Pending' | 'InProgress' | 'Delivered' | 'Cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  weightKg: number;
  deliveryFee: number;
  createdAt: string;
  scheduledFor: string;
  // NEW: multiple orders support
  orderIds?: string[]; // array of linked order IDs
  // Optionally include order summary in API response (if backend returns)
  orders?: Order[]; 
};

// --- Dummy Data (Riders and Deliveries) ---
const DUMMY_RIDERS: RiderInfo[] = [
  { id: 'RDR001', name: 'Aisha Hassan' },
  { id: 'RDR002', name: 'David Kimani' },
  { id: 'RDR003', name: 'Grace Wanjiku' },
];

const generateSampleDeliveries = (): Delivery[] => [
  {
    id: 'DEL001',
    trackingNumber: 'TN-543210',
    riderId: 'RDR001',
    riderName: 'Aisha Hassan',
    status: 'InProgress',
    pickupAddress: '123 Tech Hub Ave, Kilimani',
    deliveryAddress: '45 Green St, Westlands',
    packageDescription: 'Electronics, high-value',
    weightKg: 2.5,
    deliveryFee: 500,
    createdAt: new Date('2024-10-01T10:00:00Z').toISOString(),
    scheduledFor: new Date('2024-10-02T14:00:00Z').toISOString(),
    orderIds: ['ORD001', 'ORD002'],
  },
  {
    id: 'DEL002',
    trackingNumber: 'TN-987654',
    riderId: 'RDR003',
    riderName: 'Grace Wanjiku',
    status: 'Delivered',
    pickupAddress: '88 Food Court, CBD',
    deliveryAddress: '30 Residential Rd, Kileleshwa',
    packageDescription: 'Food order, urgent',
    weightKg: 0.8,
    deliveryFee: 350,
    createdAt: new Date('2024-10-02T11:30:00Z').toISOString(),
    scheduledFor: new Date('2024-10-02T12:30:00Z').toISOString(),
    orderIds: ['ORD010'],
  },
  {
    id: 'DEL003',
    trackingNumber: 'TN-112233',
    riderId: null,
    riderName: 'Unassigned',
    status: 'Pending',
    pickupAddress: '20 Industrial Park, Thika Rd',
    deliveryAddress: '15 Warehouse Ln, Industrial Area',
    packageDescription: 'Bulk shipment, 10 cartons',
    weightKg: 55.0,
    deliveryFee: 1200,
    createdAt: new Date('2024-10-02T15:00:00Z').toISOString(),
    scheduledFor: new Date('2024-10-03T09:00:00Z').toISOString(),
    orderIds: [],
  },
  {
    id: 'DEL004',
    trackingNumber: 'TN-001992',
    riderId: 'RDR002',
    riderName: 'David Kimani',
    status: 'Cancelled',
    pickupAddress: '99 Main Office Block, Upper Hill',
    deliveryAddress: '1 Business Tower, City Centre',
    packageDescription: 'Confidential documents',
    weightKg: 0.2,
    deliveryFee: 400,
    createdAt: new Date('2024-10-01T14:00:00Z').toISOString(),
    scheduledFor: new Date('2024-10-02T09:00:00Z').toISOString(),
    orderIds: ['ORD099'],
  },
];

// --- Helper & Reusable Components (No changes needed) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10" aria-label="Close modal"><XMarkIcon className="h-7 w-7" /></button>
        {children}
      </div>
    </div>
  );
};

interface SummaryCardProps { title: string; value: string | number; icon: React.ElementType; colorClass: string; }
const DeliverySummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-start text-left`}>
    <Icon className="h-8 w-8 mb-2 opacity-90" />
    <p className="text-sm font-light uppercase opacity-90">{title}</p>
    <p className="text-3xl font-extrabold mt-1">{value}</p>
  </div>
);

const getStatusStyles = (status: Delivery['status']) => {
  switch (status) {
    case 'Delivered': return { text: 'text-green-800', bg: 'bg-green-100', icon: ClipboardDocumentCheckIcon };
    case 'InProgress': return { text: 'text-blue-800', bg: 'bg-blue-100', icon: ClipboardDocumentListIcon };
    case 'Pending': return { text: 'text-yellow-800', bg: 'bg-yellow-100', icon: ClockIcon };
    case 'Cancelled': return { text: 'text-red-800', bg: 'bg-red-100', icon: ExclamationTriangleIcon };
    default: return { text: 'text-gray-800', bg: 'bg-gray-100', icon: TagIcon };
  }
};

// --- Add/Edit Delivery Modal Component (UPDATED for multiple orders) ---
interface AddEditDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery | null;
  riders: RiderInfo[];
  orders: Order[]; // pass available orders here
  onSave: (deliveryData: Partial<Delivery>) => Promise<void>;
  isSubmitting: boolean;
}
const AddEditDeliveryModal: React.FC<AddEditDeliveryModalProps> = ({ isOpen, onClose, delivery, riders, orders, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Delivery>>({});

  useEffect(() => {
    if (delivery) {
      setFormData({
        ...delivery,
        scheduledFor: delivery.scheduledFor ? new Date(delivery.scheduledFor).toISOString().substring(0, 16) : '',
        orderIds: delivery.orderIds || [],
        riderId: delivery.riderId || '',
      });
    } else {
      setFormData({
        trackingNumber: `TN-${Math.floor(100000 + Math.random() * 900000)}`,
        riderId: '',
        status: 'Pending',
        pickupAddress: '',
        deliveryAddress: '',
        packageDescription: '',
        weightKg: 1.0,
        deliveryFee: 100,
        scheduledFor: new Date(Date.now() + 3600000).toISOString().substring(0, 16),
        orderIds: [],
      });
    }
  }, [delivery, isOpen]);

  // Helper: Build aggregate description and addresses when orders are selected
  const buildAggregateFromOrders = (selectedOrderIds: string[] | undefined) => {
    if (!selectedOrderIds || selectedOrderIds.length === 0) return {};
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    if (selectedOrders.length === 0) return {};

    // Choose first as primary fallback for addresses/fee
    const primary = selectedOrders[0];

    // Aggregate description from item titles or marketplaceListing titles
    const itemTitles = selectedOrders.flatMap(o => (o.items || []).map(it => it.marketplaceListing?.title || it.title || '').filter(Boolean));
    const uniqueTitles = Array.from(new Set(itemTitles)).slice(0, 6); // limit to avoid blowup
    const packageDescription = uniqueTitles.length > 0 ? uniqueTitles.join(', ') : (primary?.items?.map(i => i.title).filter(Boolean).join(', ') || '');

    // Sum up some metrics if desired (e.g., total fee heuristic)
    const totalAmount = selectedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return {
      pickupAddress: primary.pickupAddress || primary.consumer?.address || '',
      deliveryAddress: primary.deliveryAddress || primary.consumer?.address || '',
      packageDescription,
      deliveryFeeHint: totalAmount > 0 ? Math.round(totalAmount * 0.05) : undefined, // example: 5% of total as suggestion (you can customize)
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: (name === 'weightKg' || name === 'deliveryFee') ? parseFloat(value) : value }));
  };

  const handleRiderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const riderId = e.target.value;
    const selectedRider = riders.find(r => r.id === riderId);
    setFormData((prev) => ({ ...prev, riderId: riderId === '' ? null : riderId, riderName: selectedRider ? selectedRider.name : 'Unassigned', status: (riderId !== '' && prev.status === 'Pending') ? 'InProgress' : (prev.status || 'Pending'), }));
  }

  const handleOrderSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // multi-select gives options with selected property; build array of selected values
    const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData((prev) => {
      const aggregated = buildAggregateFromOrders(selectedOptions);
      // If fields are empty, auto-populate with aggregated values but don't override fields the user already typed in
      return {
        ...prev,
        orderIds: selectedOptions,
        pickupAddress: (prev.pickupAddress && prev.pickupAddress !== '') ? prev.pickupAddress : (aggregated.pickupAddress || prev.pickupAddress),
        deliveryAddress: (prev.deliveryAddress && prev.deliveryAddress !== '') ? prev.deliveryAddress : (aggregated.deliveryAddress || prev.deliveryAddress),
        packageDescription: (prev.packageDescription && prev.packageDescription !== '') ? prev.packageDescription : (aggregated.packageDescription || prev.packageDescription),
        deliveryFee: prev.deliveryFee && prev.deliveryFee > 0 ? prev.deliveryFee : (aggregated.deliveryFeeHint || prev.deliveryFee),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.packageDescription) {
      toast.error("Please fill in all required address and description fields.");
      return;
    }
    const riderAssignment = riders.find(r => r.id === formData.riderId);
    const dataToSave: Partial<Delivery> = {
      ...formData,
      riderId: formData.riderId || null,
      riderName: riderAssignment ? riderAssignment.name : 'Unassigned',
      scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : new Date().toISOString(),
      createdAt: delivery ? delivery.createdAt : new Date().toISOString(),
      orderIds: formData.orderIds || [],
    };
    await onSave(dataToSave);
  };

  const isEdit = !!delivery;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{isEdit ? "Edit Delivery Details" : "Create New Delivery"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
              <input type="text" id="trackingNumber" name="trackingNumber" value={formData.trackingNumber || ''} readOnly className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 font-mono text-lg cursor-not-allowed" />
            </div>

            {/* Link multiple orders */}
            <div className="md:col-span-2">
              <label htmlFor="orderIds" className="block text-sm font-medium text-gray-700 mb-1">Link Orders (optional)</label>
              <div className="relative">
                <select id="orderIds" name="orderIds" value={formData.orderIds || []} onChange={handleOrderSelection} multiple size={4} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                  {orders.length === 0 ? (
                    <option disabled>No orders available</option>
                  ) : (
                    orders.map(o => {
                      const label = `#${o.id} — ${o.consumer?.name || 'No Name'}${o.status ? ` — ${o.status}` : ''}`;
                      return <option key={o.id} value={o.id}>{label}</option>;
                    })
                  )}
                </select>
                <p className="text-xs mt-2 text-gray-500">You can select multiple orders to group into a single delivery.</p>
              </div>
            </div>

            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPinIcon className="h-5 w-5 text-gray-400" /></div><input type="text" id="pickupAddress" name="pickupAddress" value={formData.pickupAddress || ""} onChange={handleChange} placeholder="e.g., 100 Industrial Area" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
            </div>
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPinIcon className="h-5 w-5 text-gray-400" /></div><input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress || ""} onChange={handleChange} placeholder="e.g., 25 Residential Estate" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
            </div>
            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDaysIcon className="h-5 w-5 text-gray-400" /></div><input type="datetime-local" id="scheduledFor" name="scheduledFor" value={formData.scheduledFor ? formData.scheduledFor.substring(0, 16) : ''} onChange={handleChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            </div>
            <div>
              <label htmlFor="riderId" className="block text-sm font-medium text-gray-700 mb-1">Assign Rider</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TruckIcon className="h-5 w-5 text-gray-400" /></div><select id="riderId" name="riderId" value={formData.riderId || ''} onChange={handleRiderChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"><option value="">-- Select Rider (Unassigned) --</option>{riders.map(rider => (<option key={rider.id} value={rider.id}>{rider.name}</option>))}</select></div>
            </div>
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BoltIcon className="h-5 w-5 text-gray-400" /></div><input type="number" id="weightKg" name="weightKg" value={formData.weightKg || 0} onChange={handleChange} min="0.1" step="0.1" placeholder="e.g., 5.5" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            </div>
            <div>
              <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee</label>
              <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold">Ksh</span></div><input type="number" id="deliveryFee" name="deliveryFee" value={formData.deliveryFee || 0} onChange={handleChange} min="0" step="50" placeholder="e.g., 400" className="w-full p-3 pl-14 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
            </div>
            <div className='md:col-span-2'><label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></div><select id="status" name="status" value={formData.status || 'Pending'} onChange={handleChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"><option value="Pending">Pending</option><option value="InProgress">In Progress</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></div></div>
            <div className="md:col-span-2"><label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">Package Description</label><div className="relative"><textarea id="packageDescription" name="packageDescription" value={formData.packageDescription || ""} onChange={handleChange} placeholder="e.g., Documents for signing, fragile electronics, bulk food supplies." rows={3} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required></textarea></div></div>
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100"><button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold" disabled={isSubmitting}>Cancel</button><button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>{isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}{isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Delivery")}</button></div>
        </form>
      </div>
    </Modal>
  );
};

// --- Delivery Row & Delete Modal (UPDATED to show linked orders) ---
interface DeliveryRowProps { delivery: Delivery; onEdit: (delivery: Delivery) => void; onDelete: (delivery: Delivery) => void; ordersMap?: Record<string, Order>; }
const DeliveryRow: React.FC<DeliveryRowProps> = ({ delivery, onEdit, onDelete, ordersMap = {} }) => {
  const { text: statusTextClass, bg: statusBgClass, icon: StatusIcon } = getStatusStyles(delivery.status);
  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{delivery.trackingNumber}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2"><StatusIcon className={`h-5 w-5 ${statusTextClass}`} /><span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBgClass} ${statusTextClass}`}>{delivery.status}</span></div>
      </td>
      <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={delivery.pickupAddress}><span className="font-medium text-gray-900">P/U:</span> {delivery.pickupAddress}</td>
      <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={delivery.deliveryAddress}><span className="font-medium text-gray-900">D/O:</span> {delivery.deliveryAddress}</td>

      {/* Linked Orders column */}
      <td className="px-6 py-4 text-gray-700">
        {delivery.orderIds && delivery.orderIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {delivery.orderIds.slice(0, 3).map(oid => {
              const order = ordersMap[oid];
              return (
                <span key={oid} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                  #{oid}{order?.consumer?.name ? ` — ${order.consumer.name}` : ''}
                </span>
              );
            })}
            {delivery.orderIds.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">+{delivery.orderIds.length - 3}</span>}
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">No Order</span>
        )}
      </td>

      <td className="px-6 py-4 text-gray-700"><div className="flex items-center space-x-1"><TruckIcon className="h-4 w-4 text-indigo-500" /><span className={delivery.riderId ? "font-medium text-indigo-700" : "text-gray-500 italic"}>{delivery.riderName}</span></div></td>
      <td className="px-6 py-4 text-gray-700"><span className="font-semibold text-sm">Ksh {delivery.deliveryFee.toLocaleString()}</span></td>
      <td className="px-6 py-4 text-gray-700 text-sm">{formatDateTime(delivery.scheduledFor)}</td>
      <td className="px-6 py-4 space-x-3 whitespace-nowrap">
        <button onClick={() => onEdit(delivery)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit Delivery"><PencilSquareIcon className="h-5 w-5 inline" /></button>
        <button onClick={() => onDelete(delivery)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete Delivery"><TrashIcon className="h-5 w-5 inline" /></button>
      </td>
    </tr>
  );
};

interface DeleteConfirmationModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; riderName: string; isSubmitting: boolean; }
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, riderName: itemName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}><div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200"><ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" /><h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2><p className="text-lg text-gray-600 mb-7">Are you sure you want to delete <span className="font-bold text-red-600">"{itemName}"</span>? This action is irreversible and will permanently remove this delivery record.</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold" disabled={isSubmitting}>Cancel</button><button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>{isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}{isSubmitting ? "Deleting..." : "Delete Order"}</button></div></div></Modal>
);

// --- Main DeliveriesPage Component (with API Logic) ---
export default function DeliveriesPage() {
  const { slug : companyId } = useParams();

  // --- State Management ---
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<RiderInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<string, Order>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);

  // Debounce search input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- API Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const safeCompanyId = Array.isArray(companyId) ? companyId[0] : (companyId ?? '');
      const deliveryParams = new URLSearchParams({
        companyId: safeCompanyId,
        searchTerm: debouncedSearchTerm,
        status: filterStatus,
      }).toString();

      const riderParams = new URLSearchParams({ companyId: safeCompanyId }).toString();
      const ordersParams = new URLSearchParams({ companyId: safeCompanyId }).toString();

      // Fetch deliveries, riders and orders in parallel
      const [deliveriesRes, ridersRes, ordersRes] = await Promise.all([
        fetch(`${apiUrl}/admin/deliveries?${deliveryParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Credentials': 'include'
           }
        }),
        fetch(`${apiUrl}/admin/riders?${riderParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Credentials': 'include'
            }
        }),
        fetch(`${apiUrl}/admin/orders?${ordersParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Credentials': 'include'
          }
        }),
      ]);

      if (!deliveriesRes.ok) throw new Error('Failed to fetch deliveries.');
      if (!ridersRes.ok) throw new Error('Failed to fetch riders.');
      if (!ordersRes.ok) throw new Error('Failed to fetch orders.');

      const deliveriesData = await deliveriesRes.json();
      const ridersData = await ridersRes.json();
      const ordersData = await ordersRes.json();

      // Your API returns { data: [ ... ] } for orders etc.
      const fetchedDeliveries: Delivery[] = deliveriesData.data || [];
      const fetchedRiders: RiderInfo[] = ridersData.data || [];
      // const fetchedOrders: Order[] = ordersData.data || [];
      
      const json: { orderItems: Order[] } = ordersData.data || [];
      let orderItems = json.orderItems || [];

      // Build quick lookup map for orders to show labels in the table
      const map: Record<string, Order> = {};
      orderItems.forEach(o => { if (o && o.id) map[o.id] = o; });

      setDeliveries(fetchedDeliveries);
      setRiders(fetchedRiders);
      setOrders(orderItems);
      setOrdersMap(map);

      console.log('Fetched Deliveries:', fetchedDeliveries);
      console.log('Fetched Riders:', fetchedRiders);
      console.log('Fetched Orders:', orderItems);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error('Could not fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, debouncedSearchTerm, filterStatus]);

  // Trigger fetch on initial load and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD Handlers ---
  const handleAddDelivery = () => { setEditingDelivery(null); setShowAddEditModal(true); };
  const handleEditDelivery = (delivery: Delivery) => { setEditingDelivery(delivery); setShowAddEditModal(true); };
  const handleDeleteClick = (delivery: Delivery) => { setDeliveryToDelete(delivery); setShowDeleteConfirmModal(true); };

  const handleSaveDelivery = async (formData: Partial<Delivery>) => {
    setIsSubmitting(true);
    const isEdit = !!editingDelivery;
    const toastId = toast.loading(isEdit ? 'Updating delivery...' : 'Creating delivery...');

    try {
      const url = isEdit ? `${apiUrl}/admin/deliveries/${editingDelivery.id}` : `${apiUrl}/admin/deliveries`;
      const method = isEdit ? 'PUT' : 'POST';

      // ensure companyId passed
      const safeCompanyId = Array.isArray(companyId) ? companyId[0] : (companyId ?? '');

      const body = {
        ...formData,
        orderIds: formData.orderIds || [],
        companyId: safeCompanyId,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save delivery.');
      }

      toast.success(`Delivery ${isEdit ? 'updated' : 'created'} successfully!`, { id: toastId });
      setShowAddEditModal(false);
      fetchData(); // Refresh data from server
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deliveryToDelete) return;
    setIsSubmitting(true);
    const toastId = toast.loading(`Deleting delivery ${deliveryToDelete.trackingNumber}...`);

    try {
      const response = await fetch(`${apiUrl}/admin/deliveries/${deliveryToDelete.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Credentials': 'include' } });
      if (!response.ok) {
        const errorData = (await response.json()).data;
        throw new Error(errorData?.message || 'Failed to delete.');
      }
      toast.success(`Delivery deleted successfully!`, { id: toastId });
      setShowDeleteConfirmModal(false);
      setDeliveryToDelete(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary calculations based on fetched data
  const totalDeliveries = deliveries.length;
  const inProgress = useMemo(() => deliveries.filter(d => d.status === 'InProgress').length, [deliveries]);
  const delivered = useMemo(() => deliveries.filter(d => d.status === 'Delivered').length, [deliveries]);
  const pending = useMemo(() => deliveries.filter(d => d.status === 'Pending').length, [deliveries]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Deliveries Management 📦</h1>
          <p className="text-md text-gray-600 mt-1">Track all incoming, in-progress, and completed delivery orders.</p>
        </div>
        <button onClick={handleAddDelivery} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"><PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" />Create New Delivery</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DeliverySummaryCard title="Total Orders" value={totalDeliveries} icon={ArchiveBoxIcon} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <DeliverySummaryCard title="In Progress" value={inProgress} icon={ClipboardDocumentListIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <DeliverySummaryCard title="Pending Assignment" value={pending} icon={ClockIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
        <DeliverySummaryCard title="Completed" value={delivered} icon={ClipboardDocumentCheckIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative md:col-span-2 lg:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Search by tracking #, rider, address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm" />
          </div>
          <div>
            <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm">
              <option value="All">All Statuses</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Table Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Order List ({isLoading ? '...' : deliveries.length})</h2>
        {isLoading ? (
          <div className="text-center p-16 bg-white rounded-xl shadow-md border"><ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-green-600" /><p className="mt-4 text-gray-600">Loading Deliveries...</p></div>
        ) : error ? (
          <div className="text-center p-16 bg-red-50 rounded-xl shadow-md border border-red-200"><p className="text-red-600 font-semibold">{error}</p><button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button></div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border"><p className="text-2xl text-gray-500 font-semibold">No deliveries match your criteria. 😥</p></div>
        ) : (
          <div className="overflow-x-auto relative shadow-lg sm:rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Tracking #</th><th scope="col" className="px-6 py-3">Status</th><th scope="col" className="px-6 py-3">Pickup Location</th><th scope="col" className="px-6 py-3">Delivery Location</th>
                  <th scope="col" className="px-6 py-3">Linked Orders</th>
                  <th scope="col" className="px-6 py-3">Assigned Rider</th><th scope="col" className="px-6 py-3">Fee</th><th scope="col" className="px-6 py-3">Scheduled</th><th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (<DeliveryRow key={delivery.id} delivery={delivery} onEdit={handleEditDelivery} onDelete={handleDeleteClick} ordersMap={ordersMap} />))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddEditDeliveryModal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} delivery={editingDelivery} riders={riders} orders={orders} onSave={handleSaveDelivery} isSubmitting={isSubmitting} />
      {deliveryToDelete && (<DeleteConfirmationModal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} onConfirm={confirmDelete} riderName={`Delivery ${deliveryToDelete.trackingNumber}`} isSubmitting={isSubmitting}/>)}
    </div>
  );
}
