// AddEditFeeItemModal.tsx
"use client";

import React, { useState, useEffect } from "react";

export default function AddEditFeeItemModal({
  isOpen,
  feeItem,
  onClose,
  onSave,
  isSubmitting,
}: any) {
  const [form, setForm] = useState<any>({
    name: "",
    defaultAmount: "",
    currency: "USD",
    applicableTo: "ALL",
    applicableRef: "",
    isMandatory: true,
  });

  useEffect(() => {
    if (feeItem) setForm(feeItem);
  }, [feeItem]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">
          {feeItem ? "Edit Fee Item" : "New Fee Item"}
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Fee name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-800 rounded-xl p-3 text-sm"
          />

          <input
            type="number"
            placeholder="Amount"
            value={form.defaultAmount}
            onChange={e =>
              setForm({ ...form, defaultAmount: Number(e.target.value) })
            }
            className="w-full bg-gray-800 rounded-xl p-3 text-sm"
          />

          <select
            value={form.applicableTo}
            onChange={e =>
              setForm({ ...form, applicableTo: e.target.value })
            }
            className="w-full bg-gray-800 rounded-xl p-3 text-sm"
          >
            <option value="ALL">All Students</option>
            <option value="CLASS">Class</option>
            <option value="ACADEMIC_LEVEL">Academic Level</option>
          </select>

          {form.applicableTo !== "ALL" && (
            <input
              placeholder="Applicable value"
              value={form.applicableRef}
              onChange={e =>
                setForm({ ...form, applicableRef: e.target.value })
              }
              className="w-full bg-gray-800 rounded-xl p-3 text-sm"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs">
            Cancel
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
