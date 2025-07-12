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
  ArcElement, // For Pie chart
} from "chart.js";
import { Project } from "./page"; // Import the Project type

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

interface ClientProps {
  projectsData: Project[];
}

const ProjectsClient: React.FC<ClientProps> = ({ projectsData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

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

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-purple-400 mb-10 drop-shadow-lg">
          Projects Management
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md"
            aria-label="Search projects"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="ml-3 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

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
                      color: '#ddd', // Legend text color
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
          {paginatedProjects.length === 0 ? (
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
                  onEdit={(id) => alert(`Editing project with ID ${id}`)}
                  onDelete={(id) => alert(`Deleting project with ID ${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages}
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
