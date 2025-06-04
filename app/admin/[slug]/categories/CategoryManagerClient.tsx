// app/admin/categories-manager/CategoryManagerClient.tsx

"use client";

import React, { useEffect, useState } from "react";
import type { Category, Subcategory } from "./page";

interface ClientProps {
  initialCategories: Category[];
}

export default function CategoryManagerClient({ initialCategories }: ClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selected, setSelected] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [subSelected, setSubSelected] = useState<Subcategory | null>(null);
  const [subForm, setSubForm] = useState<Record<string, any>>({});

  // When a category is selected, initialize its form data
  useEffect(() => {
    if (selected) {
      setFormData({
        name: selected.name || "",
        slug: selected.slug || "",
        description: selected.description || "",
        seoTitle: selected.seoTitle || "",
        seoDescription: selected.seoDescription || "",
        metaKeywords: (selected.metaKeywords || []).join(", "),
        sortOrder: selected.sortOrder || 0,
        visible: selected.visible || false,
        isFeatured: selected.isFeatured || false,
        showInHomepage: selected.showInHomepage || false,
        attributes: JSON.stringify(selected.attributes || {}, null, 2),
      });
      setSubSelected(null);
      setSubForm({});
    }
  }, [selected]);

  // When a subcategory is selected, initialize its form data
  useEffect(() => {
    if (subSelected) {
      setSubForm({
        name: subSelected.name || "",
        slug: subSelected.slug || "",
        sortOrder: subSelected.sortOrder || 0,
        visible: subSelected.visible || false,
      });
    }
  }, [subSelected]);

  // Category‐level handlers
  const handleSelect = (cat: Category) => {
    setSelected(cat);
    setSubSelected(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSaveCategory = (updatedCat: Category) => {
    // Replace the existing category in state with the updated one
    setCategories((prev) =>
      prev.map((c) =>
        c._id.$oid === updatedCat._id.$oid ? updatedCat : c
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    // Build the updated category object from formData
    const updated: Category = {
      ...selected,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
      metaKeywords: formData.metaKeywords
        .split(",")
        .map((k: string) => k.trim()),
      sortOrder: Number(formData.sortOrder),
      visible: Boolean(formData.visible),
      isFeatured: Boolean(formData.isFeatured),
      showInHomepage: Boolean(formData.showInHomepage),
      attributes: JSON.parse(formData.attributes || "{}"),
      subcategories: selected.subcategories,
    };

    onSaveCategory(updated);
    setSelected(updated);
  };

  // Subcategory‐level handlers
  const handleSubSelect = (sub: Subcategory) => {
    setSubSelected(sub);
  };

  const handleSubChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setSubForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !subSelected) return;

    // Build the updated subcategory from subForm
    const updatedSub: Subcategory = {
      ...subSelected,
      name: subForm.name,
      slug: subForm.slug,
      sortOrder: Number(subForm.sortOrder),
      visible: Boolean(subForm.visible),
    };

    // Replace that subcategory in `selected.subcategories`
    const updatedSubs = selected.subcategories.map((sub) =>
      sub._id.$oid === updatedSub._id.$oid ? updatedSub : sub
    );

    // Create a new Category object with updated subcategories
    const updatedCat: Category = {
      ...selected,
      subcategories: updatedSubs,
    };

    onSaveCategory(updatedCat);
    setSelected(updatedCat);
    setSubSelected(updatedSub);
  };

  const handleAddSub = () => {
    if (!selected) return;

    // Create a brand‐new subcategory (temporary _id using Date.now())
    const newSub: Subcategory = {
      _id: { $oid: Date.now().toString() },
      name: "New Subcategory",
      slug: "",
      sortOrder: selected.subcategories.length,
      visible: true,
    };

    const updatedCat: Category = {
      ...selected,
      subcategories: [...selected.subcategories, newSub],
    };

    onSaveCategory(updatedCat);
    setSelected(updatedCat);
    setSubSelected(newSub);
  };

  return (
      <div className="grid grid-cols-4 h-full gap-4">
        <aside className="col-span-1 p-4 border-r overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <ul>
            {categories.map((cat) => (
              <li key={cat._id.$oid} className="mb-1">
                <button
                  onClick={() => handleSelect(cat)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selected?._id.$oid === cat._id.$oid
                      ? "bg-gray-200 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="col-span-3 p-6 overflow-y-auto">
          {selected ? (
            <>
              {/* Category Edit Form */}
              <div className="shadow-lg p-6 bg-white rounded mb-6">
                <h2 className="text-2xl font-semibold mb-6">
                  Edit Category: {selected.name}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Slug</label>
                      <input
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">SEO Title</label>
                    <input
                      name="seoTitle"
                      value={formData.seoTitle || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      SEO Description
                    </label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Meta Keywords (comma-separated)
                    </label>
                    <input
                      name="metaKeywords"
                      value={formData.metaKeywords || ""}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Sort Order</label>
                      <input
                        type="number"
                        name="sortOrder"
                        value={formData.sortOrder || 0}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        name="visible"
                        checked={Boolean(formData.visible)}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Visible</span>
                    </label>
                    <label className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={Boolean(formData.isFeatured)}
                        onChange={handleChange}
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="showInHomepage"
                      checked={Boolean(formData.showInHomepage)}
                      onChange={handleChange}
                    />
                    <span className="text-sm">Show on Homepage</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium">
                      Custom Attributes (JSON)
                    </label>
                    <textarea
                      name="attributes"
                      value={formData.attributes || "{}"}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      rows={4}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>

              {/* Subcategories Section */}
              <div className="shadow-lg p-6 bg-white rounded">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Subcategories</h3>
                  <button
                    onClick={handleAddSub}
                    className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Add New
                  </button>
                </div>

                <ul className="mb-4">
                  {selected.subcategories.map((sub) => (
                    <li key={sub._id.$oid} className="mb-1">
                      <button
                        onClick={() => handleSubSelect(sub)}
                        className={`w-full text-left px-3 py-2 rounded ${
                          subSelected?._id.$oid === sub._id.$oid
                            ? "bg-gray-200 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>

                {subSelected ? (
                  <form onSubmit={handleSubSave} className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                          name="name"
                          value={subForm.name || ""}
                          onChange={handleSubChange}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Slug</label>
                        <input
                          name="slug"
                          value={subForm.slug || ""}
                          onChange={handleSubChange}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Sort Order</label>
                        <input
                          type="number"
                          name="sortOrder"
                          value={subForm.sortOrder || 0}
                          onChange={handleSubChange}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <label className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          name="visible"
                          checked={Boolean(subForm.visible)}
                          onChange={handleSubChange}
                        />
                        <span className="text-sm">Visible</span>
                      </label>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Save Subcategory
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-gray-500">
                    Select a subcategory to edit, or click "Add New".
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a category to view and edit its details.
            </div>
          )}
        </main>
      </div>
  );
}
