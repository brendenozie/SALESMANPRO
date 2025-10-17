"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/AdminNav";
import AssignCustomerProductModal from "@/components/AssignCustomerProductModal";
import ReturnCustomerProductModal from "@/components/ReturnCustomerProductModal";
import AgentProductRequestModal from "@/components/AgentProductRequestModal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Product = {
  id: string;
  name: string;
  companyId: string;
  inventoryId: string;
  category: string;
  agentStock: number;
  companyStock: number;
  sales: number;
  image?: string;
};

type Inventory = {
  agentInventoryId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  product: Product;
  totalAssignedStock: number;
  totalSold: number;
  remainingStock: number;
};

type Props = {
  inventoryData: Inventory[];
};

export default function ProductsContent({ inventoryData }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inventoryItemId, setInventoryItemId] = useState<string>("");
  const [agentInventoryId, setAgentInventoryId] = useState<string>("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const salesAgentId = "63f7c9e2d91b1b2a5e80b016";
  const itemsPerPage = 6;

  // Filtered + Paginated Inventory
  const filteredInventory = inventoryData.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const paginated = filteredInventory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Charts
  const sorted = [...inventoryData].sort((a, b) => b.totalSold - a.totalSold);
  const topProducts = sorted.slice(0, 5);
  const lowProducts = sorted.slice(-5);

  const chartData = {
    labels: topProducts.map((p) => p.productName),
    datasets: [
      {
        label: "Sales",
        data: topProducts.map((p) => p.totalSold),
        backgroundColor: "#4F46E5",
        borderColor: "#3730A3",
        borderWidth: 1,
      },
    ],
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <UserNav />

        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-indigo-400">Products & Inventory</h1>

          {/* Search & Button */}
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full max-w-md p-3 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
              onClick={() => setShowRequestModal(true)}
            >
              Request Product
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="Total Inventory" value={inventoryData.length} color="bg-indigo-600" />
            <SummaryCard title="Top Product Sales" value={topProducts[0]?.totalSold || 0} color="bg-green-600" />
            <SummaryCard title="Lowest Product Sales" value={lowProducts[0]?.totalSold || 0} color="bg-red-600" />
          </div>

          {/* Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-10">
            <h2 className="text-xl font-semibold mb-4 text-indigo-300">Top 5 Products by Sales</h2>
            <div className="h-[300px]">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" as const } },
                  scales: {
                    x: { ticks: { color: "#ddd" }, grid: { display: false } },
                    y: { ticks: { color: "#aaa" }, grid: { color: "#444" } },
                  },
                }}
              />
            </div>
          </div>

          {/* Inventory Grid */}
          <h2 className="text-2xl font-bold text-indigo-300 mb-4">Inventory List</h2>
          {paginated.length === 0 ? (
            <div className="text-center text-gray-400 py-16">No inventory found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((item) => (
                <motion.div
                  key={item.inventoryItemId}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition"
                >
                  <h3 className="text-lg font-semibold text-indigo-300 mb-1">{item.productName}</h3>
                  <p className="text-sm text-gray-300">Assigned: {item.totalAssignedStock}</p>
                  <p className="text-sm text-gray-300">Sold: {item.totalSold}</p>
                  <p className="text-sm text-gray-300">Remaining: {item.remainingStock}</p>

                  <div className="flex justify-end mt-3 space-x-2">
                    <ActionButton
                      label="Request Restock"
                      color="bg-blue-600"
                      onClick={() => {
                        setSelectedProduct(item.product);
                        setInventoryItemId(item.inventoryItemId);
                        setShowRequestModal(true);
                      }}
                    />
                    <ActionButton
                      label="Customer Return"
                      color="bg-green-600"
                      onClick={() => {
                        setSelectedProduct(item.product);
                        setAgentInventoryId(item.inventoryItemId);
                        setInventoryItemId(item.inventoryItemId);
                        setShowReturnModal(true);
                      }}
                    />
                    <ActionButton
                      label="Customer Assign"
                      color="bg-purple-600"
                      onClick={() => {
                        setSelectedProduct(item.product);
                        setAgentInventoryId(item.agentInventoryId);
                        setInventoryItemId(item.inventoryItemId);
                        setShowAssignModal(true);
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-10 space-x-3">
            <PaginationButton
              label="Prev"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            />
            <span className="text-gray-400 pt-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <PaginationButton
              label="Next"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>

        {/* Modals */}
        {showRequestModal && (
          <AgentProductRequestModal
            showRequestProductModal={showRequestModal}
            setShowRequestProductModal={setShowRequestModal}
            product={selectedProduct}
            inventoryItemId={inventoryItemId}
            agentInventoryItemId={salesAgentId}
            clientId=""
            salesAgentId={salesAgentId}
          />
        )}

        {showAssignModal && (
          <AssignCustomerProductModal
            showAssignProductModal={showAssignModal}
            setShowAssignProductModal={setShowAssignModal}
            product={selectedProduct}
            inventoryItemId={inventoryItemId}
            agentInventoryItemId={agentInventoryId}
          />
        )}

        {showReturnModal && (
          <ReturnCustomerProductModal
            showReturnProductModal={showReturnModal}
            setShowReturnProductModal={setShowReturnModal}
            product={selectedProduct}
            inventoryItemId={inventoryItemId}
            agentInventoryItemId={agentInventoryId}
          />
        )}
      </div>
    </UserLayout>
  );
}

const SummaryCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <div className={`${color} p-4 rounded-lg shadow-lg`}>
    <h2 className="text-lg font-bold">{title}</h2>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

const ActionButton = ({ label, color, onClick }: { label: string; color: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${color} text-white px-3 py-1 rounded shadow hover:brightness-110 transition`}
  >
    {label}
  </button>
);

const PaginationButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
  >
    {label}
  </button>
);
