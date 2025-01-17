import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const AddProductModal = ({ showAddProductModal, setShowAddProductModal, categories } : any) => {

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    tags: [],
    price: 0,
    companyId: '63f7c9e2d91b1b2a5e80b007',
    productCategoryId: '',
  });

  const [selectedTags, setSelectedTags] = useState<any>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<any>("");
  
  const [tags, setTags] = useState([]);

  // Fetch tags based on selected category
  useEffect(() => {
    if (selectedCategory) fetchTags(selectedCategory);
  }, [selectedCategory]);

  const fetchTags = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    if (category) setTags(category.tags || []);
    else setTags([]);
  };

  // Handle tag selection
  const handleTagChange = (tagId : any) => {
    setSelectedTags((prevTags  : any) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id : any) => id !== tagId)
        : [...prevTags, tagId]
    );
  };

  // Update tags in newProduct
  useEffect(() => {
    setNewProduct((prev) => ({ ...prev, tags: selectedTags }));
  }, [selectedTags]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const handleAddProduct = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/post-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Failed to add product.");

      alert("Product added successfully.");
      setShowAddProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal isOpen={showAddProductModal} onClose={() => setShowAddProductModal(false)} title="Add Product">
      <div className="space-y-6 p-4 bg-gray-50 rounded-lg shadow-md text-black">
    {/* Product Name */}
    <div className="space-y-1">
      <label htmlFor="productName" className="text-sm font-medium text-gray-700">
        Product Name
      </label>
      <input
        id="productName"
        type="text"
        placeholder="Enter product name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Description */}
    <div className="space-y-1">
      <label htmlFor="description" className="text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        id="description"
        placeholder="Enter product description"
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>

    {/* Price */}
    <div className="space-y-1">
      <label htmlFor="price" className="text-sm font-medium text-gray-700">
        Price
      </label>
      <input
        id="price"
        type="number"
        placeholder="Enter price"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Category Dropdown */}
    <div className="space-y-1">
      <label htmlFor="category" className="text-sm font-medium text-gray-700">
        Category
      </label>
      <select
        id="category"
        value={newProduct.productCategoryId}
        onChange={(e) => {
          const selectedCategoryId = e.target.value;
          setNewProduct({ ...newProduct, productCategoryId: selectedCategoryId });
          setSelectedCategory(selectedCategoryId);
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a category</option>
        {categories.map((category: any) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>

    {/* Tags Selection */}
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-3">
            {tags.map((tag : any) => (
            <div
                key={tag.id}
                className={`flex items-center px-3 py-1 rounded-full border ${
                selectedTags.includes(tag.id) ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300'
                } hover:shadow-sm transition-all`}
            >
                <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-800 min:w-20 h-6">{tag}</span>
            </div>
            ))}
        </div>
        </div>

    {/* Company ID */}
    <div className="space-y-1">
      <label htmlFor="companyId" className="text-sm font-medium text-gray-700">
        Company ID
      </label>
      <input
        id="companyId"
        type="text"
        placeholder="Enter company ID"
        value={newProduct.companyId}
        onChange={(e) => setNewProduct({ ...newProduct, companyId: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Add Product Button */}
    <button
      onClick={() => handleAddProduct()}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
    >
      Add Product
    </button>
  </div>
    </Modal>
  );
};

export default AddProductModal;
