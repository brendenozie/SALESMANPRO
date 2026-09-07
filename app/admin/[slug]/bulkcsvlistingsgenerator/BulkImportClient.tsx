"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { MarketListingForm, IStoreCategory } from "@/types/typings";

interface Props {
  companyId: string;
  categories: IStoreCategory[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * REFINED UPLOAD UTILITY: Handles S3 rate limits via Concurrency Control
 */
async function uploadFiles(
  files: File[],
  type: "image" | "video",
  onProgress?: (percent: number) => void
): Promise<{ url: string; key: string }[]> {
  if (!files?.length) return [];

  const CONCURRENCY_LIMIT = 5; // Upload 5 files at a time to keep browser/S3 happy
  const results: any[] = new Array(files.length);
  const queue = files.map((file, index) => ({ file, index }));
  
  let completedCount = 0;
  let cursor = 0;
  let activeCount = 0;

  return new Promise((resolve) => {
    const startNext = async () => {
      if (completedCount === files.length) return resolve(results);

      while (activeCount < CONCURRENCY_LIMIT && cursor < queue.length) {
        const { file, index } = queue[cursor++];
        activeCount++;

        uploadSingleFile(file, type)
          .then((res) => { results[index] = res; })
          .catch(() => { results[index] = { url: null, error: true }; })
          .finally(() => {
            activeCount--;
            completedCount++;
            if (onProgress) onProgress(Math.round((completedCount / files.length) * 100));
            startNext();
          });
      }
    };
    startNext();
  });
}

/** * HELPER: Single S3 PUT request 
 */
async function uploadSingleFile(file: File, type: string) {
  const res = await fetch(
    `${API_BASE_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
  );
  if (!res.ok) throw new Error("Signed URL failed");
  const { uploadUrl, publicUrl, key } = await res.json();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.onload = () => (xhr.status === 200 ? resolve({ url: publicUrl, key }) : reject());
    xhr.onerror = () => reject();
    xhr.send(file);
  });
}

export default function BulkImportClient({ companyId, categories }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [localImages, setLocalImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  // --- 1. DOWNLOAD TEMPLATE ---
  const downloadTemplate = () => {
    const headers = ["Name", "Description", "Price", "Category", "Stock", "ImageSource", "Color", "Material"];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "inventory_template.csv");
    link.click();
  };

  // --- 2. HANDLE CSV SELECTION ---
  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const mapped = results.data.map((row: any) => {
          const catMatch = categories.find(c => c.displayName?.toLowerCase() === row.Category?.toLowerCase());
          return {
            ...row,
            name: row.Name || "",
            sellingPrice: parseFloat(row.Price) || 0,
            quantity: parseInt(row.Stock) || 0,
            categoryId: catMatch?.categoryId || "",
            categoryName: catMatch?.displayName || "Uncategorized",
            imageSource: row.ImageSource || "", 
          };
        });
        setData(mapped);
      }
    });
  };

  // --- 3. EXECUTE IMPORT ---
  const startFinalImport = async () => {
    setIsProcessing(true);
    setUploadProgress(1);

    try {
      // Step A: Filter rows needing local image uploads
      const rowsNeedingUpload = data.filter(row => row.imageSource && !row.imageSource.startsWith('http'));
      const uploadedMap = new Map();

      if (localImages.length > 0 && rowsNeedingUpload.length > 0) {
        const filesToUpload = localImages.filter(file => 
          rowsNeedingUpload.some(row => row.imageSource === file.name)
        );

        if (filesToUpload.length > 0) {
          const results = await uploadFiles(filesToUpload, "image", (p) => setUploadProgress(p));
          results.forEach((res, i) => { if (res.url) uploadedMap.set(filesToUpload[i].name, res.url); });
        }
      }

      // Step B: Build Final Payload
      const finalPayload = data.map(row => ({
        companyId,
        name: row.name,
        description: row.Description || "",
        productCategoryId: row.categoryId,
        category: row.categoryName,
        sellingPrice: row.sellingPrice,
        buyingPrice: row.sellingPrice * 0.7,
        quantity: row.quantity,
        images: row.imageSource.startsWith('http') 
          ? [row.imageSource] 
          : [uploadedMap.get(row.imageSource) || "https://placehold.co/400x400?text=No+Image"],
        isAvailable: true,
        tags: ["bulk-import"],
        color: row.Color ? [row.Color] : [],
        material: row.Material ? [row.Material] : [],
        locationName: "Main Store"
      }));

      // Step C: API Call
      const res = await fetch(`/api/admin/my-market-place/bulk-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings: finalPayload, companyId })
      });

      if (res.ok) {
        setSuccess(true);
        setData([]);
        setLocalImages([]);
      }
    } catch (err) {
      console.error(err);
      alert("Import failed. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Import Products</h1>
          <p className="text-gray-500">Sync your spreadsheet and images to your inventory.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          <ArrowDownTrayIcon className="w-4 h-4" /> Download CSV Template
        </button>
      </div>

      {!success ? (
        <>
          {/* UPLOAD STEPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV Step */}
            <div className={`p-8 border-2 border-dashed rounded-3xl transition-all ${data.length > 0 ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-600 rounded-lg text-white"><DocumentTextIcon className="w-5 h-5"/></div>
                <h3 className="font-bold">1. Upload Spreadsheet</h3>
              </div>
              <input type="file" accept=".csv" onChange={handleCSVChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-indigo-600 file:font-semibold shadow-sm cursor-pointer" />
            </div>

            {/* Images Step */}
            <div className={`p-8 border-2 border-dashed rounded-3xl transition-all ${localImages.length > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-600 rounded-lg text-white"><PhotoIcon className="w-5 h-5"/></div>
                <h3 className="font-bold">2. Upload Folder of Images</h3>
              </div>
              <input type="file" multiple accept="image/*" onChange={(e) => setLocalImages(Array.from(e.target.files || []))} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-emerald-600 file:font-semibold shadow-sm cursor-pointer" />
            </div>
          </div>

          {/* PREVIEW TABLE */}
          {data.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold flex items-center gap-2"><TableCellsIcon className="w-5 h-5 text-indigo-600"/> Data Review</h3>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{data.length} items found</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-gray-950 shadow-sm z-10">
                    <tr className="text-xs font-bold text-gray-400 uppercase">
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category Match</th>
                      <th className="p-4">Image Source</th>
                      <th className="p-4">Asset Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.map((row, i) => {
                      const isUrl = row.imageSource.startsWith('http');
                      const hasLocalMatch = localImages.some(f => f.name === row.imageSource);
                      return (
                        <tr key={i} className="text-sm hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-semibold">{row.name}</td>
                          <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${row.categoryId ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>{row.categoryName}</span></td>
                          <td className="p-4 text-gray-500 italic">{row.imageSource || 'None'}</td>
                          <td className="p-4">
                            {isUrl ? <span className="text-blue-500 font-bold flex items-center gap-1">Remote</span> : 
                             hasLocalMatch ? <span className="text-emerald-500 font-bold flex items-center gap-1">Local Match</span> : 
                             <span className="text-amber-500 font-bold flex items-center gap-1"><ExclamationCircleIcon className="w-4 h-4"/> Missing</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-gray-50 border-t">
                <button 
                  onClick={startFinalImport}
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Processing Assets... {uploadProgress}%
                    </>
                  ) : `Start Import Process`}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in zoom-in-95 duration-300">
           <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
           <h2 className="text-3xl font-black text-emerald-900">Success!</h2>
           <p className="text-emerald-700 mb-8">All products and assets have been successfully imported.</p>
           <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-all">Import More</button>
        </div>
      )}
    </div>
  );
}