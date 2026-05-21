"use client";

import { useEffect, useState, useRef } from "react";
import { compressImage, compressVideo } from "@/utils/compressMedia";
import GalleryReorderGrid from "./GalleryReorderGrid";
import { PlusIcon } from "@heroicons/react/24/outline";

// Basic icons - Replace with 'lucide-react' imports if available
const CloudUploadIcon = () => (
  <svg className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface UploadProgress {
  [fileName: string]: number;
}

interface LocalPreview {
  id: string;
  file: File;
  previewUrl: string;
  type: "IMAGE" | "VIDEO";
  caption: string;
  altText: string;
  featured: boolean;
}

////////////////////////////////////////////////////////////////////////////////
// Upload helper with robust XMLHttpRequest progress tracking
////////////////////////////////////////////////////////////////////////////////
export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
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

export default function AdminGalleryManager({ companyId }: { companyId: string }) {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any>(null);
  const [previews, setPreviews] = useState<LocalPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

    // New Gallery Creation Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("products");
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up Object URLs to prevent memory leaks
  
  useEffect(() => {
    fetchGalleries();
  }, [companyId]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previews]);

  const fetchGalleries = async (selectId?: string) => {
    try {
      const res = await fetch(`/api/admin/galleries?companyId=${companyId}`);
      const json = await res.json();
      const list = json.data || [];
      setGalleries(list);
      
      if (selectId) {
        const found = list.find((x: any) => x.id === selectId);
        if (found) setGallery(found);
      }
    } catch (err) {
      console.error("Failed fetching galleries", err);
    }
  };

    const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreatingGallery(true);

    try {
      const res = await fetch("/api/admin/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          type: newType,
          isFeatured: newIsFeatured,
          companyId
        }),
      });

      if (res.ok) {
        const json = await res.json();
        // Reset form variables
        setNewTitle("");
        setNewDescription("");
        setNewType("products");
        setNewIsFeatured(false);
        setShowCreateForm(false);
        
        // Refresh & automatically lock viewport focus to the new gallery instance
        await fetchGalleries(json.data?.id);
      }
    } catch (err) {
      console.error("Error creating new gallery container module", err);
    } finally {
      setIsCreatingGallery(false);
    }
  };


  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newPreviews: LocalPreview[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      caption: "",        // Initialize empty
      altText: "",        // Initialize empty
      featured: false,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (id: string, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setPreviews((prev) => prev.filter((p) => p.id !== id));
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (!gallery || !previews.length) return;
    setLoading(true);
    setUploadProgress({});

    try {
      const processed: File[] = [];

      // 1. Process Compression
      for (const item of previews) {
        if (item.file.type.startsWith("image/")) {
          processed.push(await compressImage(item.file));
        } else if (item.file.type.startsWith("video/")) {
          processed.push(await compressVideo(item.file));
        } else {
          processed.push(item.file);
        }
      }

      // 2. Stream Uploads to S3
      const uploaded = await uploadFiles(processed, "image", (progress, file) => {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: progress,
        }));
      });

      // 3. Save payload references into DB
      const response = await fetch("/api/admin/galleries-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          images: uploaded.map((u , index) => ({
            url: u.url,
            mediaType: u.contentType.startsWith("video") ? "VIDEO" : "IMAGE",
            caption: previews[index].caption || null,
            altText: previews[index].altText || null,
            featured: previews[index].featured,
          })),
        }),
      });

      if (response.ok) {
        // Refresh local gallery data view if update pipeline allows
        const updatedGalleryRes = await fetch(`/api/admin/galleries?companyId=${companyId}`);
        const updatedData = await updatedGalleryRes.json();
        const freshGallery = (updatedData.data || []).find((x: any) => x.id === gallery.id);
        if (freshGallery) setGallery(freshGallery);
        
        setPreviews([]);
        setUploadProgress({});
      }
    } catch (error) {
      console.error("Upload process encountered an error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl transition-colors duration-200">
      
      {/* Top Controller Dashboard Module */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Gallery Control Engine</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Select context spaces or instantiate pristine container arrays.</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-medium text-xs rounded-lg shadow transition-all self-start sm:self-auto"
          >
            <PlusIcon />
            {showCreateForm ? "Collapse Form" : "Create New Gallery"}
          </button>
        </div>

        {/* Animated Dropdown Expandable Creation Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateGallery} className="p-5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-fadeIn">
            <div className="md:col-span-1 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gallery Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Summer Shoot 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Classification Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="products">Products</option>
                <option value="office">Office Environment</option>
                <option value="events">Corporate Events</option>
              </select>
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extended Subtext Description</label>
              <input
                type="text"
                placeholder="Optional conceptual framework data..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-1 flex flex-row items-center justify-between gap-2 h-9">
              <label className="flex items-center gap-2 text-xs select-none cursor-pointer font-medium text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={newIsFeatured}
                  onChange={(e) => setNewIsFeatured(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-slate-800"
                />
                <span>Set Master Feature Flag</span>
              </label>

              <button
                type="submit"
                disabled={isCreatingGallery}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm disabled:opacity-50 transition-all"
              >
                {isCreatingGallery ? "Saving Node..." : "Initialize"}
              </button>
            </div>
          </form>
        )}

        {/* Gallery Selection Bar Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 ">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Select a gallery to manage its assets</p>
          </div>
          
          <div className="w-full md:w-72">
            <select
              onChange={(e) => {
                const g = galleries.find((x) => x.id === e.target.value);
                setGallery(g || null);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              defaultValue=""
            >
              <option value="" disabled>Choose Active Gallery...</option>
              {galleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.type || "Standard"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
     

      {gallery && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left/Top Interactive Upload Staging Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stage System Files</h3>
            
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelection(e.target.files)}
                className="hidden"
              />
              <CloudUploadIcon />
              <p className="text-sm font-medium">Click or drag layout media assets here</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Accepts images and compressed video formats</p>
            </div>

            {/* Local Files Stage Previews */}
            {previews.length > 0 && (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Queued Items ({previews.length})</span>
                  <button onClick={() => setPreviews([])} className="text-red-500 hover:underline">Clear all</button>
                </div>

                {previews.map((item) => {
                  const progress = uploadProgress[item.file.name];
                  return (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="relative flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <div className="w-12 h-12 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 relative">
                          {item.type === "IMAGE" ? (
                            <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.file.name}</p>
                          <p className="text-[10px] text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>

                        <button
                          onClick={() => removePreview(item.id, item.previewUrl)}
                          disabled={loading}
                          className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {/* Input controls for metadata injection prior to DB synchronization */}
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Caption text..."
                          value={item.caption}
                          onChange={(e) => setPreviews(prev => prev.map(p => p.id === item.id ? { ...p, caption: e.target.value } : p))}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Alt (Accessibility) text..."
                          value={item.altText}
                          onChange={(e) => setPreviews(prev => prev.map(p => p.id === item.id ? { ...p, altText: e.target.value } : p))}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <label className="flex items-center gap-2 select-none cursor-pointer text-[11px] text-slate-500">
                          <input
                            type="checkbox"
                            checked={item.featured}
                            onChange={(e) => setPreviews(prev => prev.map(p => p.id === item.id ? { ...p, featured: e.target.checked } : p))}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                          />
                          <span>Set as featured item</span>
                        </label>
                      </div>

                      {progress !== undefined && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Execute Master Pipeline Upload */}
            <button
              onClick={handleUpload}
              disabled={loading || previews.length === 0}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 font-medium rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Pipelines...
                </>
              ) : (
                `Upload ${previews.length} Assets`
              )}
            </button>
          </div>

          {/* Right/Bottom Database State Management Area */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">{gallery.title}</h3>
                <p className="text-xs text-slate-400">{gallery.description || "No supplemental details rendered"}</p>
              </div>
              {gallery.isFeatured && (
                <span className="px-2 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-semibold uppercase rounded tracking-wider border border-amber-200 dark:border-amber-900">
                  Featured Node
                </span>
              )}
            </div>

            {/* Grid display mechanism */}
            <GalleryReorderGrid galleryId={gallery.id} items={gallery.items || []} />
          </div>
        </div>
      )}
    </div>
  );
}

export function GalleryItemEditor({ item }: { item: any }) {
  const [caption, setCaption] = useState(item.caption || "");
  const [altText, setAltText] = useState(item.altText || "");
  const [featured, setFeatured] = useState(item.featured);
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/galleries-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, altText, featured }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 text-xs shadow-inner">
      <div className="space-y-1">
        <label className="font-semibold text-slate-400 block tracking-wide uppercase text-[9px]">Context Caption</label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={save}
          placeholder="Describe target scene aspect ratio..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="font-semibold text-slate-400 block tracking-wide uppercase text-[9px]">Accessibility Description (Alt Text)</label>
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          onBlur={save}
          placeholder="Descriptive assistive content engines can index..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-xs"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 select-none cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => {
              setFeatured(e.target.checked);
              // Small state synchronization hack because check box operations complete before DOM bubble renders values on blur
              setTimeout(() => {
                fetch(`/api/galleries-items/${item.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ caption, altText, featured: e.target.checked }),
                });
              }, 50);
            }}
            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 bg-white dark:bg-slate-800"
          />
          <span>Elevate to Core Spotlight Item</span>
        </label>

        {isSaving && (
          <span className="text-[10px] text-slate-400 animate-pulse flex items-center gap-1">
            <svg className="animate-spin h-2.5 w-2.5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Saving Sync
          </span>
        )}
      </div>
    </div>
  );
}

