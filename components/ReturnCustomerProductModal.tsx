import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const ReturnCustomerProductModal = ({
  showReturnProductModal,
  setShowReturnProductModal,
  product,
  salesAgents,
}:any) => {
  const [salesAgentId, setSalesAgentId] = useState("63f7c9e2d91b1b2a5e80b016");
  const [selectedClient, setSelectedClient] = useState("");
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [returnReason, setReturnReason] = useState(""); // Field for return reason or notes

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!salesAgentId) {
          throw new Error("Sales agent ID is required.");
        }

        // Fetch customers for the specific agent
        const response = await fetch(`${apiBaseUrl}/agent/getAllCustomers?id=${salesAgentId}`);
        if (!response.ok) throw new Error("Failed to load customers.");

        const data = await response.json();
        setAgents(data);
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    };

    fetchCustomers();
  }, [salesAgentId]);

const handleReturn = async () => {
  try {
    // Check if a sales agent is selected
    if (!selectedClient) {
      alert("Please select a sales agent.");
      return;
    }

    // Check if the return quantity is greater than 0
    if (returnQuantity <= 0) {
      alert("Return quantity must be greater than 0.");
      return;
    }

    // Check if the return reason is provided
    if (!returnReason) {
      alert("Please provide a reason for the return.");
      return;
    }

    // Ensure a client is selected for the return process
    if (!selectedClient) {
      alert("Please select a client.");
      return;
    }

    // API call to process the return (deduct from client and add to agent)
    const response = await fetch(`${apiBaseUrl}/agent/return-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salesAgentId: salesAgentId,    // Sales agent's ID
        clientId: selectedClient,       // Client's ID
        productId: product.id,         // Product ID
        quantity: returnQuantity,      // Quantity of the return
        reason: returnReason,          // Reason for return
      }),
    });

    // Handle the response from the API
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process the return.");
    }

    alert("Product returned successfully.");
    setShowReturnProductModal(false); // Close or reset the modal
  } catch (error: any) {
    alert(`Error: ${error.message}`);
  }
};


  const filteredAgents = agents.filter((agent:any) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={showReturnProductModal}
      onClose={() => setShowReturnProductModal(false)}
      title={`Return Product: ${product.name}`}
    >
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
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
          {filteredAgents.map((agent:any) => (
            <div
              key={agent.id}
              onClick={() => setSelectedClient(agent.id)}
              className={`p-4 cursor-pointer ${
                selectedClient === agent.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-gray-500">ID: {agent.id}</p>
            </div>
          ))}
        </div>

        {/* Return Quantity */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Quantity to Return
          </label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={returnQuantity}
            onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Return Reason */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Reason for Return
          </label>
          <textarea
            placeholder="Enter return reason"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Return Button */}
        <button
          onClick={handleReturn}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        >
          Process Return
        </button>
      </div>
    </Modal>
  );
};

export default ReturnCustomerProductModal;
