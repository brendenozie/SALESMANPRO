import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { CurrencyDollarIcon,TagIcon } from '@heroicons/react/24/outline';

const AddProductModal = ({ showAddProductModal, setShowAddProductModal, categories, product }: any) => {
  const isEditing = !!product;

  const [newProduct, setNewProduct] = useState({
    id: product?.id || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    tags: product?.tags || [],
    costPrice: product?.costPrice || 0,
    salesPrice: product?.salesPrice || 0,
    commissionRate: product?.commissionRate || 0,
    commissionType: product?.commissionType || 'Percentage', // Default to "Percentage"
    companyId: product?.companyId || '63f7c9e2d91b1b2a5e80b007',
    productCategoryId: product?.productCategoryId || '',
  });

  const [selectedTags, setSelectedTags] = useState(product?.tags || []);
  const [selectedCategory, setSelectedCategory] = useState(product?.productCategoryId || '');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (selectedCategory) fetchTags(selectedCategory);
  }, [selectedCategory]);

  const fetchTags = (categoryId: string) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    setTags(category ? category.tags || [] : []);
  };

  const handleTagChange = (tagId: any) => {
    setSelectedTags((prevTags:any) =>
      prevTags.includes(tagId) ? prevTags.filter((id:any) => id !== tagId) : [...prevTags, tagId]
    );
  };

  useEffect(() => {
    setNewProduct((prev) => ({ ...prev, tags: selectedTags }));
  }, [selectedTags]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.productCategoryId || !newProduct.costPrice || !newProduct.salesPrice) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/admin/post-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error('Failed to save product.');
      alert(`${isEditing ? 'Product updated' : 'Product added'} successfully.`);
      setShowAddProductModal(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Modal className=" bg-white rounded-lg shadow-lg"
      isOpen={showAddProductModal}
      onClose={() => setShowAddProductModal(false)}
      title={''}
    >
      <div className="space-y-6 p-6 ">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Product' : 'Add Product'}</h2>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Enter product name"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Enter product Description"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>


        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">         
          {/* Cost Price */}
          <div className=' min-w-20'>
            <label className="block text-sm font-medium text-gray-700">
              Cost Price <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <CurrencyDollarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                placeholder="Enter cost price"
                className="w-full pl-10 px-4 min-w-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sales Price */}
          <div className=' min-w-20'>
            <label className="block text-sm font-medium text-gray-700">
              Sales Price <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <CurrencyDollarIcon className="absolute left-3  h-4 w-4 top-3 text-gray-400" />
              <input
                type="number"
                value={newProduct.salesPrice}
                onChange={(e) => setNewProduct({ ...newProduct, salesPrice: parseFloat(e.target.value) || 0 })}
                placeholder="Enter sales price"
                className="w-full pl-10 px-4 py-2 border min-w-20 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        {/* Commission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
            <input
              type="number"
              value={newProduct.commissionRate}
              onChange={(e) => setNewProduct({ ...newProduct, commissionRate: parseFloat(e.target.value) || 0 })}
              placeholder="Enter commission rate"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Commission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Type</label>
            <select
              value={newProduct.commissionType}
              onChange={(e) => setNewProduct({ ...newProduct, commissionType: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Percentage">COST</option>
              <option value="Fixed">QUANTITY</option>
            </select>
          </div>
        </div>

        {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={newProduct.productCategoryId}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                const category = categories.find((cat: any) => cat.id === selectedCategoryId);
                setNewProduct({ ...newProduct, productCategoryId: selectedCategoryId });
                setNewProduct({ ...newProduct, category: category?.name });
                setSelectedCategory(selectedCategoryId);
              }}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {/* {tags && tags.length > 0 && <span className="text-gray-500">Select tags:</span>} */}
            {tags && tags.length > 0 && tags.map((tag: any) => (
              <div
                key={tag.id}
                className={`flex items-center px-3 py-1 rounded-full border cursor-pointer ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 border-blue-400'
                    : 'bg-gray-100 border-gray-300'
                }`}
                onClick={() => handleTagChange(tag)}
              >
                <TagIcon className="mr-2 text-gray-400" />
                <span className="text-sm">{tag}</span>
              </div>
            )) || <div className="flex flex-wrap gap-3 mt-2 text-gray-500">No tags available</div>}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveProduct}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all focus:ring-2 focus:ring-blue-500"
        >
          {isEditing ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </Modal>
  );
};

export default AddProductModal;
