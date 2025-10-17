// src/app/admin/[adminSlug]/properties-categories/page.tsx
'use client';

import { notFound } from 'next/navigation'; // Useful if adminSlug is invalid
import Link from 'next/link';
import { HomeIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Assuming you have Heroicons installed


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// Type definition for a Category
interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategory?: string; // Optional: for hierarchical categories
  propertyCount: number; // Number of properties associated
}

// Mock Data (Replace with actual API call)
const mockCategories: Category[] = [
  { id: 'cat-001', name: 'Residential', description: 'Properties for living, including apartments and houses.', propertyCount: 150 },
  { id: 'cat-002', name: 'Commercial', description: 'Properties for business operations, offices, retail.', propertyCount: 80 },
  { id: 'cat-003', name: 'Land', description: 'Undeveloped plots for various uses.', propertyCount: 60 },
  { id: 'cat-004', name: 'Industrial', description: 'Properties for manufacturing, warehousing, and logistics.', propertyCount: 25 },
  { id: 'cat-005', name: 'Mixed-Use', description: 'Developments combining residential, commercial, etc.', propertyCount: 15 },
];

interface CategoriesPageProps {
  params:Promise<{ slug: string }>
}

export default async function PropertiesCategoriesPage({ params }: CategoriesPageProps) {
  const { slug: adminSlug } = await params;

  // In a real app, you'd fetch categories here:
  // const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       // Replace with your actual API endpoint
  //       const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/categories`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch categories');
  //       }
  //       const data: Category[] = await response.json();
  //       setCategories(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An unknown error occurred');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchCategories();
  // }, [adminSlug]);

  // For demonstration, we'll use mock data directly
  const categories = mockCategories;
  const loading = false; // Set to true when fetching
  const error = null; // Set if an error occurs

  // --- Handlers for CRUD operations (placeholders) ---

  const handleAddCategory = () => {
    // Navigate to a new page or open a modal for adding
    console.log('Navigate to add new category form');
    // Example: router.push(`/admin/${adminSlug}/properties-categories/new`);
  };

  const handleEditCategory = (categoryId: string) => {
    // Navigate to an edit page or open a modal with category data
    console.log(`Edit category with ID: ${categoryId}`);
    // Example: router.push(`/admin/${adminSlug}/properties-categories/edit/${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Implement confirmation modal before actual deletion
    console.log(`Delete category with ID: ${categoryId}`);
    // Call API to delete, then update state
  };

  // --- Render logic ---

  if (loading) {
    return <div className="p-8 text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  // You might want to check if adminSlug is valid here
  // if (!isValidAdminSlug(adminSlug)) {
  //   notFound(); // Next.js built-in for 404
  // }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center space-x-2 text-gray-600 mb-4">
        <HomeIcon className="h-5 w-5" />
        <span>Admin Dashboard</span>
        <span>/</span>
        <span>Real Estate</span>
        <span>/</span>
        <span className="font-semibold">Categories</span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Property Categories</h1>
          <button
            onClick={handleAddCategory}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Category
          </button>
        </div>

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
                  <tr key={category.id}>
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
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Edit Category"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
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