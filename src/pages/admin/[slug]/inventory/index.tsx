import AddProductModal from "@/components/AddProductModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import AdminLayout from "@/components/AdminLayout";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
import UserNav from "@/components/UserNav";
import { useRouter } from "next/router";
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
  costPrice: number;
  salesPrice: number;
  commissionRate: number;
  commissionType: number;
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

  const router = useRouter();
  const { slug: companyId } = router.query as { slug?: string };
  
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [stockAmount, setStockAmount] = useState(0);

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen w-full">
        <UserNav />
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Admin Inventory</h1>

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
                    className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-gray-800 hover:text-gray-600 transition duration-300">
                        {product.name}
                      </h3>
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full uppercase font-medium tracking-wide">
                        {product.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-gray-600 mb-4">
                      <p className="text-sm">Company Stock: <strong className="font-semibold">{product.companyStock}</strong></p>
                      <p className="text-sm">Agent Stock: <strong className="font-semibold">{product.agentStock}</strong></p>
                      <p className="text-sm">Sales: <strong className="font-semibold">{product.sales}</strong></p>
                      <p className="text-sm">Commission Type: <strong className="font-semibold">{product.commissionType}</strong></p>
                      <p className="text-sm">Commission Rate: <strong className="font-semibold">{product.commissionRate}</strong></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditProductModal(true);
                        }}
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 transform hover:scale-105"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowReturnProductModal(true);
                        }}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-300 transform hover:scale-105"
                      >
                        Return
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRestockProductModal(true);
                        }}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300 transform hover:scale-105"
                      >
                        Add 
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowAssignProductModal(true);
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                      >
                        Assign 
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowAddToMarketProductModal(true);
                        }}
                        className="bg-orange-500 col-span-2 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-600 transition duration-300 transform hover:scale-105"
                      >
                        Add to Market List 
                      </button>
                    </div>
                  </div>

              ))}
            </div>
          </div>

          {showAddProductModal && (
            <AddProductModal
              showRequestProductModal={showAddProductModal}
              setShowRequestProductModal={setShowAddProductModal}
              companyId={companyId}
              categories={categoriesData}
            />
          )}

          {showEditProductModal && selectedProduct && (
            <AddProductModal
              showRequestProductModal={showEditProductModal}
              setShowRequestProductModal={setShowEditProductModal}
              categories={categoriesData}
              companyId={companyId}
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
              companyId={companyId}
              agents={agentsData}
            />
          )}

          {showReturnProductModal && selectedProduct && (
            <ReturnProductModal
              showReturnProductModal={showReturnProductModal}
              setShowReturnProductModal={setShowReturnProductModal}
              product={selectedProduct}
              companyId={companyId}
            />
          )}

          {showAddToMarketProductModal && (
              <AddToProductMarketModal
                showRequestProductModal={showAddToMarketProductModal}
                setShowRequestProductModal={setShowAddToMarketProductModal}
                categories={categoriesData}
                product={selectedProduct}
                inventoryItemId={selectedAgent?.id}
                agentInventoryItemId={selectedAgent?.id}
                quantity={stockAmount}
                sellerId={"63f7c9e2d91b1b2a5e80b013"}
                companyId={companyId}
                salesAgentId={selectedAgent}
                sellerType={"ADMIN"}
              />
            )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPage;

export const getServerSideProps = async ({ params }:any) => {

  const companyId = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  
  let productsData: Product[] = [];
  let categoriesData: Category[] = [];

  try {
    const productsResponse = await fetch(`${apiUrl}/admin/getAllProducts?companyId=${companyId}`);

    if (productsResponse.ok) {
      productsData = await productsResponse.json();
    }
    
    const categoriesResponse = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${companyId}`);

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
