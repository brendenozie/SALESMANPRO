import AddProductModal from "@/components/AddProductModal";
import ClientLayout from "@/components/ClientLayout";
import ProductRequestModal from "@/components/ProductRequestModal";
import UserNav from "@/components/UserNav";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Product = {
  clientInventoryId: string;
  productId: string;
  productName: string;
  quantityPurchased: number;
  salesAgentId: string;
  salesAgentName: string;
};

type Props = {
  productsData: Product[];
};

const ClientInventoryPage = ({ productsData = [] }: Props) => {
  
   const [showRequestCustomerProductModal, setShowRequestCustomerAssignProductModal] = useState(false);    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [salesAgentId, setSelectedSalesAgentId] = useState<String>("");
    const [inventoryItemId, setSelectedInventoryItemId] = useState<String>("");
  

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen w-full">
        <UserNav />
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">My Inventory</h1>

          <div className="bg-white text-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Products</h2>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.map((product) => (
                <div
                  key={product.clientInventoryId}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800 hover:text-gray-600 transition duration-300">
                      {product.productName}
                    </h3>
                  </div>

                  <div className="space-y-2 text-gray-600 mb-4">
                    <p className="text-sm">
                      Quantity Purchased:{" "}
                      <strong className="font-semibold">{product.quantityPurchased}</strong>
                    </p>
                    <p className="text-sm">
                      Sales Agent:{" "}
                      <strong className="font-semibold">{product.salesAgentName}</strong>
                    </p>
                  </div>

                    {/* Edit/Delete Buttons */}
                    <div className=" flex justify-end mt-2 space-x-2">
                      
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-700"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRequestCustomerAssignProductModal(true);
                          setSelectedSalesAgentId(product.salesAgentId);
                          setSelectedInventoryItemId(product.clientInventoryId);
                        }}
                      >
                        Request Restock 
                      </button>
                    </div>
                </div>
              ))}
            </div>
          </div>

           {/* Assign Product TO Agent Modal Component && selectedProduct */}
                {showRequestCustomerProductModal  && (
                  <ProductRequestModal
                    showRequestProductModal={showRequestCustomerProductModal}
                    setShowRequestProductModal={setShowRequestCustomerAssignProductModal}
                    product={selectedProduct}
                    inventoryItemId={inventoryItemId}
                    agentInventoryItemId={salesAgentId}
                    clientId={"63f7c9e2d91b1b2a5e80b013"}
                    salesAgentId={salesAgentId}
                  />
                )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientInventoryPage;

export const getServerSideProps = async ({ query }: { query: { clientId?: string } }) => {
  // const { clientId } = query;

  const clientId = "63f7c9e2d91b1b2a5e80b013";

  let productsData: Product[] = [];

  try {
    if (!clientId) {
      throw new Error("Missing clientId");
    }

    const response = await fetch(`${apiUrl}/clients/inventory?clientId=${clientId}`);
    let ordersData : any;
    if (response.ok) {
      ordersData = await response.json();
    } else {
      throw new Error("Failed to fetch client inventory data.");
    }

    productsData = ordersData.inventory;

    if (!Array.isArray(ordersData)) {
      throw new Error("Client inventory API response is not an array.");
    }
  } catch (error: any) {
    console.error("Error fetching client inventory:", error.message);
  }

  console.log(productsData);

  return { props: { productsData } };
};
