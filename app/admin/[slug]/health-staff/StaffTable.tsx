// StaffTable.tsx (Client Component)

"use client";

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Staff } from './StaffManagerClient';

interface StaffTableProps {
    staff: Staff[];
    getStatusColor: (status: Staff['employmentStatus']) => string;
    handleView: (staff: Staff) => void;
    handleEdit: (staff: Staff) => void;
    handleDelete: (staff: Staff) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({ 
    staff, 
    getStatusColor, 
    handleView, 
    handleEdit, 
    handleDelete 
}) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact (Email)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {staff.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                                No staff members found.
                            </td>
                        </tr>
                    ) : (
                      staff.length > 0 && staff.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                {/* ... (Table cells for Name, Job Title, Department, Contact, Status) ... */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
                                                src={member.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${member.name ? member.name.charAt(0) : '?'}${member.name ? member.name.charAt(1) : ''}`}
                                                alt={member.name}
                                                onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${member.name ? member.name.charAt(0) : '?'}${member.name ? member.name.charAt(1) : ''}`; }}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {member.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">{member.jobTitle}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-white">{member.department}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {member.email} {member.phone && `(${member.phone})`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.employmentStatus)}`}>
                                        {member.employmentStatus}
                                    </span>
                                </td>
                                
                                {/* Action buttons (Interactivity) */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleView(member)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                            aria-label={`View ${member.name}`}
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                                            aria-label={`Edit ${member.name}`}
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                            aria-label={`Delete ${member.name}`}
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
};