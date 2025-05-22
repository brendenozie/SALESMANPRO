import { useEffect, useState } from 'react';
import UserNav from '../../../components/AdminNav';
import ClientLayout from '../../../components/ClientLayout';
import { Line, Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProductsPage = () => {
  const [reportType, setReportType] = useState('total-revenue');
  const [revenueData, setRevenueData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/clients/revenuereport?reportType=${reportType}`);
        const data = await response.json();
        console.log(data);
        if (data.success) {
          setRevenueData(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType]);

  const chartData = {
    labels: revenueData.map(({data, index}:any) => data.month || `Data ${index + 1}`),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map((data:any) => data._sum?.totalPrice || 0),
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

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto py-10">
          <h1 className="text-4xl font-bold text-center mb-6">Revenue Reports</h1>

          <div className="flex justify-center mb-6">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="p-2 bg-gray-800 text-white rounded-md"
            >
              <option value="total-revenue">Total Revenue</option>
              <option value="revenue-by-product">Revenue by Product</option>
              <option value="revenue-by-client">Revenue by Client</option>
              <option value="monthly-revenue">Monthly Revenue</option>
              <option value="revenue-vs-target">Revenue vs Target</option>
            </select>
          </div>

          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-10">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductsPage;
