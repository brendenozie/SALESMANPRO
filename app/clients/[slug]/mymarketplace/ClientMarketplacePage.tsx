'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ClientLayout from '@/components/ClientLayout';
import UserNav from '@/components/UserNav';
import { MarketplaceProduct } from './page';

// Dynamically load modals to reduce bundle size
const ProductRequestModal = dynamic(() => import('@/components/ProductRequestModal'));
const AddToProductMarketModal = dynamic(() => import('@/components/AddToProductMarketModal'));

interface Props {
  productsData: MarketplaceProduct[];
}

const ClientMarketplacePage = ({ productsData = [] }: Props) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);

  const handleEditProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleRemoveProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setShowRemoveModal(true);
  };

  return (
    <ClientLayout>
      <div className="min-h-screen w-full bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-6 md:px-10 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-14 tracking-tight">
            My Marketplace
          </h1>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">Products</h2>

            {productsData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-xl">No products available in your marketplace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productsData.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 shadow-md hover:shadow-xl"
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Description:</span> {product.description}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Quantity:</span> {product.quantity}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Buying Price:</span> ${product.buyingPrice}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Selling Price:</span> ${product.sellingPrice}
                    </p>

                    <div className="flex justify-end mt-2 space-x-3">
                      <button
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all hover:bg-blue-600 shadow-md hover:shadow-lg"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit Product
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium transition-all hover:bg-red-600 shadow-md hover:shadow-lg"
                        onClick={() => handleRemoveProduct(product)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Product Modal */}
          {showEditModal && selectedProduct && (
            <AddToProductMarketModal
              showRequestProductModal={showEditModal}
              setShowRequestProductModal={setShowEditModal}
              companyId=""
              categories={[]}
              locations={[]}
              // product={selectedProduct}
              // sellerId={selectedProduct.sellerId}
              // sellerType={selectedProduct.sellerType}
            />
          )}

          {/* Remove Product Modal */}
          {showRemoveModal && selectedProduct && (
            <ProductRequestModal
              showRequestProductModal={showRemoveModal}
              setShowRequestProductModal={setShowRemoveModal}
              product={selectedProduct}
            />
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientMarketplacePage;
