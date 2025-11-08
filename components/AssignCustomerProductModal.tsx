import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const AssignCustomerProductModal = ({
  showAssignProductModal,
  setShowAssignProductModal,
  product,
  agentInventoryItemId,
  inventoryItemId,
  salesAgents,
}: any) => {
  const [salesAgentId, setSalesAgentId] = useState("63f7c9e2d91b1b2a5e80b016");
  const [selectedClient, setSelectedClient] = useState("");
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(0);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!salesAgentId) {
          throw new Error("Sales agent ID is required.");
        }
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

  const handleAssign = async () => {
    try {
      if (!salesAgentId) {
        alert("Please select a sales agent.");
        return;
      }
      if (assignQuantity <= 0) {
        alert("Quantity to assign must be greater than 0.");
        return;
      }
      if (!selectedClient) {
        alert("Please select a client.");
        return;
      }

      const response = await fetch(`${apiBaseUrl}/agent/assign-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentInventoryId: agentInventoryItemId,
          clientId: selectedClient,
          quantity: assignQuantity,
          inventoryItemId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign product.");
      }

      alert("Product assigned successfully.");
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
    <Modal
      isOpen={showAssignProductModal}
      onClose={() => setShowAssignProductModal(false)}
      title={`Assign Product: ${product.name}`}
    >
      <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg text-gray-900">
        {/* Search Bar */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Search Clients</label>
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Client List */}
        <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
          {filteredAgents.map((client: any) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className={`p-4 flex items-center justify-between cursor-pointer ${
                selectedClient === client.id ? "bg-blue-100 border-l-4 border-blue-500" : "hover:bg-gray-100"
              }`}
            >
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">ID: {client.id}</p>
              </div>
              {selectedClient === client.id && <span className="text-blue-500 font-semibold">Selected</span>}
            </div>
          ))}
        </div>

        {/* Assigned Quantity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Quantity to Assign</label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={assignQuantity}
            onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Assign Button */}
        <button
          onClick={handleAssign}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Assign Product
        </button>
      </div>
    </Modal>
  );
};

export default AssignCustomerProductModal;
