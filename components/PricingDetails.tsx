import React, { useState, useEffect, } from "react";


const PricingDetails = ({ formData, setFormData ,handleInputChange }: any) => {
  const [finalPrice, setFinalPrice] = useState(formData.finalPrice || 0);
  const [profitMargin, setProfitMargin] = useState(formData.profitMargin || 0);

  useEffect(() => {
    const sellingPrice = parseFloat(formData.salesPrice) || 0;
    const buyingPrice = parseFloat(formData.costPrice) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const discountedPrice = sellingPrice - (sellingPrice * discount) / 100;
    const margin = buyingPrice ? ((discountedPrice - buyingPrice) / buyingPrice) * 100 : 0;
    setFinalPrice(discountedPrice);
    setProfitMargin(margin);
    setFormData({ ...formData, profitMargin:margin, finalPrice:discountedPrice, discount: discount });
  }, [formData.salesPrice, formData.costPrice, formData.discount]);

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-gray-200 space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Pricing Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Cost Price</label>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice || formData.buyingPrice}
            onChange={handleInputChange}
            placeholder="$0.00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Selling Price</label>
          <input
            type="number"
            name="salesPrice"
            value={formData.salesPrice || formData.sellingPrice || formData.buyingPrice}
            onChange={handleInputChange}
            placeholder="$0.00"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleInputChange}
            placeholder="0%"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="p-5 bg-gray-100 rounded-lg flex justify-between shadow-sm">
        <p className="text-gray-800 font-semibold">Final Price:</p>
        <p className="text-blue-600 font-extrabold text-lg">${formData.finalPrice.toFixed(2)}</p>
      </div>
      <div className="p-5 bg-gray-100 rounded-lg flex justify-between shadow-sm">
        <p className="text-gray-800 font-semibold">Profit Margin:</p>
        <p className="text-green-600 font-extrabold text-lg">{formData.profitMargin.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default PricingDetails;
