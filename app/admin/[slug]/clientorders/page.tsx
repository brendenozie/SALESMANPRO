import { useState, useEffect } from "react";
import UserNav from "../../../../components/UserNav";
import AdminLayout from "../../../../components/AdminLayout";

interface ProductRequest {
  requestId: string;
  productId: string;
  productName: string;
  quantityRequested: number;
  salesAgentId: string | null;
  salesAgentName: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  requestedAt: string;
}

const ProductRequestsPage = () => {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "PENDING" | "APPROVED" | "DECLINED">("all");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const response = await fetch(`${url}/admin/clientproductrequests`);
        const data = await response.json();
        setRequests(data.requests);
      } catch (error) {
        console.error("Error fetching product requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto p-6">
          <h1 className="text-4xl font-bold text-center mb-8">Product Requests</h1>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-gray-800"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-gray-800"
            >
              <option value="all">All Requests</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>

          {/* Request List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedRequests.map((request) => (
              <div
                key={request.requestId}
                className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300"
              >
                {/* Header Section */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{request.productName}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status and Agent */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : request.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {request.status.toUpperCase()}
                  </span>
                  <span className="text-gray-600 text-sm">Agent: {request.salesAgentName}</span>
                </div>

                {/* Request Details */}
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium">Quantity Requested:</span>
                    <span className="font-semibold">{request.quantityRequested}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductRequestsPage;
