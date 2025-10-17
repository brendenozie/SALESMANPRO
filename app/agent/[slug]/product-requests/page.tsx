"use client";

import React, { useState, useEffect } from 'react';
import UserLayout from '@/components/UserLayout';
import UserNav from '@/components/UserNav';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const ProductRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${apiBaseUrl}/agent/productrequests?agentId=63f7c9e2d91b1b2a5e80b016`); // Replace with actual client ID
        if (!response.ok) {
          throw new Error('Failed to fetch product requests.');
        }
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductRequests();
  }, []);

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <UserNav />
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-center mb-10">Product Requests</h1>
          {loading ? (
            <div className="text-center text-gray-300">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Product</th>
                    <th className="py-3 px-6 text-center">Quantity</th>
                    <th className="py-3 px-6 text-center">Sales Agent</th>
                    <th className="py-3 px-6 text-center">Status</th>
                    <th className="py-3 px-6 text-center">Requested At</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {requests.map((request: any) => (
                    <tr
                      key={request.requestId}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <span className="font-medium">{request.productName}</span>
                      </td>
                      <td className="py-3 px-6 text-center">{request.quantityRequested}</td>
                      <td className="py-3 px-6 text-center">
                        {request.salesAgentName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span
                          className={
                            request.status === 'Approved'
                              ? 'text-green-500 font-semibold'
                              : request.status === 'Pending'
                              ? 'text-yellow-500 font-semibold'
                              : 'text-red-500 font-semibold'
                          }
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductRequestsPage;
