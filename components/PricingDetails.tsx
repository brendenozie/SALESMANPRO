import React, { useState, useEffect } from "react";

interface PricingDetailsProps {
  formData: {
    costPrice?: string;
    salesPrice?: string;
    discount?: string;
    finalPrice?: number;
    profitMargin?: number;
    [key: string]: any;
  };
  setFormData: (data: Record<string, any>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PricingDetails: React.FC<PricingDetailsProps> = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  // When costPrice, salesPrice, or discount changes, recalc finalPrice & profitMargin
  useEffect(() => {
    const sellingPrice = parseFloat(formData.salesPrice || formData.sellingPrice || "0") || 0;
    const buyingPrice = parseFloat(formData.costPrice || formData.buyingPrice || "0") || 0;
    const discountValue = parseFloat(formData.discount || "0") || 0;

    // Calculate discounted price
    const discountedPrice = Math.max(sellingPrice - (sellingPrice * discountValue) / 100, 0);
    // Calculate margin: ((final - cost) / cost) * 100
    const margin = buyingPrice > 0 ? ((discountedPrice - buyingPrice) / buyingPrice) * 100 : 0;

    setFormData({
      ...formData,
      finalPrice: discountedPrice,
      profitMargin: margin,
    });
    // Only recalc when those three fields change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.salesPrice, formData.costPrice, formData.discount]);

  // Formatters
  const formatCurrency = (value: number) => value.toFixed(2);
  const formatPercentage = (value: number) => value.toFixed(2);

  return (
    <section className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 space-y-8">
      {/* ── Header ── */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Pricing Details</h3>
        <p className="text-gray-500 mt-1">
          Set your cost, selling price, and discount to see the final price and profit margin in real time.
        </p>
      </div>

      {/* ── Input Card ── */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-6">
        <h4 className="text-lg font-semibold text-gray-700">Enter Costs & Discount</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Cost Price */}
          <div>
            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice || formData.buyingPrice || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label htmlFor="salesPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                type="number"
                id="salesPrice"
                name="salesPrice"
                value={formData.salesPrice || formData.sellingPrice || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="discount"
                type="number"
                name="discount"
                value={formData.discount || "0"}
                onChange={handleInputChange}
                placeholder="0"
                className="w-20 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
              <span className="text-gray-700 font-medium">%</span>
            </div>
            <input
              type="range"
              name="discount"
              min="0"
              max="100"
              value={formData.discount || "0"}
              onChange={handleInputChange}
              className="mt-4 w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Final Price */}
        <div className="bg-blue-50 p-5 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="text-gray-700 text-sm">Final Price</p>
            <p className="text-blue-800 font-extrabold text-2xl">
              ${formatCurrency(formData.finalPrice || 0)}
            </p>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-green-50 p-5 rounded-lg flex justify-between items-center shadow-sm">
          <div>
            <p className="text-gray-700 text-sm">Profit Margin</p>
            <p className="text-green-800 font-extrabold text-2xl">
              {formatPercentage(formData.profitMargin || 0)}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingDetails;
