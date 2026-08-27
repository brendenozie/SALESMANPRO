"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon, 
  UsersIcon, 
  XMarkIcon,
  PlusIcon,
  SparklesIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  InboxIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

type AccessLevel = "NONE" | "OWN" | "ALL";

interface ModulePermission {
  category: string;
  capabilities: {
    create: boolean;
    view: AccessLevel;
    edit: AccessLevel;
    delete: AccessLevel;
  };
}

interface Role {
  id: string;
  name: string;
  permissions: ModulePermission[];
}

interface ScopeConfig {
  id: AccessLevel;
  label: string;
  icon: React.ForwardRefExoticComponent<any>;
  activeColorClass: string;
  activeDarkColorClass: string;
}

const SCOPES: ScopeConfig[] = [
  { 
    id: "NONE", 
    label: "None", 
    icon: XMarkIcon, 
    activeColorClass: "bg-rose-50 text-rose-700 ring-rose-600/10",
    activeDarkColorClass: "dark:bg-rose-950/30 dark:text-rose-450 dark:ring-rose-500/20"
  },
  { 
    id: "OWN", 
    label: "Own Only", 
    icon: UserIcon, 
    activeColorClass: "bg-amber-50 text-amber-700 ring-amber-600/10",
    activeDarkColorClass: "dark:bg-amber-950/30 dark:text-amber-450 dark:ring-amber-500/20"
  },
  { 
    id: "ALL", 
    label: "All Records", 
    icon: UsersIcon, 
    activeColorClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    activeDarkColorClass: "dark:bg-emerald-950/30 dark:text-emerald-450 dark:ring-emerald-500/20"
  },
];

const DEFAULT_MODULES = ["Finance", "Inventory", "Hostels", "Staff Directory"];

interface Props {
  companyId: string;
  initialData: Role[];
}

export default function RolesPage({ companyId, initialData = [] }: Props) {
  const [roles, setRoles] = useState<Role[]>(initialData);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync systemic theme wrapper with document standard
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Initializing permissions with exact structure mapping
  const [matrix, setMatrix] = useState<ModulePermission[]>(() => 
    DEFAULT_MODULES.map(cat => ({
      category: cat,
      capabilities: { create: false, view: "NONE", edit: "NONE", delete: "NONE" }
    }))
  );

  const fetchRoles = async () => {
    try {
      const res = await fetch(`/api/admin/roles?companyId=${companyId}`);
      if (!res.ok) throw new Error("Could not retrieve organizational role matrix");
      const json = await res.json();
      setRoles(json.data || []);
    } catch (error) {
      toast.error("Failed to refresh roles database");
    }
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a valid descriptive role label");
      return;
    }

    setSaving(true);
    const method = editingRole ? "PATCH" : "POST";
    const url = editingRole ? `/api/admin/roles/${editingRole.id}` : "/api/admin/roles";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName, companyId, permissions: matrix }),
      });

      if (!res.ok) throw new Error("Request failed on database ingestion level");

      toast.success(editingRole ? "Security role configuration updated" : "New administrative role authorized");
      resetForm();
      await fetchRoles();
    } catch (error) {
      toast.error("Failed to commit role structural definition mapping");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to permanently decommission this role? All associated member privileges will be revoked immediately.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles/${roleId}?companyId=${companyId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Role successfully decommissioned");
      await fetchRoles();
    } catch (error) {
      toast.error("Failed to delete selected security profile");
    }
  };

  const resetForm = () => {
    setEditingRole(null);
    setRoleName("");
    setMatrix(
      DEFAULT_MODULES.map(cat => ({
        category: cat,
        capabilities: { create: false, view: "NONE", edit: "NONE", delete: "NONE" }
      }))
    );
  };

  const handleEditInit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    // Align current configuration metrics dynamically
    if (role.permissions && role.permissions.length > 0) {
      setMatrix(role.permissions);
    } else {
      setMatrix(
        DEFAULT_MODULES.map(cat => ({
          category: cat,
          capabilities: { create: false, view: "NONE", edit: "NONE", delete: "NONE" }
        }))
      );
    }
    toast.loading("Loaded role authorization matrix", { duration: 1500 });
  };

  const updateCapability = (catIdx: number, action: string, value: any) => {
    const newMatrix = [...matrix];
    const targetCap = newMatrix[catIdx].capabilities as any;
    targetCap[action] = value;
    setMatrix(newMatrix);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            fontSize: "12px",
            fontWeight: "bold"
          }
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Actions Utilities Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Access Governance Engine
            </span>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all shadow-sm"
            aria-label="Toggle structural light/dark themes"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Header Action Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-650 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Security Controls</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Roles & Permissions
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Define discrete granular control policies and database CRUD accessibility profiles per structural organizational role.
            </p>
          </div>

          {editingRole && (
            <button 
              onClick={resetForm} 
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm w-full sm:w-auto"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" /> Create New Instead
            </button>
          )}
        </header>

        {/* --- FORM SECTION --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="max-w-md">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
              Role Classification Name
            </label>
            <input 
              type="text"
              className="w-full text-base font-bold px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g., Senior Systems Administrator"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          {/* Matrix Area Grid configuration */}
          <div className="space-y-4">
            <div className="border-b border-slate-150 dark:border-slate-850 pb-2">
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-650 dark:text-indigo-400" />
                Granular Module Access Map
              </h3>
            </div>

            <div className="space-y-4">
              {matrix.map((row, cIdx) => (
                <div 
                  key={row.category} 
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20"
                >
                  <div className="bg-slate-100/50 dark:bg-slate-900/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <span className="font-black text-sm uppercase tracking-wider text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      {row.category}
                    </span>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                        Allow Entry Creation
                      </span>
                      <input 
                        type="checkbox" 
                        checked={row.capabilities.create}
                        onChange={(e) => updateCapability(cIdx, "create", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900">
                    {["view", "edit", "delete"].map((action) => {
                      const currentVal = row.capabilities[action as keyof typeof row.capabilities];
                      return (
                        <div key={action} className="space-y-2">
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest">{action} limit</p>
                          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
                            {SCOPES.map((scope) => {
                              const isSelected = currentVal === scope.id;
                              return (
                                <button
                                  type="button"
                                  key={scope.id}
                                  onClick={() => updateCapability(cIdx, action, scope.id)}
                                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                                    isSelected 
                                      ? `${scope.activeColorClass} ${scope.activeDarkColorClass} ring-1 ring-inset shadow-sm` 
                                      : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                                  }`}
                                >
                                  <scope.icon className="w-3.5 h-3.5" /> 
                                  <span className="hidden sm:inline text-[10px] uppercase tracking-tighter">{scope.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-850">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <CheckIcon className="w-4 h-4 stroke-[3]" /> 
              {saving ? "Processing Request..." : editingRole ? "Apply Security Patch" : "Authorize New Security Role"}
            </button>
          </div>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-550 tracking-widest">
            Registered Security Profiles ({roles.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role: Role) => (
              <div 
                key={role.id} 
                className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all group flex flex-col justify-between h-40 ${
                  editingRole?.id === role.id 
                    ? "border-indigo-500 ring-1 ring-indigo-500/30" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-bold text-slate-950 dark:text-white text-lg tracking-tight truncate max-w-[180px]">
                      {role.name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditInit(role)}
                        className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50/50 transition-colors"
                        title="Configure profile permissions"
                      >
                        <PencilIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button 
                        onClick={() => handleDelete(role.id)}
                        className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:text-rose-600 rounded-lg hover:bg-rose-50/50 transition-colors"
                        title="Delete security profile"
                      >
                        <TrashIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider mt-1.5">
                    {role.permissions?.length || 0} Modules configured
                  </p>
                </div>

                <div className="flex gap-1 flex-wrap pt-2 overflow-hidden max-h-12 border-t border-slate-100 dark:border-slate-850">
                  {role.permissions?.length > 0 ? (
                    role.permissions.map((p, idx) => (
                      <span 
                        key={idx} 
                        className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-850"
                      >
                        {p.category}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 italic">No access bounds set</span>
                  )}
                </div>
              </div>
            ))}

            {roles.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <InboxIcon className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No custom security credentials declared yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}