// app/admin/[adminSlug]/deliveries/DeliveriesClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArchiveBoxIcon, // Total Deliveries
  ArrowPathIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon, // Assigned Rider
  MapPinIcon, // Location
  CalendarDaysIcon, // Date
  TagIcon, // Status
  BoltIcon, // Weight/Size
  ClipboardDocumentCheckIcon, // Successful
  ClipboardDocumentListIcon, // In Progress
  ClockIcon, // Pending
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

// Assuming RiderProfile is defined or imported from RidersClient.tsx
// For this client, we only need basic rider info
type RiderInfo = {
  id: string;
  name: string;
};

// --- Type Definitions for Delivery ---
export type Delivery = {
  id: string;
  trackingNumber: string;
  riderId: string | null; // Null if unassigned
  riderName: string | 'Unassigned';
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  weightKg: number;
  deliveryFee: number;
  createdAt: string;
  scheduledFor: string;
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
    status: 'In Progress',
    pickupAddress: '123 Tech Hub Ave, Kilimani',
    deliveryAddress: '45 Green St, Westlands',
    packageDescription: 'Electronics, high-value',
    weightKg: 2.5,
    deliveryFee: 500,
    createdAt: new Date('2024-10-01T10:00:00Z').toISOString(),
    scheduledFor: new Date('2024-10-02T14:00:00Z').toISOString(),
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
  },
];

// --- Helper Functions and Components ---

// Basic Modal Component (copied from previous file)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition z-10"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
        {children}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const DeliverySummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-start text-left`}>
    <Icon className="h-8 w-8 mb-2 opacity-90" />
    <p className="text-sm font-light uppercase opacity-90">{title}</p>
    <p className="text-3xl font-extrabold mt-1">{value}</p>
  </div>
);

const getStatusStyles = (status: Delivery['status']) => {
  switch (status) {
    case 'Delivered':
      return { text: 'text-green-800', bg: 'bg-green-100', icon: ClipboardDocumentCheckIcon };
    case 'In Progress':
      return { text: 'text-blue-800', bg: 'bg-blue-100', icon: ClipboardDocumentListIcon };
    case 'Pending':
      return { text: 'text-yellow-800', bg: 'bg-yellow-100', icon: ClockIcon };
    case 'Cancelled':
      return { text: 'text-red-800', bg: 'bg-red-100', icon: ExclamationTriangleIcon };
    default:
      return { text: 'text-gray-800', bg: 'bg-gray-100', icon: TagIcon };
  }
};

// --- Add/Edit Delivery Modal Component ---
interface AddEditDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery | null;
  riders: RiderInfo[]; // List of available riders
  onSave: (deliveryData: Partial<Delivery>) => Promise<void>;
  isSubmitting: boolean;
}

const AddEditDeliveryModal: React.FC<AddEditDeliveryModalProps> = ({ isOpen, onClose, delivery, riders, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Delivery>>({});

  useEffect(() => {
    if (delivery) {
      setFormData({
        ...delivery,
        // Convert ISO strings to local date/time for input fields
        scheduledFor: delivery.scheduledFor ? new Date(delivery.scheduledFor).toISOString().substring(0, 16) : '',
        // The riderName is derived, the input controls riderId
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
        scheduledFor: new Date(Date.now() + 3600000).toISOString().substring(0, 16), // Default to 1 hour from now
      });
    }
  }, [delivery, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'weightKg' || name === 'deliveryFee') ? parseFloat(value) : value,
    }));
  };

  const handleRiderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const riderId = e.target.value;
    const selectedRider = riders.find(r => r.id === riderId);

    setFormData((prev) => ({
      ...prev,
      riderId: riderId === '' ? null : riderId,
      riderName: selectedRider ? selectedRider.name : 'Unassigned',
      // If a rider is assigned, move status to 'In Progress' unless it was 'Delivered' or 'Cancelled'
      status: (riderId !== '' && prev.status === 'Pending') ? 'In Progress' : (prev.status || 'Pending'),
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.packageDescription) {
      toast.error("Please fill in all required address and description fields.");
      return;
    }

    const riderAssignment = riders.find(r => r.id === formData.riderId);
    
    // Final data structure for save
    const dataToSave: Partial<Delivery> = {
      ...formData,
      riderId: formData.riderId || null,
      riderName: riderAssignment ? riderAssignment.name : 'Unassigned',
      // Ensure date is converted back to ISO string for backend
      scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : new Date().toISOString(),
      createdAt: delivery ? delivery.createdAt : new Date().toISOString(),
    };

    await onSave(dataToSave);
  };

  const isEdit = !!delivery;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {isEdit ? "Edit Delivery Details" : "Create New Delivery"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tracking Number (Read-only on edit) */}
            <div className="md:col-span-2">
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                value={formData.trackingNumber || ''}
                readOnly
                className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 font-mono text-lg cursor-not-allowed"
              />
            </div>
            
            {/* Pickup Address */}
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress || ""}
                  onChange={handleChange}
                  placeholder="e.g., 100 Industrial Area"
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress || ""}
                  onChange={handleChange}
                  placeholder="e.g., 25 Residential Estate"
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Scheduled For Date/Time */}
            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  id="scheduledFor"
                  name="scheduledFor"
                  // Value must be in the format "YYYY-MM-DDThh:mm" for the control
                  value={formData.scheduledFor ? formData.scheduledFor.substring(0, 16) : ''}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Rider Assignment */}
            <div>
              <label htmlFor="riderId" className="block text-sm font-medium text-gray-700 mb-1">Assign Rider</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TruckIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="riderId"
                  name="riderId"
                  value={formData.riderId || ''}
                  onChange={handleRiderChange}
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Select Rider (Unassigned) --</option>
                  {riders.map(rider => (
                    <option key={rider.id} value={rider.id}>{rider.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BoltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="weightKg"
                  name="weightKg"
                  value={formData.weightKg || 0}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 5.5"
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Delivery Fee */}
            <div>
              <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">Ksh</span>
                </div>
                <input
                  type="number"
                  id="deliveryFee"
                  name="deliveryFee"
                  value={formData.deliveryFee || 0}
                  onChange={handleChange}
                  min="0"
                  step="50"
                  placeholder="e.g., 400"
                  className="w-full p-3 pl-14 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Status */}
            <div className='md:col-span-2'>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'Pending'}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Package Description */}
            <div className="md:col-span-2">
              <label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
              <div className="relative">
                <textarea
                  id="packageDescription"
                  name="packageDescription"
                  value={formData.packageDescription || ""}
                  onChange={handleChange}
                  placeholder="e.g., Documents for signing, fragile electronics, bulk food supplies."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
            </div>

          </div> {/* End of Grid */}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Delivery")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


// --- Delivery Row Component ---
interface DeliveryRowProps {
  delivery: Delivery;
  onEdit: (delivery: Delivery) => void;
  onDelete: (delivery: Delivery) => void;
}

const DeliveryRow: React.FC<DeliveryRowProps> = ({ delivery, onEdit, onDelete }) => {
  const { text: statusTextClass, bg: statusBgClass, icon: StatusIcon } = getStatusStyles(delivery.status);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
        {delivery.trackingNumber}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${statusTextClass}`} />
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBgClass} ${statusTextClass}`}>
            {delivery.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={delivery.pickupAddress}>
        <span className="font-medium text-gray-900">P/U:</span> {delivery.pickupAddress}
      </td>
      <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={delivery.deliveryAddress}>
        <span className="font-medium text-gray-900">D/O:</span> {delivery.deliveryAddress}
      </td>
      <td className="px-6 py-4 text-gray-700">
        <div className="flex items-center space-x-1">
          <TruckIcon className="h-4 w-4 text-indigo-500" />
          <span className={delivery.riderId ? "font-medium text-indigo-700" : "text-gray-500 italic"}>
            {delivery.riderName}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700">
        <span className="font-semibold text-sm">Ksh {delivery.deliveryFee.toLocaleString()}</span>
      </td>
      <td className="px-6 py-4 text-gray-700 text-sm">
        {formatDateTime(delivery.scheduledFor)}
      </td>
      <td className="px-6 py-4 space-x-3 whitespace-nowrap">
        <button
          onClick={() => onEdit(delivery)}
          className="text-indigo-600 hover:text-indigo-900 transition-colors"
          title="Edit Delivery"
        >
          <PencilSquareIcon className="h-5 w-5 inline" />
        </button>
        <button
          onClick={() => onDelete(delivery)}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Delete Delivery"
        >
          <TrashIcon className="h-5 w-5 inline" />
        </button>
      </td>
    </tr>
  );
};


// --- Main DeliveriesPage Component ---
interface DeliveriesPageProps {
  params: {
    companyId: string;
  };
}

export default function DeliveriesPage({ params }: DeliveriesPageProps) {
  const { companyId } = params;
  const [deliveries, setDeliveries] = useState<Delivery[]>(generateSampleDeliveries());
  const [riders, setRiders] = useState<RiderInfo[]>(DUMMY_RIDERS); // Hardcoded for this file, would be fetched in a real app
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);

  // In a real app, you would use useEffect to fetch riders and deliveries
  // useEffect(() => { fetchRiders(); fetchDeliveries(); }, []); 

  // --- Handlers for Modals ---
  const handleAddDelivery = () => {
    setEditingDelivery(null);
    setShowAddEditModal(true);
  };

  const handleEditDelivery = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowAddEditModal(true);
  };

  const handleSaveDelivery = async (formData: Partial<Delivery>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingDelivery ? 'Updating delivery...' : 'Creating delivery...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (editingDelivery) {
        // Update existing delivery
        setDeliveries(prevDeliveries => prevDeliveries.map(delivery =>
          delivery.id === editingDelivery.id ? { ...delivery, ...formData } as Delivery : delivery
        ));
        toast.success('Delivery updated successfully!', { id: toastId });
      } else {
        // Create new delivery
        const newDelivery: Delivery = {
          id: `DEL${Date.now()}`,
          trackingNumber: formData.trackingNumber || `TN-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          ...formData,
        } as Delivery;
        setDeliveries(prevDeliveries => [newDelivery, ...prevDeliveries]);
        toast.success('New delivery created successfully!', { id: toastId });
      }
      setShowAddEditModal(false);
    } catch (error: any) {
      console.error("Error saving delivery:", error);
      toast.error(error.message || `Failed to ${editingDelivery ? 'update' : 'create'} delivery.`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (delivery: Delivery) => {
    setDeliveryToDelete(delivery);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deliveryToDelete) return;

    setIsSubmitting(true);
    setShowDeleteConfirmModal(false);
    const deleteToastId = toast.loading(`Deleting delivery ${deliveryToDelete.trackingNumber}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeliveries(prev => prev.filter(d => d.id !== deliveryToDelete.id));
      toast.success(`Delivery ${deliveryToDelete.trackingNumber} deleted successfully!`, { id: deleteToastId });
      setDeliveryToDelete(null);
    } catch (err: any) {
      console.error("Error deleting delivery:", err);
      toast.error(err.message || "Failed to delete delivery.", { id: deleteToastId });
      setError(err.message || "Failed to delete delivery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = delivery.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.packageDescription.toLowerCase().includes(searchTerm.toLowerCase());
                            
      const matchesStatus = filterStatus === 'All' || delivery.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchTerm, filterStatus]);

  // Summary calculations
  const totalDeliveries = deliveries.length;
  const inProgress = deliveries.filter(d => d.status === 'In Progress').length;
  const delivered = deliveries.filter(d => d.status === 'Delivered').length;
  const pending = deliveries.filter(d => d.status === 'Pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Deliveries Management <span className="ml-2 text-green-600 text-base sm:text-xl">📦</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Track all incoming, in-progress, and completed delivery orders.
          </p>
        </div>
        <button
          onClick={handleAddDelivery}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Create New Delivery
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DeliverySummaryCard title="Total Orders" value={totalDeliveries} icon={ArchiveBoxIcon} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <DeliverySummaryCard title="In Progress" value={inProgress} icon={ClipboardDocumentListIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <DeliverySummaryCard title="Pending Assignment" value={pending} icon={ClockIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
        <DeliverySummaryCard title="Delivered Today" value={delivered} icon={ClipboardDocumentCheckIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
      </div>

      {/* Loading and Error Indicators (Removed for brevity, assuming standard implementation) */}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by tracking number, rider, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {/* Future: Add filter for Rider */}
        </div>
      </div>

      {/* Deliveries Table */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Order List ({filteredDeliveries.length})</h2>
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
            <p className="text-2xl text-gray-500 font-semibold">No deliveries match your criteria. 😥</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative shadow-lg sm:rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Tracking #</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Pickup Location</th>
                  <th scope="col" className="px-6 py-3">Delivery Location</th>
                  <th scope="col" className="px-6 py-3">Assigned Rider</th>
                  <th scope="col" className="px-6 py-3">Fee</th>
                  <th scope="col" className="px-6 py-3">Scheduled</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <DeliveryRow
                    key={delivery.id}
                    delivery={delivery}
                    onEdit={handleEditDelivery}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add/Edit Delivery Modal */}
      <AddEditDeliveryModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        delivery={editingDelivery}
        riders={riders} // Pass the list of riders
        onSave={handleSaveDelivery}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {deliveryToDelete && (
        <DeleteConfirmationModal 
          isOpen={showDeleteConfirmModal} 
          onClose={() => setShowDeleteConfirmModal(false)} 
          onConfirm={confirmDelete}
          // Reusing the DeleteConfirmationModal structure from RidersClient
          riderName={`Delivery ${deliveryToDelete.trackingNumber}`} 
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

// Re-using the DeleteConfirmationModal from the previous file with a slight adjustment
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  riderName: string; // Used generically for the item's name/ID
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, riderName: itemName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-600 mb-7">
        Are you sure you want to delete <span className="font-bold text-red-600">"{itemName}"</span>?
        This action is irreversible and will permanently remove this delivery record.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}
          {isSubmitting ? "Deleting..." : "Delete Order"}
        </button>
      </div>
    </div>
  </Modal>
);