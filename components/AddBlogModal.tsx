'use client';

import React, { useState, useEffect, useMemo } from "react";

import Modal from "./Modal";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import CategoryPicker from "./CategoryPicker";
import ImageUploader, { UnifiedMediaItem } from "./ImageUploader";
import Stepper from "./Stepper";

// load the new package dynamically, no ssr
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { set } from "lodash";


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "blockquote", "code-block"],
    ["clean"],
  ],
};

const STEP_LABELS: Record<number, string> = {
  1: "Categories & Tags",
  2: "Details",
  3: "Images",
  4: "SEO",
  5: "Review",
};

// interface UnifiedMediaItem {
//   id?: string;
//   file?: File;
//   url: string;
//   source: "local" | "server";
// }

export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      // ✅ Step 1: Request a signed upload URL from your API
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

      // ✅ Step 2: Upload directly to S3
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress, file);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}`));
        xhr.send(file);
      });

      console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
      return { url: publicUrl, key, contentType };
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
}
interface AddEditBlogModalProps {
  show: boolean;
  onClose: () => void;
  categoriesData: any[];
  initialData?: any;  
  companyId?: string;
}

export default function AddEditBlogModal({
  show,
  onClose,
  initialData = {},
  categoriesData = [],
  companyId
}: AddEditBlogModalProps) {

  const totalSteps = Object.keys(STEP_LABELS).length;
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<any>({
    id: initialData.id || "",
    title: initialData.title || "",
    slug: initialData.slug || "",
    excerpt: initialData.excerpt || "",
    content: initialData.content || "",
    isFeature: initialData.isFeature || false,
    status: initialData.status || "DRAFT",
    categories: initialData.categories || [],
    tags: initialData.tags || [],
    coverImage: initialData.coverImage || "",
    seoTitle: initialData.seo?.title || "",
    seoDescription: initialData.seo?.description || "",
    metaKeywords: initialData.seo?.keywords || [],
    category: initialData.category || null,
    subCategory: initialData.subCategory || null,
    brand: initialData.brand || null,
    companyId: companyId,
    author: initialData.author || "Admin",
  });

  const [mounted, setMounted] = useState(false);

  // const [newImages, setNewImages] = useState<UnifiedMediaItem[]>([]);
  // const [newImages, setNewImages] = useState<UnifiedMediaItem[]>([]);
   const [images, setImages] = useState<UnifiedMediaItem[]>(
      formData?.images?.map((img: any, idx: number) => ({ index: idx, url: img.url, source: 'server' })) || []
    );
  // Sync unified media state when formData changes
    // useEffect(() => {
    //   setImages(
    //     formData.images?.map((img: any, idx: number) => ({
    //       id: img.url || `server-img-${idx}`,
    //       url: typeof img === 'string' ? img : img.url,
    //       source: 'server',
    //       file: undefined,
    //       title: "Untitled Image",
    //       author: "Unknown",
    //       coverPreviewUrl: undefined,
    //       fileName: undefined,
    //     })) || []
    //   );
    // }, [formData.images]);
    
   // Generic handler
   const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "tags" || name === "categories"
          ? // split comma-separated lists
            value.split(",").map((s) => s.trim()).filter(Boolean)
          : value,
    }));
  };

  const handleQuillChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, content: value }));
  };

  const isStepValid = useMemo(() => {
    if (step === 1) return formData.category && formData.subCategory;
    if (step === 2) return formData.title && formData.content.length > 20;
    if (step === 3) return images.length > 0 || images.length > 0;
    if (step === 4) return formData.seoTitle && formData.seoDescription;
    return true;
  }, [step, formData, images]);

  // const uploadFile = async (file: File, type: string): Promise<string> => {
  //   try {
  //     const fd = new FormData();
  //     fd.append("file", file);
  //     fd.append("type", type);

  //     const res = await fetch(`${apiBaseUrl}/admin/upload`, {
  //       method: "POST",
  //       body: fd,
  //     });

  //     if (!res.ok) {
  //       console.error("File upload failed", await res.text());
  //       return "";
  //     }

  //     const data = await res.json();
  //     // expect the upload endpoint to return { url: "https://..." } or similar
  //     return data?.url ?? data?.path ?? "";
  //   } catch (err) {
  //     console.error("Upload error", err);
  //     return "";
  //   }
  // };

  const handleSubmit = async () => {
    const newImageItems = images.filter(i => i.source === "local" && i.file);
    
    // 2. Create upload promises for new files
    const uploadImagePromises = newImageItems.map(item =>
      uploadFiles([item.file!], "image", (progress, file) => {
        console.log(`Uploading image ${file.name}: ${progress}%`);
      }).then(result => ({ id: item.id, url: result[0].url }))
    );

    // 3. Run all uploads in parallel
    const [uploadedImages] = await Promise.all([
      Promise.all(uploadImagePromises),
    ]);

    // 4. Create lookup maps for quick access
    const imageUrlMap = new Map(uploadedImages.map(i => [i.id, i.url]));

    // 5. Build final URL arrays (server + newly uploaded)
    const finalImageUrls = images
      .map(img => (img.source === "server" ? img.url : imageUrlMap.get(img.id)!))
      .filter(Boolean);

    const payload = {
      id: formData.id,
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      isFeature: formData.isFeature,
      status: formData.status,
      categories: [formData.category?.displayName],
      tags: formData.tags,
      coverImage: finalImageUrls[0] || "",
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.metaKeywords,
      },
      companyId: formData.companyId,
      author: formData.author,
    };

    await fetch(`${apiBaseUrl}/admin/post-blog`, {
      method: formData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    onClose();
  };

  return (
    <Modal isOpen={show} onClose={onClose}>
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {formData.id ? "Edit Blog" : "Add New Blog"}
          </h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Stepper */}
        <Stepper
          step={step}
          stepsForCategory={[1, 2, 3, 4, 5]}
          STEP_LABELS={STEP_LABELS}
        />

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-grow overflow-auto p-4"
        >
          {step === 1 && (
            <CategoryPicker
              formData={formData}
              categories={categoriesData}
              filteredBrands={[]}
              onCategoryChange={(cat) =>
                setFormData((f: any) => ({
                  ...f,
                  category: cat,
                  subCategory: null,
                  brand: null,
                }))
              }
              onSubCategoryChange={(sub) =>
                setFormData((f: any) => ({ ...f, subCategory: sub }))
              }
              onBrandChange={(b) =>
                setFormData((f: any) => ({ ...f, brand: b }))
              }
            />
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Blog Details</h3>
              <label className="block text-sm font-medium">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />

              <label className="block text-sm font-medium">Slug</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />

              <label className="block text-sm font-medium">Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows={3}
              />

              <label className="block text-sm font-medium">Content</label>
              {mounted ? (
                <ReactQuill
                  value={formData.content}
                  onChange={handleQuillChange}
                  modules={modules}
                  theme="snow"
                />
              ) : (
                <div className="h-40 border rounded bg-gray-50" />
              )}

              <div className="flex space-x-4 items-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isFeature"
                    checked={formData.isFeature}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Feature this post
                </label>

                <label className="inline-flex items-center">
                  Status:
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="ml-2 border rounded p-1"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium">Tags</label>
              <input
                name="tags"
                value={formData.tags.join(", ")}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
          )}

          {step === 3 && (
            <ImageUploader
              images={images}
              setImages={setImages}
              videos={[]}
              setVideos={() => {}}
              books={[]}
              setBooks={() => {}}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <label className="block text-sm font-medium">SEO Title</label>
              <input
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
              <label className="block text-sm font-medium">SEO Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows={3}
              />
              <label className="block text-sm font-medium">Meta Keywords</label>
              <input
                name="metaKeywords"
                value={formData.metaKeywords.join(", ")}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    metaKeywords: e.target.value
                      .split(",")
                      .map((s) => s.trim()),
                  }))
                }
                className="w-full border rounded p-2"
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Review before submitting</h3>
              <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => {
                if (!isStepValid) return alert("Complete this step first.");
                setStep(step + 1);
              }}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next <ArrowRightIcon className="h-5 w-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
