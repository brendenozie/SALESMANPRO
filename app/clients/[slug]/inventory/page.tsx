'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ClientLayout from '@/components/ClientLayout';
import UserNav from '@/components/UserNav';

const ProductRequestModal = dynamic(() => import('@/components/ProductRequestModal'));
const AddToProductMarketModal = dynamic(() => import('@/components/AddToProductMarketModal'));

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type Product = {
  clientInventoryId: string;
  product: any;
  productId: string;
  productName: string;
  quantityPurchased: number;
  salesAgentId: string;
  salesAgentName: string;
};

interface Props {
  productsData: Product[];
}

const ClientInventoryPage = ({ productsData = [] }: Props) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToMarket = (product: Product) => {
    setSelectedProduct(product);
    setShowAddToMarketModal(true);
  };

  const handleRequestRestock = (product: Product) => {
    setSelectedProduct(product);
    setShowRequestModal(true);
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50">
        <UserNav />

        <div className="container mx-auto px-6 md:px-10 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">
            My Inventory
          </h1>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 md:p-10">
            {productsData.length === 0 ? (
              <p className="text-center text-gray-600 text-lg">No inventory items found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productsData.map((product) => (
                  <div
                    key={product.clientInventoryId}
                    className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                      {product.productName}
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Quantity:</span> {product.quantityPurchased}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Agent:</span> {product.salesAgentName}
                    </p>

                    <div className="flex justify-end mt-2 space-x-3">
                      <button
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all hover:bg-blue-600 shadow-md hover:shadow-lg"
                        onClick={() => handleAddToMarket(product)}
                      >
                        Add to My Market List
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-blue-400 text-white font-medium transition-all hover:bg-blue-500 shadow-md hover:shadow-lg"
                        onClick={() => handleRequestRestock(product)}
                      >
                        Request Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add To Market Modal */}
        {showAddToMarketModal && selectedProduct && (
          <AddToProductMarketModal
            showRequestProductModal={showAddToMarketModal}
            setShowRequestProductModal={setShowAddToMarketModal}
            companyId=""
            categories={[]}
            locations={[]}
            // product={selectedProduct}
            // inventoryItemId={selectedProduct.clientInventoryId}
            // agentInventoryItemId={selectedProduct.salesAgentId}
            // quantity={selectedProduct.quantityPurchased}
            // sellerId="63f7c9e2d91b1b2a5e80b013"
            // salesAgentId={selectedProduct.salesAgentId}
            // sellerType="CLIENT"
          />
        )}

        {/* Product Request Modal */}
        {showRequestModal && selectedProduct && (
          <ProductRequestModal
            showRequestProductModal={showRequestModal}
            setShowRequestProductModal={setShowRequestModal}
            product={selectedProduct}
            inventoryItemId={selectedProduct.clientInventoryId}
            agentInventoryItemId={selectedProduct.salesAgentId}
            clientId="63f7c9e2d91b1b2a5e80b013"
            salesAgentId={selectedProduct.salesAgentId}
          />
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientInventoryPage;
