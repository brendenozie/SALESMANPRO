// src/app/admin/[slug]/properties-categories/PropertyCategoriesClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategory?: string;
  propertyCount: number;
}

interface PropertyCategoriesClientProps {
  companyId: string;
  slug: string;
}

export default function PropertyCategoriesClient({ companyId }: PropertyCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/${companyId}/categories`, {
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data.data || data);
    } catch (err: any) {
      // Fallback to mock data if API is not yet active during development
      setCategories([
        { id: 'cat-001', name: 'Residential', description: 'Properties for living, including apartments and houses.', propertyCount: 150 },
        { id: 'cat-002', name: 'Commercial', description: 'Properties for business operations, offices, retail.', propertyCount: 80 },
        { id: 'cat-003', name: 'Land', description: 'Undeveloped plots for various uses.', propertyCount: 60 },
      ]);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Handlers for CRUD operations ---
  const handleAddCategory = () => {
    console.log('Navigate to add new category form');
  };

  const handleEditCategory = (categoryId: string) => {
    console.log(`Edit category with ID: ${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600 font-sans">Loading categories...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="flex items-center space-x-2 text-gray-600 mb-4">
        <HomeIcon className="h-5 w-5" />
        <span>Admin Dashboard</span>
        <span>/</span>
        <span>Real Estate</span>
        <span>/</span>
        <span className="font-semibold text-gray-900">Categories</span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Property Categories</h1>
          <button
            onClick={handleAddCategory}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Category
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
            Note: Showing local/fallback data due to network status: {error}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No categories found. Click "Add New Category" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.propertyCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition-colors"
                        title="Edit Category"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Category"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}