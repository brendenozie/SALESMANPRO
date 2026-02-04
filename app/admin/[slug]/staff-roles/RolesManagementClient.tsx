'use client';
import { HeartIcon } from '@heroicons/react/20/solid';
import { CheckIcon, PencilIcon, TrashIcon, UserIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';


// 1. Refined Type Definitions
type AccessLevel = 'NONE' | 'OWN' | 'ALL';

interface ModulePermission {
  category: string;
  capabilities: {
    create: boolean;
    view: AccessLevel;
    edit: AccessLevel;
    delete: AccessLevel;
  };
}

const SCOPES = [
  { id: 'NONE' as AccessLevel, label: 'None', icon: XMarkIcon },
  { id: 'OWN' as AccessLevel, label: 'Own', icon: UserIcon },
  { id: 'ALL' as AccessLevel, label: 'All', icon: UsersIcon },
];

const DEFAULT_MODULES = ["Finance", "Inventory"];

export default function RolesPage({ companyId, initialData }: { companyId: string, initialData: any }) {
  const [roles, setRoles] = useState<any[]>(initialData);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleName, setRoleName] = useState('');
  
  // Initialize matrix with the new structure
  const [matrix, setMatrix] = useState<ModulePermission[]>(
    DEFAULT_MODULES.map(cat => ({
      category: cat,
      capabilities: { create: false, view: 'NONE', edit: 'NONE', delete: 'NONE' }
    }))
  );

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    const res = await fetch(`/api/admin/roles?companyId=${companyId}`);
    setRoles(await res.json());
  };

  const handleSave = async () => {
    const method = editingRole ? 'PATCH' : 'POST';
    const url = editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roleName, companyId, permissions: matrix }),
    });
    
    resetForm();
    fetchRoles();
  };

  const resetForm = () => {
    setEditingRole(null);
    setRoleName('');
    setMatrix(DEFAULT_MODULES.map(cat => ({
      category: cat,
      capabilities: { create: false, view: 'NONE', edit: 'NONE', delete: 'NONE' }
    })));
  };

  const updateCapability = (catIdx: number, action: string, value: any) => {
    const newMatrix = [...matrix];
    (newMatrix[catIdx].capabilities as any)[action] = value;
    setMatrix(newMatrix);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
        {editingRole && (
          <button onClick={resetForm} className="text-sm text-slate-500 hover:text-indigo-600 font-medium">
            + Create New Instead
          </button>
        )}
      </div>

      {/* --- FORM SECTION --- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Role Name</label>
            <input 
              className="w-full text-lg font-semibold p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Senior Registrar"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-700 mb-4">Module Capabilities</p>
          {matrix.map((row, cIdx) => (
            <div key={row.category} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <HeartIcon className="w-5 h-5 text-indigo-500" /> {row.category}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-500 uppercase">Can Create</span>
                  <input 
                    type="checkbox" 
                    checked={row.capabilities.create}
                    onChange={(e) => updateCapability(cIdx, 'create', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
                {['view', 'edit', 'delete'].map((action) => (
                  <div key={action}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{action}</p>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      {SCOPES.map((scope) => (
                        <button
                          key={scope.id}
                          onClick={() => updateCapability(cIdx, action, scope.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            row.capabilities[action as keyof typeof row.capabilities] === scope.id 
                            ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <scope.icon className="w-4 h-4" /> {scope.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave}
          className="mt-8 w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <CheckIcon className="w-4 h-4" /> {editingRole ? 'Update Role' : 'Save New Role'}
        </button>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role: any) => (
          <div key={role.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{role.name}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-tighter">
                  {role.permissions?.length || 0} Modules configured
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   onClick={() => { setEditingRole(role); setRoleName(role.name); setMatrix(role.permissions); }}
                   className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={async () => { if(confirm('Delete role?')) await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' }); fetchRoles(); }}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}