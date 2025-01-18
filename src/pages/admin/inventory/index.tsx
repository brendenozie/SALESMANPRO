import AddProductModal from "@/components/AddProductModal";
import AdminLayout from "@/components/AdminLayout";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
import UserNav from "@/components/UserNav";
import { useEffect, useState } from "react";

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
  image: string;
  tags: string[];
  status: string;
};

type Tag = {
  id: string;
  name: string;
  image: string;
  status: string;
};

type Agent = {
  id: string;
  name: string;
};

type Props = {
  productsData: Product[];
  categoriesData: Category[];
  agentsData: Agent[];
};

const AdminInventoryPage = ({ productsData = [], agentsData = [], categoriesData = [] }: Props) => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);

  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [stockAmount, setStockAmount] = useState(0);

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold text-center mb-8">Admin Inventory</h1>

          <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Products</h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      {product.name}
                    </h3>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <p className="mb-1">Company Stock: <strong>{product.companyStock}</strong></p>
                    <p className="mb-1">Agent Stock: <strong>{product.agentStock}</strong></p>
                    <p className="mb-1">Sales: <strong>{product.sales}</strong></p>
                  </div>

                  <div className="flex flex-row justify-evenly">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditProductModal(true);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowReturnProductModal(true);
                      }}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
                    >
                      Return
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRestockProductModal(true);
                      }}
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                    >
                      Add Stock
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAssignProductModal(true);
                      }}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                    >
                      Assign Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showAddProductModal && (
            <AddProductModal
              showAddProductModal={showAddProductModal}
              setShowAddProductModal={setShowAddProductModal}
              categories={categoriesData}
            />
          )}

          {showEditProductModal && selectedProduct && (
            <AddProductModal
              showAddProductModal={showEditProductModal}
              setShowAddProductModal={setShowEditProductModal}
              categories={categoriesData}
              product={selectedProduct} // Pass the selected product for editing
            />
          )}
          {showRestockProductModal && selectedProduct && (
            <RestockProductModal
              showRestockProductModal={showRestockProductModal}
              setShowRestockProductModal={setShowRestockProductModal}
              product={selectedProduct}
            />
          )}

          {showAssignProductModal && selectedProduct && (
            <AssignProductModal
              showAssignProductModal={showAssignProductModal}
              setShowAssignProductModal={setShowAssignProductModal}
              product={selectedProduct}
              agents={agentsData}
            />
          )}

          {showReturnProductModal && selectedProduct && (
            <ReturnProductModal
              showReturnProductModal={showReturnProductModal}
              setShowReturnProductModal={setShowReturnProductModal}
              product={selectedProduct}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPage;

export const getServerSideProps = async () => {
  let productsData: Product[] = [];
  let categoriesData: Category[] = [];

  try {
    const productsResponse = await fetch(`${apiUrl}/admin/getAllProducts`);

    if (productsResponse.ok) {
      productsData = await productsResponse.json();
    }

    const categoriesResponse = await fetch(`${apiUrl}/admin/get-all-categories`);

    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      categoriesData = categories.results;
    }

    if (!Array.isArray(productsData)) {
      throw new Error("Products API response is not an array.");
    }
  } catch (error: any) {
    console.error("Error fetching data:", error.message);
  }

  return { props: { productsData, categoriesData } };
};
