// app/admin/[adminSlug]/invoices/page.tsx

import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, PlusCircleIcon, EyeIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';

const invoicesData = [
  { id: "INV-001", client: "Alice Johnson", amount: "$1,500", status: "Paid", date: "2025-07-01", dueDate: "2025-07-15" },
  { id: "INV-002", client: "Bob Williams", amount: "$2,800", status: "Pending", date: "2025-07-10", dueDate: "2025-07-25" },
  { id: "INV-003", client: "Charlie Davis", amount: "$750", status: "Overdue", date: "2025-06-20", dueDate: "2025-07-04" },
  { id: "INV-004", client: "Diana Miller", amount: "$4,200", status: "Paid", date: "2025-07-05", dueDate: "2025-07-20" },
];

export default function InvoicesPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Invoice List</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Invoice
          </button>
        </div>

        <div className="overflow-x-auto bg-[#0A192F] rounded-lg shadow-md border border-blue-800">
          <table className="min-w-full divide-y divide-blue-700">
            <thead className="bg-[#1B2A41]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Invoice ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Issue Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900">
              {invoicesData.map((invoice) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: invoicesData.indexOf(invoice) * 0.05 }}
                  className="hover:bg-blue-900/30"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{invoice.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{invoice.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{invoice.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">{invoice.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-600 mr-3">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="text-green-400 hover:text-green-600 mr-3">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-400 hover:text-red-600">
                      <XMarkIcon className="h-5 w-5" />
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