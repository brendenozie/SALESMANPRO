import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React from 'react';

const orders = [
  { id: 1, customer: 'John Doe', total: '$50', status: 'Pending', date: '2025-01-20' },
  { id: 2, customer: 'Jane Smith', total: '$80', status: 'Completed', date: '2025-01-19' },
  { id: 3, customer: 'Alice Johnson', total: '$30', status: 'Cancelled', date: '2025-01-18' },
  { id: 4, customer: 'Bob Brown', total: '$120', status: 'Completed', date: '2025-01-17' },
]

const ProductsPage = () => {
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Orders</h1>
            <div className="container mx-auto px-4">
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Customer</th>
                    <th className="py-3 px-6 text-center">Total</th>
                    <th className="py-3 px-6 text-center">Status</th>
                    <th className="py-3 px-6 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{order.customer}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">{order.total}</td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={
                            order.status === 'Completed'
                              ? 'text-green-500 font-semibold'
                              : order.status === 'Pending'
                              ? 'text-yellow-500 font-semibold'
                              : 'text-red-500 font-semibold'
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
        </ClientLayout>
  );
};

export default ProductsPage;
