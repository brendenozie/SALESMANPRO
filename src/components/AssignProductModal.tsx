import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const AssignProductModal = ({ showAssignProductModal, setShowAssignProductModal, product }: any) => {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(0);
  const [targetType, setTargetType] = useState("QUANTITY"); // New field for target type
  const [targetValue, setTargetValue] = useState(0); // New field for target value

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${apiUrl}/admin/getAllAgents`);
        if (!response.ok) throw new Error("Failed to load agents.");

        const data = await response.json();
        setAgents(data);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    };

    fetchAgents();
  }, []);

  const handleAssign = async () => {
    try {
      if (!selectedAgent) {
        alert("Please select a sales agent.");
        return;
      }

      if (assignQuantity <= 0) {
        alert("Quantity to assign must be greater than 0.");
        return;
      }

      if (targetValue < 0) {
        alert("target value must be valid.");
        return;
      }

        const response = await fetch(`${apiUrl}/admin/post-restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          salesAgentId: selectedAgent,
          quantity: assignQuantity,
          action: "ASSIGN",
          damaged: 0,
          commissionRate: product.commissionRate,          
          commissionType: product.commissionType,
          target: {
            type: targetType,
            value: targetValue,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to assign sales agent.");

      alert("Sales agent assigned successfully.");
      setShowAssignProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredAgents = agents.filter((agent: any) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal className="bg-gray-50 rounded-lg shadow-md"
        isOpen={showAssignProductModal}
        onClose={() => setShowAssignProductModal(false)}
        title={`Assign Agent for ${product.name}`}
      >
        <div className="space-y-6 p-4  text-black">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {filteredAgents.map((agent: any) => (
              <div
                key={agent.id}
                className={`p-4 rounded-lg shadow-sm flex flex-col items-center transition transform hover:scale-105 ${
                  selectedAgent === agent.id ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200'
                }`}
                onClick={() => setSelectedAgent(agent.id)}
              >
                {/* Profile Picture */}
                <img
                  src={agent.profilePicture || '/placeholder-avatar.png'}
                  alt={agent.name}
                  className="h-20 w-20 rounded-full mb-4"
                />
                
                {/* Agent Details */}
                <div className="text-center">
                  <p className="text-lg font-semibold">{agent.name}</p>
                  {/* <p className=" text-xs text-gray-500">ID: {agent.id}</p> */}
                </div>
              </div>
            ))}
          </div>

          {/* Section: Assignment Details */}
          <div className="space-y-4">
            {/* <div className="grid grid-cols-2 gap-4"> */}
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity to Assign</label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Target Type</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="QUANTITY">Quantity</option>
                  <option value="COST">Cost</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="UNITS">Units</option>
                  <option value="ORDERS">Orders</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Target Value</label>
                <input
                  type="number"
                  placeholder="Enter target value"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Assign Button */}
          <div>
            <button
              onClick={handleAssign}
              disabled={!selectedAgent || assignQuantity <= 0 || targetValue < 0}
              className={`w-full py-2 px-4 rounded-lg ${
                selectedAgent && assignQuantity > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Assign Agent
            </button>
          </div>
        </div>
    </Modal>

    // <Modal
    //   isOpen={showAssignProductModal}
    //   onClose={() => setShowAssignProductModal(false)}
    //   title={`Assign Agent for ${product.name}`}
    // >
    //   <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
    //     {/* Search Bar */}
    //     <div className="space-y-1">
    //       <input
    //         type="text"
    //         placeholder="Search by name or ID"
    //         value={searchTerm}
    //         onChange={(e) => setSearchTerm(e.target.value)}
    //         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       />
    //     </div>

    //     {/* Agent List */}
    //     <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
    //       {filteredAgents.map((agent: any) => (
    //         <div
    //           key={agent.id}
    //           onClick={() => setSelectedAgent(agent.id)}
    //           className={`p-4 cursor-pointer ${
    //             selectedAgent === agent.id ? 'bg-blue-100' : 'hover:bg-gray-100'
    //           }`}
    //         >
    //           <p className="font-medium">{agent.name}</p>
    //           <p className="text-sm text-gray-500">ID: {agent.id}</p>
    //         </div>
    //       ))}
    //     </div>

    //     {/* Assigned Quantity */}
    //     <div className="space-y-1">
    //       <label className="text-sm font-medium text-gray-700">Quantity to Assign</label>
    //       <input
    //         type="number"
    //         placeholder="Enter quantity"
    //         value={assignQuantity}
    //         onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
    //         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       />
    //     </div>

    //     {/* Commission Rate */}
    //     <div className="space-y-1">
    //       <label className="text-sm font-medium text-gray-700">Commission Rate (%)</label>
    //       <input
    //         type="number"
    //         placeholder="Enter commission rate"
    //         value={commissionRate}
    //         onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
    //         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       />
    //     </div>

    //     {/* Target Type */}
    //     <div className="space-y-1">
    //       <label className="text-sm font-medium text-gray-700">Target Type</label>
    //       <select
    //         value={targetType}
    //         onChange={(e) => setTargetType(e.target.value)}
    //         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       >
    //         <option value="QUANTITY">Quantity</option>
    //         <option value="COST">Cost</option>
    //         <option value="REVENUE">Revenue</option>
    //         <option value="UNITS">Units</option>
    //         <option value="ORDERS">Orders</option>
    //       </select>
    //     </div>

    //     {/* Target Value */}
    //     <div className="space-y-1">
    //       <label className="text-sm font-medium text-gray-700">Target Value</label>
    //       <input
    //         type="number"
    //         placeholder="Enter target value"
    //         value={targetValue}
    //         onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
    //         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       />
    //     </div>

    //     {/* Assign Button */}
    //     <button
    //       onClick={handleAssign}
    //       className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
    //     >
    //       Assign Agent
    //     </button>
    //   </div>
    // </Modal>
  );
};

export default AssignProductModal;
