import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from "chart.js";
import { format, parseISO } from "date-fns";
import UserNav from "@/components/UserNav";
import AdminLayout from "@/components/AdminLayout";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

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
  const [filteredSales, setFilteredSales] = useState<Sale[]>(salesData);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = salesData.filter(
        (sale) =>
          parseISO(sale.date) >= parseISO(startDate) &&
          parseISO(sale.date) <= parseISO(endDate)
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(salesData);
    }
  }, [startDate, endDate, salesData]);

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
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.3)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#4F46E5",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Revenue ($)" } },
    },
  };

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <UserNav />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-indigo-400">Sales Summary</h1>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Sales" value={filteredSales.length.toString()} color="indigo" />
            <StatCard
              title="Total Revenue"
              value={`$${filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`}
              color="green"
            />
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Filters</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
              <DateInput label="End Date" value={endDate} onChange={setEndDate} />
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Revenue Trend</h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }: { title: string; value: string; color: keyof typeof gradientColors }) => {
  const gradientColors = {
    indigo: "from-indigo-500 to-purple-500",
    green: "from-green-400 to-green-600",
  };

  return (
    <div className={`p-6 bg-gradient-to-r ${gradientColors[color]} rounded-lg shadow-lg`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

// Date Input Component

// Date Input Component
const DateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (date: string) => void }) => (
  <div className="flex flex-col">
    <label className="text-gray-300 mb-2">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-300"
    />
  </div>
);

export default SalesSummaryPage;

export const getServerSideProps = async () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const salesData = await fetch(`${url}/admin/sales`).then((res) => res.json()).catch(() => []);
  return { props: { salesData } };
};