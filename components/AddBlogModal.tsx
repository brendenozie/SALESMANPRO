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

// Step 3: Image upload
const ImagesStep: React.FC<{
  images: any[];
  newImages: File[];
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>;
  setImages: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ images, newImages, setNewImages, setImages }) => (
  <div> Nothing </div>
  // <ImageUploader
  //   imagePreviews={images}
  //   newImages={newImages}
  //   setNewImages={setNewImages}
  //   setImages={setImages}
  // />
);

// Step 4: SEO fields
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
    <p><strong>Category:</strong> {formData.category?.displayName}</p>
    <p><strong>Subcategory:</strong> {formData.subCategory?.name}</p>
    <p><strong>Brand:</strong> {formData.brand}</p>
    <p className="whitespace-pre-wrap"><strong>Content:</strong> {formData.content}</p>
    <p><strong>SEO Title:</strong> {formData.seoTitle}</p>
    <p><strong>SEO Description:</strong> {formData.seoDescription}</p>
    <p><strong>Images:</strong> {(formData.images || []).length} uploaded</p>
    <p><strong>Meta Keywords:</strong> {(formData.metaKeywords || []).join(", ")}</p>
  </div>
);

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
  categoriesData: any[];
  initialData?: any; // if editing, pass existing blog data
}

export default function AddEditBlogModal({
  show,
  onClose,
  initialData = {},
  categoriesData = [],
}: AddEditBlogModalProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = Object.keys(STEP_LABELS).length;

  const [formData, setFormData] = useState<any>({
    id: initialData.id || "",
    title: initialData.title || "",
    slug: initialData.slug || "",
    category: initialData.category || null,
    subCategory: initialData.subCategory || null,
    brand: initialData.brand || null,
    tags: initialData.tags || [],
    content: initialData.content || "",
    images: initialData.images || [],
    seoTitle: initialData.seo?.title || "",
    seoDescription: initialData.seo?.description || "",
    metaKeywords: initialData.seo?.keywords || [],
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [images, setImages] = useState<any[]>(
    initialData?.images?.map((url: string, idx: number) => ({ id: idx, url })) || []
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setFormData({
      id: initialData.id || "",
      title: initialData.title || "",
      slug: initialData.slug || "",
      category: initialData.category || null,
      subCategory: initialData.subCategory || null,
      brand: initialData.brand || null,
      tags: initialData.tags || [],
      content: initialData.content || "",
      images: initialData.images || [],
      seoTitle: initialData.seo?.title || "",
      seoDescription: initialData.seo?.description || "",
      metaKeywords: initialData.seo?.keywords || [],
    });
    setImages(
      initialData?.images?.map((url: string, idx: number) => ({ id: idx, url })) || []
    );
    setNewImages([]);
    setStep(1);
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file: File, type: string) => {
    const data = new FormData();
    data.append("file", file);
    data.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();
    return json.url as string;
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Upload newImages here if needed...

    const payload = {
      ...formData,
      images: images.map((i) => i.url),
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.metaKeywords,
      },
    };
    const res = await fetch(`${apiUrl}/admin/post-blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) onClose();
    else alert("Error saving blog");
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

        <Stepper step={step} stepsForCategory={Object.keys(STEP_LABELS).map(Number)} STEP_LABELS={STEP_LABELS} />

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
              handleInputChange={({ target: { name, value } }) =>
                setFormData((f: any) => ({ ...f, [name]: value }))
              }
              categories={categoriesData}
              filteredBrands={[]}
            />
          )}

          {step === 2 && <ContentEditor formData={formData} setFormData={setFormData} />}

          {step === 3 && (
            <ImagesStep
              images={images}
              newImages={newImages}
              setNewImages={setNewImages}
              setImages={setImages}
            />
          )}

          {step === 4 && <SeoFields formData={formData} setFormData={setFormData} />}

          {step === 5 && <ReviewStep formData={formData} />}
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
              disabled={loading}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Submit <CheckCircleIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
