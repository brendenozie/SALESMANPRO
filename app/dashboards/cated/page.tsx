"use client";

import { useState, useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Subcategory {
  /** If this came from the database, `id` is usually `sc._id.$oid`. If new, it can be `null` or a temp string. */
  id: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  image: string;
  imageAlt: string;
  thumbnail: string;
  bannerImage: string;
  description: string;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[]; // e.g. ["arts", "crafts"]
  metaKeywords: string[];
  sortOrder: number;
  visible: boolean;
  status: string; // "Active" | "Inactive"
  allBrands: string[]; 
  productCount: number;
  isFeatured: boolean;
  showInHomepage: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  localization: any;
  attributes: any;

  /** We will lift subcategories into the top-level formData. */
  subcategories: Subcategory[];
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Category | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);

  /** formData holds all fields needed to create/update a Category, including subcategories. */
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    icon: "",
    slug: "",
    image: "",
    imageAlt: "",
    thumbnail: "",
    bannerImage: "",
    description: "",
    longDescription: "",
    seoTitle: "",
    seoDescription: "",
    tags: [],
    metaKeywords: [],
    sortOrder: 0,
    visible: true,
    status: "Active",
    allBrands: [],
    productCount: 0,
    isFeatured: false,
    showInHomepage: false,
    createdAt: "",
    updatedAt: "",
    createdBy: "",
    updatedBy: "",
    localization: {},
    attributes: {},
    subcategories: [],
  });

  useEffect(() => {
    fetch(`${apiUrl}/admin/get-all-categories`)
      .then((res) => res.json())
      .then((data) => {
        // Assume data.results is an array of Category objects, each with subcategories[]
        setCategories(data.results);
      });
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.slug.toLowerCase().includes(filter.toLowerCase())
  );

  /** When “+ Add” or “Edit” is clicked, populate formData. */
  const openForm = (cat: Category | null = null) => {
    if (cat) {
      setFormData({
        ...cat,
        tags: cat.tags.slice(),
        metaKeywords: cat.metaKeywords.slice(),
        subcategories: cat.subcategories.map((sc) => ({
          id: sc.id || null,
          name: sc.name,
          slug: sc.slug,
          sortOrder: sc.sortOrder,
          visible: sc.visible,
        })),
      });
      setSelected(cat);
    } else {
      setFormData({
        name: "",
        icon: "",
        slug: "",
        image: "",
        imageAlt: "",
        thumbnail: "",
        bannerImage: "",
        description: "",
        longDescription: "",
        seoTitle: "",
        seoDescription: "",
        tags: [],
        metaKeywords: [],
        sortOrder: 0,
        visible: true,
        status: "Active",
        allBrands: [],
        productCount: 0,
        isFeatured: false,
        showInHomepage: false,
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: "",
        localization: {},
        attributes: {},
        subcategories: [],
      });
      setSelected(null);
    }
    setFormOpen(true);
  };

  /** Generic change handler for top‐level fields. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      val = e.target.checked;
    }
    if (name === "sortOrder" || name === "productCount") val = Number(val);
    if (name === "tags" || name === "metaKeywords" || name === "allBrands") {
      // expect a comma‐separated string in the input, store as array
      val = (value as string).split(",").map((s) => s.trim()).filter((s) => s.length);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  /** Add a new blank subcategory row to formData.subcategories */
  const addEmptySub = () => {
    setFormData((prev) => {
      const existing: Subcategory[] = prev.subcategories || [];
      return {
        ...prev,
        subcategories: [
          ...existing,
          {
            id: null,
            name: "",
            slug: "",
            sortOrder: existing.length + 1,
            visible: true,
          },
        ],
      };
    });
  };

  /** Remove a subcategory at index `idx` */
  const removeSub = (idx: number) => {
    setFormData((prev) => {
      const arr: Subcategory[] = prev.subcategories || [];
      const next = arr.filter((_, i) => i !== idx);
      return {
        ...prev,
        subcategories: next,
      };
    });
  };

  /** Update a subcategory's field */
  const handleSubChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const arr: Subcategory[] = (prev.subcategories || []).slice();
      let val: any = value;
      if (type === "checkbox" && e.target instanceof HTMLInputElement) {
        val = e.target.checked;
      }
      if (name === "sortOrder") val = Number(val);
      arr[idx] = { ...arr[idx], [name]: val };
      return {
        ...prev,
        subcategories: arr,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build payload, converting `[]` fields to arrays, and pass subcategories as‐is
    const payload: any = {
      ...formData,
      tags: formData.tags || [],
      metaKeywords: formData.metaKeywords || [],
      allBrands: formData.allBrands || [],
      localization: formData.localization,
      attributes: formData.attributes,
      subcategories: (formData.subcategories || []).map((sc) => ({
        ...sc,
        // If sc.id is a Mongo ObjectId object { $oid: ... }, you might need to convert
        // it to a string before sending. But here we assume it’s already a string or null.
      })),
    };

    const method = selected ? "PUT" : "POST";
    const url = selected
      ? `${apiUrl}/admin/product-categories/${selected.id}`
      : `${apiUrl}/admin/product-categories`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();
    if (selected) {
      // Replace the updated category in our local list
      setCategories((cats) =>
        cats.map((c) => (c.id === saved.id ? saved : c))
      );
    } else {
      setCategories((cats) => [saved, ...cats]);
    }
    setFormOpen(false);
    setSelected(saved);
  };

  return (
    <div className="flex h-screen">
      {/* ─── Sidebar (List of categories) ─── */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <div className="flex justify-between mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded w-full mr-2"
          />
          <button
            onClick={() => openForm(null)}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            + Add
          </button>
        </div>
        <ul>
          {filtered.map((cat) => (
            <li
              key={cat.id}
              className={`p-2 rounded cursor-pointer mb-1 ${
                selected?.id === cat.id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                openForm(cat);
              }}
            >
              <span className="text-xl mr-2">{cat.icon}</span>
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* ─── Main Panel ─── */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {isFormOpen ? (
          // ─── Category Form ───
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selected ? "Edit" : "New"} Category
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Top‐level fields (name, icon, slug, etc.) ── */}
              <div className="grid grid-cols-3 gap-4">
                <input
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="border p-2 rounded"
                />
                <input
                  name="icon"
                  value={formData.icon || ""}
                  onChange={handleChange}
                  placeholder="Icon"
                  className="border p-2 rounded"
                />
                <input
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleChange}
                  placeholder="Slug"
                  required
                  className="border p-2 rounded"
                />
                <input
                  name="image"
                  value={formData.image || ""}
                  onChange={handleChange}
                  placeholder="Image URL"
                  className="border p-2 rounded"
                />
                <input
                  name="imageAlt"
                  value={formData.imageAlt || ""}
                  onChange={handleChange}
                  placeholder="Image Alt"
                  className="border p-2 rounded"
                />
                <input
                  name="thumbnail"
                  value={formData.thumbnail || ""}
                  onChange={handleChange}
                  placeholder="Thumbnail URL"
                  className="border p-2 rounded"
                />
                <input
                  name="bannerImage"
                  value={formData.bannerImage || ""}
                  onChange={handleChange}
                  placeholder="Banner Image URL"
                  className="border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Description"
                  className="border p-2 rounded w-full"
                />
                <textarea
                  name="longDescription"
                  value={formData.longDescription || ""}
                  onChange={handleChange}
                  placeholder="Long Description"
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="seoTitle"
                  value={formData.seoTitle || ""}
                  onChange={handleChange}
                  placeholder="SEO Title"
                  className="border p-2 rounded"
                />
                <input
                  name="seoDescription"
                  value={formData.seoDescription || ""}
                  onChange={handleChange}
                  placeholder="SEO Description"
                  className="border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="tags"
                  value={(formData.tags || []).join(",")}
                  onChange={handleChange}
                  placeholder="Tags (comma separated)"
                  className="border p-2 rounded"
                />
                <input
                  name="metaKeywords"
                  value={(formData.metaKeywords || []).join(",")}
                  onChange={handleChange}
                  placeholder="Meta Keywords (comma separated)"
                  className="border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input
                  name="sortOrder"
                  type="number"
                  value={formData.sortOrder ?? 0}
                  onChange={handleChange}
                  placeholder="Sort Order"
                  className="border p-2 rounded"
                />
                <input
                  name="productCount"
                  type="number"
                  value={formData.productCount ?? 0}
                  onChange={handleChange}
                  placeholder="Product Count"
                  className="border p-2 rounded"
                />
                <select
                  name="status"
                  value={formData.status || "Active"}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <label className="flex items-center">
                  <input
                    name="visible"
                    type="checkbox"
                    checked={formData.visible ?? false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Visible
                </label>
                <label className="flex items-center">
                  <input
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center">
                  <input
                    name="showInHomepage"
                    type="checkbox"
                    checked={formData.showInHomepage ?? false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Show in Home
                </label>
              </div>
              <div>
                <label className="block mb-1">Brands (comma separated)</label>
                <input
                  name="allBrands"
                  value={(formData.allBrands || []).join(",")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allBrands: (e.target.value as string)
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length),
                    }))
                  }
                  placeholder="e.g. Crayola, Faber-Castell"
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Localization (raw JSON)</label>
                <textarea
                  name="localization"
                  value={JSON.stringify(formData.localization || {}, null, 2)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      localization: JSON.parse(e.target.value),
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Attributes (raw JSON)</label>
                <textarea
                  name="attributes"
                  value={JSON.stringify(formData.attributes || {}, null, 2)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: JSON.parse(e.target.value),
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              {/* ─── Subcategories Section ─── */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Subcategories</h3>
                {(formData.subcategories || []).map((sub, idx) => (
                  <div
                    key={sub.id ?? `new-${idx}`}
                    className="border rounded p-3 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-lg">
                        {sub.id ? `Edit #${sub.id}` : `New subcategory`}
                      </strong>
                      <button
                        type="button"
                        onClick={() => removeSub(idx)}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        name="name"
                        value={sub.name}
                        onChange={(e) => handleSubChange(idx, e)}
                        placeholder="Name"
                        className="border p-2 rounded"
                      />
                      <input
                        name="slug"
                        value={sub.slug}
                        onChange={(e) => handleSubChange(idx, e)}
                        placeholder="Slug"
                        className="border p-2 rounded"
                      />
                      <input
                        name="sortOrder"
                        type="number"
                        value={sub.sortOrder}
                        onChange={(e) => handleSubChange(idx, e)}
                        placeholder="Sort Order"
                        className="border p-2 rounded"
                      />
                      <label className="flex items-center col-span-2">
                        <input
                          name="visible"
                          type="checkbox"
                          checked={sub.visible}
                          onChange={(e) => handleSubChange(idx, e)}
                          className="mr-2"
                        />
                        Visible
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmptySub}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  + Add Subcategory
                </button>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="ml-2 text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : selected ? (
          // ─── View‐only / Details Mode ───
          <div>
            <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <img
                src={selected.image}
                alt={selected.imageAlt}
                className="w-full h-32 object-cover rounded"
              />
              <img
                src={selected.thumbnail}
                alt="Thumbnail"
                className="w-full h-32 object-cover rounded"
              />
              <img
                src={selected.bannerImage}
                alt="Banner"
                className="w-full h-32 object-cover rounded"
              />
            </div>
            <p>
              <strong>Icon:</strong> {selected.icon}
            </p>
            <p>
              <strong>Slug:</strong> {selected.slug}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selected.description || "-"}
            </p>
            <p>
              <strong>Long Description:</strong>{" "}
              {selected.longDescription || "-"}
            </p>
            <p>
              <strong>SEO Title:</strong> {selected.seoTitle}
            </p>
            <p>
              <strong>SEO Description:</strong> {selected.seoDescription}
            </p>
            <p>
              <strong>Meta Keywords:</strong>{" "}
              {selected.metaKeywords.join(", ")}
            </p>
            <p>
              <strong>Sort Order:</strong> {selected.sortOrder}
            </p>
            <p>
              <strong>Product Count:</strong> {selected.productCount}
            </p>
            <p>
              <strong>Visible:</strong>{" "}
              {selected.visible ? "Yes" : "No"}
            </p>
            <p>
              <strong>Featured:</strong>{" "}
              {selected.isFeatured ? "Yes" : "No"}
            </p>
            <p>
              <strong>Show in Homepage:</strong>{" "}
              {selected.showInHomepage ? "Yes" : "No"}
            </p>
            <p>
              <strong>Status:</strong> {selected.status}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Created By:</strong> {selected.createdBy}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {new Date(selected.updatedAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated By:</strong> {selected.updatedBy}
            </p>

            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Brands & Tags</h3>
              <p>
                <strong>All Brands:</strong>{" "}
                {selected.allBrands.join(", ")}
              </p>
              <p>
                <strong>Tags:</strong> {selected.tags.join(", ")}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Subcategories
              </h3>
              <ul className="border rounded divide-y">
                {selected.subcategories.map((sc) => (
                  <li
                    key={sc.id}
                    className="p-2 flex justify-between items-center"
                  >
                    <span>{sc.name}</span>
                    <span className="text-sm text-gray-500">
                      Order {sc.sortOrder}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Localization & Attributes
              </h3>
              <pre className="bg-gray-100 p-2 rounded">
                <code>{JSON.stringify(selected.localization, null, 2)}</code>
              </pre>
              <pre className="bg-gray-100 p-2 rounded mt-2">
                <code>{JSON.stringify(selected.attributes, null, 2)}</code>
              </pre>
            </div>

            <button
              onClick={() => openForm(selected)}
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Edit Category
            </button>
          </div>
        ) : (
          <p>
            Select a category to view details or click “+ Add” to create a new
            one.
          </p>
        )}
      </div>
    </div>
  );
}
