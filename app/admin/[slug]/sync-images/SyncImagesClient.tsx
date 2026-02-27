"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon, 
  PhotoIcon, 
  CloudArrowUpIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  QueueListIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";

interface Props {
  companyId: string;
  initialProducts: MarketListingForm[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";


////////////////////////////////////////////////////////////////////////////////
// Upload helpers
////////////////////////////////////////////////////////////////////////////////
// utils/uploadFiles.ts
async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  console.log("uploadFiles called with files:", files, "type:", type);
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get signed URL: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    // ✅ Upload to S3
    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}


export default function SyncImagesClient({ companyId, initialProducts }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'idle' | 'uploading' | 'syncing' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const startGlobalSync = async () => {
    if (files.length === 0) return;
    if (!confirm(`CAUTION: This will replace images for ALL ${initialProducts.length} products. Proceed?`)) return;

    setIsSyncing(true);
    setStep('uploading');

    try {
      // 1. Upload new assets to S3
      const uploadResults = await uploadFiles(files, "image", (p:any) => setProgress(p));
      const newUrls = uploadResults.map((r: any) => r.url);

      setStep('syncing');

      // 2. Map existing products to new image set
      const updatedPayload = initialProducts.map(product => ({
        ...product,
        //mixup the image order a bit for fun, or you can just assign the same set to all
        images: newUrls.sort(() => Math.random() - 0.5), // Shuffle the new URLs for each product
        // images: newUrls, 
      }));

      // 3. Fire bulk update
      const res = await fetch(`/api/admin/my-market-place/bulk-create`, {
        method: "POST",
        body: JSON.stringify({ 
          listings: updatedPayload, 
          companyId,
          isUpdate: true 
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Sync failed");

      setStep('success');
      setTimeout(() => router.push(`/admin/${companyId}/mymarketplace`), 2000);

    } catch (error) {
      console.error(error);
      alert("An error occurred during sync.");
      setStep('idle');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* HEADER */}
      <nav className="border-b bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back to Inventory</span>
        </button>
        <div className="flex items-center gap-2">
           <QueueListIcon className="w-5 h-5 text-indigo-500" />
           <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Global Asset Sync</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">Bulk Image Updater</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Upload images here to apply them to <span className="text-indigo-600 font-bold">{initialProducts.length}</span> products currently in your catalog.
          </p>
        </header>

        {/* UPLOAD ZONE */}
        <div className="space-y-8">
          <div className={`
            relative border-4 border-dashed rounded-3xl p-12 text-center transition-all
            ${files.length > 0 ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}
          `}>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isSyncing}
            />
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-full mb-4">
                <CloudArrowUpIcon className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drop new images here</h3>
              <p className="text-gray-500 mt-1">or click to browse files</p>
            </div>
          </div>

          {/* PREVIEW GRID */}
          {previews.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-gray-400" />
                  Assets to Apply ({previews.length})
                </h4>
                <button onClick={() => {setFiles([]); setPreviews([]);}} className="text-xs text-red-500 font-medium hover:underline">Clear All</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION SECTION */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex items-start gap-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h5 className="text-amber-800 dark:text-amber-400 font-bold">Massive Update Warning</h5>
              <p className="text-amber-700/80 dark:text-amber-400/60 text-sm">
                Executing this will replace the images for every product listed in your inventory with the set above. This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            onClick={startGlobalSync}
            disabled={files.length === 0 || isSyncing}
            className={`
              w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl
              ${step === 'success' ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}
              disabled:bg-gray-300 disabled:shadow-none
            `}
          >
            {step === 'uploading' && <><ArrowPathIcon className="w-6 h-6 animate-spin" /> Uploading Assets ({progress}%)</>}
            {step === 'syncing' && <><ArrowPathIcon className="w-6 h-6 animate-spin" /> Updating Database...</>}
            {step === 'success' && <><CheckCircleIcon className="w-6 h-6" /> Sync Complete!</>}
            {step === 'idle' && <><CheckCircleIcon className="w-6 h-6" /> Synchronize Catalog</>}
          </button>
        </div>
      </main>
    </div>
  );
}