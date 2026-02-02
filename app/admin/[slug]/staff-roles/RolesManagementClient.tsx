"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  CheckBadgeIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import DefineRoleModal from "./DefineRoleModal";

interface RoleData {
  role: string;
  _count: { _all: number };
}

interface RolesManagementClientProps {
  initialData: {
    roleCounts: RoleData[];
    profiles: any[];
  };
  companyId: string;
}

// const RolesManagementClient = ({ initialData, companyId }: RolesManagementClientProps) => {
// Inside RolesManagementClient.tsx

const RolesManagementClient = ({ initialData, companyId }: RolesManagementClientProps) => {
  // 1. Initialize roles with the DB objects
  const [roles, setRoles] = useState<any>(initialData || []);
  
  // 2. Track the active Role ID instead of just a string name
  const [selectedRoleId, setSelectedRoleId] = useState(roles?.profiles?.[0]?.id || "");

  // 3. Find the current role object to display its permissions
  const activeRole = roles.profiles?.find((r:any) => r.id === selectedRoleId);

  useEffect(() => {
        if (activeRole?.permissions) {
          setMatrix(activeRole.permissions);
        }
  }, [selectedRoleId]);

     

  // const [roles] = useState<RoleData[]>(initialData?.roleCounts || []);
  const [selectedRole, setSelectedRole] = useState(roles.profiles?.[0]?.role || "ADMIN");
  const [loading, setLoading] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  // Local state for the permission matrix
  const [matrix, setMatrix] = useState([
    { category: 'Staff Records', actions: ['View', 'Edit', 'Delete'], status: [true, true, false] },
    { category: 'Financials', actions: ['View', 'Manage', 'Audit'], status: [false, false, false] },
    { category: 'Student Data', actions: ['View', 'Grade', 'Enroll'], status: [true, true, true] },
    { category: 'Reports', actions: ['Daily', 'Annual', 'Strategic'], status: [true, false, false] },
  ]);

  // Effect to load existing permissions when a role is selected
  useEffect(() => {
    const existingProfile = initialData?.profiles?.find(p => p.jobTitle === selectedRole);
    if (existingProfile?.permissions) {
      setMatrix(existingProfile.permissions);
    }
  }, [selectedRole, initialData]);

  const togglePermission = (categoryIdx: number, actionIdx: number) => {
    const newMatrix = [...matrix];
    const newStatus = [...newMatrix[categoryIdx].status];
    newStatus[actionIdx] = !newStatus[actionIdx];
    newMatrix[categoryIdx].status = newStatus;
    setMatrix(newMatrix);
  };

  // 1. Add a new permission category
  const addCategory = () => {
    const newCategory = {
      category: "New Module",
      actions: ["View", "Edit", "Delete"],
      status: [false, false, false],
    };
    setMatrix([...matrix, newCategory]);
  };

  // 2. Remove a category
  const removeCategory = (idx: number) => {
    const newMatrix = matrix.filter((_, i) => i !== idx);
    setMatrix(newMatrix);
  };

  // 3. Rename a category
  const updateCategoryName = (idx: number, newName: string) => {
    const newMatrix = [...matrix];
    newMatrix[idx].category = newName;
    setMatrix(newMatrix);
  };

  // 4. Add a specific action to a row (e.g., adding "Audit" to a row)
  const addActionToCategory = (idx: number) => {
    const newMatrix = [...matrix];
    newMatrix[idx].actions.push("New Action");
    newMatrix[idx].status.push(false);
    setMatrix(newMatrix);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/roles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          roleName: selectedRole,
          permissions: matrix,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Success: Permissions synchronized for ${selectedRole} group.`);
      } else {
        alert("Failed to save: " + result.error);
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Network error. Check console.");
    } finally {
      setLoading(false);
    }
  };

   // Updated Sidebar Rendering
    //   return (
    //     <div className="lg:col-span-4 space-y-4">
    //       {roles.map((r) => (
    //         <button 
    //           key={r.id}
    //           onClick={() => setSelectedRoleId(r.id)}
    //           className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all ${
    //             selectedRoleId === r.id 
    //             ? 'bg-blue-600/10 border-blue-500' 
    //             : 'bg-slate-900/40 border-slate-800'
    //           }`}
    //         >
    //           <div className="flex items-center gap-4">
    //             <div className={`p-2 rounded-xl ${selectedRoleId === r.id ? 'bg-blue-500' : 'bg-slate-800'}`}>
    //               <ShieldCheckIcon className="h-5 w-5" />
    //             </div>
    //             <div className="text-left">
    //               <p className="text-sm font-bold text-white uppercase">{r.role}</p>
    //               <p className="text-[10px] text-slate-500">{r.userCount} Assigned Users</p>
    //             </div>
    //           </div>
    //           <ChevronRightIcon className="h-4 w-4" />
    //         </button>
    //       ))}
    //     </div>
    //   );
    // };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Security Infrastructure</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hierarchy.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40"
          >
            <PlusIcon className="h-4 w-4 stroke-[3px]" /> Define New Role
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Role Selection List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">System Roles</h3>
            {roles && roles?.profiles?.map((r: any) => (
              <div>
              <button 
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all ${
                  selectedRole === r.role 
                  ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${selectedRole === r.role ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white uppercase">{r.role}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{r._count._all} Active Users</p>
                  </div>
                </div>
                <ChevronRightIcon className={`h-4 w-4 ${selectedRole === r.role ? 'text-blue-400' : 'text-slate-700'}`} />
              </button>

              {/* // Inside your roles.map in RolesManagementClient.tsx */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting the role
                    // handleDuplicate(r);
                  }}
                  className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"
                  title="Duplicate Role"
                >
                  <ArrowPathRoundedSquareIcon className="h-4 w-4" /> 
                </button>
                <ChevronRightIcon className={`h-4 w-4 ${selectedRoleId === r.id ? 'text-blue-400' : 'text-slate-700'}`} />
              </div>

              </div>
              
            ))}
          </div>

          {/* Right: Permission Matrix */}
          <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white italic">{selectedRole} Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Configure functional access levels for this user group.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-slate-800 rounded-xl">
                <KeyIcon className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Master Auth</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white italic">{selectedRole} Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Full control over access levels and modules.</p>
              </div>
              <button 
                onClick={addCategory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
              >
                <PlusIcon className="h-3 w-3" /> Add Module
              </button>
            </div>

            <div className="space-y-6">
              {matrix.map((perm, idx) => (
                <div key={idx} className="bg-black/20 border border-slate-800/50 rounded-2xl p-6 group relative">
                  {/* Delete Module Button */}
                  <button 
                    onClick={() => removeCategory(idx)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Editable Title */}
                    <input 
                      value={perm.category}
                      onChange={(e) => updateCategoryName(idx, e.target.value)}
                      className="bg-transparent text-sm font-bold text-white uppercase tracking-wider w-48 border-b border-transparent focus:border-blue-500 outline-none"
                    />

                    <div className="flex flex-wrap gap-4 items-center">
                      {perm.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 group/action">
                          <button 
                            onClick={() => togglePermission(idx, i)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${
                              perm.status[i] ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'
                            }`}>
                              {perm.status[i] && <CheckBadgeIcon className="h-4 w-4 text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${perm.status[i] ? 'text-slate-200' : 'text-slate-500'}`}>
                              {action}
                            </span>
                          </button>
                        </div>
                      ))}
                      
                      {/* Quick Add Action button */}
                      <button 
                        onClick={() => addActionToCategory(idx)}
                        className="p-1 rounded-md border border-dashed border-slate-700 text-slate-600 hover:border-slate-500 hover:text-slate-400"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* {matrix.map((perm, idx) => (
                <div key={idx} className="bg-black/20 border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wider w-32">{perm.category}</span>
                    <div className="flex flex-wrap gap-4">
                      {perm.actions.map((action, i) => (
                        <button 
                          key={i} 
                          onClick={() => togglePermission(idx, i)}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <div className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${
                            perm.status[i] 
                            ? 'bg-blue-600 border-blue-500' 
                            : 'bg-slate-800 border-slate-700 group-hover:border-slate-500'
                          }`}>
                            {perm.status[i] && <CheckBadgeIcon className="h-4 w-4 text-white" />}
                          </div>
                          <span className={`text-xs font-medium ${perm.status[i] ? 'text-slate-200' : 'text-slate-500'}`}>
                            {action}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))} */}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-white text-black rounded-xl text-xs font-black uppercase hover:bg-blue-50 transition-all disabled:bg-slate-600"
              >
                {loading && <ArrowPathIcon className="h-3 w-3 animate-spin" />}
                {loading ? "Syncing..." : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DefineRoleModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        companyId={companyId}
        onSuccess={(newRoleObject) => {
          // Add the new DB record to your local state
          setRoles((prev: any) => [...prev, {
            id: newRoleObject.id,
            role: newRoleObject.name,
            permissions: newRoleObject.permissions,
            userCount: 0
          }]);
          setSelectedRoleId(newRoleObject.id);
        }}
      />

    </main>
  );
};

export default RolesManagementClient;