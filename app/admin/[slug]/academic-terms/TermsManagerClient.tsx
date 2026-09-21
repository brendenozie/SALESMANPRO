"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { clientFetchJson } from "@/lib/api/clientFetch";

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  termNumber?: number;
  isActive: boolean;
  academicYearId?: string;
  academicYear?: { id: string; name: string };
}

interface AcademicYear {
  id: string;
  name: string;
  isActive: boolean;
}

export default function TermsManager({
  companyId,
  years = [],
}: {
  companyId: string;
  years?: AcademicYear[];
}) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    termNumber: "1",
    academicYearId: years[0]?.id || "",
  });

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await clientFetchJson<Term[]>(
      `/api/admin/academic-terms?companyId=${encodeURIComponent(companyId)}`
    );

    if (res.ok && Array.isArray(res.data)) {
      setTerms(res.data);
    } else {
      setError(res.error || "Failed to load academic terms");
      setTerms([]);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;

    setError(null);
    const payload = {
      ...form,
      termNumber: parseInt(form.termNumber, 10) || 1,
      companyId,
    };

    const url = editingTerm
      ? `/api/admin/academic-terms/${editingTerm.id}`
      : `/api/admin/academic-terms`;

    const method = editingTerm ? "PATCH" : "POST";

    const res = await clientFetchJson(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError(res.error || "Failed to save academic term");
      return;
    }

    setForm({
      name: "",
      startDate: "",
      endDate: "",
      termNumber: "1",
      academicYearId: years[0]?.id || "",
    });
    setEditingTerm(null);
    setShowForm(false);

    fetchTerms();
  }

  async function deleteTerm(id: string) {
    if (!confirm("Are you sure you want to delete this term?")) return;

    const res = await clientFetchJson(`/api/admin/academic-terms/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError(res.error || "Failed to delete term");
      return;
    }

    fetchTerms();
  }

  async function activateTerm(term: Term) {
    const yearId = term.academicYearId || form.academicYearId || years[0]?.id;
    if (!yearId) {
      setError("An academic year is required to activate a term.");
      return;
    }

    const res = await clientFetchJson(`/api/admin/academic-terms/${term.id}`, {
      method: "PUT",
      body: JSON.stringify({ academicYearId: yearId }),
    });

    if (!res.ok) {
      setError(res.error || "Failed to activate term");
      return;
    }

    fetchTerms();
  }

  function editTerm(term: Term) {
    setEditingTerm(term);
    setForm({
      name: term.name,
      startDate: term.startDate ? term.startDate.slice(0, 10) : "",
      endDate: term.endDate ? term.endDate.slice(0, 10) : "",
      termNumber: String(term.termNumber || 1),
      academicYearId: term.academicYearId || years[0]?.id || "",
    });
    setShowForm(true);
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Academic Terms</h2>
          <p className="text-sm text-slate-500">Manage terms, semesters, and sessions for your school</p>
        </div>

        <button
          onClick={() => {
            setEditingTerm(null);
            setForm({
              name: "",
              startDate: "",
              endDate: "",
              termNumber: String((terms.length % 3) + 1),
              academicYearId: years[0]?.id || "",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Term
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border border-slate-200 dark:border-slate-700 p-5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-3">
            {editingTerm ? "Edit Academic Term" : "Create New Term"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Term Name</label>
              <input
                placeholder="e.g. Term 1 or Fall Semester"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Academic Year</label>
              {years.length > 0 ? (
                <select
                  value={form.academicYearId}
                  onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isActive ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-400 mt-2">Auto-linked to active year</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
            >
              {editingTerm ? "Update Term" : "Create Term"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Terms Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">Loading academic terms...</div>
      ) : terms.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500">
          No academic terms created yet. Click "Add Term" above to create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 dark:border-slate-700 text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Term</th>
                <th className="p-3">Academic Year</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              {terms.map((term) => (
                <tr key={term.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-medium">{term.name}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">
                    {term.academicYear?.name || "General"}
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {term.startDate ? new Date(term.startDate).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    {term.endDate ? new Date(term.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3">
                    {term.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 rounded-full text-xs font-semibold">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => activateTerm(term)}
                        className="text-xs text-blue-600 hover:underline"
                        title="Click to set as current active term"
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => editTerm(term)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => deleteTerm(term.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}