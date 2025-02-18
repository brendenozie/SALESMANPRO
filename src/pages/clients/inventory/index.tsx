import AddProductModal from "@/components/AddProductModal";
import ClientLayout from "@/components/ClientLayout";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
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
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salesAgentId, setSelectedSalesAgentId] = useState<String>("");
  const [inventoryItemId, setSelectedInventoryItemId] = useState<String>("");

  return (
    <ClientLayout>
      <div className="min-h-screen w-full bg-gray-50">
        <UserNav />
        <div className="container mx-auto p-10">
          <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-14 tracking-tight">
            My Inventory
          </h1>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsData.map((product) => (
                <div
                  key={product.clientInventoryId}
                  className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition transform hover:scale-105 shadow-md hover:shadow-xl duration-300"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                    {product.productName}
                  </h3>
                  <p className="text-sm text-gray-600">Quantity: {product.quantityPurchased}</p>
                  <p className="text-sm text-gray-600">Agent: {product.salesAgentName}</p>
                  <div className="flex justify-end mt-2 space-x-3">
                    <button
                      className="px-3 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-blue-600 shadow-md hover:shadow-lg"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddToMarketProductModal(true);
                        setSelectedSalesAgentId(product.salesAgentId);
                        setSelectedInventoryItemId(product.clientInventoryId);
                      }}
                    >
                      Add to My Market List
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg bg-blue-400 text-white font-medium transition-all duration-300 ease-in-out hover:bg-blue-500 shadow-md hover:shadow-lg"
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

          {showRequestCustomerProductModal && (
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

            {showAddToMarketProductModal && (
              <AddToProductMarketModal
                showRequestProductModal={showAddToMarketProductModal}
                setShowRequestProductModal={setShowAddToMarketProductModal}
                product={selectedProduct}
                inventoryItemId={inventoryItemId}
                agentInventoryItemId={salesAgentId}
                quantity={selectedProduct && selectedProduct.quantityPurchased}
                sellerId={"63f7c9e2d91b1b2a5e80b013"}
                salesAgentId={salesAgentId}
                sellerType={"CLIENT"}
              />
            )}

          {showRequestModal && (
            <ProductRequestModal
              showRequestProductModal={showRequestModal}
              setShowRequestProductModal={setShowRequestModal}
              product={selectedProduct}
              clientId={"63f7c9e2d91b1b2a5e80b013"}
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