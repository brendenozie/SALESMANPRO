// app/admin/[slug]/projects/ProjectsClient.tsx
"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Project } from "./page";
// import Modal from "@/components/Modal";
import { toast, Toaster } from "react-hot-toast";
import {
  ArrowsUpDownIcon,
  CalendarDateRangeIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon,
  RocketLaunchIcon,
  ClockIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ClientProps {
  projectsData: Project[];
  companyId: string;
}

// Simple internal interface extension to track image/file attachments if your project model supports them
interface ProjectWithMedia extends Project {
  mediaUrls?: string[];
}

export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
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

interface ClientProps {
  projectsData: Project[];
  companyId: string;
}

const Modal = ({ children, isOpen, onClose, title }: any) => isOpen ? (
  <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-2xl p-6 relative shadow-xl">
      {/* Close button for a more intuitive and engaging user experience */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
        title="Close View"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-4 pr-6">{title}</h3>
      <div className="text-zinc-700">
        {children}
      </div>
    </div>
  </div>
) : null;

// --- FLAT DESIGN DATA MATRIX STAT CARDS ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accentClass: string;
}
const StatCard = ({ title, value, icon, accentClass }: StatCardProps) => (
  <div className="bg-white border border-zinc-200/80 rounded-xl p-5 flex items-center justify-between shadow-sm transition-all hover:border-zinc-300">
    <div>
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{value}</h3>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-50 border border-zinc-200/80 ${accentClass}`}>
      {icon}
    </div>
  </div>
);

// --- CARD SUB-COMPONENT ---
interface ProjectCardProps {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}
const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const statusConfig: Record<Project["status"], string> = {
    PLANNING: "text-zinc-500 border-zinc-200 bg-zinc-50",
    ONGOING: "text-amber-700 border-amber-200 bg-amber-50",
    COMPLETED: "text-emerald-700 border-emerald-200 bg-emerald-50",
    ARCHIVED: "text-sky-700 border-sky-200 bg-sky-50",
    CANCELLED: "text-red-700 border-red-200 bg-red-50",
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-6 flex flex-col justify-between h-[230px] shadow-sm transition-all hover:bg-zinc-50/30 hover:border-zinc-300">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h4 className="text-base font-bold text-zinc-900 tracking-tight line-clamp-1">{project.name}</h4>
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border rounded-md shrink-0 ${statusConfig[project.status]}`}>
            {project.status}
          </span>
        </div>
        <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-4 mb-4">
          {project.description || "No supplemental engineering metrics or project specs provided for this deployment hub."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
        <div>
          <span className="text-zinc-400 block text-[10px] uppercase font-semibold tracking-wider">Allocation</span>
          <span className="font-bold text-zinc-800">${project.budget?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onEdit(project)}
            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-sm"
            title="Edit Project Configuration"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(project.id)}
            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
            title="Terminate Life-cycle"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectCardd: React.FC<{ project: ProjectWithMedia; onEdit: (p: Project) => void; onDelete: (id: string) => void }> = ({ project, onEdit, onDelete }) => {
  const getStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "ONGOING": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PLANNING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-lg font-bold text-zinc-800 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
            {project.name}
          </h4>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border shrink-0 ${getStatusStyle(project.status)}`}>
            {project.status}
          </span>
        </div>

        <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
          {project.description || "No project parameters or documentation tags specified."}
        </p>

        {project.mediaUrls && project.mediaUrls.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none">
            {project.mediaUrls.map((url, i) => (
              <img key={i} src={url} alt="Attachment thumbnail" className="w-10 h-10 rounded-lg object-cover bg-zinc-50 border border-zinc-200 shrink-0" />
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-zinc-100 pt-3 text-[11px] font-medium text-zinc-400">
          <div className="flex items-center gap-2">
            <CalendarDateRangeIcon className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-600">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-zinc-800 font-bold">
                ${project.budget?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100">
        <button
          onClick={() => onEdit(project)}
          className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
        >
          <PencilIcon className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-all inline-flex items-center justify-center"
          aria-label="Delete node input"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Unified Lifecycle Form Component Configured for Clear Light Profiles
interface LifecycleFormProps {
  onSubmit: (project: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  companyId: string;
  project?: ProjectWithMedia;
}

const ProjectLifecycleForm: React.FC<LifecycleFormProps> = ({ onSubmit, onCancel, isLoading, companyId, project }) => {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [startDate, setStartDate] = useState(project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "");
  const [endDate, setEndDate] = useState(project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "");
  const [status, setStatus] = useState<Project["status"]>(project?.status || "PLANNING");
  const [budget, setBudget] = useState<string>(project?.budget?.toString() || "");
  const [mediaUrls, setMediaUrls] = useState<string[]>(project?.mediaUrls && Array.isArray(project.mediaUrls) ? project.mediaUrls : (project?.mediaUrls && typeof project.mediaUrls === "string" ? [project.mediaUrls] : []));
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setFormError(null);
    try {
      const results = await uploadFiles(files, "image", (progress, file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
      });
      const extractedUrls = results.map((res) => res.url);
      setMediaUrls((prev) => [...prev, ...extractedUrls]);
      toast.success("Media package uploaded and verified!");
    } catch (err: any) {
      setFormError(`Upload stream faulted: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setMediaUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError("Project descriptor name missing.");
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) return setFormError("End date bounds cannot trigger before start sequence.");

    const payload: any = {
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status,
      budget: budget ? parseFloat(budget) : null,
      mediaUrls:mediaUrls.length > 0 ? mediaUrls[0] : undefined,
    };

    if (project?.id) {
      onSubmit({ ...project, ...payload });
    } else {
      onSubmit({ ...payload, companyId });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1 text-zinc-800">
      {formError && (
        <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
          {formError}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Project Cluster Identity *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-zinc-900 placeholder-zinc-400"
          placeholder="System name designation"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Operational Log/Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-zinc-900 placeholder-zinc-400"
          placeholder="Detailed parameters and criteria objectives..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Launch Timeline</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Termination Cap</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">State Vector</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-zinc-900"
          >
            <option value="PLANNING">Planning</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Funding Allotment ($)</label>
          <input
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none text-zinc-900 placeholder-zinc-400"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Dynamic S3 File Dropzone / Attachment Block */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-zinc-400">Media Vault Attachments</label>
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            uploading ? "bg-zinc-100 border-zinc-300 pointer-events-none" : "border-zinc-200 hover:border-amber-500 bg-zinc-50"
          }`}
        >
          <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} accept="image/*" className="hidden" />
          <CloudArrowUpIcon className="w-7 h-7 mx-auto text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-500">
            {uploading ? "Streaming sequence payload to cloud store..." : "Click or drag images to map attachments to project database node."}
          </p>
        </div>

        {/* Live File Upload Progress bars */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-3 space-y-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="text-[11px]">
                <div className="flex justify-between font-medium mb-1 truncate text-zinc-600">
                  <span>{filename}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Attached Assets Grid */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img src={url} alt="Project attachment node" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all active:scale-95"
          disabled={isLoading || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-xs font-bold text-zinc-950 rounded-xl bg-amber-500 hover:bg-amber-400 transition-all shadow-sm active:scale-95"
          disabled={isLoading || uploading}
        >
          {isLoading ? "Synchronizing Matrix Instance..." : project?.id ? "Commit Mutation Matrix" : "Deploy Project Core Node"}
        </button>
      </div>
    </form>
  );
};

// --- MAIN MASTER ADMINISTRATIVE INTERFACE COMPONENT ---
const ProjectsClient: React.FC<ClientProps> = ({ projectsData: initialProjectsData, companyId }) => {
  const [projectsData, setProjectsData] = useState<Project[]>(initialProjectsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects`, { next: { revalidate: 60 } } as any);
      if (res.ok) {
        const data = await res.json();
        setProjectsData(data);
        toast.success("Projects database synchronized! 🔄");
      } else {
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh projects.");
      toast.error(`Sync error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredProjects = useMemo(() => {
    return (projectsData && projectsData.length > 0 ? projectsData : [])
      .filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm) ||
          project.description?.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projectsData, searchTerm]);

  const totalProjects = projectsData.length;
  const ongoingProjects = projectsData.filter((p) => p.status === "ONGOING").length;
  const completedProjects = projectsData.filter((p) => p.status === "COMPLETED").length;
  const totalBudget = useMemo(
    () => projectsData.reduce((sum, project) => sum + (project.budget || 0), 0),
    [projectsData]
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const statusCounts = useMemo(() => {
    return projectsData.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<Project["status"], number>);
  }, [projectsData]);

  const chartSeries = Object.values(statusCounts);
  const chartLabels = Object.keys(statusCounts);

  const chartOptions: any = {
    chart: { type: "donut", background: "transparent" },
    labels: chartLabels,
    colors: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444"],
    legend: {
      position: "bottom" as const,
      labels: { colors: "#a1a1aa" },
    },
    stroke: { show: true, colors: ["#18181b"] },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "80%" } } },
    tooltip: { theme: "dark" },
  };

  const handleAddProject = async (newProject: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        await refreshProjects();
        toast.success("New structural project established!");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add project.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add project.");
      toast.error(`Error operationalizing project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (updatedProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${updatedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await refreshProjects();
        toast.success("Project architecture mutated safely.");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update project.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update project.");
      toast.error(`Modification vector failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshProjects();
        toast.success("Project lifecycle terminated.");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete project.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete project.");
      toast.error(`Deletion error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="flex-grow container mx-auto px-6 py-10 bg-zinc-50 text-zinc-900 min-h-screen font-sans antialiased selection:bg-amber-500/20">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Institutional Title Header Frame */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-8 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-amber-600 uppercase block mb-1">
              Internal Control Panel
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Project Hub Engine
            </h1>
            <p className="text-zinc-500 mt-1 text-xs font-light">
              System monitoring parameters, transaction telemetry, and asset-lifecycle management tracks.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={refreshProjects}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 transition-all border border-zinc-200 shadow-sm"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Base
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 rounded-lg bg-amber-500 hover:bg-amber-400 shadow-sm transition-all"
            >
              <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />
              Add Core Ledger
            </button>
          </div>
        </div>

        {/* Operational Overview Block & Live Search Input */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-zinc-200/80 rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-2">
                Operational Framework Snapshot
              </span>
              <p className="text-zinc-600 text-sm font-light leading-relaxed max-w-xl">
                Active systems register <strong className="text-amber-600 font-semibold">{ongoingProjects} ongoing</strong> distribution hubs executing parallel workflows alongside <strong className="text-zinc-500 font-semibold">{completedProjects} finalized</strong> ledger instances.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-zinc-400 mt-4 pt-4 border-t border-zinc-100">
              <span>Tenant Identity: <strong className="text-zinc-700 font-medium">{companyId}</strong></span>
              <span>•</span>
              <span>Status Matrix: Fully Calibrated</span>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-xl p-6 flex flex-col justify-center shadow-sm">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Search Parameters
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-4 h-4 left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Query project records by criteria..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value.toLowerCase());
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-zinc-50 text-zinc-800 border border-zinc-200 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/60 focus:outline-none transition-all placeholder-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* System Diagnostics Error Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            <span className="font-mono text-red-600/80">[SYSTEM CRISIS VECTOR]:</span> {error}
          </div>
        )}

        {/* Balanced Micro Stat Blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Modules" value={totalProjects} icon={<ListBulletIcon className="w-5 h-5" />} accentClass="text-zinc-500" />
          <StatCard title="Active Inbound" value={ongoingProjects} icon={<PlayCircleIcon className="w-5 h-5" />} accentClass="text-amber-600" />
          <StatCard title="Closed Pipelines" value={completedProjects} icon={<CheckCircleIcon className="w-5 h-5" />} accentClass="text-emerald-600" />
          <StatCard title="Total Valuation" value={`$${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<CurrencyDollarIcon className="w-5 h-5" />} accentClass="text-zinc-500" />
        </div>

        {/* Structural Presentation Architecture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Chart Ring Display Area */}
          <div className="bg-white border border-zinc-200/80 p-6 rounded-xl lg:col-span-1 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-6">
              Density Allocation Distribution
            </h3>
            <div className="flex items-center justify-center min-h-[240px]">
              {typeof window !== "undefined" && chartSeries.length > 0 ? (
                <Chart options={chartOptions} series={chartSeries} type="donut" width="100%" height={240} />
              ) : (
                <div className="text-zinc-400 text-xs text-center font-light">No explicit allocation arrays documented.</div>
              )}
            </div>
          </div>

          {/* Core Functional List Track */}
          <div className="lg:col-span-2 space-y-6">
            {paginatedProjects.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200 border-dashed rounded-xl shadow-sm">
                <BriefcaseIcon className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-400 text-xs font-light">No structural asset items correspond to the current parameters.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-3 py-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Initialize Primary Hub
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onEdit={(p) => { setCurrentProject(p); setIsEditModalOpen(true); }} 
                    onDelete={handleDeleteProject} 
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-600 disabled:opacity-40 transition-all hover:bg-zinc-50 disabled:hover:bg-white shadow-sm"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-zinc-400">
                  Segment {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-600 disabled:opacity-40 transition-all hover:bg-zinc-50 disabled:hover:bg-white shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Allocation Overlay Systems (Modals) */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Operational Node">
        <ProjectLifecycleForm companyId={companyId} onSubmit={handleAddProject} onCancel={() => setIsAddModalOpen(false)} isLoading={loading} />
      </Modal>

      {isEditModalOpen && currentProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Mutate Pipeline Parameters">
          <ProjectLifecycleForm companyId={companyId} project={currentProject} onSubmit={handleEditProject} onCancel={() => setIsEditModalOpen(false)} isLoading={loading} />
        </Modal>
      )}
    </main>
  );
};

export default ProjectsClient;

// -------------------------------------------------------------------------------------------------------
// Reusable Subcomponents Redesigned for Contextual Flexibility, light/dark accessibility, and touch screen targets
// -------------------------------------------------------------------------------------------------------

// const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; accent: string }> = ({ title, value, icon, accent }) => {
//   const themes: Record<string, string> = {
//     indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/30",
//     emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30",
//     sky: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/30",
//     amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
//   };

//   return (
//     <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex items-center gap-4`}>
//       <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${themes[accent] || themes.indigo}`}>
//         {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
//       </div>
//       <div className="min-w-0">
//         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{title}</p>
//         <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5 tracking-tight truncate">{value}</p>
//       </div>
//     </div>
//   );
// };

