import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { format, parseISO } from "date-fns";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/AdminNav";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

type Sale = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  totalAmount: number;
  region: string;
  date: string;
};

type Props = {
  salesData: Sale[];
};

const SalesSummaryPage = ({ salesData }: Props) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [salesAgentId, setSalesAgentId] = useState<string>("63f7c9e2d91b1b2a5e80b016");
  const [filteredSales, setFilteredSales] = useState<Sale[]>(salesData);

  const fetchSalesData = async () => {
    const url = `/api/agent/sales?startDate=${startDate}&endDate=${endDate}&salesAgentId=${salesAgentId}`;
    const response = await fetch(url);
    const data = await response.json();
    setFilteredSales(data);
  };

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, salesAgentId]);

  // Prepare data for the chart
  const prepareChartData = () => {
    const salesByDate = filteredSales.reduce((acc, sale) => {
      const date = format(parseISO(sale.date), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {} as { [date: string]: number });

    const sortedDates = Object.keys(salesByDate).sort();
    const labels = sortedDates;
    const data = sortedDates.map((date) => salesByDate[date]);

    return { labels, data };
  };

  const chartData = prepareChartData();

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue",
        data: chartData.data,
        fill: false,
        borderColor: "#4F46E5", // Indigo color
        tension: 0.3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Revenue ($)" } },
    },
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Sales Summary</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow p-4 rounded-lg mb-6">
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <label className="text-gray-600 mr-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <label className="text-gray-600 mr-2">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-gray-600 mr-2">Sales Agent ID:</label>
                <input
                  type="text"
                  value={salesAgentId}
                  onChange={(e) => setSalesAgentId(e.target.value)}
                  placeholder="Enter Sales Agent ID"
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Graph Section */}
            <div className="bg-white shadow p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Sales</h2>
                <p className="text-2xl font-semibold">{filteredSales.length}</p>
              </div>
              <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Revenue</h2>
                <p className="text-2xl font-semibold">
                  $
                  {filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SalesSummaryPage;

export const getServerSideProps = async () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const salesData = await fetch(`${url}/agent/sales`)
    .then((res) => res.json())
    .catch(() => []);
  return { props: { salesData } };
};
