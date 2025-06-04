// app/admin/targets/TargetsClient.tsx

"use client";

import React, { useState, useEffect } from "react";
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
import { format, parseISO } from "date-fns";
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Target = {
  id: string;
  salesAgent: { name: string };
  product: { name: string };
  targetValue: number;
  achievedValue: number;
  status: "Achieved" | "Pending" | "Failed";
  startDate: string; // ISO date
  endDate: string;   // ISO date
};

const TargetsClient: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/targets");
        if (!response.ok) {
          throw new Error("Failed to fetch targets");
        }
        const data: Target[] = await response.json();

        setTargets(data);

        // Transform data for the bar chart
        const labels = data.map((t) => t.salesAgent.name);
        const targetValues = data.map((t) => t.targetValue);
        const achievedValues = data.map((t) => t.achievedValue);

        setChartData({
          labels,
          datasets: [
            {
              label: "Target Value",
              data: targetValues,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Achieved Value",
              data: achievedValues,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded flex items-center">
          <XCircleIcon className="h-6 w-6 mr-2" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Sales Targets</h1>

          {/* Bar Chart */}
          {chartData && (
            <div className="w-4/5 mx-auto mb-8">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                    title: { display: true, text: "Targets vs. Achieved by Sales Agent" },
                  },
                }}
              />
            </div>
          )}

          {/* Targets List */}
          <div className="w-4/5 mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Target Details</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {targets.map((target) => {
                const progressPercent = Math.min(
                  (target.achievedValue / target.targetValue) * 100,
                  100
                );

                return (
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
                          style={{ width: `${progressPercent}%` }}
                        />
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
                      Start: {format(parseISO(target.startDate), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      End: {format(parseISO(target.endDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
  );
};

export default TargetsClient;
