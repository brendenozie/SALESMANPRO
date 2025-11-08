import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const ReturnProductModal = ({ showReturnProductModal, setShowReturnProductModal, product } : any) => {

  const [selectedAgent, setSelectedAgent] = useState("");
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [damagedQuantity, setDamagedQuantity] = useState(0);
  const [condition, setCondition] = useState('Good');

  const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

   useEffect(() => {
      const fetchAgents = async () => {
        try {
          const response = await fetch(`${apiUrl}/admin/getAllAgents`);
          if (!response.ok) throw new Error("Failed to load agents.");
  
          const data = await response.json();
          console.log(data);
          setAgents(data);
        } catch (error : any) {
          alert(`Error: ${error.message}`);
        }
      };
  
      fetchAgents();
    }, []);

  const handleReturn = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/post-restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          inventoryId: product.inventoryId,
          salesAgentId: selectedAgent,
          adminId: "63f7c9e2d91b1b2a5e80b100",
          quantity: returnQuantity,
          action: "RETURN",
          damaged: damagedQuantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to return product.");

      alert("Product returned successfully.");
      setShowReturnProductModal(false);
      
    } catch (error : any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredAgents = agents.filter((agent : any) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={showReturnProductModal} onClose={() => setShowReturnProductModal(false)} title={`Return ${product.name}`}>
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
        {/* Return Quantity */}
        <div className="space-y-1">
          {/* Search Bar */}
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

           {/* Agent List */}
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredAgents.map((agent : any) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`p-4 cursor-pointer ${selectedAgent === agent.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-gray-500">ID: {agent.id}</p>
            </div>
          ))}
        </div>

          <label htmlFor="returnQuantity" className="text-sm font-medium text-gray-700">
            Quantity to Return
          </label>
          <input
            id="returnQuantity"
            type="number"
            placeholder="Enter quantity"
            value={returnQuantity}
            onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)}
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
            placeholder="Enter quantity"
            value={damagedQuantity}
            onChange={(e) => setDamagedQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturn}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
        >
          Return Product
        </button>
      </div>
    </Modal>
  );
};

export default ReturnProductModal;
