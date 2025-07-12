// app/admin/projects/ProjectsClient.tsx
"use client";

import React, { useState, useMemo } from "react";
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
import Modal from "@/components/Modal"; // Adjust path as needed

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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  projectsData: Project[];
}

const ProjectsClient: React.FC<ClientProps> = ({ projectsData: initialProjectsData }) => {
  const [projectsData, setProjectsData] = useState<Project[]>(initialProjectsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  // Function to refresh data
  const refreshProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/projects`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProjectsData(data);
      } else {
        throw new Error(`Failed to fetch projects: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh projects.");
      console.error("Error refreshing projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by project name or description
  const filteredProjects = useMemo(() => {
    return projectsData.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };

  // Handle Add Project
  const handleAddProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        await refreshProjects(); // Refresh the list after successful addition
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add project.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add project.");
      console.error("Error adding project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Edit/Delete actions
  const handleEdit = (id: string) => alert(`Editing project with ID ${id}`);
  const handleDelete = (id: string) => alert(`Deleting project with ID ${id}`);


  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-purple-400 mb-10 drop-shadow-lg">
          Projects Management
        </h1>

        {/* Action Bar: Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md"
            aria-label="Search projects"
          />
          <div className="flex gap-3">
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Add New Project
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading projects...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Projects"
            value={totalProjects}
            bgColor="bg-purple-600"
          />
          <SummaryCard
            title="Ongoing Projects"
            value={ongoingProjects}
            bgColor="bg-blue-600"
          />
          <SummaryCard
            title="Completed Projects"
            value={completedProjects}
            bgColor="bg-green-600"
          />
          <SummaryCard
            title="Total Budget"
            value={`$${totalBudget.toFixed(2)}`}
            bgColor="bg-yellow-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Project Status Distribution
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
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
                      }
                    }
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Projects List */}
        <section>
          {paginatedProjects.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No projects match your search or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Project">
        <AddProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={loading}
        />
      </Modal>
    </main>
  );
};

export default ProjectsClient;

// ----------------------
// Helper components
// ----------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor }) => (
  <div className={`${bgColor} text-white p-5 rounded-lg shadow-md hover:shadow-lg transition`}>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-purple-400 mb-2">{project.name}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Description: <span className="text-gray-300 line-clamp-2">{project.description || 'N/A'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Status: <span className={`font-medium ${
          project.status === 'ONGOING' ? 'text-blue-400' :
          project.status === 'COMPLETED' ? 'text-green-400' :
          project.status === 'PLANNING' ? 'text-yellow-400' :
          'text-red-400'
        }`}>{project.status}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Start Date: <span className="text-gray-300">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Budget: <span className="text-yellow-400 font-medium">${(project.budget || 0).toFixed(2)}</span>
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(project.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(project.id)}
      >
        Delete
      </button>
    </div>
  </div>
);

// Add Project Form Component
interface AddProjectFormProps {
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('PLANNING');
  const [budget, setBudget] = useState<string>(''); // Use string for input, convert to number
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
      companyId: 'your_company_id_here', // Replace with actual company ID from context/props
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Project Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Project['status'])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="PLANNING">Planning</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-300">Budget ($)</label>
        <input
          type="number"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          step="0.01"
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Project'}
        </button>
      </div>
    </form>
  );
};
