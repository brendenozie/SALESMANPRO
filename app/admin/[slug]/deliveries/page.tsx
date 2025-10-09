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
  UserCircleIcon,
  CurrencyDollarIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';

// Using the provided environment variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Type Definitions (Refined for Clarity and Schema Alignment) ---
type RiderInfo = {
  id: string;
  name: string;
};

// **UPDATED:** This type now reflects the structure of the ENRICHED OrderItem received from the API
export type Order = {
  id: string; // OrderItem ID (used for linking to Delivery)
  orderId: string; // Parent CustomerOrder ID
  quantity: number;
  price: number; // Price of this single item (line item price)
  
  // Data inferred/mapped for component consistency
  totalFinalPrice: number; // Mapped from price * quantity for summary
  
  marketplaceListing: {
    id: string;
    name: string; // Product name
    contactName: string; // Seller/Pickup Contact Name
    locationName: string; // Pickup location name (e.g., coordinates, store name)
    // Add other fields from the listing needed for description/weight
    weight?: string[]; // e.g., ["Heavy"]
    description?: string;
  };
  
  order: { // Parent Order Details (minimal structure confirmed by API)
    id: string; // CustomerOrder ID
    status: string;
    createdAt: string;
    // NOTE: Delivery/Consumer details are missing from this sample Order payload, 
    // so we assume it needs to be fetched separately or is part of a different order API.
  } | null;

  // Keeping these fields as placeholders for potential customer delivery details 
  // that a full CustomerOrder API would provide, but defaulting them as missing for now.
  consumer?: { name?: string; email?: string; phone?: string; address?: string; } | null;
  shippingAddress?: any; 
  pickupAddress?: string | null; // Will be mapped from marketplaceListing.locationName
  deliveryAddress?: string | null; // Still needs the customer's final delivery address
  createdAt?: string;
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
  orderIds?: string[];
  orders?: Order[];
  packageWeightKg?: number; 
  packageValue?: number;
  customerName?: string;
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
    orderIds: ['68e4ac06f3379a2ff961e9be'], // Using the sample ID here
    customerName: 'Sample Customer',
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
    orderIds: [],
    customerName: 'Sample Customer 2',
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
    customerName: 'Sample Customer 3',
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
    orderIds: [],
    customerName: 'Sample Customer 4',
  },
];


// --- Helper & Reusable Components (Design Update) ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  // Updated backdrop and modal size/style for visual appeal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-4xl border border-indigo-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 transition z-10 p-2 rounded-full hover:bg-gray-100" aria-label="Close modal"><XMarkIcon className="h-7 w-7" /></button>
        {children}
      </div>
    </div>
  );
};

interface SummaryCardProps { title: string; value: string | number; icon: React.ElementType; colorClass: string; }
// Updated Summary Card design
const DeliverySummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-xl border border-gray-100 transition-all duration-300 transform hover:scale-[1.02] ${colorClass} text-white flex flex-col items-start text-left relative overflow-hidden`}>
    <div className="absolute top-0 right-0 p-3 opacity-20"><Icon className="h-16 w-16" /></div>
    <p className="text-sm font-light uppercase tracking-wider opacity-90">{title}</p>
    <p className="text-4xl font-extrabold mt-1 leading-none">{value}</p>
    <Icon className="h-6 w-6 mt-3 opacity-90" />
  </div>
);

const getStatusStyles = (status: Delivery['status']) => {
  switch (status) {
    case 'Delivered': return { text: 'text-green-700', bg: 'bg-green-100', icon: ClipboardDocumentCheckIcon, dot: 'bg-green-500' };
    case 'InProgress': return { text: 'text-blue-700', bg: 'bg-blue-100', icon: ClipboardDocumentListIcon, dot: 'bg-blue-500' };
    case 'Pending': return { text: 'text-yellow-700', bg: 'bg-yellow-100', icon: ClockIcon, dot: 'bg-yellow-500' };
    case 'Cancelled': return { text: 'text-red-700', bg: 'bg-red-100', icon: ExclamationTriangleIcon, dot: 'bg-red-500' };
    default: return { text: 'text-gray-700', bg: 'bg-gray-100', icon: TagIcon, dot: 'bg-gray-500' };
  }
};

// --- Add/Edit Delivery Modal Component (UPDATED for better structure/design) ---
interface AddEditDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery?: Delivery | null;
  riders: RiderInfo[];
  orders: Order[]; // pass available Order Items here
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
        packageWeightKg: delivery.weightKg, 
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
        packageWeightKg: 1.0,
        packageValue: 0,
        customerName: '',
      });
    }
  }, [delivery, isOpen]);

  /**
   * **UPDATED LOGIC:** Aggregates details from selected Order Items (the new Order type).
   * It uses marketplaceListing details for pickup info and sums up item prices for value.
   */
  const buildAggregateFromOrders = (selectedOrderIds: string[] | undefined) => {
    if (!selectedOrderIds || selectedOrderIds.length === 0) return {};
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    if (selectedOrders.length === 0) return {};

    // Use the first selected order item's details as the primary source for addresses/contact
    const primary = selectedOrders[0];

    // Aggregate description from marketplaceListing names
    const itemTitles = selectedOrders.map(o => o.marketplaceListing.name).filter(Boolean);
    const uniqueTitles = Array.from(new Set(itemTitles)).slice(0, 6); // limit to avoid blowup
    const packageDescription = uniqueTitles.length > 0 
        ? `${uniqueTitles.join(', ')} (x${selectedOrders.length} items)` 
        : `Consolidated delivery of ${selectedOrders.length} items.`;

    // Sum up total value (using price from OrderItem as the line item price)
    const totalAmount = selectedOrders.reduce((acc, o) => acc + (o.price || 0), 0); 
    
    // Customer Name: Use the seller's contact name as the pickup contact
    const pickupContactName = primary.marketplaceListing.contactName || '';
    
    // Pickup Address: Use the marketplace listing location as the source
    const pickupAddress = primary.marketplaceListing.locationName || ''; 
    
    // Delivery Address: THIS IS THE MISSING PIECE from the provided Order Item payload.
    // We must assume the customer's actual delivery address is on the parent order object, 
    // which is not fully included here. We set a strong reminder.
    const deliveryAddress = primary.deliveryAddress || 'Customer Delivery Address Not found on Order'; 

    // Heuristic for weight: Sum of item quantities * average weight
    const totalQuantity = selectedOrders.reduce((acc, o) => acc + (o.quantity || 1), 0);
    // If the listing has a weight property (e.g., ["Heavy", "5kg"]), we'd parse it here.
    const estimatedWeight = totalQuantity * 1.5; // Defaulting to 1.5kg per item quantity

    return {
      customerName: pickupContactName, // Using the pickup contact name here, or a separate Customer Name if available
      pickupAddress,
      deliveryAddress,
      packageDescription,
      deliveryFeeHint: totalAmount > 0 ? Math.round(totalAmount * 0.05) : undefined, // example: 5% of total as suggestion
      packageValueHint: totalAmount, // Total value of the orders
      weightKgHint: estimatedWeight,
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Map packageWeightKg back to weightKg for backward compatibility with the Delivery type
    const fieldName = name === 'packageWeightKg' ? 'weightKg' : name; 

    setFormData((prev) => ({ 
      ...prev, 
      [fieldName]: (name === 'weightKg' || name === 'deliveryFee' || name === 'packageValue' || name === 'packageWeightKg') ? parseFloat(value) : value 
    }));
  };

  const handleRiderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const riderId = e.target.value;
    const selectedRider = riders.find(r => r.id === riderId);
    setFormData((prev) => ({ 
      ...prev, 
      riderId: riderId === '' ? null : riderId, 
      riderName: selectedRider ? selectedRider.name : 'Unassigned', 
      status: (riderId !== '' && prev.status === 'Pending') ? 'InProgress' : (prev.status || 'Pending'), 
    }));
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
        // Only auto-populate if the field is empty or if the calculated value is strongly suggested (e.g., Delivery Address)
        customerName: (prev.customerName && prev.customerName !== '') ? prev.customerName : (aggregated.customerName || prev.customerName),
        pickupAddress: (prev.pickupAddress && prev.pickupAddress !== '') ? prev.pickupAddress : (aggregated.pickupAddress || prev.pickupAddress),
        deliveryAddress: (prev.deliveryAddress && prev.deliveryAddress !== '') ? prev.deliveryAddress : (aggregated.deliveryAddress || prev.deliveryAddress),
        packageDescription: (prev.packageDescription && prev.packageDescription !== '') ? prev.packageDescription : (aggregated.packageDescription || prev.packageDescription),
        deliveryFee: prev.deliveryFee && prev.deliveryFee > 0 ? prev.deliveryFee : (aggregated.deliveryFeeHint || prev.deliveryFee),
        packageValue: prev.packageValue && prev.packageValue > 0 ? prev.packageValue : (aggregated.packageValueHint || prev.packageValue),
        weightKg: prev.weightKg && prev.weightKg > 0 ? prev.weightKg : (aggregated.weightKgHint || prev.weightKg),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.packageDescription) {
      toast.error("Please fill in all required address and description fields.");
      return;
    }
    // Added a check for the missing address placeholder
    if (formData.deliveryAddress === 'Customer Delivery Address Not found on Order') {
        toast.error("The linked order is missing the customer's delivery address. Please enter it manually.", { duration: 5000 });
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
      weightKg: formData.weightKg,
      packageValue: formData.packageValue,
      customerName: formData.customerName,
    };
    await onSave(dataToSave);
  };

  const isEdit = !!delivery;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-2xl w-full max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">{isEdit ? "Edit Delivery" : "Create New Delivery"}</h2>
        <p className="text-gray-500 mb-8">{isEdit ? `Tracking: ${delivery?.trackingNumber}` : "Quickly dispatch a new delivery or link existing customer orders."}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Order Linking & Tracking */}
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
            <h3 className="flex items-center text-xl font-semibold text-indigo-700 mb-4 border-b border-indigo-300 pb-2"><QueueListIcon className="h-6 w-6 mr-2" /> Order & Tracking Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input type="text" id="trackingNumber" name="trackingNumber" value={formData.trackingNumber || ''} readOnly className="w-full p-3 rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-800 font-mono text-lg cursor-not-allowed font-bold" />
              </div>
              
              {/* Link multiple orders - improved visual focus */}
              <div className="md:col-span-2">
                <label htmlFor="orderIds" className="block text-sm font-medium text-gray-700 mb-1">Link Customer Orders (Select Order Items)</label>
                <div className="relative">
                  <select id="orderIds" name="orderIds" value={formData.orderIds || []} onChange={handleOrderSelection} multiple size={5} className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out hover:border-indigo-400">
                    {orders.length === 0 ? (
                      <option disabled className="text-gray-400">No available order items to link</option>
                    ) : (
                      orders.map(o => {
                        // Use marketplaceListing name and price for better context in the selector
                        const label = `#${o.orderId.substring(18)} — ${o.marketplaceListing.name} (${o.quantity}x) — Ksh ${o.price?.toLocaleString() || 'N/A'}`;
                        return <option key={o.id} value={o.id}>{label}</option>;
                      })
                    )}
                  </select>
                  <p className="text-xs mt-2 text-indigo-600 font-medium">Hold CTRL/CMD to select multiple order items. Details will auto-populate.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Details and Assignment */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2"><PencilSquareIcon className="h-6 w-6 mr-2" /> Delivery Specifics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Customer Name / Recipient */}
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Customer / Recipient Name</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserCircleIcon className="h-5 w-5 text-gray-400" /></div><input type="text" id="customerName" name="customerName" value={formData.customerName || ""} onChange={handleChange} placeholder="e.g., Jane Doe" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>
              
              {/* Rider Assignment */}
              <div>
                <label htmlFor="riderId" className="block text-sm font-medium text-gray-700 mb-1">Assign Rider</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TruckIcon className="h-5 w-5 text-gray-400" /></div>
                  <select id="riderId" name="riderId" value={formData.riderId || ''} onChange={handleRiderChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">-- Select Rider (Unassigned) --</option>
                    {riders.map(rider => (<option key={rider.id} value={rider.id}>{rider.name}</option>))}
                  </select>
                </div>
              </div>

              {/* Pickup Address - Now automatically populated from marketplaceListing */}
              <div className="md:col-span-1">
                <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-1">Pickup Address (Seller Location) *</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPinIcon className="h-5 w-5 text-green-500" /></div><input type="text" id="pickupAddress" name="pickupAddress" value={formData.pickupAddress || ""} onChange={handleChange} placeholder="e.g., Seller's Store Location" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
                {formData.orderIds && formData.orderIds.length > 0 && <p className="text-xs text-green-600 mt-1">Auto-filled from **{formData.customerName || 'Seller Contact'}** listing location.</p>}
              </div>
              
              {/* Delivery Address - WARNING for missing data */}
              <div className="md:col-span-1">
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">Delivery Address (Customer Final Location) *</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPinIcon className="h-5 w-5 text-red-500" /></div>
                <input 
                    type="text" 
                    id="deliveryAddress" 
                    name="deliveryAddress" 
                    value={formData.deliveryAddress || ""} 
                    onChange={handleChange} 
                    placeholder="Enter Customer Address (Required)" 
                    className={`w-full p-3 pl-10 rounded-lg bg-gray-50 border ${formData.deliveryAddress === 'Customer Delivery Address Not found on Order' ? 'border-red-500 ring-red-500' : 'border-gray-300'} text-gray-900 focus:ring-indigo-500 focus:border-indigo-500`} 
                    required 
                />
                </div>
                {formData.deliveryAddress === 'Customer Delivery Address Not found on Order' && (
                    <p className="text-xs mt-1 font-semibold text-red-600 flex items-center"><ExclamationTriangleIcon className='h-4 w-4 mr-1'/> Customer delivery address is missing from the linked order data. Please correct.</p>
                )}
              </div>
              
              {/* Scheduled For */}
              <div>
                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date/Time</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDaysIcon className="h-5 w-5 text-gray-400" /></div><input type="datetime-local" id="scheduledFor" name="scheduledFor" value={formData.scheduledFor ? formData.scheduledFor.substring(0, 16) : ''} onChange={handleChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>

              {/* Delivery Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-5 w-5 text-gray-400" /></div>
                  <select id="status" name="status" value={formData.status || 'Pending'} onChange={handleChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Package Description (Full Width) */}
            <div className="mt-5"><label htmlFor="packageDescription" className="block text-sm font-medium text-gray-700 mb-1">Package Description *</label><div className="relative"><textarea id="packageDescription" name="packageDescription" value={formData.packageDescription || ""} onChange={handleChange} placeholder="e.g., Documents for signing, fragile electronics, bulk food supplies. Automatically populated from linked orders." rows={3} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required></textarea></div></div>
          </div>
          
          {/* Section 3: Financials and Weight */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2"><CurrencyDollarIcon className="h-6 w-6 mr-2" /> Financial & Physical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Delivery Fee */}
              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (Ksh)</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold">Ksh</span></div><input type="number" id="deliveryFee" name="deliveryFee" value={formData.deliveryFee || 0} onChange={handleChange} min="0" step="50" placeholder="e.g., 400" className="w-full p-3 pl-14 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>

              {/* Weight (kg) */}
              <div>
                <label htmlFor="packageWeightKg" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) (Auto-calculated)</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BoltIcon className="h-5 w-5 text-gray-400" /></div><input type="number" id="packageWeightKg" name="packageWeightKg" value={formData.weightKg || 0} onChange={handleChange} min="0.1" step="0.1" placeholder="e.g., 5.5" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>

              {/* Package Value - Now sums up linked order item prices */}
              <div>
                <label htmlFor="packageValue" className="block text-sm font-medium text-gray-700 mb-1">Total Package Value (Ksh)</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CurrencyDollarIcon className="h-5 w-5 text-gray-400" /></div><input type="number" id="packageValue" name="packageValue" value={formData.packageValue || 0} onChange={handleChange} min="0" step="100" placeholder="e.g., 12000" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>

            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]" disabled={isSubmitting}>
              {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Delivery")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// --- Delivery Row & Delete Modal (Design Update) ---
interface DeliveryRowProps { delivery: Delivery; onEdit: (delivery: Delivery) => void; onDelete: (delivery: Delivery) => void; ordersMap?: Record<string, Order>; }
const DeliveryRow: React.FC<DeliveryRowProps> = ({ delivery, onEdit, onDelete, ordersMap = {} }) => {
  const { text: statusTextClass, bg: statusBgClass, icon: StatusIcon, dot: statusDotClass } = getStatusStyles(delivery.status);
  const formatDateTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Visually separating addresses
  const PickupAddress = ({ address }: { address: string }) => (
    <div className="flex items-center text-sm"><MapPinIcon className="h-4 w-4 text-green-500 flex-shrink-0 mr-1.5" /><span className="font-medium text-gray-800 truncate" title={address}>Pickup: {address}</span></div>
  );
  const DeliveryAddress = ({ address }: { address: string }) => (
    <div className="flex items-center text-sm"><MapPinIcon className="h-4 w-4 text-red-500 flex-shrink-0 mr-1.5" /><span className="text-gray-600 truncate" title={address}>Dropoff: {address}</span></div>
  );

  return (
    <tr className="bg-white border-b hover:bg-indigo-50 transition-colors">
      <td className="px-6 py-4 font-semibold text-indigo-700 whitespace-nowrap text-base">{delivery.trackingNumber}</td>
      
      {/* Status */}
      <td className="px-6 py-4">
        <div className={`flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-full ${statusBgClass} ${statusTextClass} border border-opacity-50`}><span className={`h-2.5 w-2.5 rounded-full ${statusDotClass} mr-1`}></span><span>{delivery.status}</span></div>
      </td>
      
      {/* Locations - Combined into one cell for space-saving on larger screens */}
      <td className="px-6 py-4 text-gray-700 max-w-xs xl:max-w-md">
        <div className="space-y-1">
            <PickupAddress address={delivery.pickupAddress} />
            <DeliveryAddress address={delivery.deliveryAddress} />
        </div>
      </td>

      {/* Linked Orders column - visually distinct pills */}
      <td className="px-6 py-4 text-gray-700">
        {delivery.orderIds && delivery.orderIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-sm">
            {delivery.orderIds.slice(0, 2).map(oid => {
              const order = ordersMap[oid];
              const orderIdSnippet = order?.orderId ? order.orderId.substring(18) : '...';
              const productName = order?.marketplaceListing?.name || 'Item';
              return (
                <span key={oid} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-200 shadow-sm" title={`Order Item: ${productName}`}>
                  {orderIdSnippet} / {productName.split(' ')[0]}
                </span>
              );
            })}
            {delivery.orderIds.length > 2 && <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">+{delivery.orderIds.length - 2} More</span>}
          </div>
        ) : (
          <span className="text-gray-400 italic text-sm">No Linked Order</span>
        )}
      </td>

      {/* Rider & Fee & Scheduled - More condensed/stylized */}
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-1">
          <span className={delivery.riderId ? "font-medium text-indigo-700 flex items-center text-sm" : "text-gray-500 italic text-sm"}>
            <TruckIcon className="h-4 w-4 text-indigo-500 mr-1" />
            {delivery.riderName}
          </span>
          <span className="font-bold text-base text-green-600 flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
            Ksh {delivery.deliveryFee.toLocaleString()}
          </span>
        </div>
      </td>
      
      {/* Scheduled */}
      <td className="px-6 py-4 text-gray-600 text-sm">
        <div className="flex items-center">
          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
          {formatDateTime(delivery.scheduledFor)}
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-6 py-4 space-x-3 whitespace-nowrap">
        <button onClick={() => onEdit(delivery)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-full hover:bg-indigo-100" title="Edit Delivery"><PencilSquareIcon className="h-5 w-5 inline" /></button>
        <button onClick={() => onDelete(delivery)} className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-100" title="Delete Delivery"><TrashIcon className="h-5 w-5 inline" /></button>
      </td>
    </tr>
  );
};

interface DeleteConfirmationModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string; isSubmitting: boolean; }
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName, isSubmitting }) => (
  // Use the standard modal but with a red theme
  <Modal isOpen={isOpen} onClose={onClose}><div className="bg-white rounded-xl shadow-2xl p-10 max-w-md mx-auto text-center border border-red-200"><ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-bounce-once" /><h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2><p className="text-lg text-gray-600 mb-7">You are about to permanently delete <span className="font-extrabold text-red-600">"{itemName}"</span>. This action is irreversible.</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold" disabled={isSubmitting}>Cancel</button><button onClick={onConfirm} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>{isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}{isSubmitting ? "Deleting..." : "Delete Delivery"}</button></div></div></Modal>
);

// --- Main DeliveriesPage Component (with API Logic) ---
export default function DeliveriesPage() {
  const { slug : companyId } = useParams();

  // --- State Management ---
  const [deliveries, setDeliveries] = useState<Delivery[]>(generateSampleDeliveries()); // Using dummy data for initial load
  const [riders, setRiders] = useState<RiderInfo[]>(DUMMY_RIDERS);
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
        status: filterStatus === 'All' ? '' : filterStatus,
      }).toString();

      const riderParams = new URLSearchParams({ companyId: safeCompanyId }).toString();
      const ordersParams = new URLSearchParams({ companyId: safeCompanyId }).toString();

      // Fetch deliveries, riders and orders in parallel
      const [deliveriesRes, ridersRes, ordersRes] = await Promise.all([
        fetch(`${apiUrl}/admin/deliveries?${deliveryParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
        }),
        fetch(`${apiUrl}/admin/riders?${riderParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
        }),
        fetch(`${apiUrl}/admin/orders?${ordersParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
        }),
      ]);

      if (!deliveriesRes.ok) throw new Error('Failed to fetch deliveries.');
      if (!ridersRes.ok) throw new Error('Failed to fetch riders.');
      if (!ordersRes.ok) throw new Error('Failed to fetch orders.');

      const deliveriesData = await deliveriesRes.json();
      const ridersData = await ridersRes.json();
      const ordersData = await ordersRes.json();

      const fetchedDeliveries: Delivery[] = deliveriesData.data || generateSampleDeliveries();
      const fetchedRiders: RiderInfo[] = ridersData.data || DUMMY_RIDERS;
      
      // **UPDATED LOGIC:** Parsing the response to map OrderItem fields to the component's Order type
      const json: { orderItems: Order[] } = ordersData.data || {};
      let fetchedOrderItems: Order[] = json.orderItems || [];
      
      const mappedOrders: Order[] = [];
      const map: Record<string, Order> = {};
      
      fetchedOrderItems.forEach(o => { 
        // Create a mapped object to ensure all fields expected by the component are present
        const mappedOrder: Order = {
            ...o,
            // Calculate total value for consistency
            totalFinalPrice: o.price * (o.quantity || 1), 
            // Infer pickup address/contact from marketplaceListing (Seller)
            pickupAddress: o.marketplaceListing?.locationName || 'Pickup Location Unavailable',
            // Delivery address remains the critical missing piece from this specific OrderItem payload
            deliveryAddress: 'Customer Delivery Address Not found on Order', 
            consumer: { // Use seller contact info as a proxy for 'contact' on the order side
                name: o.marketplaceListing?.contactName || 'Seller Contact Unavailable',
            },
        };
        mappedOrders.push(mappedOrder);
        if (mappedOrder.id) map[mappedOrder.id] = mappedOrder; 
      });

      setDeliveries(fetchedDeliveries);
      setRiders(fetchedRiders);
      setOrders(mappedOrders); // Set the mapped data for the modal
      setOrdersMap(map); // Set the map for the table
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error('Could not fetch data. Please try again.');
      setDeliveries(generateSampleDeliveries()); // Fallback to dummy data on error
    } finally {
      setIsLoading(false);
    }
  }, [companyId, debouncedSearchTerm, filterStatus]);

  // Trigger fetch on initial load and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD Handlers (Unchanged) ---
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

      const safeCompanyId = Array.isArray(companyId) ? companyId[0] : (companyId ?? '');

      const body = {
        ...formData,
        orderIds: formData.orderIds || [],
        companyId: safeCompanyId,
        packageWeightKg: formData.weightKg, 
        packageDescription: formData.packageDescription,
        packageValue: formData.packageValue,
        customerName: formData.customerName,
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

  // Updated filter options to match DeliveryStatus enum and filter state logic
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4 border-indigo-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 tracking-tight">Delivery Hub 🚚</h1>
          <p className="text-md text-gray-600 mt-1">Efficiently track and manage all logistics operations.</p>
        </div>
        <button onClick={handleAddDelivery} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-100"><PlusCircleIcon className="-ml-1 mr-3 h-6 w-6" />Create New Delivery</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DeliverySummaryCard title="Total Deliveries" value={totalDeliveries} icon={ArchiveBoxIcon} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <DeliverySummaryCard title="In Progress" value={inProgress} icon={ClipboardDocumentListIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <DeliverySummaryCard title="Pending Assignment" value={pending} icon={ClockIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
        <DeliverySummaryCard title="Completed" value={delivered} icon={ClipboardDocumentCheckIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input type="text" placeholder="Search by tracking #, rider, or address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition">
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Table Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center">
            <TruckIcon className="h-6 w-6 mr-2 text-indigo-600" /> Delivery List ({isLoading ? '...' : deliveries.length})
        </h2>
        {isLoading ? (
          <div className="text-center p-16 bg-white rounded-xl shadow-md border"><ArrowPathIcon className="h-10 w-10 mx-auto animate-spin text-indigo-600" /><p className="mt-4 text-gray-600 font-medium">Loading Deliveries...</p></div>
        ) : error ? (
          <div className="text-center p-16 bg-red-50 rounded-xl shadow-md border border-red-300"><p className="text-xl text-red-600 font-semibold">{error}</p><button onClick={fetchData} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md">Try Reloading Data</button></div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border"><p className="text-2xl text-gray-500 font-semibold flex items-center justify-center">No deliveries match your criteria. <span className="ml-2 text-3xl">😢</span></p></div>
        ) : (
          <div className="overflow-x-auto relative shadow-xl sm:rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Tracking #</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 w-1/4">Locations</th> {/* Increased width for addresses */}
                  <th scope="col" className="px-6 py-3 w-1/5">Linked Items</th> {/* Updated label */}
                  <th scope="col" className="px-6 py-3">Rider & Fee</th>
                  <th scope="col" className="px-6 py-3">Scheduled</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map((delivery) => (<DeliveryRow key={delivery.id} delivery={delivery} onEdit={handleEditDelivery} onDelete={handleDeleteClick} ordersMap={ordersMap} />))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AddEditDeliveryModal isOpen={showAddEditModal} onClose={() => setShowAddEditModal(false)} delivery={editingDelivery} riders={riders} orders={orders} onSave={handleSaveDelivery} isSubmitting={isSubmitting} />
      {deliveryToDelete && (<DeleteConfirmationModal isOpen={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} onConfirm={confirmDelete} itemName={`Delivery ${deliveryToDelete.trackingNumber}`} isSubmitting={isSubmitting}/>)}
    </div>
  );
}