"use client";

import { useState, useEffect } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [subEditIds, setSubEditIds] = useState<string[]>([]);
  const [bulkSort, setBulkSort] = useState(0);

  useEffect(() => {
    fetch(`${apiUrl}/admin/get-all-categories`)
      .then(res => res.json())
      .then(data => setCategories(data.results));
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.slug.toLowerCase().includes(filter.toLowerCase())
  );

  const openForm = (cat: any = null) => {
    setFormData(cat
      ? {
          ...cat,
          tags: cat.tags.join(','),
          metaKeywords: cat.metaKeywords.join(','),
          imageAlt: cat.imageAlt || '',
          thumbnail: cat.thumbnail || '',
          bannerImage: cat.bannerImage || '',
          productCount: cat.productCount || 0,
          isFeatured: cat.isFeatured || false,
          showInHomepage: cat.showInHomepage || false,
          createdAt: cat.createdAt || '',
          updatedAt: cat.updatedAt || '',
          createdBy: cat.createdBy || '',
          updatedBy: cat.updatedBy || '',
          localization: JSON.stringify(cat.localization || {}),
          attributes: JSON.stringify(cat.attributes || {})
        }
      : {
          name: '', icon: '', image: '', imageAlt: '', slug: '', description: '', longDescription: '',
          seoTitle: '', seoDescription: '', tags: '', metaKeywords: '', sortOrder: 0, visible: true, status: 'Active',
          allBrands: [], productCount: 0, isFeatured: false, showInHomepage: false,
          thumbnail: '', bannerImage: '', localization: '{}', attributes: '{}',
          createdAt: '', updatedAt: '', createdBy: '', updatedBy: ''
        }
    );
    setSelected(cat);
    setFormOpen(true);
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((s: any) => s.trim()),
      metaKeywords: formData.metaKeywords.split(',').map((s: any) => s.trim()),
      allBrands: formData.allBrands,
      localization: JSON.parse(formData.localization),
      attributes: JSON.parse(formData.attributes)
    };
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? `${apiUrl}/categories/${selected.id}` : `${apiUrl}/categories`;
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(saved => {
        if (selected) setCategories(categories.map(c => c.id === saved.id ? saved : c));
        else setCategories([saved, ...categories]);
        setFormOpen(false);
      });
  };

  const applyBulkSort = () => {
    if (!selected) return;
    const updatedSubs = selected.subcategories.map((sc: any) => (
      subEditIds.includes(sc._id.$oid) ? { ...sc, sortOrder: bulkSort } : sc
    ));
    const updatedCat = { ...selected, subcategories: updatedSubs };
    fetch(`${apiUrl}/categories/${selected.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCat)
    })
      .then(res => res.json())
      .then(saved => {
        setCategories(categories.map(c => c.id === saved.id ? saved : c));
        setSelected(saved);
        setSubEditIds([]);
      });
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <div className="flex justify-between mb-2">
          <input
            type="text"
            placeholder="Search..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border p-2 rounded w-full mr-2"
          />
          <button onClick={() => openForm()} className="bg-blue-500 text-white px-2 py-1 rounded">+ Add</button>
        </div>
        <ul>
          {filtered.map(cat => (
            <li
              key={cat.id}
              className={`p-2 rounded cursor-pointer mb-1 ${selected?.id === cat.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => { setSelected(cat); setFormOpen(false); }}
            >
              <span className="text-xl mr-2">{cat.icon}</span>
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-2/3 p-6 overflow-y-auto">
        {isFormOpen ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">{selected ? 'Edit' : 'New'} Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border p-2 rounded" />
                <input name="icon" value={formData.icon} onChange={handleChange} placeholder="Icon" className="border p-2 rounded" />
                <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" required className="border p-2 rounded" />
                <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" className="border p-2 rounded" />
                <input name="imageAlt" value={formData.imageAlt} onChange={handleChange} placeholder="Image Alt" className="border p-2 rounded" />
                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="Thumbnail URL" className="border p-2 rounded" />
                <input name="bannerImage" value={formData.bannerImage} onChange={handleChange} placeholder="Banner Image URL" className="border p-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full" />
                <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} placeholder="Long Description" className="border p-2 rounded w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="SEO Title" className="border p-2 rounded" />
                <input name="seoDescription" value={formData.seoDescription} onChange={handleChange} placeholder="SEO Description" className="border p-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma)" className="border p-2 rounded" />
                <input name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} placeholder="Meta Keywords (comma)" className="border p-2 rounded" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} placeholder="Sort Order" className="border p-2 rounded" />
                <input name="productCount" type="number" value={formData.productCount} onChange={handleChange} placeholder="Product Count" className="border p-2 rounded" />
                <label className="flex items-center"><input name="visible" type="checkbox" checked={formData.visible} onChange={handleChange} className="mr-2" />Visible</label>
                <label className="flex items-center"><input name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleChange} className="mr-2" />Featured</label>
                <label className="flex items-center"><input name="showInHomepage" type="checkbox" checked={formData.showInHomepage} onChange={handleChange} className="mr-2" />Show in Home</label>
                <select name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Brands (comma array)</label>
                <input name="allBrands" value={formData.allBrands?.join(',')} onChange={e => setFormData((prev:any) => ({ ...prev, allBrands: e.target.value.split(',') }))} placeholder="Brands" className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block mb-1">Localization (JSON)</label>
                <textarea name="localization" value={formData.localization} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block mb-1">Attributes (JSON)</label>
                <textarea name="attributes" value={formData.attributes} onChange={handleChange} className="border p-2 rounded w-full" />
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
              <button type="button" onClick={() => setFormOpen(false)} className="ml-2 text-gray-600">Cancel</button>
            </form>
          </div>
        ) : selected ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <img src={selected.image} alt={selected.imageAlt} className="w-full h-32 object-cover rounded" />
              <img src={selected.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded" />
              <img src={selected.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded" />
            </div>
            <p><strong>Icon:</strong> {selected.icon}</p>
            <p><strong>Slug:</strong> {selected.slug}</p>
            <p><strong>Description:</strong> {selected.description || '-'}</p>
            <p><strong>Long Description:</strong> {selected.longDescription || '-'}</p>
            <p><strong>SEO Title:</strong> {selected.seoTitle}</p>
            <p><strong>SEO Description:</strong> {selected.seoDescription}</p>
            <p><strong>Meta Keywords:</strong> {selected.metaKeywords.join(', ')}</p>
            <p><strong>Sort Order:</strong> {selected.sortOrder}</p>
            <p><strong>Product Count:</strong> {selected.productCount}</p>
            <p><strong>Visible:</strong> {selected.visible ? 'Yes' : 'No'}</p>
            <p><strong>Featured:</strong> {selected.isFeatured ? 'Yes' : 'No'}</p>
            <p><strong>Show in Homepage:</strong> {selected.showInHomepage ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <p><strong>Created At:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
            <p><strong>Created By:</strong> {selected.createdBy}</p>
            <p><strong>Updated At:</strong> {new Date(selected.updatedAt).toLocaleString()}</p>\<p><strong>Updated By:</strong> {selected.updatedBy}</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Brands & Tags</h3>
              <p><strong>All Brands:</strong> {selected.allBrands.join(', ')}</p>
              <p><strong>Tags:</strong> {selected.tags.join(', ')}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Subcategories</h3>
              <div className="flex mb-2 items-center">
                <input type="number" value={bulkSort} onChange={e => setBulkSort(+e.target.value)} className="border p-1 rounded w-20 mr-2" placeholder="Sort" />
                <button onClick={applyBulkSort} disabled={subEditIds.length===0} className="bg-green-500 text-white px-3 py-1 rounded disabled:opacity-50">Apply to Selected</button>
              </div>
              <ul className="border rounded divide-y">
                {selected.subcategories.map((sc: any) => {
                  const id = "";//sc._id.$oid ? sc._id.$oid : "" ;
                  return (
                    <li key={id} className="p-2 flex items-center justify-between">
                      <label className="flex items-center"><input type="checkbox" checked={subEditIds.includes(id)} onChange={e => {
                        const next = e.target.checked ? [...subEditIds,id] : subEditIds.filter(x=>x!==id);
                        setSubEditIds(next);
                      }} className="mr-2"/><span>{sc.name}</span></label>
                      <span className="text-sm text-gray-500">Order {sc.sortOrder}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Localization & Attributes</h3>
              <pre className="bg-gray-100 p-2 rounded"><code>{JSON.stringify(selected.localization,null,2)}</code></pre>
              <pre className="bg-gray-100 p-2 rounded mt-2"><code>{JSON.stringify(selected.attributes,null,2)}</code></pre>
            </div>
            <button onClick={() => openForm(selected)} className="mt-6 bg-blue-500 text-white px-4 py-2 rounded">Edit Category</button>
          </div>
        ) : (
          <p>Select a category to view details or click + Add to create one.</p>
        )}
      </div>
    </div>
  );
}
