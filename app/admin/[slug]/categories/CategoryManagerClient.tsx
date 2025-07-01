'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { DragEndEvent } from '@dnd-kit/core';

// Types
export type Subcategory = { id: string; name: string; slug: string; sortOrder: number; visible: boolean };
export type StoreCategory = {
  id: string;
  displayName: string;
  icon?: string;
  sortOrder: number;
  visible: boolean;
  items: Subcategory[];
};

interface Props { initialCategories: StoreCategory[]; apiUrl: string; companyId: string; }

export default function CategoryManagerClient({ initialCategories, apiUrl, companyId }: Props) {
  const [categories, setCategories] = useState<StoreCategory[]>(initialCategories);
  const [openModal, setOpenModal] = useState(false);
  const [editingCat, setEditingCat] = useState<StoreCategory | null>(null);
  const [editingSub, setEditingSub] = useState<{ parentId: string; sub: Subcategory } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setCategories(curr => {
        const oldIndex = curr.findIndex(c => c.id === active.id as string);
        const newIndex = curr.findIndex(c => c.id === over.id as string);
        const rearranged = arrayMove(curr, oldIndex, newIndex).map((c, idx) => ({ ...c, sortOrder: idx }));
        syncCategoryOrder(rearranged);
        return rearranged;
      });
    }
  };

  async function syncCategoryOrder(updated: StoreCategory[]) {
    await fetch(`${apiUrl}/admin/reorder-store-categories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, categories: updated.map(c => ({ id: c.id, sortOrder: c.sortOrder })) })
    });
  }

  async function saveCategory(cat: StoreCategory) {
    const url = cat.id
      ? `${apiUrl}/admin/store-category/${cat.id}`
      : `${apiUrl}/admin/store-category`;
    const res = await fetch(url, {
      method: cat.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, ...cat })
    });
    const saved: StoreCategory = await res.json();
    setCategories(curr => {
      if (cat.id) return curr.map(c => c.id === saved.id ? saved : c);
      return [...curr, saved];
    });
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    await fetch(`${apiUrl}/admin/store-category/${id}`, { method: 'DELETE' });
    setCategories(curr => curr.filter(c => c.id !== id));
  }

  // Subcategory actions
  async function saveSubcategory(parentId: string, sub: Subcategory) {
    const parent = categories.find(c => c.id === parentId)!;
    const isEdit = Boolean(sub.id);
    const url = isEdit
      ? `${apiUrl}/admin/store-category/${parentId}/subcategory/${sub.id}`
      : `${apiUrl}/admin/store-category/${parentId}/subcategory`;
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    const saved: Subcategory = await res.json();
    setCategories(curr => curr.map(c => {
      if (c.id !== parentId) return c;
      const items = isEdit
        ? c.items.map(i => i.id === saved.id ? saved : i)
        : [...c.items, saved];
      return { ...c, items };
    }));
  }

  async function deleteSubcategory(parentId: string, subId: string) {
    if (!confirm('Delete this subcategory?')) return;
    await fetch(`${apiUrl}/admin/store-category/${parentId}/subcategory/${subId}`, { method: 'DELETE' });
    setCategories(curr => curr.map(c => c.id === parentId ? { ...c, items: c.items.filter(i => i.id !== subId) } : c));
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setEditingCat({ id: '', displayName: '', icon: '', sortOrder: categories.length, visible: true, items: [] }); setEditingSub(null); setOpenModal(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Category
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.displayName}</span>
                    <span>({cat.items.length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => { setEditingSub({ parentId: cat.id, sub: { id: '', name: '', slug: '', sortOrder: cat.items.length, visible: true } }); setEditingCat(null); setOpenModal(true); }}>
                      <PlusCircleIcon className="h-5 w-5 text-green-500 hover:text-green-700" />
                    </button>
                    <button onClick={() => { setEditingCat(cat); setEditingSub(null); setOpenModal(true); }}>
                      <PencilIcon className="h-5 w-5 text-indigo-600 hover:text-indigo-800" />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)}>
                      <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800" />
                    </button>
                  </div>
                </div>
                {/* List subcategories with edit/delete */}
                <ul className="mt-2 ml-8 space-y-1">
                  {cat.items.map(sub => (
                    <li key={sub.id} className="flex justify-between items-center">
                      <span>{sub.name}</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => { setEditingSub({ parentId: cat.id, sub }); setEditingCat(null); setOpenModal(true); }}>
                          <PencilIcon className="h-4 w-4 text-indigo-600 hover:text-indigo-800" />
                        </button>
                        <button onClick={() => deleteSubcategory(cat.id, sub.id)}>
                          <TrashIcon className="h-4 w-4 text-red-600 hover:text-red-800" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setOpenModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>

            {editingCat && (
              <form onSubmit={e => { e.preventDefault(); saveCategory(editingCat); setOpenModal(false); }} className="space-y-4">
                <h2 className="text-lg font-bold">{editingCat.id ? 'Edit Category' : 'New Category'}</h2>
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input value={editingCat.displayName} onChange={e => setEditingCat({ ...editingCat, displayName: e.target.value })} className="mt-1 w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Icon</label>
                  <input value={editingCat.icon} onChange={e => setEditingCat({ ...editingCat, icon: e.target.value })} className="mt-1 w-full border rounded p-2" placeholder="🎵" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={editingCat.visible} onChange={e => setEditingCat({ ...editingCat, visible: e.target.checked })} />
                  <label className="ml-2 text-sm">Visible</label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={() => setOpenModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                </div>
              </form>
            )}

            {editingSub && (
              <form onSubmit={e => { e.preventDefault(); saveSubcategory(editingSub.parentId, editingSub.sub); setOpenModal(false); }} className="space-y-4">
                <h2 className="text-lg font-bold">{editingSub.sub.id ? 'Edit Subcategory' : 'New Subcategory'}</h2>
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input value={editingSub.sub.name} onChange={e => setEditingSub({ ...editingSub, sub: { ...editingSub.sub, name: e.target.value } })} className="mt-1 w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input value={editingSub.sub.slug} onChange={e => setEditingSub({ ...editingSub, sub: { ...editingSub.sub, slug: e.target.value } })} className="mt-1 w-full border rounded p-2" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={editingSub.sub.visible} onChange={e => setEditingSub({ ...editingSub, sub: { ...editingSub.sub, visible: e.target.checked } })} />
                  <label className="ml-2 text-sm">Visible</label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={() => setOpenModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
