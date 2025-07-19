"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Import all your modals/layouts from the “components” folder.
// Adjust these paths if your folder structure differs.
import AddProductModal from "@/components/AddProductModal";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";
import AssignProductModal from "@/components/AssignProductModal";
import RestockProductModal from "@/components/RestockProductModal";
import ReturnProductModal from "@/components/ReturnProductModal";
// Assuming ProductForm and InventoryItem are distinct types for consistency
import { InventoryItem, ProductForm, StoreCategory } from "@/types/typings";

// Define InventoryItem more clearly for display purposes, assuming productItem is what you pass to modals
// If productItem is the same as ProductForm, ensure consistency.
// Example of how InventoryItem might look based on usage:
// interface InventoryItem {
//   id: string;
//   name: string;
//   description: string; // Added for richer cards
//   companyStock: number;
//   agentStock: number;
//   sales: number;
//   commissionType: string;
//   commissionRate: number;
//   category: {
//     displayName: string;
//     // ... other category properties if needed
//   };
//   productItem: ProductForm; // The full product details for modals
// }

type Agent = {
  id: string;
  name: string;
};

interface ClientProps {
  companyId: string;
  productsData: InventoryItem[];
  categoriesData: StoreCategory[];
  agentsData: Agent[];
}

export default function AdminInventoryClient({
  companyId,
  productsData,
  categoriesData,
  agentsData,
}: ClientProps) {
  const router = useRouter();

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAssignProductModal, setShowAssignProductModal] = useState(false);
  const [showReturnProductModal, setShowReturnProductModal] = useState(false);
  const [showRestockProductModal, setShowRestockProductModal] = useState(false);
  const [showAddToMarketProductModal, setShowAddToMarketProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductForm | null>(null);
  // selectedAgent and stockAmount are not used in this component's UI directly,
  // but might be used by the modals they control. Keeping them for context.
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [stockAmount, setStockAmount] = useState(0);

  // Handlers for opening specific modals
  const handleAddProductClick = () => {
    setSelectedProduct(null); // Clear selected product for a new entry
    setShowAddProductModal(true);
  };

  const handleEditProductClick = (product: ProductForm) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleRestockProductClick = (product: ProductForm) => {
    setSelectedProduct(product);
    setShowRestockProductModal(true);
  };

  const handleAssignProductClick = (product: ProductForm) => {
    setSelectedProduct(product);
    setShowAssignProductModal(true);
  };

  const handleReturnProductClick = (product: ProductForm) => {
    setSelectedProduct(product);
    setShowReturnProductModal(true);
  };

  const handleAddToMarketProductClick = (product: ProductForm) => {
    setSelectedProduct(product);
    setShowAddToMarketProductModal(true);
  };

  // Helper function for stock bar width
  const getStockBarWidth = (currentStock: number, maxStock: number) => {
    if (maxStock === 0) return "0%";
    const percentage = (currentStock / maxStock) * 100;
    return `${Math.min(percentage, 100)}%`; // Cap at 100%
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:p-10">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-sm flex items-center justify-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 3H17C18.1046 3 19 3.89543 19 5V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V5C5 3.89543 5.89543 3 7 3ZM7 5V21H17V5H7ZM12 9C12.5523 9 13 8.55228 13 8V7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V8C11 8.55228 11.4477 9 12 9ZM12 11C12.5523 11 13 10.5523 13 10V10C13 9.44772 12.5523 9 12 9C11.4477 9 11 9.44772 11 10V10C11 10.5523 11.4477 11 12 11ZM12 13C12.5523 13 13 12.5523 13 12V12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V12C11 12.5523 11.4477 13 12 13Z" />
          </svg>
          Admin Inventory Control
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Effectively manage your product stock, track sales, assign items to agents, and update product details from a centralized hub.
        </p>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-sm bg-opacity-95">

        {/* Products Header and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Product List</h2>
          <button
            onClick={handleAddProductClick}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
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
            productsData.map((product) => {
              // Calculate total stock for the progress bar (adjust max as per your business logic, e.g., ideal capacity)
              const totalStock = product.companyStock + product.agentStock;
              // A conceptual max stock for the bar, could be product.maxCapacity or just a high number to show proportion
              const maxDisplayStock = Math.max(totalStock, 100); // Example: at least 100 for display scale

              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 duration-300 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase font-semibold tracking-wide">
                      {product.category.displayName}
                    </span>
                  </div>
                  {/* Optional: Add a short description if available in InventoryItem */}
                  {/* {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )} */}

                  <div className="space-y-3 mb-5">
                    {/* Company Stock */}
                    <div>
                      <p className="text-sm text-gray-700 flex justify-between items-center mb-1">
                        Company Stock: <strong className="font-semibold text-gray-900">{product.companyStock}</strong>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: getStockBarWidth(product.companyStock, maxDisplayStock) }}
                        ></div>
                      </div>
                    </div>

                    {/* Agent Stock */}
                    <div>
                      <p className="text-sm text-gray-700 flex justify-between items-center mb-1">
                        Agent Stock: <strong className="font-semibold text-purple-600">{product.agentStock}</strong>
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                          style={{ width: getStockBarWidth(product.agentStock, maxDisplayStock) }}
                        ></div>
                      </div>
                    </div>

                    {/* Sales & Commission */}
                    <p className="text-sm text-gray-700">
                      Sales: <strong className="font-semibold text-green-600">{product.sales} units</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                      Commission: <strong className="font-semibold text-orange-600">{product.commissionRate}% ({product.commissionType})</strong>
                    </p>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditProductClick(product.productItem)}
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium text-sm transition hover:bg-yellow-600 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      title="Edit Product Details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.65 7.65A2 2 0 019.172 15L6 15v-3.172a2 2 0 01.586-1.414l7.65-7.65zM11 2a1 1 0 00-1 1v1a1 1 0 102 0V3a1 1 0 00-1-1z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={() => handleRestockProductClick(product.productItem)}
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-green-500 text-white font-medium text-sm transition hover:bg-green-600 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                      title="Restock Company Inventory"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1h-1v5a2 2 0 01-2 2H7a2 2 0 01-2-2V7H4a1 1 0 01-1-1V3zm2 4v5a1 1 0 001 1h6a1 1 0 001-1V7H5zm10-2h-1v1a1 1 0 11-2 0V5H7v1a1 1 0 11-2 0V5H4a1 1 0 00-1 1v1h14V6a1 1 0 00-1-1zm-4 4a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
                      </svg>
                      Restock
                    </button>

                    <button
                      onClick={() => handleAssignProductClick(product.productItem)}
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm transition hover:bg-blue-600 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      title="Assign Stock to Agent"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17.657 16.657A2 2 0 0116.172 17H2.828a2 2 0 01-1.414-.586L.293 15.293A1 1 0 01.293 13.88l1.414-1.414a1 1 0 011.414 0L4 13.586V10a1 1 0 112 0v3.586l.586-.586a1 1 0 011.414 0l1.414 1.414a1 1 0 010 1.414l-1.414 1.414zM16 13a3 3 0 10-6 0 3 3 0 006 0z" />
                      </svg>
                      Assign
                    </button>

                    <button
                      onClick={() => handleReturnProductClick(product.productItem)}
                      className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm transition hover:bg-red-600 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Return Stock from Agent"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Return
                    </button>

                    <button
                      onClick={() => handleAddToMarketProductClick(product.productItem)}
                      className="col-span-2 flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium text-sm transition hover:bg-indigo-600 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      title="Add to Client Market Place"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.586l-.293.293a1 1 0 00-1.414 0l-.293-.293V3a1 1 0 011-1zm-6 3a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 8a1 1 0 00-1-1H7a1 1 0 00-1 1v3a1 1 0 001 1h4a1 1 0 001-1v-3z" clipRule="evenodd" />
                      </svg>
                      To Market Place
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State
            <div className="col-span-full text-center py-20 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-2xl font-semibold text-gray-600 mb-3">No Products Found!</p>
              <p className="text-lg text-gray-500 mb-6 max-w-md">
                It seems your inventory is empty. Start by adding new products to your system.
              </p>
              <button
                onClick={handleAddProductClick}
                className="flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
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

      {/* ===========================
          Modal Components
          =========================== */}
      {showAddProductModal && (
        <AddProductModal
          showRequestProductModal={showAddProductModal}
          setShowRequestProductModal={setShowAddProductModal}
          companyId={companyId}
          categories={categoriesData}
          product={null} // For adding new product
        />
      )}

      {showEditProductModal && selectedProduct && (
        <AddProductModal
          showRequestProductModal={showEditProductModal}
          setShowRequestProductModal={setShowEditProductModal}
          categories={categoriesData}
          companyId={companyId}
          product={selectedProduct} // For editing existing product
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

      {showAddToMarketProductModal && selectedProduct && (
        <AddToProductMarketModal
          showRequestProductModal={showAddToMarketProductModal}
          setShowRequestProductModal={setShowAddToMarketProductModal}
          categories={categoriesData}
          product={selectedProduct}
          companyId={companyId}
          // Assuming marketListItem is not strictly needed when adding from admin inventory
          // or if it shares structure with ProductForm, you might pass selectedProduct to it.
          // marketListItem={null} 
        />
      )}
    </div>
  );
}