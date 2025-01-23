import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React from 'react';
import { Line } from 'react-chartjs-2';

const revenueData = [
  { month: 'January', revenue: 5000, orders: 120 },
  { month: 'February', revenue: 4500, orders: 110 },
  { month: 'March', revenue: 6000, orders: 150 },
  { month: 'April', revenue: 7000, orders: 160 },
];


  const chartData = {
    labels: revenueData.map((data) => data.month),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map((data) => data.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: true, position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
      x: { title: { display: true, text: 'Months' } },
    },
  };

const ProductsPage = () => {
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Revenue Reports</h1>
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg p-4 mb-10">
                <Line data={chartData} options={chartOptions} />
              </div>
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Month</th>
                    <th className="py-3 px-6 text-center">Revenue</th>
                    <th className="py-3 px-6 text-center">Orders</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {revenueData.map((data, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{data.month}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">${data.revenue}</td>
                      <td className="py-3 px-6 text-center">{data.orders}</td>
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
