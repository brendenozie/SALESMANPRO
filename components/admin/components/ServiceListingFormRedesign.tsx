import { useState } from 'react'; // Assuming this is a React component and useState is available
import {
  XMarkIcon,
  InformationCircleIcon,
  PrinterIcon,
  StarIcon,
  CalendarIcon,
  PhotoIcon,
  MapPinIcon,
  TagIcon,
  PlusCircleIcon, // Assuming PlusCircleIcon from heroicons
} from '@heroicons/react/24/outline'; // Assuming you have heroicons installed

// Mock data and types (replace with your actual data/prop types)
// These would typically come from props or a data fetching hook in a real app.
const productCategories = [{ id: '1', name: 'Electronics' }, { id: '2', name: 'Automotive Services' }, { id: '3', name: 'Home & Garden' }];
const sellers = [{ id: 's1', name: 'Global Tech Ltd.' }, { id: 's2', name: 'AutoCare Pro' }, { id: 's3', name: 'Green Thumb Gardens' }];
const companies = [{ id: 'c1', name: 'Innovate Solutions' }, { id: 'c2', name: 'Service Alliance' }];
const deliveryMethods = ['In-person', 'Online', 'Hybrid', 'Mail'];
const paymentOptions = ['Credit Card', 'Cash on Delivery', 'Bank Transfer', 'Online Payment Gateway'];

// Define your SellerType and ListingStatus enums or types based on your backend
type SellerType = "INDIVIDUAL" | "COMPANY";
type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "ARCHIVED";

// Dummy formData and handlers for demonstration.
// In your actual component, these would be passed via props or managed by useState/useReducer.
interface FormData {
    title: string;
    description: string;
    productCategoryId: string;
    sellerId?: string;
    companyId?: string;
    sellerType?: SellerType;
    sellingPrice: number;
    buyingPrice: number;
    profitMargin?: number;
    tax?: number;
    shippingCost?: number;
    discount?: number;
    quantity?: number;
    serviceSchedule?: string;
    hourlyRate?: number;
    minimumHours?: number;
    minNoticePeriod?: string;
    maxBookingAhead?: string;
    totalCapacity?: number;
    deliveryMethod?: string;
    fulfillmentStatus?: string;
    providerRating?: number;
    bookingSlots: Array<{ date: string; time: string; capacity: number }>;
    pricingTiers: Array<{ name: string; price: number; duration?: string; description?: string; features: string[] }>;
    tags: string[];
    amenities: string[];
    requiredClientInfo: string[];
    images: string[];
    video?: string;
    contactName?: string;
    contact?: string; // This is phone number
    email?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
    isAvailable: boolean;
    isOnOffer: boolean;
    isFlashDeal: boolean;
    isNewArrival: boolean;
    isDiscounted: boolean;
    isFeatured: boolean;
    startDealDate?: Date;
    endDealDate?: Date;
    availabilityStart?: Date;
    availabilityEnd?: Date;
    delivery: boolean;
    showOnGhuba?: boolean;
    paymentOption: string;
    status: ListingStatus;
}

// Dummy initial form data for demonstration
const initialFormData: FormData = {
    title: '',
    description: '',
    productCategoryId: '',
    sellingPrice: 0,
    buyingPrice: 0,
    bookingSlots: [],
    pricingTiers: [],
    tags: [],
    amenities: [],
    requiredClientInfo: [],
    images: [],
    isAvailable: true,
    isOnOffer: false,
    isFlashDeal: false,
    isNewArrival: false,
    isDiscounted: false,
    isFeatured: false,
    delivery: false,
    paymentOption: '',
    status: 'PENDING',
};

// Existing utility function for date formatting
const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

// This component would likely be a child of a parent component that manages its state and actions.
// For this example, we'll simulate the state management within this block.
interface ServiceListingFormRedesignProps {
    selected?: FormData | null;
    formMode?: "create" | "edit";
    closeModal: () => void;
    saveService: () => void;
}

const ServiceListingFormRedesign = ({
    selected = null, // Mock prop for selected item in edit mode
    formMode = "create", // Mock prop for form mode ("create" or "edit")
    closeModal, // Mock function to close the modal
    saveService, // Mock function to save the service
}: ServiceListingFormRedesignProps) => {
    const [formData, setFormData] = useState<FormData>(selected || initialFormData);
    const [activeTab, setActiveTab] = useState('details'); // State to manage active tab

    const handleArrayFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: keyof FormData) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            [fieldName]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
        });
    };

    const handleAddBookingSlot = () => {
        setFormData({
            ...formData,
            bookingSlots: [...(formData.bookingSlots || []), { date: '', time: '', capacity: 1 }],
        });
    };

    const handleUpdateBookingSlot = (index: number, field: string, value: string | number) => {
        const updatedSlots = [...(formData.bookingSlots || [])];
        updatedSlots[index] = { ...updatedSlots[index], [field]: value };
        setFormData({ ...formData, bookingSlots: updatedSlots });
    };

    const handleRemoveBookingSlot = (index: number) => {
        setFormData({
            ...formData,
            bookingSlots: (formData.bookingSlots || []).filter((_, i) => i !== index),
        });
    };

    const handleAddPricingTier = () => {
        setFormData({
            ...formData,
            pricingTiers: [...(formData.pricingTiers || []), { name: '', price: 0, features: [] }],
        });
    };

    const handleUpdatePricingTier = (index: number, field: string, value: string | number) => {
        const updatedTiers = [...(formData.pricingTiers || [])];
        if (field === "features") {
             updatedTiers[index] = { ...updatedTiers[index], [field]: (value as string).split(',').map(f => f.trim()).filter(f => f !== '') };
        } else {
            updatedTiers[index] = { ...updatedTiers[index], [field]: value };
        }
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const handleRemovePricingTier = (index: number) => {
        setFormData({
            ...formData,
            pricingTiers: (formData.pricingTiers || []).filter((_, i) => i !== index),
        });
    };

    // Tab data for rendering
    const tabs = [
        { id: 'details', name: 'Listing Details', icon: InformationCircleIcon },
        { id: 'pricing', name: 'Pricing & Tiers', icon: PrinterIcon },
        { id: 'service', name: 'Service Specifics', icon: StarIcon },
        { id: 'availability', name: 'Availability & Deals', icon: CalendarIcon },
        { id: 'media', name: 'Media', icon: PhotoIcon },
        { id: 'contactLocation', name: 'Contact & Location', icon: MapPinIcon },
        { id: 'advanced', name: 'Advanced Options', icon: TagIcon },
    ];

    return (
      <ComponentWrapper>
        {(selected !== null || formMode === "create") && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 relative overflow-hidden max-h-[95vh] flex flex-col">
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors duration-200 z-10"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>

                    {/* Header */}
                    <h3 className="text-4xl font-extrabold mb-6 text-gray-900 leading-tight">
                        {formMode === "create" ? "Add New Service Listing" : `Edit: ${selected?.title || 'Service Listing'}`}
                    </h3>

                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-200 mb-6 -mx-8 px-8 overflow-x-auto custom-scrollbar">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`group inline-flex items-center px-1 py-4 border-b-2 text-base font-medium transition-colors duration-200 whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon
                                        className={`-ml-0.5 mr-2 h-5 w-5
                                            ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}
                                        `}
                                        aria-hidden="true"
                                    />
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Form Content - Wrapped in a scrollable area */}
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 custom-scrollbar"> {/* Added padding right and negative margin right to account for scrollbar */}

                        {/* Tab: Details */}
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Basic Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Listing Title <span className="text-red-500">*</span></span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 text-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                placeholder="E.g., Premium Car Wash Service"
                                            />
                                        </label>

                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Description</span>
                                            {/* Consider integrating a rich text editor here if descriptions are complex */}
                                            <textarea
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.description || ""}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                placeholder="Provide a detailed description of your service, its benefits, and what clients can expect."
                                            ></textarea>
                                        </label>

                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Product Category <span className="text-red-500">*</span></span>
                                            {/* For many options, consider a searchable select component */}
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.productCategoryId}
                                                onChange={(e) => setFormData({ ...formData, productCategoryId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {productCategories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Seller</span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.sellerId || ""}
                                                onChange={(e) => setFormData({ ...formData, sellerId: e.target.value || undefined })}
                                            >
                                                <option value="">Select Seller (Optional)</option>
                                                {sellers.map((seller) => (
                                                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Company</span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.companyId || ""}
                                                onChange={(e) => setFormData({ ...formData, companyId: e.target.value || undefined })}
                                            >
                                                <option value="">Select Company (Optional)</option>
                                                {companies.map((company) => (
                                                    <option key={company.id} value={company.id}>{company.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Seller Type</span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.sellerType || ""}
                                                onChange={(e) => setFormData({ ...formData, sellerType: e.target.value as SellerType || undefined })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="INDIVIDUAL">Individual</option>
                                                <option value="COMPANY">Company</option>
                                            </select>
                                        </label>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Pricing & Tiers */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Pricing Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Selling Price ($) <span className="text-red-500">*</span></span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.sellingPrice}
                                                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                                                required
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Buying Price ($) - Internal <span className="text-red-500">*</span></span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.buyingPrice}
                                                onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
                                                required
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Profit Margin (%)</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.profitMargin || 0}
                                                onChange={(e) => setFormData({ ...formData, profitMargin: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Tax ($)</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.tax || 0}
                                                onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Shipping Cost ($)</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.shippingCost || 0}
                                                onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Discount (%)</span>
                                            <input
                                                type="number"
                                                step="1"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.discount || 0}
                                                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                                placeholder="0"
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Pricing Tiers/Packages</h4>
                                    <div className="space-y-6">
                                        {(formData.pricingTiers || []).map((tier, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                                <h5 className="text-lg font-semibold mb-3 text-gray-800">Tier #{index + 1}</h5>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePricingTier(index)}
                                                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    aria-label="Remove pricing tier"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <label className="block">
                                                        <span className="text-gray-600 text-sm">Tier Name</span>
                                                        <input
                                                            type="text"
                                                            className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={tier.name}
                                                            onChange={(e) => handleUpdatePricingTier(index, "name", e.target.value)}
                                                            placeholder="E.g., Basic Package, Premium Plan"
                                                        />
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-gray-600 text-sm">Tier Price ($)</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={tier.price}
                                                            onChange={(e) => handleUpdatePricingTier(index, "price", Number(e.target.value))}
                                                            placeholder="0.00"
                                                        />
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-gray-600 text-sm">Duration (Optional)</span>
                                                        <input
                                                            type="text"
                                                            className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={tier.duration || ''}
                                                            onChange={(e) => handleUpdatePricingTier(index, "duration", e.target.value)}
                                                            placeholder="E.g., 1 hour, 3 days, Monthly"
                                                        />
                                                    </label>
                                                </div>
                                                <label className="block mt-4">
                                                    <span className="text-gray-600 text-sm">Description</span>
                                                    <textarea
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={tier.description || ''}
                                                        onChange={(e) => handleUpdatePricingTier(index, "description", e.target.value)}
                                                        rows={2}
                                                        placeholder="Brief description of what this tier includes."
                                                    ></textarea>
                                                </label>
                                                <label className="block mt-4">
                                                    <span className="text-gray-600 text-sm">Features (comma-separated)</span>
                                                    <input
                                                        type="text"
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={tier.features.join(', ')}
                                                        onChange={(e) => handleUpdatePricingTier(index, "features", e.target.value)}
                                                        placeholder="Feature A, Feature B, Feature C"
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPricingTier}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Add Pricing Tier
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* Tab: Service Specifics */}
                        {activeTab === 'service' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Service Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Quantity (e.g., number of seats)</span>
                                            <input
                                                type="number"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.quantity || ''}
                                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                                placeholder="1"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">General Service Schedule (e.g., "Mon-Fri, 9am-5pm")</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.serviceSchedule || ""}
                                                onChange={(e) => setFormData({ ...formData, serviceSchedule: e.target.value })}
                                                placeholder="Mon-Fri, 9am-5pm"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Hourly Rate ($)</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.hourlyRate || ''}
                                                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Minimum Hours</span>
                                            <input
                                                type="number"
                                                step="1"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.minimumHours || ''}
                                                onChange={(e) => setFormData({ ...formData, minimumHours: Number(e.target.value) })}
                                                placeholder="1"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Min. Notice Period (e.g., "24 hours", "3 days")</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.minNoticePeriod || ""}
                                                onChange={(e) => setFormData({ ...formData, minNoticePeriod: e.target.value })}
                                                placeholder="24 hours"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Max Booking Ahead (e.g., "3 months")</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.maxBookingAhead || ""}
                                                onChange={(e) => setFormData({ ...formData, maxBookingAhead: e.target.value })}
                                                placeholder="3 months"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Total Capacity</span>
                                            <input
                                                type="number"
                                                step="1"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.totalCapacity || ''}
                                                onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
                                                placeholder="100"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Delivery Method</span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.deliveryMethod || ""}
                                                onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value || undefined })}
                                            >
                                                <option value="">Select Method</option>
                                                {deliveryMethods.map((method) => (
                                                    <option key={method} value={method}>{method}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Fulfillment Status</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.fulfillmentStatus || ""}
                                                onChange={(e) => setFormData({ ...formData, fulfillmentStatus: e.target.value })}
                                                placeholder="e.g., PENDING_CONFIRMATION"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Provider Rating (Read-only for now)</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 bg-gray-100 cursor-not-allowed"
                                                value={formData.providerRating || ''}
                                                readOnly
                                                placeholder="N/A"
                                            />
                                        </label>
                                    </div>
                                </section>

                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Booking Slots</h4>
                                    <div className="space-y-4">
                                        {(formData.bookingSlots || []).map((slot, index) => (
                                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg items-center border border-gray-200 relative">
                                                <h5 className="text-md font-semibold text-gray-700 md:col-span-4">Slot #{index + 1}</h5>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBookingSlot(index)}
                                                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    aria-label="Remove booking slot"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                                <label className="block">
                                                    <span className="text-gray-600 text-sm">Date</span>
                                                    {/* Consider a proper DatePicker component */}
                                                    <input
                                                        type="date"
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={slot.date}
                                                        onChange={(e) => handleUpdateBookingSlot(index, "date", e.target.value)}
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="text-gray-600 text-sm">Time</span>
                                                    {/* Consider a proper TimePicker component */}
                                                    <input
                                                        type="time"
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={slot.time}
                                                        onChange={(e) => handleUpdateBookingSlot(index, "time", e.target.value)}
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="text-gray-600 text-sm">Capacity</span>
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        className="mt-1 block w-full rounded-lg border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        value={slot.capacity}
                                                        onChange={(e) => handleUpdateBookingSlot(index, "capacity", Number(e.target.value))}
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddBookingSlot}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                    >
                                        <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Add Booking Slot
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* Tab: Availability & Deals */}
                        {activeTab === 'availability' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Deal Flags & Availability</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Using conceptual toggle switches (you'd replace input type="checkbox" with a custom ToggleSwitch component) */}
                                        {[
                                            { label: 'Available', key: 'isAvailable' },
                                            { label: 'On Offer', key: 'isOnOffer' },
                                            { label: 'Flash Deal', key: 'isFlashDeal' },
                                            { label: 'New Arrival', key: 'isNewArrival' },
                                            { label: 'Discounted', key: 'isDiscounted' },
                                            { label: 'Featured', key: 'isFeatured' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <span className="text-gray-700 font-medium">{item.label}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer" // Hide original checkbox
                                                        checked={formData[item.key as keyof FormData] as boolean}
                                                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                                                    />
                                                    {/* Visual representation of a toggle switch */}
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Deal Start Date</span>
                                            {/* Consider a DatePicker component here */}
                                            <input
                                                type="datetime-local"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formatDateForInput(formData.startDealDate)}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, startDealDate: e.target.value ? new Date(e.target.value) : undefined })
                                                }
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Deal End Date</span>
                                            {/* Consider a DatePicker component here */}
                                            <input
                                                type="datetime-local"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formatDateForInput(formData.endDealDate)}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, endDealDate: e.target.value ? new Date(e.target.value) : undefined })
                                                }
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Availability Start Date</span>
                                            {/* Consider a DatePicker component here */}
                                            <input
                                                type="datetime-local"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formatDateForInput(formData.availabilityStart)}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, availabilityStart: e.target.value ? new Date(e.target.value) : undefined })
                                                }
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Availability End Date</span>
                                            {/* Consider a DatePicker component here */}
                                            <input
                                                type="datetime-local"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formatDateForInput(formData.availabilityEnd)}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, availabilityEnd: e.target.value ? new Date(e.target.value) : undefined })
                                                }
                                            />
                                        </label>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Media */}
                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Images & Video</h4>
                                    <div className="space-y-6">
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Image URLs (comma-separated)</span>
                                            {/* In a real app, this would be a sophisticated file uploader (drag-and-drop, preview) */}
                                            <textarea
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={(formData.images as string[]).join(", ")}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        images: e.target.value.split(",").map((url) => url.trim()).filter(url => url !== ''),
                                                    })
                                                }
                                                rows={3}
                                                placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
                                            ></textarea>
                                            <p className="text-sm text-gray-500 mt-2">
                                                For best results, use high-quality images. In a real app, this would be a file upload component.
                                            </p>
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Video URL</span>
                                            <input
                                                type="url"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.video || ""}
                                                onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                                                placeholder="https://www.youtube.com/watch?v=your_video_id or Vimeo link"
                                            />
                                            <p className="text-sm text-gray-500 mt-2">
                                                Link to a hosted video (e.g., YouTube, Vimeo) to showcase your service.
                                            </p>
                                        </label>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Contact & Location */}
                        {activeTab === 'contactLocation' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Contact & Location Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Contact Name</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.contactName || ""}
                                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                                placeholder="John Doe"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Contact Phone</span>
                                            <input
                                                type="tel"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.contact || ""}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                placeholder="+1 (123) 456-7890"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Contact Email</span>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="info@example.com"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Location Name</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.locationName || ""}
                                                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                                placeholder="Main Office, Client Site"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Latitude</span>
                                            <input
                                                type="number"
                                                step="any"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.latitude || ''}
                                                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                                                placeholder="34.0522"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-700 font-medium text-sm">Longitude</span>
                                            <input
                                                type="number"
                                                step="any"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.longitude || ''}
                                                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                                                placeholder="-118.2437"
                                            />
                                        </label>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Tab: Advanced Options */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h4 className="text-2xl font-semibold mb-4 text-gray-800">Categorization & Marketplace Options</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Tags (comma-separated)</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.tags.join(", ")}
                                                onChange={(e) => handleArrayFieldChange(e, "tags")}
                                                placeholder="cleaning, home, professional"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Separate keywords with commas. E.g., "lawn care, gardening, outdoor"</p>
                                        </label>

                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Amenities (comma-separated, e.g., "Wi-Fi, Parking")</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.amenities.join(", ")}
                                                onChange={(e) => handleArrayFieldChange(e, "amenities")}
                                                placeholder="Wi-Fi, Free Parking, Coffee"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">List features or facilities offered with your service.</p>
                                        </label>
                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Required Client Info (comma-separated, e.g., "Vehicle Make, Pet Type")</span>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.requiredClientInfo.join(", ")}
                                                onChange={(e) => handleArrayFieldChange(e, "requiredClientInfo")}
                                                placeholder="Vehicle Make, Pet Type, Service Address"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Specify additional information you need from the client at the time of booking.</p>
                                        </label>

                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <span className="text-gray-700 font-medium">Offers Physical Delivery/On-site Service</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.delivery}
                                                        onChange={(e) => setFormData({ ...formData, delivery: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <span className="text-gray-700 font-medium">Show on Ghuba Marketplace</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.showOnGhuba || false}
                                                        onChange={(e) => setFormData({ ...formData, showOnGhuba: e.target.checked })}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <label className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Payment Option <span className="text-red-500">*</span></span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.paymentOption}
                                                onChange={(e) => setFormData({ ...formData, paymentOption: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a payment option</option>
                                                {paymentOptions.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <div className="block md:col-span-2">
                                            <span className="text-gray-700 font-medium text-sm">Status <span className="text-red-500">*</span></span>
                                            <select
                                                className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ListingStatus })}
                                                required
                                            >
                                                <option value="ACTIVE">Active</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="REJECTED">Rejected</option>
                                                <option value="ARCHIVED">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div> {/* End of scrollable content */}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 -mx-8 px-8">
                        <button
                            onClick={closeModal}
                            className="px-8 py-3 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveService}
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 font-semibold shadow-md"
                        >
                            {formMode === "create" ? "Create Listing" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </ComponentWrapper> // Assuming this component is wrapped, adjust as needed.
    );
};

// This is just a wrapper for the sake of demonstrating the component structure.
// In your actual application, the ServiceListingFormRedesign would be rendered directly.
const ComponentWrapper = ({ children }: { children: React.ReactNode }) => {
    // Mock implementations for the props expected by ServiceListingFormRedesign
    // (Not used here, but kept for reference)
    // const closeModal = () => console.log('Modal closed');
    // const saveService = () => console.log('Service saved');

    return (
        <div>
            {/* You might have a button here to open the modal */}
            {children}
        </div>
    );
}

export default  ServiceListingFormRedesign;
// To render in a real app, you would use:
{/* <ServiceListingFormRedesign
   selected={null} // or your data object
   formMode="create" // or "edit"
   closeModal={() => setModalOpen(false)}
   saveService={handleSubmit}
/> */}
// Note: You might need to adjust imports and state management to fit your specific React setup.