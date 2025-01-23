import React, { useState } from "react";
import Modal from "../components/Modal";

const RequestProductModal = ({ 
  showRequestProductModal, 
  setShowRequestProductModal, 
  product, 
  clientId,
  salesAgentId
}: any) => {
  const [quantity, setQuantity] = useState(0);
  // const [salesAgentId, setSalesAgentId] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleRequestProduct = async () => {
    try {
      if (quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }

      const response = await fetch(`${apiUrl}/clients/requestproduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          productId: product.id || product.productId,
          quantity,
          salesAgentId: salesAgentId || null, // Optional
        }),
      });

      if (!response.ok) throw new Error("Failed to request product.");

      alert("Product request submitted successfully.");
      setShowRequestProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={showRequestProductModal}
      onClose={() => setShowRequestProductModal(false)}
      title={`Request ${product.name}`}
    >
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        {/* Quantity Input */}
        <div className="space-y-1">
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
            Quantity to Request
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

        {/* Request Button */}
        <button
          onClick={handleRequestProduct}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Submit Request
        </button>
      </div>
    </Modal>
  );
};

export default RequestProductModal;
