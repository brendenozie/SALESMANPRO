import { useState } from "react";
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

type Inventory = {
  agentInventoryId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  product:Product;
  totalAssignedStock: number;
  totalSold: number;
  remainingStock: number;
};


 const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Product = {
  id: string;
  name: string;
  companyId: string;
  inventoryId: string;
  category: string;
  agentStock: number;
  companyStock: number;
  sales: number;
};

type Category = {
  id: string;
  name: string;
  image :   String;
  tags: String[];
  status  : String;
};

type Tags = {
  id: string;
  name: string;
  image :   String;
  status  : String;
};

type Agent = {
  id: string;
  name: string;
};

type Props = {
  productsData: Product[];
  categoriesData: Category[];
  agentsData: Agent[];
  inventoryData: Inventory[];
};

const ProductsPage = ({ inventoryData }: Props) => {

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignCustomerProductModal, setShowCustomerAssignProductModal] = useState(false);
  const [showReturnCustomerProductModal, setShowCustomerReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [agentInventoryId, setSelectedAgentInventoryId] = useState<String>("");
  const [inventoryItemId, setSelectedInventoryItemId] = useState<String>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [stockAmount, setStockAmount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showRequestCustomerProductModal, setShowRequestCustomerAssignProductModal] = useState(false);    
      // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
      const [salesAgentId, setSelectedSalesAgentId] = useState<String>("63f7c9e2d91b1b2a5e80b016");
      // const [inventoryItemId, setSelectedInventoryItemId] = useState<String>("");
    
  

  // Filtered Inventory
  const filteredInventory = Array.isArray(inventoryData)
    ? inventoryData.filter((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Paginated Inventory
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedInventory = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  // Top and Low Performing Products
  const sortedBySales = [...inventoryData].sort((a, b) => b.totalSold - a.totalSold);
  const topProducts = sortedBySales.slice(0, 5);
  const lowProducts = sortedBySales.slice(-5);

  // Chart Data for Top Products
  const chartData = {
    labels: topProducts.map((item) => item.productName),
    datasets: [
      {
        label: "Sales",
        data: topProducts.map((item) => item.totalSold),
        backgroundColor: "#4CAF50",
        borderColor: "#388E3C",
        borderWidth: 1,
      },
    ],
  };

  const handleDelete = (id: string) => {
    alert(`Inventory item with Product ID ${id} deleted.`);
  };

  const handleEdit = (id: string) => {
    alert(`Editing inventory item with Product ID ${id}.`);
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen w-full">
        <UserNav />
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Products and Inventory</h1>

            {/* Search Bar and Add Button */}
            <div className="mb-6 flex justify-between items-center">
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-3 rounded-lg w-full max-w-lg shadow"
              />
              <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700">
                Request Product
              </button>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-indigo-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Inventory Items</h2>
                <p className="text-2xl font-semibold">{inventoryData.length}</p>
              </div>
              <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Top Product Sales</h2>
                <p className="text-2xl font-semibold">{topProducts[0]?.totalSold || 0}</p>
              </div>
              <div className="bg-red-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Lowest Product Sales</h2>
                <p className="text-2xl font-semibold">{lowProducts[0]?.totalSold || 0}</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Top 5 Products by Sales</h2>
              <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
            </div>

            {/* Paginated Products Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Inventory List</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedInventory.map((item) => (
                  <div key={item.productId} className="bg-white p-4 rounded-lg shadow relative">
                    <h3 className="text-lg font-bold">{item.productName}</h3>
                    <p className="text-sm text-gray-700">Assigned Stock: {item.totalAssignedStock}</p>
                    <p className="text-sm text-gray-700">Sold: {item.totalSold}</p>
                    <p className="text-sm text-gray-700">Remaining: {item.remainingStock}</p>
                  <div className=" flex justify-end mt-2 space-x-2">
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                        onClick={() => {
                          setSelectedProduct(item.product);
                          setShowRequestCustomerAssignProductModal(true);
                          setSelectedInventoryItemId(item.inventoryItemId);
                        }}
                      >
                        Request Restock 
                      </button>
                    {/* Edit/Delete Buttons */}                    
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                        onClick={() => {
                          setSelectedProduct(item.product);
                          setShowCustomerReturnProductModal(true);
                          setSelectedAgentInventoryId(item.inventoryItemId);
                          setSelectedInventoryItemId(item.inventoryItemId);
                        }}
                      >
                        Customer Return 
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded shadow hover:bg-red-700"
                        onClick={() => {
                          setSelectedProduct(item.product);                       
                          setShowCustomerAssignProductModal(true);                          
                          setSelectedAgentInventoryId(item.agentInventoryId);
                          setSelectedInventoryItemId(item.inventoryItemId);
                        }}
                      >
                        Customer Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

         {/* Assign Product TO Agent Modal Component && selectedProduct */}
                {showRequestCustomerProductModal  && (
                  <AgentProductRequestModal
                    showRequestProductModal={showRequestCustomerProductModal}
                    setShowRequestProductModal={setShowRequestCustomerAssignProductModal}
                    product={selectedProduct}
                    inventoryItemId={inventoryItemId}
                    agentInventoryItemId={salesAgentId}
                    clientId={""}
                    salesAgentId={salesAgentId}
                  />
                )}
                
                {/* Assign Product TO Agent Modal Component && selectedProduct */}
                {showAssignCustomerProductModal  && (
                  <AssignCustomerProductModal
                    showAssignProductModal={showAssignCustomerProductModal}
                    setShowAssignProductModal={setShowCustomerAssignProductModal}
                    product={selectedProduct}
                    inventoryItemId={inventoryItemId}
                    agentInventoryItemId={agentInventoryId}
                  />
                )}

                {/* Return Product Modal Component && selectedProduct*/}
                {showReturnCustomerProductModal   && (
                  <ReturnCustomerProductModal
                    showReturnProductModal={showReturnCustomerProductModal}
                    setShowReturnProductModal={setShowCustomerReturnProductModal}
                    product={selectedProduct}                    
                    inventoryItemId={inventoryItemId}
                    agentInventoryItemId={agentInventoryId}
                  />
                )}
      </div>
    </UserLayout>
  );
};

export default ProductsPage;

export const getServerSideProps = async (context: any) => {

  const salesAgentId  = "63f7c9e2d91b1b2a5e80b016";//context.query; // Extract salesAgentId from query

  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  let inventoryData: Inventory[] = [];

  if (!salesAgentId) {
    return {
      props: { inventoryData: [] },
    };
  }

  try {
    const response = await fetch(`${url}/agent/inventory?salesAgentId=${salesAgentId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.statusText}`);
    }
    const data = await response.json();

    console.log(data.product);

    inventoryData = data.inventory || [];
  } catch (error: any) {
    console.error("Error fetching inventory:", error.message);
  }

  return { props: { inventoryData } };
};
