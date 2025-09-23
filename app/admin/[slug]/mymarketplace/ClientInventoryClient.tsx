"use client";

import React, { useState } from "react";
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { IStoreCategory, MarketListingForm } from "@/types/typings";

// type Category = {
//   id: string;
//   name: string;
//   image: string;
//   tags: string[];
//   status: string;
// };

interface ClientProps {
  companyId: string;
  productsData: MarketListingForm[];
  categoriesData: IStoreCategory[];
}

export default function ClientInventoryClient({ companyId, categoriesData, productsData }: ClientProps) {
  const [showRemoveProductModal, setShowRemoveProductModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false); // Consider if this modal is still needed or can be consolidated
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketListingForm | null>(null);

  const handleEditProductClick = (product: MarketListingForm) => {
    setSelectedProduct(product);
    setShowAddToMarketModal(true);
  };

  const handleRemoveProductClick = (product: MarketListingForm) => {
    setSelectedProduct(product);
    setShowRemoveProductModal(true);
  };

  const handleAddProductClick = () => {
    setSelectedProduct(null); // Clear selected product for new addition
    setShowAddToMarketModal(true);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 sm:p-10">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-sm">
          Your Market Place 🛍️
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your product listings, add new items, and keep your inventory up-to-date.
        </p>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-sm bg-opacity-95">

        {/* Products Header and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Your Products</h2>
          <button
            onClick={handleAddProductClick}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productsData && productsData.length > 0 ? (
            productsData.map((product, index) => (
              <div
                key={product.id || index} // Use _id if available, fallback to index
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 duration-300 relative overflow-hidden"
              >
                {/* Product Status Badges (Example - add logic based on your data) */}
                {product.isNewArrival && (
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">New!</span>
                )}
                {product.isOnOffer && (
                  <span className="absolute top-3 left-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">On Offer</span>
                )}


                <h3 className="text-2xl font-extrabold text-gray-900 mb-2 leading-snug">
                  {product.name || "Untitled Product"}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2" >
                  {product.description || "No description provided."}
                </p>

                <div className="space-y-1 mb-5">
                  <p className="text-md text-gray-700 font-medium">
                    Quantity: <span className="font-bold text-gray-900">{product.quantity}</span>
                  </p>
                  <p className="text-md text-gray-700 font-medium">
                    Buying Price: <span className="font-bold text-green-600">${product.buyingPrice.toFixed(2)}</span>
                  </p>
                  <p className="text-md text-gray-700 font-medium">
                    Selling Price: <span className="font-bold text-blue-600">${product.sellingPrice.toFixed(2)}</span>
                  </p>
                  {product.discount && product.discount > 0 && (
                     <p className="text-md text-gray-700 font-medium">
                        Discount: <span className="font-bold text-red-500">{product.discount}%</span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEditProductClick(product)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium text-sm transition-all duration-300 ease-in-out hover:bg-indigo-600 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.65 7.65A2 2 0 019.172 15L6 15v-3.172a2 2 0 01.586-1.414l7.65-7.65zM11 2a1 1 0 00-1 1v1a1 1 0 102 0V3a1 1 0 00-1-1z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={() => handleRemoveProductClick(product)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm transition-all duration-300 ease-in-out hover:bg-red-600 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full text-center py-20 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-2xl font-semibold text-gray-600 mb-3">No Products Yet!</p>
              <p className="text-lg text-gray-500 mb-6 max-w-md">
                It looks like your marketplace is empty. Let's add your first product!
              </p>
              <button
                onClick={handleAddProductClick}
                className="flex items-center gap-2 px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRemoveProductModal && selectedProduct && (
        <ProductRequestModal
          showRequestProductModal={showRemoveProductModal}
          setShowRequestProductModal={setShowRemoveProductModal}
          product={selectedProduct}
        />
      )}

      {showAddToMarketModal && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketModal}
          setShowRequestProductModal={setShowAddToMarketModal}
          product={null} // Product prop for AddToProductMarketModal might be redundant if marketListItem serves the purpose
          marketListItem={selectedProduct} // Pass selectedProduct for edit, null for new
          categories={categoriesData}
          companyId={companyId}
          locations={[]}
        />
      )}

      {/* Re-evaluate the necessity of this modal if it's redundant with ProductRequestModal for removal */}
      {showRequestModal && selectedProduct && (
        <ProductRequestModal
          showRequestProductModal={showRequestModal}
          setShowRequestProductModal={setShowRequestModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
}