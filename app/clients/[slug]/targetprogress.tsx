import UserNav from '../../../components/AdminNav';
import ClientLayout from '../../../components/ClientLayout';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const targets = [
  { name: 'January', target: 8000, achieved: 5000 },
  { name: 'February', target: 7500, achieved: 4500 },
  { name: 'March', target: 9000, achieved: 6000 },
  { name: 'April', target: 10000, achieved: 7000 },
];

const ProductsPage = () => {
  const chartData = {
    labels: targets.map((target) => target.name),
    datasets: [
      {
        label: 'Target',
        data: targets.map((target) => target.target),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Achieved',
        data: targets.map((target) => target.achieved),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Target vs Achieved Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };


  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Target Progress</h1>
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg p-6 mb-10">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        </div>
        </ClientLayout>
  );
};

export default ProductsPage;
