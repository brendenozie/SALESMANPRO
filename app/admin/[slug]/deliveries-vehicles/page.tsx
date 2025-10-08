// app/admin/[adminSlug]/vehicles/VehicleClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TruckIcon,        // Total Vehicles
  TruckIcon as VehicleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon, // Maintenance
  ArrowPathIcon,
  ClockIcon, // Status: Retired
  MapPinIcon, // Plate Number
  CalendarDaysIcon, // Date
  TagIcon, // Make/Model
  UserCircleIcon, // Rider
  CircleStackIcon, // Mileage
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

// --- Type Definitions ---
type RiderInfo = {
  id: string;
  name: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string; // Unique identifier
  make: string; // e.g., Honda, Toyota
  model: string; // e.g., PCX, Probox
  type: 'Motorbike' | 'Car' | 'Van' | 'Bicycle' | 'Lorry';
  year: number;
  assignedRiderId: string | null;
  assignedRiderName: string | 'Unassigned';
  status: 'Active' | 'Maintenance' | 'Retired';
  mileageKm: number;
  lastServiceDate: string; // ISO date string
};

// --- Dummy Data ---

const DUMMY_RIDERS: RiderInfo[] = [
  { id: 'RDR001', name: 'Aisha Hassan' },
  { id: 'RDR002', name: 'David Kimani' },
  { id: 'RDR003', name: 'Grace Wanjiku' },
];

const generateSampleVehicles = (): Vehicle[] => [
  {
    id: 'VHC001',
    plateNumber: 'KCB 101X',
    make: 'Honda',
    model: 'PCX 150',
    type: 'Motorbike',
    year: 2023,
    assignedRiderId: 'RDR001',
    assignedRiderName: 'Aisha Hassan',
    status: 'Active',
    mileageKm: 15400,
    lastServiceDate: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'VHC002',
    plateNumber: 'KDE 505Y',
    make: 'Toyota',
    model: 'Probox',
    type: 'Car',
    year: 2018,
    assignedRiderId: 'RDR002',
    assignedRiderName: 'David Kimani',
    status: 'Maintenance',
    mileageKm: 87900,
    lastServiceDate: new Date('2024-08-15').toISOString(),
  },
  {
    id: 'VHC003',
    plateNumber: 'KAA 003Z',
    make: 'Isuzu',
    model: 'FVR',
    type: 'Lorry',
    year: 2015,
    assignedRiderId: null,
    assignedRiderName: 'Unassigned',
    status: 'Active',
    mileageKm: 155000,
    lastServiceDate: new Date('2024-07-20').toISOString(),
  },
  {
    id: 'VHC004',
    plateNumber: 'KFA 777A',
    make: 'Raleigh',
    model: 'Mountain Bike',
    type: 'Bicycle',
    year: 2024,
    assignedRiderId: 'RDR003',
    assignedRiderName: 'Grace Wanjiku',
    status: 'Retired',
    mileageKm: 200,
    lastServiceDate: new Date('2024-01-01').toISOString(),
  },
];

// --- Helper Functions and Components ---

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
        className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-xl"
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

const VehicleSummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-start text-left`}>
    <Icon className="h-8 w-8 mb-2 opacity-90" />
    <p className="text-sm font-light uppercase opacity-90">{title}</p>
    <p className="text-3xl font-extrabold mt-1">{value}</p>
  </div>
);

const getStatusStyles = (status: Vehicle['status']) => {
  switch (status) {
    case 'Active':
      return { text: 'text-green-800', bg: 'bg-green-100', icon: CheckCircleIcon };
    case 'Maintenance':
      return { text: 'text-yellow-800', bg: 'bg-yellow-100', icon: WrenchScrewdriverIcon };
    case 'Retired':
      return { text: 'text-red-800', bg: 'bg-red-100', icon: ClockIcon };
    default:
      return { text: 'text-gray-800', bg: 'bg-gray-100', icon: TagIcon };
  }
};

// --- Add/Edit Vehicle Modal Component ---
interface AddEditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  riders: RiderInfo[]; // List of available riders
  onSave: (vehicleData: Partial<Vehicle>) => Promise<void>;
  isSubmitting: boolean;
}

const AddEditVehicleModal: React.FC<AddEditVehicleModalProps> = ({ isOpen, onClose, vehicle, riders, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.substring(0, 10) : '',
        assignedRiderId: vehicle.assignedRiderId || '',
      });
    } else {
      setFormData({
        plateNumber: '',
        make: '',
        model: '',
        type: 'Motorbike', // Default type
        year: new Date().getFullYear(),
        assignedRiderId: '',
        status: 'Active',
        mileageKm: 0,
        lastServiceDate: new Date().toISOString().substring(0, 10),
      });
    }
  }, [vehicle, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === 'year' || name === 'mileageKm') ? parseInt(value) || 0 : value,
    }));
  };

  const handleRiderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const riderId = e.target.value;
    const selectedRider = riders.find(r => r.id === riderId);

    setFormData((prev) => ({
      ...prev,
      assignedRiderId: riderId === '' ? null : riderId,
      assignedRiderName: selectedRider ? selectedRider.name : 'Unassigned',
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.make || !formData.model) {
      toast.error("Please fill in plate number, make, and model.");
      return;
    }

    const riderAssignment = riders.find(r => r.id === formData.assignedRiderId);
    
    // Final data structure for save
    const dataToSave: Partial<Vehicle> = {
      ...formData,
      assignedRiderId: formData.assignedRiderId || null,
      assignedRiderName: riderAssignment ? riderAssignment.name : 'Unassigned',
      // Ensure date is converted back to ISO string for backend
      lastServiceDate: formData.lastServiceDate ? new Date(formData.lastServiceDate).toISOString() : new Date().toISOString(),
    };

    await onSave(dataToSave);
  };

  const isEdit = !!vehicle;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {isEdit ? "Edit Vehicle Details" : "Add New Vehicle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Plate Number */}
            <div className="md:col-span-2">
              <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="plateNumber"
                  name="plateNumber"
                  value={formData.plateNumber || ''}
                  onChange={handleChange}
                  placeholder="KCB 101X"
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 font-semibold focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make || ""}
                onChange={handleChange}
                placeholder="e.g., Toyota"
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model || ""}
                onChange={handleChange}
                placeholder="e.g., Probox"
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                id="type"
                name="type"
                value={formData.type || 'Motorbike'}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Motorbike">Motorbike 🏍️</option>
                <option value="Car">Car 🚗</option>
                <option value="Van">Van 🚐</option>
                <option value="Lorry">Lorry 🚚</option>
                <option value="Bicycle">Bicycle 🚲</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year || new Date().getFullYear()}
                onChange={handleChange}
                min="2000"
                max={new Date().getFullYear() + 1}
                placeholder="2024"
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Mileage */}
            <div>
              <label htmlFor="mileageKm" className="block text-sm font-medium text-gray-700 mb-1">Mileage (Km)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CircleStackIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="mileageKm"
                  name="mileageKm"
                  value={formData.mileageKm || 0}
                  onChange={handleChange}
                  min="0"
                  step="100"
                  placeholder="e.g., 50000"
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Last Service Date */}
            <div>
              <label htmlFor="lastServiceDate" className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
              <input
                type="date"
                id="lastServiceDate"
                name="lastServiceDate"
                value={formData.lastServiceDate || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Rider Assignment (Full width on small screens) */}
            <div className="md:col-span-2">
              <label htmlFor="assignedRiderId" className="block text-sm font-medium text-gray-700 mb-1">Assigned Rider</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="assignedRiderId"
                  name="assignedRiderId"
                  value={formData.assignedRiderId || ''}
                  onChange={handleRiderChange}
                  className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Unassigned --</option>
                  {riders.map(rider => (
                    <option key={rider.id} value={rider.id}>{rider.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'Active'}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div> 
          
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
              {isSubmitting ? "Saving..." : (isEdit ? "Save Changes" : "Add Vehicle")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


// --- Vehicle Row Component (for table) ---
interface VehicleRowProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle, onEdit, onDelete }) => {
  const { text: statusTextClass, bg: statusBgClass, icon: StatusIcon } = getStatusStyles(vehicle.status);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <tr className="bg-white border-b hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
        {vehicle.plateNumber}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-5 w-5 ${statusTextClass}`} />
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBgClass} ${statusTextClass}`}>
            {vehicle.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-700 font-medium">
        {vehicle.make} {vehicle.model}
      </td>
      <td className="px-6 py-4 text-gray-700">
        {vehicle.type}
      </td>
      <td className="px-6 py-4 text-gray-700">
        <span className={vehicle.assignedRiderId ? "font-medium text-indigo-700" : "text-gray-500 italic"}>
          {vehicle.assignedRiderName}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-700 text-sm">
        {vehicle.mileageKm.toLocaleString()} km
      </td>
      <td className="px-6 py-4 text-gray-700 text-sm">
        {formatDate(vehicle.lastServiceDate)}
      </td>
      <td className="px-6 py-4 space-x-3 whitespace-nowrap">
        <button
          onClick={() => onEdit(vehicle)}
          className="text-indigo-600 hover:text-indigo-900 transition-colors"
          title="Edit Vehicle"
        >
          <PencilSquareIcon className="h-5 w-5 inline" />
        </button>
        <button
          onClick={() => onDelete(vehicle)}
          className="text-red-600 hover:text-red-900 transition-colors"
          title="Delete Vehicle"
        >
          <TrashIcon className="h-5 w-5 inline" />
        </button>
      </td>
    </tr>
  );
};


// --- Main VehiclesPage Component ---
interface VehiclesPageProps {
  params: {
    companyId: string;
  };
}

export default function VehiclesPage({ params }: VehiclesPageProps) {
  const { companyId } = params;
  const [vehicles, setVehicles] = useState<Vehicle[]>(generateSampleVehicles());
  const [riders, setRiders] = useState<RiderInfo[]>(DUMMY_RIDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // --- Handlers for Modals ---
  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowAddEditModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowAddEditModal(true);
  };

  const handleSaveVehicle = async (formData: Partial<Vehicle>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingVehicle ? 'Updating vehicle...' : 'Adding new vehicle...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (editingVehicle) {
        // Update existing vehicle
        setVehicles(prevVehicles => prevVehicles.map(vehicle =>
          vehicle.id === editingVehicle.id ? { ...vehicle, ...formData } as Vehicle : vehicle
        ));
        toast.success('Vehicle updated successfully!', { id: toastId });
      } else {
        // Create new vehicle
        const newVehicle: Vehicle = {
          id: `VHC${Date.now()}`,
          ...formData,
        } as Vehicle;
        setVehicles(prevVehicles => [newVehicle, ...prevVehicles]);
        toast.success('New vehicle added to fleet!', { id: toastId });
      }
      setShowAddEditModal(false);
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast.error(error.message || `Failed to ${editingVehicle ? 'update' : 'add'} vehicle.`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    setIsSubmitting(true);
    setShowDeleteConfirmModal(false);
    const deleteToastId = toast.loading(`Deleting ${vehicleToDelete.plateNumber}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete.id));
      toast.success(`Vehicle ${vehicleToDelete.plateNumber} deleted successfully!`, { id: deleteToastId });
      setVehicleToDelete(null);
    } catch (err: any) {
      console.error("Error deleting vehicle:", err);
      toast.error(err.message || "Failed to delete vehicle.", { id: deleteToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vehicle.assignedRiderName.toLowerCase().includes(searchTerm.toLowerCase());
                            
      const matchesType = filterType === 'All' || vehicle.type === filterType;
      const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchTerm, filterType, filterStatus]);

  // Summary calculations
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const inMaintenance = vehicles.filter(v => v.status === 'Maintenance').length;
  const avgMileage = totalVehicles > 0 ? (vehicles.reduce((sum, v) => sum + v.mileageKm, 0) / totalVehicles).toFixed(0) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Vehicle Fleet Management <span className="ml-2 text-indigo-600 text-base sm:text-xl">🚚</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Maintain inventory, track assignment, and monitor service status of all vehicles.
          </p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Vehicle
        </button>
      </div>
      
      {/* --- */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <VehicleSummaryCard title="Total Fleet" value={totalVehicles} icon={VehicleIcon} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <VehicleSummaryCard title="Active Vehicles" value={activeVehicles} icon={CheckCircleIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <VehicleSummaryCard title="In Maintenance" value={inMaintenance} icon={WrenchScrewdriverIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
        <VehicleSummaryCard title="Avg Mileage" value={`${avgMileage} km`} icon={CircleStackIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* --- */}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Fleet Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by plate #, make, model, or rider name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="type-filter" className="sr-only">Filter by Vehicle Type</label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              <option value="Motorbike">Motorbike</option>
              <option value="Car">Car</option>
              <option value="Van">Van</option>
              <option value="Lorry">Lorry</option>
              <option value="Bicycle">Bicycle</option>
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- */}

      {/* Vehicles Table */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Vehicle Inventory ({filteredVehicles.length})</h2>
        {filteredVehicles.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
            <p className="text-2xl text-gray-500 font-semibold">No vehicles match your criteria. 🛠️</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative shadow-lg sm:rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Plate #</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Make / Model</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Assigned Rider</th>
                  <th scope="col" className="px-6 py-3">Mileage</th>
                  <th scope="col" className="px-6 py-3">Last Service</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <VehicleRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={handleEditVehicle}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- */}

      {/* Add/Edit Vehicle Modal */}
      <AddEditVehicleModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        vehicle={editingVehicle}
        riders={riders} // Pass the list of riders
        onSave={handleSaveVehicle}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal (Reused) */}
      {vehicleToDelete && (
        <DeleteConfirmationModal 
          isOpen={showDeleteConfirmModal} 
          onClose={() => setShowDeleteConfirmModal(false)} 
          onConfirm={confirmDelete}
          // Generic item name for the modal
          itemName={`Vehicle ${vehicleToDelete.plateNumber} (${vehicleToDelete.make} ${vehicleToDelete.model})`} 
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

// Re-defining the generic Delete Confirmation Modal for use in this file
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; // Used generically for the item's name/ID
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-600 mb-7">
        Are you sure you want to delete <span className="font-bold text-red-600">"{itemName}"</span>?
        This action is irreversible and will remove the vehicle from the fleet inventory.
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
          {isSubmitting ? "Deleting..." : "Delete Vehicle"}
        </button>
      </div>
    </div>
  </Modal>
);