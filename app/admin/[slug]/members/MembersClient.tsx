// app/admin/members/MembersClient.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Member, ProjectOption, ProjectMember } from "./page";
import Modal from "@/components/Modal"; // Adjust path as needed

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  membersData: Member[];
  projectsData: ProjectOption[];
  projectMembersData: ProjectMember[];
}

const MembersClient: React.FC<ClientProps> = ({ membersData: initialMembersData, projectsData: initialProjectsData, projectMembersData: initialProjectMembersData }) => {
  const [membersData, setMembersData] = useState<Member[]>(initialMembersData);
  const [projectMembersData, setProjectMembersData] = useState<ProjectMember[]>(initialProjectMembersData);
  const [projectsData, setProjectsData] = useState<ProjectOption[]>(initialProjectsData); // Keep projects data for dropdown
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false); // For adding ProjectMember
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  // Function to refresh all relevant data
  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetch(`${apiUrl}/users`, { next: { revalidate: 60 } }); // Assuming a /api/users endpoint
      const projectsRes = await fetch(`${apiUrl}/projects`, { next: { revalidate: 60 } });
      const projectMembersRes = await fetch(`${apiUrl}/project-members`, { next: { revalidate: 60 } });

      if (usersRes.ok && projectsRes.ok && projectMembersRes.ok) {
        setMembersData(await usersRes.json());
        setProjectsData(await projectsRes.json());
        setProjectMembersData(await projectMembersRes.json());
      } else {
        throw new Error("Failed to fetch all data.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh data.");
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };


  // Filter users by name or email
  const filteredMembers = useMemo(() => {
    return membersData.filter(
      (member) =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [membersData, searchTerm]);

  // Pagination logic for Members
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedMembers = filteredMembers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Handle Add Project Member
  const handleAddProjectMember = async (newProjectMember: Omit<ProjectMember, 'id' | 'createdAt' | 'project' | 'user'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/project-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProjectMember),
      });

      if (res.ok) {
        setIsAddMemberModalOpen(false);
        await refreshAllData(); // Refresh all data after successful addition
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add project member.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add project member.");
      console.error("Error adding project member:", err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Edit/Delete actions for members or project members
  const handleEditMember = (id: string) => alert(`Editing member with ID ${id}`);
  const handleDeleteMember = (id: string) => alert(`Deleting member with ID ${id}`);
  const handleDeleteProjectMember = (id: string) => alert(`Removing project member with ID ${id}`);


  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-pink-400 mb-10 drop-shadow-lg">
          Members Management
        </h1>

        {/* Action Bar: Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none shadow-md"
            aria-label="Search members"
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
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg shadow-lg hover:bg-pink-600 transition-all font-semibold"
            >
              Add Project Member
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading members data...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Members List */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-6">All Users</h2>
          {paginatedMembers.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No members match your search or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                />
              ))}
            </div>
          )}
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
        </section>

        {/* Project Members List */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-6">Project Members</h2>
          {projectMembersData.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No project members available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projectMembersData.map((pm) => (
                <ProjectMemberCard
                  key={pm.id}
                  projectMember={pm}
                  onDelete={handleDeleteProjectMember}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Project Member Modal */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Project Member">
        <AddProjectMemberForm
          onSubmit={handleAddProjectMember}
          onCancel={() => setIsAddMemberModalOpen(false)}
          isLoading={loading}
          users={membersData} // Pass all fetched users
          projects={projectsData} // Pass all fetched projects
        />
      </Modal>
    </main>
  );
};

export default MembersClient;

// ----------------------
// Helper components
// ----------------------

interface MemberCardProps {
  member: Member;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-pink-400 mb-2">{member.name || 'N/A'}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Email: <span className="text-gray-300">{member.email}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Role: <span className="text-gray-300">{member.role || 'USER'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Joined: <span className="text-gray-300">{new Date(member.createdAt).toLocaleDateString()}</span>
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(member.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(member.id)}
      >
        Delete
      </button>
    </div>
  </div>
);

interface ProjectMemberCardProps {
  projectMember: ProjectMember;
  onDelete: (id: string) => void;
}

const ProjectMemberCard: React.FC<ProjectMemberCardProps> = ({ projectMember, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-yellow-400 mb-2">{projectMember.user.name || projectMember.user.email}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Project: <span className="text-gray-300">{projectMember.project.name}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Role: <span className="text-gray-300">{projectMember.role}</span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Assigned: <span className="text-gray-300">{new Date(projectMember.createdAt).toLocaleDateString()}</span>
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(projectMember.id)}
      >
        Remove
      </button>
    </div>
  </div>
);


// Add Project Member Form Component
interface AddProjectMemberFormProps {
  onSubmit: (projectMember: Omit<ProjectMember, 'id' | 'createdAt' | 'project' | 'user'>) => void;
  onCancel: () => void;
  isLoading: boolean;
  users: Member[]; // Full list of users to select from
  projects: ProjectOption[]; // Full list of projects to select from
}

const AddProjectMemberForm: React.FC<AddProjectMemberFormProps> = ({ onSubmit, onCancel, isLoading, users, projects }) => {
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectId) {
      setFormError('Project is required.');
      return;
    }
    if (!userId) {
      setFormError('User is required.');
      return;
    }
    if (!role.trim()) {
      setFormError('Role is required.');
      return;
    }

    onSubmit({
      projectId,
      userId,
      role,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-300">Project</label>
        <select
          id="projectId"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-pink-500 focus:border-pink-500"
          required
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-300">User</label>
        <select
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-pink-500 focus:border-pink-500"
          required
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
        <input
          type="text"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-pink-500 focus:border-pink-500"
          placeholder="e.g., Manager, Contributor"
          required
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
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Project Member'}
        </button>
      </div>
    </form>
  );
};
