"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "./Modal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  LockClosedIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import CategoryPicker from "./CategoryPicker";
import ImageUploader, { UnifiedMediaItem } from "./ImageUploader";
import Stepper from "./Stepper";

// Load the new package dynamically, no SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
// @ts-expect-error CSS side-effect import handled by bundler
import "react-quill-new/dist/quill.snow.css";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  1: "Categorization",
  2: "Content Details",
  3: "Media Assets",
  4: "SEO & Meta",
  5: "Review & Publish",
};

export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(
          file.name
        )}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

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
  onSuccess?: () => void;
}

export default function AddEditBlogModal({
  show,
  onClose,
  initialData = {},
  categoriesData = [],
  companyId,
  onSuccess,
}: AddEditBlogModalProps) {
  const totalSteps = Object.keys(STEP_LABELS).length;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Find the parent category first to avoid duplicate searches and crashes
  const initialCategory = categoriesData.find(
    (c) => c.displayName === initialData.category || c.id === initialData.category
  ) || null;

  // 2. Find the subcategory safely from the resolved parent category
  const initialSubCategory = initialCategory
    ? initialCategory.subcategories?.find(
        (sc: any) => sc.name === initialData.subCategory || sc.id === initialData.subCategory
      ) || null
    : null;

  // 3. Initialize your useState hook
  const [formData, setFormData] = useState<any>({
    id: initialData.id || "",
    title: initialData.title || "",
    slug: initialData.slug || "",
    excerpt: initialData.excerpt || "",
    content: initialData.content || "",
    isFeature: initialData.isFeature || false,
    requiresSubscription: initialData.requiresSubscription || false,
    subscriptionTier: initialData.subscriptionTier || "premium",
    status: initialData.status || "DRAFT",
    categories: initialData.categories || [],
    tags: initialData.tags || [],
    coverImage: initialData.coverImage || "",
    seoTitle: initialData.seo?.title || "",
    seoDescription: initialData.seo?.description || "",
    metaKeywords: initialData.seo?.keywords || [],
    category: initialCategory,
    subCategory: initialSubCategory,
    brand: initialData.brand || null,
    companyId: companyId,
    author: initialData.author || "Admin",
  });

  const [images, setImages] = useState<UnifiedMediaItem[]>(
    formData?.images?.map((img: any, idx: number) => ({
      index: idx,
      url: img.url,
      source: "server",
    })) || [formData.coverImage ? { index: 0, url: formData.coverImage, source: "server" } : []]
  );

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
          ? value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : value,
    }));
  };

  const handleQuillChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, content: value }));
  };

  const isStepValid = useMemo(() => {
    if (step === 1) return formData.category && formData.subCategory;
    if (step === 2) return formData.title && formData.content.length > 20;
    if (step === 3) return images.length > 0;
    if (step === 4) return formData.seoTitle && formData.seoDescription;
    return true;
  }, [step, formData, images]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newImageItems = images.filter((i) => i.source === "local" && i.file);

      const uploadImagePromises = newImageItems.map((item) =>
        uploadFiles([item.file!], "image").then((result) => ({
          id: item.id,
          url: result[0].url,
        }))
      );

      const [uploadedImages] = await Promise.all([Promise.all(uploadImagePromises)]);
      const imageUrlMap = new Map(uploadedImages.map((i) => [i.id, i.url]));

      const finalImageUrls = images
        .map((img) => (img.source === "server" ? img.url : imageUrlMap.get(img.id)!))
        .filter(Boolean);

      const payload = {
        id: formData.id,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        isFeature: formData.isFeature,
        requiresSubscription: formData.requiresSubscription,
        subscriptionTier: formData.requiresSubscription ? formData.subscriptionTier : "free",
        status: formData.status,
        categories: formData.category?.displayName ? [formData.category.displayName] : [],
        tags: formData.tags,
        coverImage: finalImageUrls[0] || formData.coverImage || null,
        category: formData.category.displayName || null,
        subCategory: formData.subCategory.name || null,
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
      onSuccess?.();
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shared stunning input styles
  const inputClass =
    "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none placeholder-gray-400 dark:placeholder-gray-500 shadow-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <Modal isOpen={show} onClose={onClose} showCloseButton={false}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl mx-auto h-[90vh] sm:h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/60 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {formData.id ? "Edit Publication" : "Create New Story"}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                Step {step} of {totalSteps}: {STEP_LABELS[step]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Stepper Area */}
        <div className="px-8 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800 z-10 bg-white dark:bg-gray-800">
          <Stepper step={step} stepsForCategory={[1, 2, 3, 4, 5]} STEP_LABELS={STEP_LABELS} />
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-3xl mx-auto h-full"
            >
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Where does this belong?
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Select the appropriate category and subcategory for proper organization.
                    </p>
                  </div>
                  <CategoryPicker
                    formData={formData}
                    categories={categoriesData}
                    filteredBrands={[]}
                    onCategoryChange={(cat) =>
                      setFormData((f: any) => ({ ...f, category: cat, subCategory: null, brand: null }))
                    }
                    onSubCategoryChange={(sub) =>
                      setFormData((f: any) => ({ ...f, subCategory: sub }))
                    }
                    onBrandChange={(b) => setFormData((f: any) => ({ ...f, brand: b }))}
                  />
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={labelClass}>Post Title</label>
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="e.g. The Future of African Tech..."
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>URL Slug</label>
                      <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="the-future-of-african-tech"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tags (Comma separated)</label>
                      <div className="relative">
                        <TagIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                        <input
                          name="tags"
                          value={formData.tags.join(", ")}
                          onChange={handleChange}
                          className={`${inputClass} pl-10`}
                          placeholder="tech, innovation, future"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Short Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="A brief summary of the article..."
                    />
                  </div>

                  <div className="relative">
                    <label className={labelClass}>Full Content</label>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 shadow-sm bg-white dark:bg-gray-900 editor-wrapper">
                      {mounted ? (
                        <ReactQuill
                          value={formData.content}
                          onChange={handleQuillChange}
                          modules={modules}
                          theme="snow"
                          className="text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                          <span className="text-gray-400 animate-pulse">Loading Editor...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Row Configuration Controls */}
                  <div className="flex flex-col gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl space-y-2">
                    {/* General Post Feature and Status Row */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            name="isFeature"
                            checked={formData.isFeature}
                            onChange={handleChange}
                            className="peer sr-only"
                          />
                          <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-indigo-600 transition-colors duration-300"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Feature this post
                        </span>
                      </label>

                      <div className="h-6 w-px bg-indigo-200 dark:bg-indigo-500/20 hidden sm:block"></div>

                      <label className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publish Status:</span>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-gray-200"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </label>
                    </div>

                    <div className="h-px w-full bg-indigo-100 dark:bg-indigo-500/20"></div>

                    {/* Paywall Access Config Row */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between pt-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            name="requiresSubscription"
                            checked={formData.requiresSubscription}
                            onChange={handleChange}
                            className="peer sr-only"
                          />
                          <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-amber-500 transition-colors duration-300"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <LockClosedIcon className="h-4 w-4 text-amber-500" />
                          Requires Subscription Paywall
                        </span>
                      </label>

                      {formData.requiresSubscription && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 w-full sm:w-auto justify-end"
                        >
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <KeyIcon className="h-4 w-4 text-gray-400" /> Tier Required:
                          </span>
                          <select
                            name="subscriptionTier"
                            value={formData.subscriptionTier}
                            onChange={handleChange}
                            className="bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-500/30 text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none text-amber-900 dark:text-amber-300"
                          >
                            <option value="premium">Premium Access</option>
                            <option value="gold">Gold Elite Tier</option>
                            <option value="enterprise">Enterprise Team</option>
                          </select>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Visual Assets
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Upload high-quality images. The first image will be used as the cover.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <ImageUploader
                      images={images}
                      setImages={setImages}
                      videos={[]}
                      setVideos={() => {}}
                      books={[]}
                      setBooks={() => {}}
                    />
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <MagnifyingGlassIcon className="h-6 w-6 text-indigo-500" />
                      Search Engine Optimization
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Optimize how your post appears on Google and social media.
                    </p>
                  </div>
                  
                  <div>
                    <label className={labelClass}>SEO Title</label>
                    <input
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Best title for search engines (50-60 chars)"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="Compelling meta description..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Meta Keywords (Comma separated)</label>
                    <input
                      name="metaKeywords"
                      value={formData.metaKeywords.join(", ")}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          metaKeywords: e.target.value.split(",").map((s) => s.trim()),
                        }))
                      }
                      className={inputClass}
                      placeholder="startup, saas, growth"
                    />
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                      <SparklesIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      Ready to Publish?
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      Review the details below before making this live.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-6 shadow-sm">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Post Title</dt>
                        <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{formData.title || "—"}</dd>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                        <dd className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300 uppercase">
                            {formData.status}
                          </span>
                        </dd>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Access Policy</dt>
                        <dd className="mt-1">
                          {formData.requiresSubscription ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 uppercase">
                              <LockClosedIcon className="h-3.5 w-3.5" /> Paywall ({formData.subscriptionTier})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 uppercase">
                              Free Access
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formData.category?.displayName || "—"}</dd>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Media</dt>
                        <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <PhotoIcon className="h-5 w-5 text-gray-400" />
                          {images.length} Image(s) Attached
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-md px-6 py-4 border-t border-gray-200 dark:border-gray-700/60 flex justify-between items-center rounded-b-2xl z-20">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              step === 1
                ? "opacity-0 pointer-events-none"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" /> Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => {
                if (!isStepValid) return alert("Please complete required fields first.");
                setStep(step + 1);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              Continue <ArrowRightIcon className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Publish Post <CheckCircleIcon className="h-6 w-6" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Global dark mode override for React Quill (Injected just for this modal) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .editor-wrapper .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-color: inherit;
          background-color: transparent;
          border-bottom: 1px solid rgba(156, 163, 175, 0.2) !important;
        }
        .editor-wrapper .ql-container {
          border: none !important;
          min-height: 200px;
          font-family: inherit;
        }
        @media (prefers-color-scheme: dark) {
          .editor-wrapper .ql-toolbar .ql-stroke { stroke: #d1d5db; }
          .editor-wrapper .ql-toolbar .ql-fill { fill: #d1d5db; }
          .editor-wrapper .ql-toolbar .ql-picker { color: #d1d5db; }
          .editor-wrapper .ql-editor.ql-blank::before { color: #6b7280; }
        }
        html.dark .editor-wrapper .ql-toolbar .ql-stroke { stroke: #d1d5db; }
        html.dark .editor-wrapper .ql-toolbar .ql-fill { fill: #d1d5db; }
        html.dark .editor-wrapper .ql-toolbar .ql-picker { color: #d1d5db; }
        html.dark .editor-wrapper .ql-editor.ql-blank::before { color: #6b7280; }
      `}} />
    </Modal>
  );
}