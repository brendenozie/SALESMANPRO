// app/admin/[adminSlug]/appointments/page.tsx

import { motion } from 'framer-motion';
import { CalendarDaysIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const appointmentsData = [
  { id: 1, client: "Alice Johnson", date: "2025-07-20", time: "10:00 AM", expert: "Dr. Evelyn Reed", status: "Confirmed" },
  { id: 2, client: "Bob Williams", date: "2025-07-21", time: "02:30 PM", expert: "Mr. Benjamin Carter", status: "Pending" },
  { id: 3, client: "Charlie Davis", date: "2025-07-22", time: "11:00 AM", expert: "Ms. Olivia Hayes", status: "Cancelled" },
  { id: 4, client: "Diana Miller", date: "2025-07-23", time: "09:00 AM", expert: "Mr. Alex Thorne", status: "Confirmed" },
];

export default function AppointmentsPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Appointment Schedule</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Schedule New
          </button>
        </div>

        <div className="overflow-x-auto bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
          <table className="min-w-full divide-y divide-blue-700">
            <thead className="bg-[#1B2A41]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Expert</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900">
              {appointmentsData.map((appointment) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: appointment.id * 0.05 }}
                  className="hover:bg-blue-900/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{appointment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{appointment.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{appointment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{appointment.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{appointment.expert}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-600 mr-3">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}