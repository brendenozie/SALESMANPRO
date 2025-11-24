"use client";

import React, { useState, useMemo } from "react";
// Assuming these are imported correctly from your components folder
import ProductRequestModal from "@/components/ProductRequestModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import { IStoreCategory, MarketListingForm } from "@/types/typings";

interface ClientProps {
  companyId: string;
  productsData: MarketListingForm[];
  categoriesData: IStoreCategory[];
}

export default function ClientInventoryClient({ companyId, categoriesData, productsData }: ClientProps) {
  const [showRemoveProductModal, setShowRemoveProductModal] = useState(false);
  const [showAddToMarketModal, setShowAddToMarketModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketListingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  // NOTE: The showRequestModal state was redundant in the original code,
  // as removal uses ProductRequestModal. I've removed the showRequestModal state.

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

  // --- Filtered Products Logic (Efficiency) ---
  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())  || 
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "ALL" || 
                              product.category === selectedCategory; // Assuming category name is used for filtering

      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchTerm, selectedCategory]);
  
  // --- Quick Stats (Intuitive Overview) ---
  const totalProducts = productsData.length;
  const totalQuantity = productsData.reduce((sum, p) => sum + p.quantity, 0);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 lg:p-12 transition-colors duration-500">
      
      {/* 🌟 VIBRANT HEADER SECTION */}
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
          Product Marketplace 🚀
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Central hub for managing your company's product listings, inventory, and market visibility.
        </p>
      </header>

      {/* 📊 OVERVIEW STATS & ACTIONS */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* Stat Card 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Listings</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-1">{totalProducts}</p>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Quantity</p>
                <p className="text-4xl font-extrabold text-green-600 mt-1">{totalQuantity}</p>
            </div>
            {/* Action Card/Button */}
            <div 
                onClick={handleAddProductClick}
                className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl shadow-inner cursor-pointer flex flex-col justify-center items-center text-center border-2 border-dashed border-blue-200 dark:border-blue-700 hover:bg-blue-100 transition duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">Add New Product</p>
            </div>
        </div>
      </div>

      {/* 🔍 FILTER & SEARCH BAR */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col sm:flex-row gap-4 items-center border border-gray-100 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search product name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-2/3 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 appearance-none bg-white dark:bg-gray-700"
        >
          <option value="ALL">All Categories ({productsData.length})</option>
          {categoriesData.map(cat => (
            <option key={cat.id} value={cat.displayName || 'Unknown'}>
                {cat.displayName} ({productsData.filter(p => p.category.name === cat.displayName).length})
            </option>
          ))}
        </select>
      </div>

      {/* 📦 PRODUCT GRID */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-[1.02] duration-300 relative overflow-hidden group"
              >
                {/* Product Image Placeholder (Crucial visual element) */}
                <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img src={product.images?.[0] || `https://via.placeholder.com/150/`} alt={product.name} className="object-cover h-full w-full" />
                    {/* <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4.5-4.5 2 2 3.5-3.5 2 2V15zm-2-9a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd"></path></svg> */}
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {product.isNewArrival && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">New!</span>
                    )}
                    {product.isOnOffer && (
                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Offer</span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {product.name || "Untitled Product"}
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{product.category.name}</p>


                <div className="grid grid-cols-2 gap-y-2 mb-5 text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Stock:</p>
                  <p className="font-bold text-right text-gray-900 dark:text-white">{product.quantity}</p>
                  
                  <p className="text-gray-500 dark:text-gray-400">Selling Price:</p>
                  <p className="font-bold text-right text-green-600">${product.sellingPrice.toFixed(2)}</p>
                  
                  {product.discount && product.discount > 0 && (
                    <>
                      <p className="text-gray-500 dark:text-gray-400">Discount:</p>
                      <p className="font-bold text-right text-red-500">{product.discount}%</p>
                    </>
                  )}
                </div>

                {/* Action Buttons with Hover Effect */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleEditProductClick(product)}
                    title="Edit Product"
                    className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-7.65 7.65A2 2 0 019.172 15L6 15v-3.172a2 2 0 01.586-1.414l7.65-7.65z" /></svg>
                  </button>

                  <button
                    onClick={() => handleRemoveProductClick(product)}
                    title="Remove Listing"
                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            // 🚫 Empty State / No Results
            <div className="col-span-full text-center py-20 px-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-400 dark:text-blue-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-2xl font-bold text-gray-700 dark:text-white mb-3">
                {productsData.length === 0 ? "No Products Yet!" : "No Matching Products Found"}
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                {productsData.length === 0 
                  ? "It looks like your marketplace is empty. Click below to add your first item."
                  : "Try clearing your filters or search term to see all listings."
                }
              </p>
              {productsData.length === 0 && (
                <button
                  onClick={handleAddProductClick}
                  className="flex items-center gap-2 px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-xl hover:bg-blue-700 transform hover:scale-[1.05] transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
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
          product={null} 
          marketListItem={selectedProduct} // Pass selectedProduct for edit, null for new
          categories={categoriesData}
          companyId={companyId}
          locations={[]} // Assuming locations is defined elsewhere or handled in the modal
        />
      )}
    </div>
  );
}