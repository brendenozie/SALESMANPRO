
'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: '', icon: '', image: '', slug: '' });

  useEffect(() => {
    fetch(`${apiUrl}/admin/get-all-categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  function openForm(category:any = null) {
    if (category) {
      setEditing(category);
      setForm({ name: category.name, icon: category.icon, image: category.image, slug: category.slug });
    }
    setIsOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setForm({ name: '', icon: '', image: '', slug: '' });
    setIsOpen(false);
  }
  // http://127.0.0.1:3000/dashboards/cated
  async function handleSubmit(e:any) {
    e.preventDefault();
    const url = editing ? `/api/categories/${editing._id}` : '/api/admin/get-all-categories';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const saved = await res.json();
    if (editing) {
      setCategories(categories.map((cat:any) => cat._id === saved._id ? saved : cat));
    } else {
      setCategories([saved, ...categories]);
    }
    closeForm();
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button
          onClick={() => openForm()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.length > 0 && categories.map((cat:any) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div className="text-3xl">{cat.icon}</div>
              <button onClick={() => openForm(cat)}>
                <PencilIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <h2 className="mt-2 text-lg font-semibold">{cat.name}</h2>
            <p className="text-sm text-gray-500">Slug: {cat.slug}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div  className="fixed inset-0 z-50 flex items-center justify-center ">
            <div className="fixed inset-0 bg-black opacity-30" />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <button onClick={closeForm} className="absolute top-4 right-4">
                <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>

              <div className="text-xl font-semibold mb-4">
                {editing ? 'Edit Category' : 'New Category'}
              </div>
              <div  className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="mt-1 w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Image URL</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="mt-1 w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
