import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const RestockProductModal = ({ showRestockProductModal, setShowRestockProductModal, product, refreshInventory } : any) => {

   const [restockQuantity, setRestockQuantity] = useState(0);
   const [damagedQuantity, setDamagedQuantity] = useState(0);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
//
  const handleRestock = async () => {
    try {
      
      const response = await fetch(`${apiBaseUrl}/admin/post-restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          companyId: product.companyId,
          quantity: restockQuantity,
          damaged: damagedQuantity,
          action: "RESTOCK",
        }),
      });

      if (!response.ok) throw new Error("Failed to restock product.");

      alert("Product restocked successfully.");
      setShowRestockProductModal(false);
      refreshInventory();
    } catch (error : any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal isOpen={showRestockProductModal} onClose={() => setShowRestockProductModal(false)} title={`Restock ${product.name}`}>
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        {/* Restock Quantity */}
        <div className="space-y-1">
          <label htmlFor="restockQuantity" className="text-sm font-medium text-gray-700">
            Quantity to Restock
          </label>
          <input
            id="restockQuantity"
            type="number"
            placeholder="Enter quantity"
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Damaged Quantity */}
        <div className="space-y-1">
          <label htmlFor="damagedQuantity" className="text-sm font-medium text-gray-700">
            Damaged Quantity
          </label>
          <input
            id="damagedQuantity"
            type="number"
            placeholder="Enter damaged quantity"
            value={damagedQuantity}
            onChange={(e) => setDamagedQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Restock Button */}
        <button
          onClick={handleRestock}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        >
          Restock Product
        </button>
      </div>
    </Modal>
  );
};

export default RestockProductModal;