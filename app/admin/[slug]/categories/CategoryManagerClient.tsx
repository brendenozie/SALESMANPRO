'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { PlusCircleIcon, SquaresPlusIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline'; // Added more icons for visual appeal

import CategoryCard from './CategoryCard';
import CategoryFormModal from './CategoryFormModal';
import SubcategoryFormModal from './SubcategoryFormModal';

// --- Types (Simplified for client-side use) ---
export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

export type StoreCategory = {
  id: string;
  displayName: string;
  icon?: string; // Emoji or icon class
  sortOrder: number;
  visible: boolean;
  items: Subcategory[]; // Renamed from 'subcategories' for consistency with 'items' in your sample
  // Add other fields from your sample if needed, e.g., categoryId, companyId
};

interface Props {
  initialCategories: StoreCategory[];
  apiUrl: string;
  companyId: string;
}

export default function CategoryManagerClient({ initialCategories, apiUrl, companyId }: Props) {
  const [categories, setCategories] = useState<StoreCategory[]>(initialCategories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCat, setEditingCat] = useState<StoreCategory | null>(null);
  const [editingSub, setEditingSub] = useState<{ parentId: string; sub: Subcategory } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null); // For DragOverlay

  const sensors = useSensors(useSensor(PointerSensor));

  // --- API Operations ---
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/get-store-categories?companyId=${companyId}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        // Assuming API returns { categories: StoreCategory[] }
        setCategories(json.categories || []);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch categories.");
        setCategories(initialCategories); // Fallback to initial data
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching categories.");
      setCategories(initialCategories); // Fallback to initial data
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialCategories]);

  useEffect(() => {
    // Fetch categories on mount if initial data is empty or if we need to ensure freshness
    if (initialCategories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, initialCategories]);

  const syncCategoryOrder = useCallback(async (updatedCategories: StoreCategory[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/reorder-store-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, categories: updatedCategories.map(c => ({ id: c.id, sortOrder: c.sortOrder })) })
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Failed to reorder categories.");
        // Revert to previous state on error
        setCategories(initialCategories); // Or a more sophisticated rollback
      }
    } catch (err: any) {
      setError(err.message || "Network error reordering categories.");
      setCategories(initialCategories); // Or a more sophisticated rollback
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialCategories]);

  const saveCategory = useCallback(async (cat: StoreCategory) => {
    setIsLoading(true);
    setError(null);
    
    const isEdit = Boolean(cat.id);///admin
    const url = isEdit ? `${apiUrl}/admin/store-categories/${cat.id}` : `${apiUrl}/admin/store-categories`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...cat })
      });

      if (res.ok) {
        await fetchCategories(); // Re-fetch all to ensure order and consistency
        setShowCategoryModal(false);
        setEditingCat(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} category.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${isEdit ? 'updating' : 'adding'} category.`);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone and may affect associated products.')) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/store-categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete category.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting category.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, fetchCategories]);

  const saveSubcategory = useCallback(async (parentId: string, sub: Subcategory) => {
    setIsLoading(true);
    setError(null);

    const isEdit = Boolean(sub.id);
    const url = isEdit ? `${apiUrl}/admin/store-categories/${parentId}/subcategories/${sub.id}`
      : `${apiUrl}/admin/store-categories/${parentId}/subcategories`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      if (res.ok) {
        await fetchCategories(); // Re-fetch to update parent category's subitems
        setShowSubcategoryModal(false);
        setEditingSub(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} subcategory.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${isEdit ? 'updating' : 'adding'} subcategory.`);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, fetchCategories]);

  const deleteSubcategory = useCallback(async (parentId: string, subId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/store-categories/${parentId}/subcategories/${subId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete subcategory.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting subcategory.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, fetchCategories]);

  // --- DnD Handlers ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveDragId(null);
      return;
    }

    setCategories(curr => {
      const oldIndex = curr.findIndex(c => c.id === active.id as string);
      const newIndex = curr.findIndex(c => c.id === over.id as string);
      const rearranged = arrayMove(curr, oldIndex, newIndex).map((c, idx) => ({ ...c, sortOrder: idx }));
      syncCategoryOrder(rearranged); // Sync to backend
      return rearranged;
    });
    setActiveDragId(null);
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const activeCategory = activeDragId ? categories.find(c => c.id === activeDragId) : null;


  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen font-sans antialiased">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <SquaresPlusIcon className="h-10 w-10 text-indigo-600" />
            Category Manager
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Organize and manage your store's product categories and subcategories with ease.
            Drag-and-drop to reorder, and quickly add, edit, or delete.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCat({ id: '', displayName: '', icon: '📦', sortOrder: categories.length, visible: true, items: [] });
            setEditingSub(null);
            setShowCategoryModal(true);
          }}
          className="mt-6 sm:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md
                     hover:bg-indigo-700 transition-all duration-300 ease-in-out
                     flex items-center gap-2 text-lg font-semibold transform hover:-translate-y-1"
          disabled={isLoading}
        >
          <PlusCircleIcon className="h-6 w-6" /> Add New Category
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-indigo-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}

      {/* Categories List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {categories.length > 0 ? (
              categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEditCategory={() => { setEditingCat(cat); setEditingSub(null); setShowCategoryModal(true); }}
                  onDeleteCategory={deleteCategory}
                  onAddSubcategory={() => { setEditingSub({ parentId: cat.id, sub: { id: '', name: '', slug: '', sortOrder: cat.items.length, visible: true } }); setEditingCat(null); setShowSubcategoryModal(true); }}
                  onEditSubcategory={(sub) => { setEditingSub({ parentId: cat.id, sub }); setEditingCat(null); setShowSubcategoryModal(true); }}
                  onDeleteSubcategory={deleteSubcategory}
                />
              ))
            ) : (
              !isLoading && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-inner border border-dashed border-gray-300 text-gray-500 text-lg">
                  <TagIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No categories found. Click "Add New Category" to get started!</p>
                </div>
              )
            )}
          </div>
        </SortableContext>

        {/* Drag Overlay for visual feedback */}
        <DragOverlay>
          {activeDragId && activeCategory ? (
            <div className="flex items-center p-4 bg-indigo-50 border border-indigo-300 rounded-xl shadow-xl transform -rotate-1 text-lg font-semibold text-indigo-800">
              <span className="text-3xl mr-3">{activeCategory.icon}</span>
              {activeCategory.displayName}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Category Form Modal */}
      {showCategoryModal && (
        <CategoryFormModal
          categoryData={editingCat}
          onClose={() => { setShowCategoryModal(false); setEditingCat(null); }}
          onSave={saveCategory}
          isLoading={isLoading}
        />
      )}

      {/* Subcategory Form Modal */}
      {showSubcategoryModal && editingSub && (
        <SubcategoryFormModal
          parentId={editingSub.parentId}
          subcategoryData={editingSub.sub}
          onClose={() => { setShowSubcategoryModal(false); setEditingSub(null); }}
          onSave={saveSubcategory}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
