import React, { useState } from "react";
import Modal from "../components/Modal";

const AddToProductMarketModal = ({ 
  showRequestProductModal, 
  setShowRequestProductModal, 
  product, 
  sellerId,
  sellerType
}: any) => {
  const [quantity, setQuantity] = useState(0);
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleCreateListing = async () => {
    try {
      if (quantity <= 0 || buyingPrice <= 0 || sellingPrice <= 0) {
        alert("Please enter valid quantity and prices.");
        return;
      }

      const response = await fetch(`${apiUrl}/clients/addToMarketList`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          sellerType,
          productId: product.id || product.productId,
          quantity,
          buyingPrice,
          sellingPrice,
        }),
      });

      if (!response.ok) throw new Error("Failed to create marketplace listing.");

      alert("Marketplace listing created successfully.");
      setShowRequestProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={showRequestProductModal}
      onClose={() => setShowRequestProductModal(false)}
      title={`Create Listing for ${product.productName}`}
    >
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        {/* Quantity Input */}
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buying Price Input */}
        <div className="space-y-1">
          <label htmlFor="buyingPrice" className="text-sm font-medium text-gray-700">
            Buying Price
          </label>
          <input
            id="buyingPrice"
            type="number"
            placeholder="Enter buying price"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selling Price Input */}
        <div className="space-y-1">
          <label htmlFor="sellingPrice" className="text-sm font-medium text-gray-700">
            Selling Price
          </label>
          <input
            id="sellingPrice"
            type="number"
            placeholder="Enter selling price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreateListing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Submit Listing
        </button>
      </div>
    </Modal>
  );
};

export default AddToProductMarketModal;
