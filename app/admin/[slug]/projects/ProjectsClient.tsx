// app/admin/[slug]/projects/ProjectsClient.tsx
"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Project } from "./page";
import Modal from "@/components/Modal";
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
} from "@heroicons/react/24/outline";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
      const res = await fetch(`${apiBaseUrl}/admin/projects`, { next: { revalidate: 60 } });
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
    return projectsData
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
    colors: ["#6366f1", "#10b981", "#f59e0b", "#64748b", "#ef4444"],
    legend: {
      position: "bottom" as const,
      labels: { colors: "currentColor" },
    },
    stroke: { show: false },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    plotOptions: { pie: { donut: { size: "75%" } } },
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
    <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Sleek App Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Project Hub Engine
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
              Unified administration, telemetry metrics, and media tracking modules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshProjects}
              className="flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all border border-slate-300 dark:border-slate-700 active:scale-95"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </div>

        {/* Global Dashboard Metrics & Interactive Fast Filter Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-xl pointer-events-none" />
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <span className="bg-white/20 text-white font-medium text-xs uppercase px-3 py-1 rounded-full tracking-wider backdrop-blur-sm">
                  Operational Metrics Snapshot
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back, Architect!</h2>
                <p className="text-indigo-100 max-w-md text-sm sm:text-base leading-relaxed">
                  You are managing <strong className="text-white font-semibold">{ongoingProjects} active</strong> operations, running hand-in-hand with <strong className="text-white font-semibold">{completedProjects} finished</strong> pipelines.
                </p>
              </div>
              <RocketLaunchIcon className="w-16 h-16 text-white/20 hidden sm:block animate-pulse" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Structural Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute w-5 h-5 left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Query project parameters..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value.toLowerCase());
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Multi-State Messaging */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            System Alert: {error}
          </div>
        )}

        {/* Balanced Stat Blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="Total Modules" value={totalProjects} icon={<ListBulletIcon />} accent="indigo" />
          <StatCard title="Active Inbound" value={ongoingProjects} icon={<PlayCircleIcon />} accent="emerald" />
          <StatCard title="Closed Pipelines" value={completedProjects} icon={<CheckCircleIcon />} accent="sky" />
          <StatCard title="Total Valuation" value={`$${totalBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<CurrencyDollarIcon />} accent="amber" />
        </div>

        {/* Central Visualization Matrix & Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chart Wrapper Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
              Status Density Matrix
            </h3>
            <div className="flex items-center justify-center min-h-[260px]">
              {typeof window !== "undefined" && chartSeries.length > 0 ? (
                <Chart options={chartOptions} series={chartSeries} type="donut" width="100%" height={260} />
              ) : (
                <div className="text-slate-400 text-xs text-center">No structural distribution parameters defined.</div>
              )}
            </div>
          </div>

          {/* Master Operational List */}
          <div className="lg:col-span-2 space-y-6">
            {paginatedProjects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <p className="text-slate-400 font-medium text-sm">No structural items index matched your current vector queries.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Force Initialize Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onEdit={(p) => { setCurrentProject(p); setIsEditModalOpen(true); }} onDelete={handleDeleteProject} />
                ))}
              </div>
            )}

            {/* Micro Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-slate-500">
                  Matrix Fragment {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-all hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modernized Modals */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Architectural Instance">
        <ProjectLifecycleForm companyId={companyId} onSubmit={handleAddProject} onCancel={() => setIsAddModalOpen(false)} isLoading={loading} />
      </Modal>

      {isEditModalOpen && currentProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Mutate Existing Node Instance">
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

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; accent: string }> = ({ title, value, icon, accent }) => {
  const themes: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/30",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/30",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30",
  };

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${themes[accent] || themes.indigo}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5 tracking-tight truncate">{value}</p>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: ProjectWithMedia; onEdit: (p: Project) => void; onDelete: (id: string) => void }> = ({ project, onEdit, onDelete }) => {
  const getStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "ONGOING": return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50";
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      case "PLANNING": return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
      case "CANCELLED": return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
      default: return "bg-slate-50 text-slate-700 dark:bg-slate-950/60 dark:text-slate-400 border-slate-200 dark:border-slate-900/50";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight">
            {project.name}
          </h4>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border shrink-0 ${getStatusStyle(project.status)}`}>
            {project.status}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description || "No project parameters or documentation tags specified."}
        </p>

        {project.mediaUrls && project.mediaUrls.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none">
            {project.mediaUrls.map((url, i) => (
              <img key={i} src={url} alt="Attachment thumbnail" className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0" />
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarDateRangeIcon className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                ${(project.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => onEdit(project)}
          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
        >
          <PencilIcon className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all inline-flex items-center justify-center"
          aria-label="Delete node input"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Unified Structural Unified Form Component supporting dynamic media attachments via S3 Progress tracking dropzone hooks
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
  const [mediaUrls, setMediaUrls] = useState<string[]>(project?.mediaUrls || []);
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
      mediaUrls, // Attach uploaded images natively to form submission
    };

    if (project?.id) {
      onSubmit({ ...project, ...payload });
    } else {
      onSubmit({ ...payload, companyId });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[82vh] overflow-y-auto pr-1 text-slate-800 dark:text-slate-100">
      {formError && (
        <div className="p-3 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400">
          {formError}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Project Cluster Identity *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
          placeholder="System name designation"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Operational Log/Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
          placeholder="Detailed parameters and criteria objectives..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Launch Timeline</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Termination Cap</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">State Vector</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Project["status"])}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="PLANNING">Planning</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Funding Allotment ($)</label>
          <input
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Dynamic S3 File Dropzone / Attachment Block */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">Media Vault Attachments</label>
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            uploading ? "bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 pointer-events-none" : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-950"
          }`}
        >
          <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} accept="image/*" className="hidden" />
          <CloudArrowUpIcon className="w-7 h-7 mx-auto text-slate-400 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {uploading ? "Streaming sequence payload to cloud store..." : "Click or drag images to map attachments to project database node."}
          </p>
        </div>

        {/* Live File Upload Progress bars */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-3 space-y-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="text-[11px]">
                <div className="flex justify-between font-medium mb-1 truncate text-slate-600 dark:text-slate-400">
                  <span>{filename}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render Attached Assets Grid */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
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

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
          disabled={isLoading || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/10 active:scale-95"
          disabled={isLoading || uploading}
        >
          {isLoading ? "Synchronizing Matrix Instance..." : project?.id ? "Commit Mutation Matrix" : "Deploy Project Core Node"}
        </button>
      </div>
    </form>
  );
};