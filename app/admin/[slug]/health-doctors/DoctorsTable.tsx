"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Doctor } from "./DoctorsClient";

function DoctorsTable({
  doctors,
  searchTerm,
  filterStatus,
  handleView,
  handleEdit,
  handleDelete
}: {
  doctors: any[];
  searchTerm: string;
  filterStatus: string;
  handleView: (doctor: any) => void;
  handleEdit: (doctor: any) => void;
  handleDelete: (doctor: any) => void;
}) {
  
  const filtered = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "All" || doc.status === filterStatus)
  );

   const getStatusColor = (status: Doctor['status']) => {
      switch (status) {
        case 'ACTIVE': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
        case 'ON_LEAVE': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
        case 'INACTIVE': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
        default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
      }
    };

  return (
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specialty</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact (Email)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {doctors.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                No doctors found.
              </td>
            </tr>
          ) : (
            doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={doctor.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctor.name ? doctor.name.charAt(0) : '?'}${doctor.name ? doctor.name.charAt(1) : ''}`}
                        alt={doctor.name}
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctor.name ? doctor.name.charAt(0) : '?'}${doctor.name ? doctor.name.charAt(1) : ''}`; }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{doctor.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {doctor.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{doctor.specialty}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {doctor.email} {doctor.phone && `(${doctor.phone})`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doctor.status)}`}>
                    {doctor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(doctor)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label={`View ${doctor.name}`}
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label={`Edit ${doctor.name}`}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                      aria-label={`Delete ${doctor.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
</div>
  );
}


export default DoctorsTable;