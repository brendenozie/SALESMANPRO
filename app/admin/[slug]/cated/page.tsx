"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { 
  PhotoIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Types & Interfaces ---

interface Subcategory {
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
  tags: string[];
  metaKeywords: string[];
  sortOrder: number;
  visible: boolean;
  status: string;
  allBrands: string[];
  productCount: number;
  isFeatured: boolean;
  showInHomepage: boolean;
  localization: any;
  attributes: any;
  subcategories: Subcategory[];
}

// --- Helper Functions ---

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

async function compressImage(file: File, maxMb: number = 0.5): Promise<File> {
  const maxSize = maxMb * 1024 * 1024;
  if (file.size <= maxSize) return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const getBlob = (quality: number) => {
          canvas.toBlob((blob) => {
            if (blob) {
              if (blob.size > maxSize && quality > 0.1) {
                getBlob(quality - 0.1);
              } else {
                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" }));
              }
            }
          }, "image/jpeg", quality);
        };
        getBlob(0.8);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

async function uploadFile(files: File[], type: "image" | "video" | "book") {
  if (!files?.length) return [];
  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );
    if (!res.ok) throw new Error("Failed to get signed URL");
    const { uploadUrl, publicUrl } = await res.json();
    const uploadRes = await fetch(uploadUrl, { method: "PUT", body: file });
    if (!uploadRes.ok) throw new Error("Upload failed");
    return { url: publicUrl };
  });
  return Promise.all(uploads);
}

// --- Main Component ---

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Category | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);

  const initialFormState: Partial<Category> = {
    name: "", icon: "", slug: "", image: "", imageAlt: "", thumbnail: "", bannerImage: "",
    description: "", longDescription: "", seoTitle: "", seoDescription: "",
    tags: [], metaKeywords: [], sortOrder: 0, visible: true, status: "Active",
    allBrands: [], productCount: 0, isFeatured: false, showInHomepage: false,
    localization: {}, attributes: {}, subcategories: [],
  };

  const [formData, setFormData] = useState<Partial<Category>>(initialFormState);

  useEffect(() => {
    fetch(`${apiBaseUrl}/admin/get-all-categories?limit=100`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data?.results || []))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const filteredCategories = categories?.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()) || c.slug.toLowerCase().includes(filter.toLowerCase())
  );

  const openForm = (cat: Category | null = null) => {
    setFormData(cat ? { ...cat } : initialFormState);
    setSelected(cat);
    setActiveTab("general");
    setFormOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) val = e.target.checked;
    if (name === "sortOrder" || name === "productCount") val = Number(val);
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // --- Subcategory Logic ---

  const handleSubChange = (idx: number, field: keyof Subcategory, value: any) => {
    setFormData((prev) => {
      const updatedSubs = [...(prev.subcategories || [])];
      updatedSubs[idx] = { ...updatedSubs[idx], [field]: value };
      return { ...prev, subcategories: updatedSubs };
    });
  };

  const addEmptySub = () => {
    setFormData((prev) => {
      const existing = prev.subcategories || [];
      const newSub: Subcategory = {
        id: `temp-${Date.now()}`,
        name: "", slug: "", sortOrder: existing.length + 1, visible: true,
      };
      return { ...prev, subcategories: [...existing, newSub] };
    });
  };

  const removeSub = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter((_, i) => i !== idx).map((s, i) => ({ ...s, sortOrder: i + 1 })),
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setFormData((prev) => {
      const reordered = reorder(prev.subcategories || [], result.source.index, result?.destination?.index || 0);
      return { ...prev, subcategories: reordered.map((s, i) => ({ ...s, sortOrder: i + 1 })) };
    });
  };

  // --- Image Upload Logic ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Category) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setActiveUploadField(fieldName as string);
    try {
      const compressed = await compressImage(file, 0.5);
      const uploads = await uploadFile([compressed], "image");
      if (uploads.length > 0) setFormData((prev) => ({ ...prev, [fieldName]: uploads[0].url }));
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
      setActiveUploadField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selected ? "PUT" : "POST";
    const url = selected ? `${apiBaseUrl}/admin/product-categories/${selected.id}` : `${apiBaseUrl}/admin/product-categories`;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const saved = await res.json();
      setCategories((prev) => (selected ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]));
      setFormOpen(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* --- Sidebar --- */}
      <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto bg-white flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Category Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Organize your store hierarchy and SEO.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm outline-none"
            />
          </div>
          <button onClick={() => openForm(null)} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 shadow-sm transition">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 flex-1">
          {filteredCategories?.map((cat) => (
            <div
              key={cat.id}
              onClick={() => openForm(cat)}
              className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center gap-3 ${
                selected?.id === cat.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {cat.thumbnail ? <img src={cat.thumbnail} className="h-full w-full object-cover" /> : <PhotoIcon className="h-full w-full p-2 text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{cat.name}</h3>
                <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{cat.slug}</p>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* --- Main Panel --- */}
      <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
        {isFormOpen ? (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-100 bg-gray-50/30">
              {["general", "media", "subcategories"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {activeTab === "general" && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Long Description</label>
                    <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                  </div>
                  <div className="col-span-2 flex gap-6 pt-4">
                    {["visible", "isFeatured", "showInHomepage"].map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" name={key} checked={(formData as any)[key]} onChange={handleChange} className="peer hidden" />
                          <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: "Main Image", field: "image" },
                      { label: "Thumbnail", field: "thumbnail" },
                      { label: "Banner", field: "bannerImage" }
                    ].map((item) => (
                      <div key={item.field} className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">{item.label}</label>
                        <div className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden group hover:border-blue-400 transition-colors">
                          {formData[item.field as keyof Category] ? (
                            <>
                              <img src={formData[item.field as keyof Category] as string} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="p-2 bg-white rounded-lg cursor-pointer hover:text-blue-600"><ArrowUpTrayIcon className="h-5 w-5" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, item.field as keyof Category)} /></label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, [item.field]: "" }))} className="p-2 bg-white rounded-lg hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                              </div>
                            </>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                              {uploading && activeUploadField === item.field ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /> : <PlusIcon className="h-8 w-8 text-gray-300" />}
                              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, item.field as keyof Category)} />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900">SEO Configuration</h4>
                    <input name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Meta Title" className="w-full p-3 bg-white border border-gray-200 rounded-xl" />
                    <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} placeholder="Meta Description" className="w-full p-3 bg-white border border-gray-200 rounded-xl" rows={2} />
                  </div>
                </div>
              )}

              {activeTab === "subcategories" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Subcategory Structure</h4>
                    <button type="button" onClick={addEmptySub} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"><PlusIcon className="h-4 w-4" /> Add</button>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="subcategories">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {(formData.subcategories || []).map((sub, idx) => (
                            <Draggable key={sub.id || `sub-${idx}`} draggableId={sub.id || `sub-${idx}`} index={idx}>
                              {(p, s) => (
                                <div ref={p.innerRef} {...p.draggableProps} className={`flex items-center gap-4 p-4 bg-white border rounded-2xl transition-all ${s.isDragging ? "shadow-2xl border-blue-200 ring-4 ring-blue-50" : "border-gray-100 shadow-sm"}`}>
                                  <div {...p.dragHandleProps} className="text-gray-300 hover:text-gray-500 cursor-grab"><Bars3Icon className="h-5 w-5" /></div>
                                  <div className="flex-1 grid grid-cols-2 gap-4">
                                    <input value={sub.name} onChange={(e) => handleSubChange(idx, "name", e.target.value)} placeholder="Name" className="p-2 text-sm bg-gray-50 rounded-lg border-none focus:ring-1 focus:ring-blue-500" />
                                    <input value={sub.slug} onChange={(e) => handleSubChange(idx, "slug", e.target.value)} placeholder="Slug" className="p-2 text-sm bg-gray-50 rounded-lg border-none focus:ring-1 focus:ring-blue-500" />
                                  </div>
                                  <button type="button" onClick={() => handleSubChange(idx, "visible", !sub.visible)} className={`p-2 rounded-lg ${sub.visible ? "text-blue-600 bg-blue-50" : "text-gray-300 bg-gray-50"}`}>
                                    {sub.visible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                                  </button>
                                  <button type="button" onClick={() => removeSub(idx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-8 border-t border-gray-50">
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition">Discard</button>
                <button type="submit" className="px-10 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 transition transform active:scale-95">Save Changes</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
                <PhotoIcon className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">System Ready</h2>
                <p className="text-gray-500 max-w-xs mt-3 text-sm font-medium">Select or create a category to begin managing your store structure.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// interface Subcategory {
//   id: string | null;
//   name: string;
//   slug: string;
//   sortOrder: number;
//   visible: boolean;
// }

// interface Category {
//   id: string;
//   name: string;
//   icon: string;
//   slug: string;
//   image: string;
//   imageAlt: string;
//   thumbnail: string;
//   bannerImage: string;
//   description: string;
//   longDescription: string;
//   seoTitle: string;
//   seoDescription: string;
//   tags: string[];
//   metaKeywords: string[];
//   sortOrder: number;
//   visible: boolean;
//   status: string;
//   allBrands: string[];
//   productCount: number;
//   isFeatured: boolean;
//   showInHomepage: boolean;
//   createdAt: string;
//   updatedAt: string;
//   createdBy: string;
//   updatedBy: string;
//   localization: any;
//   attributes: any;
//   subcategories: Subcategory[];
// }

// // Reorder helper for drag-and-drop
// const reorder = (list: any[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

// async function compressImage(file: File, maxMb: number = 0.5): Promise<File> {
//   const maxSize = maxMb * 1024 * 1024;
//   if (file.size <= maxSize) return file;

//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (event) => {
//       const img = new Image();
//       img.src = event.target?.result as string;
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         let width = img.width;
//         let height = img.height;
//         const MAX_WIDTH = 1920;
//         if (width > MAX_WIDTH) {
//           height = Math.round((height * MAX_WIDTH) / width);
//           width = MAX_WIDTH;
//         }
//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext("2d");
//         ctx?.drawImage(img, 0, 0, width, height);

//         const getBlob = (quality: number) => {
//           canvas.toBlob((blob) => {
//             if (blob) {
//               if (blob.size > maxSize && quality > 0.1) {
//                 getBlob(quality - 0.1);
//               } else {
//                 resolve(new File([blob], file.name, { type: "image/jpeg" }));
//               }
//             }
//           }, "image/jpeg", quality);
//         };
//         getBlob(0.8);
//       };
//     };
//     reader.onerror = (error) => reject(error);
//   });
// }

// async function uploadFile(files: File[], type: "image" | "video" | "book") {
//   if (!files?.length) return [];
//   const uploads = files.map(async (file) => {
//     const res = await fetch(
//       `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
//     );
//     if (!res.ok) throw new Error("Failed to get signed URL");
//     const { uploadUrl, publicUrl } = await res.json();
//     const uploadRes = await fetch(uploadUrl, { method: "PUT", body: file });
//     if (!uploadRes.ok) throw new Error("Upload failed");
//     return { url: publicUrl };
//   });
//   return Promise.all(uploads);
// }


// export default function CategoryManager() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [filter, setFilter] = useState("");
//   const [selected, setSelected] = useState<Category | null>(null);
//   const [isFormOpen, setFormOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("general");
//   const [uploading, setUploading] = useState(false);

//   const [formData, setFormData] = useState<Partial<Category>>({
//     name: "",
//     icon: "",
//     slug: "",
//     image: "",
//     imageAlt: "",
//     thumbnail: "",
//     bannerImage: "",
//     description: "",
//     longDescription: "",
//     seoTitle: "",
//     seoDescription: "",
//     tags: [],
//     metaKeywords: [],
//     sortOrder: 0,
//     visible: true,
//     status: "Active",
//     allBrands: [],
//     productCount: 0,
//     isFeatured: false,
//     showInHomepage: false,
//     localization: {},
//     attributes: {},
//     subcategories: [],
//   });

//   useEffect(() => {
//     fetch(`${apiBaseUrl}/admin/get-all-categories?limit=100`, {
//       method: "GET",
//       headers: { 
//         "Content-Type": "application/json", 
//         'Credentials': 'include' },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setCategories(data.data?.results);
//       })
//       .catch((err) => console.error("Failed to fetch categories:", err));
//   }, []);

//   const filteredCategories = categories && categories?.filter((c) =>
//     c.name.toLowerCase().includes(filter.toLowerCase()) ||
//     c.slug.toLowerCase().includes(filter.toLowerCase())
//   );

//   const openForm = (cat: Category | null = null) => {
//     if (cat) {
//       setFormData({
//         ...cat,
//         tags: cat.tags.slice(),
//         metaKeywords: cat.metaKeywords.slice(),
//         subcategories: cat.subcategories.map((sc) => ({ ...sc })),
//       });
//       setSelected(cat);
//       setActiveTab("general");
//     } else {
//       setFormData({
//         name: "",
//         icon: "",
//         slug: "",
//         image: "",
//         imageAlt: "",
//         thumbnail: "",
//         bannerImage: "",
//         description: "",
//         longDescription: "",
//         seoTitle: "",
//         seoDescription: "",
//         tags: [],
//         metaKeywords: [],
//         sortOrder: 0,
//         visible: true,
//         status: "Active",
//         allBrands: [],
//         productCount: 0,
//         isFeatured: false,
//         showInHomepage: false,
//         localization: {},
//         attributes: {},
//         subcategories: [],
//       });
//       setSelected(null);
//       setActiveTab("general");
//     }
//     setFormOpen(true);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     let val: any = value;
//     if (type === "checkbox" && e.target instanceof HTMLInputElement) {
//       val = e.target.checked;
//     }
//     if (name === "sortOrder" || name === "productCount") val = Number(val);
//     if (name === "tags" || name === "metaKeywords" || name === "allBrands") {
//       val = (value as string).split(",").map((s) => s.trim()).filter((s) => s.length);
//     }
//     setFormData((prev) => ({
//       ...prev,
//       [name]: val,
//     }));
//   };

//   const addEmptySub = () => {
//     setFormData((prev) => {
//       const existing: Subcategory[] = prev.subcategories || [];
//       return {
//         ...prev,
//         subcategories: [
//           ...existing,
//           {
//             id: null,
//             name: "",
//             slug: "",
//             sortOrder: existing.length + 1,
//             visible: true,
//           },
//         ],
//       };
//     });
//   };

//   const removeSub = (idx: number) => {
//     setFormData((prev) => {
//       const arr: Subcategory[] = prev.subcategories || [];
//       const next = arr.filter((_, i) => i !== idx);
//       return {
//         ...prev,
//         subcategories: next,
//       };
//     });
//   };

//   const handleSubChange = (
//     idx: number,
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target;
//     setFormData((prev) => {
//       const arr: Subcategory[] = (prev.subcategories || []).slice();
//       let val: any = value;
//       if (type === "checkbox" && e.target instanceof HTMLInputElement) {
//         val = e.target.checked;
//       }
//       if (name === "sortOrder") val = Number(val);
//       arr[idx] = { ...arr[idx], [name]: val };
//       return {
//         ...prev,
//         subcategories: arr,
//       };
//     });
//   };

//   const onDragEnd = (result: any) => {
//     if (!result.destination) return;

//     setFormData((prev) => {
//       const reorderedSubs = reorder(
//         prev.subcategories || [],
//         result.source.index,
//         result.destination.index
//       ).map((sub, index) => ({ ...sub, sortOrder: index + 1 }));
//       return { ...prev, subcategories: reorderedSubs };
//     });
//   };

//     const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       setUploading(true);
//       try {
//         const compressed = await compressImage(file, 0.5);
//         const [{ url }] = await uploadFile([compressed], "image");
//         setFormData((prev) => ({ ...prev, image: url }));
//       } catch (error) {
//         alert("Upload failed.");
//       } finally {
//         setUploading(false);
//       }
//     };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload: any = {
//       ...formData,
//       tags: formData.tags || [],
//       metaKeywords: formData.metaKeywords || [],
//       allBrands: formData.allBrands || [],
//       localization: formData.localization,
//       attributes: formData.attributes,
//       subcategories: (formData.subcategories || []).map((sc) => ({
//         ...sc,
//       })),
//     };

//     const method = selected ? "PUT" : "POST";
//     const url = selected
//       ? `${apiBaseUrl}/admin/product-categories/${selected.id}`
//       : `${apiBaseUrl}/admin/product-categories`;

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const saved = await res.json();
//       if (selected) {
//         setCategories((cats) =>
//           cats.map((c) => (c.id === saved.id ? saved : c))
//         );
//       } else {
//         setCategories((cats) => [saved, ...cats]);
//       }
//       setFormOpen(false);
//       setSelected(saved);
//     } catch (error) {
//       console.error("Failed to save category:", error);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 font-sans">
//       {/* ─── Sidebar (List of categories) ─── */}
//       <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto bg-white">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Category Manager</h1>
//           <p className="text-gray-500">Manage and organize your product categories and subcategories.</p>
//         </div>
//         <div className="flex justify-between items-center mb-4">
//           <div className="relative flex-grow mr-4">
//             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
//             <input
//               type="text"
//               placeholder="Search categories..."
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
//             />
//           </div>
//           <button
//             onClick={() => openForm(null)}
//             className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
//           >
//             <span className="mr-2">➕</span> Add New
//           </button>
//         </div>
//         <div className="space-y-3">
//           {filteredCategories && filteredCategories?.length > 0 ? (
//             filteredCategories?.map((cat) => (
//               <div
//                 key={cat.id}
//                 onClick={() => openForm(cat)}
//                 className={`
//                   p-4 rounded-xl shadow-sm cursor-pointer border transition-all duration-200
//                   ${selected?.id === cat.id ? "bg-blue-50 border-blue-400 scale-105" : "bg-gray-50 border-gray-200 hover:shadow-md hover:bg-gray-100"}
//                 `}
//               >
//                 <div className="flex items-center">
//                   {cat.thumbnail && (
//                     <img src={cat.thumbnail} alt={cat.imageAlt} className="w-12 h-12 object-cover rounded-md mr-4" />
//                   )}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
//                     <p className="text-sm text-gray-500">{cat.slug}</p>
//                   </div>
//                   {cat.isFeatured && (
//                     <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium ml-2">Featured</span>
//                   )}
//                   {cat.status === "Inactive" && (
//                     <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium ml-2">Inactive</span>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500 text-center mt-8">No categories found. Add a new one to get started!</p>
//           )}
//         </div>
//       </div>

//       {/* ─── Main Panel ─── */}
//       <div className="w-2/3 p-10 overflow-y-auto bg-gray-100">
//         {isFormOpen ? (
//           // ─── Category Form (Tabbed) ───
//           <div className="bg-white p-8 rounded-2xl shadow-xl">
//             <div className="flex items-center mb-6">
//                 <h2 className="text-3xl font-bold text-gray-800">
//                     {selected ? "Edit Category" : "New Category"}
//                 </h2>
//                 <span className="text-gray-400 ml-4">
//                     {selected ? selected.name : ""}
//                 </span>
//             </div>
            
//             {/* Tab Navigation */}
//             <div className="border-b border-gray-200 mb-6">
//               <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//                 <button
//                   type="button"
//                   onClick={() => setActiveTab("general")}
//                   className={`
//                     whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg
//                     ${activeTab === "general" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
//                   `}
//                 >
//                   General
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setActiveTab("media")}
//                   className={`
//                     whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg
//                     ${activeTab === "media" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
//                   `}
//                 >
//                   Media & SEO
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setActiveTab("subcategories")}
//                   className={`
//                     whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg
//                     ${activeTab === "subcategories" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
//                   `}
//                 >
//                   Subcategories
//                 </button>
//               </nav>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Tab: General */}
//               {activeTab === "general" && (
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <label className="block">
//                       <span className="text-gray-700 font-medium">Category Name*</span>
//                       <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="e.g., Electronics" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                     </label>
//                     <label className="block">
//                       <span className="text-gray-700 font-medium">Slug*</span>
//                       <input name="slug" value={formData.slug || ""} onChange={handleChange} placeholder="e.g., electronics" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                     </label>
//                   </div>
//                   <label className="block">
//                     <span className="text-gray-700 font-medium">Description</span>
//                     <textarea name="description" value={formData.description || ""} onChange={handleChange} placeholder="A short description of the category..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" rows={2} />
//                   </label>
//                   <label className="block">
//                     <span className="text-gray-700 font-medium">Long Description</span>
//                     <textarea name="longDescription" value={formData.longDescription || ""} onChange={handleChange} placeholder="A more detailed description..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" rows={4} />
//                   </label>
//                   <div className="grid grid-cols-3 gap-4">
//                     <label className="flex items-center space-x-2">
//                         <input name="visible" type="checkbox" checked={formData.visible ?? false} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
//                         <span className="text-gray-700">Visible</span>
//                     </label>
//                     <label className="flex items-center space-x-2">
//                         <input name="isFeatured" type="checkbox" checked={formData.isFeatured ?? false} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
//                         <span className="text-gray-700">Featured</span>
//                     </label>
//                     <label className="flex items-center space-x-2">
//                         <input name="showInHomepage" type="checkbox" checked={formData.showInHomepage ?? false} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
//                         <span className="text-gray-700">Show on Homepage</span>
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {/* Tab: Media & SEO */}
//               {activeTab === "media" && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-2 gap-6">
//                     <label className="block">
//                       <span className="text-gray-700 font-medium">Main Image URL</span>
//                       <input name="image" value={formData.image || ""} onChange={handleChange} placeholder="https://example.com/image.jpg" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                       {formData.image && <img src={formData.image} alt="Main image preview" className="mt-2 w-full h-40 object-cover rounded-lg shadow-md" />}
//                     </label>
//                     <label className="block">
//                       <span className="text-gray-700 font-medium">Thumbnail Image URL</span>
//                       <input name="thumbnail" value={formData.thumbnail || ""} onChange={handleChange} placeholder="https://example.com/thumbnail.jpg" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                       {formData.thumbnail && <img src={formData.thumbnail} alt="Thumbnail preview" className="mt-2 w-full h-40 object-cover rounded-lg shadow-md" />}
//                     </label>
//                   </div>
//                   <label className="block">
//                       <span className="text-gray-700 font-medium">Banner Image URL</span>
//                       <input name="bannerImage" value={formData.bannerImage || ""} onChange={handleChange} placeholder="https://example.com/banner.jpg" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                       {formData.bannerImage && <img src={formData.bannerImage} alt="Banner preview" className="mt-2 w-full h-40 object-cover rounded-lg shadow-md" />}
//                     </label>
//                   <div>
//                     <h3 className="text-xl font-bold mb-2 text-gray-800">SEO Information</h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <label className="block">
//                         <span className="text-gray-700 font-medium">SEO Title</span>
//                         <input name="seoTitle" value={formData.seoTitle || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                       </label>
//                       <label className="block">
//                         <span className="text-gray-700 font-medium">SEO Description</span>
//                         <input name="seoDescription" value={formData.seoDescription || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Tab: Subcategories */}
//               {activeTab === "subcategories" && (
//                 <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-xl font-bold">Subcategories</h3>
//                     <button type="button" onClick={addEmptySub} className="bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition duration-200">
//                       <span className="mr-2">➕</span> Add Subcategory
//                     </button>
//                   </div>
                  
//                   <DragDropContext onDragEnd={onDragEnd}>
//                     <Droppable droppableId="subcategories">
//                       {(provided) => (
//                         <div {...provided.droppableProps} ref={provided.innerRef}>
//                           {(formData.subcategories || []).map((sub, idx) => (
//                             <Draggable key={sub.id || `new-${idx}`} draggableId={sub.id || `new-${idx}`} index={idx}>
//                               {(provided) => (
//                                 <div
//                                   ref={provided.innerRef}
//                                   {...provided.draggableProps}
//                                   {...provided.dragHandleProps}
//                                   className="flex items-center space-x-4 p-3 mb-2 bg-white rounded-lg border border-gray-200 shadow-sm"
//                                 >
//                                   <span className="text-gray-400 cursor-grab">
//                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                       <path d="M5 5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V5zM4 9a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V9zM4 13a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
//                                     </svg>
//                                   </span>
//                                   <input name="name" value={sub.name} onChange={(e) => handleSubChange(idx, e)} placeholder="Name" className="flex-1 rounded-md border-gray-300 p-2" />
//                                   <input name="slug" value={sub.slug} onChange={(e) => handleSubChange(idx, e)} placeholder="Slug" className="flex-1 rounded-md border-gray-300 p-2" />
//                                   <span className="text-gray-500 w-16 text-center">Order {sub.sortOrder}</span>
//                                   <label className="flex items-center space-x-2">
//                                     <input name="visible" type="checkbox" checked={sub.visible} onChange={(e) => handleSubChange(idx, e)} className="rounded text-blue-600 focus:ring-blue-500" />
//                                     <span>Visible</span>
//                                   </label>
//                                   <button type="button" onClick={() => removeSub(idx)} className="text-red-500 hover:text-red-700 transition duration-200">
//                                     🗑️
//                                   </button>
//                                 </div>
//                               )}
//                             </Draggable>
//                           ))}
//                           {provided.placeholder}
//                         </div>
//                       )}
//                     </Droppable>
//                   </DragDropContext>
//                 </div>
//               )}
            
//               <div className="flex gap-4 mt-8">
//                 <button
//                   type="submit"
//                   className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105"
//                 >
//                   Save Category
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setFormOpen(false)}
//                   className="px-6 py-3 text-gray-600 rounded-full hover:bg-gray-200 transition duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         ) : selected ? (
//           // ─── View-only / Details Mode ───
//           <div className="bg-white p-8 rounded-2xl shadow-xl">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-3xl font-bold text-gray-800">{selected.name}</h2>
//               <button
//                 onClick={() => openForm(selected)}
//                 className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
//               >
//                 <span className="mr-2">✏️</span> Edit Category
//               </button>
//             </div>
            
//             {/* Image Gallery */}
//             <div className="grid grid-cols-3 gap-4 mb-8">
//                 {selected.image && <img src={selected.image} alt={selected.imageAlt} className="w-full h-32 object-cover rounded-lg shadow-md" />}
//                 {selected.thumbnail && <img src={selected.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded-lg shadow-md" />}
//                 {selected.bannerImage && <img src={selected.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded-lg shadow-md" />}
//             </div>

//             <div className="grid grid-cols-2 gap-8 mb-8">
//               <div>
//                 <p className="text-gray-500 font-medium">Description</p>
//                 <p className="text-gray-700">{selected.description || "-"}</p>
//                 <p className="text-gray-500 font-medium mt-4">Long Description</p>
//                 <p className="text-gray-700">{selected.longDescription || "-"}</p>
//               </div>
//               <div className="space-y-2">
//                 <p><strong>Icon:</strong> {selected.icon || "-"}</p>
//                 <p><strong>Slug:</strong> {selected.slug}</p>
//                 <p><strong>Status:</strong> <span className={`font-semibold ${selected.status === "Active" ? "text-green-600" : "text-red-600"}`}>{selected.status}</span></p>
//                 <p><strong>Visible:</strong> {selected.visible ? "Yes" : "No"}</p>
//                 <p><strong>Featured:</strong> {selected.isFeatured ? "Yes" : "No"}</p>
//                 <p><strong>Show on Home:</strong> {selected.showInHomepage ? "Yes" : "No"}</p>
//                 <p><strong>Sort Order:</strong> {selected.sortOrder}</p>
//                 <p><strong>Product Count:</strong> {selected.productCount}</p>
//               </div>
//             </div>

//             {/* Brands & Tags */}
//             <div className="mb-8">
//               <h3 className="text-xl font-bold mb-2">Brands & Tags</h3>
//               <div className="flex flex-wrap gap-2">
//                 {selected.allBrands.map((brand, idx) => (
//                     <span key={idx} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
//                         {brand}
//                     </span>
//                 ))}
//                 {selected.tags.map((tag, idx) => (
//                     <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
//                         {tag}
//                     </span>
//                 ))}
//               </div>
//             </div>

//             {/* Subcategories */}
//             <div className="mb-8">
//               <h3 className="text-xl font-bold mb-2">Subcategories</h3>
//               <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
//                 {selected.subcategories.map((sc) => (
//                   <li key={sc.id} className="p-3 flex justify-between items-center bg-gray-50">
//                     <span>{sc.name}</span>
//                     <span className="text-sm text-gray-500">Order {sc.sortOrder}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
            
//             {/* Localization & Attributes (Collapsible) */}
//             <details className="group cursor-pointer">
//                 <summary className="flex justify-between items-center text-xl font-bold text-gray-800 p-2 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200">
//                     <span>Localization & Attributes</span>
//                     <span className="transform transition-transform duration-200 group-open:rotate-90">▶️</span>
//                 </summary>
//                 <div className="p-4 bg-gray-50 rounded-b-lg space-y-4">
//                     <div>
//                         <p className="font-semibold text-gray-600">Localization</p>
//                         <pre className="bg-gray-200 p-3 rounded-md text-sm mt-1 overflow-x-auto">
//                             <code>{JSON.stringify(selected.localization, null, 2)}</code>
//                         </pre>
//                     </div>
//                     <div>
//                         <p className="font-semibold text-gray-600">Attributes</p>
//                         <pre className="bg-gray-200 p-3 rounded-md text-sm mt-1 overflow-x-auto">
//                             <code>{JSON.stringify(selected.attributes, null, 2)}</code>
//                         </pre>
//                     </div>
//                 </div>
//             </details>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
//             <p className="text-2xl font-semibold mb-2">Welcome to Category Management</p>
//             <p>Select a category from the left to view its details or click the "Add New" button to create a new one.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }