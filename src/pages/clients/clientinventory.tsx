import { useState, useEffect } from "react";

type InventoryItem = {
  productId: string;
  name: string;
  description: string | null;
  quantity: number;
};

type RequestStatus = {
  productId: string;
  name: string;
  quantity: number;
  status: string;
};

export default function CustomerInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<RequestStatus[]>([]);
  const [productRequest, setProductRequest] = useState({
    productId: "",
    quantity: 1,
  });

  const customerId = "customer-id-placeholder"; // Replace with actual customer ID
  const salesAgentId = "sales-agent-id-placeholder"; // Replace with actual sales agent ID

  useEffect(() => {
    async function fetchInventory() {
      const response = await fetch(`/api/customer/inventory?customerId=${customerId}`);
      const data = await response.json();
      setInventory(data);
    }

    async function fetchRequests() {
      const response = await fetch(`/api/customer/requests?customerId=${customerId}`);
      const data = await response.json();
      setRequests(data);
    }

    fetchInventory();
    fetchRequests();
  }, []);

  const handleRequestSubmit = async () => {
    const response = await fetch("/api/customer/request-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: productRequest.productId,
        quantity: productRequest.quantity,
        customerId,
        salesAgentId,
      }),
    });

    if (response.ok) {
      alert("Product requested successfully!");
    } else {
      alert("Failed to request product.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Inventory</h1>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Your Inventory</h2>
        {inventory.length === 0 ? (
          <p>No products in your inventory.</p>
        ) : (
          <ul>
            {inventory.map((item) => (
              <li key={item.productId} className="border-b py-2">
                <strong>{item.name}</strong>: {item.quantity} units
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Request a Product</h2>
        <select
          value={productRequest.productId}
          onChange={(e) =>
            setProductRequest((prev) => ({ ...prev, productId: e.target.value }))
          }
          className="border p-2 mb-2"
        >
          <option value="">Select a Product</option>
          {inventory.map((item) => (
            <option key={item.productId} value={item.productId}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={productRequest.quantity}
          onChange={(e) =>
            setProductRequest((prev) => ({ ...prev, quantity: Number(e.target.value) }))
          }
          className="border p-2 mb-2"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleRequestSubmit}
        >
          Submit Request
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Your Requests</h2>
        {requests.length === 0 ? (
          <p>No product requests made.</p>
        ) : (
          <ul>
            {requests.map((request) => (
              <li key={request.productId} className="border-b py-2">
                <strong>{request.name}</strong>: {request.quantity} units (
                {request.status})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
