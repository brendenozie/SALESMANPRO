import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/AdminNav";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueMonitoringPage = () => {
  const [salesAgentId, setSalesAgentId] = useState("63f7c9e2d91b1b2a5e80b016");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRevenue = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/agent/revenue?salesAgentId=${salesAgentId}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch revenue data");
      }

      setRevenueData(data.revenue);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: revenueData.map((item) => item.date),
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((item) => item.revenue),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen w-full">
        <UserNav />
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Revenue Monitoring</h1>

            {/* Filter Form */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Filter Revenue Data</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Sales Agent ID"
                  value={salesAgentId}
                  onChange={(e) => setSalesAgentId(e.target.value)}
                  className="border p-3 rounded-lg w-full shadow"
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-3 rounded-lg w-full shadow"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-3 rounded-lg w-full shadow"
                />
              </div>
              <button
                onClick={fetchRevenue}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow"
              >
                Fetch Revenue
              </button>
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 mb-4">{error}</div>}

            {/* Revenue Chart */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Revenue Chart</h2>
              {loading ? (
                <p>Loading chart...</p>
              ) : (
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                  }}
                />
              )}
            </div>

            {/* Revenue Table */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Revenue Data</h2>
              {loading ? (
                <p>Loading data...</p>
              ) : (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">Date</th>
                      <th className="border border-gray-300 p-3 text-left">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-3">{item.date}</td>
                        <td className="border border-gray-300 p-3">${item.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default RevenueMonitoringPage;
