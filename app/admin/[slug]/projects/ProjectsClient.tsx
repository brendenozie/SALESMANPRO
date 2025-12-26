// app/admin/projects/ProjectsClient.tsx
"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Project } from "./page";
import Modal from "@/components/Modal"; // Ensure this path is correct for your Modal component
import { toast, Toaster } from 'react-hot-toast'; // For engaging notifications
import { ArrowsUpDownIcon, CalendarDateRangeIcon, CheckCircleIcon, CurrencyDollarIcon, ListBulletIcon, MagnifyingGlassCircleIcon, PencilIcon, PlayCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion, useInView, useSpring } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// CountUp Component for animated numbers
const CountUp = ({ to, format }: { to: number; format?: (val: number) => string | number; }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { damping: 50, stiffness: 200 });

  useEffect(() => {
    if (inView) {
      spring.set(to);
    }
  }, [spring, to, inView]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format ? String(format(latest)) : Math.round(latest).toLocaleString();
      }
    });
    return unsubscribe;
  }, [spring, format]);

  return <span ref={ref}>0</span>;
};

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

  // Chart data for Project Status Distribution
  const statusCounts = projectsData.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<Project['status'], number>);

  const projectStatusChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          '#FFD700', // PLANNING (Gold)
          '#29B6F6', // ONGOING (Light Blue)
          '#8BC34A', // COMPLETED (Light Green)
          '#B0BEC5', // ARCHIVED (Blue Grey)
          '#EF5350', // CANCELLED (Red)
        ],
        borderColor: '#1f2937', // Darker border for contrast
        borderWidth: 2,
      },
    ],
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
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-950 text-gray-100 min-h-screen font-sans">
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast notifications */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-purple-400 mb-12 drop-shadow-lg animate-fade-in-down">
          Projects Dashboard 📊
        </h1>

        {/* Action Bar: Search, Add Button, Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 p-4 bg-gray-800 rounded-xl shadow-lg">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassCircleIcon className="absolute w-6 h-6 left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:ring-purple-500 focus:border-purple-500 focus:outline-none shadow-md transition-all duration-300 ease-in-out"
              aria-label="Search projects"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshProjects}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 transform hover:scale-105"
              disabled={loading}
              aria-label="Refresh projects"
            >
              <ArrowsUpDownIcon className={` w-6 h-6 ${loading ? "animate-spin" : ""}` }/> Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all font-semibold flex items-center gap-2 transform hover:scale-105"
              aria-label="Add new project"
            >
              <PlusIcon className=" w-6 h-6"/> Add New Project
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-6 text-lg animate-pulse">Loading projects... Please wait. 🤔</p>}
        {error && <p className="text-center text-red-500 mb-6 text-lg">Oops! Something went wrong: {error} 😟</p>}

        {/* Summary Section */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          <SummaryCard
            title="Total Projects"
            value={totalProjects}
            icon={<ListBulletIcon />}
            bgColor="from-purple-600 to-purple-800"
            index={0}
          />
          <SummaryCard
            title="Ongoing Projects"
            value={ongoingProjects}
            icon={<PlayCircleIcon />}
            bgColor="from-blue-600 to-blue-800"
            index={1}
          />
          <SummaryCard
            title="Completed Projects"
            value={completedProjects}
            icon={<CheckCircleIcon />}
            bgColor="from-green-600 to-green-800"
            index={2}
          />
          <SummaryCard
            title="Total Budget"
            value={totalBudget}
            icon={<CurrencyDollarIcon />}
            bgColor="from-yellow-600 to-yellow-800"
            isCurrency={true}
            index={3}
          />
        </motion.div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 text-center">
            Project Status Distribution 📊
          </h2>
          <div className="chart-container w-full max-w-xl" style={{ height: "350px" }}>
            <Pie
              data={projectStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right" as const,
                    labels: {
                      color: '#ddd',
                      font: {
                        size: 14,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed !== null) {
                          label += context.parsed;
                        }
                        return label;
                      },
                      title: function(context) {
                        return context[0].label;
                      }
                    },
                    bodyFont: {
                      size: 14,
                    },
                    titleFont: {
                      size: 16,
                      weight: 'bold',
                    },
                    padding: 10,
                    boxPadding: 5,
                    cornerRadius: 8,
                    backgroundColor: 'rgba(55, 65, 81, 0.9)', // Darker tooltip background
                    borderColor: '#6b7280',
                    borderWidth: 1,
                  }
                },
                elements: {
                  arc: {
                    borderWidth: 2,
                    borderColor: '#1f2937', // Ensure arcs have a dark border
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Projects List */}
        <section className="mb-12">
          {paginatedProjects.length === 0 && !loading && !error ? (
            <motion.div 
              className="text-center py-20 bg-gray-800 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl text-gray-400 font-medium">
                No projects found. Time to create some! ✨
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all font-semibold flex items-center gap-2 mx-auto"
                aria-label="Add new project"
              >
                <PlusIcon className=" w-6 h-6"/> Add Your First Project
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
            >
              {paginatedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditModal}
                  onDelete={handleDeleteProject}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-10">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-6 py-3 bg-gray-700 rounded-lg text-white font-medium disabled:opacity-50 hover:bg-gray-600 transition-all transform hover:scale-105"
            >
              Previous
            </button>
            <span className="px-5 py-3 bg-gray-800 text-white rounded-lg font-bold flex items-center justify-center min-w-[120px]">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-6 py-3 bg-gray-700 rounded-lg text-white font-medium disabled:opacity-50 hover:bg-gray-600 transition-all transform hover:scale-105"
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
// Helper components (updated for visual appeal)
// ----------------------

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string; // Tailwind gradient classes, e.g., "from-purple-600 to-purple-800"
  isCurrency?: boolean;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor, isCurrency = false, index }) => (
  <motion.div 
    className={`relative p-6 rounded-xl shadow-lg text-white overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer bg-gradient-to-br ${bgColor}`}
    variants={cardVariants}
  >
    <div className="absolute top-4 right-4 text-4xl opacity-30 w-12 h-12">
      {icon}
    </div>
    <h2 className="text-xl font-semibold mb-2 opacity-90">{title}</h2>
    <p className="text-4xl font-extrabold">
      {isCurrency && '$'}
      <CountUp 
        to={value} 
        format={isCurrency ? (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : undefined}
      />
    </p>
  </motion.div>
);

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  index: number;
}

const projectCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, index }) => {
  const getStatusClasses = (status: Project['status']) => {
    switch (status) {
      case 'ONGOING':
        return 'text-blue-400 bg-blue-900/30 ring-blue-500/30';
      case 'COMPLETED':
        return 'text-green-400 bg-green-900/30 ring-green-500/30';
      case 'PLANNING':
        return 'text-yellow-400 bg-yellow-900/30 ring-yellow-500/30';
      case 'ARCHIVED':
        return 'text-gray-400 bg-gray-700/30 ring-gray-500/30';
      case 'CANCELLED':
        return 'text-red-400 bg-red-900/30 ring-red-500/30';
      default:
        return 'text-gray-400 bg-gray-700/30 ring-gray-500/30';
    }
  };

  return (
    <motion.div 
      className="bg-gray-800 text-gray-200 p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out relative flex flex-col justify-between border border-gray-700 hover:border-purple-500"
      variants={projectCardVariants}
    >
      <div>
        <h3 className="text-3xl font-bold text-purple-400 mb-3 leading-tight">{project.name}</h3>
        <p className="text-md text-gray-300 mb-4 line-clamp-3">
          <strong className="text-gray-400">Description:</strong> {project.description || 'No description provided.'}
        </p>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-gray-400">
            <ListBulletIcon className="text-purple-400 w-6 h-6" /> Status:
            <span className={`font-semibold px-2 py-1 rounded-full text-xs ring-1 ${getStatusClasses(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </p>
          <p className="flex items-center gap-2 text-gray-400">
            <CalendarDateRangeIcon className="text-blue-400 w-6 h-6" /> Start Date:
            <span className="text-gray-300">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
          </p>
          <p className="flex items-center gap-2 text-gray-400">
            <CalendarDateRangeIcon className="text-orange-400 w-6 h-6" /> End Date:
            <span className="text-gray-300">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
          </p>
          <p className="flex items-center gap-2 text-gray-400">
            <CurrencyDollarIcon className="text-green-400 w-6 h-6" /> Budget:
            <span className="text-green-400 font-bold">${(project.budget || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>
      <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium"
          onClick={() => onEdit(project)}
          aria-label={`Edit project ${project.name}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PencilIcon className=" w-6 h-6"/> Edit
        </motion.button>
        <motion.button
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-medium"
          onClick={() => onDelete(project.id)}
          aria-label={`Delete project ${project.name}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TrashIcon className=" w-6 h-6"/> Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

// Add Project Form Component (improved validation and styling)
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
      companyId: companyId, // IMPORTANT: Replace with actual company ID from context/props
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {formError && <p className="text-red-400 text-sm font-medium mb-4">{formError}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Project Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Project['status'])}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
        >
          <option value="PLANNING">Planning</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-1">Budget ($)</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          step="0.01"
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          placeholder="e.g., 15000.00"
        />
      </div>
      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Adding... ⏳' : 'Add Project ✨'}
        </button>
      </div>
    </form>
  );
};

// Edit Project Form Component (new)
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
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {formError && <p className="text-red-400 text-sm font-medium mb-4">{formError}</p>}
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">Project Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
          <input
            type="date"
            id="edit-startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          />
        </div>
        <div>
          <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            id="edit-endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          />
        </div>
      </div>
      <div>
        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select
          id="edit-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Project['status'])}
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
        >
          <option value="PLANNING">Planning</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div>
        <label htmlFor="edit-budget" className="block text-sm font-medium text-gray-300 mb-1">Budget ($)</label>
        <input
          type="number"
          id="edit-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          step="0.01"
          className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500 shadow-sm transition-colors"
          placeholder="e.g., 15000.00"
        />
      </div>
      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all disabled:opacity-50 transform hover:scale-105 font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Updating... ⏳' : 'Save Changes ✅'}
        </button>
      </div>
    </form>
  );
};

// Modal Component (assuming you have a basic Modal, if not, here's a simple one)
// components/Modal.tsx
/*
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-gray-700 transform scale-95 animate-scale-in">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-3xl font-extrabold text-purple-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-3xl transition-colors"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
*/

// Add these to your global CSS or a dedicated styles file if using Tailwind JIT
/*
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
*/