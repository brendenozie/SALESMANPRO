import { useState, useEffect } from "react";
import UserNav from "../../../../components/UserNav";
import AdminLayout from "../../../../components/UserLayout";
import { ArrowLeftIcon, ArrowRightIcon, Bars3CenterLeftIcon, MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

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
  const [salesAgentId] = useState<string>("63f7c9e2d91b1b2a5e80b016");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
        const response = await fetch(`${url}/agent/clientproductrequests?agentId=${salesAgentId}`);
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

  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const updateRequestStatus = async (requestId: string, newStatus: "APPROVED" | "DECLINED") => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
      await fetch(`${url}/agent/updateRequestStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, status: newStatus }),
      });
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.requestId === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 text-white w-full p-6">
        <UserNav />
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold text-center mb-6">Product Requests</h1>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="relative w-full sm:w-auto">
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-8 h-8" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-80 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Bars3CenterLeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-8 h-8" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
          </div>

          {/* Request List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedRequests.map((request) => (
              <div key={request.requestId} className="p-5 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="text-lg font-medium">{request.productName}</h3>
                  <p className="text-xs text-gray-400">{new Date(request.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === "PENDING" ? "bg-yellow-500 text-black" :
                    request.status === "APPROVED" ? "bg-green-500 text-black" :
                    "bg-red-500 text-black"
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">Agent: {request.salesAgentName}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p className="flex justify-between">
                    <span className="font-medium">Quantity Requested:</span>
                    <span className="font-semibold">{request.quantityRequested}</span>
                  </p>
                </div>
                {/* Update Status Buttons */}
                {request.status === "PENDING" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateRequestStatus(request.requestId, "APPROVED")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.requestId, "DECLINED")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 flex items-center"
              >
                <ArrowLeftIcon className="mr-1 w-8 h-8" /> Previous
              </button>
              <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 flex items-center"
              >
                Next <ArrowRightIcon className="ml-1 w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductRequestsPage;