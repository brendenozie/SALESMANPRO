import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React, { useEffect, useState } from 'react';

const ProductsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/orders?clientId=63f7c9e2d91b1b2a5e80b013'); // Replace with dynamic clientId if needed
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.inventory || []); // Adjust to match API response structure
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Orders</h1>
            <div className="container mx-auto px-4">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-700 text-lg font-semibold animate-pulse">Loading...</div>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-red-500 text-lg font-semibold">{error}</div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500 text-lg font-semibold">No orders found.</div>
                  </div>
                ) : (
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                          <th className="py-4 px-6 text-left font-semibold">Customer</th>
                          <th className="py-4 px-6 text-center font-semibold">Total</th>
                          <th className="py-4 px-6 text-center font-semibold">Status</th>
                          <th className="py-4 px-6 text-center font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                        {orders.map((order: any) => (
                          <tr
                            key={order.clientInventoryId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6 text-left whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-800">{order.salesAgentName || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center text-gray-800 font-medium">
                              ${order.quantityPurchased}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'Completed'
                                    ? 'bg-green-100 text-green-600'
                                    : order.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-red-100 text-red-600'
                                }`}
                              >
                                {order.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-gray-500">
                              {new Date(order.date || '').toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductsPage;
