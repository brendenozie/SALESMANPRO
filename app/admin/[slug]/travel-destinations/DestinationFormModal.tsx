"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  TrashIcon,
  GlobeAmericasIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import {
  ExclamationCircleIcon,
  MapPinIcon as MapPinIconOutline,
  ChevronDownIcon,
  TagIcon,
  DocumentTextIcon,
  HashtagIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords: string[];
  sortOrder: number;
  visible: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  bannerImage?: string;
  status: 'active' | 'inactive' | 'draft';
  locationId: string | null;
  localization?: any;
  attributes?: any;
  children?: Destination[];  
  parentId: string | null;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  children?: Location[];
}

// --- Data Normalization Trees ---
const buildLocationTree = (locations: Location[]): Location[] => {
  const locationMap: { [key: string]: Location } = {};
  const tree: Location[] = [];
  
  if (locations.length > 0) {
    locations.forEach(location => {
      locationMap[location.id] = { ...location, children: [] };
    });

    locations.forEach(location => {
      if (location.parentId && locationMap[location.parentId]) {
        locationMap[location.parentId].children?.push(locationMap[location.id]);
      } else {
        tree.push(locationMap[location.id]);
      }
    });
  }

  const sortTree = (nodes: Location[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children) sortTree(node.children);
    });
  };
  sortTree(tree);
  return tree;
};

const flattenLocationsForDropdown = (locations: Location[], indent = '', list: { id: string; name: string }[] = []) => {
  locations.forEach(location => {
    list.push({ id: location.id, name: `${indent}${location.name}` });
    if (location.children && location.children.length > 0) {
      flattenLocationsForDropdown(location.children, `\u00A0\u00A0\u00A0\u00A0`, list);
    }
  });
  return list;
};

const getContinentAndCountry = (locationId: string | null, allLocations: Location[]): { continent: string | null; country: string | null } => {
  if (!locationId) return { continent: null, country: null };

  const locationMap = new Map<string, Location>();
  if (allLocations.length > 0) {
    allLocations.forEach(loc => locationMap.set(loc.id, loc));
  }

  let continent: string | null = null;
  let country: string | null = null;
  let currentLocation: Location | null | undefined = locationMap.get(locationId);

  while (currentLocation) {
    if (!currentLocation.parentId) {
      continent = currentLocation.name;
    } else {
      const parentLocation = locationMap.get(currentLocation.parentId);
      if (parentLocation && !parentLocation.parentId) {
        country = currentLocation.name;
      }
    }
    currentLocation = currentLocation.parentId ? locationMap.get(currentLocation.parentId) : null;
  }

  return { continent, country };
};

interface DestinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  destination: Destination | null;
  allLocations: Location[];
}

export function DestinationFormModal({ isOpen, onClose, onSuccess, destination, allLocations }: DestinationFormModalProps) {
  const isEditing = !!destination;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Destination, 'id' | 'createdAt' | 'updatedAt' | 'children' | 'localization' | 'attributes'>>(() => ({
    name: destination?.name || '',
    slug: destination?.slug || '',
    description: destination?.description || '',
    country: destination?.country || '',
    continent: destination?.continent || '',
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0,
    seoTitle: destination?.seoTitle || '',
    seoDescription: destination?.seoDescription || '',
    metaKeywords: destination?.metaKeywords || [],
    sortOrder: destination?.sortOrder || 0,
    visible: destination?.visible ?? true,
    status: destination?.status || 'draft',
    locationId: destination?.locationId || null,
    createdBy: destination?.createdBy || '',
    updatedBy: destination?.updatedBy || '',
    bannerImage: destination?.bannerImage || '',
    parentId: destination?.parentId || ''
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const parentOptions = useMemo(() => {
    const locationTree = buildLocationTree(allLocations);
    return flattenLocationsForDropdown(locationTree);
  }, [allLocations]);

  useEffect(() => {
    const { continent, country } = getContinentAndCountry(formData.locationId, allLocations);
    setFormData(prev => ({
      ...prev,
      continent: continent || '',
      country: country || ''
    }));
  }, [formData.locationId, allLocations]);

  useEffect(() => {
    if (isEditing && destination) {
      setFormData({
        name: destination.name,
        slug: destination.slug,
        description: destination.description || '',
        country: destination.country || '',
        continent: destination.continent || '',
        latitude: destination.latitude || 0,
        longitude: destination.longitude || 0,
        seoTitle: destination.seoTitle || '',
        seoDescription: destination.seoDescription || '',
        metaKeywords: destination.metaKeywords || [],
        sortOrder: destination.sortOrder || 0,
        visible: destination.visible,
        status: destination.status,
        locationId: destination.locationId || null,
        createdBy: destination.createdBy || '',
        updatedBy: destination.updatedBy || '',
        bannerImage: destination.bannerImage || '',
        parentId: destination?.parentId || ''
      });
    }
  }, [destination, isEditing]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
    setFormData(prev => ({ ...prev, metaKeywords: keywords }));
  };

  // --- Core Media Vault Upload Pipelines ---
  const handleFileUploadProcess = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const uploadPayload = new FormData();
    uploadPayload.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/upload`, {
        method: 'POST',
        body: uploadPayload,
      });

      if (!response.ok) throw new Error('File streaming transaction crashed.');

      const result = await response.json();
      setFormData(prev => ({ ...prev, bannerImage: result.url || result.data?.url }));
    } catch (err: any) {
      setError(`Media upload exception: ${err.message}. Initializing fallback engine vector.`);
      // Client UI Simulation safety channel fallback if API environment lacks dynamic parsing
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, bannerImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUploadProcess(e.dataTransfer.files[0]);
    }
  };

  const triggerManualFileSearch = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedMedia = () => {
    setFormData(prev => ({ ...prev, bannerImage: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.description) {
      setError("Execution halted: Required entity parameters missing.");
      setLoading(false);
      return;
    }

    const apiEndpoint = isEditing ? `${apiBaseUrl}/admin/destinations/${destination?.id}` : `${apiBaseUrl}/admin/destinations`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Pipeline crash status: ${response.status}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(`Pipeline registration failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col backdrop-blur-xl transition-all scale-100 opacity-100">
        
        {/* Dynamic Modal Navigation Dock */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isEditing ? 'Modify Location Entity' : 'Register New Node'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Configuration Matrix Console</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* System Error Notification Banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl shrink-0" role="alert">
            <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold tracking-tight">{error}</p>
          </div>
        )}

        {/* Primary Scrollable Workspace Console */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Grouping Section: Core Parameters */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Core Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block font-bold text-slate-700 dark:text-slate-300">Destination Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIconOutline className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="block font-bold text-slate-700 dark:text-slate-300">Slug Key Route <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleChange} required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Grouping Section: Structural Topology */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Structural Hierarchy Routing</h4>
            <div className="space-y-1.5">
              <label htmlFor="locationId" className="block font-bold text-slate-700 dark:text-slate-300">Parent Topology Nexus</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                </div>
                <select id="locationId" name="locationId" value={formData.locationId || ''} onChange={handleChange}
                  className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all outline-none">
                  <option value="">Detached Autonomous Node</option>
                  {parentOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                  <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="continent" className="block font-bold text-slate-500 dark:text-slate-500">Continent Trace (Auto-Inherited)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAmericasIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="text" id="continent" name="continent" value={formData.continent} disabled
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800/40 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="country" className="block font-bold text-slate-500 dark:text-slate-500">Country Core (Auto-Inherited)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIconOutline className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="text" id="country" name="country" value={formData.country} disabled
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800/40 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

          {/* Grouping Section: Deep Content Metrics */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Geographic Documentation</h4>
            <div className="space-y-1.5">
              <label htmlFor="description" className="block font-bold text-slate-700 dark:text-slate-300">Description Narrative Summary <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                </div>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Grouping Section: Visual Assets Dynamic Pipeline */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Visual Media Array</h4>
            <div className="space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">Banner Asset Node File</label>
              
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUploadProcess(e.target.files[0])} accept="image/*" className="hidden" />

              {!formData.bannerImage ? (
                <div 
                  onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  onClick={triggerManualFileSearch}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center transition-all ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20'
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <ArrowPathIcon className="w-7 h-7 text-indigo-500 animate-spin" />
                      <span className="font-bold text-slate-600 dark:text-slate-400">Uploading stream package...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <CloudArrowUpIcon className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Drag imagery profile here or <span className="text-indigo-500">browse local systems</span></p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">PNG, JPEG, dynamic WEBP payloads capped at 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-40 group flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.bannerImage} alt="Banner Preview Matrix" className="w-full h-40 object-cover opacity-80" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={triggerManualFileSearch} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider transition-all">
                      Replace Media
                    </button>
                    <button type="button" onClick={clearUploadedMedia} className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md text-white transition-all">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-bold">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Live Asset Node Synced
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grouping Section: SEO Optimization */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Search Engine Discovery Schema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="seoTitle" className="block font-bold text-slate-700 dark:text-slate-300">Meta Title Index</label>
                <input type="text" id="seoTitle" name="seoTitle" value={formData.seoTitle} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="seoDescription" className="block font-bold text-slate-700 dark:text-slate-300">Meta Description Index</label>
                <input type="text" id="seoDescription" name="seoDescription" value={formData.seoDescription} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="metaKeywords" className="block font-bold text-slate-700 dark:text-slate-300">Meta Tag Keywords <span className="text-slate-400 font-normal">(Comma Separated Arrays)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HashtagIcon className="w-4 h-4 text-slate-400" />
                </div>
                <input type="text" id="metaKeywords" name="metaKeywords" placeholder="safari, ocean-front, luxury-resorts" value={formData.metaKeywords.join(', ')} onChange={handleKeywordsChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
              </div>
            </div>
          </div>

          {/* Grouping Section: Status Configuration */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40 pb-1">Control Operations Matrix</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sortOrder" className="block font-bold text-slate-700 dark:text-slate-300">Linear Sorting Vector Priority</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HashtagIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <input type="number" id="sortOrder" name="sortOrder" value={formData.sortOrder} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="status" className="block font-bold text-slate-700 dark:text-slate-300">Release Stage Cycle State</label>
                <div className="relative">
                  <select id="status" name="status" value={formData.status} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all outline-none">
                    <option value="active">Active System Node</option>
                    <option value="inactive">Suspended Node</option>
                    <option value="draft">Draft Staging Spec</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 border border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                  {formData.visible ? <EyeIcon className="w-4 h-4 text-indigo-500" /> : <EyeSlashIcon className="w-4 h-4 text-slate-400" />}
                  Frontend Grid Visibility
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Toggle visibility layout parameters on public client platforms.</span>
              </div>
              <label htmlFor="visible" className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" id="visible" name="visible" checked={formData.visible} onChange={handleChange} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-700 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Action Command Footer Anchor */}
        <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-3 rounded-b-[32px] shrink-0">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Abort Matrix
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || uploading}
            className={`px-5 py-2.5 font-bold text-white rounded-xl shadow-lg transition-all ${
              loading || uploading 
                ? 'bg-indigo-400 dark:bg-indigo-600/40 cursor-not-allowed' 
                : 'bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'
            }`}
          >
            {loading ? 'Committing Logs...' : isEditing ? 'Push Specification updates' : 'Deploy Operational Node'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Component: Delete Confirmation Modal ---
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  destination: Destination;
}

export function DeleteConfirmModal({ isOpen, onClose, onSuccess, destination }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/destinations/${destination.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Purge failure code: ${response.status}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(`Purge operational script failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl w-full max-w-md p-6 backdrop-blur-xl transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Confirm Purge Action</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Destructive System Pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold" role="alert">
            <ExclamationCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-4 text-xs space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
          <p className="text-sm text-slate-900 dark:text-white">
            Are you absolutely sure you want to drop tracking parameters for: <span className="font-bold text-rose-500">/{destination.name}</span>?
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg">
            Warning: This process severs active localization hierarchy binds permanently.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs transition-all"
          >
            Abort Action
          </button>
          <button type="button" onClick={handleDelete} disabled={loading}
            className={`px-4 py-2 font-bold text-white rounded-xl text-xs shadow-lg transition-all ${
              loading ? 'bg-rose-400 dark:bg-rose-900/40 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {loading ? 'Purging Layout...' : 'Execute Structural Purge'}
          </button>
        </div>
      </div>
    </div>
  );
}