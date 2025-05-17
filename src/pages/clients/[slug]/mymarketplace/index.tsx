import AddProductModal from "@/components/AddProductModal";
import ClientLayout from "@/components/ClientLayout";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import UserNav from "@/components/UserNav";
import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type MarketplaceProduct = {
  _id: string;
  sellerId: string;
  sellerType: string;
  productId: string;
  title: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  salesPrice: number;
  discount: number;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;
  buyingPrice: number;
  sellingPrice: number;
};

type Props = {
  productsData: MarketplaceProduct[];
};

const ClientInventoryPage = ({ productsData = [] }: Props) => {
  const [showRequestCustomerProductModal, setShowRequestCustomerAssignProductModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  return (
    <ClientLayout>
      <div className="min-h-screen w-full bg-gray-50">
        <UserNav />
        <div className="container mx-auto p-10">
          <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-14 tracking-tight">
            My Market Place
          </h1>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {productsData.map((product) => (
                <div
                  key={product._id}
                  className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition transform hover:scale-105 shadow-md hover:shadow-xl duration-300"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600">Description: {product.description}</p>
                  <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-600">Buying Price: ${product.buyingPrice}</p>
                  <p className="text-sm text-gray-600">Selling Price: ${product.sellingPrice}</p>
                  <div className="flex justify-end mt-2 space-x-3">
                    <button
                      className="px-3 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-blue-600 shadow-md hover:shadow-lg"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowAddToMarketProductModal(true);
                      }}
                    >
                      Edit Product
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg bg-red-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-red-600 shadow-md hover:shadow-lg"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowRequestCustomerAssignProductModal(true);
                      }}
                    >
                      Remove Product
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {productsData.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500 text-xl">No products available in the marketplace.</p>
              </div>
            )}
          </div>

          {showRequestCustomerProductModal && (
            <ProductRequestModal
              showRequestProductModal={showRequestCustomerProductModal}
              setShowRequestProductModal={setShowRequestCustomerAssignProductModal}
              product={selectedProduct}
            />
          )}

          {showAddToMarketProductModal && (
            <AddToProductMarketModal
              showRequestProductModal={showAddToMarketProductModal}
              setShowRequestProductModal={setShowAddToMarketProductModal} 
              product={undefined} sellerId={""} sellerType={""}              
              marketListItem={selectedProduct}
            />
          )}

          {showRequestModal && (
            <ProductRequestModal
              showRequestProductModal={showRequestModal}
              setShowRequestProductModal={setShowRequestModal}
              product={selectedProduct}
            />
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientInventoryPage;

export const getServerSideProps = async () => {
  const clientId = "63f7c9e2d91b1b2a5e80b007";

  let productsData: MarketplaceProduct[] = [];

  try {
    const response = await fetch(`${apiUrl}/clients/my-market-place?sellerId=${clientId}`);
    if (response.ok) {
      const data = await response.json();
      productsData = data.products;
      console.log(productsData);
    } else {
      throw new Error("Failed to fetch marketplace products.");
    }
  } catch (error) {
    console.error("Error fetching marketplace products:", error);
  }

  return { props: { productsData } };
};
