"use client";
import { useState, useMemo, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import AdminLayout from "@/components/AdminLayout";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const TargetPage = () => {
  const [targets, setTargets] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/targets");
        const data = await response.json();

        // Store raw target data for the list
        setTargets(data);

        // Transform data for the chart
        const labels = data.map((target  : any) => target.salesAgent.name); // Sales Agent Names
        const dataset = data.map((target : any) => target.targetValue); // Target Values
        const achievedDataset = data.map((target : any) => target.achievedValue); // Achieved Values

        setChartData({
          labels,
          datasets: [
            {
              label: "Target Value",
              data: dataset,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Achieved Value",
              data: achievedDataset,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded flex items-center">
          <XCircleIcon className="h-6 w-6 mr-2" />
          <p>Error: {error}</p>
        </div>
      </div>
    );

  return (

           <AdminLayout>
            <div className="flex flex-col min-h-screen  w-full">
                <UserNav />
    <div className="container mx-auto p-4">
        <div>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Sales Targets
      </h1>

      {/* Render the graph */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Targets vs. Achieved by Sales Agent" },
            },
          }}
        />
      </div>

      {/* Render the list of targets */}
      <div style={{ width: "80%", margin: "20px auto" }}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Target Details
      </h2>
              
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {targets.map((target : any) => (
          <div
            key={target.id}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {target.salesAgent.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{target.product.name}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Target: {target.targetValue}</span>
                <span>Achieved: {target.achievedValue}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    target.achievedValue / target.targetValue >= 1
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (target.achievedValue / target.targetValue) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-4">
              <span>Status:</span>
              {target.status === "Achieved" ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Start: {new Date(target.startDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              End: {new Date(target.endDate).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
    </div>
    </AdminLayout>
  );
};

export default TargetPage;
