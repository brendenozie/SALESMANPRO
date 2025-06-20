// components/AddEditBlogModal.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "./Modal";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import CategoryPicker from "./CategoryPicker";
import ImageUploader from "./ImageUploader";
import Stepper from "./Stepper";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Step 2: a simple textarea for content—swap for a full editor if you like
const ContentEditor: React.FC<{ formData: any; setFormData: any }> = ({
  formData,
  setFormData,
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">Content</label>
    <textarea
      name="content"
      value={formData.content}
      onChange={(e) =>
        setFormData((f: any) => ({ ...f, content: e.target.value }))
      }
      rows={8}
      className="w-full border rounded p-2"
    />
  </div>
);

// Step 3: SEO fields
const SeoFields: React.FC<{ formData: any; setFormData: any }> = ({
  formData,
  setFormData,
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium">SEO Title</label>
      <input
        name="seoTitle"
        value={formData.seoTitle}
        onChange={(e) =>
          setFormData((f: any) => ({ ...f, seoTitle: e.target.value }))
        }
        className="mt-1 w-full border rounded p-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium">SEO Description</label>
      <textarea
        name="seoDescription"
        value={formData.seoDescription}
        onChange={(e) =>
          setFormData((f: any) => ({ ...f, seoDescription: e.target.value }))
        }
        rows={3}
        className="mt-1 w-full border rounded p-2"
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Meta Keywords (comma‑sep)</label>
      <input
        name="metaKeywords"
        value={(formData.metaKeywords || []).join(", ")}
        onChange={(e) =>
          setFormData((f: any) => ({
            ...f,
            metaKeywords: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }))
        }
        className="mt-1 w-full border rounded p-2"
      />
    </div>
  </div>
);

// Review step
const ReviewStep: React.FC<{ formData: any }> = ({ formData }) => (
  <div className="space-y-2">
    <h3 className="font-semibold">Review before submitting</h3>
    <p><strong>Title:</strong> {formData.title}</p>
    <p><strong>Slug:</strong> {formData.slug}</p>
    <p><strong>Categories:</strong> {(formData.categories || []).join(", ")}</p>
    <p><strong>Tags:</strong> {(formData.tags || []).join(", ")}</p>
    <p className="whitespace-pre-wrap"><strong>Content:</strong> {formData.content}</p>
    <p><strong>SEO Title:</strong> {formData.seoTitle}</p>
    <p><strong>Images:</strong> {formData.images?.length || 0} uploaded</p>
    <p><strong>Meta Keywords:</strong> {(formData.metaKeywords||[]).join(", ")}</p>
  </div>
);

// Step mappings
const FORM_COMPONENTS: Record<number, React.FC<any>> = {
  1: CategoryPicker,
  2: ContentEditor,
  3: ImageUploader,
  4: SeoFields,
  5: ReviewStep,
};

// Labels
const STEP_LABELS: Record<number, string> = {
  1: "Categories & Tags",
  2: "Content",
  3: "Images",
  4: "SEO",
  5: "Review",
};

interface AddEditBlogModalProps {
  show: boolean;
  onClose: () => void;
  categoriesData:any[];
  initialData?: any; // if editing, pass existing blog data
}

export default function AddEditBlogModal({
  show,
  onClose,
  initialData = {},
  categoriesData = []
}: AddEditBlogModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = Object.keys(FORM_COMPONENTS).length;

  const [formData, setFormData] = useState({
    id: initialData.id || "",
    title: initialData.title || "",
    slug: initialData.slug || "",
    category: initialData.category || [],
    tags: initialData.tags || [],
    content: initialData.content || "",
    images: initialData.images || [],   
    seoTitle: initialData.seo?.title || "",
    seoDescription: initialData.seo?.description || "",
    metaKeywords: initialData.seo?.keywords || [],
  });

  // Images state
  const [newImages, setNewImages] = useState<File[]>([]);
  const [images, setImages] = useState<any[]>(
    initialData?.images?.map((img: any, index: number) => ({ ...img, index })) || []
  );
  const [loading, setLoading] = useState(false);

  // Reset when initialData changes (i.e. opening for a new blog)
  useEffect(() => {
    setFormData({
      id: initialData.id || "",
      title: initialData.title || "",
      slug: initialData.slug || "",
      category: initialData.category || [],
      tags: initialData.tags || [],
      content: initialData.content || "",
      images: initialData.images || [],
      seoTitle: initialData.seo?.title || "",
      seoDescription: initialData.seo?.description || "",
      metaKeywords: initialData.seo?.keywords || [],
    });
    setStep(1);
  }, [initialData]);

  const FormComponent = FORM_COMPONENTS[step];

  // Generic input change handler
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, type, value, checked } = e.target as HTMLInputElement;
  
      setFormData((prev: any) => {
        let updatedData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
  
        // If pricing fields change, recalc finalPrice & profitMargin
        if (["costPrice", "salesPrice", "discount"].includes(name)) {
          const cost = parseFloat(updatedData.costPrice) || 0;
          const sales = parseFloat(updatedData.salesPrice) || 0;
          const disc = parseFloat(updatedData.discount) || 0;
          updatedData.finalPrice = +(
            sales -
            (sales * disc) / 100
          ).toFixed(2);
          updatedData.profitMargin = cost > 0 ? +(((sales - cost) / cost) * 100).toFixed(1) : 0;
        }
  
        return updatedData;
      });
    };
  
    // Upload logic (unchanged)
    async function uploadWithRetry(file: any, retries = 3) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await uploadFile(file, "image");
        } catch (error) {
          console.error(`Upload failed for ${file.name}, attempt ${attempt}`);
          if (attempt === retries) {
            return null;
          }
        }
      }
    }
  
    const uploadFile = async (file: File, type: string) => {
      const data = new FormData();
      data.append("file", file);
      data.append("type", type);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      return json.url;
    };

   // Subcategories and brands filtered from selected category
   const filteredSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.subcategories || [];
  }, [formData.category]);

  const filteredBrands = useMemo(() => {
    if (!formData.category) return [];
    return formData.category.allBrands || [];
  }, [formData.category]);

  const handleSubmit = async () => {
    let updatedImages = images;

    if (newImages.length > 0) {
      const newImgsWithId = newImages.map((file, idx) => ({
        id: crypto.randomUUID(),
        file,
        index: idx,
      }));

      const uploadedUrls = await Promise.all(
        newImgsWithId.map(async ({ id, file, index }) => {
          const url = await uploadWithRetry(file);
          return url ? { id, url, index } : null;
        })
      );

      const success = uploadedUrls.filter((u) => !!u) as any[];
      const failed = newImgsWithId.filter(
        ({ id }) => !success.some((u) => u.id === id)
      );

      if (failed.length > 0) {
        setLoading(false);
        alert(
          `The following images failed: ${failed.map((f) => f.file.name).join(", ")}`
        );
        return;
      }

      // Replace placeholder images with actual URLs
      updatedImages = images.map((img: any, idx: number) => {
        const match = success.find((u) => u.index === idx);
        return match ? { ...img, url: match.url } : img;
      });

      setImages(updatedImages);
      setNewImages([]);
    }

    const payload = {
      ...formData,
      images:  images.map((i) => i.url),     
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.metaKeywords,
      },
    };
    const res = await fetch(`${apiUrl}/admin/post-product`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      onClose();
    } else {
      alert("Error saving blog");
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose}>
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-3xl mx-auto h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {formData.id ? "Edit Blog" : "Add New Blog"}
          </h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <Stepper
          step={step}
          stepsForCategory={Array(totalSteps)
            .fill(0)
            .map((_, i) => i + 1)}
          STEP_LABELS={STEP_LABELS}
        />

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-grow overflow-auto p-4"
        >
          <FormComponent formData={formData} 
                         setFormData={setFormData} 
                         categories={categoriesData}
                         filteredSubCategories={filteredSubCategories}
                          filteredBrands={filteredBrands}
                          handleInputChange={handleInputChange}
                          newImages={newImages}
                          setNewImages={setNewImages}
          />
        </motion.div>

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
              onClick={() => setStep(step + 1)}
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
