"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function DoctorsTable({
  doctors,
  searchTerm,
  filterStatus,
}: {
  doctors: any[];
  searchTerm: string;
  filterStatus: string;
}) {
  const filtered = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "All" || doc.status === filterStatus)
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium">Specialty</th>
            <th className="px-6 py-3 text-left text-xs font-medium">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800">
          {filtered.map((doctor) => (
            <tr key={doctor.id}>
              <td className="px-6 py-4">{doctor.name}</td>
              <td className="px-6 py-4">{doctor.specialty}</td>
              <td className="px-6 py-4">{doctor.email}</td>
              <td className="px-6 py-4">{doctor.status}</td>
              <td className="px-6 py-4 text-right flex gap-2">
                <EyeIcon className="w-5 h-5 text-blue-500" />
                <PencilIcon className="w-5 h-5 text-indigo-500" />
                <TrashIcon className="w-5 h-5 text-red-500" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
