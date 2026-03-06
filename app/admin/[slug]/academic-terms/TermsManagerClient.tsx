"use client";

import { useEffect, useState } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function TermsManager({ companyId }: { companyId: string }) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  async function fetchTerms() {
    setLoading(true);

    const res = await fetch(`/api/admin/terms?companyId=${companyId}`);
    const data = await res.json();

    setTerms(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTerms();
  }, []);

  async function handleSubmit() {
    if (!form.name || !form.startDate || !form.endDate) return;

    const payload = {
      ...form,
      companyId,
    };

    const url = editingTerm
      ? `/api/admin/terms/${editingTerm.id}`
      : `/api/admin/terms`;

    const method = editingTerm ? "PUT" : "POST";

    await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    setForm({ name: "", startDate: "", endDate: "" });
    setEditingTerm(null);
    setShowForm(false);

    fetchTerms();
  }

  async function deleteTerm(id: string) {
    if (!confirm("Delete this term?")) return;

    await fetch(`/api/admin/terms/${id}`, {
      method: "DELETE",
    });

    fetchTerms();
  }

  function editTerm(term: Term) {
    setEditingTerm(term);
    setForm({
      name: term.name,
      startDate: term.startDate.slice(0, 10),
      endDate: term.endDate.slice(0, 10),
    });
    setShowForm(true);
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Academic Terms</h2>

        <button
          onClick={() => {
            setEditingTerm(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <PlusIcon className="w-5 h-5" />
          Add Term
        </button>
      </div>

      {/* Form */}

      {showForm && (
        <div className="mb-6 border p-4 rounded-lg bg-gray-50">
          <div className="grid grid-cols-3 gap-4">

            <input
              placeholder="Term Name (Term 1)"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm({ ...form, endDate: e.target.value })
              }
              className="border p-2 rounded"
            />

          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {editingTerm ? "Update Term" : "Create Term"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Terms Table */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Term</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {terms.map((term) => (
              <tr key={term.id} className="border-t">

                <td className="p-3 font-medium">{term.name}</td>

                <td className="p-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  {new Date(term.startDate).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {new Date(term.endDate).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {term.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-3 flex gap-3">

                  <button onClick={() => editTerm(term)}>
                    <PencilSquareIcon className="w-5 text-blue-500" />
                  </button>

                  <button onClick={() => deleteTerm(term.id)}>
                    <TrashIcon className="w-5 text-red-500" />
                  </button>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}