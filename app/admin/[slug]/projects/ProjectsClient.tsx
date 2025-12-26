// app/admin/[slug]/projects/ProjectsClient.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Project } from "./page";
import Modal from "@/components/Modal";
import { toast, Toaster } from 'react-hot-toast';
import {
  ArrowsUpDownIcon,
  CalendarDateRangeIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  MagnifyingGlassCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon,
  RocketLaunchIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  projectsData: Project[];
  companyId:string;
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

  // Function to refresh data with a loading state and error handling
  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects`, { next: { revalidate: 60 } }); // Use the admin endpoint
      if (res.ok) {
        const data = await res.json();
        setProjectsData(data);
        toast.success("Projects refreshed successfully! ✨");
      } else {
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh projects.");
      toast.error(`Error refreshing projects: ${err.message || "Unknown error"}`);
      console.error("Error refreshing projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort projects for better UX
  const filteredProjects = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return projectsData
      .filter(
        (project) =>
          project.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          project.description?.toLowerCase().includes(lowerCaseSearchTerm)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by most recent
  }, [projectsData, searchTerm]);

  // Summaries
  const totalProjects = projectsData.length;
  const ongoingProjects = projectsData.filter(p => p.status === 'ONGOING').length;
  const completedProjects = projectsData.filter(p => p.status === 'COMPLETED').length;
  const totalBudget = useMemo(
    () => projectsData.reduce((sum, project) => sum + (project.budget || 0), 0),
    [projectsData]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Project Status Distribution - ApexCharts format
  const statusCounts = projectsData.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<Project['status'], number>);

  const chartSeries = Object.values(statusCounts);
  const chartLabels = Object.keys(statusCounts);
  
  const chartOptions: any = {
    chart: {
      type: 'donut',
      background: 'transparent',
    },
    labels: chartLabels,
    colors: ['#FFD700', '#29B6F6', '#8BC34A', '#B0BEC5', '#EF5350'],
    legend: {
      position: 'right' as const,
      labels: {
        colors: '#ddd',
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
        },
      },
    },
    tooltip: {
      theme: 'dark',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom' as const,
        },
      },
    }],
  };

  // Handle Add Project
  const handleAddProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects`, { // Use admin endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        await refreshProjects();
        toast.success("Project added successfully! 🎉");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add project.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add project.");
      toast.error(`Error adding project: ${err.message || "Unknown error"}`);
      console.error("Error adding project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Project
  const handleEditProject = async (updatedProject: Project) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${updatedProject.id}`, { // Use admin endpoint
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await refreshProjects();
        toast.success("Project updated successfully! 🚀");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update project.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to update project.");
      toast.error(`Error updating project: ${err.message || "Unknown error"}`);
      console.error("Error updating project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/projects/${id}`, { // Use admin endpoint
        method: 'DELETE',
      });

      if (res.ok) {
        await refreshProjects();
        toast.success("Project deleted successfully! 👋");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete project.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete project.");
      toast.error(`Error deleting project: ${err.message || "Unknown error"}`);
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-[#020617] text-gray-100 min-h-screen font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        {/* New Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">
            Projects Engine
          </h1>
          <p className="text-gray-400 text-lg">Manage and track your projects efficiently</p>
        </div>

        {/* Welcome Back Card and Search Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Welcome Back Card */}
          <div className="lg:col-span-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back! 👋</h2>
                <p className="text-purple-100">
                  You have {ongoingProjects} ongoing {ongoingProjects === 1 ? 'project' : 'projects'} and {completedProjects} completed {completedProjects === 1 ? 'project' : 'projects'}.
                </p>
              </div>
              <RocketLaunchIcon className="w-20 h-20 text-white opacity-20" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
            <div className="relative">
              <MagnifyingGlassCircleIcon className="absolute w-6 h-6 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-700/50 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition-all"
                aria-label="Search projects"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={refreshProjects}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 transform hover:scale-105"
            disabled={loading}
            aria-label="Refresh projects"
          >
            <ArrowsUpDownIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2 transform hover:scale-105"
            aria-label="Add new project"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Project
          </button>
        </div>

        {loading && <p className="text-center text-blue-400 mb-6 text-lg animate-pulse">Loading projects... Please wait. 🤔</p>}
        {error && <p className="text-center text-red-500 mb-6 text-lg">Oops! Something went wrong: {error} 😟</p>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModernStatsCard
            title="Total Projects"
            value={totalProjects}
            icon={<ListBulletIcon className="w-8 h-8" />}
            bgGradient="from-purple-600 to-purple-800"
            iconBg="bg-purple-500/20"
          />
          <ModernStatsCard
            title="Active Projects"
            value={ongoingProjects}
            icon={<PlayCircleIcon className="w-8 h-8" />}
            bgGradient="from-blue-600 to-blue-800"
            iconBg="bg-blue-500/20"
          />
          <ModernStatsCard
            title="Completed"
            value={completedProjects}
            icon={<CheckCircleIcon className="w-8 h-8" />}
            bgGradient="from-green-600 to-green-800"
            iconBg="bg-green-500/20"
          />
          <ModernStatsCard
            title="Total Budget"
            value={`$${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<CurrencyDollarIcon className="w-8 h-8" />}
            bgGradient="from-yellow-600 to-yellow-800"
            iconBg="bg-yellow-500/20"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">
            Status Distribution 📊
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-lg" style={{ minHeight: "350px" }}>
              {typeof window !== 'undefined' && chartSeries.length > 0 && (
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="donut"
                  height={350}
                />
              )}
              {chartSeries.length === 0 && (
                <div className="flex items-center justify-center h-[350px] text-gray-400">
                  No data to display
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects List */}
        <section className="mb-12">
          {paginatedProjects.length === 0 && !loading && !error ? (
            <div className="text-center py-20 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg">
              <p className="text-2xl text-gray-400 font-medium mb-4">
                No projects found. Time to create some! ✨
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold flex items-center gap-2 mx-auto"
                aria-label="Add new project"
              >
                <PlusIcon className="w-6 h-6" />
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <ModernProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-10">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-6 py-3 bg-gray-700 rounded-xl text-white font-medium disabled:opacity-50 hover:bg-gray-600 transition-all transform hover:scale-105 border border-gray-600"
            >
              Previous
            </button>
            <span className="px-5 py-3 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center min-w-[120px] border border-gray-700">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-6 py-3 bg-gray-700 rounded-xl text-white font-medium disabled:opacity-50 hover:bg-gray-600 transition-all transform hover:scale-105 border border-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Project ✨">
        <AddProjectForm
          companyId={companyId}
          onSubmit={handleAddProject}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Edit Project Modal */}
      {currentProject && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project ✍️">
          <EditProjectForm
            project={currentProject}
            onSubmit={handleEditProject}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={loading}
          />
        </Modal>
      )}
    </main>
  );
};

export default ProjectsClient;

// ----------------------
// Modern Stats Card Component
// ----------------------

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
}

const ModernStatsCard: React.FC<ModernStatsCardProps> = ({ title, value, icon, bgGradient, iconBg }) => (
  <div className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border border-white/10`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
    <div className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 relative z-10`}>
      {icon}
    </div>
    <h3 className="text-white/80 text-sm font-medium mb-1 relative z-10">{title}</h3>
    <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
  </div>
);

// ----------------------
// Modern Project Card Component
// ----------------------

interface ModernProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ModernProjectCard: React.FC<ModernProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'ONGOING':
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
      case 'COMPLETED':
        return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
      case 'PLANNING':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
      case 'ARCHIVED':
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };
      case 'CANCELLED':
        return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
            {project.name}
          </h3>
          <span className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2`}>
            {project.status}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description || 'No description provided.'}
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarDateRangeIcon className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">
              ${(project.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <ClockIcon className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-xs">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
        <button
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium transform hover:scale-105"
          onClick={() => onEdit(project)}
          aria-label={`Edit project ${project.name}`}
        >
          <PencilIcon className="w-5 h-5" />
          Edit
        </button>
        <button
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-medium transform hover:scale-105"
          onClick={() => onDelete(project.id)}
          aria-label={`Delete project ${project.name}`}
        >
          <TrashIcon className="w-5 h-5" />
          Delete
        </button>
      </div>
    </div>
  );
};

// Add Project Form Component
interface AddProjectFormProps {
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading: boolean;
  companyId: string;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit, onCancel, isLoading, companyId }) => {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('PLANNING');
  const [budget, setBudget] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    if (budget && isNaN(parseFloat(budget))) {
      setFormError('Budget must be a valid number.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setFormError('End date cannot be before start date.');
      return;
    }

    onSubmit({
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status,
      budget: budget ? parseFloat(budget) : null,
      companyId: companyId,
    });
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Project ✨</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
            {formError}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            placeholder="Describe your project"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
          >
            <option value="PLANNING">Planning</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
            Budget ($)
          </label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step="0.01"
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            placeholder="e.g., 15000.00"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Adding... ⏳' : 'Add Project ✨'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Edit Project Form Component
interface EditProjectFormProps {
  project: Project;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [startDate, setStartDate] = useState(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [budget, setBudget] = useState<string>(project.budget?.toString() || '');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    if (budget && isNaN(parseFloat(budget))) {
      setFormError('Budget must be a valid number.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setFormError('End date cannot be before start date.');
        return;
    }

    onSubmit({
      ...project,
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      status,
      budget: budget ? parseFloat(budget) : null,
    });
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Project ✍️</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
            {formError}
          </div>
        )}
        
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            required
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="edit-startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="edit-endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all"
          >
            <option value="PLANNING">Planning</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-budget" className="block text-sm font-medium text-gray-300 mb-2">
            Budget ($)
          </label>
          <input
            type="number"
            id="edit-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step="0.01"
            className="w-full p-3 border border-gray-600 rounded-xl bg-gray-700/50 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all placeholder-gray-500"
            placeholder="e.g., 15000.00"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Updating... ⏳' : 'Save Changes ✅'}
          </button>
        </div>
      </form>
    </div>
  );
};