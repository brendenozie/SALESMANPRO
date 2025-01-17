import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";

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
  const [salesPrice, setSalesPrice] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!salesAgentId) {
          throw new Error("Sales agent ID is required.");
        }

        // Fetch customers for the specific agent
        const response = await fetch(`${apiUrl}/agent/getAllCustomers?id=${salesAgentId}`);
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
      // Check if a sales agent is selected
      if (!salesAgentId) {
        alert("Please select a sales agent.");
        return;
      }

      // Check if the quantity to assign is greater than 0
      if (assignQuantity <= 0) {
        alert("Quantity to assign must be greater than 0.");
        return;
      }

      // Ensure a client is selected (you should have a client selected)
      if (!selectedClient) {
        alert("Please select a client.");
        return;
      }

      // API call to assign the product to the client
      const response = await fetch(`${apiUrl}/agent/assign-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentInventoryId:agentInventoryItemId, // Agent Inventory Item ID (as per the updated API)
          clientId: selectedClient, // Client's ID
          quantity: assignQuantity, // Quantity to assign
          inventoryItemId, // Inventory Item ID
          salesPrice, // Optional sales price (if provided)
        }),
      });

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign product.");
      }

      alert("Product assigned successfully.");
      setShowAssignProductModal(false); // Close the modal or reset the state
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

        {/* Client List */}
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredAgents.map((client: any) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client.id)} // Change selected sales client
              className={`p-4 cursor-pointer ${
                selectedClient === client.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-500">ID: {client.id}</p>
            </div>
          ))}
        </div>

        {/* Assigned Quantity */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Quantity to Assign
          </label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={assignQuantity}
            onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sales Price */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Sales Price (Optional)</label>
          <input
            type="number"
            placeholder="Enter sales price"
            value={salesPrice ?? ""}
            onChange={(e) => setSalesPrice(parseFloat(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Assign Button */}
        <button
          onClick={handleAssign}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Assign Product
        </button>
      </div>
    </Modal>
  );
};

export default AssignCustomerProductModal;
