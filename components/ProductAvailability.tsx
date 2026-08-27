import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

// Enums (Assuming these are imported from your types file)
export enum ListingSystemStatus {
  DRAFT = "DRAFT",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  INACTIVE = "INACTIVE",
}

export enum ListingMarketStatus {
  AVAILABLE = "AVAILABLE",
  UNDER_OFFER = "UNDER_OFFER",
  SOLD = "SOLD",
  RENTED = "RENTED",
}

export enum ListingTransactionType {
  SALE = "SALE",
  RENT = "RENT",
}

interface ProductAvailabilityProps {
  formData: Record<string, any>;
  setFormData: (name: string, value: any) => void;
}

const FeatureToggle = ({
  label,
  icon: Icon,
  enabled,
  onToggle,
}: {
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
    <div className="flex items-center space-x-2">
      <Icon className="w-6 h-6 text-gray-500" />
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <motion.span
        layout
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: enabled ? 24 : 0 }}
      />
    </button>
  </div>
);

const ProductAvailability: React.FC<ProductAvailabilityProps> = ({ formData, setFormData }) => {
  // Default fallbacks for the statuses
  const listingType = formData.listingTransactionType || ListingTransactionType.SALE;
  const systemStatus = formData.listingSystemStatus || ListingSystemStatus.DRAFT;
  const marketStatus = formData.listingMarketStatus || ListingMarketStatus.AVAILABLE;

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Product Availability</h2>
        <p className="text-gray-500 mt-1">
          Control stock status, listing visibility, and special flags for this product.
        </p>
      </div>

      {/* === Transaction & Status Configuration === */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-sm space-y-6">
        
        {/* Listing Intent (Buy/Rent) */}
        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-medium">Listing Intent</label>
          <div className="flex bg-gray-200/70 p-1 rounded-xl w-full sm:w-72">
            <button
              type="button"
              onClick={() => setFormData("listingTransactionType", ListingTransactionType.SALE)}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                listingType === ListingTransactionType.SALE
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <TagIcon className="w-4 h-4 mr-2" />
              For Sale
            </button>
            <button
              type="button"
              onClick={() => setFormData("listingTransactionType", ListingTransactionType.RENT)}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                listingType === ListingTransactionType.RENT
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 mr-2" />
              For Rent
            </button>
          </div>
        </div>

        {/* Listing Statuses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* System Status */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
              <ShieldCheckIcon className="w-4 h-4 text-gray-500" />
              <span>System Status</span>
            </label>
            <select
              value={systemStatus}
              onChange={(e) => setFormData("listingSystemStatus", e.target.value)}
              className="block w-full rounded-xl border-gray-300 p-3 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value={ListingSystemStatus.DRAFT}>Draft (Not Published)</option>
              <option value={ListingSystemStatus.UNDER_REVIEW}>Under Review</option>
              <option value={ListingSystemStatus.ACTIVE}>Active (Live)</option>
              <option value={ListingSystemStatus.REJECTED}>Rejected</option>
              <option value={ListingSystemStatus.INACTIVE}>Inactive (Archived)</option>
            </select>
          </div>

          {/* Market Status */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
              <ShoppingBagIcon className="w-4 h-4 text-gray-500" />
              <span>Market Status</span>
            </label>
            <select
              value={marketStatus}
              onChange={(e) => setFormData("listingMarketStatus", e.target.value)}
              className="block w-full rounded-xl border-gray-300 p-3 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value={ListingMarketStatus.AVAILABLE}>Available</option>
              <option value={ListingMarketStatus.UNDER_OFFER}>Under Offer (Deposit Paid)</option>
              <option value={ListingMarketStatus.SOLD}>Sold</option>
              <option value={ListingMarketStatus.RENTED}>Rented</option>
            </select>
          </div>

        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-semibold text-gray-700">Product Flags</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureToggle
            label="Featured"
            icon={StarIcon}
            enabled={!!formData.isFeatured}
            onToggle={() => setFormData("isFeatured", !formData.isFeatured)}
          />
          <FeatureToggle
            label="New Arrival"
            icon={SparklesIcon}
            enabled={!!formData.isNewArrival}
            onToggle={() => setFormData("isNewArrival", !formData.isNewArrival)}
          />
          <FeatureToggle
            label="On Offer"
            icon={TagIcon}
            enabled={!!formData.isOnOffer}
            onToggle={() => setFormData("isOnOffer", !formData.isOnOffer)}
          />
          <FeatureToggle
            label="Discounted"
            icon={CurrencyDollarIcon}
            enabled={!!formData.isDiscounted}
            onToggle={() => setFormData("isDiscounted", !formData.isDiscounted)}
          />
          <FeatureToggle
            label="Flash Deal"
            icon={FireIcon}
            enabled={!!formData.isFlashDeal}
            onToggle={() => setFormData("isFlashDeal", !formData.isFlashDeal)}
          />
        </div>

        {/* Deal & Availability Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200">
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Deal Start Date</span>
            <input
              type="datetime-local"
              value={formData.startDealDate || ""}
              onChange={(e) => setFormData("startDealDate", e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Deal End Date</span>
            <input
              type="datetime-local"
              value={formData.endDealDate || ""}
              onChange={(e) => setFormData("endDealDate", e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Availability Start Date</span>
            <input
              type="datetime-local"
              value={formData.availabilityStart || ""}
              onChange={(e) => setFormData("availabilityStart", e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium text-sm">Availability End Date</span>
            <input
              type="datetime-local"
              value={formData.availabilityEnd || ""}
              onChange={(e) => setFormData("availabilityEnd", e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </label>
        </div>
      </div>
    </section>
  );
};

export default ProductAvailability;