import AdminLayout from '@/components/AdminLayout';
import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React, { useEffect, useState } from 'react';

const ProductsPage = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setLoading(true);
        setError('');
        // Update the endpoint to match your seller order items API
        const response = await fetch(`${url}/clients/orders?sellerId=63f7c9e2d91b1b2a5e80b007`);
        if (!response.ok) {
          throw new Error('Failed to fetch order items');
        }
        const data = await response.json();
        // Assume API returns an object with orderItems array
        setOrderItems(data.orderItems || []);
      } catch (err : any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [url]);

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Order Items</h1>
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-700 text-lg font-semibold animate-pulse">Loading...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-red-500 text-lg font-semibold">{error}</div>
                </div>
              ) : orderItems.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500 text-lg font-semibold">No order items found.</div>
                </div>
              ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                        <th className="py-4 px-6 text-left font-semibold">Customer</th>
                        <th className="py-4 px-6 text-left font-semibold">Listing</th>
                        <th className="py-4 px-6 text-center font-semibold">Quantity</th>
                        <th className="py-4 px-6 text-center font-semibold">Total</th>
                        <th className="py-4 px-6 text-center font-semibold">Status</th>
                        <th className="py-4 px-6 text-center font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                      {orderItems.map((item : any) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 text-left whitespace-nowrap">
                            {item.order?.consumer?.name || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-left whitespace-nowrap">
                            {item.marketplaceListing?.title || 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-6 text-center text-gray-800 font-medium">
                            ${ (item.price * item.quantity).toFixed(2) }
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.order?.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-600'
                                  : item.order?.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {item.order?.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-500">
                            {item.order?.createdAt
                              ? new Date(item.order.createdAt).toLocaleDateString()
                              : 'N/A'}
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
    </AdminLayout>
  );
};

export default ProductsPage;
