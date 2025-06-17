import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  FireIcon,
  TagIcon,
  SparklesIcon,
  GiftIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface ProductAvailabilityProps {
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
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

const ProductAvailability: React.FC<ProductAvailabilityProps> = ({
  formData,
  setFormData,
}) => {
  const toggleAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: !prev.isAvailable,
      // Clear restockDate if toggling available
      ...(prev.isAvailable && { restockDate: "" }),
    }));
  };

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Product Availability</h2>
        <p className="text-gray-500 mt-1">
          Control stock status, quantity, and special flags for this product.
        </p>
      </div>

      {/* Stock Status */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
        <label className="block text-gray-700 font-medium mb-2">Stock Status</label>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormData({ ...formData, isAvailable: true })}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              formData.isAvailable
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>In Stock</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFormData({ ...formData, isAvailable: false })}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              !formData.isAvailable
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <XCircleIcon className="w-5 h-5" />
            <span>Out of Stock</span>
          </motion.button>
        </div>
      </div>

      {/* Quantity & Restock */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Quantity Available</label>
          <input
            type="number"
            name="quantity"
            min={0}
            value={formData.quantity || ""}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })
            }
            placeholder="e.g. 100"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!formData.isAvailable && (
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Restock Date
            </label>
            <input
              type="date"
              name="restockDate"
              value={formData.restockDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, restockDate: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Feature Toggles */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-sm space-y-4">
        <h4 className="text-lg font-semibold text-gray-700">Product Flags</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureToggle
            label="Featured"
            icon={StarIcon}
            enabled={!!formData.isFeatured}
            onToggle={() =>
              setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))
            }
          />
          <FeatureToggle
            label="New Arrival"
            icon={SparklesIcon}
            enabled={!!formData.isNewArrival}
            onToggle={() =>
              setFormData((prev) => ({ ...prev, isNewArrival: !prev.isNewArrival }))
            }
          />
          <FeatureToggle
            label="On Offer"
            icon={TagIcon}
            enabled={!!formData.isOnOffer}
            onToggle={() =>
              setFormData((prev) => ({ ...prev, isOnOffer: !prev.isOnOffer }))
            }
          />
          <FeatureToggle
            label="Discounted"
            icon={CurrencyDollarIcon}
            enabled={!!formData.isDiscounted}
            onToggle={() =>
              setFormData((prev) => ({ ...prev, isDiscounted: !prev.isDiscounted }))
            }
          />
          <FeatureToggle
            label="Flash Deal"
            icon={FireIcon}
            enabled={!!formData.isFlashDeal}
            onToggle={() =>
              setFormData((prev) => ({ ...prev, isFlashDeal: !prev.isFlashDeal }))
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <label className="block">
                <span className="text-gray-700 font-medium text-sm">Deal Start Date</span>
                {/* Consider a DatePicker component here */}
                <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    // value={formatDateForInput(formData.startDealDate)}
                    value={formData.startDealDate || ""}
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
                    value={formData.startDealDate || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, startDealDate: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    // value={formatDateForInput(formData.endDealDate)}
                    // onChange={(e) =>
                    //     setFormData({ ...formData, endDealDate: e.target.value ? new Date(e.target.value) : undefined })
                    // }
                />
            </label>
            <label className="block">
                <span className="text-gray-700 font-medium text-sm">Availability Start Date</span>
                {/* Consider a DatePicker component here */}
                <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.startDealDate || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, startDealDate: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    // value={formatDateForInput(formData.availabilityStart)}
                    // onChange={(e) =>
                    //     setFormData({ ...formData, availabilityStart: e.target.value ? new Date(e.target.value) : undefined })
                    // }
                />
            </label>
            <label className="block">
                <span className="text-gray-700 font-medium text-sm">Availability End Date</span>
                {/* Consider a DatePicker component here */}
                <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-xl border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.startDealDate || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, startDealDate: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    // value={formatDateForInput(formData.availabilityEnd)}
                    // onChange={(e) =>
                    //     setFormData({ ...formData, availabilityEnd: e.target.value ? new Date(e.target.value) : undefined })
                    // }
                />
            </label>
        </div>
      </div>
    </section>
  );
};

export default ProductAvailability;
